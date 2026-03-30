const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://cbiqa.dev.honeywellcloud.com/socialapi";

// Must match basePath in next.config.ts — used for window.location.href redirects
// (Next.js router.replace() handles basePath automatically, but window.location.href does not)
const LOGIN_URL = '/socialapp/login';

/** Timestamp helper for consistent log format */
function ts() { return new Date().toISOString(); }

// ==========================================
// SESSION READY — single source of truth
// ==========================================
// TokenRefreshHandler resolves this once the initial session check is complete.
// useAuthRedirect awaits it before deciding to redirect — prevents race condition
// where the page redirects to login before the token refresh has had a chance to run.

let _sessionReadyResolve: (() => void) | null = null;
let _sessionReadyPromise: Promise<void> = new Promise<void>((resolve) => {
  _sessionReadyResolve = resolve;
});
// Safety: auto-resolve after 8 seconds so useAuthRedirect is never stuck forever
setTimeout(() => {
  if (_sessionReadyResolve) {
    console.warn(`[Auth][${ts()}] ⚠️ Session ready timed out after 8s — resolving anyway`);
    _sessionReadyResolve();
    _sessionReadyResolve = null;
  }
}, 8000);

/** Called by TokenRefreshHandler once the initial session check is done (success or fail). */
export function signalSessionReady(): void {
  if (_sessionReadyResolve) {
    console.log(`[Auth][${ts()}] ✅ Session ready signal sent`);
    _sessionReadyResolve();
    _sessionReadyResolve = null;
  }
}

/** Awaited by useAuthRedirect before making any redirect decisions. */
export function waitForSessionReady(): Promise<void> {
  return _sessionReadyPromise;
}

/**
 * Returns a human-readable string describing the access token's current validity.
 * Useful for diagnosing premature logout issues.
 */
export function getTokenExpiryInfo(): string {
  if (typeof window === 'undefined') return 'SSR — no token';
  const token = localStorage.getItem('access_token');
  if (!token) return 'NO ACCESS TOKEN IN STORAGE';
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload?.exp) return 'Token has no exp field';
    const expiresAt = new Date(payload.exp * 1000);
    const nowMs = Date.now();
    const remainingMs = payload.exp * 1000 - nowMs;
    const issuedAt = payload.iat ? new Date(payload.iat * 1000).toISOString() : 'unknown';
    if (remainingMs <= 0) {
      return `EXPIRED ${Math.round(-remainingMs / 60000)}min ago (was valid until ${expiresAt.toISOString()}, issued ${issuedAt})`;
    }
    const h = Math.floor(remainingMs / 3600000);
    const d = Math.floor(h / 24);
    return `valid for ${d}d ${h % 24}h more — expires ${expiresAt.toISOString()} (issued ${issuedAt})`;
  } catch {
    return 'Token present but could not decode';
  }
}

// ==========================================
// REFRESH DEDUPLICATION
// ==========================================
// If refreshAccessToken() is called multiple times simultaneously (race between
// TokenRefreshHandler and useAuthRedirect), only one HTTP call is made.

let _refreshInFlight: Promise<boolean> | null = null;

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  detail?: string;
}

interface LoginResult {
  ok: boolean;
  error?: string;
}

interface SignupResult {
  ok: boolean;
  error?: string;
}

// ==========================================
// TOKEN MANAGEMENT
// ==========================================

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

/**
 * Decode a JWT and return its payload, or null if invalid.
 */
function decodeJwt(token: string): Record<string, any> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Returns true if the access token is expired or will expire within `bufferSeconds`.
 * If no token or can't decode, treat as expired.
 */
export function isAccessTokenExpiredOrExpiring(bufferSeconds = 300): boolean {
  const token = getAccessToken();
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp - nowSeconds < bufferSeconds;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
  localStorage.setItem("auth_token", accessToken);
}

function clearTokens(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_data");
}

// ==========================================
// AUTHENTICATION
// ==========================================

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {  // ✅ /api/auth
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: data.detail || "Login failed",
      };
    }

    setTokens(data.access_token, data.refresh_token);
    console.log("✅ Login successful, tokens stored");

    return { ok: true };
  } catch (error) {
    console.error("Login error:", error);
    return {
      ok: false,
      error: "Network error. Please check your connection.",
    };
  }
}

