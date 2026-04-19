"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { registerServiceWorker } from "../register-sw";

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

const MOCK_NOTIFS: NotifItem[] = [
  { id: "n1", emoji: "🔥", title: "New Event", body: "Sunrise Step Challenge kick-off is tomorrow at 6am — 42 people going.", time: "10m", read: false, accent: "#FF9070" },
  { id: "n2", emoji: "💪", title: "Milestone", body: "Priya hit 100,000 lifetime steps. Drop a reaction!", time: "1h", read: false, accent: "#FFD07A" },
  { id: "n3", emoji: "🗳️", title: "Poll closing soon", body: "Q2 offsite poll closes in 2 hours — only 36 votes so far.", time: "2h", read: false, accent: "#4CD97B" },
  { id: "n4", emoji: "📣", title: "Office Closed", body: "Reminder: Monday 22 April is a company wellness day.", time: "1d", read: true, accent: "#AEAEB2" },
  { id: "n5", emoji: "❤️", title: "87 people reacted", body: "Your celebration post is getting lots of love.", time: "2d", read: true, accent: "#FF6B8A" },
  { id: "n6", emoji: "🏆", title: "You moved up!", body: "You're now #3 on the weekly leaderboard. Keep pushing!", time: "3d", read: true, accent: "#a78bfa" },
];

/* ── Push permission hook ── */
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

