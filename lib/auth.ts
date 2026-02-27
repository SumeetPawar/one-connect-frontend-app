const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://cbiqa.dev.honeywellcloud.com/socialapi";

// Must match basePath in next.config.ts — used for window.location.href redirects
// (Next.js router.replace() handles basePath automatically, but window.location.href does not)
const LOGIN_URL = '/socialapp/login';

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

  if (typeof window !== "undefined") {
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
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {  // ✅ /api/auth
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    // Only clear tokens if refresh token itself is rejected (401)
    // Do NOT clear on network errors or 5xx — keep the refresh token alive
    if (response.status === 401) {
      console.log("❌ Refresh token expired or invalid, clearing session");
      clearTokens();
      return false;
    }

    if (!response.ok) {
      // Server error or network issue — don't wipe tokens, just return false
      console.warn("⚠️ Token refresh failed with status:", response.status, "— keeping existing tokens");
      return false;
    }

    const data: AuthResponse = await response.json();

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("auth_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);

    return true;
  } catch (error) {
    // Network error — do NOT clear tokens, user may just be offline temporarily
    console.warn("⚠️ Token refresh network error — keeping existing tokens:", error);
    return false;
  }
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
// Access token: 30 minutes | Refresh token: 90 days
// Check every 5 minutes; only call the API if token expires within 5 minutes.

let refreshIntervalId: NodeJS.Timeout | null = null;

export function startBackgroundRefresh(): void {
  if (refreshIntervalId) return;

  const CHECK_INTERVAL_MS = 5 * 60 * 1000;  // check every 5 minutes
  const EXPIRY_BUFFER_SECONDS = 5 * 60;     // refresh if < 5 min left on token

  refreshIntervalId = setInterval(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      console.log("⚠️ No refresh token found, stopping refresh");
      stopBackgroundRefresh();
      return;
    }

    // Only hit the API if the access token is actually near expiry
    if (!isAccessTokenExpiredOrExpiring(EXPIRY_BUFFER_SECONDS)) {
      return; // token still has plenty of life, skip
    }

    console.log("🔄 Access token expiring soon — refreshing...");
    const success = await refreshAccessToken();

    if (success) {
      console.log("✅ Token refreshed successfully");
    } else {
      const stillHasRefreshToken = getRefreshToken();
      if (!stillHasRefreshToken) {
        console.log("❌ Refresh token invalidated — logging out");
        stopBackgroundRefresh();
        if (typeof window !== "undefined") {
          window.location.href = LOGIN_URL;
        }
      } else {
        console.log("⚠️ Token refresh failed (network/server issue) — will retry next cycle");
      }
    }
  }, CHECK_INTERVAL_MS);

  console.log("🔄 Background token refresh started (checking every 5 minutes)");
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
      console.log("👀 Tab became visible, checking token...");

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.log("❌ No refresh token on focus — redirecting to login");
        clearTokens();
        window.location.href = LOGIN_URL;
        return;
      }

      // Only refresh if the access token is expired or expiring within 5 minutes
      // This handles the "opens app after days" case where access token is long-expired
      if (!isAccessTokenExpiredOrExpiring(5 * 60)) {
        console.log("✅ Access token still valid — no refresh needed");
        return;
      }

      console.log("🔄 Access token expired/expiring — refreshing on focus...");
      const success = await refreshAccessToken();
      if (success) {
        console.log("✅ Token refreshed on tab focus");
      } else {
        const stillHasRefreshToken = getRefreshToken();
        if (!stillHasRefreshToken) {
          console.log("❌ Session expired on focus — redirecting to login");
          window.location.href = "/login";
        }
        // else: network error — keep tokens, user can retry
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