export async function signup(
  name: string,
  email: string,
  password: string
): Promise<SignupResult> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/signup`, {  // ✅ /api/auth
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: data.detail || "Signup failed",
      };
    }

    setTokens(data.access_token, data.refresh_token);
    console.log("✅ Signup successful, tokens stored");

    return { ok: true };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      ok: false,
      error: "Network error. Please check your connection.",
    };
  }
}

export function logout(): void {
  stopBackgroundRefresh();
  clearTokens();
  // Clear all cached API data so a new user doesn't see stale data
  if (typeof window !== "undefined") {
    localStorage.removeItem("user_profile");
    localStorage.removeItem("user_me");
    window.location.href = LOGIN_URL;
  }
}

export async function isAuthed(): Promise<boolean> {
  const token = getAccessToken();

  if (!token) {
    return false;
  }

  // Token exists - consider authenticated
  return true;
}

export async function refreshAccessToken(): Promise<boolean> {
  // Deduplicate: if a refresh is already in flight, return the same promise
  if (_refreshInFlight) {
    console.log(`[Auth][${ts()}] refreshAccessToken — deduplicating, waiting for in-flight refresh`);
    return _refreshInFlight;
  }

  const refreshToken = getRefreshToken();
  console.log(`[Auth][${ts()}] refreshAccessToken called — refreshToken: ${refreshToken ? "present" : "MISSING"}`);

  if (!refreshToken) {
    clearTokens();
    return false;
  }

  _refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.status === 401) {
        console.log(`[Auth][${ts()}] ❌ Refresh token rejected (401) — clearing session`);
        clearTokens();
        return false;
      }

      if (!response.ok) {
        console.warn(`[Auth][${ts()}] ⚠️ Token refresh failed with status: ${response.status} — keeping existing tokens`);
        return false;
      }

      const data: AuthResponse = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      const payload = decodeJwt(data.access_token);
      const exp = payload?.exp;
      const expiresIn = exp ? Math.round((exp - Date.now() / 1000) / 3600) : '?';
      console.log(`[Auth][${ts()}] ✅ Token refreshed — new access token expires in ~${expiresIn}h`);
      return true;
    } catch (error) {
      console.warn(`[Auth][${ts()}] ⚠️ Token refresh network error — keeping existing tokens:`, error);
      return false;
    } finally {
      _refreshInFlight = null;
    }
  })();

  return _refreshInFlight;
}

// ==========================================
// USER DATA
// ==========================================

export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  const userData = localStorage.getItem("user_data");
  if (!userData) return null;

  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

// ==========================================
// BACKGROUND TOKEN REFRESH (PERSISTENT)
// ==========================================
// Backend: Access token = 30 days, Refresh token = 1 year
// Check every 60 minutes; only call the API if token expires within 2 hours.

let refreshIntervalId: NodeJS.Timeout | null = null;

export function startBackgroundRefresh(): void {
  if (refreshIntervalId) return;

  const CHECK_INTERVAL_MS = 60 * 60 * 1000;   // check every 60 minutes
  const EXPIRY_BUFFER_SECONDS = 2 * 60 * 60;  // refresh if < 2 hours left on token

  refreshIntervalId = setInterval(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      console.log(`[Auth][${ts()}] ⚠️ No refresh token found, stopping background refresh`);
      stopBackgroundRefresh();
      return;
    }

    const accessToken = getAccessToken();
    const payload = accessToken ? decodeJwt(accessToken) : null;
    const exp = payload?.exp;
    const nowSeconds = Math.floor(Date.now() / 1000);
    const remaining = exp ? exp - nowSeconds : -1;
    console.log(`[Auth][${ts()}] Background check — access token expires in: ${remaining > 0 ? Math.round(remaining / 3600) + 'h' : 'EXPIRED'}`);

    if (!isAccessTokenExpiredOrExpiring(EXPIRY_BUFFER_SECONDS)) {
      return; // plenty of life left, skip
    }

    console.log(`[Auth][${ts()}] 🔄 Access token expiring soon — refreshing...`);
    const success = await refreshAccessToken();

    if (success) {
      console.log(`[Auth][${ts()}] ✅ Background token refresh succeeded`);
    } else {
      const stillHasRefreshToken = getRefreshToken();
      if (!stillHasRefreshToken) {
        console.log(`[Auth][${ts()}] ❌ Refresh token invalidated — logging out`);
        stopBackgroundRefresh();
        if (typeof window !== "undefined") {
          window.location.href = LOGIN_URL;
        }
      } else {
        console.log(`[Auth][${ts()}] ⚠️ Token refresh failed (network/server issue) — will retry next cycle`);
      }
    }
  }, CHECK_INTERVAL_MS);

  console.log(`[Auth][${ts()}] 🔄 Background token refresh started (checking every 60 minutes)`);
}
export function stopBackgroundRefresh(): void {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
    console.log("⏹️ Background token refresh stopped");
  }
}

// ==========================================
// PAGE VISIBILITY HANDLER
// ==========================================

export function setupVisibilityRefresh(): (() => void) | undefined {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return undefined;
  }

  const handleVisibilityChange = async () => {
    if (document.visibilityState === "visible") {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();
      const payload = accessToken ? decodeJwt(accessToken) : null;
      const exp = payload?.exp;
      const remaining = exp ? Math.round((exp - Date.now() / 1000) / 3600) : -1;
      console.log(`[Auth][${ts()}] 👀 App became visible — access token expires in: ${remaining > 0 ? remaining + 'h' : 'EXPIRED'}, refreshToken: ${refreshToken ? 'present' : 'MISSING'}`);

      if (!refreshToken) {
        console.log(`[Auth][${ts()}] ❌ No refresh token on focus — redirecting to login`);
        clearTokens();
        window.location.href = LOGIN_URL;
        return;
      }

      if (!isAccessTokenExpiredOrExpiring(5 * 60)) {
        console.log(`[Auth][${ts()}] ✅ Access token still valid — no refresh needed`);
        return;
      }

      console.log(`[Auth][${ts()}] 🔄 Access token expired/expiring — refreshing on focus...`);
      const success = await refreshAccessToken();
      if (success) {
        console.log(`[Auth][${ts()}] ✅ Token refreshed on app focus`);
      } else {
        const stillHasRefreshToken = getRefreshToken();
        if (!stillHasRefreshToken) {
          console.log(`[Auth][${ts()}] ❌ Session expired on focus — redirecting to login`);
          window.location.href = LOGIN_URL;
        }
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