/* ── Bell SVG ── */
function BellIcon({ active, size = 18 }: { active: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={active ? "#a78bfa" : "rgba(255,255,255,0.60)"}
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

/* ── Main Component ── */
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifs, setNotifs] = useState<NotifItem[]>(MOCK_NOTIFS);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const { permState, isSubscribed, loading, toggle } = usePushPermission();

  const unread = notifs.filter((n) => !n.read).length;
  const isOn = isSubscribed && permState !== "denied";

  /* Mount panel only after first open to avoid bleed-through */
  useEffect(() => { if (open) setMounted(true); }, [open]);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const markAll = () => setNotifs((n) => n.map((x) => ({ ...x, read: true })));
  const markOne = (id: string) => setNotifs((n) => n.map((x) => x.id === id ? { ...x, read: true } : x));

  return (
    <>
      {/* ── Bell button ── */}
      <div style={{ position: "relative" }}>
        <button
          ref={btnRef}
          onClick={() => setOpen((v) => !v)}
          title="Notifications"
          style={{
            width: 38, height: 38, borderRadius: "50%",
            background: open
              ? "rgba(124,58,237,0.32)"
              : unread > 0
                ? "rgba(167,139,250,0.14)"
                : "rgba(255,255,255,0.07)",
            border: `1.5px solid ${open
              ? "rgba(167,139,250,0.55)"
              : unread > 0
                ? "rgba(167,139,250,0.28)"
                : "rgba(255,255,255,0.10)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0, padding: 0, position: "relative",
            outline: "none", WebkitTapHighlightColor: "transparent",
            transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: open ? "0 0 0 4px rgba(124,58,237,0.12)" : "none",
          }}
        >
          <BellIcon active={unread > 0 || open} />

          {/* Unread dot badge */}
          {unread > 0 && (
            <span style={{
              position: "absolute", top: 4, right: 4,
              width: 9, height: 9, borderRadius: "50%",
              background: "linear-gradient(135deg, #c084fc, #7c3aed)",
              border: "2px solid #0D0D12",
              boxShadow: "0 0 8px rgba(167,139,250,0.80)",
              animation: "nbPulse 2.4s ease-in-out infinite",
            }} />
          )}
        </button>
      </div>

      {/* ── Backdrop + Panel (only mounted after first open) ── */}
      {mounted && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 9990,
              background: "rgba(0,0,0,0.62)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
              transition: "opacity 0.28s ease",
            }}
          />

          {/* Slide-in panel */}
          <div
            ref={panelRef}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0,
              zIndex: 9999,
              width: "min(380px, 100vw)",
              /* Fully opaque — no bleed-through */
              background: "rgb(14,12,26)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "-24px 0 80px rgba(0,0,0,0.80)",
              display: "flex", flexDirection: "column",
              transform: open ? "translateX(0)" : "translateX(100%)",
              transition: "transform 0.32s cubic-bezier(0.16,1,0.3,1)",
              fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
              paddingBottom: "env(safe-area-inset-bottom)",
              /* Never bleed when closed */
              visibility: open ? "visible" : "hidden",
            }}
          >
            {/* Decorative top glow */}
            <div style={{
              position: "absolute", top: -80, right: -80,
              width: 300, height: 300, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)",
              pointerEvents: "none",
            }} />

            {/* ── Panel header ── */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "max(22px, env(safe-area-inset-top)) 20px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              position: "relative",
            }}>
              <div>
                <h2 style={{
                  fontSize: 22, fontWeight: 800, color: "#F2EEFF",
                  letterSpacing: "-0.04em", lineHeight: 1, margin: 0,
                }}>Notifications</h2>
                <p style={{
                  fontSize: 12, color: "rgba(242,238,255,0.36)",
                  margin: "4px 0 0", fontWeight: 500,
                }}>
                  {unread > 0 ? `${unread} unread` : "You're all caught up"}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {unread > 0 && (
                  <button
                    onClick={markAll}
                    style={{
                      fontSize: 12, fontWeight: 600, color: "#a78bfa",
                      background: "rgba(167,139,250,0.10)",
                      border: "1px solid rgba(167,139,250,0.22)",
                      borderRadius: 99, padding: "5px 12px",
                      cursor: "pointer", letterSpacing: "-0.01em",
                      transition: "all 0.18s",
                    }}
                  >Mark all read</button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "rgba(242,238,255,0.55)", fontSize: 14,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", padding: 0, transition: "all 0.18s",
                  }}
                >✕</button>
              </div>
            </div>

            {/* ── Notification list / empty state ── */}
            <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain" }}>
              {notifs.length === 0 ? (
                /* Premium empty state */
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  padding: "64px 32px 32px",
                  textAlign: "center",
                }}>
                  {/* Icon ring */}
                  <div style={{
                    position: "relative",
                    width: 88, height: 88,
                    marginBottom: 28,
                  }}>
                    {/* Outer glow ring */}
                    <div style={{
                      position: "absolute", inset: -8,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
                    }} />
                    {/* Ring */}
                    <div style={{
                      position: "absolute", inset: 0,
                      borderRadius: "50%",
                      border: "1.5px solid rgba(167,139,250,0.22)",
                      background: "linear-gradient(135deg, rgba(167,139,250,0.12), rgba(124,58,237,0.06))",
                    }} />
                    {/* Inner circle */}
                    <div style={{
                      position: "absolute", inset: 10,
                      borderRadius: "50%",
                      background: "rgba(167,139,250,0.10)",
                      border: "1px solid rgba(167,139,250,0.18)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(167,139,250,0.75)" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                    </div>
                    {/* Small check badge */}
                    <div style={{
                      position: "absolute", bottom: 2, right: 2,
                      width: 22, height: 22, borderRadius: "50%",
                      background: "linear-gradient(135deg, #34d399, #059669)",
                      border: "2px solid #0E0C1A",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 0 10px rgba(52,211,153,0.50)",
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                        stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  </div>

                  <h3 style={{
                    fontSize: 18, fontWeight: 700, color: "#F2EEFF",
                    letterSpacing: "-0.03em", margin: "0 0 8px",
                  }}>You're all caught up</h3>
                  <p style={{
                    fontSize: 13, color: "rgba(242,238,255,0.42)",
                    lineHeight: 1.6, margin: "0 0 28px", maxWidth: 220,
                  }}>New notifications from events, milestones and your team will appear here.</p>

                  {/* Enable push CTA if not yet enabled */}
                  {permState !== "unsupported" && !isOn && permState !== "denied" && (
                    <button
                      onClick={toggle}
                      disabled={loading}
                      style={{
                        padding: "11px 24px", borderRadius: 14,
                        background: "linear-gradient(135deg, rgba(167,139,250,0.22), rgba(124,58,237,0.30))",
                        border: "1px solid rgba(167,139,250,0.28)",
                        color: "#c4b5fd", fontSize: 13, fontWeight: 600,
                        cursor: loading ? "default" : "pointer",
                        letterSpacing: "-0.01em",
                        transition: "all 0.2s",
                        opacity: loading ? 0.6 : 1,
                      } as React.CSSProperties}
                    >
                      {loading ? "Enabling…" : "Enable push notifications"}
                    </button>
                  )}
                </div>
              ) : (
                notifs.map((n, i) => (
                  <button
                    key={n.id}
                    onClick={() => markOne(n.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "flex-start", gap: 13,
                      padding: "14px 20px", textAlign: "left",
                      background: n.read ? "transparent" : "rgba(167,139,250,0.055)",
                      borderBottom: i < notifs.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      border: "none", cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    {/* Emoji icon */}
                    <div style={{
                      width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                      background: `${n.accent}18`,
                      border: `1px solid ${n.accent}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 19, marginTop: 1,
                    }}>{n.emoji}</div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                        <span style={{
                          fontSize: 13, fontWeight: n.read ? 500 : 700,
                          color: n.read ? "rgba(242,238,255,0.75)" : "#F2EEFF",
                          letterSpacing: "-0.015em",
                        }}>{n.title}</span>
                        <span style={{ fontSize: 11, color: "rgba(242,238,255,0.28)", flexShrink: 0, fontWeight: 500 }}>{n.time}</span>
                      </div>
                      <p style={{
                        fontSize: 12.5, color: "rgba(242,238,255,0.45)",
                        margin: 0, lineHeight: 1.5, letterSpacing: "-0.005em",
                      }}>{n.body}</p>
                    </div>

                    {/* Unread pip */}
                    {!n.read && (
                      <div style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: "#a78bfa", flexShrink: 0, marginTop: 7,
                        boxShadow: "0 0 6px rgba(167,139,250,0.70)",
                      }} />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* ── Push toggle footer (only if already subscribed or denied) ── */}
            {permState !== "unsupported" && (isOn || permState === "denied") && (
              <div style={{
                borderTop: "1px solid rgba(255,255,255,0.07)",
                padding: "14px 20px",
                display: "flex", alignItems: "center", gap: 14,
                background: "rgba(255,255,255,0.02)",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: isOn ? "rgba(124,58,237,0.18)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${isOn ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.10)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke={isOn ? "#a78bfa" : "rgba(255,255,255,0.35)"}
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#F2EEFF", margin: 0, letterSpacing: "-0.01em" }}>
                    Push notifications
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(242,238,255,0.35)", margin: "2px 0 0" }}>
                    {permState === "denied" ? "Blocked in browser settings" : "Active on this device"}
                  </p>
                </div>
                <button
                  onClick={toggle}
                  disabled={loading || permState === "denied"}
                  style={{
                    position: "relative", width: 46, height: 26, borderRadius: 13,
                    background: isOn ? "linear-gradient(135deg,#7c3aed,#a78bfa)" : "rgba(255,255,255,0.10)",
                    border: "none",
                    cursor: permState === "denied" ? "not-allowed" : "pointer",
                    transition: "background 0.25s", flexShrink: 0, padding: 0,
                    outline: "none", WebkitTapHighlightColor: "transparent",
                    boxShadow: isOn ? "0 0 14px rgba(124,58,237,0.55)" : "none",
                    opacity: permState === "denied" ? 0.4 : 1,
                  }}
                >
                  <span style={{
                    position: "absolute", top: 3, left: isOn ? 22 : 3,
                    width: 20, height: 20, borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
                  }} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes nbPulse {
          0%, 100% { box-shadow: 0 0 6px rgba(167,139,250,0.70); opacity: 1; }
          50%       { box-shadow: 0 0 14px rgba(167,139,250,1.00); opacity: 0.82; }
        }
      `}</style>
    </>
  );
}
