'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export type NavTabId = "home" | "steps" | "habits" | "wellness";

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
    id: "wellness" as NavTabId,
    label: "Wellness",
    href: "/mindfullness",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const ACCENT = "#A78BF5";

export function BottomNav({ active }: { active: NavTabId }) {
  const router = useRouter();
  const [stepsHref, setStepsHref] = useState<string | null>(null); // null = loading
  const [habitsActive, setHabitsActive] = useState<boolean | null>(null); // null = loading

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
    if (tab.id === "steps") {
      if (stepsHref === null) return; // still loading
      // if enrolled → go to challenge steps; if not enrolled → go to challenges list to join
      router.push(stepsHref || "/challanges");
      return;
    }
    if (tab.id === "habits") {
      if (habitsActive === null) return; // still loading
      if (!habitsActive) return;         // no active challenge — do nothing
    }
    router.push(tab.href);
  }

  const stepsLoading = stepsHref === null;
  const stepsDisabled = stepsHref === "";
  const habitsLoading = habitsActive === null;
  const habitsDisabled = habitsActive === false;

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 480,
      background: "rgba(10,10,10,0.92)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      borderTop: "0.5px solid rgba(255,255,255,0.07)",
      display: "flex", justifyContent: "space-around", alignItems: "center",
      height: 58, zIndex: 300,
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {TABS.map(tab => {
        const isActive = tab.id === active;
        const isDisabled =
          (tab.id === "steps" && stepsLoading) ||
          (tab.id === "habits" && (habitsDisabled || habitsLoading));
        // Use a higher-contrast gray for disabled tabs for accessibility
        const color = isActive ? ACCENT : isDisabled ? "rgba(180,180,200,0.38)" : "rgba(240,237,232,0.35)";

        return (
          <motion.button
            key={tab.id}
            whileTap={isDisabled ? {} : { scale: 0.88 }}
            onClick={() => handleTap(tab)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              background: "none", border: "none",
              cursor: isDisabled ? "not-allowed" : isActive ? "default" : "pointer",
              padding: "6px 20px 2px", minWidth: 60, height: 58,
              justifyContent: "center", position: "relative",
              WebkitTapHighlightColor: "transparent",
              opacity: isDisabled ? 0.55 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {isActive && (
              <motion.div
                layoutId="nav-dot"
                style={{
                  position: "absolute", top: 6, width: 4, height: 4,
                  borderRadius: "50%", background: ACCENT,
                  boxShadow: `0 0 6px ${ACCENT}`,
                }}
              />
            )}
            {tab.icon(color)}
            <span style={{
              fontSize: 9.5, fontWeight: isActive ? 700 : 500,
              letterSpacing: "0.04em", textTransform: "uppercase" as const,
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
