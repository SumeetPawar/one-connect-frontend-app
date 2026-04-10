"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../commponents/Header";
import { api, addSteps, getCachedUserMe } from "@/lib/api";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

// ─── animated counters ───────────────────────────────────────────────────────
function useCount(target: number, delay = 300, dur = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const s = performance.now();
      const f = (n: number) => {
        const p = Math.min((n - s) / dur, 1);
        setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay, dur]);
  return v;
}
function usePct(target: number, delay = 400, dur = 1100) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const s = performance.now();
      const f = (n: number) => {
        const p = Math.min((n - s) / dur, 1);
        setV((1 - Math.pow(1 - p, 4)) * target);
        if (p < 1) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay, dur]);
  return v;
}

// ─── theme ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#08080F",
  card: "#100E1A",
  grad: "linear-gradient(135deg,#A78BF5 0%,#7C5CE8 100%)",
  gradSoft: "linear-gradient(180deg,rgba(155,127,232,.22) 0%,rgba(124,92,232,.04) 100%)",
  gradHero: "linear-gradient(180deg,rgba(167,139,245,.28) 0%,rgba(124,92,232,.08) 60%,rgba(91,65,200,.02) 100%)",
  purple: "#9B7FE8",
  purpleL: "#C4B0F8",
  violet: "#6D4FCC",
  green: "#2DD4BF",
  orange: "#F4A261",
  rose: "#E87A8A",
  teal: "#38BDF8",
  t1: "#F2EEFF",
  t2: "rgba(242,238,255,0.65)",
  t3: "rgba(242,238,255,0.38)",
  t4: "rgba(242,238,255,0.20)",
  t5: "rgba(242,238,255,0.09)",
  s1: "rgba(255,255,255,0.06)",
  b1: "rgba(255,255,255,0.09)",
  b2: "rgba(255,255,255,0.06)",
};

