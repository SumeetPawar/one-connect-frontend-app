import { getAccessToken, logout, refreshAccessToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://social-webapi-b7ebhgakb6engxbh.eastus-01.azurewebsites.net";

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



export async function api<T>(
  path: string,
  opts: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  async function doFetch() {
    const headers: Record<string, string> = {
      ...(opts.headers as any),
    };

    if (!headers["Content-Type"] && !(opts.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (opts.auth !== false) {
      const token = getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => null);

    return { res, data };
  }

  // Attempt #1
  let { res, data } = await doFetch();

  // If access expired -> refresh -> retry #2
  if (res.status === 401 && opts.auth !== false) {
    try {
      const ok = await refreshAccessToken();
      if (ok) {
        ({ res, data } = await doFetch());
      } else {
        logout();
        throw new ApiError("Session expired. Please login again.", 401, null);
      }
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);
      logout();
      throw new ApiError("Session expired. Please login again.", 401, null);
    }
  }

  // Still failing
  if (!res.ok) {
    if (res.status === 401) {
      logout();
    }
    const msg = (data && (data.detail || data.message)) ||
      (typeof data === "string" ? data : "Request failed");
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}

// ==========================================
// STEPS API
// ==========================================


export interface AddStepsRequest {
  steps: number;
  log_date?: string;
  source?: string;
  note?: string;
}

export interface AddStepsResponse {
  success: boolean;
  message?: string;
}

export interface AddStepsRequest {
  steps: number;
  log_date?: string;  // ISO date string (YYYY-MM-DD), optional - defaults to today
  source?: string;
  note?: string;
}

export interface AddStepsResponse {
  log_id: string;
  day: string;
  added_steps: number;
  day_total: number;
}

export interface WeekProgressDay {
  day: string;
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
  days: WeekProgressDay[];
}

// Add steps (matches your POST /api/steps/log endpoint)
export async function addSteps(data: { steps: number; log_date: string; source?: string; note?: string }): Promise<any> {
  return api("/api/steps/add", {
    method: "POST",
    auth: true,
    body: JSON.stringify({
      day: data.log_date,  // Map log_date to day
      steps: data.steps,
    }),
  });
}

// Get weekly steps (matches your GET /api/steps/weekly endpoint)
export async function getWeeklySteps(): Promise<any> {
  return api("/api/steps/weekly", {
    method: "GET",
    auth: true,
  });
}

// ==========================================
// GOALS API
// ==========================================

export interface SetTargetRequest {
  daily_target: number;
}

export interface SetTargetResponse {
  challenge_id: string;
  challenge_title: string;
  daily_target: number;
  weekly_target: number;
  challenge_start: string;
  challenge_end: string;
}

export interface CurrentGoalResponse {
  challenge_id: string;
  challenge_title: string;
  daily_target: number;
  weekly_target: number;
  challenge_start: string;
  challenge_end: string;
  has_target_set: boolean;
}

export async function setDailyTarget(target: number): Promise<SetTargetResponse> {
  return api<SetTargetResponse>("/api/goals/set-target", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ daily_target: target }),
  });
}

export async function getCurrentGoal(): Promise<CurrentGoalResponse> {
  return api<CurrentGoalResponse>("/api/goals/current", {
    method: "GET",
    auth: true,
  });
}