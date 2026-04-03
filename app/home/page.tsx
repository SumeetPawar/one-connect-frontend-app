"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../commponents/Header";
import { api, getCachedUserMe } from "@/lib/api";
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
  grad: "linear-gradient(135deg,#A78BF5 0%,#7C5CE8 100%)",
  purple: "#9B7FE8",
  purpleL: "#C4B0F8",
  green: "#2DD4BF",
  orange: "#F4A261",
  rose: "#E87A8A",
  teal: "#38BDF8",
  t1: "#F2EEFF",
  t2: "rgba(242,238,255,0.65)",
  t3: "rgba(242,238,255,0.38)",
  t4: "rgba(242,238,255,0.20)",
  t5: "rgba(242,238,255,0.09)",
};

// ─── icons ────────────────────────────────────────────────────────────────────
const Ic = {
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

// ─── tree svg ─────────────────────────────────────────────────────────────────
function TreeSvg({ stage, size = 90 }: { stage: 0 | 1 | 2 | 3; size?: number }) {
  const g = "#4ADE9F", gd = "#2A9E6E", br = "#8B6A45", brd = "#6B4E2E";
  if (stage === 0) return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="108" rx="22" ry="6" fill="rgba(139,106,69,.25)" />
      <path d="M58 108 Q57 94 59 84 Q60 78 61 84 Q63 94 62 108Z" fill={br} />
      <path d="M59 88 Q50 80 46 72 Q52 76 59 82Z" fill={gd} opacity=".85" />
      <path d="M61 85 Q70 77 74 69 Q68 74 61 80Z" fill={gd} opacity=".85" />
      <circle cx="60" cy="78" r="5" fill={g} />
      <circle cx="60" cy="75" r="3" fill="#5EE8A8" />
      <circle cx="60" cy="76" r="12" fill="none" stroke="rgba(74,222,159,.22)" strokeWidth="2" />
      <circle cx="60" cy="76" r="18" fill="none" stroke="rgba(74,222,159,.12)" strokeWidth="1.5" />
    </svg>
  );
  if (stage === 1) return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="108" rx="24" ry="6" fill="rgba(139,106,69,.22)" />
      <path d="M56 72 Q54 58 57 46 Q59 38 61 46 Q64 58 63 72Z" fill={br} opacity=".9" />
      <ellipse cx="60" cy="42" rx="18" ry="16" fill={gd} opacity=".9" />
      <ellipse cx="60" cy="36" rx="14" ry="13" fill="#34C47A" />
      <ellipse cx="60" cy="30" rx="10" ry="10" fill={g} />
      <ellipse cx="56" cy="26" rx="5" ry="4" fill="rgba(94,232,168,.55)" />
    </svg>
  );
  if (stage === 2) return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="110" rx="28" ry="7" fill="rgba(139,106,69,.20)" />
      <path d="M54 110 Q52 88 55 72 Q58 62 62 72 Q65 88 66 110Z" fill={brd} />
      <ellipse cx="30" cy="56" rx="15" ry="11" fill={gd} />
      <ellipse cx="90" cy="52" rx="15" ry="11" fill={gd} />
      <ellipse cx="60" cy="44" rx="22" ry="24" fill={gd} />
      <ellipse cx="60" cy="37" rx="18" ry="20" fill="#34C47A" />
      <ellipse cx="60" cy="30" rx="13" ry="15" fill={g} />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="112" rx="32" ry="7" fill="rgba(139,106,69,.18)" />
      <path d="M52 112 Q50 88 53 70 Q56 58 60 58 Q64 58 67 70 Q70 88 68 112Z" fill={brd} />
      <ellipse cx="42" cy="42" rx="12" ry="8" fill="#34C47A" />
      <ellipse cx="78" cy="38" rx="12" ry="8" fill="#34C47A" />
      <ellipse cx="60" cy="35" rx="24" ry="26" fill={gd} />
      <ellipse cx="60" cy="28" rx="20" ry="22" fill="#34C47A" />
      <ellipse cx="60" cy="22" rx="15" ry="17" fill={g} />
      <ellipse cx="60" cy="16" rx="10" ry="12" fill="#5EE8A8" />
      <circle cx="60" cy="11" r="6" fill="#7EFFC0" />
    </svg>
  );
}

