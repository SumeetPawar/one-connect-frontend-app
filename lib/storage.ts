// lib/storage.ts
// LocalStorage helpers for the fitness tracker (App Router safe)

export type WeekDay = {
  day: string;      // "Sun"
  date: number;     // 12
  today: boolean;
  done: boolean;
  steps: number;
};

const KEY = "stepTrackerData";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadWeekDays(fallback: WeekDay[]): WeekDay[] {
  if (!isBrowser()) return fallback;

  const raw = localStorage.getItem(KEY);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);

    // Basic validation: must be an array with required fields
    if (!Array.isArray(parsed)) return fallback;

    const safe = parsed
      .filter(Boolean)
      .map((d: any) => ({
        day: String(d.day ?? ""),
        date: Number(d.date ?? 0),
        today: Boolean(d.today),
        done: Boolean(d.done),
        steps: Number(d.steps ?? 0),
      }));

    // If data looks empty, use fallback
    if (safe.length === 0) return fallback;

    return safe;
  } catch {
    return fallback;
  }
}

export function saveWeekDays(weekDays: WeekDay[]) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(weekDays));
}

export function clearWeekDays() {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY);
}

/** Utility: pick default selected day index (today if exists, else 0) */
export function getDefaultSelectedDayIndex(weekDays: WeekDay[]) {
  const idx = weekDays.findIndex((d) => d.today);
  return idx >= 0 ? idx : 0;
}
