"use client";
import { useEffect } from "react";
import { startBackgroundRefresh, stopBackgroundRefresh, isAuthed } from "@/lib/auth";

export default function TokenRefreshHandler() {
  useEffect(() => {
    // Restore session on app load - auto-refresh if needed
    const restoreSession = async () => {
      const authenticated = await isAuthed();
      if (authenticated) {
        console.log('✅ Session restored successfully');
        // Start background refresh to keep user logged in
        startBackgroundRefresh();
      } else {
        console.log('❌ No valid session found');
      }
    };

    restoreSession();

    // Cleanup on unmount
    return () => {
      stopBackgroundRefresh();
    };
  }, []);

  return null;
}
