"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

// ─── constants ────────────────────────────────────────────────────────────────
const VIOLET = "#7C5CFC";
const VIOLET_BG = "rgba(124,92,252,.12)";
const VIOLET_BORDER = "rgba(124,92,252,.22)";
const F = "'Plus Jakarta Sans',sans-serif";
const WS_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "https://cbiqa.dev.honeywellcloud.com/socialapi")
    .replace(/^http/, "ws")
    .replace(/\/$/, "");

// ─── types ────────────────────────────────────────────────────────────────────
interface PartnerUser {
  id: string;
  name: string;
  pic: string | null;
  steps_today: number;
  step_streak_days: number;
  habits_total: number;
  habits_done: number;
  habits_pct: number;
}

interface Partner {
  pair_id: number;
  status: "pending" | "approved" | "rejected" | "blocked";
  assignment_type: "manual" | "admin" | "auto";
  week_start: string;
  direction: "sent" | "received";
  approved_at: string | null;
  keep_deadline: string | null;
  my_keep_vote: boolean | null;
  their_keep_vote: boolean | null;
  partner: PartnerUser;
  unread_messages: number;
  already_nudged: boolean;
  can_nudge: boolean;
}

interface ApiMessage {
  id: number;
  sender_id: string;
  sender_name: string;
  body: string;
  sent_at: string;
  read_at: string | null;
  is_mine: boolean;
}

interface ChatMsg {
  id: string | number;
  type?: "date" | "activity" | "nudge" | "chat";
  from?: "me" | "them";
  text?: string;
  nudgeText?: string;
  nudgeFrom?: "me" | "them";
  time?: string;
  label?: string;
  sub?: string;
  pending?: boolean;
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function fmtDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── smart suggestions ────────────────────────────────────────────────────────
function getSmartSuggestions(msgs: ChatMsg[], partner: PartnerUser): string[] {
  const now = new Date();
  const hour = now.getHours();
  const dow = now.getDay(); // 0=Sun, 1=Mon … 6=Sat
  const add = (...items: string[]) => { for (const s of items) if (!pool.includes(s)) pool.push(s); };
  const pool: string[] = [];

  const chatMsgs = msgs.filter(m => m.type === "chat");
  const lastMsg = chatMsgs[chatMsgs.length - 1];
  const lastThem = [...chatMsgs].reverse().find(m => m.from === "them");
  const lastMe   = [...chatMsgs].reverse().find(m => m.from === "me");
  const lastNudge = [...msgs].reverse().find(m => m.type === "nudge");
  const isLastMine = lastMsg?.from === "me";
  const isLastNudge = msgs[msgs.length - 1]?.type === "nudge";

  // ── 0. Empty chat — ice-breakers ──────────────────────────────────────────
  if (chatMsgs.length === 0) {
    add(
      "Hey! Ready to crush it? 👋",
      "What's your goal today?",
      "Let's hold each other accountable 💪",
      "Hi! Let's do this! 🚀",
    );
  }

  // ── 1. Last received message — keyword reply ───────────────────────────────
  if (lastThem?.text && !isLastNudge) {
    const t = lastThem.text.toLowerCase();
    if (/\b(great|done|completed|finished|crushed|killed|nailed|yes|yep|did it|all done|achieved)\b/.test(t)) {
      add("You crushed it! 🙌", "That's the spirit 💪", "Amazing! 🔥");
    } else if (/\b(skip|skipped|missed|tired|exhausted|can't|cant|won't|wont|fail|failed|didn't|didnt|nope|struggle)\b/.test(t)) {
      add("Don't worry!", "Tomorrow's a fresh start 🌅", "I believe in you! 💙");
    } else if (/\?/.test(t)) {
      add("Definitely! 👍", "Not yet 😅", "Working on it!");
    } else if (/\b(gm|morning|good morning|rise|wake)\b/.test(t)) {
      add("Good morning! ☀️", "Let's make it count!", "Ready to go 💪");
    } else if (/\b(gn|night|good night|sleep|done for the day|bed)\b/.test(t)) {
      add("Good night! 🌙", "Rest well!", "Great day overall 🙌");
    } else if (/\b(how|what|where|when|why|which)\b/.test(t)) {
      add("I'm good! 😊", "Almost there!", "Just getting started!");
    } else if (/\b(haha|lol|😂|😄|funny|lmao)\b/.test(t)) {
      add("Haha 😄", "Too good!", "You're funny 😂");
    } else if (/\b(miss|missing|where are you|check in)\b/.test(t)) {
      add("I'm here! 👋", "Sorry, been busy!", "Checking in now ✅");
    }
  }

  // ── 2. I sent the last message — waiting chips ─────────────────────────────
  if (isLastMine && pool.length < 3) {
    add("Still waiting… 😄", "No pressure 😅", "Your turn! 👀");
  }

  // ── 3. Last action was a nudge I sent ─────────────────────────────────────
  if (isLastNudge && pool.length < 3) {
    add("Just nudged you! 👀", "Your turn 😄", "Get going! 💪");
  }

  // ── 4. Streak-aware ───────────────────────────────────────────────────────
  if (pool.length < 4) {
    const streak = partner.step_streak_days;
    if (streak >= 7)      add(`${streak} days strong! 🔥🔥`);
    else if (streak >= 3) add("Keep that streak alive! 🔥");
    else if (streak === 1) add("Day 1 down, keep it going!");
    else if (streak === 0) add("Let's start a new streak! 🔥");
  }

  // ── 5. Partner progress context ───────────────────────────────────────────
  if (pool.length < 4) {
    const { habits_done, habits_total, steps_today } = partner;
    if (habits_total > 0 && habits_done === 0)                      add("Have you started yet? 👀", "Let's go! 💪");
    else if (habits_total > 0 && habits_done > 0 && habits_done < habits_total) add("Almost there!", "Keep going! 💪");
    else if (habits_total > 0 && habits_done >= habits_total)       add("You're on fire! 🔥", "Perfect day! 🏆");

    if (steps_today < 2000)      add("Time to get moving! 🚶");
    else if (steps_today >= 8000) add("Step legend! 👟");
  }

  // ── 6. Day-of-week ────────────────────────────────────────────────────────
  if (pool.length < 4) {
    if (dow === 1)      add("New week, fresh start! 💫", "Let's own this week!");
    else if (dow === 5) add("Almost the weekend! 💪", "Finish strong!");
    else if (dow === 0) add("Make Sunday count!", "Last chance this week!");
  }

  // ── 7. Time-of-day fallback ───────────────────────────────────────────────
  if (pool.length < 4) {
    if (hour >= 6 && hour < 12)   add("Good morning! ☀️", "Let's have a great day!");
    else if (hour >= 12 && hour < 17) add("How's the day going?", "Checked your habits? ✅");
    else if (hour >= 17 && hour < 22) add("How'd today go?", "Almost done for the day!");
    else                           add("Still up? 😄", "Rest up for tomorrow!");
  }

  // ── 8. Always-available padding ───────────────────────────────────────────
  add("Nice one! 👏", "Let's go 💪", "Keep going!", "I'm behind 😅");

  return pool.slice(0, 5);
}

function groupMessages(apiMsgs: ApiMessage[]): ChatMsg[] {
  const out: ChatMsg[] = [];
  let lastDate = "";
  for (const m of apiMsgs) {
    const dateLabel = fmtDateLabel(m.sent_at);
    if (dateLabel !== lastDate) {
      out.push({ id: `date-${m.id}`, type: "date", label: dateLabel });
      lastDate = dateLabel;
    }
    out.push({
      id: m.id,
      type: "chat",
      from: m.is_mine ? "me" : "them",
      text: m.body,
      time: fmtTime(m.sent_at),
    });
  }
  return out;
}

// ─── icons ────────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
    <path d="M8.5 1.5L1.5 8.5l7 7" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
  </svg>
);
const NudgeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const Av = ({ name, size = 36 }: { name: string; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: VIOLET, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.3, fontWeight: 800, color: "#fff", flexShrink: 0, fontFamily: F, letterSpacing: "-.01em" }}>
    {initials(name)}
  </div>
);

