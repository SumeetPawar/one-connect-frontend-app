"use client";

import { useEffect } from "react";
import {
  startBackgroundRefresh,
  stopBackgroundRefresh,
  setupVisibilityRefresh,
  refreshAccessToken,
  isAccessTokenExpiredOrExpiring,
  signalSessionReady,
  getTokenExpiryInfo,
} from "@/lib/auth";

export default function TokenRefreshHandler() {
  useEffect(() => {
    let visibilityCleanup: (() => void) | undefined;

    const restoreSession = async () => {
      console.log("🔍 [TokenRefresh] Checking for existing session...");

      const refreshToken = typeof window !== "undefined"
        ? localStorage.getItem("refresh_token")
        : null;

      console.log(`🪪 [TokenRefresh] Access token status: ${getTokenExpiryInfo()}`);

      if (!refreshToken) {
        console.log("❌ [TokenRefresh] No refresh token — session gone");
        signalSessionReady(); // let useAuthRedirect know so it can redirect
        if (typeof window !== "undefined" &&
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/signup") &&
          !window.location.pathname.includes("/privacy")) {
          window.location.href = "/socialapp/login";
        }
        return;
      }

      if (!isAccessTokenExpiredOrExpiring(5 * 60)) {
        console.log(`✅ [TokenRefresh] Access token still valid — ${getTokenExpiryInfo()}`);
        signalSessionReady(); // token is fine, pages can proceed immediately
        startBackgroundRefresh();
        const cleanup = setupVisibilityRefresh();
        if (cleanup) visibilityCleanup = cleanup;
        return;
      }

      console.log("🔄 [TokenRefresh] Access token expired/expiring — refreshing...");
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        console.log("✅ [TokenRefresh] Token refreshed — session restored");
        signalSessionReady();
        startBackgroundRefresh();
        const cleanup = setupVisibilityRefresh();
        if (cleanup) visibilityCleanup = cleanup;
      } else {
        const stillHasRefreshToken = typeof window !== "undefined"
          ? localStorage.getItem("refresh_token")
          : null;

        if (!stillHasRefreshToken) {
          console.log("❌ [TokenRefresh] Refresh token rejected — redirecting to login");
          signalSessionReady(); // dead session, let page know
          if (typeof window !== "undefined" &&
            !window.location.pathname.includes("/login") &&
            !window.location.pathname.includes("/signup") &&
            !window.location.pathname.includes("/privacy")) {
            window.location.href = "/socialapp/login";
          }
        } else {
          // Network error — tokens still present, don't kick out the user
          console.log("⚠️ [TokenRefresh] Refresh failed (network?) — keeping session, starting background refresh");
          signalSessionReady(); // still valid tokens, let pages proceed
          startBackgroundRefresh();
          const cleanup = setupVisibilityRefresh();
          if (cleanup) visibilityCleanup = cleanup;
        }
      }
    };

    restoreSession();

    return () => {
      stopBackgroundRefresh();
      if (visibilityCleanup) visibilityCleanup();
    };
  }, []);

  return null;
}