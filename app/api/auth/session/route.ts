import { NextRequest, NextResponse } from 'next/server';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * POST /api/auth/session
 * Body: { token: string }
 * Mirrors the JWT access token from localStorage into an HttpOnly cookie
 * so the service worker background-sync route can make authenticated API calls.
 */
export async function POST(req: NextRequest) {
  let token: string | undefined;
  try {
    const body = await req.json() as { token?: string };
    token = body?.token;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  if (!token || typeof token !== 'string' || token.length > 4096) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('app_session', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours — refreshed on each app open
  });
  return response;
}

/**
 * DELETE /api/auth/session
 * Clears the mirrored session cookie on logout.
 */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('app_session');
  return response;
}
