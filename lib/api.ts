import { getAccessToken, logout, refreshAccessToken } from "./auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "https://cbiqa.dev.honeywellcloud.com/socialapi";

const PUSH_SUBSCRIBE_URL = `${API_BASE}/api/push/subscribe`;
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
    const ok = await refreshAccessToken();
    if (ok) {
      ({ res, data } = await doFetch());
    } else {
      // Only logout if refresh token is also gone (truly expired session)
      const hasRefreshToken = typeof window !== "undefined" && !!localStorage.getItem("refresh_token");
      if (!hasRefreshToken) {
        logout();
        throw new ApiError("Session expired. Please login again.", 401, null);
      }
      // Refresh token still present but refresh failed (network issue) — don't logout
      throw new ApiError("Request failed, please try again.", 401, null);
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

// Format date as YYYY-MM-DD in LOCAL timezone (avoids UTC shift bug)
function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function getChallengeWeeklySteps(
  challengeId: string,
  weekOffset: number = 0
): Promise<any> {
  // Calculate week start/end based on offset
  // Week is Monday-Sunday, with Sunday included
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ...
  const monday = new Date(today);

  if (dayOfWeek === 0) {
    // If today is Sunday, it's the last day of the current week
    // Current week's Monday is 6 days ago
    monday.setDate(today.getDate() - 6);
  } else {
    // Otherwise, current week's Monday is (dayOfWeek - 1) days ago
    monday.setDate(today.getDate() - (dayOfWeek - 1));
  }

  // Apply weekOffset
  monday.setDate(monday.getDate() + (weekOffset * 7));
  const startDate = toLocalISODate(monday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6); // Sunday is 6 days after Monday
  const endDate = toLocalISODate(sunday);

  // Use the api helper - it handles auth, token refresh, errors automatically
  return api(
    `/api/challenges/${challengeId}/my-progress?start_date=${startDate}&end_date=${endDate}`,
    {
      method: "GET",
      auth: true,
    }
  );
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

// ==========================================
// BODY COMPOSITION API
// ==========================================

export interface BodyMetricScan {
  id: string;
  user_id: string;
  recorded_date: string;
  weight_kg: number | null;
  bmi: number | null;
  body_fat_pct: number | null;
  visceral_fat: number | null;
  muscle_mass_kg: number | null;
  bone_mass_kg: number | null;
  hydration_pct: number | null;
  protein_pct: number | null;
  bmr_kcal: number | null;
  metabolic_age: number | null;
}

export interface BodyMetricHistory {
  all: BodyMetricScan[];
  y1: BodyMetricScan[];
  m6: BodyMetricScan[];
  m3: BodyMetricScan[];
}

export interface BodyMetricCreateRequest {
  recorded_date?: string;       // YYYY-MM-DD, defaults to today
  weight_kg?: number | null;
  body_fat_pct?: number | null;
  visceral_fat?: number | null;
  muscle_mass_kg?: number | null;
  bone_mass_kg?: number | null;
  hydration_pct?: number | null;
  protein_pct?: number | null;
  bmr_kcal?: number | null;
  metabolic_age?: number | null;
  height_cm?: number | null; // override user's stored height
}

export interface BodyProfile {
  age: number | null;
  gender: string | null;  // "male" | "female"
  activity_level: string | null;  // "sedentary"|"light"|"moderate"|"active"|"athlete"
  height_cm: number | null;
}

export interface BodyProfileUpdateRequest {
  age?: number;
  gender?: string;
  activity_level?: string;
  height_cm?: number;
}

// GET /api/body-metrics/latest
export async function getLatestScan(): Promise<BodyMetricScan> {
  return api<BodyMetricScan>("/api/body-metrics/latest", {
    method: "GET",
    auth: true,
  });
}

// GET /api/body-metrics/history  — returns all periods in one call
export async function getScanHistory(): Promise<BodyMetricHistory> {
  return api<BodyMetricHistory>("/api/body-metrics/history", {
    method: "GET",
    auth: true,
  });
}

// POST /api/body-metrics  — save a new scan
export async function saveScan(data: BodyMetricCreateRequest): Promise<BodyMetricScan> {
  return api<BodyMetricScan>("/api/body-metrics", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
}

// ==========================================
// BODY PROFILE API
// ==========================================

// GET /api/users/me/profile
export async function getBodyProfile(): Promise<BodyProfile> {
  return api<BodyProfile>("/api/me/profile", {
    method: "GET",
    auth: true,
  });
}

// PUT /api/users/me/profile
export async function updateBodyProfile(data: BodyProfileUpdateRequest): Promise<BodyProfile> {
  return api<BodyProfile>("/api/me/profile", {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
}