// lib/auth.ts

import { logger } from "@/lib/logger";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001";

type LoginResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
};

type SignupResponse = {
  id: string;
  email: string;
  name?: string;
};

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(access: string, refresh?: string) {
  localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}

export async function refreshAccessToken(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: rt }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.access_token) return false;

  setTokens(data.access_token, data.refresh_token); // refresh_token optional
  return true;
}

export function logout() {
  stopBackgroundRefresh();
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  // Redirect to login page
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export async function isAuthed() {
  if (getAccessToken()) return true;
  // Try to refresh if no access token
  const refreshed = await refreshAccessToken();
  return refreshed;
}

// Background token refresh - keeps user logged in
let refreshInterval: NodeJS.Timeout | null = null;

function getTokenExpiryTime(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch {
    return null;
  }
}

export function startBackgroundRefresh() {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  const checkAndRefresh = async () => {
    const token = getAccessToken();
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      stopBackgroundRefresh();
      return;
    }

    if (token) {
      const expiryTime = getTokenExpiryTime(token);
      if (expiryTime) {
        const timeUntilExpiry = expiryTime - Date.now();
        // Refresh if token expires in less than 30 seconds
        if (timeUntilExpiry < 30 * 1000) {
          logger.info('Token expiring soon, refreshing...');
          const success = await refreshAccessToken();
          if (!success) {
            logger.warn('Background refresh failed - user may need to re-login');
            stopBackgroundRefresh();
          } else {
            logger.info('✅ Token refreshed successfully');
          }
        }
      }
    } else {
      // No access token, try to refresh
      logger.info('No access token, attempting refresh...');
      const success = await refreshAccessToken();
      if (!success) {
        stopBackgroundRefresh();
      }
    }
  };

  // Check immediately
  checkAndRefresh();
  
  // Check every 20 seconds (handles tokens with 1 min expiry)
  refreshInterval = setInterval(checkAndRefresh, 20 * 1000);
}

export function stopBackgroundRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

// ✅ Real backend login
export async function login(email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return { ok: false, error: (data?.detail || data?.message || "Login failed") as string };
    }

    const parsed = data as LoginResponse;
    if (!parsed.access_token) {
      return { ok: false, error: "Login response missing access_token" };
    }

    setTokens(parsed.access_token, parsed.refresh_token);
    // Start background refresh to keep user logged in
    startBackgroundRefresh();
    return { ok: true };
  } catch (error) {
    logger.error("Login network error:", error);
    return { 
      ok: false, 
      error: error instanceof Error && error.message.includes('CORS') 
        ? "Unable to connect to server. Please check if the backend is running and CORS is configured correctly."
        : "Network error. Please check your connection and try again."
    };
  }
}


export async function signup(name: string, email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return { ok: false, error: (data?.detail || data?.message || "Signup failed") as string };
    }

    return { ok: true, data: data as SignupResponse };
  } catch (error) {
    logger.error("Signup network error:", error);
    return { 
      ok: false, 
      error: error instanceof Error && error.message.includes('CORS') 
        ? "Unable to connect to server. Please check if the backend is running and CORS is configured correctly."
        : "Network error. Please check your connection and try again."
    };
  }
}