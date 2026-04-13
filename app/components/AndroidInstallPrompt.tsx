"use client";

import { useEffect, useRef, useState } from "react";
import { isIOS } from "../register-sw";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "android_install_prompt_dismissed_at";

function IconZap({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IconBell({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );
}
function IconTrophy({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  );
}
function IconDownload({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
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

const features = [
  { icon: <IconZap size={15} />, label: "Instant load", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
  { icon: <IconBell size={15} />, label: "Push alerts", color: "#a78bfa", bg: "rgba(124,58,237,0.1)", border: "rgba(124,58,237,0.25)" },
  { icon: <IconTrophy size={15} />, label: "Live ranks", color: "#34d399", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)" },
];

export default function AndroidInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Capture beforeinstallprompt unconditionally
  useEffect(() => {
    console.log("[PWA] AndroidInstallPrompt mounted, listening for beforeinstallprompt");
    const handler = (e: Event) => {
      e.preventDefault();
      console.log("[PWA] beforeinstallprompt captured");
      const evt = e as BeforeInstallPromptEvent;
      deferredPromptRef.current = evt;
      setDeferredPrompt(evt);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Always show on explicit icon tap — only on non-iOS
  useEffect(() => {
    const showHandler = () => {
      if (isIOS()) return; // iOS has its own prompt
      if (!window.matchMedia("(display-mode: standalone)").matches) setVisible(true);
    };
    window.addEventListener("show-install-prompt", showHandler);
    return () => window.removeEventListener("show-install-prompt", showHandler);
  }, []);

  async function handleInstall() {
    const prompt = deferredPrompt || deferredPromptRef.current;
    console.log("[PWA] Install clicked, prompt:", prompt);
    if (!prompt || installing) {
      console.warn("[PWA] No deferred prompt available — browser may not have fired beforeinstallprompt");
      return;
    }
    setInstalling(true);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    console.log("[PWA] Install outcome:", outcome);
    setDeferredPrompt(null);
    deferredPromptRef.current = null;
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
    setInstalling(false);
  }

  function dismiss() {
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
        aria-label="Install app"
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
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
                Get the full experience
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4, lineHeight: 1.5 }}>
                Add to Home Screen — instant, free,<br />and it unlocks everything.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {features.map((f) => (
              <div
                key={f.label}
                style={{
                  flex: 1,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "12px 8px",
                  borderRadius: 14,
                  background: f.bg,
                  border: `1px solid ${f.border}`,
                  color: f.color,
                }}
              >
                {f.icon}
                <span style={{ fontSize: 11, fontWeight: 600, color: f.color, textAlign: "center" }}>{f.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleInstall}
            disabled={installing}
            style={{
              width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
              background: installing ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
              color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
              cursor: installing ? "wait" : "pointer",
              boxShadow: installing ? "none" : "0 6px 28px rgba(124,58,237,0.55)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              outline: "none", WebkitTapHighlightColor: "transparent",
            }}
          >
            {installing ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2a10 10 0 0 1 10 10" style={{ animation: "spin 0.8s linear infinite", transformOrigin: "center" }} />
                </svg>
                Installing...
              </>
            ) : (
              <>
                <IconDownload size={18} />
                Install App — Free
              </>
            )}
          </button>

          <button
            onClick={dismiss}
            style={{
              background: "none", border: "none",
              color: "rgba(255,255,255,0.22)",
              fontSize: 13, cursor: "pointer",
              padding: 0, marginTop: -8,
              outline: "none", WebkitTapHighlightColor: "transparent",
            }}
          >
            Maybe later
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
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
