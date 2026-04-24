'use client';

import { useEffect } from 'react';
import { getAccessToken } from '../../lib/auth';

/**
 * SessionSync — mounts invisibly in the layout.
 * Mirrors the JWT access_token from localStorage into an HttpOnly cookie
 * so the service worker background-sync route can make authenticated API calls
 * even when the app is not open.
 *
 * Runs once on mount and re-runs if the page regains focus (token may have refreshed).
 */
export default function SessionSync() {
  const syncSession = () => {
    const token = getAccessToken();
    if (!token) return;

    fetch('/socialapp/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).catch(() => {
      // Silent fail — background sync will just skip if cookie is missing
    });
  };

  useEffect(() => {
    syncSession();

    // Re-sync when user returns to the tab (token may have been refreshed)
    const onFocus = () => syncSession();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
