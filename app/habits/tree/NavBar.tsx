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
    label: "Habit",
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2.5" stroke={color} strokeWidth="1.5"/>
        <path d="M7 9l2.5 2.5L13 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 14h4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 17h6" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "forest",
    label: "Forest",
    icon: (color) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L8 8H10L6 14H9L5 20H19L15 14H18L14 8H16L12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        <line x1="12" y1="20" x2="12" y2="23" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
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
      router.push("/challanges");
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
