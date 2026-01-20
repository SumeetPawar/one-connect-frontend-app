// app/page.tsx
// Mobile-first FITNESS STEPS APP – LANDING PAGE ONLY
// One screen. One goal. No tabs. No navigation.
// Shows: Weekly completion ticks (top) + Today/Selected steps ring + Weekly progress bar + AI summary.
// Interaction: tap a week tick → updates the center ring + AI summary for that day (no popup).
// Log steps: simple "Add steps" button → bottom sheet (hidden initially).

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

// ---------------- types ----------------

interface WeekDay {
  label: string;
  short: string;
  steps: number;
  done: boolean;
  today?: boolean;
}

interface AiSummaryParams {
  nextSteps: number;
  goal: number;
}

interface PrimaryButtonProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
}

interface SecondaryButtonProps {
  label: string;
  onClick: () => void;
}

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface AppHeaderProps {
  date: string;
  name: string;
}

interface WeekCompletionTicksProps {
  days: WeekDay[];
  streak: number;
  selectedLabel: string;
  onSelectDay: (day: WeekDay) => void;
}

interface ProgressRingProps {
  value: number;
  goal: number;
  label: string;
}

interface WeeklyProgressBarProps {
  value: number;
  goal: number;
}

// ---------------- helpers ----------------

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function formatNumber(n: number | null | undefined): string {
  return Number(n || 0).toLocaleString("en-IN");
}

function cx(...args: (string | boolean | null | undefined)[]): string {
  return args.filter(Boolean).join(" ");
}

function buildAiSummary({ nextSteps, goal }: AiSummaryParams): string {
  const safeGoal = goal > 0 ? goal : 1;
  const pct = nextSteps / safeGoal;

  if (pct >= 1) return "🎉 Goal closed! 2 min stretch + hydrate well.";
  if (pct >= 0.85) return "⚡ Very close. One small walk will finish today.";
  if (pct >= 0.6) return "✅ Solid progress. Keep the momentum.";
  if (pct >= 0.3) return "🌿 Good start. A short walk will push you ahead.";
  return "🚀 Start small: a 5–10 min walk is enough to begin.";
}

// ---------------- UI atoms ----------------

function PrimaryButton({ label, onClick, disabled }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={cx(
        "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold shadow-md transition active:scale-[0.98]",
        disabled
          ? "cursor-not-allowed bg-slate-200 text-slate-500"
          : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
      )}
    >
      {label}
    </button>
  );
}

function SecondaryButton({ label, onClick }: SecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="inline-flex items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur-md transition active:scale-[0.98]"
    >
      {label}
    </button>
  );
}

// BottomSheet behavior:
// - Hidden initially (does not render when open=false)
// - On open: mounts, then animates swipe-up
// - On close: animates swipe-down, then calls onClose
function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // next frame to allow transition from translate-y-full -> translate-y-0
      requestAnimationFrame(() => setVisible(true));
    } else {
      // if parent toggles open->false, gracefully animate out
      if (mounted) {
        setVisible(false);
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => {
          setMounted(false);
        }, 260);
      }
    }

    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [open, mounted]);

  const handleClose = () => {
    // play close animation first
    setVisible(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setMounted(false);
      onClose();
    }, 260);
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div
        className={cx(
          "absolute inset-0 bg-black/40 transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={cx(
          "absolute bottom-0 left-0 right-0 mx-auto max-w-md rounded-t-3xl border border-slate-200/70 bg-white/90 p-4 shadow-2xl backdrop-blur-md",
          "transition-transform duration-300 ease-out will-change-transform",
          visible ? "translate-y-0" : "translate-y-full"
        )}
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-300" />

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <button
            onClick={handleClose}
            type="button"
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full border border-slate-200/70 bg-white/80 text-slate-600 shadow-sm backdrop-blur-md transition hover:bg-slate-100/80 active:scale-95"
          >
            ✕
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

// ---------------- main UI ----------------

function AppHeader({ date, name }: AppHeaderProps) {
  const hour = new Date().getHours();
  const greet =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="sticky top-0 z-40 -mx-4 mb-2 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-semibold text-slate-900">
            {greet}, {name}
          </div>
          <div className="mt-0.5 truncate text-xs text-slate-500">{date}</div>
        </div>

        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-full border border-slate-200/70 bg-white/80 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md"
          aria-label="Profile"
          title="Profile"
        >
          {String(name || "S")
            .trim()
            .slice(0, 1)
            .toUpperCase()}
        </button>
      </div>
    </div>
  );
}

