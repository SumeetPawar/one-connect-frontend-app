'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

// Smart redirect — finds latest enrolled active challenge and goes to steps
// If not enrolled, goes back to home (Steps tab is disabled anyway)
export default function StepsRedirect() {
  const router = useRouter();

  useEffect(() => {
    api<any[]>("/api/challenges/available")
      .then(challenges => {
        const today = new Date().toISOString().slice(0, 10);
        const enrolled = Array.isArray(challenges)
          ? [...challenges]
              .filter(c => c.user_joined && c.status === "active" && c.start_date <= today && (!c.end_date || c.end_date >= today))
              .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())[0]
          : null;
        router.replace(enrolled ? `/challanges/${enrolled.id}/steps` : "/home");
      })
      .catch(() => router.replace("/home"));
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0A0A",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        border: "2px solid rgba(167,139,245,.2)",
        borderTop: "2px solid #A78BF5",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
