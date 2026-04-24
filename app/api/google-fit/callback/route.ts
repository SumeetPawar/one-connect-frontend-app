import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cbiqa.dev.honeywellcloud.com/socialapi'
).replace(/\/$/, '');

// Behind Azure Application Gateway, req.url carries the internal host.
// Use NEXT_PUBLIC_APP_URL (set in Azure App Settings) as the trusted public origin.
function getPublicOrigin(fallback: string): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;
  if (env) return env.replace(/\/$/, '');
  // Fallback: try X-Forwarded-Host from the request headers
  return fallback;
}

export async function GET(req: NextRequest) {
  const { searchParams, origin: rawOrigin } = new URL(req.url);
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
  const origin = getPublicOrigin(
    forwardedHost ? `${forwardedProto}://${forwardedHost}` : rawOrigin
  );
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const makeRedirect = (params: Record<string, string>) => {
    const url = new URL('/socialapp/google-fit-callback', origin);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    return NextResponse.redirect(url);
  };

  if (error) return makeRedirect({ status: 'denied' });
  if (!code) return makeRedirect({ status: 'error', msg: 'no_code' });

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('[Google Fit callback] Missing env vars');
    return makeRedirect({ status: 'error', msg: 'server_config' });
  }

  // Derive redirect_uri from request origin (same host, with basePath)
  const redirectUri = `${origin}/socialapp/api/google-fit/callback`;

  try {
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('[Google Fit callback] Token exchange failed:', errText);
      return makeRedirect({ status: 'error', msg: 'token_exchange' });
    }

    const tokens = await tokenRes.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };

    // Validate return path from state — only allow /socialapp/* paths
    let returnPath = '/socialapp/home';
    try {
      if (state) {
        const decoded = JSON.parse(atob(state)) as { nonce?: string; returnUrl?: string };
        if (
          typeof decoded.returnUrl === 'string' &&
          /^\/socialapp\//.test(decoded.returnUrl)
        ) {
          returnPath = decoded.returnUrl;
        }
      }
    } catch {
      // Malformed state — use default return path
    }

    const callbackUrl = new URL('/socialapp/google-fit-callback', origin);
    callbackUrl.searchParams.set('status', 'ok');
    if (state) callbackUrl.searchParams.set('state', state);
    callbackUrl.searchParams.set('return', encodeURIComponent(returnPath));

    const response = NextResponse.redirect(callbackUrl);

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieBase = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
    };

    response.cookies.set('gfit_access_token', tokens.access_token, {
      ...cookieBase,
      maxAge: tokens.expires_in ?? 3600,
    });

    if (tokens.refresh_token) {
      response.cookies.set('gfit_refresh_token', tokens.refresh_token, {
        ...cookieBase,
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    // Forward tokens to backend so server-side cron can sync daily
    const appJwt = req.cookies.get('app_session')?.value;
    if (appJwt && tokens.refresh_token) {
      try {
        await fetch(`${API_BASE}/api/googlefit/connect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${appJwt}`,
          },
          body: JSON.stringify({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_in: tokens.expires_in ?? 3600,
          }),
        });
      } catch (err) {
        // Non-fatal — client-side sync still works via cookies
        console.warn('[Google Fit callback] Backend token forward failed:', err);
      }
    }

    return response;
  } catch (err) {
    console.error('[Google Fit callback] Unexpected error:', err);
    return makeRedirect({ status: 'error', msg: 'server_error' });
  }
}
