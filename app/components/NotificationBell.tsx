"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { registerServiceWorker, isIOS, isIOSStandalone } from "../register-sw";

/* ── Types ── */
type NotifItem = {
  id: string;
  emoji: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  accent: string;
};

/* ── Mock data (replace with real API) ── */
const MOCK_NOTIFS: NotifItem[] = [
  { id: "n1", emoji: "🔥", title: "New Event", body: "Sunrise Step Challenge kick-off is tomorrow at 6am — 42 people going.", time: "10m", read: false, accent: "#FF9070" },
  { id: "n2", emoji: "💪", title: "Milestone", body: "Priya hit 100,000 lifetime steps. Drop a reaction!", time: "1h", read: false, accent: "#FFD07A" },
  { id: "n3", emoji: "🗳️", title: "Poll closing soon", body: "Q2 offsite poll closes in 2 hours — only 36 votes so far.", time: "2h", read: false, accent: "#4CD97B" },
  { id: "n4", emoji: "📣", title: "Office Closed", body: "Reminder: Monday 22 April is a company wellness day.", time: "1d", read: true, accent: "#AEAEB2" },
  { id: "n5", emoji: "❤️", title: "87 people reacted", body: "Your celebration post is getting lots of love.", time: "2d", read: true, accent: "#FF6B8A" },
  { id: "n6", emoji: "🏆", title: "You moved up!", body: "You're now #3 on the weekly leaderboard. Keep pushing!", time: "3d", read: true, accent: "#a78bfa" },
];

/* ── Push permission helpers (kept for settings row) ── */
type PermState = "granted" | "denied" | "default" | "unsupported";

function usePushPermission() {
  const [permState, setPermState] = useState<PermState>("unsupported");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const check = useCallback(async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.getRegistration("/socialapp/");
      setIsSubscribed(!!(reg && await reg.pushManager.getSubscription()));
    } catch { setIsSubscribed(false); }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermState(Notification.permission as PermState);
    check();
  }, [check]);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (isSubscribed) {
        const reg = await navigator.serviceWorker.getRegistration("/socialapp/");
        const sub = reg && await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
        localStorage.setItem("notifications_user_disabled", "1");
        localStorage.removeItem("sw_subscription_synced");
        setIsSubscribed(false);
      } else {
        if (permState !== "granted") {
          const result = await Notification.requestPermission();
          setPermState(result as PermState);
          if (result !== "granted") return;
        }
        localStorage.removeItem("notifications_user_disabled");
        await registerServiceWorker();
        await check();
      }
    } catch (e) { console.error("[NotificationBell]", e); }
    finally { setLoading(false); }
  };

  return { permState, isSubscribed, loading, toggle };
}

