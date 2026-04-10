'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import { api, getCachedUserMe } from "@/lib/api";
import { SA } from "../../../components/constants";
import { NavBar } from "../NavBar";

const DEFAULT_ACCENT = SA[3];

interface HabitsLeaderboardEntry {
  rank: number;
  rank_change: number | null;
  user_id: string;
  name: string;
  profile_pic_url: string | null;
  challenge_id: number;
  is_me: boolean;
  completion_pct: number;
  completed: number;
  possible: number;
  streak: number;
}

interface HabitsLeaderboardResponse {
  period_days: number;
  period_start: string;
  period_end: string;
  entries: HabitsLeaderboardEntry[];
}

const BG = "#0A0A0A";
const T1 = "#F0EDE8";
const T3 = "rgba(240,237,232,0.28)";
const T4 = "rgba(240,237,232,0.14)";
const GOLD = "#F5C518";
const SILVER = "#A8B8C8";
const BRONZE = "#C8824A";

const RANK_COLORS = [GOLD, SILVER, BRONZE];

function RankChangeBadge({ change }: { change: number | null }) {
  if (change === null) return null;
  if (change === 0) return (
    <span style={{ fontSize: 10, color: T3, letterSpacing: ".02em" }}>—</span>
  );
  const up = change > 0;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 2,
      background: up ? "rgba(34,197,94,.12)" : "rgba(239,68,68,.12)",
      border: `1px solid ${up ? "rgba(34,197,94,.25)" : "rgba(239,68,68,.25)"}`,
      borderRadius: 6, padding: "2px 5px",
    }}>
      <span style={{ fontSize: 9, fontWeight: 800, color: up ? "#4ade80" : "#f87171" }}>{up ? "▲" : "▼"}</span>
      <span style={{ fontSize: 9, fontWeight: 700, color: up ? "#4ade80" : "#f87171" }}>{Math.abs(change)}</span>
    </div>
  );
}