// ─── icons ────────────────────────────────────────────────────────────────────
const Ic = {
  Bell: ({ c = T.t2, s = 17 }: { c?: string; s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  Flame: ({ c = T.t1, s = 17 }: { c?: string; s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2s-5 4.5-5 9.5a5 5 0 0010 0C17 7.5 14.5 4 12 2z" />
      <path d="M12 12s-2-1.5-2-3c0-1.2.8-2.5 2-3 1.2.5 2 1.8 2 3 0 1.5-2 3-2 3z" />
    </svg>
  ),
  Check: ({ c = T.t1, s = 12 }: { c?: string; s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
  Up: ({ c = T.t1, s = 10 }: { c?: string; s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  Walk: ({ c = T.t1, s = 17 }: { c?: string; s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="1.5" /><path d="M9 8.5l-2 5 3 1-1 5" /><path d="M12 8.5l1.5 4-3.5 1" /><path d="M14 8l2 2-2 3" />
    </svg>
  ),
  ChevR: ({ c = T.t3, s = 13 }: { c?: string; s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
  Body: ({ c = T.t1, s = 17 }: { c?: string; s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4.5" r="2" /><path d="M8 9.5h8l-1 5H9l-1-5z" /><path d="M10 14.5l-1.5 5M14 14.5l1.5 5" /><path d="M12 9.5v5" />
    </svg>
  ),
  Breath: ({ c = T.t1, s = 17 }: { c?: string; s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    </svg>
  ),
};

// ─── arc ring ─────────────────────────────────────────────────────────────────
function Arc({ pct, size, sw, color, bg }: { pct: number; size: number; sw: number; color: string; bg?: string }) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg || "rgba(238,237,245,.07)"} strokeWidth={sw} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeLinecap="round" strokeDasharray={`${c * pct / 100} ${c}`} />
    </svg>
  );
}

// ─── tree svg — richly illustrated 4-stage ───────────────────────────────────
function TreeSvg({ stage, size = 90 }: { stage: 0 | 1 | 2 | 3; size?: number }) {
  if (stage === 0) return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="108" rx="22" ry="6" fill="rgba(139,106,69,.25)" />
      <path d="M58 108 Q57 94 59 84 Q60 78 61 84 Q63 94 62 108Z" fill="#8B6A45" />
      <path d="M59 88 Q50 80 46 72 Q52 76 59 82Z" fill="#2A9E6E" opacity=".85" />
      <path d="M61 85 Q70 77 74 69 Q68 74 61 80Z" fill="#2A9E6E" opacity=".85" />
      <circle cx="60" cy="78" r="5" fill="#4ADE9F" />
      <circle cx="60" cy="75" r="3" fill="#5EE8A8" />
      <circle cx="60" cy="76" r="12" fill="none" stroke="rgba(74,222,159,.22)" strokeWidth="2" />
      <circle cx="60" cy="76" r="18" fill="none" stroke="rgba(74,222,159,.12)" strokeWidth="1.5" />
      <circle cx="60" cy="76" r="25" fill="none" stroke="rgba(74,222,159,.06)" strokeWidth="1" />
      <circle cx="42" cy="68" r="1.5" fill="rgba(94,232,168,.70)" />
      <circle cx="78" cy="64" r="1.5" fill="rgba(94,232,168,.70)" />
    </svg>
  );
  if (stage === 1) return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="108" rx="24" ry="6" fill="rgba(139,106,69,.22)" />
      <path d="M56 108 Q54 90 57 76 Q59 68 61 76 Q64 90 64 108Z" fill="#8B6A45" opacity=".9" />
      <path d="M56 106 Q48 108 44 112" stroke="#6B4E2E" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".5" />
      <path d="M64 106 Q72 108 76 112" stroke="#6B4E2E" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".5" />
      <ellipse cx="60" cy="62" rx="26" ry="20" fill="rgba(30,100,60,.35)" />
      <ellipse cx="60" cy="58" rx="22" ry="18" fill="rgba(42,158,110,.55)" />
      <path d="M38 64 Q30 54 34 44 Q40 56 46 62Z" fill="#2A9E6E" opacity=".80" />
      <path d="M82 60 Q90 50 86 40 Q80 52 74 58Z" fill="#2A9E6E" opacity=".80" />
      <ellipse cx="60" cy="52" rx="18" ry="20" fill="#2A9E6E" />
      <ellipse cx="60" cy="46" rx="14" ry="16" fill="#34C47A" />
      <ellipse cx="60" cy="40" rx="10" ry="12" fill="#4ADE9F" />
      <ellipse cx="56" cy="36" rx="5" ry="4" fill="rgba(94,232,168,.55)" />
    </svg>
  );
  if (stage === 2) return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="110" rx="28" ry="7" fill="rgba(139,106,69,.20)" />
      <path d="M54 110 Q52 88 55 72 Q58 62 62 72 Q65 88 66 110Z" fill="#7A5C3A" />
      <path d="M57 100 Q55 88 57 78" stroke="rgba(0,0,0,.15)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M56 82 Q44 76 36 66" stroke="#7A5C3A" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M64 78 Q76 72 84 62" stroke="#7A5C3A" strokeWidth="6" strokeLinecap="round" fill="none" />
      <ellipse cx="34" cy="58" rx="18" ry="14" fill="rgba(30,100,60,.40)" />
      <ellipse cx="34" cy="55" rx="16" ry="12" fill="#2A9E6E" />
      <ellipse cx="34" cy="52" rx="12" ry="9" fill="#3ABD7E" />
      <ellipse cx="86" cy="54" rx="18" ry="14" fill="rgba(30,100,60,.40)" />
      <ellipse cx="86" cy="51" rx="16" ry="12" fill="#2A9E6E" />
      <ellipse cx="86" cy="48" rx="12" ry="9" fill="#3ABD7E" />
      <ellipse cx="60" cy="50" rx="24" ry="26" fill="rgba(30,100,60,.35)" />
      <ellipse cx="60" cy="46" rx="21" ry="23" fill="#2A9E6E" />
      <ellipse cx="60" cy="40" rx="17" ry="19" fill="#34C47A" />
      <ellipse cx="60" cy="34" rx="13" ry="14" fill="#4ADE9F" />
      <ellipse cx="54" cy="30" rx="6" ry="5" fill="rgba(94,232,168,.50)" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="112" rx="32" ry="7" fill="rgba(139,106,69,.18)" />
      <path d="M54 110 Q42 112 36 118" stroke="#6B4E2E" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".55" />
      <path d="M66 110 Q78 112 84 118" stroke="#6B4E2E" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".55" />
      <path d="M52 112 Q50 88 53 70 Q56 58 60 58 Q64 58 67 70 Q70 88 68 112Z" fill="#6B4E2E" />
      <path d="M53 88 Q38 82 28 70" stroke="#6B4E2E" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M67 84 Q82 78 92 66" stroke="#6B4E2E" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M54 76 Q42 70 36 60" stroke="#7A5C3A" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M66 72 Q78 66 84 56" stroke="#7A5C3A" strokeWidth="5" strokeLinecap="round" fill="none" />
      <ellipse cx="24" cy="62" rx="16" ry="12" fill="rgba(30,100,60,.45)" />
      <ellipse cx="24" cy="58" rx="14" ry="11" fill="#1F7A4A" />
      <ellipse cx="24" cy="54" rx="11" ry="9" fill="#2A9E6E" />
      <ellipse cx="96" cy="58" rx="16" ry="12" fill="rgba(30,100,60,.45)" />
      <ellipse cx="96" cy="54" rx="14" ry="11" fill="#1F7A4A" />
      <ellipse cx="96" cy="50" rx="11" ry="9" fill="#2A9E6E" />
      <ellipse cx="38" cy="50" rx="18" ry="14" fill="rgba(30,100,60,.40)" />
      <ellipse cx="38" cy="46" rx="16" ry="12" fill="#2A9E6E" />
      <ellipse cx="38" cy="42" rx="12" ry="9" fill="#34C47A" />
      <ellipse cx="82" cy="46" rx="18" ry="14" fill="rgba(30,100,60,.40)" />
      <ellipse cx="82" cy="42" rx="16" ry="12" fill="#2A9E6E" />
      <ellipse cx="82" cy="38" rx="12" ry="9" fill="#34C47A" />
      <ellipse cx="60" cy="44" rx="28" ry="30" fill="rgba(30,100,60,.30)" />
      <ellipse cx="60" cy="40" rx="25" ry="27" fill="#1F7A4A" />
      <ellipse cx="60" cy="35" rx="22" ry="24" fill="#2A9E6E" />
      <ellipse cx="60" cy="29" rx="18" ry="20" fill="#34C47A" />
      <ellipse cx="60" cy="23" rx="14" ry="16" fill="#4ADE9F" />
      <ellipse cx="60" cy="17" rx="10" ry="11" fill="#5EE8A8" />
      <circle cx="60" cy="13" r="6" fill="#7EFFC0" />
      <circle cx="60" cy="12" r="3" fill="rgba(180,255,220,.90)" />
      <ellipse cx="48" cy="24" rx="7" ry="5" fill="rgba(126,255,192,.30)" />
      <ellipse cx="72" cy="20" rx="7" ry="5" fill="rgba(126,255,192,.30)" />
    </svg>
  );
}

const SEP = () => <div style={{ height: ".5px", background: "rgba(242,238,255,.07)", margin: "0 18px" }} />;

// ─── sparkline ────────────────────────────────────────────────────────────────────
function Spark({ color, pts }: { color: string; pts: number[] }) {
  const w = 72, h = 22, p = 2;
  const mn = Math.min(...pts), mx = Math.max(...pts);
  const x = (i: number) => p + (i / (pts.length - 1)) * (w - p * 2);
  const y = (v: number) => h - p - ((v - mn) / (mx - mn || 1)) * (h - p * 2);
  const d = pts.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".45" />
      <circle cx={x(pts.length - 1)} cy={y(pts[pts.length - 1])} r="2.5" fill={color} opacity=".85" />
    </svg>
  );
}

// ─── API types ────────────────────────────────────────────────────────────────
type RichSegment = { text: string; color: string | null; style: string };
type HomeData = {
  steps: { yesterday: number; today: number; daily_target: number; pct: number; step_streak: number };
  challenge: { id: string; rank: number; rank_change: number } | null;
  habits: { challenge_id: number; day_number: number; total_days: number; completed_count: number; total_count: number; all_done: boolean; yesterday_completed: number; yesterday_all_done: boolean } | null;
  habit_streak: { current: number; effective: number; longest: number; perfect_days: number };
  ai_insight: {
    badge: string;
    // new rich-text format
    segments?: RichSegment[];
    detail?: RichSegment[] | string;
    hook?: string;
    // legacy plain-string format (fallback)
    headline?: string;
  } | null;
  user: { name: string; profile_pic_url: string | null };
};

// resolve a colour name from the API to a theme token
function segColor(c: string | null, fallback: string): string {
  if (!c) return fallback;
  const map: Record<string, string> = {
    purple: T.purple, green: T.green, orange: T.orange,
    rose: T.rose, teal: T.teal, white: T.t1,
  };
  return map[c] ?? fallback;
}

// render an array of rich segments as inline spans
function toStr(v: unknown): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && !Array.isArray(v) && "text" in (v as any)) return (v as any).text ?? "";
  return String(v);
}
function toSegs(v: unknown): RichSegment[] | string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v as RichSegment[];
  // single segment object — wrap in array
  if (typeof v === "object" && "text" in (v as any)) return [v as RichSegment];
  return undefined;
}
function RichText({ segs, fallback, base }: { segs: RichSegment[] | string | undefined; fallback: string; base: string }) {
  if (!segs) return <>{fallback}</>;
  if (typeof segs === "string") return <>{segs}</>;
  return <>{segs.map((s, i) => (
    <span key={i} style={{ color: segColor(s.color, base), fontWeight: s.style === "stat" || s.style === "highlight" ? 700 : undefined }}>
      {s.text}
    </span>
  ))}</>;
}

// ─── AI Insight card ──────────────────────────────────────────────────────────
function AiInsightCard({ data, fd }: { data: HomeData; fd: (d: number) => React.CSSProperties }) {
  const insight = data.ai_insight;
  const habits = data.habits;
  const week = habits
    ? (habits.day_number <= 7 ? "Week 1" : habits.day_number <= 14 ? "Week 2" : "Week 3")
    : "Week 1";

  // Hide card entirely when there's no AI insight and no meaningful activity data yet
  const hasInsight = !!insight;
  const streak = data.habit_streak;
  // Only yesterday's actual activity counts — streak/today's habits don't make yesterday "meaningful"
  const hasMeaningfulData = data.steps.yesterday > 0 || (habits?.yesterday_completed ?? 0) > 0;

  const moodTag = toStr(insight?.badge) || `Yesterday's recap`;

  // ── Fallback card — no AI insight ──────────────────────────────────────────
  if (!hasInsight) {
    const ystdSteps = data.steps.yesterday;
    const ystdHabits = habits?.yesterday_completed ?? habits?.completed_count ?? 0;
    const ystdTotal = habits?.total_count ?? 0;
    const allDoneYstd = habits?.yesterday_all_done ?? false;
    const hitSteps = ystdSteps >= data.steps.daily_target;

    // Build prose headline from real data — same style as AI output
    const headlineParts: string[] = [];
    if (ystdSteps > 0) headlineParts.push(`walked ${ystdSteps.toLocaleString()} steps`);
    if (habits && ystdTotal > 0 && ystdHabits > 0) {
      headlineParts.push(allDoneYstd ? `completed all ${ystdTotal} habits` : `completed ${ystdHabits} of ${ystdTotal} habits`);
    }
    // ── Coach messages — random on every refresh, motivating not guilt-tripping
    const coachMessages = [
      {
        headline: "Today is a perfect day to start fresh.",
        detail: "Your habits are waiting. All it takes is showing up.",
        hook: "Small steps build big streaks.",
      },
      {
        headline: "Every great streak started with one day.",
        detail: "Get back into motion quickly — that's the whole game.",
        hook: "Begin. The rest follows.",
      },
      {
        headline: "You're one good day away from momentum.",
        detail: "Check off a habit and you'll feel that spark again.",
        hook: "Done beats perfect, every time.",
      },
      {
        headline: "The best time to start is right now.",
        detail: "Yesterday was quiet. Today hasn't happened yet.",
        hook: "One win leads to another.",
      },
      {
        headline: "Your goals are still right where you left them.",
        detail: "Nothing changed overnight — except now it's a new day.",
        hook: "Consistency is your superpower.",
      },
      {
        headline: "Champions have quiet days too.",
        detail: "What matters is how fast you get back.",
        hook: "Your streak is waiting.",
      },
      {
        headline: "A clean slate is actually a gift.",
        detail: "Today is day one of something great.",
        hook: "Make it count.",
      },
    ];
    const coachMsg = coachMessages[Math.floor(Math.random() * coachMessages.length)];

    const headline = hasMeaningfulData
      ? (headlineParts.length > 0
        ? headlineParts.map((p, i) => i === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p).join(" and ") + " yesterday."
        : "You showed up yesterday.")
      : coachMsg.headline;

    // Build detail line
    let detail = coachMsg.detail;
    if (hasMeaningfulData) {
      const streakPart = streak.effective > 0
        ? `${streak.effective} day streak${streak.effective > streak.current ? " 🛡️" : ""}`
        : null;
      const stepsPart = ystdSteps > 0 && hitSteps ? "steps goal hit" : ystdSteps > 0 ? `${(data.steps.daily_target - ystdSteps).toLocaleString()} steps short of goal` : null;
      const parts = [streakPart, stepsPart].filter(Boolean);
      detail = parts.length > 0 ? `${parts.join(" · ")} — keep the momentum going.` : "Keep logging to build your streak.";
    }

    // Hook line
    const hook = !hasMeaningfulData
      ? coachMsg.hook
      : streak.effective > 0
        ? (streak.effective >= streak.longest ? "Personal best — don't break it." : `${streak.longest - streak.effective} day${streak.longest - streak.effective === 1 ? "" : "s"} from your record.`)
        : null;

    // Badge color: orange-ish for coach mode, purple for recap
    const isCoachMode = !hasMeaningfulData;

    return (
      <div style={{
        ...fd(40), margin: "14px 16px 8px",
        background: T.gradSoft,
        border: `.5px solid ${isCoachMode ? "rgba(251,146,60,.18)" : "rgba(155,127,232,.18)"}`, borderRadius: 22,
        boxShadow: "0 4px 28px rgba(0,0,0,.55),0 1px 0 rgba(242,238,255,.04) inset",
        overflow: "hidden",
      }}>
        <div style={{ padding: "18px 20px 16px" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: isCoachMode ? "rgba(251,146,60,.10)" : "rgba(155,127,232,.10)",
            border: `.5px solid ${isCoachMode ? "rgba(251,146,60,.28)" : "rgba(155,127,232,.22)"}`,
            borderRadius: 99, padding: "3px 10px", marginBottom: 12,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: isCoachMode ? T.orange : T.purple }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: isCoachMode ? T.orange : T.purpleL, letterSpacing: ".08em", textTransform: "uppercase" as const }}>
              {isCoachMode ? "Your Move" : "Yesterday"}
            </span>
          </div>

          {/* Headline */}
          <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.4, letterSpacing: "-.3px", margin: 0, color: T.t1 }}>
            {headline}
          </p>

          {/* Detail */}
          <p style={{
            fontSize: 13, fontWeight: 400, color: T.t3, lineHeight: 1.6,
            marginTop: 10, paddingTop: 10,
            borderTop: `.5px solid ${isCoachMode ? "rgba(251,146,60,.12)" : "rgba(155,127,232,.12)"}`,
            marginBottom: 0,
          }}>
            {detail}
          </p>

          {/* Hook */}
          {hook && (
            <p style={{ fontSize: 11, fontWeight: 500, color: isCoachMode ? T.orange : T.teal, marginTop: 8, lineHeight: 1.5, marginBottom: 0 }}>
              {hook}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── AI insight card ─────────────────────────────────────────────────────────
  return (
    <div style={{
      ...fd(40), margin: "14px 16px 8px",
      background: T.gradSoft,
      border: ".5px solid rgba(155,127,232,.18)", borderRadius: 22,
      boxShadow: "0 4px 28px rgba(0,0,0,.55),0 1px 0 rgba(242,238,255,.04) inset",
      overflow: "hidden",
    }}>
      <div style={{ padding: "18px 20px 16px" }}>
        {/* Mood tag */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: "rgba(45,212,191,.10)", border: ".5px solid rgba(45,212,191,.22)",
          borderRadius: 99, padding: "3px 10px", marginBottom: 12,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.green }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: T.green, letterSpacing: ".08em", textTransform: "uppercase" as const }}>{moodTag}</span>
        </div>
        {/* Headline — rich segments or legacy string */}
        <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.4, letterSpacing: "-.3px", margin: 0, color: T.t1 }}>
          <RichText segs={toSegs(insight?.segments) ?? toSegs(insight?.headline)} fallback={`Kept ${habits ? `${habits.completed_count} of ${habits.total_count}` : "—"} habits & walked ${data.steps.yesterday.toLocaleString()} steps yesterday.`} base={T.t1} />
        </p>
        {/* Detail */}
        <p style={{
          fontSize: 13, fontWeight: 400, color: T.t3, lineHeight: 1.6,
          marginTop: 10, paddingTop: 10,
          borderTop: ".5px solid rgba(155,127,232,.12)",
        }}>
          <RichText segs={toSegs(insight?.detail)} fallback={`${streak.effective} day habit streak — keep showing up every day.`} base={T.t3} />
        </p>
        {/* Hook line */}
        {insight?.hook && (
          <p style={{ fontSize: 11, fontWeight: 500, color: T.purpleL, marginTop: 8, lineHeight: 1.5 }}>
            {toStr(insight.hook)}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── steps card ───────────────────────────────────────────────────────────────
function StepsCard({
  data, showLog, setShowLog, animSteps, animPct, fd, onNavigate,
}: {
  data: HomeData; showLog: boolean; setShowLog: (b: boolean) => void;
  animSteps: number; animPct: number; fd: (d: number) => React.CSSProperties;
  onNavigate: () => void;
}) {
  const { steps, challenge } = data;
  const isLogged = steps.today > 0;
  const hasChallenge = !!challenge;
  const isEvening = new Date().getHours() >= 17;

  const wrap = (accent: string, children: React.ReactNode, tappable = false) => (
    <div
      className={tappable ? "hp-card-tap" : undefined}
      onClick={tappable ? onNavigate : undefined}
      style={{
        ...fd(250), margin: "0 16px 8px",
        background: `linear-gradient(180deg,${accent}1E 0%,${accent}05 100%)`,
        border: `.5px solid ${accent}28`, borderRadius: 22, overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,.60),0 1px 0 rgba(255,255,255,.05) inset",
        cursor: tappable ? "pointer" : undefined,
      }}>{children}</div>
  );

  if (!hasChallenge) return wrap(T.purple, (
    <div style={{ padding: "22px 20px 18px", position: "relative" as const, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,245,.14) 0%,transparent 70%)", pointerEvents: "none" as const }} />
      <p style={{ fontSize: 10, fontWeight: 700, color: T.purpleL, letterSpacing: ".12em", textTransform: "uppercase" as const, marginBottom: 10 }}>Monthly Team Challenge</p>
      <p style={{ fontSize: 22, fontWeight: 800, color: T.t1, letterSpacing: "-.4px", lineHeight: 1.2, marginBottom: 8 }}>Walk together.<br />Rise together.</p>
      <p style={{ fontSize: 13, fontWeight: 400, color: T.t3, lineHeight: 1.65 }}>Log your daily steps and compete with colleagues.</p>
    </div>
  ), true);

  if (!isLogged && !isEvening) return wrap(T.purple, (
    <div style={{ padding: "20px 18px 18px", position: "relative" as const, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,245,.12) 0%,transparent 70%)", pointerEvents: "none" as const }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(155,127,232,.12)", border: ".5px solid rgba(155,127,232,.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Ic.Walk c={T.purple} s={17} />
        </div>
        <p style={{ fontSize: 10, fontWeight: 700, color: T.purpleL, letterSpacing: ".10em", textTransform: "uppercase" as const }}>Daily Step Goal</p>
      </div>
      <p style={{ fontSize: 20, fontWeight: 800, color: T.t1, letterSpacing: "-.4px", lineHeight: 1.25, marginBottom: 6 }}>
        Target: {steps.daily_target.toLocaleString()} steps
      </p>
      <p style={{ fontSize: 12, fontWeight: 400, color: T.t3, lineHeight: 1.6 }}>
        Rank #{challenge.rank} · Log your steps in the evening to track today's progress.
      </p>
    </div>
  ), true);

  if (!isLogged) return wrap(T.purple, (
    <div style={{ padding: "20px 18px 18px", textAlign: "center" as const }}>
      <div style={{
        width: 50, height: 50, borderRadius: 15, margin: "0 auto 14px",
        background: "rgba(155,127,232,.12)", border: ".5px solid rgba(155,127,232,.22)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 16px rgba(124,92,232,.20)",
      }}>
        <Ic.Walk c={T.purple} s={22} />
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: T.t1, letterSpacing: "-.2px", lineHeight: 1.35, marginBottom: 6 }}>How many steps today?</p>
      <p style={{ fontSize: 12, fontWeight: 400, color: T.t3, marginBottom: 18, lineHeight: 1.55 }}>
        Currently rank #{challenge.rank} · target {steps.daily_target.toLocaleString()} steps
      </p>
      <button onClick={e => { e.stopPropagation(); setShowLog(true); }} style={{
        width: "100%", padding: "15px 0", borderRadius: 14, border: "none",
        cursor: "pointer", background: T.grad, color: "#fff", fontSize: 14, fontWeight: 700,
        letterSpacing: "-.1px", fontFamily: "'Plus Jakarta Sans',sans-serif",
        boxShadow: "0 8px 28px rgba(124,92,232,.40),0 1px 0 rgba(255,255,255,.14) inset",
      }}>Log Today's Steps</button>
    </div>
  ), true);

  // logged state
  return wrap(T.green, (
    <>
      <div style={{ padding: "16px 18px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <div style={{ width: 17, height: 17, borderRadius: "50%", background: T.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 2px 8px ${T.green}55` }}>
                <Ic.Check c="#08080F" s={8} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: T.green, letterSpacing: ".08em", textTransform: "uppercase" as const }}>Logged today</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 4 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: T.t1, letterSpacing: "-.04em", lineHeight: 1 }}>{animSteps.toLocaleString()}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.t3 }}>steps</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Ic.Up c={T.green} s={8} />
              <span style={{ fontSize: 11, fontWeight: 600, color: T.green }}>
                {steps.today >= steps.daily_target ? "Above daily goal" : `${(steps.daily_target - steps.today).toLocaleString()} to reach goal`}
              </span>
            </div>
          </div>
          <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
            <Arc pct={animPct} size={52} sw={4} color={T.green} bg="rgba(45,212,191,.12)" />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.green }}>{Math.round(animPct)}%</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 0 2px" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.green }}>Rank #{challenge.rank}</span>
          {challenge.rank_change > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Ic.Up c={T.green} s={8} />
              <span style={{ fontSize: 10, fontWeight: 700, color: T.green }}>+{challenge.rank_change}</span>
            </div>
          )}
        </div>
      </div>
      <SEP />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 18px 13px" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.green }}>Steps logged ✓</span>
        <span style={{ fontSize: 12, fontWeight: 400, color: T.t3 }}>{steps.step_streak} day streak · <span style={{ color: T.purple, fontWeight: 600 }}>View →</span></span>
      </div>
    </>
  ), true);
}

