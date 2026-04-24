'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export type NavTabId = "home" | "steps" | "habits" | "feed";

const TABS = [
  {
    id: "home" as NavTabId,
    label: "Home",
    href: "/home",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M9 21V13h6v8" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "feed" as NavTabId,
    label: "Feed",
    href: "/feeds",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16M4 10h16M4 14h10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="18" cy="17" r="3" stroke={color} strokeWidth="1.6"/>
      </svg>
    ),
  },
  {
    id: "steps" as NavTabId,
    label: "Steps",
    href: "/steps",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
        <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z"/>
      </svg>
    ),
  },
  {
    id: "habits" as NavTabId,
    label: "Habits",
    href: "/habits/tree",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L8 8H10L6 14H9L5 20H19L15 14H18L14 8H16L12 2Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
        <line x1="12" y1="21" x2="12" y2="23" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const ACCENT = "#A78BF5";

export function BottomNav({ active }: { active: NavTabId }) {
  const router = useRouter();
  const [stepsHref, setStepsHref] = useState<string | null>(null);
  const [habitsActive, setHabitsActive] = useState<boolean | null>(null);
  const [tapped, setTapped] = useState<NavTabId | null>(null);

  useEffect(() => {
    api<{ id?: string; status?: string; user_joined?: boolean; start_date?: string }[]>("/api/challenges/available")
      .then(challenges => {
        const today = new Date().toISOString().slice(0, 10);
        const enrolled = Array.isArray(challenges)
          ? [...challenges]
              .filter((c: any) => c.user_joined && c.status === "active" && c.start_date <= today && (!c.end_date || c.end_date >= today))
              .sort((a: any, b: any) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())[0]
          : null;
        setStepsHref(enrolled ? `/challanges/${(enrolled as any).id}/steps` : "");
      })
      .catch(() => setStepsHref(""));

    api("/api/habit-challenges/active")
      .then(() => setHabitsActive(true))
      .catch(() => setHabitsActive(false));
  }, []);

  function handleTap(tab: typeof TABS[number]) {
    if (tab.id === active) return;
    if (tab.id === "feed") return;
    if (tab.id === "steps") {
      if (stepsHref === null) return;
      router.push(stepsHref || "/challanges");
    }
    if (tab.id === "habits") {
      if (habitsActive === null) return;
      if (!habitsActive) return;
    }
    // Ripple + vibrate
    setTapped(tab.id);
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(8);
    setTimeout(() => setTapped(null), 400);
    if (tab.id !== "steps") router.push(tab.href);
  }

  const stepsLoading = stepsHref === null;
  const stepsDisabled = stepsHref === "";
  const habitsLoading = habitsActive === null;
  const habitsDisabled = habitsActive === false;

  return (
    <nav style={{
      position: "fixed", bottom: 0,
      left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 480,
      background: "rgba(10,10,10,0.95)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      borderTop: "0.5px solid rgba(255,255,255,0.08)",
      display: "flex", justifyContent: "space-around", alignItems: "center",
      height: 58, zIndex: 300,
      paddingBottom: "env(safe-area-inset-bottom)",
      boxSizing: "border-box",
    }}>
      {TABS.map(tab => {
        const isActive = tab.id === active;
        const isDisabled =
          (tab.id === "feed") ||
          (tab.id === "steps" && stepsLoading) ||
          (tab.id === "habits" && (habitsDisabled || habitsLoading));
        const color = isActive
          ? ACCENT
          : isDisabled
            ? "rgba(255,255,255,0.40)"
            : "rgba(255,255,255,0.62)";

        return (
          <motion.button
            key={tab.id}
            whileTap={isDisabled ? {} : { scale: 0.88 }}
            onClick={() => handleTap(tab)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              background: "none", border: "none",
              cursor: isDisabled ? "not-allowed" : isActive ? "default" : "pointer",
              padding: "4px 0 2px", flex: 1, minWidth: 0, height: 58,
              justifyContent: "center", position: "relative",
              WebkitTapHighlightColor: "transparent",
              opacity: isDisabled ? 0.55 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {/* tap ripple glow */}
            <motion.div
              animate={tapped === tab.id
                ? { scale: [0.4, 1.8], opacity: [0.55, 0] }
                : { scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              style={{
                position: "absolute", width: 44, height: 44, borderRadius: "50%",
                background: isActive ? "rgba(167,139,245,.30)" : "rgba(167,139,245,.22)",
                pointerEvents: "none",
              }}
            />
            <motion.div
              animate={{ scale: isActive ? 1.18 : 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {tab.icon(color)}
            </motion.div>
            <span style={{
              fontSize: 9.5, fontWeight: isActive ? 700 : 500,
              letterSpacing: "0.03em", textTransform: "uppercase" as const,
              color, transition: "color 0.2s",
            }}>
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}

// Legacy stub
export const NavIcons = {};
