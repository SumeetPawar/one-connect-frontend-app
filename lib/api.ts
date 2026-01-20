import { getAccessToken, logout, refreshAccessToken } from "./auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function api<T>(path: string, opts: RequestInit & { auth?: boolean } = {}): Promise<T> {
  async function doFetch() {
    const headers: Record<string, string> = {
      ...(opts.headers as any),
    };

    if (!headers["Content-Type"] && !(opts.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (opts.auth !== false) {
      const token = getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => null);

    return { res, data };
  }

  // attempt #1
  let { res, data } = await doFetch();

  // if access expired -> refresh -> retry #2
  if (res.status === 401 && opts.auth !== false) {
    try {
      const ok = await refreshAccessToken();
      if (ok) {
        ({ res, data } = await doFetch());
      } else {
        // Refresh failed, logout immediately
        logout();
        throw new Error('Session expired. Please login again.');
      }
    } catch (refreshError) {
      // Refresh failed with error (e.g., CORS, network), logout
      console.error('Token refresh failed:', refreshError);
      logout();
      throw new Error('Session expired. Please login again.');
    }
  }

  // still failing
  if (!res.ok) {
    if (res.status === 401) logout(); // refresh also failed -> real logout
    const msg = (data && (data.detail || data.message)) || (typeof data === "string" ? data : "Request failed");
    throw new Error(msg);
  }

  return data as T;
}

// --- Types for steps API ---
export interface StepDay {
  day: string; // ISO date string
  total_steps: number;
}

export interface WeeklyStepsResponse {
  anchor_start: string;
  period_start: string;
  period_end: string;
  goal_daily_target: number;
  goal_period_target: number;
  week_total_steps: number;
  progress_pct: number;
  remaining_steps: number;
  days: StepDay[];
}

export interface AddStepsRequest {
  steps: number;
  log_date?: string;
  source?: string;
  note?: string;
}

export interface AddStepsResponse {
  success: boolean;
  message?: string;
  // Add more fields if backend returns them
}

// Fetch weekly steps data
export async function getWeeklySteps(): Promise<WeeklyStepsResponse> {
  return api<WeeklyStepsResponse>(
    '/steps/week?metric_key=steps',
    { method: 'GET', auth: true }
  );
}

// Add steps for a given date (defaults to today)
export async function addSteps({ steps, log_date, source, note }: AddStepsRequest): Promise<AddStepsResponse> {
  return api<AddStepsResponse>(
    '/steps/add',
    {
      method: 'POST',
      auth: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps, log_date, source, note })
    }
  );
}

// export async function api<T>(
//   path: string,
//   opts: RequestInit & { auth?: boolean; autoLogoutOn401?: boolean } = {}
// ): Promise<T> {
//   const headers: Record<string, string> = {
//     ...(opts.headers as any),
//   };

//   // Only set JSON header if caller didn't send something else (form-data etc.)
//   if (!headers["Content-Type"] && !(opts.body instanceof FormData)) {
//     headers["Content-Type"] = "application/json";
//   }

//   if (opts.auth !== false) {
//     const token = getToken();
//     if (token) headers.Authorization = `Bearer ${token}`;
//   }

//   const res = await fetch(`${API_BASE}${path}`, {
//     ...opts,
//     headers,
//   });

//   const contentType = res.headers.get("content-type") || "";
//   const data = contentType.includes("application/json")
//     ? await res.json().catch(() => null)
//     : await res.text().catch(() => null);

//   if (!res.ok) {
//     const msg =
//       (data && (data.detail || data.message)) ||
//       (typeof data === "string" ? data : "Request failed");

//     // ✅ Auto logout on 401 (enabled by default)
//     const autoLogout = opts.autoLogoutOn401 !== false;
//     if (res.status === 401 && autoLogout && typeof window !== "undefined") {
//       localStorage.removeItem("access_token");
//       localStorage.removeItem("refresh_token");
//     }

//     throw new ApiError(msg, res.status, data);
//   }

//   return data as T;
// }

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