// ─── habits card ──────────────────────────────────────────────────────────────
function HabitsCard({ data, fd, onNavigate }: { data: HomeData; fd: (d: number) => React.CSSProperties; onNavigate: () => void }) {
  const { habits, habit_streak } = data;

  const base: React.CSSProperties = {
    ...fd(180), margin: "0 16px 8px", borderRadius: 22, overflow: "hidden",
    boxShadow: "0 8px 40px rgba(0,0,0,.60),0 1px 0 rgba(255,255,255,.05) inset",
  };

  if (!habits) return (
    <div className="hp-card-tap" onClick={onNavigate} style={{
      ...base,
      background: "linear-gradient(180deg,rgba(167,139,245,.26) 0%,rgba(139,63,212,.08) 60%,rgba(74,222,159,.02) 100%)",
      border: ".5px solid rgba(155,127,232,.22)",
      cursor: "pointer",
    }}>
      <div style={{ padding: "22px 20px 16px", position: "relative" as const, overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: -30, right: -20, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,245,0.14) 0%,transparent 70%)", pointerEvents: "none" as const }} />
        <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(74,222,159,.70)", letterSpacing: ".10em", textTransform: "uppercase" as const, marginBottom: 8 }}>21-Day Habit Challenge</p>
        <p style={{ fontSize: 20, fontWeight: 800, color: T.t1, letterSpacing: "-.4px", lineHeight: 1.3, marginBottom: 6 }}>Grow your tree.<br />Grow yourself.</p>
        <p style={{ fontSize: 13, fontWeight: 400, color: T.t3, lineHeight: 1.6, marginBottom: 16 }}>Pick your daily habits. Every habit you log grows your tree — one branch at a time.</p>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4, padding: "8px 0 4px", background: "rgba(0,0,0,.12)", borderRadius: 16 }}>
          {([{
            s: 0 as const, size: 34, label: "Day 1", bright: true,
          }, {
            s: 1 as const, size: 50, label: "Day 7", bright: false,
          }, {
            s: 2 as const, size: 64, label: "Day 14", bright: false,
          }, {
            s: 3 as const, size: 80, label: "Day 21", bright: false,
          }]).map(({ s, size, label, bright }, i) => (
            <div key={s} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3, flex: 1 }}>
              <div style={{ opacity: bright ? 1 : 0.55 + i * 0.10 }}>
                <TreeSvg stage={s} size={size} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: bright ? T.green : T.t4, letterSpacing: ".04em", paddingBottom: 6 }}>{label}</span>
            </div>
          ))}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onNavigate(); }}
          style={{
            marginTop: 14, width: "100%", padding: "13px 0", borderRadius: 14, border: "none",
            cursor: "pointer", background: T.grad, color: "#fff", fontSize: 14, fontWeight: 700,
            letterSpacing: "-.1px", fontFamily: "'Plus Jakarta Sans',sans-serif",
            boxShadow: "0 8px 28px rgba(124,92,232,.40),0 1px 0 rgba(255,255,255,.14) inset",
          }}
        >Join Challenge</button>
      </div>
    </div>
  );

  const { day_number, total_days, completed_count, total_count, all_done } = habits;
  const pct = Math.round((day_number / total_days) * 100);
  const stage: 0 | 1 | 2 | 3 = day_number < 7 ? 1 : day_number < 14 ? 2 : day_number < 19 ? 3 : 3;
  const heroBg = all_done
    ? "linear-gradient(180deg,rgba(45,212,191,.18) 0%,rgba(124,92,232,.05) 100%)"
    : "linear-gradient(180deg,rgba(167,139,245,.24) 0%,rgba(124,92,232,.06) 100%)";

  return (
    <div className="hp-card-tap" onClick={onNavigate} style={{
      ...base,
      background: "linear-gradient(180deg,rgba(155,127,232,.18) 0%,rgba(124,92,232,.04) 100%)",
      border: ".5px solid rgba(155,127,232,.18)",
      cursor: "pointer",
    }}>
      <div style={{ background: heroBg, padding: "16px 18px 14px", position: "relative" as const, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle,${all_done ? "rgba(45,212,191,.10)" : "rgba(167,139,245,.10)"} 0%,transparent 70%)`, pointerEvents: "none" as const }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1, paddingRight: 10 }}>
            {all_done ? (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(45,212,191,.12)", border: ".5px solid rgba(45,212,191,.24)", borderRadius: 99, padding: "3px 10px", marginBottom: 10 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.green }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: T.green, letterSpacing: ".06em", textTransform: "uppercase" as const }}>Day {day_number} complete</span>
              </div>
            ) : (
              <p style={{ fontSize: 10, fontWeight: 700, color: T.purpleL, letterSpacing: ".10em", textTransform: "uppercase" as const, marginBottom: 8 }}>My Habits</p>
            )}
            <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 10 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: T.t1, letterSpacing: "-.04em", lineHeight: 1 }}>Day {day_number}</span>
              <span style={{ fontSize: 12, fontWeight: 400, color: T.t3 }}>of {total_days}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 100, height: 3, background: "rgba(155,127,232,.14)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: T.grad, borderRadius: 99 }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.purple }}>{pct}%</span>
            </div>
            {all_done ? (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.green }}>All {total_count} habits kept today</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.orange }} />
                <span style={{ fontSize: 12, fontWeight: 400, color: T.t3 }}>
                  <span style={{ color: T.t2, fontWeight: 600 }}>{completed_count} of {total_count}</span> logged today
                </span>
              </div>
            )}
          </div>
          <div style={{ flexShrink: 0 }}><TreeSvg stage={stage} size={72} /></div>
        </div>
      </div>

      {!all_done && (
        <>
          <SEP />
          <div style={{ padding: "11px 20px 13px" }}>
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: total_count }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < completed_count ? "linear-gradient(90deg,#A78BF5,#7C5CE8)" : "rgba(242,238,255,.09)" }} />
              ))}
            </div>
          </div>
        </>
      )}

      <SEP />
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px 14px" }}>
        <Ic.Flame c={T.orange} s={13} />
        <span style={{ fontSize: 13, fontWeight: 600, color: T.t2 }}>
          Showing up for <span style={{ color: T.orange, fontWeight: 700 }}>{habit_streak.effective} days</span>{habit_streak.effective > habit_streak.current ? " 🛡️" : ""} in a row
        </span>
        <button
          onClick={onNavigate}
          style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600, color: T.purple, background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", flexShrink: 0 }}>
          Open →
        </button>
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  useAuthRedirect({ apiCheck: true });
  const router = useRouter();

  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [vis, setVis] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [logVal, setLogVal] = useState("");
  const [logError, setLogError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [stepsRefreshing, setStepsRefreshing] = useState(false);
  const [mindWeekly, setMindWeekly] = useState(0);
  const [navigating, setNavigating] = useState(false);

  const navigate = (path: string) => {
    setNavigating(true);
    router.push(path);
  };

  // Read mindfulness weekly sessions from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mindfulness_sessions");
      const sessions: Array<{ date: string }> = raw ? JSON.parse(raw) : [];
      const now = new Date();
      const day = now.getDay();
      const monday = new Date(now);
      monday.setHours(0, 0, 0, 0);
      monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      const monStr = monday.toISOString().slice(0, 10);
      setMindWeekly(sessions.filter(s => s.date >= monStr).length);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { const t = setTimeout(() => setVis(true), 50); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const load = async () => {
      try {
        // Check identity first using the already-working user endpoint
        const me = await getCachedUserMe() as any;
        if (!me?.name?.toLowerCase().includes("sumeet")) {
          router.replace("/challanges");
          return;
        }
        // Fetch home data; fall back gracefully if endpoint not yet live
        let data: HomeData;
        try {
          data = await api<HomeData>("/api/home", { method: "GET" });
        } catch {
          // API not live yet — build minimal data from user profile
          data = {
            steps: { yesterday: 0, today: 0, daily_target: 8000, pct: 0, step_streak: 0 },
            challenge: null,
            habits: null,
            habit_streak: { current: 0, effective: 0, longest: 0, perfect_days: 0 },
            ai_insight: null,
            user: { name: me.name, profile_pic_url: null },
          };
        }
        setHomeData(data);
      } catch {
        router.replace("/challanges");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const stepsTarget = homeData?.steps.today ?? 0;
  const pctTarget = homeData?.steps.pct ?? 0;
  const animSteps = useCount(stepsTarget, 300, 900);
  const animPct = usePct(pctTarget, 200, 1000);

  const fd = (d: number): React.CSSProperties => ({
    opacity: vis ? 1 : 0,
    transform: vis ? "none" : "translateY(12px)",
    transition: `opacity .45s ease ${d}ms,transform .55s cubic-bezier(.22,1,.36,1) ${d}ms`,
  });

  const padPress = (k: string) => {
    setLogError("");
    if (k === "⌫") setLogVal(v => v.slice(0, -1));
    else if (logVal.length < 6) setLogVal(v => v + k);
  };

  const confirmLog = async () => {
    const n = parseInt(logVal);

    // ── Validations (same rules as steps page) ─────────────────────────
    if (!logVal || !Number.isFinite(n) || n <= 0) {
      setLogError("Please enter a valid number of steps.");
      return;
    }
    if (n < 1) {
      setLogError("Minimum steps must be at least 1.");
      return;
    }
    if (n > 50000) {
      setLogError("Maximum allowed is 50,000 steps per entry.");
      return;
    }

    setLogError("");
    setSubmitting(true);
    try {
      const today = new Date();
      const log_date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      await addSteps({ steps: n, log_date, source: "manual", note: "Logged from home" });
      setShowLog(false);
      setLogVal("");
      setLogError("");
      setStepsRefreshing(true);
      // Re-fetch home data so the StepsCard renders the logged state
      try {
        const fresh = await api<HomeData>("/api/home", { method: "GET" });
        setHomeData(fresh);
      } catch {
        // Optimistic fallback — update today's count locally
        if (homeData) {
          setHomeData({
            ...homeData,
            steps: {
              ...homeData.steps,
              today: (homeData.steps.today ?? 0) + n,
              pct: Math.min(Math.round(((homeData.steps.today ?? 0 + n) / homeData.steps.daily_target) * 100), 100),
            },
          });
        }
      } finally {
        setStepsRefreshing(false);
      }
    } catch (err: any) {
      setLogError(err?.message || "Failed to save steps. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── loading skeleton ───────────────────────────────────────────────────────
  if (loading || !homeData) {
    // wave shimmer rect — pure inline, no className needed
    const SR = ({ w, h, r = 6, mt = 0, delay = 0 }: { w: number | string; h: number; r?: number; mt?: number; delay?: number }) => (
      <div style={{
        width: w, height: h, borderRadius: r, marginTop: mt, flexShrink: 0,
        background: "linear-gradient(90deg,rgba(255,255,255,.055) 25%,rgba(255,255,255,.11) 50%,rgba(255,255,255,.055) 75%)",
        backgroundSize: "200% 100%",
        animation: `skshimmer 1.6s ${delay}ms ease-in-out infinite`,
      }} />
    );
    // card shell — subtle border, dark fill, rounded
    const Shell = ({ children, mt = 0, delay = 0 }: { children: React.ReactNode; mt?: number; delay?: number }) => (
      <div style={{
        margin: `${mt}px 16px 0`,
        borderRadius: 22, overflow: "hidden",
        background: "rgba(255,255,255,.028)",
        border: ".5px solid rgba(255,255,255,.07)",
        animation: `skfade ${0.4 + delay * 0.001}s ease both`,
      }}>{children}</div>
    );

    return (
      <div style={{ minHeight: "100vh", width: "100%", backgroundColor: T.bg }}>
        <div style={{ maxWidth: 430, margin: "0 auto", paddingBottom: 56 }}>
          <style>{`
          @keyframes skshimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
          @keyframes skfade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        `}</style>

          {/* ── header ── */}
          <div style={{ padding: "20px 20px 19px", borderBottom: ".5px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <SR w={52} h={18} r={6} delay={0} />
            <div style={{ display: "flex", gap: 8 }}>
              <SR w={36} h={36} r={11} delay={40} />
              <SR w={36} h={36} r={11} delay={60} />
            </div>
          </div>

          {/* ── greeting ── */}
          <div style={{ padding: "18px 20px 6px", display: "flex", flexDirection: "column", gap: 8 }}>
            <SR w={80} h={10} r={5} delay={60} />
            <SR w={160} h={26} r={8} delay={80} />
          </div>

          <div style={{ padding: "8px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>

            {/* ── insight card ── */}
            <Shell mt={6} delay={60}>
              <div style={{ padding: "18px 20px 16px" }}>
                {/* mood tag pill */}
                <SR w={96} h={22} r={99} delay={80} />
                {/* headline – 2 lines */}
                <SR w="76%" h={16} r={6} mt={14} delay={100} />
                <SR w="52%" h={16} r={6} mt={7} delay={110} />
                {/* divider */}
                <div style={{ height: .5, background: "rgba(155,127,232,.10)", margin: "12px 0" }} />
                {/* detail – 2 lines */}
                <SR w="92%" h={13} r={5} delay={120} />
                <SR w="64%" h={13} r={5} mt={6} delay={130} />
              </div>
            </Shell>

            {/* ── habits card ── */}
            <Shell delay={140}>
              <div style={{ padding: "16px 18px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ flex: 1, paddingRight: 14 }}>
                  {/* label pill */}
                  <SR w={114} h={22} r={99} delay={160} />
                  {/* day number */}
                  <SR w={90} h={30} r={7} mt={12} delay={170} />
                  {/* progress bar */}
                  <SR w={110} h={4} r={99} mt={12} delay={180} />
                  {/* status line */}
                  <SR w={140} h={13} r={5} mt={10} delay={190} />
                </div>
                {/* tree silhouette */}
                <SR w={72} h={72} r={16} delay={200} />
              </div>
              {/* habit dots strip */}
              <div style={{ height: .5, background: "rgba(255,255,255,.06)", margin: "0 18px" }} />
              <div style={{ padding: "11px 18px 13px", display: "flex", gap: 4 }}>
                {[1, 2, 3, 4].map(i => <SR key={i} w="25%" h={4} r={99} delay={210 + i * 10} />)}
              </div>
            </Shell>

            {/* ── steps card ── */}
            <Shell delay={220}>
              <div style={{ padding: "20px 18px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                {/* icon circle */}
                <SR w={50} h={50} r={15} delay={240} />
                {/* title */}
                <SR w="55%" h={17} r={6} mt={14} delay={250} />
                {/* subtitle */}
                <SR w="72%" h={13} r={5} mt={8} delay={260} />
                {/* button */}
                <SR w="100%" h={48} r={14} mt={20} delay={270} />
              </div>
            </Shell>

            {/* ── wellbeing buttons ── */}
            {[280, 320].map((delay, i) => (
              <Shell key={i} delay={delay}>
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                  {/* icon box */}
                  <SR w={38} h={38} r={11} delay={delay} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                    <SR w="45%" h={15} r={6} delay={delay + 10} />
                    <SR w="65%" h={12} r={5} delay={delay + 20} />
                  </div>
                  {/* value */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end" }}>
                    <SR w={32} h={20} r={5} delay={delay + 30} />
                    <SR w={24} h={9} r={4} delay={delay + 40} />
                  </div>
                </div>
              </Shell>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userName = homeData.user.name;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes notif{0%,100%{opacity:1}50%{opacity:.15}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes navprogress{0%{width:0%;opacity:1}60%{width:75%}85%{width:88%}100%{width:96%}}
        .hp-navbar{position:fixed;top:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;height:2.5px;z-index:999;pointer-events:none;}
        .hp-navbar-fill{height:100%;background:linear-gradient(90deg,#A78BF5,#7C5CE8);animation:navprogress 2.5s cubic-bezier(.1,0,.2,1) forwards;border-radius:0 2px 2px 0;box-shadow:0 0 8px rgba(167,139,245,.7);}
        .hp-card-tap{transition:transform .12s,opacity .12s;}
        .hp-card-tap:active{transform:scale(.975);opacity:.85;}
        .hp-spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(242,238,255,.25);border-top-color:rgba(242,238,255,.75);border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle;margin-right:7px;}
        @keyframes slideUp{from{transform:translateX(-50%) translateY(100%)}to{transform:translateX(-50%) translateY(0)}}
        .hp-page{min-height:100vh;max-width:430px;margin:0 auto;background:${T.bg};font-family:'Plus Jakarta Sans',-apple-system,sans-serif;color:${T.t1};-webkit-font-smoothing:antialiased;padding-bottom:56px;}
        .hp-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:40;backdrop-filter:blur(10px);}
        .hp-sheet{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:#0E0C18;border-radius:26px 26px 0 0;border-top:.5px solid rgba(155,127,232,.22);box-shadow:0 -16px 60px rgba(0,0,0,.80);z-index:50;animation:slideUp .3s cubic-bezier(.22,1,.36,1);}
        .hp-kbtn{padding:15px 0;border-radius:13px;border:.5px solid rgba(242,238,255,.07);background:rgba(242,238,255,.05);cursor:pointer;font-size:18px;font-weight:600;color:${T.t1};font-family:'Plus Jakarta Sans',sans-serif;transition:background .12s,transform .1s;}
        .hp-kbtn:active{background:rgba(155,127,232,.20);transform:scale(.95);}
        .hp-sec{font-size:11px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;color:${T.t4};padding:18px 20px 9px;}
      `}</style>

      {/* Step log sheet */}
      {showLog && (
        <>
          <div className="hp-overlay" onClick={() => { setShowLog(false); setLogVal(""); setLogError(""); }} />
          <div className="hp-sheet">
            <div style={{ width: 34, height: 4, borderRadius: 99, background: "rgba(242,238,255,.18)", margin: "14px auto 0" }} />
            <div style={{ padding: "20px 20px 6px", textAlign: "center" as const }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.t4, letterSpacing: ".10em", textTransform: "uppercase" as const, marginBottom: 14 }}>Today's steps</p>
              <p style={{ fontSize: 48, fontWeight: 800, color: logError ? T.rose : logVal ? T.t1 : "rgba(242,238,255,.14)", letterSpacing: "-.05em", lineHeight: 1, minHeight: 56, transition: "color .15s" }}>
                {logVal ? parseInt(logVal).toLocaleString() : "—"}
              </p>
              {logError ? (
                <p style={{ fontSize: 12, fontWeight: 600, color: T.rose, marginTop: 10, lineHeight: 1.4 }}>{logError}</p>
              ) : (
                <p style={{ fontSize: 12, fontWeight: 400, color: T.t4, marginTop: 10 }}>
                  {logVal ? (parseInt(logVal) > 50000 ? "Max 50,000 steps" : parseInt(logVal) < 1 ? "Min 1 step" : `${parseInt(logVal).toLocaleString()} steps`) : "Enter your steps"}
                </p>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, padding: "16px 16px 6px" }}>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "000", "⌫"].map(k => (
                <button key={k} className="hp-kbtn" style={{ fontSize: k === "000" ? 13 : 18 }} onClick={() => padPress(k)}>{k}</button>
              ))}
            </div>
            <div style={{ padding: "10px 16px 32px" }}>
              <button
                onClick={confirmLog}
                disabled={!logVal || submitting}
                style={{
                  width: "100%", padding: "15px 0", borderRadius: 14, border: "none",
                  cursor: !logVal || submitting ? "default" : "pointer",
                  background: logError ? "rgba(232,122,138,.15)" : !logVal || submitting ? "rgba(242,238,255,.07)" : T.grad,
                  color: logError ? T.rose : !logVal || submitting ? T.t4 : "#fff", fontSize: 14, fontWeight: 700,
                  letterSpacing: "-.1px", fontFamily: "'Plus Jakarta Sans',sans-serif",
                  boxShadow: !logVal || submitting || logError ? "none" : "0 8px 28px rgba(124,92,232,.40)",
                  transition: "all .18s",
                }}
              >
                {submitting ? (<><span className="hp-spinner" />Saving…</>) : logError ? logError : logVal ? `Save ${parseInt(logVal).toLocaleString()} steps` : "Enter your steps above"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Top navigation progress bar */}
      {navigating && (
        <div className="hp-navbar"><div className="hp-navbar-fill" /></div>
      )}

      {/* Content dim while navigating */}
      {navigating && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8,8,15,.45)", zIndex: 30, pointerEvents: "none", transition: "opacity .2s" }} />
      )}

      <div className="hp-page">
        {/* Header — same style as challenge page */}
        <Header title="GES" showAnimatedWord={true} />

        {/* Greeting */}
        <div style={{ ...fd(0), padding: "18px 20px 6px" }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: T.t4, letterSpacing: ".04em", textTransform: "uppercase" as const, marginBottom: 4 }}>{greeting}</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: T.t1, letterSpacing: "-.6px", lineHeight: 1.05 }}>{userName.split(" ")[0]} <span style={{ color: T.purple }}>👋</span></h1>
        </div>

        {/* AI insight */}
        <AiInsightCard data={homeData} fd={fd} />

        {/* Habits section */}
        <HabitsCard data={homeData} fd={fd} onNavigate={() => navigate(homeData.habits ? "/habits/tree" : "/habits")} />

        {/* Steps challenge */}
        {stepsRefreshing ? (
          <div style={{
            margin: "0 16px 8px", borderRadius: 22, overflow: "hidden",
            background: "rgba(255,255,255,.028)",
            border: ".5px solid rgba(255,255,255,.07)",
          }}>
            <style>{`@keyframes skshimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
            {/* logged-state top row */}
            <div style={{ padding: "16px 18px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                {/* "Logged today" badge pill */}
                <div style={{ width: 110, height: 21, borderRadius: 99, background: "linear-gradient(90deg,rgba(45,212,191,.10) 25%,rgba(45,212,191,.18) 50%,rgba(45,212,191,.10) 75%)", backgroundSize: "200% 100%", animation: "skshimmer 1.6s ease-in-out infinite" }} />
                {/* step count */}
                <div style={{ width: 120, height: 30, borderRadius: 8, marginTop: 12, background: "linear-gradient(90deg,rgba(255,255,255,.06) 25%,rgba(255,255,255,.11) 50%,rgba(255,255,255,.06) 75%)", backgroundSize: "200% 100%", animation: "skshimmer 1.6s 40ms ease-in-out infinite" }} />
                {/* "N to reach goal" line */}
                <div style={{ width: 148, height: 12, borderRadius: 5, marginTop: 10, background: "linear-gradient(90deg,rgba(45,212,191,.08) 25%,rgba(45,212,191,.14) 50%,rgba(45,212,191,.08) 75%)", backgroundSize: "200% 100%", animation: "skshimmer 1.6s 80ms ease-in-out infinite" }} />
                {/* rank line */}
                <div style={{ width: 70, height: 12, borderRadius: 5, marginTop: 16, background: "linear-gradient(90deg,rgba(45,212,191,.07) 25%,rgba(45,212,191,.12) 50%,rgba(45,212,191,.07) 75%)", backgroundSize: "200% 100%", animation: "skshimmer 1.6s 100ms ease-in-out infinite" }} />
              </div>
              {/* arc circle */}
              <div style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(90deg,rgba(45,212,191,.09) 25%,rgba(45,212,191,.16) 50%,rgba(45,212,191,.09) 75%)", backgroundSize: "200% 100%", animation: "skshimmer 1.6s 60ms ease-in-out infinite" }} />
            </div>
            {/* separator */}
            <div style={{ height: .5, background: "rgba(255,255,255,.06)", margin: "0 18px" }} />
            {/* bottom "steps logged · streak" row */}
            <div style={{ padding: "9px 18px 13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ width: 90, height: 13, borderRadius: 5, background: "linear-gradient(90deg,rgba(45,212,191,.08) 25%,rgba(45,212,191,.14) 50%,rgba(45,212,191,.08) 75%)", backgroundSize: "200% 100%", animation: "skshimmer 1.6s 120ms ease-in-out infinite" }} />
              <div style={{ width: 110, height: 13, borderRadius: 5, background: "linear-gradient(90deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.05) 75%)", backgroundSize: "200% 100%", animation: "skshimmer 1.6s 140ms ease-in-out infinite" }} />
            </div>
          </div>
        ) : (
          <StepsCard
            data={homeData}
            showLog={showLog}
            setShowLog={setShowLog}
            animSteps={animSteps}
            animPct={animPct}
            fd={fd}
            onNavigate={() => navigate(homeData.challenge ? `/challanges/${homeData.challenge.id}/steps` : "/challanges")}
          />
        )}

        {/* Wellbeing */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, margin: "0 16px 8px", ...fd(420) }}>
          {[
            {
              color: T.rose, bg: "rgba(232,122,138,.08)", border: "rgba(232,122,138,.18)",
              Icon: <Ic.Body c={T.rose} s={17} />, label: "Body Metrics",
              val: "BMI", unit: "metrics",
              sub: <><span style={{ color: T.rose, fontWeight: 600 }}>Track</span> your body composition</>,
              onClick: () => navigate("/bgmi"),
            },
            {
              color: T.teal, bg: "rgba(56,189,248,.08)", border: "rgba(56,189,248,.18)",
              Icon: <Ic.Breath c={T.teal} s={17} />, label: "Mindfulness",
              val: mindWeekly > 0 ? String(mindWeekly) : "0", unit: "this week",
              sub: mindWeekly > 0
                ? <><span style={{ color: T.teal, fontWeight: 600 }}>Keep it up</span> · breathe &amp; focus</>
                : <><span style={{ color: T.teal, fontWeight: 600 }}>Start</span> your first session</>,
              onClick: () => navigate("/mindfullness"),
            },
          ].map(({ color, bg, border, Icon, label, val, unit, sub, onClick }) => (
            <button key={label}
              onMouseDown={e => e.currentTarget.style.transform = "scale(.98)"}
              onMouseUp={e => e.currentTarget.style.transform = "none"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}
              onClick={onClick}
              style={{
                display: "flex", alignItems: "center", gap: 14, background: bg,
                border: `.5px solid ${border}`, borderRadius: 18, padding: "14px 16px",
                cursor: "pointer", textAlign: "left" as const, width: "100%",
                boxShadow: "0 4px 20px rgba(0,0,0,.40),0 1px 0 rgba(255,255,255,.04) inset",
                fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "transform .15s",
              }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}18`, border: `.5px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: T.t1, marginBottom: 3 }}>{label}</p>
                <p style={{ fontSize: 12, fontWeight: 400, color: T.t3, lineHeight: 1.4 }}>{sub}</p>
              </div>
              <div style={{ textAlign: "right" as const, flexShrink: 0, marginRight: 6 }}>
                <p style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: "-.03em", lineHeight: 1 }}>{val}</p>
                <p style={{ fontSize: 9, fontWeight: 600, color: T.t4, letterSpacing: ".07em", textTransform: "uppercase" as const, marginTop: 2 }}>{unit}</p>
              </div>
              <Ic.ChevR c={T.t4} s={11} />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
