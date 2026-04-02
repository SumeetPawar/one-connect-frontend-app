'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Leaderboard } from "../../../components/Leaderboard";
import { SA } from "../../../components/constants";
import { NavBar } from "../NavBar";
import { getCachedUserMe, api } from "@/lib/api";

const DEFAULT_ACCENT = SA[3];

export default function LeaderboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("You");
  const [accent, setAccent] = useState(DEFAULT_ACCENT);

  useEffect(() => {
    getCachedUserMe()
      .then(u => { if (u?.name) setUserName(u.name.split(" ")[0]); })
      .catch(() => {});
    api<{ stage?: number }>("/api/habit-challenges/active")
      .then(d => { if (typeof d.stage === "number") setAccent(SA[d.stage] ?? DEFAULT_ACCENT); })
      .catch(() => {});
  }, []);

  return (
    <>
      <Leaderboard
        accent={accent}
        userName={userName}
        onBack={() => router.push("/habits/tree")}
      />
      <NavBar activeTab="leaderboard" accent={accent} />
    </>
  );
}
