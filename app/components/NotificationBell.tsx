"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { registerServiceWorker, isIOS, isIOSStandalone } from "../register-sw";

type PermState = "granted" | "denied" | "default" | "unsupported";

/* ── SVG Icon Set (no emojis) ── */
function IconCheck({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconX({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconSpinner({ size = 14, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2a10 10 0 0 1 10 10" style={{ animation: "spin 0.8s linear infinite", transformOrigin: "center" }} />
    </svg>
  );
}

/* ── Bell SVGs ── */
function BellIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );
}
function BellOffIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20 18.69L7.84 6.14 6.31 4.6l-.92-.92L4 5.07l2 2V11c0 3.07 1.63 5.64 4.5 6.32V18c0 1.1.9 2 2 2s2-.9 2-2v-.68c.36-.09.7-.23 1.04-.39l1.94 1.94L20 18.69zM12 21a2 2 0 0 1-2-2h4c0 1.1-.9 2-2 2z" />
      <path d="M18 14.97V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68c-.51.12-.99.31-1.45.56L18 14.97z" opacity=".3" />
      <path d="M2 3.05 3.05 2 22 20.95 20.95 22 2 3.05z" />
    </svg>
  );
}

/* ── iOS-style Toggle Switch ── */
function Toggle({ on, loading, onChange }: { on: boolean; loading: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      aria-label={on ? "Disable notifications" : "Enable notifications"}
      style={{
        position: "relative",
        width: 52,
        height: 30,
        borderRadius: 15,
        background: on ? "#7c3aed" : "rgba(255,255,255,0.15)",
        border: "none",
        cursor: loading ? "wait" : "pointer",
        transition: "background 0.25s ease, box-shadow 0.25s ease",
        flexShrink: 0,
        padding: 0,
        outline: "none",
        WebkitTapHighlightColor: "transparent",
        boxShadow: on ? "0 0 12px rgba(124,58,237,0.55)" : "none",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 25 : 3,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading && <IconSpinner size={12} color="#7c3aed" />}
      </span>
    </button>
  );
}

/* ── Main Component ── */
export default function NotificationBell() {
  const [permState, setPermState] = useState<PermState>("unsupported");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const checkSubscription = useCallback(async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    try {
      // Must pass the same scope used during registration so getRegistration()
      // finds the correct SW regardless of the current page URL.
      const reg = await navigator.serviceWorker.getRegistration("/socialapp/");
      if (!reg) { setIsSubscribed(false); return; }
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch {
      setIsSubscribed(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermState(Notification.permission as PermState);
    checkSubscription();
  }, [checkSubscription]);

  // Close popup on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        popupRef.current && !popupRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setStatusMsg(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function handleToggle() {
    if (loading) return;

    if (isIOS() && !isIOSStandalone()) {
      setStatusMsg({ text: "Install the app to your Home Screen via Safari to enable notifications.", ok: false });
      return;
    }
    if (permState === "denied") {
      setStatusMsg({ text: "Notifications are blocked. Allow them in your browser settings.", ok: false });
      return;
    }

    setLoading(true);
    setStatusMsg(null);
    try {
      if (isSubscribed) {
        const reg = await navigator.serviceWorker.getRegistration("/socialapp/");
        const sub = reg && await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
        // ✅ Persist user's choice so registerServiceWorker() won't re-subscribe on refresh
        localStorage.setItem("notifications_user_disabled", "1");
        localStorage.removeItem("sw_subscription_synced");
        setIsSubscribed(false);
        setStatusMsg({ text: "Notifications turned off.", ok: false });
      } else {
        if (permState !== "granted") {
          const result = await Notification.requestPermission();
          setPermState(result as PermState);
          if (result !== "granted") {
            setStatusMsg({ text: "Permission not granted. You can allow it in browser settings.", ok: false });
            return;
          }
        }
        // ✅ User is re-enabling — clear the disabled flag first
        localStorage.removeItem("notifications_user_disabled");
        await registerServiceWorker();
        await checkSubscription();
        setStatusMsg({ text: "Notifications are now active.", ok: true });
      }
    } catch (e) {
      console.error("[NotificationBell]", e);
      setStatusMsg({ text: "Something went wrong. Try again.", ok: false });
    } finally {
      setLoading(false);
    }
  }

  if (permState === "unsupported") return null;

  const isDenied = permState === "denied";
  const isOn = isSubscribed && !isDenied;

  const bellBg = isDenied ? "rgba(239,68,68,0.15)" : isOn ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.08)";
  const bellBorder = isDenied ? "rgba(239,68,68,0.4)" : isOn ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.12)";
  const bellColor = isDenied ? "#f87171" : isOn ? "#a78bfa" : "rgba(255,255,255,0.55)";

  return (
    <>
      <div style={{ position: "relative" }}>

        {/* Bell button */}
        <button
          ref={btnRef}
          onClick={() => { setOpen(o => !o); setStatusMsg(null); }}
          title="Notification settings"
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: open ? "rgba(124,58,237,0.35)" : bellBg,
            border: `1px solid ${open ? "rgba(124,58,237,0.6)" : bellBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
            flexShrink: 0,
            padding: 0,
            position: "relative",
            outline: "none",
            WebkitTapHighlightColor: "transparent",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {isDenied || !isOn
            ? <BellOffIcon color={bellColor} />
            : <BellIcon color={bellColor} />
          }
        </button>

        {/* Popup panel */}
        {open && (
          <div
            ref={popupRef}
            style={{
              position: "absolute",
              top: 48,
              right: 0,
              width: 296,
              background: "rgba(9,11,24,0.98)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(124,58,237,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
              zIndex: 10000,
              overflow: "hidden",
              animation: "popupIn 0.22s cubic-bezier(0.16,1,0.3,1)",
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            }}
          >

            {/* ── OFF state ── */}
            {!isOn && !isDenied && (
              <div style={{ padding: "20px 18px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(167,139,250,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 24px rgba(124,58,237,0.3)",
                  animation: "bellWiggle 3s ease-in-out infinite",
                  position: "relative", flexShrink: 0,
                }}>
                  <BellIcon color="#a78bfa" size={22} />
                  <span style={{
                    position: "absolute", inset: -6, borderRadius: "50%",
                    border: "1px solid rgba(124,58,237,0.25)",
                    animation: "pulseRing 3s ease-out infinite",
                  }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Be the first to know</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 4, lineHeight: 1.6 }}>Only the alerts that matter — your habits,<br />challenges &amp; when you move up the ranks.</div>
                </div>
                <button
                  onClick={handleToggle}
                  disabled={loading}
                  style={{
                    width: "100%", padding: "12px 0",
                    borderRadius: 11, border: "none",
                    background: loading ? "rgba(124,58,237,0.35)" : "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                    color: "#fff", fontSize: 14, fontWeight: 700,
                    cursor: loading ? "wait" : "pointer",
                    letterSpacing: "-0.01em",
                    boxShadow: loading ? "none" : "0 4px 18px rgba(124,58,237,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {loading ? <><IconSpinner size={15} color="#c4b5fd" /> Enabling…</> : <><BellIcon color="#fff" size={15} /> Enable Notifications</>}
                </button>
              </div>
            )}

            {/* ── ON state ── */}
            {isOn && (
              <div style={{ padding: "18px 18px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(16,185,129,0.12)",
                  border: "1px solid rgba(110,231,183,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 16px rgba(16,185,129,0.25)",
                }}>
                  <BellIcon color="#6ee7b7" size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 6 }}>
                    Notifications on
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 5px rgba(16,185,129,0.8)", display: "inline-block", flexShrink: 0 }} />
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Tap to turn off</div>
                </div>
                <Toggle on={isOn} loading={loading} onChange={handleToggle} />
              </div>
            )}

            {/* ── DENIED state ── */}
            {isDenied && (
              <div style={{ padding: "22px 18px 20px" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                }}>
                  <BellOffIcon color="#f87171" size={22} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fca5a5", textAlign: "center", marginBottom: 14, letterSpacing: "-0.01em" }}>
                  Notifications Blocked
                </div>
                <div style={{
                  padding: "11px 14px", borderRadius: 11,
                  background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.18)",
                  fontSize: 12, color: "#fcd34d", lineHeight: 1.6,
                }}>
                  Go to <b style={{ color: "#fde68a" }}>Settings → Browser → Notifications</b> and allow this site, then reload the page.
                </div>
              </div>
            )}

            {/* Status message */}
            {statusMsg && (
              <div style={{
                margin: "0 14px 14px",
                padding: "10px 14px", borderRadius: 11,
                background: statusMsg.ok ? "rgba(16,185,129,0.09)" : "rgba(239,68,68,0.07)",
                border: `1px solid ${statusMsg.ok ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.18)"}`,
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                  background: statusMsg.ok ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  border: `1px solid ${statusMsg.ok ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: statusMsg.ok ? "#6ee7b7" : "#f87171",
                }}>
                  {statusMsg.ok ? <IconCheck size={10} /> : <IconX size={10} />}
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: statusMsg.ok ? "#6ee7b7" : "#fca5a5", lineHeight: 1.5 }}>
                  {statusMsg.text}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.88) translateY(-12px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
        @keyframes bellWiggle {
          0%,100% { transform: rotate(0deg); }
          10%      { transform: rotate(14deg); }
          20%      { transform: rotate(-10deg); }
          30%      { transform: rotate(8deg); }
          40%      { transform: rotate(-5deg); }
          50%      { transform: rotate(0deg); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 0.7; }
          70%  { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
