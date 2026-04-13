"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/* â”€â”€ Minimal SVG icon set (no emojis) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function IconBell() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function IconTrophy() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/>
      <path d="M7 4H4a2 2 0 0 0-2 2v2a4 4 0 0 0 4 4h.5"/><path d="M17 4h3a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4h-.5"/>
      <rect x="7" y="2" width="10" height="9" rx="2"/>
    </svg>
  );
}
function IconFlame() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  );
}
function IconChartLine() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IconZap() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}
function IconDownload() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

export default function PWAInstallLanding() {
  const router = useRouter();
  const handleBack = () => router.back();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [currentWord, setCurrentWord] = useState<string>('Wellness');
  const [fade, setFade] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [installMessage, setInstallMessage] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [notificationConsent, setNotificationConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);

  // Animated word loop with smooth fade
  useEffect(() => {
    const words = ['Wellness', 'Events', 'Connect', 'Insights'];
    let index = 0;
    
    const interval = setInterval(() => {
      setFade(false); // Start fade out
      
      setTimeout(() => {
        index = (index + 1) % words.length;
        setCurrentWord(words[index]);
        setFade(true); // Fade in new word
      }, 300); // Wait for fade out to complete
    }, 2500); // Slower interval for better readability

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const iOS = /ipad|iphone|ipod/.test(userAgent);
    const android = /android/.test(userAgent);
    
    setIsIOS(iOS);
    setIsAndroid(android);

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setInstalling(true);
    setInstallMessage('Installation in progress...');
    setNavBarMessage('Installation in progress...');

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setInstallMessage('App installed! You can now open it from your app tray or home screen as \u201cGES Connect\u201d.');
      setNavBarMessage('âœ“ App Installed Successfully');
      setTimeout(() => {
        setInstalling(false);
        setNavBarMessage(null);
      }, 2500);
    } else {
      setInstallMessage('Installation was cancelled.');
      setNavBarMessage(null);
      setTimeout(() => setInstalling(false), 2000);
    }
  };

  const handleContinue = () => {
    router.replace('/login');
  };

  const [navBarMessage, setNavBarMessage] = useState<string | null>(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080b18',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Back Button */}
      <div style={{ position: 'fixed', top: 16, left: 16, zIndex: 50 }}>
        <button
          onClick={handleBack}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.7)',
            transition: 'all 0.2s',
            padding: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      {/* Aurora background layers */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '30%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '-5%',
          width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }} />
      </div>

      {/* Nav bar install status */}
      {navBarMessage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999,
          background: navBarMessage.startsWith('âœ“')
            ? 'linear-gradient(90deg, #059669, #10b981)'
            : 'linear-gradient(90deg, #7c3aed, #a855f7)',
          color: '#fff', fontWeight: 700, fontSize: 15,
          textAlign: 'center', padding: '13px 0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          animation: 'slideDown 0.3s ease',
          letterSpacing: '-0.01em',
        }}>
          {navBarMessage}
        </div>
      )}

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '60px 24px 80px',
        maxWidth: 460, margin: '0 auto', width: '100%',
      }}>

        {/* Top badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 20, padding: '5px 14px', marginBottom: 32,
          color: '#a78bfa', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          <IconZap />
          Premium Fitness App
        </div>

        {/* Hero headline */}
        <h1 style={{
          fontSize: 38, fontWeight: 800, color: '#fff',
          letterSpacing: '-0.04em', lineHeight: 1.1,
          textAlign: 'center', marginBottom: 6,
        }}>
          GES&nbsp;
          <span style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            minWidth: 140,
            opacity: fade ? 1 : 0,
            transform: fade ? 'translateY(0)' : 'translateY(-6px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}>
            {currentWord}
          </span>
        </h1>

        <p style={{
          fontSize: 16, color: 'rgba(255,255,255,0.5)',
          textAlign: 'center', lineHeight: 1.6,
          maxWidth: 320, margin: '0 0 40px',
        }}>
          Track goals, join challenges, and stay motivated with your team â€” all in one place.
        </p>

        {/* Feature cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 10, width: '100%', marginBottom: 36,
        }}>
          {[
            { icon: <IconFlame />, label: 'Daily Streaks', sub: 'Stay consistent' },
            { icon: <IconTrophy />, label: 'Leaderboards', sub: 'Compete & win' },
            { icon: <IconBell />, label: 'Smart Alerts', sub: 'Never miss a moment' },
            { icon: <IconChartLine />, label: 'Live Metrics', sub: 'Track everything' },
          ].map(f => (
            <div key={f.label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '16px 14px',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ color: '#a78bfa' }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e0e7ff' }}>{f.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{f.sub}</div>
            </div>
          ))}
        </div>

        {/* Install CTA card */}
        {!isInstalled && (
          <div style={{
            width: '100%',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 0 0 1px rgba(124,58,237,0.08), 0 20px 60px rgba(0,0,0,0.4)',
          }}>
            {/* Card header */}
            <div style={{
              padding: '22px 22px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(99,102,241,0.08) 100%)',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>
                Install GES Connect
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                One tap access Â· Offline support Â· Push notifications
              </div>
            </div>

            <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Android auto-install */}
              {deferredPrompt && isAndroid && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['Works offline, anytime', 'Real-time push notifications', 'Native app speed & feel'].map(b => (
                      <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                        <span style={{
                          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6ee7b7',
                        }}><IconCheck /></span>
                        {b}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleInstallClick}
                    disabled={installing}
                    style={{
                      width: '100%', padding: '15px 0',
                      background: installing
                        ? 'rgba(124,58,237,0.4)'
                        : 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                      border: 'none', borderRadius: 14,
                      color: '#fff', fontSize: 15, fontWeight: 700,
                      cursor: installing ? 'wait' : 'pointer',
                      boxShadow: installing ? 'none' : '0 4px 24px rgba(124,58,237,0.5)',
                      letterSpacing: '-0.01em', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s',
                    }}
                  >
                    <IconDownload />
                    {installing ? 'Installingâ€¦' : 'Install Now â€” It\'s Free'}
                  </button>
                </>
              )}

              {/* iOS instructions */}
              {isIOS && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { n: 1, label: 'Tap the Share button', sub: 'Bottom bar in Safari Â· top menu in Chrome' },
                    { n: 2, label: '"Add to Home Screen"', sub: 'Scroll the share sheet to find this option' },
                    { n: 3, label: 'Tap Add â€” done', sub: 'Launch from your Home Screen for full access' },
                  ].map(s => (
                    <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: '#a78bfa',
                      }}>{s.n}</div>
                      <div style={{ paddingTop: 3 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e7ff' }}>{s.label}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Android manual (no deferred prompt) */}
              {isAndroid && !deferredPrompt && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { n: 1, label: 'Tap the menu button', sub: 'Three dots at the top right of Chrome' },
                    { n: 2, label: '"Add to Home screen"', sub: 'Or "Install app" if shown' },
                    { n: 3, label: 'Tap Install', sub: 'Confirm to add GES Connect to your screen' },
                  ].map(s => (
                    <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: '#a78bfa',
                      }}>{s.n}</div>
                      <div style={{ paddingTop: 3 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e7ff' }}>{s.label}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Desktop â€” show both */}
              {!isIOS && !isAndroid && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[
                    {
                      title: 'iPhone / iPad (Safari)',
                      steps: [
                        { n: 1, label: 'Tap the Share button', sub: 'Bottom bar in Safari' },
                        { n: 2, label: 'Select "Add to Home Screen"', sub: 'Scroll down the share sheet' },
                        { n: 3, label: 'Tap Add', sub: 'App appears on your Home Screen' },
                      ],
                    },
                    {
                      title: 'Android (Chrome)',
                      steps: [
                        { n: 1, label: 'Open the Chrome menu', sub: 'Three dots â€” top right' },
                        { n: 2, label: '"Add to Home Screen"', sub: 'Or "Install app"' },
                        { n: 3, label: 'Tap Install to confirm', sub: '' },
                      ],
                    },
                  ].map(platform => (
                    <div key={platform.title}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{platform.title}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {platform.steps.map(s => (
                          <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                              background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 700, color: '#a78bfa',
                            }}>{s.n}</div>
                            <div style={{ paddingTop: 2 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e7ff' }}>{s.label}</div>
                              {s.sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{s.sub}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Privacy & security note */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.14)',
              }}>
                <div style={{ color: '#6ee7b7', flexShrink: 0 }}><IconShield /></div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
                  No account needed to install. Your data stays private and secure.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Already installed state */}
        {isInstalled && (
          <div style={{
            width: '100%', padding: '28px 24px', borderRadius: 24, textAlign: 'center',
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', margin: '0 auto 14px',
              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6ee7b7',
            }}><IconShield /></div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>App Installed</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 24 }}>
              You're all set. Open GES Connect from your Home Screen for the full experience.
            </div>
            <button
              onClick={handleContinue}
              style={{
                padding: '13px 32px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
              }}
            >
              Continue to App
            </button>
          </div>
        )}

        {/* Install progress bar */}
        {installing && (
          <div style={{
            position: 'fixed', bottom: 0, left: 0, width: '100%', zIndex: 9999,
            background: 'rgba(10,12,28,0.96)',
            borderTop: '1px solid rgba(124,58,237,0.25)',
            padding: '16px 20px', textAlign: 'center',
            fontSize: 14, color: '#c4b5fd', fontWeight: 600,
            backdropFilter: 'blur(16px)',
          }}>
            Look for <span style={{ color: '#fff', fontWeight: 700 }}>GES Connect</span> in your app tray or home screen.
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
