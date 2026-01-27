"use client";

import { useEffect } from "react";
import { 
  startBackgroundRefresh, 
  stopBackgroundRefresh, 
  setupVisibilityRefresh,
  isAuthed 
} from "@/lib/auth";

export default function TokenRefreshHandler() {
  useEffect(() => {
    let visibilityCleanup: (() => void) | undefined;

    // Restore session on app load
    const restoreSession = async () => {
      console.log("🔍 Checking for existing session..."); 
      
      const authenticated = await isAuthed();
      
      if (authenticated) {
        console.log("✅ Session restored successfully");
        
        // Start background refresh to keep user logged in
        startBackgroundRefresh();
        
        // Setup visibility handler to refresh when tab becomes active
        const cleanup = setupVisibilityRefresh();
        if (cleanup) {
          visibilityCleanup = cleanup;
        }
      } else {
        console.log("❌ No valid session found");
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