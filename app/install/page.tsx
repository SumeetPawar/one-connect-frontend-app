"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PWAInstallLanding() {
    const router = useRouter();
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
      setNavBarMessage('✓ App Installed Successfully');
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
      background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.7) 100%)',
        padding: '60px 24px 60px 24px',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {/* App Name with Animated Words */}
        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: '12px',
          letterSpacing: '-0.03em',
          lineHeight: '1.1'
        }}>
          GES{' '}
          <span style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #c084fc 0%, #e879f9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            minWidth: '140px',
            textAlign: 'left',
            opacity: fade ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            transform: fade ? 'translateY(0)' : 'translateY(-5px)',
            transitionProperty: 'opacity, transform'
          }}>
            {currentWord}
          </span>
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: '18px',
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: '32px',
          lineHeight: '1.5',
          maxWidth: '340px',
          margin: '0 auto 32px auto'
        }}>
          Track goals, join challenges, stay motivated with your team
        </p>

        {/* Install CTA Priority Section */}
        {!isInstalled && (
          <div style={{
            background: 'rgba(124, 58, 237, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px 20px',
            boxShadow: '0 4px 24px rgba(124, 58, 237, 0.3)',
            border: '1px solid rgba(167, 139, 250, 0.3)',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <div style={{
              fontSize: '17px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '8px'
            }}>
              📲 Get the App
            </div>
            <div style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              Install for offline access, notifications, and the best experience.<br />
            </div>

           
            {/* Android/Chrome Install Button */}
            {deferredPrompt && isAndroid && (
              <button
                onClick={handleInstallClick}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(139, 92, 246, 0.5)',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                Install Now
              </button>
            )}

            {/* iOS Instructions - Only for iOS users */}
            {isIOS && (
              <div style={{
                background: 'rgba(124, 58, 237, 0.15)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                border: '1px solid rgba(167, 139, 250, 0.3)'
              }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '12px'
                }}>
                  Install on iPhone/iPad:
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.5'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontWeight: '600', minWidth: '20px', color: '#c084fc' }}>1.</span>
                    <span>
                      Tap the <strong style={{ color: '#ffffff' }}>Share</strong> button
                      <span style={{ fontSize: '18px' }}>⎋</span>
                      <span style={{ color: '#a3e635', fontWeight: 500 }}> (bottom toolbar in Safari, top right menu in Chrome)</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontWeight: '600', minWidth: '20px', color: '#c084fc' }}>2.</span>
                    <span>Scroll and tap <strong style={{ color: '#ffffff' }}>&quot;Add to Home Screen&quot;</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontWeight: '600', minWidth: '20px', color: '#c084fc' }}>3.</span>
                    <span>Tap <strong style={{ color: '#ffffff' }}>&quot;Add&quot;</strong> in the top right corner</span>
                  </div>
                </div>
              </div>
            )}

            {/* Android Instructions - Only for Android users (without auto-install) */}
            {isAndroid && !deferredPrompt && (
              <div style={{
                background: 'rgba(124, 58, 237, 0.15)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                border: '1px solid rgba(167, 139, 250, 0.3)'
              }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '12px'
                }}>
                  Install on Android:
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.5'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontWeight: '600', minWidth: '20px', color: '#c084fc' }}>1.</span>
                    <span>Tap the <strong style={{ color: '#ffffff' }}>menu</strong> button <span style={{ fontSize: '18px' }}>⋮</span> (top right)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontWeight: '600', minWidth: '20px', color: '#c084fc' }}>2.</span>
                    <span>Select <strong style={{ color: '#ffffff' }}>"Add to Home screen"</strong> or <strong style={{ color: '#ffffff' }}>"Install app"</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontWeight: '600', minWidth: '20px', color: '#c084fc' }}>3.</span>
                    <span>Tap <strong style={{ color: '#ffffff' }}>"Install"</strong> to confirm</span>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop/Other - Show both iOS and Android instructions */}
            {!isIOS && !isAndroid && (
              <>
                <div style={{
                  background: 'rgba(124, 58, 237, 0.15)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  border: '1px solid rgba(167, 139, 250, 0.3)',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '12px'
                  }}>
                    Install on iPhone/iPad:
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: '1.5'
                  }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontWeight: '600', minWidth: '20px', color: '#c084fc' }}>1.</span>
                      <span>
                        Tap the <strong style={{ color: '#ffffff' }}>Share</strong> button
                        <span style={{ fontSize: '18px' }}>⎋</span>
                        <span style={{ color: '#a3e635', fontWeight: 500 }}> (bottom toolbar in Safari, top right menu in Chrome)</span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontWeight: '600', minWidth: '20px', color: '#c084fc' }}>2.</span>
                      <span>Scroll and tap <strong style={{ color: '#ffffff' }}>&quot;Add to Home Screen&quot;</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontWeight: '600', minWidth: '20px', color: '#c084fc' }}>3.</span>
                      <span>Tap <strong style={{ color: '#ffffff' }}>&quot;Add&quot;</strong> in the top right corner</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(124, 58, 237, 0.15)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  border: '1px solid rgba(167, 139, 250, 0.3)'
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '12px'
                  }}>
                    Install on Android:
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: '1.5'
                  }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontWeight: '600', minWidth: '20px', color: '#c084fc' }}>1.</span>
                      <span>Tap the <strong style={{ color: '#ffffff' }}>menu</strong> button <span style={{ fontSize: '18px' }}>⋮</span> (top right)</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontWeight: '600', minWidth: '20px', color: '#c084fc' }}>2.</span>
                      <span>Select <strong style={{ color: '#ffffff' }}>"Add to Home screen"</strong> or <strong style={{ color: '#ffffff' }}>"Install app"</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontWeight: '600', minWidth: '20px', color: '#c084fc' }}>3.</span>
                      <span>Tap <strong style={{ color: '#ffffff' }}>"Install"</strong> to confirm</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Nav Bar for install status */}
        {navBarMessage && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            background: navBarMessage.startsWith('✓') ? 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)' : 'linear-gradient(90deg, #a78bfa 0%, #c084fc 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '16px',
            textAlign: 'center',
            padding: '12px 0',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            letterSpacing: '0.01em',
            animation: navBarMessage.startsWith('✓') ? 'fadeInBar 0.3s' : 'pulseBar 1.2s infinite alternate',
            transition: 'background 0.3s'
          }}>
            {navBarMessage}
            <style>{`
              @keyframes pulseBar {
                0% { opacity: 1; }
                100% { opacity: 0.7; }
              }
              @keyframes fadeInBar {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>
        )}
        {/* After install started, show tray info at bottom */}
        {installing && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            background: 'rgba(124,58,237,0.15)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '15px',
            textAlign: 'center',
            padding: '14px 0',
            zIndex: 9999,
            letterSpacing: '0.01em',
            borderTop: '1px solid rgba(167,139,250,0.3)'
          }}>
            After install, look for <span style={{ background: 'rgba(124,58,237,0.15)', borderRadius: '6px', padding: '2px 6px', color: '#fff', fontWeight: 700 }}>GES Connect</span> in your app tray or home screen.
          </div>
        )}

        {/* After install started, show tray info at bottom */}
        {installing && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            background: 'rgba(124,58,237,0.15)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '15px',
            textAlign: 'center',
            padding: '14px 0',
            zIndex: 9999,
            letterSpacing: '0.01em',
            borderTop: '1px solid rgba(167,139,250,0.3)'
          }}>
            After install, look for <span style={{ background: 'rgba(124,58,237,0.15)', borderRadius: '6px', padding: '2px 6px', color: '#fff', fontWeight: 700 }}>GES Connect</span> in your app tray or home screen.
          </div>
        )}
      </div>
    </div>
  );
}