// ─── keep/change vote banner ──────────────────────────────────────────────────
function VoteBanner({ partner, onVote }: { partner: Partner; onVote: (keep: boolean) => void }) {
  const myVote = partner.my_keep_vote;
  const bothKeep = partner.my_keep_vote === true && partner.their_keep_vote === true;
  const eitherChange = partner.my_keep_vote === false || partner.their_keep_vote === false;

  if (bothKeep) return (
    <div style={{ margin: "0 0 2px", padding: "10px 16px", background: "rgba(45,212,100,.10)", borderBottom: "1px solid rgba(45,212,100,.18)", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 16 }}>🤝</span>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#4ade80" }}>Both agreed — continuing together next week!</p>
    </div>
  );

  if (eitherChange) return (
    <div style={{ margin: "0 0 2px", padding: "10px 16px", background: "rgba(251,146,60,.10)", borderBottom: "1px solid rgba(251,146,60,.18)", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 16 }}>🔄</span>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#fb923c" }}>New partner coming Monday</p>
    </div>
  );

  if (myVote !== null) return (
    <div style={{ margin: "0 0 2px", padding: "10px 16px", background: "rgba(124,92,252,.10)", borderBottom: "1px solid rgba(124,92,252,.20)", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 14 }}>⏳</span>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,.55)" }}>Waiting for {partner.partner.name}'s vote…</p>
    </div>
  );

  return (
    <div style={{ padding: "12px 16px", background: "rgba(124,92,252,.12)", borderBottom: `1px solid ${VIOLET_BORDER}`, flexShrink: 0 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#C4B5FD", marginBottom: 8 }}>
        Keep <span style={{ color: "#fff" }}>{partner.partner.name}</span> as your buddy next week?
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onVote(true)} style={{ flex: 1, padding: "9px 0", borderRadius: 12, border: "none", background: VIOLET, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Keep 👍
        </button>
        <button onClick={() => onVote(false)} style={{ flex: 1, padding: "9px 0", borderRadius: 12, border: `1px solid rgba(255,255,255,.15)`, background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.7)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Change 🔄
        </button>
      </div>
    </div>
  );
}

// ─── no-partner screen (4 states) ────────────────────────────────────────────
type NoPartnerState = "neutral" | "queued" | "opted_out";

function NoPartnerScreen({ onBack, onMatched, initialState }: { onBack: () => void; onMatched: (p: Partner) => void; initialState: NoPartnerState }) {
  const [state, setState] = useState<NoPartnerState>(initialState);
  const [finding, setFinding] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const refreshAndMatch = async () => {
    const list = await api<{ partners: Partner[]; seeking_partner: boolean; partner_opt_out: boolean }>("/api/partners");
    const approved = list.partners.find(p => p.status === "approved");
    if (approved) setTimeout(() => onMatched(approved), 1200);
  };

  const findRandom = async () => {
    if (finding) return;
    setFinding(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${WS_BASE.replace(/^ws/, "http")}/api/partners/find-random`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.status === 201) {
        const data = await res.json();
        showToast(`You've been matched with ${data.partner.name}! Say hi 👋`, true);
        await refreshAndMatch();
      } else if (res.status === 202) {
        const data = await res.json();
        showToast(data.message || "We're finding you the perfect partner…", true);
        setState("queued");
      } else if (res.status === 409) {
        await refreshAndMatch();
      } else {
        showToast("Something went wrong. Please try again.", false);
      }
    } catch {
      showToast("Something went wrong. Please try again.", false);
    } finally {
      setFinding(false);
    }
  };

  const cancelQueue = async () => {
    if (cancelling) return;
    setCancelling(true);
    try {
      const token = getAccessToken();
      await fetch(`${WS_BASE.replace(/^ws/, "http")}/api/partners/queue`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      setState("neutral");
    } catch {
      showToast("Could not cancel. Try again.", false);
    } finally {
      setCancelling(false);
    }
  };

  const optOut = async () => {
    try {
      const token = getAccessToken();
      await fetch(`${WS_BASE.replace(/^ws/, "http")}/api/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ partner_opt_out: true }),
      });
      setState("opted_out");
    } catch {
      showToast("Something went wrong. Please try again.", false);
    }
  };

  // WS + 15s polling fallback: listen for partner_matched / partner_assigned while queued
  useEffect(() => {
    if (state !== "queued") return;
    const token = getAccessToken();

    // 15s polling fallback
    const pollTimer = setInterval(refreshAndMatch, 15000);

    // WebSocket
    if (!token) return () => clearInterval(pollTimer);
    const ws = new WebSocket(`${WS_BASE}/ws?token=${token}`);
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "partner_matched" || msg.type === "partner_assigned") {
          showToast(`You've been matched with ${msg.partner_name || "someone"}!`, true);
          clearInterval(pollTimer);
          refreshAndMatch();
        }
      } catch { /* ignore */ }
    };
    return () => {
      clearInterval(pollTimer);
      ws.onclose = null;
      ws.close();
    };
  }, [state]);

  const FindBtn = ({ label, loading }: { label: string; loading: boolean }) => (
    <button
      onClick={findRandom}
      disabled={loading}
      style={{ width: "100%", maxWidth: 320, height: 50, borderRadius: 14, border: "none", background: loading ? "rgba(109,66,240,.4)" : "linear-gradient(135deg,#6D42F0 0%,#9B7FE8 100%)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "default" : "pointer", boxShadow: loading ? "none" : "0 4px 24px rgba(109,66,240,.50)", transition: "all .18s", letterSpacing: "-.02em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
    >
      {loading
        ? <><div style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .7s linear infinite" }} />Looking…</>
        : <>{label}</>}
    </button>
  );

  return (
    <div style={{ height: "100dvh", background: "#08080F", display: "flex", flexDirection: "column", fontFamily: F, color: "#fff", position: "relative" as const, overflowY: "auto" }}>
      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulse-ring{0%,100%{transform:scale(.92);opacity:.35}50%{transform:scale(1.08);opacity:.9}}
      `}</style>

      {/* ambient glow */}
      <div style={{ position: "fixed" as const, top: "10%", left: "50%", transform: "translateX(-50%)", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(109,66,240,.18) 0%,transparent 70%)", pointerEvents: "none" as const }} />

      {/* header */}
      <div style={{ padding: "calc(env(safe-area-inset-top,44px) + 10px) 20px 10px", flexShrink: 0, position: "relative" as const, zIndex: 1 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 0", display: "flex", alignItems: "center" }}>
          <BackIcon />
        </button>
      </div>

      {/* toast */}
      {toast && (
        <div style={{ margin: "0 20px 10px", padding: "11px 16px", borderRadius: 14, background: toast.ok ? "rgba(45,212,100,.12)" : "rgba(248,113,113,.12)", border: `1px solid ${toast.ok ? "rgba(45,212,100,.28)" : "rgba(248,113,113,.28)"}`, flexShrink: 0, zIndex: 1, position: "relative" as const }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: toast.ok ? "#4ade80" : "#f87171", textAlign: "center" as const }}>{toast.msg}</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STATE: queued — in the pool, waiting for a match
      ══════════════════════════════════════════════════════════════════════ */}
      {state === "queued" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px 32px", textAlign: "center" as const, position: "relative" as const, zIndex: 1 }}>
          {/* pulsing ring icon */}
          <div style={{ position: "relative", width: 96, height: 96, marginBottom: 28 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(167,139,245,.3)", animation: "pulse-ring 2.2s ease-in-out infinite" }} />
            <div style={{ position: "absolute", inset: 8, borderRadius: "50%", background: "rgba(109,66,240,.15)", border: "1.5px solid rgba(167,139,245,.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>
              🔍
            </div>
          </div>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#F2EEFF", letterSpacing: "-.04em", lineHeight: 1.2, marginBottom: 10 }}>
            Searching for your buddy…
          </p>
          <p style={{ fontSize: 14, color: "rgba(242,238,255,.48)", lineHeight: 1.7, maxWidth: 270, marginBottom: 8 }}>
            We're matching you with someone who shares your goals. Usually takes just a minute.
          </p>
          <p style={{ fontSize: 12, color: "rgba(167,139,245,.55)", fontWeight: 500, marginBottom: 36 }}>
            You'll get a notification the moment you're paired ✨
          </p>
          <button
            onClick={cancelQueue}
            disabled={cancelling}
            style={{ width: "100%", maxWidth: 320, height: 46, borderRadius: 14, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.5)", fontSize: 14, fontWeight: 600, cursor: cancelling ? "default" : "pointer", transition: "all .18s", letterSpacing: "-.01em" }}
          >
            {cancelling ? "Cancelling…" : "Cancel search"}
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STATE: opted_out — previously skipped, wants to re-join
      ══════════════════════════════════════════════════════════════════════ */}
      {state === "opted_out" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px 32px", textAlign: "center" as const, position: "relative" as const, zIndex: 1 }}>
          <div style={{ fontSize: 52, marginBottom: 20, animation: "float 4s ease-in-out infinite" }}>💤</div>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#F2EEFF", letterSpacing: "-.04em", lineHeight: 1.2, marginBottom: 10 }}>
            Partner pairing is off
          </p>
          <p style={{ fontSize: 14, color: "rgba(242,238,255,.48)", lineHeight: 1.7, maxWidth: 270, marginBottom: 10 }}>
            You chose to skip this earlier — totally fine. But people with an accountability buddy are <span style={{ color: "#C4B5FD", fontWeight: 600 }}>2× more likely</span> to hit their weekly goals.
          </p>
          <p style={{ fontSize: 13, color: "rgba(242,238,255,.32)", lineHeight: 1.6, maxWidth: 260, marginBottom: 36 }}>
            Ready to give it a try? You can leave anytime.
          </p>
          <FindBtn label="✨  Turn on Partner Pairing" loading={finding} />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STATE: neutral — first time, no choice made yet
      ══════════════════════════════════════════════════════════════════════ */}
      {state === "neutral" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 24px 32px", position: "relative" as const, zIndex: 1, overflowY: "auto" }}>

          {/* hero illustration */}
          <div style={{ animation: "float 4s ease-in-out infinite", marginBottom: 20, marginTop: 8 }}>
            <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
              <ellipse cx="80" cy="95" rx="55" ry="16" fill="rgba(109,66,240,.10)"/>
              {/* left person */}
              <circle cx="44" cy="36" r="20" fill="rgba(109,66,240,.22)" stroke="rgba(167,139,245,.5)" strokeWidth="1.5"/>
              <circle cx="44" cy="30" r="8" fill="#9B7FE8"/>
              <path d="M28 68c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#9B7FE8" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              {/* right person */}
              <circle cx="116" cy="36" r="20" fill="rgba(76,217,123,.14)" stroke="rgba(76,217,123,.45)" strokeWidth="1.5"/>
              <circle cx="116" cy="30" r="8" fill="#4CD97B"/>
              <path d="M100 68c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="#4CD97B" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              {/* connecting spark */}
              <path d="M66 40 Q80 28 94 40" stroke="rgba(245,200,66,.7)" strokeWidth="1.8" strokeLinecap="round" fill="none" strokeDasharray="3 3"/>
              <circle cx="80" cy="26" r="4" fill="#F5C842"/>
              <path d="M78 26 L80 22 L82 26" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>

          {/* headline */}
          <p style={{ fontSize: 24, fontWeight: 800, color: "#F2EEFF", letterSpacing: "-.05em", lineHeight: 1.15, marginBottom: 8, textAlign: "center" as const }}>
            Hit your goals together
          </p>
          <p style={{ fontSize: 14, color: "rgba(242,238,255,.50)", lineHeight: 1.7, maxWidth: 270, marginBottom: 24, textAlign: "center" as const }}>
            Get paired with a real person from your org who's on the same journey. Check in daily, motivate each other, skip less.
          </p>

          {/* benefit cards */}
          <div style={{ width: "100%", maxWidth: 340, marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { emoji: "🔥", color: "#fb923c", bg: "rgba(251,146,60,.10)", border: "rgba(251,146,60,.20)", title: "Streak accountability", desc: "Your buddy sees your streak — and you see theirs. Hard to quit when someone's watching." },
              { emoji: "👀", color: "#A78BFA", bg: "rgba(167,139,245,.10)", border: "rgba(167,139,245,.20)", title: "Live progress check-ins", desc: "Steps, habits — real numbers, updated throughout the day. No hiding." },
              { emoji: "💬", color: "#4CD97B", bg: "rgba(76,217,123,.10)", border: "rgba(76,217,123,.20)", title: "A nudge at the right moment", desc: "Stuck in a slump? One message from your buddy can turn the day around." },
              { emoji: "📈", color: "#F5C842", bg: "rgba(245,200,66,.10)", border: "rgba(245,200,66,.20)", title: "2× better follow-through", desc: "Research shows shared commitment is the single biggest predictor of habit success." },
            ].map(({ emoji, color, bg, border, title, desc }) => (
              <div key={title} style={{ display: "flex", gap: 12, padding: "12px 14px", background: bg, border: `1px solid ${border}`, borderRadius: 14 }}>
                <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{emoji}</div>
                <div style={{ textAlign: "left" as const }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color, letterSpacing: "-.02em", lineHeight: 1.2, marginBottom: 3 }}>{title}</p>
                  <p style={{ fontSize: 12, color: "rgba(242,238,255,.40)", fontWeight: 400, lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* primary CTA */}
          <FindBtn label="🤝  Find my accountability buddy" loading={finding} />

          {/* opt-out — clear, honest, not buried */}
          <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, width: "100%", maxWidth: 340, textAlign: "left" as const }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.35)", marginBottom: 6, letterSpacing: ".02em", textTransform: "uppercase" as const }}>Prefer to go solo?</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.28)", lineHeight: 1.6, marginBottom: 10 }}>
              No pressure. You can turn this on any time from this screen. We won't pair you until you say so.
            </p>
            <button
              onClick={optOut}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.30)", fontFamily: F, textDecoration: "underline", padding: 0, letterSpacing: "-.01em" }}
            >
              I'll skip partner pairing for now
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function PartnerPage() {
  useAuthRedirect({ apiCheck: true });
  const router = useRouter();

  const [partner, setPartner] = useState<Partner | null>(null);
  const [pendingPartner, setPendingPartner] = useState<Partner | null>(null);
  const [noPartnerState, setNoPartnerState] = useState<NoPartnerState>("neutral");
  const [loadingPartner, setLoadingPartner] = useState(true);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingOlderMsgs, setLoadingOlderMsgs] = useState(false);
  const [oldestMsgId, setOldestMsgId] = useState<number | null>(null);
  const [hasMoreMsgs, setHasMoreMsgs] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [nudging, setNudging] = useState(false);
  const [nudgeError, setNudgeError] = useState<string | null>(null);
  const [nudgeSent, setNudgeSent] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const msgsTopRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgScrollRef = useRef<HTMLDivElement>(null);

  // scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  // ── load partner ──────────────────────────────────────────────────────────
  const loadPartnerData = async () => {
    try {
      const res = await api<{ partners: Partner[]; seeking_partner: boolean; partner_opt_out: boolean }>("/api/partners");
      const approved = res.partners.find(p => p.status === "approved");
      const pending = res.partners.find(p => p.status === "pending" && p.direction === "received");
      setPartner(approved ?? null);
      setPendingPartner(pending ?? null);
      setNudgeSent(approved?.already_nudged ?? false);
      if (!approved && !pending) {
        if (res.seeking_partner) setNoPartnerState("queued");
        else if (res.partner_opt_out) setNoPartnerState("opted_out");
        else setNoPartnerState("neutral");
      }
    } catch {
      setError("Failed to load partner");
    } finally {
      setLoadingPartner(false);
    }
  };

  useEffect(() => {
    loadPartnerData();
  }, []);

  // ── load messages when partner is known ───────────────────────────────────
  useEffect(() => {
    if (!partner) return;
    (async () => {
      setLoadingMsgs(true);
      try {
        const res = await api<{ messages: ApiMessage[] }>(`/api/partners/${partner.pair_id}/messages`);
        setMsgs(groupMessages(res.messages));
        if (res.messages.length > 0) {
          setOldestMsgId(res.messages[0].id);
          setHasMoreMsgs(res.messages.length >= 30);
        }
      } catch (e: any) {
        if (e?.status === 403) loadPartnerData();
        else setError("Failed to load messages");
      } finally {
        setLoadingMsgs(false);
      }
    })();
  }, [partner?.pair_id]);

  // ── load older messages (pagination) ─────────────────────────────────────
  const loadOlderMessages = async () => {
    if (!partner || loadingOlderMsgs || !hasMoreMsgs || !oldestMsgId) return;
    setLoadingOlderMsgs(true);
    try {
      const res = await api<{ messages: ApiMessage[] }>(`/api/partners/${partner.pair_id}/messages?before_id=${oldestMsgId}`);
      if (res.messages.length === 0) {
        setHasMoreMsgs(false);
        return;
      }
      const older = groupMessages(res.messages);
      setMsgs(prev => [...older, ...prev]);
      setOldestMsgId(res.messages[0].id);
      setHasMoreMsgs(res.messages.length >= 30);
      // keep scroll position stable after prepend
      const el = msgScrollRef.current;
      if (el) {
        const prevHeight = el.scrollHeight;
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight - prevHeight;
        });
      }
    } catch { /* silent */ }
    finally { setLoadingOlderMsgs(false); }
  };

  // ── scroll listener for pagination ────────────────────────────────────────
  useEffect(() => {
    const el = msgScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop < 60) loadOlderMessages();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [partner?.pair_id, loadingOlderMsgs, hasMoreMsgs, oldestMsgId]);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  const partnerRef = useRef<Partner | null>(null);
  partnerRef.current = partner;

  useEffect(() => {
    if (!partner) return;

    let destroyed = false;

    function connect() {
      if (destroyed) return;
      const token = getAccessToken();
      if (!token) return;

      // close any existing socket before opening a new one
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }

      const ws = new WebSocket(`${WS_BASE}/ws?token=${token}`);
      wsRef.current = ws;

      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          const p = partnerRef.current;
          if (msg.type === "chat_message" && p && msg.pair_id === p.pair_id && !msg.is_mine) {
            setTyping(true);
            setTimeout(() => {
              setTyping(false);
              setMsgs(prev => {
                // deduplicate — skip if message_id already in list
                if (prev.some(m => m.id === msg.message_id)) return prev;
                const dateLabel = fmtDateLabel(new Date().toISOString());
                const newMsgs: ChatMsg[] = [];
                const prevLast = [...prev].reverse().find(m => m.type === "date");
                if (!prevLast || prevLast.label !== dateLabel) {
                  newMsgs.push({ id: `date-ws-${msg.message_id}`, type: "date", label: dateLabel });
                }
                newMsgs.push({
                  id: msg.message_id,
                  type: "chat",
                  from: "them",
                  text: msg.body,
                  time: fmtTime(new Date().toISOString()),
                });
                return [...prev, ...newMsgs];
              });
            }, 600);
          } else if (msg.type === "partner_nudge") {
            // partner nudged me — show pill in chat
            const p = partnerRef.current;
            if (p) {
              const senderName = p.partner.name.split(" ")[0];
              setMsgs(prev => {
                if (prev.some(m => m.id === `nudge-ws-${msg.nudge_id ?? "latest"}`)) return prev;
                return [...prev, {
                  id: `nudge-ws-${msg.nudge_id ?? Date.now()}`,
                  type: "nudge" as const,
                  nudgeText: `${senderName} nudged you 💪`,
                  nudgeFrom: "them" as const,
                  time: fmtTime(new Date().toISOString()),
                }];
              });
            }
          } else if (msg.type === "partner_assigned") {
            // admin assigned a partner — refresh the full partner state
            loadPartnerData();
          }
        } catch { /* ignore malformed */ }
      };

      ws.onclose = (e) => {
        clearInterval(pingInterval);
        if (destroyed) return;
        if (e.code === 4001) return; // expired token — auth redirect handles it
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => { ws.close(); };
    }

    connect();

    return () => {
      destroyed = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [partner?.pair_id]); // only re-run if the actual partner changes, not on every partner state update

  // ── send message ──────────────────────────────────────────────────────────
  const send = async (text: string) => {
    if (!text.trim() || !partner || sending) return;
    const trimmed = text.trim().slice(0, 2000);
    setInput("");
    setSending(true);

    // optimistic
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const dateLabel = fmtDateLabel(now);

    setMsgs(prev => {
      const newMsgs: ChatMsg[] = [];
      const lastDate = [...prev].reverse().find(m => m.type === "date");
      if (!lastDate || lastDate.label !== dateLabel) {
        newMsgs.push({ id: `date-${tempId}`, type: "date", label: dateLabel });
      }
      newMsgs.push({ id: tempId, type: "chat", from: "me", text: trimmed, time: fmtTime(now), pending: true });
      return [...prev, ...newMsgs];
    });

    try {
      const res = await api<{ status: string; message_id: number }>(`/api/partners/${partner.pair_id}/messages`, {
        method: "POST",
        body: JSON.stringify({ body: trimmed }),
      });
      // replace temp with confirmed id
      setMsgs(prev => prev.map(m => m.id === tempId ? { ...m, id: res.message_id, pending: false } : m));
    } catch {
      // remove optimistic on failure, restore input
      setMsgs(prev => prev.filter(m => m.id !== tempId && m.id !== `date-${tempId}`));
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  };

  // ── remove partner ────────────────────────────────────────────────────────
  const removePartner = async () => {
    if (!partner || removing) return;
    setShowConfirmRemove(false);
    setRemoving(true);
    try {
      await api(`/api/partners/${partner.pair_id}`, { method: "DELETE" });
      setPartner(null);
      setMsgs([]);
      setNoPartnerState("neutral");
    } catch (e: any) {
      if (e?.status === 403) loadPartnerData();
    } finally {
      setRemoving(false);
    }
  };

  // ── accept / reject pending partner ───────────────────────────────────────
  const respondToPending = async (accept: boolean) => {
    if (!pendingPartner || responding) return;
    setResponding(true);
    try {
      await api(`/api/partners/${pendingPartner.pair_id}/respond`, {
        method: "PATCH",
        body: JSON.stringify({ action: accept ? "accept" : "reject" }),
      });
      await loadPartnerData();
    } catch (e: any) {
      if (e?.status === 403) loadPartnerData();
    } finally {
      setResponding(false);
    }
  };

  // ── nudge ─────────────────────────────────────────────────────────────────
  const sendNudge = async () => {
    if (!partner || nudging) return;
    setNudging(true);
    setNudgeError(null);
    try {
      await api("/api/partners/nudge", {
        method: "POST",
        body: JSON.stringify({ receiver_user_id: partner.partner.id }),
      });
      setNudgeSent(true);
      // append nudge pill in chat
      const firstName = partner.partner.name.split(" ")[0];
      setMsgs(prev => [...prev, {
        id: `nudge-${Date.now()}`,
        type: "nudge",
        nudgeText: `You nudged ${firstName} 💪`,
        nudgeFrom: "me" as const,
        time: fmtTime(new Date().toISOString()),
      }]);
    } catch (e: any) {
      const code = e?.data?.detail || e?.message || "";
      if (code.includes("outside_window")) setNudgeError("Nudge available 12:00–21:00 IST");
      else if (code.includes("already_nudged")) setNudgeError("Already nudged today");
      else if (code.includes("habits_already_complete")) setNudgeError("Partner already completed habits");
      else setNudgeError("Could not send nudge");
      setTimeout(() => setNudgeError(null), 3000);
    } finally {
      setNudging(false);
    }
  };

  // ── keep vote ─────────────────────────────────────────────────────────────
  const submitVote = async (keep: boolean) => {
    if (!partner) return;
    try {
      await api(`/api/partners/${partner.pair_id}/keep-vote`, {
        method: "PATCH",
        body: JSON.stringify({ keep }),
      });
      setPartner(p => p ? { ...p, my_keep_vote: keep } : p);
    } catch { /* silent — they can retry */ }
  };

  // ── show vote banner? ─────────────────────────────────────────────────────
  const showVote = !!(partner?.keep_deadline && new Date() < new Date(partner.keep_deadline));

  // ── nudge visibility ──────────────────────────────────────────────────────
  const partnerHabitsComplete = !!(partner && partner.partner.habits_done >= partner.partner.habits_total && partner.partner.habits_total > 0);
  const showNudge = !!(partner && partner.can_nudge && !partnerHabitsComplete);

  // ─── render states ────────────────────────────────────────────────────────
  if (loadingPartner) return (
    <div style={{ height: "100dvh", background: "#08080F", display: "flex", flexDirection: "column", fontFamily: F, maxWidth: 480, margin: "0 auto" }}>
      <style>{`@keyframes skshim{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      {/* header skeleton */}
      <div style={{ padding: "calc(env(safe-area-inset-top, 44px) + 12px) 16px 12px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 10, height: 17, borderRadius: 4, background: "rgba(255,255,255,.08)" }} />
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(90deg,rgba(255,255,255,.07) 25%,rgba(255,255,255,.13) 50%,rgba(255,255,255,.07) 75%)", backgroundSize: "200% 100%", animation: "skshim 1.6s ease-in-out infinite", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: "40%", height: 14, borderRadius: 6, background: "linear-gradient(90deg,rgba(255,255,255,.08) 25%,rgba(255,255,255,.14) 50%,rgba(255,255,255,.08) 75%)", backgroundSize: "200% 100%", animation: "skshim 1.6s ease-in-out infinite", marginBottom: 7 }} />
            <div style={{ width: "28%", height: 10, borderRadius: 5, background: "linear-gradient(90deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.10) 50%,rgba(255,255,255,.05) 75%)", backgroundSize: "200% 100%", animation: "skshim 1.6s 80ms ease-in-out infinite" }} />
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 20, background: "rgba(255,255,255,.06)" }} />
        </div>
      </div>
      {/* bubble skeletons */}
      <div style={{ flex: 1, padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { w: "52%", me: false }, { w: "38%", me: false },
          { w: "62%", me: true  }, { w: "28%", me: true  },
          { w: "46%", me: false }, { w: "58%", me: true  },
          { w: "40%", me: false },
        ].map((b, i) => (
          <div key={i} style={{ display: "flex", justifyContent: b.me ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
            {!b.me && <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,.07)", flexShrink: 0 }} />}
            <div style={{ width: b.w, height: 36, borderRadius: b.me ? "18px 18px 4px 18px" : "4px 18px 18px 18px", background: `linear-gradient(90deg,rgba(255,255,255,.06) 25%,rgba(255,255,255,.11) 50%,rgba(255,255,255,.06) 75%)`, backgroundSize: "200% 100%", animation: `skshim 1.6s ${i * 60}ms ease-in-out infinite` }} />
          </div>
        ))}
      </div>
    </div>
  );

  // ── pending partner: accept or reject ─────────────────────────────────────
  if (!partner && pendingPartner) return (
    <div style={{ height: "100dvh", background: "#08080F", display: "flex", flexDirection: "column", fontFamily: F, color: "#fff", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ padding: "calc(env(safe-area-inset-top, 44px) + 12px) 20px 14px", flexShrink: 0 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 0", display: "flex", alignItems: "center" }}>
          <BackIcon />
        </button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px 48px", textAlign: "center" }}>
        <div style={{ marginBottom: 20 }}>
          <Av name={pendingPartner.partner.name} size={72} />
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.38)", fontWeight: 500, letterSpacing: ".04em", textTransform: "uppercase" as const, marginBottom: 8 }}>Partnership request</p>
        <p style={{ fontSize: 24, fontWeight: 800, color: "#F2EEFF", letterSpacing: "-.05em", lineHeight: 1.2, marginBottom: 10 }}>
          {pendingPartner.partner.name}
        </p>
        <p style={{ fontSize: 14, color: "rgba(242,238,255,.45)", lineHeight: 1.65, maxWidth: 260, marginBottom: 36 }}>
          wants to be your accountability buddy this week.
        </p>
        <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 320 }}>
          <button
            onClick={() => respondToPending(false)}
            disabled={responding}
            style={{ flex: 1, height: 44, borderRadius: 12, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.6)", fontSize: 14, fontWeight: 600, cursor: responding ? "default" : "pointer" }}
          >
            Decline
          </button>
          <button
            onClick={() => respondToPending(true)}
            disabled={responding}
            style={{ flex: 1, height: 44, borderRadius: 12, border: "none", background: responding ? "rgba(109,66,240,.4)" : "linear-gradient(135deg,#6D42F0 0%,#9B7FE8 100%)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: responding ? "default" : "pointer", boxShadow: responding ? "none" : "0 4px 20px rgba(109,66,240,.48)" }}
          >
            {responding ? "…" : "Accept 🤝"}
          </button>
        </div>
      </div>
    </div>
  );

  if (!partner) return (
    <NoPartnerScreen onBack={() => router.back()} onMatched={(p) => { setPartner(p); setNudgeSent(p.already_nudged); }} initialState={noPartnerState} />
  );

  return (
    <div style={{ height: "100dvh", background: "#08080F", display: "flex", flexDirection: "column", fontFamily: F, color: "#fff", maxWidth: 480, margin: "0 auto", overflow: "hidden" }}>
      <style>{`
        @keyframes blink{0%,80%,100%{transform:scale(.6);opacity:.2}40%{transform:scale(1);opacity:1}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0;}
        input{outline:none;border:none;background:transparent;}
        input::placeholder{color:rgba(255,255,255,.22);}
        ::-webkit-scrollbar{display:none;}
        scrollbar-width:none;
        button{font-family:'Plus Jakarta Sans',sans-serif;-webkit-tap-highlight-color:transparent;}
        a{-webkit-tap-highlight-color:transparent;}
      `}</style>

      {/* ── Header ── */}
      <div style={{ padding: "calc(env(safe-area-inset-top, 44px) + 12px) 16px 12px", background: "rgba(8,8,15,.96)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,.06)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px 4px 0" }}>
            <BackIcon />
          </button>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Av name={partner.partner.name} size={38} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#30D158", border: "2.5px solid #08080F" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-.03em", lineHeight: 1.2 }}>{partner.partner.name}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 2, fontWeight: 400 }}>
              {partner.partner.steps_today.toLocaleString()} steps today
              {partner.partner.step_streak_days > 0 && <> · 🔥 {partner.partner.step_streak_days}d streak</>}
            </p>
          </div>
          {/* remove partner button */}
          <button
            onClick={() => setShowConfirmRemove(true)}
            disabled={removing}
            title="Remove partner"
            style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.10)", borderRadius: 20, cursor: removing ? "default" : "pointer", padding: "7px 10px", color: "rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}
          >
            {removing
              ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,.15)", borderTopColor: "rgba(255,255,255,.4)", animation: "spin .7s linear infinite" }} />
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
            }
          </button>
        </div>
      </div>

      {/* ── Vote banner (Fri–Sun) ── */}
      {showVote && <VoteBanner partner={partner} onVote={submitVote} />}

      {/* ── Messages ── */}
      <div ref={msgScrollRef} style={{ flex: 1, overflowY: "auto", padding: "8px 16px 4px", display: "flex", flexDirection: "column", gap: 2 }}>
        {/* load older indicator */}
        <div ref={msgsTopRef} />
        {loadingOlderMsgs && (
          <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,.12)", borderTopColor: VIOLET, animation: "spin .7s linear infinite" }} />
          </div>
        )}
        {hasMoreMsgs && !loadingOlderMsgs && msgs.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
            <button onClick={loadOlderMessages} style={{ background: "none", border: "none", color: "rgba(255,255,255,.28)", fontSize: 12, cursor: "pointer", letterSpacing: ".01em" }}>
              Load earlier messages
            </button>
          </div>
        )}

        {loadingMsgs && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
            {[
              { w: "52%", me: false }, { w: "38%", me: false },
              { w: "62%", me: true  }, { w: "28%", me: true  },
              { w: "46%", me: false }, { w: "58%", me: true  },
              { w: "40%", me: false },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", justifyContent: b.me ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
                {!b.me && <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,.07)", flexShrink: 0 }} />}
                <div style={{ width: b.w, height: 36, borderRadius: b.me ? "18px 18px 4px 18px" : "4px 18px 18px 18px", background: "linear-gradient(90deg,rgba(255,255,255,.06) 25%,rgba(255,255,255,.11) 50%,rgba(255,255,255,.06) 75%)", backgroundSize: "200% 100%", animation: `skshim 1.6s ${i * 60}ms ease-in-out infinite` }} />
              </div>
            ))}
          </div>
        )}

        {!loadingMsgs && msgs.length === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.45)" }}>Say hi to {partner.partner.name}!</p>
          </div>
        )}

        {msgs.map((msg, idx) => {
          const prev = msgs[idx - 1];

          if (msg.type === "date") return (
            <div key={msg.id} style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 8px" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)", fontWeight: 500, flexShrink: 0 }}>{msg.label}</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
            </div>
          );

          if (msg.type === "nudge") return (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "12px 0 8px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: msg.nudgeFrom === "them" ? "rgba(251,146,60,.10)" : "rgba(124,92,252,.10)",
                border: `1px solid ${msg.nudgeFrom === "them" ? "rgba(251,146,60,.25)" : "rgba(124,92,252,.22)"}`,
                borderRadius: 20, padding: "6px 14px",
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={msg.nudgeFrom === "them" ? "#fb923c" : "#A78BFA"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                <span style={{ fontSize: 12, fontWeight: 600, color: msg.nudgeFrom === "them" ? "#fb923c" : "#A78BFA", letterSpacing: "-.01em" }}>
                  {msg.nudgeText}
                </span>
              </div>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.18)", marginTop: 4, fontWeight: 400 }}>{msg.time}</span>
            </div>
          );

          const isMe = msg.from === "me";
          const sameAuthor = !!(prev && prev.from === msg.from && prev.type === "chat");
          const next = msgs[idx + 1];
          // show time only on the last bubble of a same-author same-time run
          const isLastInGroup = !next || next.type !== "chat" || next.from !== msg.from || next.time !== msg.time;

          return (
            <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", alignItems: "flex-start", gap: 8, marginTop: sameAuthor ? 2 : 10 }}>
              {!isMe && (
                <div style={{ width: 28, flexShrink: 0, paddingTop: 2 }}>
                  {!sameAuthor && <Av name={partner.partner.name} size={28} />}
                </div>
              )}
              <div style={{ maxWidth: "74%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", gap: 3 }}>
                <div style={{
                  padding: "9px 13px",
                  borderRadius: isMe
                    ? (!sameAuthor ? "18px 18px 4px 18px" : "18px 4px 4px 18px")
                    : (!sameAuthor ? "4px 18px 18px 18px" : "4px 18px 18px 4px"),
                  background: isMe ? VIOLET : "rgba(255,255,255,.1)",
                  fontSize: 15, letterSpacing: "-.01em", lineHeight: 1.5, color: "#fff", fontWeight: 400,
                  fontFamily: "-apple-system,'SF Pro Text','Plus Jakarta Sans',sans-serif",
                  opacity: msg.pending ? 0.6 : 1,
                  boxShadow: isMe ? "0 2px 12px rgba(124,92,252,.25)" : "none",
                  transition: "opacity .2s",
                  wordBreak: "break-word" as const,
                  overflowWrap: "break-word" as const,
                }}>
                  {msg.text}
                </div>
                {(msg.pending || isLastInGroup) && (
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.2)", padding: "0 2px", fontWeight: 400, fontFamily: "-apple-system,'SF Pro Text','Plus Jakarta Sans',sans-serif", letterSpacing: ".01em" }}>
                    {msg.pending ? "Sending…" : msg.time}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* typing indicator — shown for real WS messages */}
        {typing && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 10 }}>
            <Av name={partner.partner.name} size={28} />
            <div style={{ padding: "12px 14px", borderRadius: "5px 18px 18px 18px", background: "rgba(255,255,255,.1)", display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 150, 300].map((d, i) => (
                <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,.4)", animation: `blink 1.2s ${d}ms infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} style={{ height: 8 }} />
      </div>

      {/* ── Dynamic suggestions + nudge chip ── */}
      {!input && (
        <div style={{ display: "flex", gap: 7, padding: "6px 16px", overflowX: "auto", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" as any, flexShrink: 0, background: "#08080F" }}>
          {/* nudge chip — first, highlighted, only when conditions met */}
          {showNudge && (
            <button
              onClick={nudgeSent ? undefined : sendNudge}
              disabled={nudging}
              style={{
                flexShrink: 0, padding: "7px 14px", borderRadius: 20, whiteSpace: "nowrap",
                border: nudgeSent ? "1px solid rgba(45,212,100,.30)" : "1px solid rgba(251,146,60,.35)",
                background: nudgeSent ? "rgba(45,212,100,.10)" : nudging ? "rgba(251,146,60,.06)" : "rgba(251,146,60,.12)",
                color: nudgeSent ? "#4ade80" : "#fb923c", fontSize: 13, fontWeight: 600,
                cursor: nudgeSent || nudging ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: 5, transition: "all .2s",
              }}
            >
              <NudgeIcon />
              {nudging ? "Sending…" : nudgeSent ? `Nudged ✓` : `Nudge ${partner.partner.name.split(" ")[0]}`}
            </button>
          )}
          {nudgeError && (
            <div style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 20, border: "1px solid rgba(251,146,60,.20)", background: "rgba(251,146,60,.06)", color: "#fb923c", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
              {nudgeError}
            </div>
          )}
          {/* smart reply chips */}
          {getSmartSuggestions(msgs, partner.partner).map((q, i) => (
            <button
              key={i}
              onClick={() => send(q)}
              style={{ flexShrink: 0, padding: "7px 15px", borderRadius: 20, border: `1px solid ${VIOLET_BORDER}`, background: VIOLET_BG, color: "#C4B5FD", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "-.01em", transition: "all .15s" }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ── */}
      <div style={{ padding: "8px 14px calc(env(safe-area-inset-bottom, 20px) + 10px)", background: "rgba(8,8,15,.97)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", background: "rgba(255,255,255,.07)", borderRadius: 24, padding: "0 16px", height: 44, border: input ? `1px solid ${VIOLET_BORDER}` : "1px solid transparent", transition: "border .2s" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            maxLength={2000}
            placeholder={`Message ${partner.partner.name.split(" ")[0]}…`}
            style={{ flex: 1, fontSize: 16, color: "#fff", letterSpacing: "-.01em", fontWeight: 400, fontFamily: "-apple-system,'SF Pro Text','Plus Jakarta Sans',sans-serif" }}
          />
        </div>
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || sending}
          style={{
            width: 44, height: 44, borderRadius: "50%", border: "none", flexShrink: 0,
            background: input.trim() && !sending ? VIOLET : "rgba(255,255,255,.07)",
            color: input.trim() && !sending ? "#fff" : "rgba(255,255,255,.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: input.trim() && !sending ? "pointer" : "default",
            transition: "all .2s",
            boxShadow: input.trim() && !sending ? "0 2px 14px rgba(124,92,252,.4)" : "none",
          }}
        >
          <SendIcon />
        </button>
      </div>

      {/* ── Remove partner confirmation sheet ── */}
      {showConfirmRemove && (
        <>
          {/* backdrop */}
          <div
            onClick={() => setShowConfirmRemove(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 40, backdropFilter: "blur(4px)" }}
          />
          {/* sheet */}
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#13131F", borderRadius: "20px 20px 0 0", padding: "8px 20px 40px", zIndex: 50, boxShadow: "0 -8px 40px rgba(0,0,0,.5)" }}>
            {/* drag handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,.15)", margin: "0 auto 20px" }} />
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(248,113,113,.12)", border: "1px solid rgba(248,113,113,.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <line x1="17" y1="11" x2="23" y2="11"/>
                </svg>
              </div>
              <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-.03em", marginBottom: 6 }}>
                Remove {partner.partner.name}?
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.42)", lineHeight: 1.6, maxWidth: 260, margin: "0 auto" }}>
                Your chat history will be cleared and you'll both be unmatched. You can always find a new random partner afterwards.
              </p>
            </div>
            <button
              onClick={removePartner}
              style={{ width: "100%", height: 48, borderRadius: 14, border: "none", background: "rgba(248,113,113,.18)", color: "#f87171", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10, letterSpacing: "-.02em" }}
            >
              Yes, remove partner
            </button>
            <button
              onClick={() => setShowConfirmRemove(false)}
              style={{ width: "100%", height: 48, borderRadius: 14, border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.6)", fontSize: 15, fontWeight: 600, cursor: "pointer", letterSpacing: "-.02em" }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