/* ── Main Component ── */
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotifItem[]>(MOCK_NOTIFS);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const { permState, isSubscribed, loading, toggle } = usePushPermission();

  const unread = notifs.filter((n) => !n.read).length;
  const isOn = isSubscribed && permState !== "denied";

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* lock body scroll when open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const markAll = () => setNotifs((n) => n.map((x) => ({ ...x, read: true })));
  const markOne = (id: string) => setNotifs((n) => n.map((x) => x.id === id ? { ...x, read: true } : x));

  return (
    <>
      {/* Bell button */}
      <div style={{ position: "relative" }}>
        <button
          ref={btnRef}
          onClick={() => setOpen((v) => !v)}
          title="Notifications"
          style={{
            width: 38, height: 38, borderRadius: "50%",
            background: open ? "rgba(124,58,237,0.35)" : unread > 0 ? "rgba(124,58,237,0.18)" : "rgba(255,255,255,0.08)",
            border: `1px solid ${open ? "rgba(124,58,237,0.6)" : unread > 0 ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.12)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0, padding: 0, position: "relative",
            outline: "none", WebkitTapHighlightColor: "transparent",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={unread > 0 ? "#a78bfa" : "rgba(255,255,255,0.55)"} strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {/* Unread badge */}
          {unread > 0 && (
            <span style={{
              position: "absolute", top: 5, right: 5,
              width: 8, height: 8, borderRadius: "50%",
              background: "#a78bfa",
              border: "1.5px solid rgba(15,23,42,0.95)",
              boxShadow: "0 0 6px rgba(167,139,250,0.7)",
              animation: "bellBadgePulse 2s ease-in-out infinite",
            }} />
          )}
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.5)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 9999,
          width: "min(360px, 100vw)",
          background: "rgba(14,14,22,0.98)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          display: "flex", flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Panel header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "max(20px, env(safe-area-inset-top)) 20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#F2F2F7", letterSpacing: "-0.03em", lineHeight: 1, margin: 0 }}>
              Notifications
            </h2>
            {unread > 0 && (
              <p style={{ fontSize: 12, color: "#636366", marginTop: 3, marginBottom: 0 }}>{unread} unread</p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {unread > 0 && (
              <button
                onClick={markAll}
                style={{ fontSize: 12, fontWeight: 600, color: "#9D82FF", background: "none", border: "none", cursor: "pointer", letterSpacing: "-0.01em", padding: 0 }}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none", color: "#AEAEB2", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain" }}>
          {notifs.map((n) => (
            <button
              key={n.id}
              onClick={() => markOne(n.id)}
              style={{
                width: "100%", display: "flex", alignItems: "flex-start", gap: 12,
                padding: "14px 20px", textAlign: "left",
                background: n.read ? "transparent" : "rgba(157,130,255,0.06)",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                border: "none",
                borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)", borderBottomStyle: "solid",
                cursor: "pointer", transition: "background 0.2s",
              }}
            >
              {/* Icon */}
              <div style={{
                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                background: `${n.accent}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, marginTop: 1,
              }}>
                {n.emoji}
              </div>
              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: "#F2F2F7", letterSpacing: "-0.01em" }}>{n.title}</span>
                  <span style={{ fontSize: 11, color: "#636366", flexShrink: 0 }}>{n.time}</span>
                </div>
                <p style={{ fontSize: 12, color: "#AEAEB2", margin: 0, lineHeight: 1.45, letterSpacing: "-0.005em" }}>{n.body}</p>
              </div>
              {/* Unread dot */}
              {!n.read && (
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#9D82FF", flexShrink: 0, marginTop: 6 }} />
              )}
            </button>
          ))}

          {notifs.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
              <span style={{ fontSize: 40 }}>🔔</span>
              <p style={{ fontSize: 14, color: "#636366", marginTop: 12, textAlign: "center" }}>You're all caught up!</p>
            </div>
          )}
        </div>

        {/* Push notification settings row — bottom of panel */}
        {permState !== "unsupported" && (
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F7", margin: 0 }}>Push notifications</p>
              <p style={{ fontSize: 11, color: "#636366", margin: "2px 0 0" }}>
                {permState === "denied" ? "Blocked in browser settings" : isOn ? "Active on this device" : "Tap to enable"}
              </p>
            </div>
            {/* Toggle */}
            <button
              onClick={toggle}
              disabled={loading || permState === "denied"}
              style={{
                position: "relative", width: 48, height: 28, borderRadius: 14,
                background: isOn ? "#7c3aed" : "rgba(255,255,255,0.12)",
                border: "none", cursor: permState === "denied" ? "not-allowed" : "pointer",
                transition: "background 0.25s", flexShrink: 0, padding: 0, outline: "none",
                WebkitTapHighlightColor: "transparent",
                boxShadow: isOn ? "0 0 10px rgba(124,58,237,0.5)" : "none",
                opacity: permState === "denied" ? 0.45 : 1,
              }}
            >
              <span style={{
                position: "absolute", top: 3, left: isOn ? 23 : 3,
                width: 22, height: 22, borderRadius: "50%",
                background: "#fff",
                transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)",
                boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
              }} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bellBadgePulse {
          0%, 100% { box-shadow: 0 0 6px rgba(167,139,250,0.7); }
          50%       { box-shadow: 0 0 12px rgba(167,139,250,1); }
        }
      `}</style>
    </>
  );
}
