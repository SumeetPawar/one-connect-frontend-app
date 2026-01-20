"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type Goal = {
  id: string;
  user_id: string;
  metric_key: "steps";
  period: "week";
  daily_target: number;
  period_target: number;
  period_start: string; // yyyy-mm-dd
  period_end: string;
  anchor_start: string;
};

type Today = { day: string; total_steps: number };

type WeekDay = { day: string; total_steps: number };
type WeekProgress = {
  anchor_start: string;
  period_start: string;
  period_end: string;
  goal_daily_target: number;
  goal_period_target: number;
  week_total_steps: number;
  progress_pct: number;
  remaining_steps: number;
  days: WeekDay[];
};

type StreakDay = {
  day: string;
  total_steps: number;
  habit_done: boolean;
  goal_done: boolean;
};
type Streak = {
  metric_key: "steps";
  today: string;
  today_total: number;
  habit_today_done: boolean;
  goal_today_done: boolean;
  habit_streak: number;
  goal_streak: number;
  last_14_days: StreakDay[];
};

type StepsSetResponse = {
  log_id: string;
  day: string;
  entered_steps?: number; // if you renamed
  added_steps?: number;   // if still old
  day_total: number;
};

export function useHomeData() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [today, setToday] = useState<Today | null>(null);
  const [week, setWeek] = useState<WeekProgress | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Goal might be missing (404) if user hasn't set it yet
      const [todayRes, streakRes, goalRes, weekRes] = await Promise.all([
        api<Today>("/steps/today"),
        api<Streak>("/streaks/current?metric_key=steps"),
        api<Goal>("/goals/current?metric_key=steps").catch(() => null),
        api<WeekProgress>("/steps/week?metric_key=steps").catch(() => null),
      ]);

      setToday(todayRes);
      setStreak(streakRes);
      setGoal(goalRes);
      setWeek(weekRes);
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Main action: set today’s total steps
  const setStepsTotal = useCallback(
    async (steps: number) => {
      setError("");

      // optimistic UI (optional)
      setToday((prev) =>
        prev ? { ...prev, total_steps: steps } : { day: "", total_steps: steps }
      );

      try {
        await api<StepsSetResponse>("/steps/set", {
          method: "POST",
          body: JSON.stringify({ steps }),
        });

        // refresh derived data (week progress + streak)
        await refresh();
      } catch (e: any) {
        setError(e.message || "Failed to set steps");
        // rollback by refresh
        await refresh();
        throw e;
      }
    },
    [refresh]
  );

  const computed = useMemo(() => {
    const todaySteps = today?.total_steps ?? 0;
    const dailyTarget = goal?.daily_target ?? week?.goal_daily_target ?? 7500;
    const pct = dailyTarget > 0 ? Math.min(100, (todaySteps / dailyTarget) * 100) : 0;

    return {
      todaySteps,
      dailyTarget,
      todayPct: pct,
      habitStreak: streak?.habit_streak ?? 0,
      goalStreak: streak?.goal_streak ?? 0,
      weekTotal: week?.week_total_steps ?? 0,
      weekPct: week?.progress_pct ?? 0,
      weekRemaining: week?.remaining_steps ?? 0,
    };
  }, [today, goal, week, streak]);

  return {
    loading,
    error,
    refresh,
    goal,
    today,
    week,
    streak,
    setStepsTotal,
    computed,
  };
}
