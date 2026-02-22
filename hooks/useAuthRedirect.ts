import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { refreshAccessToken } from '@/lib/auth';

export function useAuthRedirect({ apiCheck = false }: { apiCheck?: boolean } = {}) {
  const router = useRouter();
  const isClient = typeof window !== "undefined";
  const currentPath = isClient ? window.location.pathname : "";
  const isLoginPath = currentPath === "/login" || currentPath === "/socialapp/login";

  useEffect(() => {
    const token = isClient ? localStorage.getItem("access_token") : null;
    if (!token) {
      if (!isLoginPath) {
        router.replace("/login");
      }
      return;
    }

    if (apiCheck) {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://cbiqa.dev.honeywellcloud.com/socialapi";
      const validateAuth = async () => {
        try {
          let accessToken = localStorage.getItem("access_token");
          let res = await fetch(`${API_BASE}/api/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (res.status === 401) {
            const refreshed = await refreshAccessToken();
            if (!refreshed) {
              if (!isLoginPath) {
                router.replace("/login");
              }
              return;
            }

            accessToken = localStorage.getItem("access_token");
            if (!accessToken) {
              if (!isLoginPath) {
                router.replace("/login");
              }
              return;
            }

            res = await fetch(`${API_BASE}/api/me`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.status === 401 && !isLoginPath) {
              router.replace("/login");
              return;
            }
          }

          if (!res.ok && res.status !== 401) {
            console.warn("Auth check failed with non-auth error:", res.status);
          }
        } catch (error) {
          console.error("Auth check request failed:", error);
        }
      };

      validateAuth();
    }
  }, [router, apiCheck, isClient, isLoginPath]);
}
