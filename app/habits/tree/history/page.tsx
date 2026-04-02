'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ForestHistory } from "../../../components/ForestHistory";
import { SA } from "../../../components/constants";
import { api } from "@/lib/api";

const DEFAULT_ACCENT = SA[3];

function genDays(streakDays: number, seed: number, habitIds: string[]): Record<number, Record<string, boolean>> {
  const d: Record<number, Record<string, boolean>> = {};
  let s = seed;
  const rnd = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  for (let day = 1; day <= 21; day++) {
    d[day] = {};
    habitIds.forEach((id: string) => { d[day][id] = rnd() < (day <= streakDays ? 0.88 : 0.18); });
  }
  return d;
}

const PAST_CYCLES = [
  { id:1, label:"Cycle 1", dates:"Jan 1 – Jan 21",  stage:5, streak:18, highlight:"First full bloom.",                  habits:["water","move","read","sleep"],                       days:genDays(18,101,["water","move","read","sleep"]) },
  { id:2, label:"Cycle 2", dates:"Feb 1 – Feb 21",  stage:4, streak:14, highlight:"Strong second week carried this one.", habits:["water","move","sleep","meditate"],                 days:genDays(14,202,["water","move","sleep","meditate"]) },
  { id:3, label:"Cycle 3", dates:"Feb 22 – Mar 14", stage:2, streak:6,  highlight:"Toughest cycle. Life got in the way.", habits:["water","read"],                                   days:genDays(6,303,["water","read"]) },
  { id:4, label:"Cycle 4", dates:"Mar 15 – Apr 4",  stage:5, streak:21, highlight:"Perfect streak.",                    habits:["water","move","read","sleep","meditate","journal"], days:genDays(21,404,["water","move","read","sleep","meditate","journal"]) },
  { id:5, label:"Cycle 5", dates:"Apr 5 – Apr 25",  stage:3, streak:9,  highlight:"Lost momentum late.",                habits:["water","move","journal"],                           days:genDays(9,505,["water","move","journal"]) },
  { id:6, label:"Cycle 6", dates:"Apr 26 – May 16", stage:4, streak:13, highlight:"Back on track.",                     habits:["water","move","read","sleep","journal"],             days:genDays(13,606,["water","move","read","sleep","journal"]) },
].map(c => ({ ...c, habitsTotal: Object.values(c.days).reduce((a: number, d) => a + Object.values(d as Record<string,boolean>).filter(Boolean).length, 0) }));

export default function HistoryPage() {
  const router = useRouter();
  const [accent, setAccent] = useState(DEFAULT_ACCENT);

  useEffect(() => {
    api<{ stage?: number }>("/api/habit-challenges/active")
      .then(d => { if (typeof d.stage === "number") setAccent(SA[d.stage] ?? DEFAULT_ACCENT); })
      .catch(() => {});
  }, []);

  return (
    <ForestHistory
      cycles={PAST_CYCLES}
      accent={accent}
      onClose={() => router.back()}
    />
  );
}
