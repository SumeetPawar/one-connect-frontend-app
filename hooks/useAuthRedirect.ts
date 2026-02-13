import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuthRedirect({ apiCheck = false }: { apiCheck?: boolean } = {}) {
  const router = useRouter();
  const isClient = typeof window !== "undefined";
  const currentPath = isClient ? window.location.pathname : "";

  useEffect(() => {
    const token = isClient ? localStorage.getItem("access_token") : null;
    if (!token) {
      if (currentPath !== "/login") {
        router.replace("/login");
      }
      return;
    }
    if (apiCheck) {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://cbiqa.dev.honeywellcloud.com/socialapi";
      fetch(`${API_BASE}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (res.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            if (currentPath !== "/login") {
              router.replace("/login");
            }
          } else if (!res.ok) {
            if (currentPath !== "/login") {
              router.replace("/login");
            }
          }
        })
        .catch(() => {
          if (currentPath !== "/login") {
            router.replace("/login");
          }
        });
    }
  }, [router, apiCheck]);
}
