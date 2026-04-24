"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "../commponents/Header";
import { api, addSteps, getCachedUserMe } from "@/lib/api";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { BottomNav } from "../components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { isGoogleFitConnected, fetchStepsFromServer, setGoogleFitConnected, startGoogleFitAuth } from "@/lib/googleFit";

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
  t2: "rgba(242,238,255,0.82)", // was 0.65
  t3: "rgba(242,238,255,0.60)", // was 0.38
  t4: "rgba(242,238,255,0.36)", // was 0.20
  t5: "rgba(242,238,255,0.18)", // was 0.09
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
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
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
  challenge: { id: string; rank: number; previous_rank?: number; rank_change: number; total_participants?: number } | null;
  step_challenge: { id: string; rank: number; previous_rank?: number; rank_change: number; total_participants?: number } | null;
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

// ─── Feedback trigger + bottom sheet ─────────────────────────────────────────
function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"suggestion"|"bug"|"other">("suggestion");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const close = () => { setOpen(false); };
  const reset = () => { setTitle(""); setBody(""); setRating(0); setType("suggestion"); setDone(false); };

  const submit = async () => {
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      await fetch(`${base}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ type, title: title.trim(), body: body.trim(), rating: rating || undefined, meta: { screen: window.location.pathname, app_version: "1.0.0" } }),
      });
    } catch { /* ignore */ }
    setSubmitting(false);
    setDone(true);
    setTimeout(() => { close(); reset(); }, 1800);
  };

  return (
    <>
      {/* Subtle text link at page bottom */}
      <div style={{ textAlign: "center" as const, padding: "4px 0 32px" }}>
        <button onClick={() => setOpen(true)} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 12, color: T.t4, letterSpacing: ".02em",
          textDecoration: "underline", textDecorationColor: "rgba(255,255,255,.12)",
          textUnderlineOffset: 3,
        }}>
          Share feedback or suggestion
        </button>
      </div>

      {/* Bottom sheet */}
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.72)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={() => { close(); reset(); }}>
          <div style={{ background: "#0E0C18", borderRadius: "20px 20px 0 0", border: ".5px solid rgba(155,127,232,.22)", padding: "20px 20px 44px", width: "100%", maxWidth: 480, boxShadow: "0 -8px 40px rgba(0,0,0,.7)" }}
            onClick={e => e.stopPropagation()}>

            <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,.12)", margin: "0 auto 18px" }} />

            {done ? (
              <div style={{ textAlign: "center" as const, padding: "20px 0" }}>
                <p style={{ fontSize: 28, margin: "0 0 8px" }}>✓</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: T.t1, margin: "0 0 4px" }}>Thanks!</p>
                <p style={{ fontSize: 13, color: T.t3, margin: 0 }}>We read every submission.</p>
              </div>
            ) : (<>
              <p style={{ fontSize: 18, fontWeight: 700, color: T.t1, margin: "0 0 4px", letterSpacing: "-.3px" }}>Send Feedback</p>
              <p style={{ fontSize: 13, color: T.t3, margin: "0 0 16px" }}>Suggestions, bugs, or anything on your mind.</p>

              <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
                {(["suggestion","bug","other"] as const).map(t => (
                  <button key={t} onClick={() => setType(t)} style={{
                    padding: "5px 13px", borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer",
                    background: type === t ? "rgba(155,127,232,.2)" : "rgba(255,255,255,.05)",
                    border: `.5px solid ${type === t ? "rgba(155,127,232,.5)" : "rgba(255,255,255,.1)"}`,
                    color: type === t ? T.purpleL : T.t3, textTransform: "capitalize" as const,
                  }}>{t}</button>
                ))}
              </div>

              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Short title"
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, marginBottom: 10, background: "rgba(255,255,255,.05)", border: `.5px solid ${title ? "rgba(155,127,232,.35)" : "rgba(255,255,255,.1)"}`, color: T.t1, fontSize: 14, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit" }} />

              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Tell us more…" rows={3}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 12, marginBottom: 14, background: "rgba(255,255,255,.05)", border: `.5px solid ${body ? "rgba(155,127,232,.35)" : "rgba(255,255,255,.1)"}`, color: T.t1, fontSize: 14, outline: "none", resize: "none" as const, boxSizing: "border-box" as const, fontFamily: "inherit", lineHeight: 1.5 }} />

              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setRating(s === rating ? 0 : s)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 22, color: T.orange, opacity: s <= rating ? 1 : 0.18, transition: "opacity .15s" }}>★</button>
                ))}
                {rating > 0 && <span style={{ fontSize: 11, color: T.t3, marginLeft: 4 }}>{["","Poor","Fair","Good","Great","Excellent"][rating]}</span>}
              </div>

              <button onClick={submit} disabled={submitting || !title.trim() || !body.trim()} style={{
                width: "100%", padding: 14, borderRadius: 14, border: "none",
                background: title.trim() && body.trim() ? "linear-gradient(135deg,rgba(155,127,232,.5),rgba(124,58,237,.7))" : "rgba(255,255,255,.07)",
                color: title.trim() && body.trim() ? T.t1 : T.t4,
                fontSize: 14, fontWeight: 700, cursor: title.trim() && body.trim() ? "pointer" : "default",
                opacity: submitting ? .7 : 1, transition: "all .2s",
              }}>{submitting ? "Sending…" : "Submit"}</button>
            </>)}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Daily Carousel ───────────────────────────────────────────────────────────
const FEATURED_FEEDS = [
  {
    id: "p1",
    accent: "#5DCFFF",
    emoji: "🏃",
    tag: "Event",
    title: "Sunrise Step Challenge — Week 3 Closing Walk",
    meta: "Tomorrow · 6:00 AM · Riverside Park",
    reactions: 64, comments: 23,
    authorInitials: "AR", authorColor: "#5DCFFF", author: "Ananya R.",
    coverImage: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=900&q=80&fit=crop",
  },
  {
    id: "p3",
    accent: "#4CD97B",
    emoji: "🗳️",
    tag: "Poll",
    title: "Which time works best for the Q2 team offsite?",
    meta: "Closes in 2h · 36 votes",
    reactions: 12, comments: 9,
    authorInitials: "SM", authorColor: "#4CD97B", author: "Sachin M.",
    coverImage: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=900&q=80&fit=crop",
  },
  {
    id: "p4",
    accent: "#C4B0F8",
    emoji: "💡",
    tag: "Wellness Tip",
    title: "Two minutes of breathing before 3pm meetings",
    meta: "Wellness Team · 3h ago",
    reactions: 55, comments: 7,
    authorInitials: "WT", authorColor: "#C4B0F8", author: "Wellness Team",
    coverImage: "https://images.unsplash.com/photo-1544216717-3bbf52512659?w=900&q=80&fit=crop",
  },
  {
    id: "p5",
    accent: "#4CD97B",
    emoji: "🚶",
    tag: "Poll",
    title: "Should we make walking 1:1s a permanent team ritual?",
    meta: "Team Wellness · Vote now",
    reactions: 41, comments: 18,
    authorInitials: "TW", authorColor: "#4CD97B", author: "Team Wellness",
    coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80&fit=crop",
  },
];

const TOTAL_SLIDES = 2; // summary + first feed only

const SLIDE_VARIANTS = {
  enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0, scale: 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: d > 0 ? "-32%" : "32%", opacity: 0, scale: 0.97 }),
};
const SLIDE_TRANSITION = { type: "spring" as const, stiffness: 380, damping: 38, mass: 0.75 };

function DailyCarousel({ data, fd, onNavigate, greeting, userName }: {
  data: HomeData;
  fd: (d: number) => React.CSSProperties;
  onNavigate: (path: string) => void;
  greeting: string;
  userName: string;
}) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(0);
  const pauseRef = useRef(false);
  const idxRef  = useRef(0);  // mirror of idx for use inside timer without stale closure

  // Keep idxRef in sync
  useEffect(() => { idxRef.current = idx; }, [idx]);

  const goTo = (next: number) => {
    if (next === idx || next < 0 || next >= TOTAL_SLIDES) return;
    pauseRef.current = true;
    setTimeout(() => { pauseRef.current = false; }, 8000);
    setDir(next > idx ? 1 : -1);
    setIdx(next);
  };

  // Auto-advance: first slide 7 s, others 4 s; pause on drag/touch
  useEffect(() => {
    const FIRST_DELAY = 7000;
    const REST_DELAY  = 4000;
    let timer: ReturnType<typeof setTimeout>;

    const advance = () => {
      if (!pauseRef.current) {
        const next = (idxRef.current + 1) % TOTAL_SLIDES;
        setDir(1);
        setIdx(next);
        // schedule next tick based on the slide we just moved TO
        timer = setTimeout(advance, next === 0 ? FIRST_DELAY : REST_DELAY);
      } else {
        // paused — check again in 500 ms without advancing
        timer = setTimeout(advance, 500);
      }
    };

    // first tick uses first-slide delay
    timer = setTimeout(advance, FIRST_DELAY);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    pauseRef.current = false;
    if (Math.abs(info.offset.x) > 48 || Math.abs(info.velocity.x) > 380) {
      if (info.offset.x < 0) goTo(idx + 1);
      else goTo(idx - 1);
    }
  };

  // ── AI insight for slide 0 ──────────────────────────────────────────────────
  const insight = data.ai_insight;
  const habits = data.habits;
  const hasMeaningfulData = (data.steps?.yesterday ?? 0) > 0 || (habits?.yesterday_completed ?? 0) > 0;
  const COACH = [
    { headline: "Today is a perfect day to start fresh.", detail: "Your habits are waiting. All it takes is showing up.", hook: "Small steps build big streaks." },
    { headline: "Every great streak started with one day.", detail: "Get back into motion quickly — that's the whole game.", hook: "Begin. The rest follows." },
    { headline: "You're one good day away from momentum.", detail: "Check off a habit and you'll feel that spark again.", hook: "Done beats perfect, every time." },
    { headline: "Champions have quiet days too.", detail: "What matters is how fast you get back.", hook: "Your streak is waiting." },
  ];
  const coach = COACH[0];
  const isCoachMode = !insight || !hasMeaningfulData;
  const aiHeadline = insight
    ? (insight.segments ? insight.segments.map(s => s.text).join("") : insight.headline ?? coach.headline)
    : coach.headline;
  const aiDetail = insight
    ? (typeof insight.detail === "string" ? insight.detail : Array.isArray(insight.detail) ? (insight.detail as { text: string }[]).map(s => s.text).join("") : coach.detail)
    : coach.detail;
  const aiHook = insight?.hook ?? coach.hook;
  const aiBadge = toStr(insight?.badge) || (isCoachMode ? "Your Move" : "AI Insight");

  const feed = idx > 0 ? FEATURED_FEEDS[idx - 1] : null;

  return (
    <div style={{ ...fd(60), margin: "12px 0 0", padding: "0 8px" }}>
      {/* Card shell */}
      <div style={{
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        height: 230,
        boxShadow: "0 16px 48px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.06) inset",
        userSelect: "none",
      }}>
        {/* Dot indicators — above slides */}
        <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 5, zIndex: 10, pointerEvents: "none" }}>
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === idx ? 20 : 6, height: 6, borderRadius: 999,
                background: i === idx ? "#fff" : "rgba(255,255,255,0.32)",
                transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)",
                pointerEvents: "auto",
                cursor: "pointer",
              }}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <AnimatePresence custom={dir} initial={false}>
          <motion.div
            key={idx}
            custom={dir}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={SLIDE_TRANSITION}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.07}
            onDragStart={() => { pauseRef.current = true; }}
            onDragEnd={handleDragEnd}
            style={{ position: "absolute", inset: 0, cursor: "default" }}
          >
            {/* ── Background ── */}
            {feed ? (
              <>
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `url(${feed.coverImage})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                }} />
                {/* Deep bottom scrim */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.42) 48%, rgba(0,0,0,0.08) 100%)",
                }} />
                {/* Accent colour tint top-left */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: `linear-gradient(135deg, ${feed.accent}22 0%, transparent 55%)`,
                }} />
              </>
            ) : (
              <>
                {/* Motivational background photo */}
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: "url(https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=900&q=80&fit=crop)",
                  backgroundSize: "cover", backgroundPosition: "center 30%",
                }} />
                {/* Purple tint overlay to match brand */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(160deg, rgba(60,20,120,0.72) 0%, rgba(30,10,70,0.55) 50%, rgba(10,5,30,0.80) 100%)",
                }} />
                {/* Bottom scrim for text */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0) 100%)",
                }} />
                {/* Subtle purple glow top-right */}
                <div style={{
                  position: "absolute", top: -60, right: -60,
                  width: 260, height: 260, borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(155,127,232,0.30) 0%, transparent 65%)",
                  pointerEvents: "none",
                }} />
              </>
            )}

            {/* ── SLIDE 0: Greeting + AI Insight / Coach ── */}
            {idx === 0 && (
              <div style={{ position: "absolute", inset: 0, padding: "16px 20px 18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                {/* Top — greeting */}
                <div>
                  <p style={{
                    fontSize: 11, fontWeight: 500, letterSpacing: "0.06em",
                    textTransform: "uppercase" as const,
                    color: "rgba(255,255,255,0.50)",
                    margin: "0 0 3px",
                  }}>{greeting}</p>
                  <h2 style={{
                    fontSize: 26, fontWeight: 800, color: "#fff",
                    letterSpacing: "-0.04em", lineHeight: 1.05,
                    margin: 0,
                    textShadow: "0 2px 12px rgba(0,0,0,0.55)",
                  }}>
                    {userName} <span style={{ fontSize: 22 }}>👋</span>
                  </h2>
                </div>

                {/* Bottom — AI insight */}
                <div>
                  {/* Badge */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: isCoachMode ? "rgba(251,146,60,0.18)" : "rgba(155,127,232,0.18)",
                    border: `1px solid ${isCoachMode ? "rgba(251,146,60,0.40)" : "rgba(155,127,232,0.40)"}`,
                    borderRadius: 999, padding: "3px 11px", marginBottom: 8,
                    backdropFilter: "blur(10px)",
                  }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: isCoachMode ? T.orange : T.purple,
                      boxShadow: `0 0 6px ${isCoachMode ? T.orange : T.purple}`,
                    }} />
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.10em",
                      textTransform: "uppercase" as const,
                      color: isCoachMode ? T.orange : T.purpleL,
                    }}>{aiBadge}</span>
                  </div>

                  <p style={{
                    fontSize: 15, fontWeight: 700, color: "#fff",
                    letterSpacing: "-0.025em", lineHeight: 1.3,
                    margin: "0 0 6px",
                    textShadow: "0 1px 8px rgba(0,0,0,0.5)",
                  }}>{aiHeadline}</p>
                  <p style={{
                    fontSize: 12, color: "rgba(255,255,255,0.58)",
                    lineHeight: 1.5, margin: "0 0 6px",
                  }}>{aiDetail}</p>
                  {aiHook && (
                    <p style={{
                      fontSize: 11, fontWeight: 600,
                      color: isCoachMode ? T.orange : T.teal,
                      margin: 0,
                    }}>{aiHook}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── SLIDES 1+: Feed Posts ── */}
            {feed && (
              <div style={{ position: "absolute", inset: 0, padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                {/* Tag pill */}
                <div style={{ alignSelf: "flex-start" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const,
                    color: feed.accent,
                    background: "rgba(0,0,0,0.50)",
                    border: `1px solid ${feed.accent}60`,
                    padding: "4px 11px", borderRadius: 999,
                    backdropFilter: "blur(10px)",
                  }}>{feed.emoji} {feed.tag}</span>
                </div>

                {/* Bottom content */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: `linear-gradient(135deg,${feed.authorColor} 0%,${feed.authorColor}80 100%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700, color: "#fff",
                      border: "1.5px solid rgba(255,255,255,0.22)",
                    }}>{feed.authorInitials}</div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.68)" }}>{feed.author}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: "auto" }}>{feed.meta.split("·").pop()?.trim()}</span>
                  </div>
                  <h3 style={{
                    fontSize: 19, fontWeight: 800, color: "#fff",
                    letterSpacing: "-0.035em", lineHeight: 1.25,
                    margin: "0 0 12px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden",
                    textShadow: "0 2px 12px rgba(0,0,0,0.55)",
                  }}>{feed.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                      {feed.reactions}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      {feed.comments}
                    </span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: feed.accent, display: "flex", alignItems: "center", gap: 3 }}>
                      View post
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
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
        ...fd(40), margin: "14px 8px 8px",
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
      ...fd(40), margin: "14px 8px 8px",
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
          <p style={{ fontSize: 11, fontWeight: 500, color: T.green, marginTop: 8, lineHeight: 1.5 }}>
            {toStr(insight.hook)}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── steps card ───────────────────────────────────────────────────────────────
function StepsCard({
  data, latestChallenge, showLog, setShowLog, animSteps, animPct, fd, onNavigate, onJoin, gfitConn,
}: {
  data: HomeData;
  latestChallenge: { id: string; title: string; description: string; participant_count?: number } | null;
  showLog: boolean; setShowLog: (b: boolean) => void;
  animSteps: number; animPct: number; fd: (d: number) => React.CSSProperties;
  onNavigate: () => void;
  onJoin: () => void;
  gfitConn?: { label: string; syncing: boolean; syncFn: () => void } | null;
}) {
  const { steps, challenge } = data;
  const isLogged = steps.today > 0;
  // Only treat as enrolled if challenge object exists and has a non-null id
  const hasChallenge = !!(challenge && challenge.id);
  const isEvening = new Date().getHours() >= 17;
  const hitGoal = steps.today >= steps.daily_target;

  // confetti + vibration — fires once, after count animation settles
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const confettiFired = useRef(false);
  useEffect(() => {
    if (!hitGoal || !isLogged || confettiFired.current) return;
    const timer = setTimeout(() => {
      const canvas = confettiRef.current;
      if (!canvas) return;
      confettiFired.current = true;

      // vibrate on goal hit
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([80, 40, 120, 40, 60]);
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const W = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 340;
      const H = canvas.offsetHeight || canvas.parentElement?.offsetHeight || 180;
      canvas.width = W;
      canvas.height = H;

      // Premium palette — golds, teals, soft purples, champagne whites
      const COLORS = [
        "#FFD700", "#FFC940", "#FFEFA0",   // golds
        "#40C8E0", "#64D2FF",               // teals
        "#C4B0F8", "#A78BF5",               // lavenders
        "rgba(255,255,255,0.90)",           // bright white
        "#2DD4BF",                          // accent teal
      ];

      type P = {
        x: number; y: number; vx: number; vy: number;
        color: string; w: number; h: number;
        rot: number; rv: number; opacity: number;
        type: "rect" | "circle" | "star";
      };

      // Premium dual-cannon burst from both bottom corners
      const types: Array<"rect" | "circle" | "star"> = ["rect", "rect", "rect", "circle", "circle", "star"];
      const particles: P[] = Array.from({ length: 120 }, (_, i) => {
        const fromLeft = i < 60;
        // Left cannon shoots upward-right fan (30°–80° from horizontal)
        // Right cannon mirrors — upward-left fan (100°–150°)
        const angleMin = fromLeft ? Math.PI * (1/6)  : Math.PI * (5/12);  // 30° : 75°  (in π units from right)
        const angleMax = fromLeft ? Math.PI * (5/12) : Math.PI * (2/3);   // 75° : 120°
        // Remap: we want shooting UPward so negate vy — use standard math angles
        // Left: angle 30–80° above horizontal → vx +, vy -
        // Right: angle 100–150° above horizontal → vx -, vy -
        const spreadL = (30 + Math.random() * 50) * (Math.PI / 180);  // 30°–80°
        const spreadR = (100 + Math.random() * 50) * (Math.PI / 180); // 100°–150°
        const angle = fromLeft ? spreadL : spreadR;
        const spd = 2.2 + Math.random() * 4.2;
        // Stagger spawn x slightly — not just corners but along bottom edge
        const xL = W * 0.02 + Math.random() * W * 0.18;
        const xR = W * 0.80 + Math.random() * W * 0.18;
        return {
          x: fromLeft ? xL : xR,
          y: H * 0.92 + Math.random() * H * 0.06,
          vx: Math.cos(angle) * spd,
          vy: -Math.abs(Math.sin(angle) * spd),  // always shoot upward
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          w: 4 + Math.random() * 8,
          h: 2 + Math.random() * 4,
          rot: Math.random() * Math.PI * 2,
          rv: (Math.random() - 0.5) * 0.15,
          opacity: 0.85 + Math.random() * 0.15,
          type: types[Math.floor(Math.random() * types.length)],
        };
      });

      let frame = 0;
      const TOTAL = 320;
      const FADE_START = 210;

      const drawStar = (ctx: CanvasRenderingContext2D, r: number) => {
        const spikes = 4, outer = r, inner = r * 0.45;
        ctx.beginPath();
        for (let s = 0; s < spikes * 2; s++) {
          const a = (s * Math.PI) / spikes - Math.PI / 2;
          const rad = s % 2 === 0 ? outer : inner;
          ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        ctx.closePath();
        ctx.fill();
      };

      const tick = () => {
        if (frame >= TOTAL) { ctx.clearRect(0, 0, W, H); return; }
        ctx.clearRect(0, 0, W, H);
        const fade = frame < FADE_START ? 1 : 1 - (frame - FADE_START) / (TOTAL - FADE_START);
        for (const p of particles) {
          p.x  += p.vx;
          p.y  += p.vy;
          p.vy += 0.055;   // gentle gravity
          p.vx *= 0.993;
          p.rot += p.rv;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity * fade);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          if (p.type === "circle") {
            ctx.beginPath();
            ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === "star") {
            drawStar(ctx, p.w / 2);
          } else {
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          }
          ctx.restore();
        }
        frame++;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 1400);
    return () => clearTimeout(timer);
  }, [hitGoal, isLogged]);

  const wrap = (accent: string, children: React.ReactNode, tappable = false) => (
    <div
      className={tappable ? "hp-card-tap" : undefined}
      onClick={tappable ? onNavigate : undefined}
      style={{
        ...fd(250), margin: "0 8px 8px",
        position: "relative" as const,
        background: hitGoal
          ? "linear-gradient(160deg,rgba(8,26,18,.98) 0%,rgba(6,18,12,.99) 55%,rgba(8,8,15,.99) 100%)"
          : `linear-gradient(180deg,${accent}1E 0%,${accent}05 100%)`,
        border: hitGoal ? "1px solid rgba(52,211,153,.45)" : `.5px solid ${accent}28`,
        borderRadius: 22, overflow: "hidden",
        boxShadow: hitGoal
          ? "0 0 0 1px rgba(52,211,153,.12), 0 12px 48px rgba(0,0,0,.75), 0 0 60px rgba(52,211,153,.08)"
          : "0 8px 40px rgba(0,0,0,.60),0 1px 0 rgba(255,255,255,.05) inset",
        transition: "all 1.4s cubic-bezier(.4,0,.2,1)",
        cursor: tappable ? "pointer" : undefined,
      }}>{children}</div>
  );

  if (!hasChallenge) return (
    <div
      className="hp-card-tap"
      onClick={onJoin}
      style={{
        ...fd(250), margin: "0 8px 8px", borderRadius: 22, overflow: "hidden",
        position: "relative" as const, cursor: "pointer",
        background: "linear-gradient(145deg,#1A0F2E 0%,#100E1A 60%,#0D0B18 100%)",
        border: ".5px solid rgba(155,127,232,.28)",
        boxShadow: "0 12px 48px rgba(0,0,0,.70),0 1px 0 rgba(167,139,245,.08) inset",
      }}
    >
      {/* Ambient glow blobs */}
      <div style={{ position: "absolute", top: -60, right: -40, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,92,232,.28) 0%,transparent 70%)", pointerEvents: "none" as const }} />
      <div style={{ position: "absolute", bottom: -40, left: -20, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,245,.12) 0%,transparent 70%)", pointerEvents: "none" as const }} />

      <div style={{ padding: "22px 20px 20px", position: "relative" as const }}>

        {/* Top row — badge + participant count */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "rgba(167,139,245,.12)", border: ".5px solid rgba(167,139,245,.30)",
            borderRadius: 99, padding: "4px 11px",
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.purple, boxShadow: `0 0 5px ${T.purple}` }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: T.purpleL, letterSpacing: ".09em", textTransform: "uppercase" as const }}>
              Team Challenge
            </span>
          </div>
          {(latestChallenge?.participant_count ?? 0) > 0 && (
            <span style={{ fontSize: 11, fontWeight: 500, color: T.t3 }}>
              <span style={{ color: T.purpleL, fontWeight: 700 }}>{latestChallenge!.participant_count}</span> joined
            </span>
          )}
        </div>

        {/* Headline */}
        <p style={{
          fontSize: 23, fontWeight: 800, color: T.t1,
          letterSpacing: "-.5px", lineHeight: 1.2, marginBottom: 8,
        }}>
          {latestChallenge?.title ?? "Walk together.\nRise together."}
        </p>

        {/* Description */}
        <p style={{ fontSize: 13, fontWeight: 400, color: T.t3, lineHeight: 1.65, marginBottom: 20 }}>
          {latestChallenge?.description ?? "Log your daily steps and compete with colleagues."}
        </p>

        {/* Stat pills row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            {
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,245,.7)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="4" r="1.5"/><path d="M9 8.5l-2 5 3 1-1 5"/><path d="M12 8.5l1.5 4-3.5 1"/><path d="M14 8l2 2-2 3"/>
                </svg>
              ),
              label: "Daily steps",
            },
            {
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,245,.7)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              ),
              label: "Team rank",
            },
            {
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,245,.7)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                </svg>
              ),
              label: "Leaderboard",
            },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              flex: 1, display: "flex", flexDirection: "column" as const,
              alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.04)", border: ".5px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "12px 6px",
            }}>
              {icon}
              <span style={{ fontSize: 9.5, fontWeight: 600, color: T.t4, textAlign: "center" as const, letterSpacing: ".03em", lineHeight: 1.3 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={e => { e.stopPropagation(); onJoin(); }}
          style={{
            width: "100%", padding: "15px 0", borderRadius: 15, border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg,#A78BF5 0%,#7C5CE8 100%)",
            color: "#fff", fontSize: 14, fontWeight: 700,
            letterSpacing: "-.1px", fontFamily: "'Plus Jakarta Sans',sans-serif",
            boxShadow: "0 8px 32px rgba(124,92,232,.45),0 1px 0 rgba(255,255,255,.18) inset",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <Ic.Walk c="#fff" s={16} />
          Join the Challenge
        </button>
      </div>
    </div>
  );

  if (!isLogged && !isEvening) return wrap(T.purple, (
    <div style={{ padding: "20px 20px 20px", position: "relative" as const, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,245,.12) 0%,transparent 70%)", pointerEvents: "none" as const }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: `${T.purple}99`, letterSpacing: ".12em", textTransform: "uppercase" as const, display: "block", marginBottom: 12 }}>Daily Steps</span>
      <p style={{ fontSize: 34, fontWeight: 800, color: T.t1, letterSpacing: "-.05em", lineHeight: 1, marginBottom: 6 }}>
        {steps.daily_target.toLocaleString()}
      </p>
      <p style={{ fontSize: 12, fontWeight: 400, color: T.t3, lineHeight: 1.6, marginBottom: 0 }}>
        Today's target · currently rank #{challenge.rank}{challenge.total_participants ? ` of ${challenge.total_participants}` : ""}. Log in the evening to track progress.
      </p>
    </div>
  ), hasChallenge);

  if (!isLogged) return wrap(T.purple, (
    <div style={{ padding: "20px 20px 20px" }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: `${T.purple}99`, letterSpacing: ".12em", textTransform: "uppercase" as const, display: "block", marginBottom: 14 }}>Daily Steps</span>
      <p style={{ fontSize: 20, fontWeight: 800, color: T.t1, letterSpacing: "-.4px", lineHeight: 1.2, marginBottom: 4 }}>How many steps today?</p>
      <p style={{ fontSize: 12, fontWeight: 400, color: T.t3, marginBottom: 18, lineHeight: 1.55 }}>
        Rank #{challenge.rank}{challenge.total_participants ? ` of ${challenge.total_participants}` : ""} · target {steps.daily_target.toLocaleString()} steps
      </p>
      <button onClick={e => { e.stopPropagation(); setShowLog(true); }} style={{
        width: "100%", padding: "15px 0", borderRadius: 14, border: "none",
        cursor: "pointer", background: T.grad, color: "#fff", fontSize: 14, fontWeight: 700,
        letterSpacing: "-.1px", fontFamily: "'Plus Jakarta Sans',sans-serif",
        boxShadow: "0 8px 28px rgba(124,92,232,.40),0 1px 0 rgba(255,255,255,.14) inset",
      }}>Log Today's Steps</button>
    </div>
  ), hasChallenge);

  // logged state
  const accent = hitGoal ? T.green : T.purple;
  return wrap(accent, (
    <>
      {/* confetti canvas */}
      {hitGoal && (
        <canvas ref={confettiRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", borderRadius: 22, zIndex: 10 }} />
      )}
      {/* radial bloom — atmospheric gold light from top */}
      {hitGoal && (
        <div style={{
          position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)",
          width: 280, height: 180, pointerEvents: "none", zIndex: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(45,138,82,.10) 0%, transparent 70%)",
        }} />
      )}
      {/* ── label + goal badge ─────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: T.t4, letterSpacing: ".12em", textTransform: "uppercase" as const }}>Today</span>
          {gfitConn && (
            gfitConn.syncing
              ? <span style={{ display: "inline-block", width: 6, height: 6, border: "1.5px solid rgba(52,168,83,0.3)", borderTopColor: "#34A853", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
              : <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34A853", boxShadow: "0 0 5px rgba(52,168,83,0.9)" }} />
          )}
        </div>
        {hitGoal ? (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "linear-gradient(90deg,rgba(45,138,82,.14),rgba(45,138,82,.08))",
            border: "1px solid rgba(45,138,82,.30)",
            borderRadius: 99, padding: "4px 12px",
            boxShadow: "none",
          }}>
            <span style={{ fontSize: 9, color: "#30D158" }}>✦</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#30D158", letterSpacing: ".08em" }}>GOAL ACHIEVED</span>
          </div>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 500, color: T.t3 }}>
            Target <span style={{ color: T.t2, fontWeight: 600 }}>{steps.daily_target.toLocaleString()}</span>
          </span>
        )}
      </div>

      {/* ── hero: big number ───────────────────────────────────────── */}
      <div style={{ padding: "10px 20px 6px", position: "relative" as const }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 10, position: "relative" as const }}>
            <span style={{ fontSize: hitGoal ? 42 : 38, fontWeight: 800, letterSpacing: "-.05em", lineHeight: 1, color: "#FFFFFF", transition: "font-size .8s ease" }}>{animSteps.toLocaleString()}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.t4 }}>steps</span>
          </div>
          {/* progress bar */}
          <div style={{ height: hitGoal ? 5 : 3, borderRadius: 99, background: hitGoal ? "rgba(45,212,191,.12)" : `${accent}18`, overflow: "hidden" as const, marginBottom: 8, transition: "all 1s ease" }}>
            <div style={{ height: "100%", width: `${Math.min(animPct, 100)}%`, borderRadius: 99, background: hitGoal ? "linear-gradient(90deg,#2D8A52,#30D158)" : accent, transition: "width .8s cubic-bezier(.4,0,.2,1)" }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: T.t3 }}>
            {hitGoal
              ? `${(steps.today - steps.daily_target).toLocaleString()} above goal`
              : `${(steps.daily_target - steps.today).toLocaleString()} to go`}
          </span>
      </div>

      <SEP />

      {/* ── footer: streak · rank · view ───────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "10px 20px 12px" }}>
        {/* streak */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Ic.Flame c={T.orange} s={12} />
          <span style={{ fontSize: 12, fontWeight: 700, color: T.t2 }}>{steps.step_streak}<span style={{ fontWeight: 400, color: T.t3 }}> day</span></span>
        </div>
        {/* divider */}
        <div style={{ width: 1, height: 12, background: "rgba(255,255,255,.10)", margin: "0 10px" }} />
        {/* rank */}
        <span style={{ fontSize: 12, fontWeight: 500, color: T.t3 }}>
          Rank <span style={{ color: T.t2, fontWeight: 700 }}>#{challenge.rank}</span>
          {challenge.total_participants ? <span style={{ color: T.t4 }}> / {challenge.total_participants}</span> : null}
          {challenge.rank_change > 0 && <span style={{ color: T.t3, fontWeight: 600 }}> ↑{challenge.rank_change}</span>}
        </span>
      </div>
    </>
  ), hasChallenge);
}

// ─── habits card ──────────────────────────────────────────────────────────────
function HabitsCard({ data, fd, onNavigate }: { data: HomeData; fd: (d: number) => React.CSSProperties; onNavigate: () => void }) {
  const { habits, habit_streak } = data;

  const base: React.CSSProperties = {
    ...fd(180), margin: "0 8px 8px", borderRadius: 22, overflow: "hidden",
    boxShadow: "0 8px 40px rgba(0,0,0,.60),0 1px 0 rgba(255,255,255,.05) inset",
  };

  // ── unenrolled state ──────────────────────────────────────────────────────
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
  const stage: 0 | 1 | 2 | 3 = day_number < 7 ? 1 : day_number < 14 ? 2 : day_number < 19 ? 3 : 3;

  // confetti + vibration — fires once when all habits done
  const habitsConfettiRef = useRef<HTMLCanvasElement>(null);
  const habitsConfettiFired = useRef(false);
  useEffect(() => {
    if (!all_done || habitsConfettiFired.current) return;
    const timer = setTimeout(() => {
      const canvas = habitsConfettiRef.current;
      if (!canvas) return;
      habitsConfettiFired.current = true;
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([80, 40, 120, 40, 60]);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const W = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 340;
      const H = canvas.offsetHeight || canvas.parentElement?.offsetHeight || 200;
      canvas.width = W; canvas.height = H;
      const COLORS = ["#FFD700","#FFC940","#FFEFA0","#40C8E0","#64D2FF","#C4B0F8","#A78BF5","rgba(255,255,255,0.90)","#2DD4BF"];
      type P = { x:number;y:number;vx:number;vy:number;color:string;w:number;h:number;rot:number;rv:number;opacity:number;type:"rect"|"circle"|"star" };
      const types: Array<"rect"|"circle"|"star"> = ["rect","rect","rect","circle","circle","star"];
      const particles: P[] = Array.from({ length: 120 }, (_, i) => {
        const fromLeft = i < 60;
        const spreadL = (30 + Math.random() * 50) * (Math.PI / 180);
        const spreadR = (100 + Math.random() * 50) * (Math.PI / 180);
        const angle = fromLeft ? spreadL : spreadR;
        const spd = 2.2 + Math.random() * 4.2;
        const xL = W * 0.02 + Math.random() * W * 0.18;
        const xR = W * 0.80 + Math.random() * W * 0.18;
        return { x: fromLeft ? xL : xR, y: H * 0.92 + Math.random() * H * 0.06, vx: Math.cos(angle) * spd, vy: -Math.abs(Math.sin(angle) * spd), color: COLORS[Math.floor(Math.random() * COLORS.length)], w: 4 + Math.random() * 8, h: 2 + Math.random() * 4, rot: Math.random() * Math.PI * 2, rv: (Math.random() - 0.5) * 0.15, opacity: 0.85 + Math.random() * 0.15, type: types[Math.floor(Math.random() * types.length)] };
      });
      let frame = 0; const TOTAL = 320; const FADE_START = 210;
      const drawStar = (cx: CanvasRenderingContext2D, r: number) => { const spikes=4,outer=r,inner=r*0.45; cx.beginPath(); for(let s=0;s<spikes*2;s++){const a=(s*Math.PI)/spikes-Math.PI/2;const rad=s%2===0?outer:inner;cx.lineTo(Math.cos(a)*rad,Math.sin(a)*rad);} cx.closePath(); cx.fill(); };
      const tick = () => {
        if (frame >= TOTAL) { ctx.clearRect(0,0,W,H); return; }
        ctx.clearRect(0,0,W,H);
        const fade = frame < FADE_START ? 1 : 1-(frame-FADE_START)/(TOTAL-FADE_START);
        for (const p of particles) {
          p.x+=p.vx; p.y+=p.vy; p.vy+=0.055; p.vx*=0.993; p.rot+=p.rv;
          ctx.save(); ctx.globalAlpha=Math.max(0,p.opacity*fade); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.color;
          if(p.type==="circle"){ctx.beginPath();ctx.arc(0,0,p.w/2,0,Math.PI*2);ctx.fill();}
          else if(p.type==="star"){drawStar(ctx,p.w/2);}
          else{ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);}
          ctx.restore();
        }
        frame++; requestAnimationFrame(tick);
      };
      tick();
    }, 600);
    return () => clearTimeout(timer);
  }, [all_done]);
  const noneYet = completed_count === 0;

  // Color story: forest green = all done, purple = in progress
  const accent      = all_done ? "#30D158" : T.purple;
  const accentRgb   = all_done ? "48,209,88" : "155,127,232";   // forest green : purple
  const chipDoneClr = all_done ? "#30D158" : T.purple;

  return (
    <div className="hp-card-tap" onClick={onNavigate} style={{
      ...base,
      background: all_done
        ? "linear-gradient(160deg,rgba(48,209,88,.07) 0%,rgba(8,18,12,.99) 100%)"
        : `linear-gradient(160deg,rgba(${accentRgb},.11) 0%,rgba(16,14,26,.99) 100%)`,
      border: all_done ? "1px solid rgba(45,138,82,.28)" : `.5px solid rgba(${accentRgb},.18)`,
      cursor: "pointer",
      position: "relative" as const,
    }}>

      {/* confetti canvas */}
      {all_done && (
        <canvas ref={habitsConfettiRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", borderRadius: 22, zIndex: 10 }} />
      )}

      {/* Tree watermark removed */}

      {/* ── HEADER: label only ─────────────────────────────────── */}
      <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: ".12em",
          textTransform: "uppercase" as const,
          color: T.t4,
        }}>21-Day Challenge</span>
      </div>

      {/* ── HERO: big fraction left + completion ring right ──── */}
      <div style={{ padding: "10px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Left: hero number */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 4 }}>
            <span style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-.06em", lineHeight: 1, color: "#FFFFFF" }}>
              {completed_count}
            </span>
            <span style={{ fontSize: 22, fontWeight: 600, color: T.t4, lineHeight: 1, margin: "0 1px" }}>/</span>
            <span style={{ fontSize: 28, fontWeight: 700, color: T.t3, letterSpacing: "-.04em", lineHeight: 1 }}>
              {total_count}
            </span>
            <span style={{ fontSize: 13, fontWeight: 400, color: T.t4, marginLeft: 4, paddingBottom: 2 }}>
              habits done
            </span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: noneYet ? T.orange : T.t3 }}>
            {noneYet
              ? "Tap to log today's habits"
              : all_done
                ? `Perfect — all ${total_count} habits kept`
                : `${total_count - completed_count} remaining today`}
          </span>
        </div>

        {/* Right: tree */}
        <div style={{ flexShrink: 0, opacity: all_done ? 1 : 0.75, transition: "opacity .6s ease" }}>
          <TreeSvg stage={stage} size={72} />
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <SEP />
      <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "10px 20px 12px" }}>
        {/* streak */}
        {habit_streak.effective > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Ic.Flame c={T.orange} s={12} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.t2 }}>{habit_streak.effective}<span style={{ fontWeight: 400, color: T.t3 }}> day</span></span>
            </div>
            <div style={{ width: 1, height: 12, background: "rgba(255,255,255,.10)", margin: "0 10px" }} />
          </>
        )}
        {/* day / 21 */}
        <span style={{ fontSize: 12, fontWeight: 500, color: T.t3 }}>
          Day <span style={{ color: T.t2, fontWeight: 700 }}>{day_number}</span>
          <span style={{ color: T.t4 }}> / {total_days}</span>
        </span>
      </div>
    </div>
  );
}

// ─── Google Fit card ─────────────────────────────────────────────────────────
const GFIT_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

function gfitRelTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch { return ""; }
}

function GFitIcon({ size = 28 }: { size?: number }) {
  const r = Math.round(size * 0.28);
  const ic = Math.round(size * 0.55);
  return (
    <div style={{
      width: size, height: size, borderRadius: r, flexShrink: 0,
      background: "linear-gradient(135deg,#4285F4 0%,#34A853 60%,#FBBC04 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 10px rgba(66,133,244,0.38)",
    }}>
      <svg width={ic} height={ic} viewBox="0 0 16 16" fill="none">
        <polyline points="1,12 5,7 8,9.5 11,4 15,6.5"
          stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="5" cy="7" r="1.3" fill="white" />
        <circle cx="8" cy="9.5" r="1.3" fill="white" />
        <circle cx="11" cy="4" r="1.3" fill="white" />
      </svg>
    </div>
  );
}

function GoogleFitSyncCard({
  onStepsUpdate, fd, onConnected,
}: {
  onStepsUpdate: (steps: number) => void;
  fd: (d: number) => React.CSSProperties;
  onConnected?: (info: { label: string; syncing: boolean; syncFn: () => void } | null) => void;
}) {
  const [gfState, setGfState] = useState<"checking" | "disconnected" | "connected" | "syncing" | "reconnect">("checking");
  const [backendSt, setBackendSt] = useState<{ connected: boolean; last_synced?: string } | null>(null);
  const [liveSteps, setLiveSteps] = useState<number | null>(null);
  const onConnectedRef = useRef(onConnected);
  onConnectedRef.current = onConnected;
  const syncInFlight = useRef(false);

  const checkBackend = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const res = await fetch(`${GFIT_BASE}/api/googlefit/status`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setBackendSt(data);
        if (data.connected) {
          // always fetch live steps from Google Fit on page view —
          // backend cron runs on long intervals so client pulls fresh data itself
          setTimeout(() => syncNow(), 0);
          return;
        }
      }
    } catch { /* fall through */ }
    setGfState(isGoogleFitConnected() ? "connected" : "disconnected");
  };

  useEffect(() => { checkBackend(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const syncNow = async () => {
    if (syncInFlight.current) return;  // prevent double-call on StrictMode remount / rapid reload
    syncInFlight.current = true;
    setGfState("syncing");
    try {
      const result = await fetchStepsFromServer();
      if (result.needsReconnect) { setGoogleFitConnected(false); setGfState("reconnect"); return; }
      if (result.connected) {
        setGoogleFitConnected(true);
        if (result.steps > 0) {
          setLiveSteps(result.steps);
          onStepsUpdate(result.steps);
          // Push live steps to backend so /steps page and leaderboards stay current.
          try {
            const today = new Date().toISOString().slice(0, 10);
            await addSteps({ steps: result.steps, log_date: today, source: "google_fit", note: "Auto-synced from Google Fit" });
          } catch { /* non-critical */ }
        }
        setGfState("connected");
      } else {
        // Clear localStorage flag so next page load doesn't wrongly show "connected"
        setGoogleFitConnected(false);
        setGfState("disconnected");
      }
    } finally {
      syncInFlight.current = false;
    }
  };

  useEffect(() => {
    if (!onConnectedRef.current) return;
    if (gfState === "connected" || gfState === "syncing") {
      const label = liveSteps && liveSteps > 0
        ? "Just now · live from Google Fit"
        : backendSt?.last_synced
          ? `Last synced ${gfitRelTime(backendSt.last_synced)}`
          : "Connected";
      onConnectedRef.current({ label, syncing: gfState === "syncing", syncFn: syncNow });
    } else {
      onConnectedRef.current(null);
    }
  }, [gfState, backendSt, liveSteps]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = () => {
    if (typeof window !== "undefined") startGoogleFitAuth(window.location.pathname);
  };

  if (gfState === "checking") return null;

  const syncedToday = !!backendSt?.last_synced &&
    new Date(backendSt.last_synced).toDateString() === new Date().toDateString();

  // ── disconnected / needs reconnect ─────────────────────────────────────────
  if (gfState === "disconnected" || gfState === "reconnect") return (
    <div style={{
      ...fd(170), margin: "0 8px 8px", borderRadius: 22,
      position: "relative" as const, overflow: "hidden",
      background: "linear-gradient(160deg,rgba(14,11,28,0.99) 0%,rgba(9,7,20,1) 100%)",
      border: ".5px solid rgba(66,133,244,0.22)",
      boxShadow: "0 8px 40px rgba(0,0,0,.7), inset 0 0.5px 0 rgba(255,255,255,0.06)",
    }}>
      {/* ambient glows */}
      <div style={{ position:"absolute", top:-60, right:-40, width:180, height:180, borderRadius:"50%", background:"radial-gradient(circle,rgba(66,133,244,0.14) 0%,transparent 68%)", pointerEvents:"none" as const }} />
      <div style={{ position:"absolute", bottom:-50, left:-20, width:140, height:140, borderRadius:"50%", background:"radial-gradient(circle,rgba(52,168,83,0.10) 0%,transparent 68%)", pointerEvents:"none" as const }} />

      <div style={{ padding:"20px 20px 18px", position:"relative" as const }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          {/* Google Fit G-logo colours as 4-dot grid */}
          <div style={{ width:32, height:32, borderRadius:10, background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="5" cy="5" r="3.5" fill="#4285F4"/>
              <circle cx="13" cy="5" r="3.5" fill="#EA4335"/>
              <circle cx="5" cy="13" r="3.5" fill="#34A853"/>
              <circle cx="13" cy="13" r="3.5" fill="#FBBC05"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:T.t1, letterSpacing:"-.3px", margin:0, lineHeight:1.2 }}>
              {gfState === "reconnect" ? "Reconnect Google Fit" : "Auto-sync with Google Fit"}
            </p>
            <p style={{ fontSize:11.5, color:T.t4, margin:0, marginTop:2 }}>
              {gfState === "reconnect"
                ? "Session expired — tap below to re-link your account"
                : "Steps log themselves every day"}
            </p>
          </div>
        </div>

        {/* 3-step guide */}
        {(() => {
          const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
          const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
          const storeLabel = isIOS ? "App Store" : isAndroid ? "Play Store" : "App Store / Play Store";
          const storeHref = isIOS
            ? "https://apps.apple.com/us/app/google-fit-activity-tracker/id1433864494"
            : "https://play.google.com/store/apps/details?id=com.google.android.apps.fitness";
          const steps = [
            { step:"1", color:"#4285F4", label:"Download Google Fit", href: storeHref },
            { step:"2", color:"#34A853", label:"Sign in with the Google account used in Google Fit", href:null },
            { step:"3", color:"#FBBC05", label:"Tap Connect below", href:null },
          ];
          return (
            <div style={{ display:"flex", flexDirection:"column", gap:0, marginBottom:16, background:"rgba(255,255,255,0.03)", borderRadius:14, border:"0.5px solid rgba(255,255,255,0.07)", overflow:"hidden" }}>
              {steps.map((s, i, arr) => (
                <div key={s.step} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 14px", borderBottom: i < arr.length-1 ? "0.5px solid rgba(255,255,255,0.06)" : "none" }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:s.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 2px 8px ${s.color}66` }}>
                    <span style={{ fontSize:10, fontWeight:800, color:"#fff" }}>{s.step}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12.5, fontWeight:600, color:T.t1, margin:0, letterSpacing:"-.1px" }}>{s.label}</p>
                  </div>
                  {s.href && (
                    <a href={s.href} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                      style={{ fontSize:11, fontWeight:600, color:"#4285F4", textDecoration:"none", whiteSpace:"nowrap", background:"rgba(66,133,244,0.12)", padding:"4px 9px", borderRadius:999, border:"0.5px solid rgba(66,133,244,0.25)", flexShrink:0 }}>
                      Get app ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          );
        })()}

        {/* CTA */}
        <button onClick={handleConnect} style={{
          width:"100%", padding:"13px 0", borderRadius:14, border:"none", cursor:"pointer",
          background:"linear-gradient(135deg,#4285F4 0%,#34A853 100%)",
          color:"#fff", fontSize:14, fontWeight:700,
          fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:"-.1px",
          boxShadow:"0 6px 24px rgba(66,133,244,0.40), inset 0 1px 0 rgba(255,255,255,0.18)",
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        }}>
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <circle cx="5" cy="5" r="3" fill="rgba(255,255,255,0.85)"/>
            <circle cx="13" cy="5" r="3" fill="rgba(255,255,255,0.65)"/>
            <circle cx="5" cy="13" r="3" fill="rgba(255,255,255,0.65)"/>
            <circle cx="13" cy="13" r="3" fill="rgba(255,255,255,0.85)"/>
          </svg>
          {gfState === "reconnect" ? "Reconnect Google Fit" : "Connect Google Fit"}
        </button>
      </div>
    </div>
  );

  // ── connected / syncing — merged into StepsCard ───────────────────────────
  return null;
}

