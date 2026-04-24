import { NextRequest, NextResponse } from 'next/server';

// Disable Next.js route caching — always fetch live data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const GFIT_DATASET_BASE =
  'https://www.googleapis.com/fitness/v1/users/me/dataSources/derived:com.google.step_count.delta:com.google.android.gms:estimated_steps/datasets';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// tzOffsetMinutes = client's new Date().getTimezoneOffset()
// e.g. IST = -330  (east of UTC, JS returns negative)
async function fetchStepsForDate(
  accessToken: string,
  date: string,
  tzOffsetMinutes = 0,
  debug = false,
  logRaw = false,
): Promise<number> {
  const [year, month, day] = date.split('-').map(Number);
  // Shift UTC midnight to local midnight: UTC = local + offset
  const dayStartMs = Date.UTC(year, month - 1, day) + tzOffsetMinutes * 60 * 1000;
  const dayEndMs   = dayStartMs + 24 * 60 * 60 * 1000 - 1;
  // Google Fit datasets API uses nanoseconds
  const url = `${GFIT_DATASET_BASE}/${dayStartMs * 1_000_000}-${dayEndMs * 1_000_000}`;

  if (debug) {
    console.log('[gfit/steps] computed-range', {
      date,
      tzOffsetMinutes,
      dayStartMs,
      dayEndMs,
      dayStartUtcIso: new Date(dayStartMs).toISOString(),
      dayEndUtcIso: new Date(dayEndMs).toISOString(),
      datasetRangeNs: `${dayStartMs * 1_000_000}-${dayEndMs * 1_000_000}`,
      datasetUrl: url,
    });
  }

  const res = await fetch(url, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`GFIT_HTTP_${res.status}`);
  }

  const data = await res.json() as {
    point?: Array<{ value?: Array<{ intVal?: number }> }>;
  };

  if (debug) {
    console.log('[gfit/steps] response-summary', {
      points: data.point?.length ?? 0,
      rawLogged: logRaw,
    });
  }
  if (debug && logRaw) {
    console.log('[gfit/steps] raw-response', data);
  }

  let steps = 0;
  for (const point of data.point ?? []) {
    for (const val of point.value ?? []) {
      steps += val.intVal ?? 0;
    }
  }
  return steps;
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) return null;
  const data = await res.json() as { access_token?: string };
  return data.access_token ?? null;
}

function formatDateWithTzOffset(offsetMinutes: number): string {
  const shifted = new Date(Date.now() - offsetMinutes * 60 * 1000);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const d = String(shifted.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('gfit_access_token')?.value;
  const refreshToken = req.cookies.get('gfit_refresh_token')?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json({ connected: false, steps: 0 });
  }

  const clientDate = req.nextUrl.searchParams.get('date') ?? '';
  const parsedTzOffset = parseInt(req.nextUrl.searchParams.get('tz') ?? '0', 10);
  const tzOffset = Number.isFinite(parsedTzOffset) ? parsedTzOffset : 0;
  const debug = req.nextUrl.searchParams.get('debug') === '1';
  const raw = req.nextUrl.searchParams.get('raw') === '1';
  const today = /^\d{4}-\d{2}-\d{2}$/.test(clientDate)
    ? clientDate
    : formatDateWithTzOffset(tzOffset);
  const isProduction = process.env.NODE_ENV === 'production';

  // Try existing access token
  if (accessToken) {
    try {
      const steps = await fetchStepsForDate(accessToken, today, tzOffset, debug, raw);
      return NextResponse.json({ connected: true, steps, date: today });
    } catch (err: unknown) {
      const isExpired =
        err instanceof Error &&
        (err.message.includes('401') || err.message.includes('403'));
      if (!isExpired) {
        // Network error or Google API issue — still connected, just no data
        return NextResponse.json({ connected: true, steps: 0, date: today });
      }
      // Token expired — fall through to refresh
    }
  }

  // Refresh the access token
  if (refreshToken) {
    const newAccessToken = await refreshAccessToken(refreshToken);
    if (!newAccessToken) {
      const res = NextResponse.json({
        connected: false,
        steps: 0,
        needsReconnect: true,
      });
      res.cookies.delete('gfit_access_token');
      res.cookies.delete('gfit_refresh_token');
      return res;
    }

    try {
      const steps = await fetchStepsForDate(newAccessToken, today, tzOffset, debug, raw);
      const response = NextResponse.json({ connected: true, steps, date: today });
      const cookieOpts = { httpOnly: true, secure: isProduction, sameSite: 'lax' as const, path: '/' };
      response.cookies.set('gfit_access_token', newAccessToken, { ...cookieOpts, maxAge: 3600 });
      // Re-stamp refresh token to extend its cookie lifetime on active use
      response.cookies.set('gfit_refresh_token', refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 365 });
      return response;
    } catch {
      return NextResponse.json({ connected: true, steps: 0, date: today });
    }
  }

  return NextResponse.json({ connected: false, steps: 0 });
}
