import { NextRequest, NextResponse } from 'next/server';

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cbiqa.dev.honeywellcloud.com/socialapi'
).replace(/\/$/, '');

export async function POST(req: NextRequest) {
  // Tell backend to delete stored tokens (stops server-side cron for this user)
  const appJwt = req.cookies.get('app_session')?.value;
  if (appJwt) {
    try {
      await fetch(`${API_BASE}/api/googlefit/disconnect`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${appJwt}` },
      });
    } catch (err) {
      console.warn('[Google Fit disconnect] Backend call failed:', err);
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('gfit_access_token');
  response.cookies.delete('gfit_refresh_token');
  return response;
}