// ─── weekly review card (static) ─────────────────────────────────────────────
function WeeklyReviewCard({ data, fd }: { data: HomeData; fd: (d: number) => React.CSSProperties }) {
  const streak      = data.habit_streak.effective;
  const perfectDays = data.habit_streak.perfect_days;
  const stepStreak  = data.steps.step_streak;
  const challengeDay   = data.habits?.day_number ?? 0;
  const challengeTotal = data.habits?.total_days ?? 21;

  // Last Mon – Sun date range label
  const today = new Date();
  const dow = today.getDay();
  const lastMon = new Date(today);
  lastMon.setDate(today.getDate() - (dow === 0 ? 13 : dow + 6));
  lastMon.setHours(0, 0, 0, 0);
  const lastSun = new Date(lastMon);
  lastSun.setDate(lastMon.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const dateRange = `${fmt(lastMon)} – ${fmt(lastSun)}`;

  // ── Natural language summary ──────────────────────────────────────────────
  // Opening — what kind of week was it?
  const opening =
    perfectDays >= 6 ? `You nailed last week.` :
    perfectDays >= 4 ? `You had a really solid week.` :
    perfectDays >= 2 ? `You showed up consistently last week.` :
    streak >= 3     ? `You kept your streak alive last week.` :
                      `Last week was a starting point.`;

  // Body — the meaningful numbers woven into a sentence
  const challengePart = challengeDay > 0
    ? ` You're on day ${challengeDay} of ${challengeTotal} of your challenge.`
    : "";

  const body =
    perfectDays >= 1
      ? `${perfectDays} perfect day${perfectDays !== 1 ? "s" : ""}, a ${streak}-day habit streak, and ${stepStreak} days of steps in a row.${challengePart}`
      : `You have a ${streak}-day habit streak going and ${stepStreak} consecutive days of steps.${challengePart}`;

  // Hook — one forward-looking sentence
  const hook =
    streak >= 7 ? `You've built a 7-day streak. Protect it this week.` :
    streak >= 3 ? `${7 - streak} more day${7 - streak === 1 ? "" : "s"} and you hit a 7-day streak.` :
    perfectDays >= 3 ? `${perfectDays} perfect days is real momentum. Keep it going.` :
    `Every habit you log this week compounds into next week.`;

  return (
    <div style={{ ...fd(380), margin: "8px 8px" }}>
      <div style={{
        borderRadius: 22,
        background: "linear-gradient(170deg, rgba(22,20,36,.98) 0%, rgba(14,12,24,.99) 100%)",
        border: "1px solid rgba(226,216,255,.12)",
        position: "relative" as const,
        overflow: "hidden",
      }}>
        {/* top-right purple glow */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: 160, height: 120, pointerEvents: "none",
          background: "radial-gradient(ellipse at 100% 0%, rgba(167,139,245,.16) 0%, transparent 70%)",
        }} />

        <div style={{ position: "relative", padding: "20px 20px 20px" }}>

          {/* Label + date */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" as const, color: "rgba(196,176,248,.70)" }}>Week in Review</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(242,238,255,.28)" }}>{dateRange}</span>
          </div>

          {/* Opening — large, confident */}
          <p style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800, color: "#F2EEFF", letterSpacing: "-.03em", lineHeight: 1.15 }}>
            {opening}
          </p>

          {/* Body — numbers in prose */}
          <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 500, color: "rgba(242,238,255,.60)", lineHeight: 1.65, letterSpacing: "-.01em" }}>
            {body}
          </p>

          {/* Hairline divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,.07)", marginBottom: 14 }} />

          {/* Forward hook — purple, slightly smaller */}
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.55, color: T.purpleL, letterSpacing: "-.01em" }}>
            {hook}
          </p>

        </div>
      </div>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────