function WeekCompletionTicks({ days, streak, selectedLabel, onSelectDay }: WeekCompletionTicksProps) {
  return (
    <div className="mt-2">
      <div className="mb-2 flex justify-between px-1 text-xs text-slate-500">
        <span className="font-semibold">This week</span>
        <span className="text-slate-400">Goal hit</span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected = selectedLabel === day.label;
          const isToday = day.today === true;

          const ringClass =
            isSelected && isToday
              ? "ring-4 ring-teal-400 ring-offset-2 ring-offset-white"
              : isToday
              ? "ring-2 ring-teal-400 ring-offset-2 ring-offset-white"
              : isSelected
              ? "ring-2 ring-slate-400 ring-offset-2 ring-offset-white"
              : "";

          return (
            <div key={day.label} className="text-center">
              <button
                type="button"
                onClick={() => onSelectDay(day)}
                className={cx(
                  "mx-auto grid h-7 w-7 place-items-center rounded-full border border-slate-200/80 shadow-sm transition active:scale-95",
                  day.done
                    ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                    : "bg-white/70 text-slate-400 backdrop-blur-md",
                  ringClass
                )}
                aria-label={`${day.label} steps`}
                title={day.label}
              >
                <span className="text-[13px] leading-none">{day.done ? "✓" : ""}</span>
              </button>
              <div className="mt-1 text-[10px] font-semibold text-slate-500">
                {day.short}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 px-1 text-[11px] text-slate-500">
        <span className="font-semibold text-slate-700">Streak:</span> {streak} day
        {streak === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function ProgressRing({ value, goal, label }: ProgressRingProps) {
  const safeGoal = goal > 0 ? goal : 1;
  const pct = clamp(Math.round((value / safeGoal) * 100), 0, 100);
  const r = 58;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="relative mx-auto mt-6 h-44 w-44">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={r}
          strokeWidth="12"
          fill="none"
          className="stroke-slate-200"
        />
        <circle
          cx="80"
          cy="80"
          r={r}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="stroke-teal-500"
        />
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-4xl font-semibold tracking-tight text-slate-900">
            {formatNumber(value)}
          </div>
          <div className="mt-1 text-xs text-slate-500">{label}</div>
          <div className="mt-1 text-[11px] text-slate-400">{pct}% of goal</div>
        </div>
      </div>
    </div>
  );
}

function WeeklyProgressBar({ value, goal }: WeeklyProgressBarProps) {
  const safeGoal = goal > 0 ? goal : 1;
  const pct = clamp((value / safeGoal) * 100, 0, 100);

  return (
    <div className="mt-5 w-full">
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <span className="font-semibold">Weekly progress</span>
        <span>
          {formatNumber(value)} / {formatNumber(goal)}
        </span>
      </div>

      <div className="mt-2 h-3 rounded-full bg-slate-200/80 p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------------- PAGE ----------------

export default function StepsLandingPage() {
  const goalToday = 7500;
  const goalWeek = goalToday * 7;

  const [stepsToday, setStepsToday] = useState<number>(7842);
  const [stepsWeek, setStepsWeek] = useState<number>(38420);

  const [viewSteps, setViewSteps] = useState<number>(7842);
  const [viewLabel, setViewLabel] = useState<string>("Today");
  const [selectedLabel, setSelectedLabel] = useState<string>("Fri");

  const [aiSummary, setAiSummary] = useState<string>(
    buildAiSummary({ nextSteps: 7842, goal: goalToday })
  );

  const [logOpen, setLogOpen] = useState<boolean>(false);
  const [inputSteps, setInputSteps] = useState<string>("");

  const date = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  }, []);

  // MOCK data for preview (replace with real computed per-day later)
  const weekDays = useMemo<WeekDay[]>(() => {
    return [
      { label: "Mon", short: "M", steps: 8200, done: true },
      { label: "Tue", short: "T", steps: 7600, done: true },
      { label: "Wed", short: "W", steps: 4200, done: false },
      { label: "Thu", short: "T", steps: 9100, done: true },
      {
        label: "Fri",
        short: "F",
        steps: stepsToday,
        done: stepsToday >= goalToday,
        today: true,
      },
      { label: "Sat", short: "S", steps: 0, done: false },
      { label: "Sun", short: "S", steps: 0, done: false },
    ];
  }, [stepsToday, goalToday]);

  const streak = useMemo(() => {
    // preview streak: count consecutive done ending at today
    const idx = weekDays.findIndex((d) => d.today);
    if (idx < 0) return 0;
    if (!weekDays[idx].done) return 0;
    let s = 0;
    for (let i = idx; i >= 0; i--) {
      if (weekDays[i].done) s += 1;
      else break;
    }
    return s;
  }, [weekDays]);

  const remainingToday = useMemo(
    () => Math.max(goalToday - viewSteps, 0),
    [goalToday, viewSteps]
  );

  const onSelectDay = (day: WeekDay) => {
    setSelectedLabel(day.label);
    setViewSteps(day.steps);
    setViewLabel(day.today ? "Today" : day.label);
    setAiSummary(buildAiSummary({ nextSteps: day.steps, goal: goalToday }));
  };

  const onAddSteps = () => {
    const n = Number(inputSteps);
    if (!Number.isFinite(n) || n <= 0) return;

    const add = Math.floor(n);
    const nextToday = stepsToday + add;
    const nextWeek = stepsWeek + add;

    setStepsToday(nextToday);
    setStepsWeek(nextWeek);

    // Add steps always applies to Today. If user is currently viewing Today, update ring + summary.
    if (viewLabel === "Today") {
      setViewSteps(nextToday);
      setAiSummary(buildAiSummary({ nextSteps: nextToday, goal: goalToday }));
    }

    setInputSteps("");
    setLogOpen(false);
  };

  // Dev sanity checks (tests)
  if (process.env.NODE_ENV !== "production") {
    console.assert(clamp(10, 0, 5) === 5, "clamp upper bound failed");
    console.assert(clamp(-1, 0, 5) === 0, "clamp lower bound failed");

    console.assert(cx("a", false, "b") === "a b", "cx should join truthy strings");
    console.assert(formatNumber(10000).includes(","), "formatNumber should add separators");

    console.assert(
      typeof aiSummary === "string" && aiSummary.length > 0,
      "AI summary should be non-empty"
    );

    console.assert(weekDays.length === 7, "weekDays should have 7 entries");
    console.assert(weekDays.some((d) => d.today), "One day should be marked today");
    console.assert(
      weekDays.some((d) => d.label === selectedLabel),
      "selectedLabel should match a weekday label"
    );

    console.assert(
      buildAiSummary({ nextSteps: goalToday, goal: goalToday }).includes("Goal"),
      "AI summary at goal should congratulate"
    );
    console.assert(
      buildAiSummary({ nextSteps: Math.floor(goalToday * 0.86), goal: goalToday }).includes(
        "Very close"
      ),
      "AI summary near goal should be 'Very close'"
    );
    console.assert(
      buildAiSummary({ nextSteps: 0, goal: goalToday }).length > 0,
      "AI summary at 0 should exist"
    );

    // Additional tests
    console.assert(formatNumber(null) === "0", "formatNumber should handle null");
    console.assert(clamp(101, 0, 100) === 100, "clamp should cap at max");
    console.assert(typeof logOpen === "boolean", "logOpen should be boolean");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(120%_80%_at_50%_-20%,rgba(45,212,191,0.25),transparent_60%),radial-gradient(120%_80%_at_0%_100%,rgba(99,102,241,0.18),transparent_55%),linear-gradient(to_bottom,theme(colors.slate.100),theme(colors.slate.50),white)]">
      <main className="mx-auto max-w-md px-4 py-6 backdrop-blur-xl">
        <AppHeader date={date} name="Sumeet" />

        <WeekCompletionTicks
          days={weekDays}
          streak={streak}
          selectedLabel={selectedLabel}
          onSelectDay={onSelectDay}
        />

        <ProgressRing value={viewSteps} goal={goalToday} label={viewLabel} />

        <div className="mt-3 text-center text-sm text-slate-500">
          Goal: {formatNumber(goalToday)} • {formatNumber(remainingToday)} left
        </div>

        <WeeklyProgressBar value={stepsWeek} goal={goalWeek} />

        <div className="mt-4 rounded-2xl border border-emerald-200/60 bg-emerald-50/80 p-3 text-center text-sm text-emerald-800 shadow-sm backdrop-blur">
          {aiSummary}
        </div>

        <div className="mt-8 flex justify-center">
          <PrimaryButton label="Add steps" disabled={false} onClick={() => setLogOpen(true)} />
        </div>

        <BottomSheet open={logOpen} onClose={() => setLogOpen(false)} title="Add steps">
          <div className="grid gap-3">
            <input
              value={inputSteps}
              onChange={(e) => setInputSteps(e.target.value)}
              inputMode="numeric"
              placeholder="Enter steps (e.g., 1200)"
              className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 backdrop-blur-md focus:border-teal-400"
            />

            <div className="flex gap-2">
              <PrimaryButton
                label="Add"
                onClick={onAddSteps}
                disabled={!String(inputSteps || "").trim()}
              />
              <SecondaryButton label="Clear" onClick={() => setInputSteps("")} />
            </div>
          </div>
        </BottomSheet>
      </main>
    </div>
  );
}