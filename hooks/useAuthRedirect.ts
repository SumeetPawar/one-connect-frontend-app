import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getCachedUserMe } from '@/lib/api';
import { refreshAccessToken, waitForSessionReady, getTokenExpiryInfo } from '@/lib/auth';

function ts() { return new Date().toISOString(); }

/** Only clears tokens when the refresh token itself is confirmed expired/invalid (401 on /refresh). */
function forceRedirectToLogin(router: ReturnType<typeof useRouter>, reason: string) {
  console.warn(`[Auth][${ts()}] Redirecting to login — reason: ${reason}`);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');  // only cleared when session is truly dead
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_me');
    localStorage.removeItem('user_profile');
  }
  router.replace('/login');
}

export function useAuthRedirect({ apiCheck = false }: { apiCheck?: boolean } = {}) {
  const router = useRouter();
  const isClient = typeof window !== "undefined";
  const currentPath = isClient ? window.location.pathname : "";
  const isLoginPath = currentPath === "/login" || currentPath === "/socialapp/login";

  useEffect(() => {
    const run = async () => {
      // Wait for TokenRefreshHandler to finish its initial session check.
      // This prevents a race condition where useAuthRedirect reads tokens
      // before TokenRefreshHandler has had a chance to refresh them.
      await waitForSessionReady();
      console.log(`[Auth][${ts()}] Session ready — evaluating auth state`);
      console.log(`[Auth][${ts()}] 🪪 Access token status: ${getTokenExpiryInfo()}`);

      const accessToken = isClient ? localStorage.getItem("access_token") : null;
      const refreshToken = isClient ? localStorage.getItem("refresh_token") : null;

      console.log(`[Auth][${ts()}] useAuthRedirect — accessToken: ${accessToken ? "present" : "MISSING"}, refreshToken: ${refreshToken ? "present" : "MISSING"}`);

      if (!accessToken) {
        // No access token — try refreshing before giving up
        if (refreshToken) {
          console.log(`[Auth][${ts()}] Access token missing but refresh token present — attempting silent refresh...`);
          const ok = await refreshAccessToken();
          if (!ok) {
            const stillHasRefresh = isClient ? localStorage.getItem("refresh_token") : null;
            if (!stillHasRefresh) {
              if (!isLoginPath) forceRedirectToLogin(router, "refresh token rejected by server");
            } else {
              console.warn(`[Auth][${ts()}] Silent refresh failed (network?) — not logging out`);
            }
          } else {
            console.log(`[Auth][${ts()}] Silent refresh succeeded — user stays logged in`);
          }
        } else {
          if (!isLoginPath) forceRedirectToLogin(router, "no access token and no refresh token");
        }
        return;
      }

      if (apiCheck) {
        try {
          await getCachedUserMe(true);
          console.log(`[Auth][${ts()}] API auth check passed`);
        } catch (err: any) {
          if (err?.status === 401 && !isLoginPath) {
            console.warn(`[Auth][${ts()}] API returned 401 — session expired`);
            forceRedirectToLogin(router, "API returned 401");
          } else if (err?.status !== 401) {
            console.warn(`[Auth][${ts()}] Auth check failed with non-auth error:`, err?.status);
          }
        }
      }
    };

    run();
  }, [router, apiCheck, isClient, isLoginPath]);
}