export default function HomePage() {
  useAuthRedirect({ apiCheck: true });
  const router = useRouter();

  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [latestChallenge, setLatestChallenge] = useState<{ id: string; title: string; description: string; participant_count?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [vis, setVis] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [logVal, setLogVal] = useState("");
  const [logError, setLogError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [stepsRefreshing, setStepsRefreshing] = useState(false);
  const [mindWeekly, setMindWeekly] = useState(0);
  const [navigating, setNavigating] = useState(false);
  const [showJoinSheet, setShowJoinSheet] = useState(false);
  const [joinTarget, setJoinTarget] = useState(8000);
  const [joining, setJoining] = useState(false);
  const [joinDone, setJoinDone] = useState(false);
  const [gfitLiveSteps, setGfitLiveSteps] = useState<number | null>(null);
  const gfitSyncRef = useRef<(() => void) | null>(null);
  const [gfitConn, setGfitConn] = useState<{ label: string; syncing: boolean; syncFn: () => void } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = (path: string) => {
    setNavigating(true);
    router.push(path);
  };

  const handleJoin = async () => {
    if (!latestChallenge || joining) return;
    setJoining(true);
    try {
      await api(`/api/challenges/${latestChallenge.id}/join`, {
        method: "POST",
        body: JSON.stringify({ selected_daily_target: joinTarget }),
      });
      setJoinDone(true);
      setTimeout(() => {
        router.push(`/challanges/${latestChallenge.id}/steps`);
      }, 1600);
    } catch { /* ignore — user can retry */ }
    finally { setJoining(false); }
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
        // Fetch home data; fall back gracefully if endpoint not yet live
        const me = await getCachedUserMe() as any;
        if (me?.role === "admin" || me?.is_admin === true) setIsAdmin(true);
        let data: HomeData;
        try {
          data = await api<HomeData>("/api/home", { method: "GET" });
        } catch {
          // API not live yet — build minimal data from user profile
          data = {
            steps: { yesterday: 0, today: 0, daily_target: 8000, pct: 0, step_streak: 0 },
            challenge: null,
            step_challenge: null,
            habits: null,
            habit_streak: { current: 0, effective: 0, longest: 0, perfect_days: 0 },
            ai_insight: null,
            user: { name: me.name, profile_pic_url: null },
          };
        }
        // Normalise: API returns step_challenge, code reads challenge
        // Only promote step_challenge to challenge when it has a real id (enrolled user)
        if (!data.challenge && data.step_challenge?.id) {
          data = { ...data, challenge: data.step_challenge };
        }
        setHomeData(data);
        // Always fetch /api/challenges/available when not enrolled (no real challenge id)
        if (!data.challenge?.id) {
          api<any[]>("/api/challenges/available").then(all => {
            if (!Array.isArray(all)) return;
            const today = new Date().toISOString().slice(0, 10);
            const active = [...all]
              .filter(c => c.status === "active" && c.start_date <= today && (!c.end_date || c.end_date >= today))
              .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

            // If already joined, patch homeData so the joined card renders
            const joined = active.find(c => c.user_joined);
            if (joined) {
              setHomeData(prev => prev && !prev.challenge ? {
                ...prev,
                challenge: { id: joined.id, rank: 0, rank_change: 0, total_participants: joined.participant_count },
                steps: { ...prev.steps, daily_target: joined.user_daily_target ?? prev.steps.daily_target },
              } : prev);
              return;
            }

            // Not joined — show the latest active challenge as a join prompt
            const unjoinedLatest = active[0];
            if (unjoinedLatest) setLatestChallenge({ id: unjoinedLatest.id, title: unjoinedLatest.title, description: unjoinedLatest.description, participant_count: unjoinedLatest.participant_count });
          }).catch(() => {});
        }
      } catch {
        router.replace("/home");
      } finally {
        setLoading(false);
      }
    };
    load();

    // Silently refresh steps + trigger GFit sync when the tab regains focus.
    // Use stable named functions so removeEventListener actually works (no re-fires).
    const refreshHome = () => {
      api<HomeData>("/api/home", { method: "GET" })
        .then(fresh => {
          if (!fresh) return;
          if (!fresh.challenge?.id && fresh.step_challenge?.id) fresh = { ...fresh, challenge: fresh.step_challenge };
          setHomeData(prev => prev ? {
            ...prev,
            steps: fresh.steps,
            habits: fresh.habits ?? prev.habits,
            habit_streak: fresh.habit_streak,
          } : prev);
        })
        .catch(() => {});
      // also re-pull live steps from Google Fit if connected
      gfitSyncRef.current?.();
    };
    const onVisibility = () => { if (document.visibilityState === "visible") refreshHome(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", refreshHome);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", refreshHome);
    };
  }, [router]);

  const stepsTarget = homeData?.steps.today ?? 0;
  const pctTarget = homeData?.steps.pct ?? 0;
  const animSteps = useCount(stepsTarget, 300, 900);
  const animPct = usePct(pctTarget, 200, 1000);

  // When Google Fit returns live steps, merge them into homeData so every
  // step-dependent display (hero count, progress bar, "above goal" text) updates.
  useEffect(() => {
    if (gfitLiveSteps != null && gfitLiveSteps > 0) {
      setHomeData(prev => {
        if (!prev) return prev;
        const daily_target = prev.steps.daily_target || 8000;
        return {
          ...prev,
          steps: {
            ...prev.steps,
            today: gfitLiveSteps,
            pct: Math.min(Math.round((gfitLiveSteps / daily_target) * 100), 100),
          },
        };
      });
    }
  }, [gfitLiveSteps]); // eslint-disable-line react-hooks/exhaustive-deps

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
        let fresh = await api<HomeData>("/api/home", { method: "GET" });
        if (!fresh.challenge?.id && fresh.step_challenge?.id) fresh = { ...fresh, challenge: fresh.step_challenge };
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
        margin: `${mt}px 8px 0`,
        borderRadius: 22, overflow: "hidden",
        background: "rgba(255,255,255,.028)",
        border: ".5px solid rgba(255,255,255,.07)",
        animation: `skfade ${0.4 + delay * 0.001}s ease both`,
      }}>{children}</div>
    );

    return (
      <div style={{ minHeight: "100vh", width: "100%", backgroundColor: T.bg }}>
        <div style={{ maxWidth: 430, margin: "0 auto", paddingBottom: 90 }}>
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
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        html,body{overflow-x:hidden;}
        .hp-page{min-height:100vh;max-width:430px;margin:0 auto;background:${T.bg};font-family:'Plus Jakarta Sans',-apple-system,sans-serif;color:${T.t1};-webkit-font-smoothing:antialiased;padding-bottom:56px;overflow-x:hidden;}
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

        {/* Daily carousel — insight + featured feeds */}
        <DailyCarousel data={homeData} fd={fd} onNavigate={navigate} greeting={greeting} userName={userName.split(" ")[0]} />

        {/* Google Fit step sync — admin only while in testing/pilot */}
        {isAdmin && (
          <div style={{ marginTop: 8 }}>
            <GoogleFitSyncCard onStepsUpdate={steps => setGfitLiveSteps(steps)} fd={fd} onConnected={info => { setGfitConn(info); gfitSyncRef.current = info?.syncFn ?? null; }} />
          </div>
        )}

        {/* Steps challenge */}
        {stepsRefreshing ? (
          <div style={{
            margin: "0 8px 8px", borderRadius: 22, overflow: "hidden",
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
            latestChallenge={latestChallenge}
            showLog={showLog}
            setShowLog={setShowLog}
            animSteps={animSteps}
            animPct={animPct}
            fd={fd}
            gfitConn={isAdmin ? gfitConn : null}
            onNavigate={() => navigate(homeData.challenge ? `/challanges/${homeData.challenge.id}/steps` : "/challanges")}
            onJoin={() => { setJoinTarget(8000); setJoinDone(false); setShowJoinSheet(true); }}
          />
        )}

        {/* Habits section */}
        <HabitsCard data={homeData} fd={fd} onNavigate={() => navigate(homeData.habits ? "/habits/tree" : "/habits")} />

        {/* Weekly Review — admin only (show always for testing) */}
        {isAdmin && <WeeklyReviewCard data={homeData} fd={fd} />}

        {/* Wellbeing */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, margin: "0 8px 8px", ...fd(420) }}>
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

        {/* Feedback — end of page */}
        <FeedbackButton />

      </div>

      <BottomNav active="home" />

      {/* ── JOIN CHALLENGE BOTTOM SHEET ── */}
      {showJoinSheet && latestChallenge && (
        <>
          {/* Scrim */}
          <div
            onClick={() => !joining && setShowJoinSheet(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 400,
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              animation: "fadeIn 0.22s ease",
            }}
          />
          {/* Sheet */}
          <div style={{
            position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: "100%", maxWidth: 480, zIndex: 401,
            background: "linear-gradient(180deg,#1C1728 0%,#12101C 100%)",
            borderRadius: "28px 28px 0 0",
            border: "1px solid rgba(167,139,245,.16)",
            borderBottom: "none",
            boxShadow: "0 -16px 64px rgba(0,0,0,.80)",
            animation: "slideUp 0.32s cubic-bezier(.32,0,.16,1)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}>
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 0" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
            </div>

            <div style={{ padding: "20px 24px 28px" }}>

              {joinDone ? (
                /* ── Success state ── */
                <div style={{ textAlign: "center" as const, padding: "16px 0 8px" }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%", margin: "0 auto 16px",
                    background: "rgba(45,212,191,.12)", border: "1px solid rgba(45,212,191,.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28,
                  }}>✓</div>
                  <p style={{ fontSize: 20, fontWeight: 800, color: T.t1, letterSpacing: "-.4px", marginBottom: 8 }}>You're in!</p>
                  <p style={{ fontSize: 14, color: T.t3, lineHeight: 1.55 }}>
                    Goal set to <span style={{ color: T.green, fontWeight: 700 }}>{joinTarget.toLocaleString()} steps/day</span>.<br />Taking you to your dashboard…
                  </p>
                </div>
              ) : (
                <>
                  {/* Challenge name */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        background: "rgba(167,139,245,.10)", border: ".5px solid rgba(167,139,245,.25)",
                        borderRadius: 99, padding: "3px 10px", marginBottom: 10,
                      }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.purple, boxShadow: `0 0 5px ${T.purple}` }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: T.purpleL, letterSpacing: ".09em", textTransform: "uppercase" as const }}>Team Challenge</span>
                      </div>
                      <p style={{ fontSize: 20, fontWeight: 800, color: T.t1, letterSpacing: "-.4px", lineHeight: 1.2 }}>
                        {latestChallenge.title}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowJoinSheet(false)}
                      style={{ background: "rgba(255,255,255,0.07)", border: ".5px solid rgba(255,255,255,0.10)", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: T.t3, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 12, marginTop: 2 }}
                    >×</button>
                  </div>

                  {/* Step target label */}
                  <p style={{ fontSize: 12, fontWeight: 600, color: T.t3, letterSpacing: ".06em", textTransform: "uppercase" as const, marginBottom: 12 }}>
                    Pick your daily step goal
                  </p>

                  {/* Target options */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                    {[
                      { val: 5000, label: "5,000", sub: "steps / day", desc: "Moderate" },
                      { val: 8000, label: "8,000", sub: "steps / day", desc: "Active" },
                    ].map(({ val, label, sub, desc }) => {
                      const active = joinTarget === val;
                      return (
                        <button
                          key={val}
                          onClick={() => setJoinTarget(val)}
                          style={{
                            flex: 1, padding: "18px 14px", borderRadius: 18, cursor: "pointer",
                            background: active
                              ? "linear-gradient(145deg,rgba(167,139,245,.18) 0%,rgba(124,92,232,.10) 100%)"
                              : "rgba(255,255,255,0.04)",
                            border: active ? "1.5px solid rgba(167,139,245,.50)" : "1px solid rgba(255,255,255,0.08)",
                            boxShadow: active ? "0 0 20px rgba(124,92,232,.18)" : "none",
                            display: "flex", flexDirection: "column" as const, alignItems: "flex-start", gap: 2,
                            transition: "all 0.18s cubic-bezier(.4,0,.2,1)",
                            fontFamily: "'Plus Jakarta Sans',sans-serif",
                            position: "relative" as const,
                          }}
                        >
                          {active && (
                            <div style={{
                              position: "absolute", top: 10, right: 10,
                              width: 16, height: 16, borderRadius: "50%",
                              background: T.purple,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <svg width="8" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          )}
                          <span style={{ fontSize: 22, fontWeight: 800, color: active ? T.purpleL : T.t1, letterSpacing: "-.5px", lineHeight: 1 }}>{label}</span>
                          <span style={{ fontSize: 10, fontWeight: 500, color: active ? "rgba(167,139,245,.6)" : T.t4, letterSpacing: ".01em" }}>{sub}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: active ? T.purple : T.t3, marginTop: 6 }}>{desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 20 }} />

                  {/* Commitment line */}
                  <p style={{ fontSize: 13, color: T.t3, lineHeight: 1.6, marginBottom: 20, textAlign: "center" as const }}>
                    Walk <span style={{ color: T.t1, fontWeight: 700 }}>{joinTarget.toLocaleString()} steps every day</span> and climb<br />the leaderboard with your team.
                  </p>

                  {/* CTA */}
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    style={{
                      width: "100%", padding: "17px 0", borderRadius: 17, border: "none",
                      cursor: joining ? "not-allowed" : "pointer",
                      background: joining ? "rgba(124,92,232,.5)" : "linear-gradient(135deg,#A78BF5 0%,#7C5CE8 100%)",
                      color: "#fff", fontSize: 15, fontWeight: 700,
                      letterSpacing: "-.2px", fontFamily: "'Plus Jakarta Sans',sans-serif",
                      boxShadow: joining ? "none" : "0 8px 32px rgba(124,92,232,.45),0 1px 0 rgba(255,255,255,.16) inset",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "opacity 0.2s",
                      opacity: joining ? 0.7 : 1,
                    }}
                  >
                    {joining ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTop: "2px solid #fff", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                        Joining…
                      </span>
                    ) : (
                      <>
                        <Ic.Walk c="#fff" s={16} />
                        Join · {joinTarget.toLocaleString()} steps/day
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
