const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://cbiqa.dev.honeywellcloud.com/socialapi";

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
    window.location.href = "/socialapp/login";
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

let refreshIntervalId: NodeJS.Timeout | null = null;

export function startBackgroundRefresh(): void {
  if (refreshIntervalId) {
    return;
  }

  // Backend: ACCESS_TOKEN_MIN=30 (expires in 30 minutes)
  // Refresh every 25 minutes to keep a safety buffer before expiry
  refreshIntervalId = setInterval(async () => {
    const refreshToken = getRefreshToken();

    // If refresh token is gone, session is truly over
    if (!refreshToken) {
      console.log("⚠️ No refresh token found, stopping refresh");
      stopBackgroundRefresh();
      return;
    }

    console.log("🔄 Refreshing token...");
    const success = await refreshAccessToken();

    if (success) {
      console.log("✅ Token refreshed successfully");
    } else {
      // Only stop if refresh token was cleared (401 = truly expired)
      // On network errors, refreshAccessToken keeps tokens and returns false — keep retrying
      const stillHasRefreshToken = getRefreshToken();
      if (!stillHasRefreshToken) {
        console.log("❌ Refresh token invalidated, stopping refresh and logging out");
        stopBackgroundRefresh();
        if (typeof window !== "undefined") {
          window.location.href = "/socialapp/login";
        }
      } else {
        console.log("⚠️ Token refresh failed (network/server issue) — will retry next cycle");
      }
    }
  }, 25 * 60 * 1000);

  // Do initial refresh immediately
  refreshAccessToken().then((success) => {
    if (success) {
      console.log("✅ Initial token refresh successful");
    }
  });

  console.log("🔄 Background token refresh started (every 1 minute)");
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
      const token = getAccessToken();

      if (token) {
        const success = await refreshAccessToken();
        if (success) {
          console.log("✅ Token refreshed on tab focus");
        }
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

