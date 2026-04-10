'use client';
import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const BG   = "#0A0A0A";
const WARN = "#C8873A";

type TabId = "home" | "habit" | "forest" | "leaderboard";

const TABS: { id: TabId; label: string; icon: (color: string) => React.ReactNode }[] = [
  {
    id: "home",
    label: "Home",
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M3 10L12 3L21 10V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V10Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M9 22V12H15V22" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "habit",
    label: "Today",
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5"/>
        <path d="M8.5 12l2.5 2.5 4.5-5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "forest",
    label: "History",
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="17" rx="2" stroke={color} strokeWidth="1.5"/>
        <path d="M3 9h18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 2v4M16 2v4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "leaderboard",
    label: "Rank",
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="9" y="8" width="6" height="13" rx="1" stroke={color} strokeWidth="1.5"/>
        <rect x="2" y="13" width="6" height="8" rx="1" stroke={color} strokeWidth="1.5"/>
        <rect x="16" y="11" width="6" height="10" rx="1" stroke={color} strokeWidth="1.5"/>
      </svg>
    ),
  },
];

export function NavBar({ activeTab, accent, onTabChange }: { activeTab: TabId; accent: string; onTabChange?: (tab: TabId) => void }) {
  const router = useRouter();

  function handleTap(id: TabId) {
    if (id === activeTab) return;
    if (id === "home") {
      router.push("/home");
    } else if (onTabChange) {
      onTabChange(id);
    } else {
      if (id === "habit")        router.push("/habits/tree");
      else if (id === "forest")  router.push("/habits/tree/history");
      else                       router.push("/habits/tree/leaderboard");
    }
  }

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 480,
      background: `${BG}ee`,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      height: 56,
      zIndex: 300,
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {TABS.map(tab => {
        const active = tab.id === activeTab;
        const color  = active ? accent : "rgba(240,237,232,0.5)";
        return (
          <motion.button key={tab.id} whileTap={{ scale: 0.9 }}
            onClick={() => handleTap(tab.id)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              background: "none", border: "none", cursor: "pointer",
              padding: "4px 16px 0 16px", minWidth: 50, height: 56,
              justifyContent: "center",
              opacity: active ? 1 : 0.4,
              transition: "opacity 0.2s",
            }}>
            {tab.icon(color)}
            <span style={{
              fontSize: 9, fontWeight: 600,
              color: active ? accent : "rgba(240,237,232,0.4)",
              letterSpacing: "0.03em", textTransform: "uppercase", marginTop: 1,
            }}>{tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
