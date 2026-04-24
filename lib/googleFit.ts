/**
 * Client-side Google Fit helpers.
 * All token handling is server-side (HttpOnly cookies). This module only manages
 * the "connected" flag in localStorage and provides the OAuth start flow.
 */

const GFIT_SCOPE = 'https://www.googleapis.com/auth/fitness.activity.read';
const GFIT_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const STORAGE_KEY = 'gfit_connected';
const NONCE_KEY = 'gfit_state_nonce';

function getRedirectUri(): string {
  return `${window.location.origin}/socialapp/api/google-fit/callback`;
}

/**
 * Redirect the user to Google's OAuth consent screen.
 * @param returnUrl Path to redirect back to after connection (e.g. current page URL).
 */
export function startGoogleFitAuth(returnUrl?: string): void {
  if (typeof window === 'undefined') return;

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error('[Google Fit] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set');
    return;
  }

  // Generate CSRF nonce
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = Array.from(nonceBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const state = btoa(
    JSON.stringify({
      nonce,
      returnUrl: returnUrl ?? window.location.pathname + window.location.search,
    })
  );

  sessionStorage.setItem(NONCE_KEY, nonce);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: GFIT_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  window.location.href = `${GFIT_AUTH_URL}?${params}`;
}

/**
 * Verify the OAuth state nonce on the callback page.
 * Returns the returnUrl if valid, null otherwise.
 */
export function verifyOAuthState(stateParam: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const decoded = JSON.parse(atob(stateParam)) as { nonce?: string; returnUrl?: string };
    const storedNonce = sessionStorage.getItem(NONCE_KEY);
    if (!storedNonce || decoded.nonce !== storedNonce) return null;
    sessionStorage.removeItem(NONCE_KEY);
    if (
      typeof decoded.returnUrl === 'string' &&
      /^\/socialapp\//.test(decoded.returnUrl)
    ) {
      return decoded.returnUrl;
    }
    return '/socialapp/home';
  } catch {
    return null;
  }
}

export interface StepsResult {
  connected: boolean;
  steps: number;
  date?: string;
  needsReconnect?: boolean;
}

/** Fetch today's step count from the server-side Google Fit proxy. */
export async function fetchStepsFromServer(): Promise<StepsResult> {
  try {
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const tzOffset = now.getTimezoneOffset(); // negative for east-of-UTC zones (IST = -330)
    const res = await fetch(`/socialapp/api/google-fit/steps?date=${localDate}&tz=${tzOffset}`);
    if (!res.ok) return { connected: false, steps: 0 };
    return (await res.json()) as StepsResult;
  } catch {
    return { connected: false, steps: 0 };
  }
}

/** Disconnect Google Fit: clears server-side cookies and local flag. */
export async function disconnectGoogleFit(): Promise<void> {
  try {
    await fetch('/socialapp/api/google-fit/disconnect', { method: 'POST' });
  } catch {
    // ignore network errors
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(NONCE_KEY);
  }
}

export function isGoogleFitConnected(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function setGoogleFitConnected(val: boolean): void {
  if (typeof window === 'undefined') return;
  if (val) {
    localStorage.setItem(STORAGE_KEY, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}