function Avatar({ name, isMe, accent, size = 38, ring }: { name: string; isMe: boolean; accent: string; size?: number; ring?: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: isMe ? `${accent}22` : "rgba(255,255,255,0.09)",
      border: `1.5px solid ${ring ?? (isMe ? `${accent}55` : "rgba(255,255,255,0.12)")}`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ fontSize: size * 0.34, fontWeight: 700, color: isMe ? accent : T3 }}>
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function HabitsLeaderboardPage() {
  const router = useRouter();
  const [data, setData] = useState<HabitsLeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [accent, setAccent] = useState(DEFAULT_ACCENT);

  useEffect(() => {
    api<{ stage?: number }>("/api/habit-challenges/active")
      .then(d => { if (typeof d.stage === "number") setAccent(SA[d.stage] ?? DEFAULT_ACCENT); })
      .catch(() => {});

    api<HabitsLeaderboardResponse>("/api/habit-challenges/leaderboard")
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const top3 = data?.entries.slice(0, 3) ?? [];
  const rest = data?.entries.slice(3) ?? [];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, color: T1, paddingBottom: 100 }}>
        <div style={{ padding: "54px 20px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)" }} />
          <div style={{ height: 24, width: 120, borderRadius: 6, background: "rgba(255,255,255,0.06)" }} />
        </div>
        <div style={{ padding: "0 16px" }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ height: 64, borderRadius: 14, background: "rgba(255,255,255,0.04)", marginBottom: 8 }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: T3 }}>
        <p style={{ fontSize: 15, margin: 0 }}>Could not load leaderboard.</p>
        <button onClick={() => router.back()} style={{ fontSize: 13, color: accent, background: "none", border: "none", cursor: "pointer" }}>Go back</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, color: T1, paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ padding: "54px 20px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4, opacity: .75, margin: "0 0 6px" }}>
            {formatDate(data.period_start)} – {formatDate(data.period_end)} · {data.period_days} days
          </p>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: T1, letterSpacing: "-.6px", lineHeight: 1, margin: 0 }}>Rankings</h2>
        </div>
        <motion.button whileTap={{ scale: .9 }} onClick={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 4 }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="rgba(240,237,232,0.4)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.button>
      </div>

      {/* Top 3 */}
      <div style={{ padding: "0 16px", marginBottom: 8 }}>
        {top3.map((entry, i) => {
          const rc = RANK_COLORS[i];
          return (
            <motion.div key={entry.user_id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 280, damping: 28 }}
              style={{
                marginBottom: 8, borderRadius: 16, padding: "12px 14px",
                background: i === 0 ? "rgba(245,197,24,.08)" : i === 1 ? "rgba(168,184,200,.05)" : "rgba(200,130,74,.05)",
                border: `1px solid ${i === 0 ? "rgba(245,197,24,.25)" : i === 1 ? "rgba(168,184,200,.18)" : "rgba(200,130,74,.18)"}`,
                outline: entry.is_me ? `2px solid ${accent}55` : "none",
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Rank chip */}
                <div style={{ width: 30, height: 30, borderRadius: 9, background: `${rc}18`, border: `1px solid ${rc}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: rc }}>{entry.rank}</span>
                </div>
                {/* Avatar */}
                <Avatar name={entry.name} isMe={entry.is_me} accent={accent} ring={rc + "55"} />
                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: entry.is_me ? 700 : 600, color: T1, letterSpacing: "-.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.name}
                    </span>
                    {i === 0 && <span style={{ fontSize: 13 }}>👑</span>}
                    {entry.is_me && <span style={{ fontSize: 8, fontWeight: 700, color: accent, background: `${accent}22`, borderRadius: 20, padding: "2px 7px", letterSpacing: ".06em", flexShrink: 0 }}>YOU</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T3 }}>
                    <span style={{ color: i === 0 ? GOLD : T3 }}>{entry.completed}/{entry.possible} habits</span>
                    {entry.streak > 0 && <>
                      <span style={{ color: T4 }}>·</span>
                      <Flame size={10} style={{ color: "#fb923c" }} />
                      <span>{entry.streak}d streak</span>
                    </>}
                  </div>
                </div>
                {/* Pct + rank change */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 17, fontWeight: 800, color: rc, letterSpacing: "-.4px" }}>{entry.completion_pct.toFixed(1)}%</span>
                  <RankChangeBadge change={entry.rank_change} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Rest */}
      <div style={{ padding: "0 16px" }}>
        <AnimatePresence>
          {rest.map((entry, i) => (
            <motion.div key={entry.user_id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 30 }}
              style={{
                marginBottom: 6, borderRadius: 14, padding: "11px 14px",
                background: entry.is_me ? `${accent}0d` : "rgba(255,255,255,0.04)",
                border: `1px solid ${entry.is_me ? `${accent}30` : "rgba(255,255,255,0.07)"}`,
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Rank */}
                <div style={{ width: 28, height: 28, borderRadius: 8, background: entry.is_me ? `${accent}18` : "rgba(255,255,255,0.06)", border: `1px solid ${entry.is_me ? `${accent}30` : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: entry.is_me ? accent : T3 }}>{entry.rank}</span>
                </div>
                {/* Avatar */}
                <Avatar name={entry.name} isMe={entry.is_me} accent={accent} size={34} />
                {/* Name + sub */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: entry.is_me ? 600 : 500, color: entry.is_me ? accent : T1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.name}
                    </span>
                    {entry.is_me && <span style={{ fontSize: 8, fontWeight: 700, color: accent, background: `${accent}22`, borderRadius: 20, padding: "2px 7px", letterSpacing: ".06em", flexShrink: 0 }}>YOU</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T3 }}>
                    <span>{entry.completed}/{entry.possible} habits</span>
                    {entry.streak > 0 && <>
                      <span style={{ color: T4 }}>·</span>
                      <Flame size={10} style={{ color: "#fb923c" }} />
                      <span>{entry.streak}d</span>
                    </>}
                  </div>
                </div>
                {/* Pct + rank change */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: entry.is_me ? accent : T1, letterSpacing: "-.3px" }}>{entry.completion_pct.toFixed(1)}%</span>
                  <RankChangeBadge change={entry.rank_change} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <NavBar activeTab="leaderboard" accent={accent} />
    </div>
  );
}