const SEP = () => <div style={{ height: ".5px", background: "rgba(242,238,255,.07)", margin: "0 18px" }} />;

// ─── API types ────────────────────────────────────────────────────────────────
type HomeData = {
  steps: { yesterday: number; today: number; daily_target: number; pct: number; step_streak: number };
  challenge: { id: string; rank: number; rank_change: number } | null;
  habits: { challenge_id: number; day_number: number; total_days: number; completed_count: number; total_count: number; all_done: boolean } | null;
  habit_streak: number;
  ai_insight: { badge: string; headline: string; detail: string } | null;
  user: { name: string; profile_pic_url: string | null };
};

// ─── AI Insight card ──────────────────────────────────────────────────────────
function AiInsightCard({ data, fd }: { data: HomeData; fd: (d: number) => React.CSSProperties }) {
  const insight = data.ai_insight;
  const habits = data.habits;
  const week = habits
    ? (habits.day_number <= 7 ? "Week 1" : habits.day_number <= 14 ? "Week 2" : "Week 3")
    : "Week 1";

  const lines = insight
    ? [
        { icon: "◈", color: T.purpleL, text: insight.headline },
        { icon: "◈", color: T.green, text: insight.detail },
        ...(insight.badge ? [{ icon: "◈", color: T.orange, text: insight.badge }] : []),
      ]
    : [
        { icon: "◈", color: T.purpleL, text: `Rank #${data.challenge?.rank ?? "—"} in the team challenge.` },
        { icon: "◈", color: T.green, text: `${data.steps.yesterday.toLocaleString()} steps yesterday. Keep it up!` },
        { icon: "◈", color: T.orange, text: `${data.habit_streak} day habit streak — don't break the chain.` },
      ];

  return (
    <div style={{
      ...fd(40), margin: "16px 16px 0",
      background: "linear-gradient(180deg,rgba(155,127,232,.20) 0%,rgba(124,92,232,.04) 100%)",
      border: ".5px solid rgba(155,127,232,.18)", borderRadius: 20,
      boxShadow: "0 4px 24px rgba(0,0,0,.50),0 1px 0 rgba(242,238,255,.05) inset",
    }}>
      <div style={{ padding: "13px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: T.grad, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(124,92,232,.40)",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2z" /></svg>
          </div>
          <p style={{ fontSize: 9, fontWeight: 700, color: T.purple, letterSpacing: ".12em", textTransform: "uppercase" as const }}>{week} · AI Summary</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {lines.map(({ icon, color, text }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
              <span style={{ fontSize: 8, color, marginTop: 3, flexShrink: 0 }}>{icon}</span>
              <p style={{ fontSize: 12, fontWeight: 400, color: T.t2, lineHeight: 1.5, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── steps card ───────────────────────────────────────────────────────────────
function StepsCard({
  data, showLog, setShowLog, animSteps, animPct, fd,
}: {
  data: HomeData; showLog: boolean; setShowLog: (b: boolean) => void;
  animSteps: number; animPct: number; fd: (d: number) => React.CSSProperties;
}) {
  const { steps, challenge } = data;
  const isLogged = steps.today > 0;
  const hasChallenge = !!challenge;

  const wrap = (accent: string, children: React.ReactNode) => (
    <div style={{
      ...fd(250), margin: "0 16px 12px",
      background: `linear-gradient(180deg,${accent}1E 0%,${accent}05 100%)`,
      border: `.5px solid ${accent}28`, borderRadius: 22, overflow: "hidden",
      boxShadow: "0 8px 40px rgba(0,0,0,.60),0 1px 0 rgba(255,255,255,.05) inset",
    }}>{children}</div>
  );

  if (!hasChallenge) return wrap(T.purple, (
    <div style={{ padding: "22px 20px 18px", position: "relative" as const, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,245,.14) 0%,transparent 70%)", pointerEvents: "none" as const }} />
      <p style={{ fontSize: 9, fontWeight: 700, color: T.purpleL, letterSpacing: ".14em", textTransform: "uppercase" as const, marginBottom: 10 }}>Monthly Team Challenge</p>
      <p style={{ fontSize: 22, fontWeight: 800, color: T.t1, letterSpacing: "-.4px", lineHeight: 1.2, marginBottom: 8 }}>Walk together.<br />Rise together.</p>
      <p style={{ fontSize: 12, fontWeight: 400, color: T.t3, lineHeight: 1.65 }}>Log your daily steps and compete with colleagues.</p>
    </div>
  ));

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
      <p style={{ fontSize: 11, fontWeight: 400, color: T.t3, marginBottom: 18, lineHeight: 1.55 }}>
        Currently rank #{challenge.rank} · target {steps.daily_target.toLocaleString()} steps
      </p>
      <button onClick={() => setShowLog(true)} style={{
        width: "100%", padding: "15px 0", borderRadius: 14, border: "none",
        cursor: "pointer", background: T.grad, color: "#fff", fontSize: 14, fontWeight: 700,
        letterSpacing: "-.1px", fontFamily: "'Syne',sans-serif",
        boxShadow: "0 8px 28px rgba(124,92,232,.40),0 1px 0 rgba(255,255,255,.14) inset",
      }}>Log Today's Steps</button>
    </div>
  ));

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
              <span style={{ fontSize: 9, fontWeight: 700, color: T.green, letterSpacing: ".10em", textTransform: "uppercase" as const }}>Logged today</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 4 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: T.t1, letterSpacing: "-.04em", lineHeight: 1 }}>{animSteps.toLocaleString()}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.t3 }}>steps</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Ic.Up c={T.green} s={8} />
              <span style={{ fontSize: 10, fontWeight: 600, color: T.green }}>
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
          <span style={{ fontSize: 12, fontWeight: 600, color: T.green }}>Rank #{challenge.rank}</span>
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
        <span style={{ fontSize: 11, fontWeight: 600, color: T.green }}>Steps logged ✓</span>
        <span style={{ fontSize: 11, fontWeight: 400, color: T.t3 }}>{steps.step_streak} day streak</span>
      </div>
    </>
  ));
}

// ─── habits card ──────────────────────────────────────────────────────────────
function HabitsCard({ data, fd }: { data: HomeData; fd: (d: number) => React.CSSProperties }) {
  const { habits, habit_streak } = data;

  const base: React.CSSProperties = {
    ...fd(180), margin: "0 16px 12px", borderRadius: 22, overflow: "hidden",
    boxShadow: "0 8px 40px rgba(0,0,0,.60),0 1px 0 rgba(255,255,255,.05) inset",
  };

  if (!habits) return (
    <div style={{
      ...base,
      background: "linear-gradient(180deg,rgba(167,139,245,.22) 0%,rgba(124,92,232,.06) 60%,rgba(74,222,159,.03) 100%)",
      border: ".5px solid rgba(155,127,232,.20)",
    }}>
      <div style={{ padding: "22px 20px 20px" }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: T.purpleL, letterSpacing: ".14em", textTransform: "uppercase" as const, marginBottom: 10 }}>21-Day Habit Challenge</p>
        <p style={{ fontSize: 21, fontWeight: 800, color: T.t1, letterSpacing: "-.4px", lineHeight: 1.25, marginBottom: 8 }}>Grow your tree.<br />Grow yourself.</p>
        <p style={{ fontSize: 12, fontWeight: 400, color: T.t3, lineHeight: 1.65 }}>Pick your daily habits. Every habit you log grows your tree — one branch at a time.</p>
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
    <div style={{
      ...base,
      background: "linear-gradient(180deg,rgba(155,127,232,.18) 0%,rgba(124,92,232,.04) 100%)",
      border: ".5px solid rgba(155,127,232,.18)",
    }}>
      <div style={{ background: heroBg, padding: "16px 18px 14px", position: "relative" as const, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle,${all_done ? "rgba(45,212,191,.10)" : "rgba(167,139,245,.10)"} 0%,transparent 70%)`, pointerEvents: "none" as const }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1, paddingRight: 10 }}>
            {all_done ? (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(45,212,191,.12)", border: ".5px solid rgba(45,212,191,.24)", borderRadius: 99, padding: "3px 10px", marginBottom: 10 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.green }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: T.green, letterSpacing: ".08em", textTransform: "uppercase" as const }}>Day {day_number} complete</span>
              </div>
            ) : (
              <p style={{ fontSize: 9, fontWeight: 700, color: T.purpleL, letterSpacing: ".12em", textTransform: "uppercase" as const, marginBottom: 8 }}>My Habits</p>
            )}
            <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 10 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: T.t1, letterSpacing: "-.04em", lineHeight: 1 }}>Day {day_number}</span>
              <span style={{ fontSize: 12, fontWeight: 400, color: T.t3 }}>of {total_days}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 88, height: 3, background: "rgba(155,127,232,.14)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: T.grad, borderRadius: 99 }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: T.purple }}>{pct}%</span>
            </div>
            {all_done ? (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                <span style={{ fontSize: 11, fontWeight: 600, color: T.green }}>All {total_count} habits kept today</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.orange }} />
                <span style={{ fontSize: 11, fontWeight: 400, color: T.t3 }}>
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
          <div style={{ padding: "11px 18px 13px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 400, color: T.t3 }}>Today's progress</span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: total_count }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i < completed_count ? "linear-gradient(90deg,#A78BF5,#7C5CE8)" : "rgba(242,238,255,.09)" }} />
              ))}
            </div>
          </div>
        </>
      )}

      <SEP />
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px 13px" }}>
        <Ic.Flame c={T.orange} s={12} />
        <span style={{ fontSize: 11, fontWeight: 400, color: T.t2 }}>
          Showing up for <span style={{ color: T.orange, fontWeight: 700 }}>{habit_streak} days</span> in a row
        </span>
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
  const [submitting, setSubmitting] = useState(false);

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
            habit_streak: 0,
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
    if (k === "⌫") setLogVal(v => v.slice(0, -1));
    else if (logVal.length < 6) setLogVal(v => v + k);
  };

  const confirmLog = async () => {
    if (!logVal || !homeData?.challenge?.id) return;
    setSubmitting(true);
    try {
      await api(`/api/challenges/${homeData.challenge.id}/steps`, {
        method: "POST",
        body: JSON.stringify({ steps: parseInt(logVal) }),
      });
      router.push(`/challanges/${homeData.challenge.id}/steps`);
    } catch {
      setShowLog(false);
      setLogVal("");
    } finally {
      setSubmitting(false);
    }
  };

  // ── loading skeleton ───────────────────────────────────────────────────────
  if (loading || !homeData) {
    return (
      <div style={{ minHeight: "100vh", width: "100%", backgroundColor: T.bg }}>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        <div style={{ padding: "20px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ width: 80, height: 22, borderRadius: 8, background: "linear-gradient(90deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.10) 50%,rgba(255,255,255,.05) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(90deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.10) 50%,rgba(255,255,255,.05) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
        </div>
        <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 120, borderRadius: 22, background: "linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
          ))}
        </div>
      </div>
    );
  }

  const userName = homeData.user.name;
  const initials = userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes notif{0%,100%{opacity:1}50%{opacity:.15}}
        @keyframes slideUp{from{transform:translateX(-50%) translateY(100%)}to{transform:translateX(-50%) translateY(0)}}
        .hp-page{min-height:100vh;max-width:430px;margin:0 auto;background:${T.bg};font-family:'Syne',-apple-system,sans-serif;color:${T.t1};-webkit-font-smoothing:antialiased;padding-bottom:56px;}
        .hp-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:40;backdrop-filter:blur(10px);}
        .hp-sheet{position:fixed;bottom:0;left:50%;width:100%;max-width:430px;background:#0E0C18;border-radius:26px 26px 0 0;border-top:.5px solid rgba(155,127,232,.22);box-shadow:0 -16px 60px rgba(0,0,0,.80);z-index:50;animation:slideUp .3s cubic-bezier(.22,1,.36,1);}
        .hp-kbtn{padding:15px 0;border-radius:13px;border:.5px solid rgba(242,238,255,.07);background:rgba(242,238,255,.05);cursor:pointer;font-size:18px;font-weight:600;color:${T.t1};font-family:'Syne',sans-serif;transition:background .12s,transform .1s;}
        .hp-kbtn:active{background:rgba(155,127,232,.20);transform:scale(.95);}
        .hp-sec{font-size:9px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:${T.t4};padding:18px 20px 8px;}
      `}</style>

      {/* Step log sheet */}
      {showLog && (
        <>
          <div className="hp-overlay" onClick={() => setShowLog(false)} />
          <div className="hp-sheet">
            <div style={{ width: 34, height: 4, borderRadius: 99, background: "rgba(242,238,255,.18)", margin: "14px auto 0" }} />
            <div style={{ padding: "20px 20px 6px", textAlign: "center" as const }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: T.t4, letterSpacing: ".13em", textTransform: "uppercase" as const, marginBottom: 14 }}>Today's steps</p>
              <p style={{ fontSize: 48, fontWeight: 800, color: logVal ? T.t1 : "rgba(242,238,255,.14)", letterSpacing: "-.05em", lineHeight: 1, minHeight: 56 }}>
                {logVal ? parseInt(logVal).toLocaleString() : "—"}
              </p>
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
                  background: !logVal || submitting ? "rgba(242,238,255,.07)" : T.grad,
                  color: !logVal || submitting ? T.t4 : "#fff", fontSize: 14, fontWeight: 700,
                  letterSpacing: "-.1px", fontFamily: "'Syne',sans-serif",
                  boxShadow: !logVal || submitting ? "none" : "0 8px 28px rgba(124,92,232,.40)",
                  transition: "all .18s",
                }}
              >
                {submitting ? "Saving…" : logVal ? `Save ${parseInt(logVal).toLocaleString()} steps` : "Enter your steps above"}
              </button>
            </div>
          </div>
        </>
      )}

      <div className="hp-page">
        {/* Header — same style as challenge page */}
        <Header title="GES" showAnimatedWord={true} />

        {/* Greeting subheader */}
        <div style={{ ...fd(0), padding: "16px 20px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: T.t3, marginBottom: 3, letterSpacing: ".01em" }}>{greeting}</p>
            <h1 style={{ fontSize: 23, fontWeight: 800, color: T.t1, letterSpacing: "-.4px", lineHeight: 1.1 }}>{userName.split(" ")[0]}</h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 11, background: T.grad,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#fff",
              boxShadow: "0 4px 16px rgba(124,92,232,.40)", letterSpacing: ".02em",
            }}>{initials}</div>
          </div>
        </div>

        {/* AI insight */}
        <AiInsightCard data={homeData} fd={fd} />

        {/* Habits section */}
        <p className="hp-sec" style={fd(130)}>My Habits</p>
        <HabitsCard data={homeData} fd={fd} />

        {/* Steps challenge */}
        <p className="hp-sec" style={fd(250)}>Monthly Team Challenge</p>
        <StepsCard
          data={homeData}
          showLog={showLog}
          setShowLog={setShowLog}
          animSteps={animSteps}
          animPct={animPct}
          fd={fd}
        />

        {/* Wellbeing */}
        <p className="hp-sec" style={fd(390)}>Wellbeing</p>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, margin: "0 16px", ...fd(420) }}>
          {[
            {
              color: T.rose, bg: "rgba(232,122,138,.08)", border: "rgba(232,122,138,.18)",
              Icon: <Ic.Body c={T.rose} s={16} />, label: "Body Metrics",
              sub: "Track your body composition",
              onClick: () => router.push("/bgmi"),
            },
            {
              color: T.teal, bg: "rgba(56,189,248,.08)", border: "rgba(56,189,248,.18)",
              Icon: <Ic.Breath c={T.teal} s={16} />, label: "Mindfulness",
              sub: "Calm & focus",
              onClick: () => router.push("/mindfullness"),
            },
          ].map(({ color, bg, border, Icon, label, sub, onClick }) => (
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
                fontFamily: "'Syne',sans-serif", transition: "transform .15s",
              }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}18`, border: `.5px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: T.t1, marginBottom: 3 }}>{label}</p>
                <p style={{ fontSize: 11, fontWeight: 400, color: T.t3, lineHeight: 1.4 }}>{sub}</p>
              </div>
              <Ic.ChevR c={T.t4} s={11} />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
