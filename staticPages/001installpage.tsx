"use client";

import { useState, useEffect } from "react";

export default function PWAInstallLanding() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [currentWord, setCurrentWord] = useState<string>('Wellness');
  const [fade, setFade] = useState(true);

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

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  const handleContinue = () => {
    window.location.href = '/dashboard';
  };

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
              Install for offline access, notifications, and the best experience
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
                    <span>Tap the <strong style={{ color: '#ffffff' }}>Share</strong> button <span style={{ fontSize: '18px' }}>⎋</span> (bottom toolbar)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontWeight: '600', minWidth: '20px', color: '#c084fc' }}>2.</span>
                    <span>Scroll down and tap <strong style={{ color: '#ffffff' }}>"Add to Home Screen"</strong></span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontWeight: '600', minWidth: '20px', color: '#c084fc' }}>3.</span>
                    <span>Tap <strong style={{ color: '#ffffff' }}>"Add"</strong> in the top right corner</span>
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
                      <span>Tap the <strong style={{ color: '#ffffff' }}>Share</strong> button <span style={{ fontSize: '18px' }}>⎋</span> (bottom toolbar)</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontWeight: '600', minWidth: '20px', color: '#c084fc' }}>2.</span>
                      <span>Scroll down and tap <strong style={{ color: '#ffffff' }}>"Add to Home Screen"</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontWeight: '600', minWidth: '20px', color: '#c084fc' }}>3.</span>
                      <span>Tap <strong style={{ color: '#ffffff' }}>"Add"</strong> in the top right corner</span>
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

        {/* Already Installed Message */}
        {isInstalled && (
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
            borderRadius: '12px',
            padding: '16px',
            maxWidth: '400px',
            margin: '0 auto',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: '600',
            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.5)'
          }}>
            ✓ App Installed Successfully
          </div>
        )}

        {/* Continue to Web Link */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center'
        }}>
          <a
            onClick={handleContinue}
            style={{
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '14px',
              fontWeight: '400',
              textDecoration: 'underline',
              cursor: 'pointer',
              letterSpacing: '0'
            }}
          >
            {isInstalled ? 'Open App' : 'Continue to Web'}
          </a>
        </div>
      </div>
    </div>
  );
}