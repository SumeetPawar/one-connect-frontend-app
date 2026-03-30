"use client";

import { useEffect, useState } from "react";
import { isIOS, isIOSStandalone } from "../register-sw";

const DISMISSED_KEY = "ios_install_prompt_dismissed_at";
const ONE_DAY_MS = 7 * 24 * 60 * 60 * 1000;

function IconShare({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
function IconPlus({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconCheck({ size = 18 }: { size?: number }) {
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

const steps = [
  {
    num: 1,
    icon: <IconShare size={16} />,
    iconColor: "#60a5fa",
    iconBg: "rgba(59,130,246,0.12)",
    iconBorder: "rgba(59,130,246,0.25)",
    title: "Tap the Share button",
    desc: "Bottom of Safari — or the menu in Chrome",
  },
  {
    num: 2,
    icon: <IconPlus size={16} />,
    iconColor: "#a78bfa",
    iconBg: "rgba(124,58,237,0.12)",
    iconBorder: "rgba(124,58,237,0.28)",
    title: '"Add to Home Screen"',
    desc: "Scroll down the share sheet to find it",
  },
  {
    num: 3,
    icon: <IconCheck size={16} />,
    iconColor: "#34d399",
    iconBg: "rgba(16,185,129,0.12)",
    iconBorder: "rgba(16,185,129,0.25)",
    title: "Tap Add — then open the app",
    desc: "Launch from your Home Screen to unlock alerts",
  },
];

export default function IOSInstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const autoShow = () => {
      if (!isIOS() || isIOSStandalone()) return;
      const last = localStorage.getItem(DISMISSED_KEY);
      if (last && Date.now() - Number(last) < ONE_DAY_MS) return;
      setVisible(true);
    };
    autoShow();
  }, []);

  // Always show on explicit icon tap — only on iOS
  useEffect(() => {
    const showHandler = () => {
      if (isIOS() && !isIOSStandalone()) setVisible(true);
    };
    window.addEventListener("show-install-prompt", showHandler);
    return () => window.removeEventListener("show-install-prompt", showHandler);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
      <div
        onClick={dismiss}
        style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          animation: "backdropIn 0.25s ease",
        }}
      />
      <div
        role="dialog"
        aria-modal
        aria-label="Install app to enable notifications"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
          maxWidth: 480, margin: "0 auto",
          background: "rgba(9,11,24,0.99)",
          backdropFilter: "blur(48px)",
          WebkitBackdropFilter: "blur(48px)",
          borderRadius: "24px 24px 0 0",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 -16px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.08)",
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          animation: "slideUp 0.35s cubic-bezier(0.16,1,0.3,1)",
          overflow: "hidden",
        }}
      >
        <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #7c3aed 30%, #a855f7 70%, transparent)", opacity: 0.7 }} />
        <div style={{ padding: "14px 0 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
        </div>
        <button
          onClick={dismiss}
          aria-label="Close"
          style={{
            position: "absolute", top: 18, right: 18,
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", padding: 0, outline: "none",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <IconX size={14} />
        </button>

        <div style={{ padding: "18px 22px 36px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Hero */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingRight: 32 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16, flexShrink: 0,
              background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
              boxShadow: "0 8px 32px rgba(124,58,237,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 7l8 5 8-5-8-5z" fill="rgba(255,255,255,0.9)" />
                <path d="M4 12l8 5 8-5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 17l8 5 8-5" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.2 }}>
                One step to unlock everything
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4, lineHeight: 1.5 }}>
                Add to your Home Screen to get push<br />notifications and the full app experience.
              </div>
            </div>
          </div>

          {/* Info banner */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            background: "rgba(251,191,36,0.06)",
            border: "1px solid rgba(251,191,36,0.16)",
            borderRadius: 14, padding: "11px 14px",
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
              background: "rgba(251,191,36,0.12)",
              border: "1px solid rgba(251,191,36,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" /><circle cx="12" cy="16" r="1.2" fill="#0f172a" />
              </svg>
            </div>
            <span style={{ fontSize: 12, color: "#fcd34d", lineHeight: 1.55, fontWeight: 500 }}>
              iOS only sends push notifications to apps installed on your Home Screen — not from the browser.
            </span>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {steps.map((s) => (
              <div key={s.num} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: s.iconBg, border: `1px solid ${s.iconBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: s.iconColor,
                }}>
                  {s.icon}
                </div>
                <div style={{ flex: 1, paddingTop: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 7,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.2)",
                  fontSize: 11, fontWeight: 700,
                }}>
                  {s.num}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={dismiss}
            style={{
              marginTop: 4, width: "100%", padding: "15px 0",
              borderRadius: 16, border: "none",
              background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
              color: "#fff", fontSize: 16, fontWeight: 700,
              cursor: "pointer", letterSpacing: "-0.02em",
              boxShadow: "0 6px 28px rgba(124,58,237,0.55)",
              outline: "none", WebkitTapHighlightColor: "transparent",
            }}
          >
            Got it — show me how
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(110%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
