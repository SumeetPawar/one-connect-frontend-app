"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthed } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔍 Checking authentication status...");
      const authed = await isAuthed();
      
      console.log("User is", authed ? "authenticated ✅" : "not authenticated ❌");
      
      setChecking(false);
      router.replace(authed ? "/goals" : "/login");
    };

    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}>
        <div style={{
          textAlign: "center",
          color: "white",
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "4px solid rgba(255,255,255,0.3)",
            borderTop: "4px solid white",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
          }} />
          <p style={{ fontSize: "18px", fontWeight: "500" }}>Loading...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return null;
}