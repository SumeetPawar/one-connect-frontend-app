'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';
import { setGoogleFitConnected, verifyOAuthState } from '../../lib/googleFit';

function GoogleFitCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const status = searchParams.get('status');
    const stateParam = searchParams.get('state');
    const returnEncoded = searchParams.get('return');

    if (status !== 'ok') {
      // OAuth was denied or an error occurred — redirect home
      router.replace('/home');
      return;
    }

    // Verify CSRF nonce
    let returnPath = '/home';
    if (stateParam) {
      const verified = verifyOAuthState(stateParam);
      if (verified) {
        try {
          returnPath = decodeURIComponent(returnEncoded ?? '') || verified;
        } catch {
          returnPath = verified;
        }
      }
    } else if (returnEncoded) {
      // No state to verify (e.g. dev testing) — trust the return param if it's our path
      try {
        const decoded = decodeURIComponent(returnEncoded);
        if (/^\/socialapp\//.test(decoded)) returnPath = decoded;
      } catch {
        // ignore
      }
    }

    setGoogleFitConnected(true);

    // Strip basePath prefix for Next.js router
    const routerPath = returnPath.replace(/^\/socialapp/, '') || '/home';
    router.replace(routerPath + (routerPath.includes('?') ? '&' : '?') + 'gfit=connected');
  }, [router, searchParams]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: '4px solid #a855f7',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'gfit-cb-spin 0.8s linear infinite',
        }}
      />
      <p style={{ color: '#94a3b8', fontSize: '15px' }}>Connecting Google Fit…</p>
      <style>{`@keyframes gfit-cb-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function GoogleFitCallbackPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: '#0f172a' }} />
      }
    >
      <GoogleFitCallbackInner />
    </Suspense>
  );
}
