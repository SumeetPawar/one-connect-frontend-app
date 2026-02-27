"use client";

import { useEffect } from "react";
import {
  startBackgroundRefresh,
  stopBackgroundRefresh,
  setupVisibilityRefresh,
  refreshAccessToken,
  isAccessTokenExpiredOrExpiring
} from "@/lib/auth";

export default function TokenRefreshHandler() {
  useEffect(() => {
    let visibilityCleanup: (() => void) | undefined;

    // Restore session on app load
    const restoreSession = async () => {
      console.log("🔍 Checking for existing session...");

      const refreshToken = typeof window !== "undefined"
        ? localStorage.getItem("refresh_token")
        : null;

      // No refresh token at all — session is gone
      if (!refreshToken) {
        console.log("❌ No refresh token found — session expired");
        if (typeof window !== "undefined" &&
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/signup")) {
          window.location.href = "/socialapp/login";
        }
        return;
      }

      // If access token is still valid (not expired or expiring soon), skip refresh
      if (!isAccessTokenExpiredOrExpiring(5 * 60)) {
        console.log("✅ Access token still valid — starting background refresh");
        startBackgroundRefresh();
        const cleanup = setupVisibilityRefresh();
        if (cleanup) visibilityCleanup = cleanup;
        return;
      }

      // Access token is expired or expiring — refresh it now
      console.log("🔄 Access token expired/expiring on app open — refreshing...");
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        console.log("✅ Session restored and token refreshed");
        startBackgroundRefresh();
        const cleanup = setupVisibilityRefresh();
        if (cleanup) visibilityCleanup = cleanup;
      } else {
        // Check if refresh token was cleared (truly expired)
        const stillHasRefreshToken = typeof window !== "undefined"
          ? localStorage.getItem("refresh_token")
          : null;

        if (!stillHasRefreshToken) {
          console.log("❌ Refresh token expired — redirecting to login");
          if (typeof window !== "undefined" &&
            !window.location.pathname.includes("/login") &&
            !window.location.pathname.includes("/signup")) {
            window.location.href = "/socialapp/login";
          }
        } else {
          // Network error — tokens still valid, start background refresh and hope for the best
          console.log("⚠️ Token refresh failed (network?) — starting background refresh anyway");
          startBackgroundRefresh();
          const cleanup = setupVisibilityRefresh();
          if (cleanup) visibilityCleanup = cleanup;
        }
      }
    };

    restoreSession();

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up token refresh handlers");
      stopBackgroundRefresh();
      
      // Call cleanup function if it exists
      if (visibilityCleanup) {
        visibilityCleanup();
      }
    };
  }, []);

  return null;
}