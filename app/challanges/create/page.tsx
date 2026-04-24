// @ts-nocheck
"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

/* ═══════════════════════════════════════════════
   TOKENS — matches app palette
═══════════════════════════════════════════════ */
const BG    = "#0f172a";
const CARD  = "#1e293b";
const SURF  = "#263148";
const INP   = "#1e2d45";
const T1    = "#F2F2F7";
const T2    = "#94a3b8";
const T3    = "#475569";
const BDR   = "rgba(255,255,255,0.07)";
const BDRM  = "rgba(255,255,255,0.14)";
const PUR   = "#7c3aed";
const PURLT = "#a855f7";
const GREEN = "#10b981";

/* ═══════════════════════════════════════════════
   STEP DEFINITIONS
═══════════════════════════════════════════════ */
const STEPS = [
  { id: "type",     label: "Goal Type"  },
  { id: "target",   label: "Target"     },
  { id: "details",  label: "Details"    },
  { id: "schedule", label: "Schedule"   },
  { id: "settings", label: "Settings"   },
  { id: "review",   label: "Review"     },
];

/* ── goal types ── */
const GOAL_TYPES = [
  { id:"steps",    emoji:"👟", label:"Steps",          unit:"steps/day",  defaultVal:7000,  min:1000,  max:30000, step:500  },
  { id:"distance", emoji:"📍", label:"Distance",       unit:"km/day",     defaultVal:5,     min:1,     max:50,    step:0.5  },
  { id:"calories", emoji:"🔥", label:"Calories",       unit:"kcal/day",   defaultVal:400,   min:100,   max:2000,  step:50   },
  { id:"active",   emoji:"⚡", label:"Active Minutes", unit:"min/day",    defaultVal:30,    min:5,     max:180,   step:5    },
  { id:"workouts", emoji:"🏋️", label:"Workouts",       unit:"sessions/week", defaultVal:3, min:1,     max:14,    step:1    },
  { id:"sleep",    emoji:"😴", label:"Sleep",          unit:"hrs/night",  defaultVal:8,     min:4,     max:12,    step:0.5  },
  { id:"custom",   emoji:"✦",  label:"Custom",         unit:"units/day",  defaultVal:10,    min:1,     max:1000,  step:1    },
];

/* ── scope options ── */
const SCOPES = [
  { id:"individual", emoji:"👤", label:"Individual",   desc:"Each person competes solo"       },
  { id:"team",       emoji:"👥", label:"Team",         desc:"Groups compete as a team"         },
  { id:"department", emoji:"🏢", label:"Department",   desc:"Whole department participates"    },
];

/* ── difficulty ── */
const DIFFICULTIES = [
  { id:"easy",   label:"Easy",   color:"#10b981", desc:"Great for beginners" },
  { id:"medium", label:"Medium", color:"#f59e0b", desc:"Moderate challenge"  },
  { id:"hard",   label:"Hard",   color:"#ef4444", desc:"Push your limits"    },
];

/* ── visibility ── */
const VISIBILITY = [
  { id:"public",  emoji:"🌍", label:"Public",  desc:"Anyone can discover & join" },
  { id:"private", emoji:"🔒", label:"Private", desc:"Invite only"                },
];

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
const uid = () => Math.random().toString(36).slice(2, 9);
const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

function addDays(date: string, n: number) {
  const d = new Date(date); d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}
const today = () => new Date().toISOString().split("T")[0];

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════ */
function Toggle({ value, onChange, color = PUR }: { value: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 44, height: 25, borderRadius: 13, position: "relative", flexShrink: 0,
      background: value ? color : INP, border: "none", cursor: "pointer",
      transition: "background .2s", boxShadow: value ? `0 0 0 2px ${color}44` : "none",
    }}>
      <div style={{
        position: "absolute", top: 3, left: value ? 22 : 3, width: 19, height: 19,
        borderRadius: "50%", background: "#fff", transition: "left .2s",
        boxShadow: "0 2px 6px rgba(0,0,0,.5)",
      }} />
    </button>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: T3, letterSpacing: 0.8,
      textTransform: "uppercase", marginBottom: 8 }}>{children}</div>
  );
}

function TInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focus, setFocus] = useState(false);
  return (
    <input onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{ width: "100%", background: INP, border: `1px solid ${focus ? BDRM : BDR}`,
        borderRadius: 14, padding: "13px 16px", color: T1, fontSize: 15,
        outline: "none", boxSizing: "border-box", fontFamily: "inherit",
        colorScheme: "dark", transition: "border-color .15s", ...props.style }}
      {...props} />
  );
}

function TArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [focus, setFocus] = useState(false);
  return (
    <textarea onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{ width: "100%", background: INP, border: `1px solid ${focus ? BDRM : BDR}`,
        borderRadius: 14, padding: "13px 16px", color: T1, fontSize: 15, lineHeight: 1.65,
        outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit",
        colorScheme: "dark", transition: "border-color .15s", ...props.style }}
      {...props} />
  );
}

/* step card */
function StepSection({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }} transition={{ duration: .22, ease: [.22, 1, .36, 1] }}
    >
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: T1, letterSpacing: "-.5px" }}>{title}</h2>
        {subtitle && <p style={{ margin: "6px 0 0", fontSize: 14, color: T2, lineHeight: 1.55 }}>{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

/* review row */
function RRow({ label, value, emoji }: { label: string; value: string; emoji?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
      borderBottom: `1px solid ${BDR}` }}>
      {emoji && <span style={{ fontSize: 18, width: 28, textAlign: "center", flexShrink: 0 }}>{emoji}</span>}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: T3, fontWeight: 600, letterSpacing: .5,
          textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 15, color: T1, fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
export default function CreateChallengePage() {
  const router = useRouter();

  /* ── form state ── */
  const [step, setStep]     = useState(0);
  const [dir,  setDir]      = useState(1); // 1 = forward, -1 = back

  /* step 0 — goal type */
  const [goalType, setGoalType] = useState("");

  /* step 1 — target */
  const [targetVal, setTargetVal] = useState<number | string>("");
  const [customUnit, setCustomUnit] = useState("reps");

  /* step 2 — details */
  const [title, setTitle]       = useState("");
  const [desc,  setDesc]        = useState("");
  const [diff,  setDiff]        = useState("medium");

  /* step 3 — schedule */
  const [startDate, setStartDate] = useState(addDays(today(), 1));
  const [endDate,   setEndDate]   = useState(addDays(today(), 8));
  const [scope,     setScope]     = useState("individual");

  /* step 4 — settings */
  const [maxP,        setMaxP]        = useState("");
  const [reward,      setReward]      = useState("🏅 Wellness Badge");
  const [leaderboard, setLeaderboard] = useState(true);
  const [visibility,  setVisibility]  = useState("public");

  /* step 5 — review/submit */
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [submitErr,  setSubmitErr]  = useState("");

  const gt = GOAL_TYPES.find(g => g.id === goalType);
  const sc = SCOPES.find(s => s.id === scope);
  const df = DIFFICULTIES.find(d => d.id === diff);

  /* ── nav ── */
  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); };
  const next = () => go(step + 1);
  const back = () => go(step - 1);

  /* ── can proceed per step ── */
  const canNext = [
    !!goalType,
    targetVal !== "" && Number(targetVal) > 0,
    title.trim().length >= 3,
    !!startDate && !!endDate && endDate > startDate,
    true,
    true,
  ][step];

  /* ── submit ── */
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitErr("");
    try {
      await api("/api/challenges", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: desc.trim(),
          goal_type: goalType,
          daily_target: Number(targetVal),
          target_unit: gt?.id === "custom" ? customUnit : gt?.unit,
          difficulty: diff,
          start_date: startDate,
          end_date: endDate,
          scope,
          max_participants: maxP ? parseInt(maxP) : null,
          reward_label: reward.trim(),
          leaderboard_enabled: leaderboard,
          visibility,
        }),
      });
      setDone(true);
      setTimeout(() => router.push("/challanges"), 2400);
    } catch (e: any) {
      setSubmitErr(e?.message || "Something went wrong");
      setSubmitting(false);
    }
  };

  /* ═══════════════════════════════════════════
     SUCCESS SCREEN
  ═══════════════════════════════════════════ */
  if (done) return (
    <div style={{ minHeight: "100dvh", background: BG, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center",
      fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif" }}>
      <motion.div initial={{ scale: .5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
        <h1 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 800, color: T1, letterSpacing: "-.5px" }}>
          Challenge Created!
        </h1>
        <p style={{ margin: "0 0 6px", fontSize: 15, color: T2 }}>"{title}" is live.</p>
        <p style={{ margin: 0, fontSize: 13, color: T3 }}>Redirecting…</p>
      </motion.div>
    </div>
  );

  /* ═══════════════════════════════════════════
     MAIN RENDER
  ═══════════════════════════════════════════ */
  const totalSteps = STEPS.length;
  const progress   = ((step) / (totalSteps - 1)) * 100;

  return (
    <div style={{ minHeight: "100dvh", background: BG, color: T1,
      fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif" }}>

      {/* ── NAV BAR ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(15,23,42,0.9)", backdropFilter: "blur(24px) saturate(180%)",
        borderBottom: `1px solid ${BDR}`,
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
      }}>
        <button onClick={step === 0 ? () => router.back() : back}
          style={{ width: 36, height: 36, borderRadius: "50%", background: SURF, border: "none",
            color: T2, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0, lineHeight: 1 }}>‹</button>

        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T1, letterSpacing: "-.3px" }}>
            Create Challenge
          </p>
          <p style={{ margin: 0, fontSize: 11, color: T3, marginTop: 1 }}>
            Step {step + 1} of {totalSteps} · {STEPS[step].label}
          </p>
        </div>

        {/* step dots */}
        <div style={{ display: "flex", gap: 5 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 18 : 6, height: 6, borderRadius: 3,
              background: i <= step ? `linear-gradient(90deg, ${PUR}, ${PURLT})` : SURF,
              transition: "all .3s", cursor: i < step ? "pointer" : "default",
            }} onClick={() => i < step && go(i)} />
          ))}
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div style={{ height: 2, background: SURF }}>
        <motion.div animate={{ width: `${progress}%` }} transition={{ duration: .4, ease: "easeOut" }}
          style={{ height: "100%", background: `linear-gradient(90deg, ${PUR}, ${PURLT})` }} />
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 16px 140px" }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step}
            custom={dir}
            variants={{
              enter: (d) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
              center: { opacity: 1, x: 0 },
              exit:  (d) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
            }}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: .22, ease: [.22, 1, .36, 1] }}
          >

            {/* ════ STEP 0: GOAL TYPE ════ */}
            {step === 0 && (
              <StepSection title="What's the goal?" subtitle="Choose what participants will be measured on.">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {GOAL_TYPES.map(g => {
                    const sel = goalType === g.id;
                    return (
                      <button key={g.id} onClick={() => setGoalType(g.id)}
                        style={{
                          background: sel ? `linear-gradient(135deg, ${PUR}33, ${PURLT}22)` : CARD,
                          border: `1.5px solid ${sel ? PUR + "88" : BDR}`,
                          borderRadius: 16, padding: "18px 14px",
                          cursor: "pointer", textAlign: "left", transition: "all .15s",
                          outline: "none",
                          boxShadow: sel ? `0 0 0 1px ${PUR}44, 0 6px 20px rgba(124,58,237,.2)` : "none",
                        }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>{g.emoji}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: sel ? T1 : T2, marginBottom: 3 }}>{g.label}</div>
                        <div style={{ fontSize: 11, color: T3 }}>{g.unit}</div>
                      </button>
                    );
                  })}
                </div>
              </StepSection>
            )}

            {/* ════ STEP 1: TARGET ════ */}
            {step === 1 && gt && (
              <StepSection title="Set the target"
                subtitle={`How many ${gt.unit} should each participant aim for?`}>

                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <div style={{ fontSize: 64, marginBottom: 8 }}>{gt.emoji}</div>
                  <div style={{ fontSize: 13, color: T3, fontWeight: 600,  textTransform: "uppercase",
                    letterSpacing: .6 }}>{gt.label}</div>
                </div>

                {/* big number input */}
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                  <input
                    type="number" value={targetVal}
                    onChange={e => setTargetVal(e.target.value)}
                    min={gt.min} max={gt.max} step={gt.step}
                    style={{ width: "100%", textAlign: "center", background: "none",
                      border: "none", borderBottom: `2px solid ${PUR}`,
                      fontSize: 52, fontWeight: 800, color: T1,
                      outline: "none", fontFamily: "inherit", padding: "0 0 8px",
                      caretColor: PUR, colorScheme: "dark" }}
                  />
                  <div style={{ marginTop: 8, fontSize: 14, color: T2, fontWeight: 500 }}>
                    {gt.id === "custom" ? (
                      <input type="text" value={customUnit} onChange={e => setCustomUnit(e.target.value)}
                        placeholder="unit label…"
                        style={{ background: INP, border: `1px solid ${BDR}`, borderRadius: 8,
                          padding: "5px 12px", color: T1, fontSize: 13, outline: "none",
                          textAlign: "center", fontFamily: "inherit" }} />
                    ) : gt.unit}
                  </div>
                </div>

                {/* quick select chips */}
                <SLabel>Quick select</SLabel>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[gt.min, Math.round((gt.min + gt.defaultVal) / 2), gt.defaultVal,
                    Math.round((gt.defaultVal + gt.max) / 2)].map(v => (
                    <button key={v} onClick={() => setTargetVal(v)}
                      style={{ padding: "7px 16px", borderRadius: 30, border: "none", cursor: "pointer",
                        fontSize: 13, fontWeight: 600, transition: "all .15s",
                        background: Number(targetVal) === v ? PUR : SURF,
                        color: Number(targetVal) === v ? "#fff" : T2 }}>
                      {v}
                    </button>
                  ))}
                </div>
              </StepSection>
            )}

            {/* ════ STEP 2: DETAILS ════ */}
            {step === 2 && (
              <StepSection title="Challenge details" subtitle="Give your challenge a name and some context.">

                <div style={{ marginBottom: 18 }}>
                  <SLabel>Title <span style={{ color: "#ef4444" }}>*</span></SLabel>
                  <TInput type="text" placeholder="e.g. April Steps Blitz…"
                    value={title} onChange={e => setTitle(e.target.value)}
                    style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.3px" }} />
                  <div style={{ textAlign: "right", fontSize: 11, color: T3, marginTop: 5 }}>
                    {title.length}/80
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <SLabel>Description <span style={{ color: T3, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>optional</span></SLabel>
                  <TArea placeholder="Tell participants what this challenge is about…"
                    value={desc} onChange={e => setDesc(e.target.value)} rows={4} />
                </div>

                <div>
                  <SLabel>Difficulty</SLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    {DIFFICULTIES.map(d => {
                      const sel = diff === d.id;
                      return (
                        <button key={d.id} onClick={() => setDiff(d.id)}
                          style={{ padding: "14px 10px", borderRadius: 14, border: "none", cursor: "pointer",
                            background: sel ? `${d.color}20` : CARD, textAlign: "center",
                            outline: sel ? `1.5px solid ${d.color}66` : "1.5px solid transparent",
                            transition: "all .15s" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: sel ? d.color : T2,
                            marginBottom: 3 }}>{d.label}</div>
                          <div style={{ fontSize: 10, color: T3, lineHeight: 1.3 }}>{d.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </StepSection>
            )}

            {/* ════ STEP 3: SCHEDULE ════ */}
            {step === 3 && (
              <StepSection title="When & who?" subtitle="Set dates and who the challenge is open to.">

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div>
                    <SLabel>Start date</SLabel>
                    <TInput type="date" value={startDate}
                      min={today()}
                      onChange={e => { setStartDate(e.target.value); if (e.target.value >= endDate) setEndDate(addDays(e.target.value, 7)); }}
                      style={{ padding: "11px 12px" }} />
                  </div>
                  <div>
                    <SLabel>End date</SLabel>
                    <TInput type="date" value={endDate}
                      min={addDays(startDate, 1)}
                      onChange={e => setEndDate(e.target.value)}
                      style={{ padding: "11px 12px" }} />
                  </div>
                </div>

                {/* duration pill */}
                {startDate && endDate && (
                  <div style={{ background: `${PUR}18`, border: `1px solid ${PUR}33`,
                    borderRadius: 10, padding: "9px 14px", marginBottom: 24,
                    display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>📆</span>
                    <span style={{ fontSize: 13, color: T2, fontWeight: 500 }}>
                      {Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)} day challenge
                      &nbsp;·&nbsp; {fmtDate(startDate)} → {fmtDate(endDate)}
                    </span>
                  </div>
                )}

                <SLabel>Scope</SLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SCOPES.map(s => {
                    const sel = scope === s.id;
                    return (
                      <button key={s.id} onClick={() => setScope(s.id)}
                        style={{ background: sel ? `${PUR}1E` : CARD,
                          border: `1.5px solid ${sel ? PUR + "66" : BDR}`,
                          borderRadius: 14, padding: "14px 16px",
                          display: "flex", alignItems: "center", gap: 14,
                          cursor: "pointer", textAlign: "left", transition: "all .15s",
                          outline: "none" }}>
                        <span style={{ fontSize: 22 }}>{s.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: sel ? T1 : T2, marginBottom: 2 }}>{s.label}</div>
                          <div style={{ fontSize: 12, color: T3 }}>{s.desc}</div>
                        </div>
                        {sel && (
                          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={PUR} strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </StepSection>
            )}

            {/* ════ STEP 4: SETTINGS ════ */}
            {step === 4 && (
              <StepSection title="Settings" subtitle="Fine-tune your challenge rules.">

                <div style={{ marginBottom: 20 }}>
                  <SLabel>Max participants <span style={{ color: T3, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>optional</span></SLabel>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                      fontSize: 16, pointerEvents: "none" }}>👥</span>
                    <TInput type="number" value={maxP}
                      onChange={e => setMaxP(e.target.value)}
                      placeholder="Unlimited"
                      style={{ paddingLeft: 42 }} />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <SLabel>Reward label</SLabel>
                  <TInput type="text" value={reward}
                    onChange={e => setReward(e.target.value)}
                    placeholder="e.g. 🏅 Wellness Badge" />
                  <div style={{ fontSize: 11, color: T3, marginTop: 5 }}>
                    Shown to participants on completion
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <SLabel>Visibility</SLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {VISIBILITY.map(v => {
                      const sel = visibility === v.id;
                      return (
                        <button key={v.id} onClick={() => setVisibility(v.id)}
                          style={{ background: sel ? `${PUR}1E` : CARD,
                            border: `1.5px solid ${sel ? PUR + "66" : BDR}`,
                            borderRadius: 14, padding: "14px 12px",
                            cursor: "pointer", textAlign: "left", transition: "all .15s",
                            outline: "none" }}>
                          <div style={{ fontSize: 20, marginBottom: 6 }}>{v.emoji}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: sel ? T1 : T2, marginBottom: 2 }}>{v.label}</div>
                          <div style={{ fontSize: 11, color: T3, lineHeight: 1.4 }}>{v.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* leaderboard toggle */}
                <div style={{ background: CARD, borderRadius: 14, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 14,
                  border: `1px solid ${BDR}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T1, marginBottom: 3 }}>Leaderboard</div>
                    <div style={{ fontSize: 12, color: T3 }}>Show rankings to all participants</div>
                  </div>
                  <Toggle value={leaderboard} onChange={setLeaderboard} />
                </div>
              </StepSection>
            )}

            {/* ════ STEP 5: REVIEW ════ */}
            {step === 5 && (
              <StepSection title="Review & publish" subtitle="Double-check everything before launching.">

                {/* hero banner */}
                <div style={{ background: `linear-gradient(135deg, ${PUR}33, ${PURLT}22)`,
                  border: `1px solid ${PUR}44`, borderRadius: 18,
                  padding: "20px 18px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", right: -10, top: -10, fontSize: 80, opacity: .08 }}>
                    {gt?.emoji}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{gt?.emoji}</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: PURLT, letterSpacing: .6,
                        textTransform: "uppercase" }}>Challenge</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: T1, letterSpacing: "-.4px" }}>{title}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {[
                      { label: `${df?.label}`, color: df?.color ?? PUR },
                      { label: `${gt?.label}`, color: PUR },
                      { label: sc?.label ?? scope, color: "#06b6d4" },
                    ].map(tag => (
                      <div key={tag.label} style={{ padding: "3px 10px", borderRadius: 99,
                        background: `${tag.color}22`, fontSize: 11, fontWeight: 700,
                        color: tag.color }}>
                        {tag.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* detail rows */}
                <div style={{ background: CARD, borderRadius: 16, padding: "4px 16px",
                  border: `1px solid ${BDR}`, marginBottom: 16 }}>
                  <RRow emoji={gt?.emoji} label="Target"
                    value={`${targetVal} ${gt?.id === "custom" ? customUnit : gt?.unit}`} />
                  <RRow emoji="📅" label="Duration"
                    value={`${fmtDate(startDate)} → ${fmtDate(endDate)}`} />
                  <RRow emoji={sc?.emoji} label="Scope"
                    value={sc?.label ?? scope} />
                  <RRow emoji="🏆" label="Reward"
                    value={reward || "—"} />
                  <RRow emoji={visibility === "public" ? "🌍" : "🔒"} label="Visibility"
                    value={visibility === "public" ? "Public" : "Private"} />
                  <RRow emoji="📊" label="Leaderboard"
                    value={leaderboard ? "Enabled" : "Disabled"} />
                  {maxP && <RRow emoji="👥" label="Max participants" value={maxP} />}
                </div>

                {desc && (
                  <div style={{ background: CARD, borderRadius: 14, padding: "12px 16px",
                    border: `1px solid ${BDR}`, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: T3, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: .6, marginBottom: 6 }}>Description</div>
                    <div style={{ fontSize: 14, color: T2, lineHeight: 1.6 }}>{desc}</div>
                  </div>
                )}

                {submitErr && (
                  <div style={{ background: "rgba(239,68,68,.15)", border: "1px solid rgba(239,68,68,.35)",
                    borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#f87171",
                    marginBottom: 12 }}>
                    ⚠ {submitErr}
                  </div>
                )}
              </StepSection>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── BOTTOM ACTION BAR ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(15,23,42,0.96)", backdropFilter: "blur(24px) saturate(180%)",
        borderTop: `1px solid ${BDR}`,
        padding: `14px 16px calc(14px + env(safe-area-inset-bottom))`,
        display: "flex", gap: 10,
      }}>
        {step > 0 && (
          <button onClick={back}
            style={{ flex: 1, height: 52, background: SURF, border: `1px solid ${BDR}`,
              color: T2, fontSize: 15, fontWeight: 600, borderRadius: 14, cursor: "pointer" }}>
            Back
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button onClick={next} disabled={!canNext}
            style={{
              flex: 2, height: 52, border: "none", fontSize: 15, fontWeight: 700,
              borderRadius: 14, cursor: canNext ? "pointer" : "not-allowed",
              transition: "all .2s",
              background: canNext
                ? `linear-gradient(135deg, ${PUR} 0%, ${PURLT} 100%)`
                : SURF,
              color: canNext ? "#fff" : T3,
              boxShadow: canNext ? `0 8px 24px ${PUR}44` : "none",
            }}>
            Continue →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}
            style={{
              flex: 2, height: 52, border: "none", fontSize: 15, fontWeight: 700,
              borderRadius: 14, cursor: submitting ? "not-allowed" : "pointer",
              background: `linear-gradient(135deg, ${GREEN} 0%, #059669 100%)`,
              color: "#fff", opacity: submitting ? .7 : 1,
              boxShadow: `0 8px 24px rgba(16,185,129,.4)`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "opacity .2s",
            }}>
            {submitting
              ? <><motion.span animate={{ rotate: 360 }} transition={{ duration: .8, repeat: Infinity, ease: "linear" }}
                  style={{ display: "inline-block", fontSize: 18 }}>↻</motion.span> Publishing…</>
              : "🚀 Launch Challenge"
            }
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(.55); cursor: pointer; }
        select option { background: #1e293b; }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
