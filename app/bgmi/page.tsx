"use client";
import { useState, useEffect, useCallback, CSSProperties } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";
import { api, BodyMetricHistory, BodyMetricScan, BodyProfile, getBodyProfile, getLatestScan, getScanHistory, saveScan, updateBodyProfile } from "@/lib/api";
import BodyMetricsGuide from "../components/BodyMetricsGuide";


const C = {
  bg: "#0F0F11",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.07)",
  text: "#ECECF0",
  sub: "rgba(255,255,255,0.44)",
  dim: "rgba(255,255,255,0.22)",
  good: "#30D158",
  warn: "#FF9F0A",
  bad: "#FF453A",
  blue: "#0A84FF",
  purple: "#BF5AF2",
} as const;

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type Status = "excellent" | "good" | "fair" | "high";
type Period = "3M" | "6M" | "1Y" | "All";
type Gender = "male" | "female";
type Activity = "sedentary" | "light" | "moderate" | "active" | "athlete";

interface Metric {
  key: string; label: string; value: number; unit: string;
  ideal: [number, number]; min: number; max: number;
  color: string; status: Status; statusLabel: string;
  lowerIsBetter?: boolean; goal?: number; goalLabel?: string;
  trendKey: keyof TrendPt;
  rangeNote?: string; // explains why this range was chosen
}

interface TrendPt {
  label: string; fat: number; muscle: number; water: number;
  visceral: number; bone: number; protein: number; bmr: number; metage: number;
  weight: number; bmi: number;
}

/* ─────────────────────────────────────────────────────────────
   API TYPES
───────────────────────────────────────────────────────────── */
/* Map API scan → SCAN_VALUES shape */
function scanToValues(s: BodyMetricScan) {
  return {
    weight: s.weight_kg ?? 0,
    bmi: s.bmi ?? 0,
    visceral: s.visceral_fat ?? 0,
    fat: s.body_fat_pct ?? 0,
    muscle: s.muscle_mass_kg ?? 0,
    water: s.hydration_pct ?? 0,
    bmr: s.bmr_kcal ?? 0,
    protein: s.protein_pct ?? 0,
    metage: s.metabolic_age ?? 0,
    bone: s.bone_mass_kg ?? 0,
  };

}

/* Map API history → TrendPt[] */
function historyToTrend(scans: BodyMetricScan[]): TrendPt[] {
  return scans.map(s => {
    const d = new Date(s.recorded_date);
    const label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return {
      label,
      weight: s.weight_kg ?? 0,
      bmi: s.bmi ?? 0,
      fat: s.body_fat_pct ?? 0,
      visceral: s.visceral_fat ?? 0,
      muscle: s.muscle_mass_kg ?? 0,
      water: s.hydration_pct ?? 0,
      bmr: s.bmr_kcal ?? 0,
      protein: s.protein_pct ?? 0,
      metage: s.metabolic_age ?? 0,
      bone: s.bone_mass_kg ?? 0,
    };
  });
}

/* Fallback values when no scan exists yet */
const EMPTY_SCAN = {
  weight: 0, bmi: 0, visceral: 0, fat: 0, muscle: 0,
  water: 0, bmr: 0, protein: 0, metage: 0, bone: 0,
};

/* ─────────────────────────────────────────────────────────────
   COMPUTE IDEAL RANGES  from user profile
───────────────────────────────────────────────────────────── */
function computeRanges(age: number, gender: Gender, activity: Activity, height: number, weight: number): Record<string, [number, number]> {
  const isMale = gender === "male";
  const heightM = height / 100;
  const floor = (n: number) => n < 0 ? -((-n + 1) | 0) : n | 0;
  const clamp0 = (n: number) => n < 0 ? 0 : n;
  const ageAdj = clamp0(floor((age - 30) / 10));
  const round = (n: number) => (n + 0.5) | 0;

  // BMI — age adjusted for elderly
  const bmiIdeal: [number, number] = age > 60 ? [20.0, 24.9] : [18.5, 22.9];

  // Weight — activity bonus for muscle mass
  const activityBonus = activity === "athlete" ? 2.5
    : activity === "active" ? 1.5
    : activity === "moderate" ? 0.5 : 0;
  const weightLow = parseFloat((bmiIdeal[0] * heightM * heightM).toFixed(1));
  const weightHigh = parseFloat(((bmiIdeal[1] + activityBonus) * heightM * heightM).toFixed(1));

  // Body fat — age + gender
  const fatBase = isMale ? [18, 24] : [25, 31];
  const fatIdeal: [number, number] = [fatBase[0] + ageAdj, fatBase[1] + 2 + ageAdj];

  // Visceral fat — age + gender
  const visMax = isMale
    ? (age >= 50 ? 9 : age >= 40 ? 10 : 12)
    : (age >= 50 ? 7 : age >= 40 ? 8 : 9);

  // Muscle mass — height + gender (SMI)
  const smi = isMale ? 8.87 : 6.42;
  const muscleTgt = smi * heightM * heightM * 0.93;
  const muscleIdeal: [number, number] = [
    parseFloat((muscleTgt * 0.88).toFixed(1)),
    parseFloat((muscleTgt * 1.12).toFixed(1)),
  ];

  // Hydration — gender + activity
  const waterBonus = activity === "athlete" ? 4
    : activity === "active" ? 2
    : activity === "moderate" ? 1 : 0;
  const waterIdeal: [number, number] = isMale
    ? [55 + waterBonus, 65 + waterBonus]
    : [50 + waterBonus, 60 + waterBonus];

  // BMR — Mifflin-St Jeor
  const w = weight || 70;
  const bmrBase = isMale
    ? (10 * w) + (6.25 * height) - (5 * age) + 5
    : (10 * w) + (6.25 * height) - (5 * age) - 161;
  const bmrIdeal: [number, number] = [round(bmrBase * 0.92), round(bmrBase * 1.08)];

  // Protein — activity + age
  const ageProteinBonus = age > 60 ? 2 : age > 45 ? 1 : 0;
  const pLow = (activity === "sedentary" ? 15 : activity === "light" ? 16 : 17) + ageProteinBonus;
  const pHigh = (activity === "athlete" ? 22 : activity === "active" ? 21 : 20) + ageProteinBonus;

  // Metabolic age — should be below actual age
  const mageIdeal: [number, number] = [
    age - 10 > 18 ? age - 10 : 18,
    age - 2 > 18 ? age - 2 : 19,
  ];

  // Bone mass — age + gender + activity
  const boneBonus = activity === "athlete" || activity === "active" ? 0.2 : 0;
  const boneMale = age < 40
    ? [3.0 + boneBonus, 3.8 + boneBonus]
    : age < 60
    ? [2.8 + boneBonus, 3.6 + boneBonus]
    : [2.5 + boneBonus, 3.2 + boneBonus];
  const boneFemale = age < 40
    ? [2.0 + boneBonus, 2.8 + boneBonus]
    : age < 60
    ? [1.8 + boneBonus, 2.5 + boneBonus]
    : [1.5 + boneBonus, 2.2 + boneBonus];

  return {
    weight: [weightLow, weightHigh],
    bmi: bmiIdeal,
    visceral: [1, visMax],
    fat: fatIdeal,
    muscle: muscleIdeal,
    water: waterIdeal,
    bmr: bmrIdeal,
    protein: [pLow, pHigh],
    metage: mageIdeal,
    bone: (isMale ? boneMale : boneFemale) as [number, number],
  };
}

/* ─────────────────────────────────────────────────────────────
   BUILD METRICS from scan values + ranges
───────────────────────────────────────────────────────────── */
function buildMetrics(ranges: Record<string, [number, number]>, sv: typeof EMPTY_SCAN): Metric[] {
  const ir = (v: number, r: [number, number]) => v >= r[0] && v <= r[1];
  const abs = (n: number) => n < 0 ? -n : n;
  const gs = (v: number, r: [number, number], lb?: boolean): Status => {
    if (ir(v, r)) { const pct = abs(v - (r[0] + r[1]) / 2) / ((r[1] - r[0]) / 2); return pct < 0.3 ? "excellent" : "good"; }
    if (lb) return v > r[1] * 1.3 ? "high" : "fair";
    return v > r[1] * 1.2 ? "high" : "fair";
  };
  const gl = (v: number, r: [number, number]): string => {
    if (ir(v, r)) return abs(v - (r[0] + r[1]) / 2) / ((r[1] - r[0]) / 2) < 0.3 ? "Optimal" : "Normal";
    return v > r[1] ? "Above range" : "Below range";
  };
  return [
    { key: "weight", label: "Weight", value: sv.weight, unit: "kg", ideal: ranges.weight, min: 20, max: 250, color: C.blue, lowerIsBetter: false, status: gs(sv.weight, ranges.weight), statusLabel: gl(sv.weight, ranges.weight), trendKey: "weight" },
    { key: "bmi", label: "BMI", value: sv.bmi, unit: "", ideal: ranges.bmi, min: 10, max: 50, color: C.warn, lowerIsBetter: false, status: gs(sv.bmi, ranges.bmi), statusLabel: gl(sv.bmi, ranges.bmi), trendKey: "bmi" },
    { key: "visceral", label: "Visceral Fat", value: sv.visceral, unit: "lvl", ideal: ranges.visceral, min: 1, max: 30, color: C.bad, lowerIsBetter: true, status: gs(sv.visceral, ranges.visceral, true), statusLabel: gl(sv.visceral, ranges.visceral), trendKey: "visceral" },
    { key: "fat", label: "Body Fat", value: sv.fat, unit: "%", ideal: ranges.fat, min: 3, max: 60, color: C.warn, lowerIsBetter: true, status: gs(sv.fat, ranges.fat, true), statusLabel: gl(sv.fat, ranges.fat), trendKey: "fat" },
    { key: "muscle", label: "Muscle Mass", value: sv.muscle, unit: "kg", ideal: ranges.muscle, min: 5, max: 90, color: C.good, lowerIsBetter: false, status: gs(sv.muscle, ranges.muscle), statusLabel: gl(sv.muscle, ranges.muscle), trendKey: "muscle" },
    { key: "water", label: "Hydration", value: sv.water, unit: "%", ideal: ranges.water, min: 25, max: 80, color: C.blue, lowerIsBetter: false, status: gs(sv.water, ranges.water), statusLabel: gl(sv.water, ranges.water), trendKey: "water" },
    { key: "bmr", label: "Resting Burn", value: sv.bmr, unit: "kcal", ideal: ranges.bmr, min: 500, max: 4000, color: C.blue, lowerIsBetter: false, status: gs(sv.bmr, ranges.bmr), statusLabel: gl(sv.bmr, ranges.bmr), trendKey: "bmr" },
    { key: "protein", label: "Protein", value: sv.protein, unit: "%", ideal: ranges.protein, min: 3, max: 30, color: C.good, lowerIsBetter: false, status: gs(sv.protein, ranges.protein), statusLabel: gl(sv.protein, ranges.protein), trendKey: "protein" },
    { key: "metage", label: "Metabolic Age", value: sv.metage, unit: "yrs", ideal: ranges.metage, min: 10, max: 80, color: C.good, lowerIsBetter: true, status: gs(sv.metage, ranges.metage, true), statusLabel: gl(sv.metage, ranges.metage), trendKey: "metage" },
    { key: "bone", label: "Bone Mass", value: sv.bone, unit: "kg", ideal: ranges.bone, min: 0.5, max: 8, color: C.purple, lowerIsBetter: false, status: gs(sv.bone, ranges.bone), statusLabel: gl(sv.bone, ranges.bone), trendKey: "bone" }
  ];
}


/* TREND DATA is now loaded from API — see historyToTrend() */

const clamp01 = (v: number, lo: number, hi: number) => {
  const n = (v - lo) / (hi - lo);
  return n < 0 ? 0 : n > 1 ? 1 : n;
};
const STATUS_COLOR: Record<Status, string> = {
  excellent: C.good, good: C.good, fair: C.warn, high: C.bad,
};

/* ─── Range Bar ──────────────────────────────────────────────── */
function RangeBar({ m }: { m: Metric }) {
  const mp = clamp01(m.value, m.min, m.max) * 100;
  const il = clamp01(m.ideal[0], m.min, m.max) * 100;
  const iw = clamp01(m.ideal[1], m.min, m.max) * 100 - il;
  const ok = m.value >= m.ideal[0] && m.value <= m.ideal[1];
  const dot = ok ? "rgba(255,255,255,0.90)" : C.bad;
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        position: "relative", height: 4, borderRadius: 100,
        background: "rgba(255,255,255,0.08)"
      }}>
        {/* Ideal zone — subtle white lift, no colour */}
        <div style={{
          position: "absolute", top: 0, height: "100%",
          left: `${il}%`, width: `${iw}%`,
          background: "rgba(255,255,255,0.16)",
          borderRadius: 100,
        }} />
        {/* Dot */}
        <div style={{
          position: "absolute", top: "50%", left: `${mp}%`,
          transform: "translate(-50%,-50%)",
          width: 11, height: 11, borderRadius: "50%",
          background: dot,
          border: `2px solid ${C.bg}`,
          zIndex: 2,
        }} />
      </div>
      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.20)" }}>{m.min}</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.36)", fontWeight: 500, letterSpacing: "0.01em" }}>
          {m.ideal[0]}–{m.ideal[1]}{m.unit === "kg/m²" ? "" : ` ${m.unit}`}
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.20)" }}>{m.max}</span>
      </div>
    </div>
  );
}


/* ─── Chart Tooltip ──────────────────────────────────────────── */
function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(28,28,30,0.95)", backdropFilter: "blur(12px)",
      borderRadius: 10, padding: "7px 11px", fontSize: 11,
      fontFamily: "Figtree,sans-serif", border: "none",
      boxShadow: "0 2px 12px rgba(0,0,0,0.30)",
    }}>
      <div style={{ color: "rgba(255,255,255,0.36)", marginBottom: 2, fontSize: 10 }}>{label}</div>
      <div style={{ color: "rgba(255,255,255,0.90)", fontWeight: 600, fontSize: 14 }}>
        {payload[0].value}<span style={{ fontSize: 10, fontWeight: 400, color: "rgba(255,255,255,0.36)", marginLeft: 2 }}>{unit}</span>
      </div>
    </div>
  );
}

/* ─── History Graph ──────────────────────────────────────────── */
function HistoryGraph({ m, trendData }: { m: Metric; trendData: { all: TrendPt[]; y1: TrendPt[]; m6: TrendPt[]; m3: TrendPt[] } }) {
  const [period, setPeriod] = useState<Period>("6M");
  const periodMap = { "3M": trendData.m3, "6M": trendData.m6, "1Y": trendData.y1, "All": trendData.all };
  const slice = periodMap[period];
  const data = slice.map(d => ({ label: d.label, value: d[m.trendKey] }));
  const values: number[] = data.map(d => typeof d.value === "number" ? d.value : parseFloat(d.value as string) || 0);
  const valMin = values.reduce((a, b) => a < b ? a : b, values[0] ?? m.ideal[0]);
  const valMax = values.reduce((a, b) => a > b ? a : b, values[0] ?? m.ideal[1]);
  const domainMin = (valMin < m.ideal[0] ? valMin : m.ideal[0]) - (m.ideal[0] - m.min) * 0.15;
  const domainMax = (valMax > m.ideal[1] ? valMax : m.ideal[1]) + (m.max - m.ideal[1]) * 0.15;
  const midIdeal = (m.ideal[0] + m.ideal[1]) / 2;
  const latest = values[values.length - 1];
  const first = values[0];
  const distLatest = latest > midIdeal ? latest - midIdeal : midIdeal - latest;
  const distFirst = first > midIdeal ? first - midIdeal : midIdeal - first;
  const improving = values.length < 2 ? null : distLatest < distFirst;
  const delta = parseFloat((values[values.length - 1] - values[0]).toFixed(1));

  return (
    <div style={{ marginBottom: 4 }}>
      {/* Period pills — right aligned, proper touch size */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 2, marginBottom: 12 }}>
        {(["3M", "6M", "1Y", "All"] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding: "5px 12px", borderRadius: 20, cursor: "pointer",
            fontFamily: "Figtree,sans-serif", fontSize: 11, fontWeight: 600,
            border: "none", minHeight: 28,
            background: p === period ? "rgba(255,255,255,0.12)" : "transparent",
            color: p === period ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.28)",
            transition: "all 0.15s",
          }}>{p}</button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${m.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
            </linearGradient>
          </defs>
          <ReferenceArea y1={m.ideal[0]} y2={m.ideal[1]}
            fill="rgba(255,255,255,0.04)" stroke="none" />
          <ReferenceLine y={m.ideal[0]} stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
          <ReferenceLine y={m.ideal[1]} stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
          <XAxis dataKey="label"
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.26)", fontFamily: "Figtree,sans-serif" }}
            axisLine={false} tickLine={false} interval="preserveStartEnd"
          />
          <YAxis domain={[domainMin, domainMax]}
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.24)", fontFamily: "Figtree,sans-serif" }}
            axisLine={false} tickLine={false} width={28}
            tickFormatter={v => `${parseFloat(v.toFixed(1))}`}
          />
          <Tooltip content={(props) => <ChartTooltip {...props} unit={m.unit} />}
            cursor={{ stroke: "rgba(255,255,255,0.10)", strokeWidth: 1 }}
          />
          <Area type="monotone" dataKey="value"
            stroke="rgba(255,255,255,0.72)" strokeWidth={1.5}
            fill={`url(#grad-${m.key})`} dot={false}
            activeDot={{ r: 4, fill: "white", stroke: "rgba(255,255,255,0.30)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Footer — clear 3-tier hierarchy */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingLeft: 32, paddingRight: 6, marginTop: 8
      }}>
        {/* Start — label + value stacked */}
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.24)", marginBottom: 1 }}>{data[0].label}</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.50)" }}>
            {data[0].value}{m.unit}
          </div>
        </div>
        {/* Delta — most prominent, centre */}
        <div style={{
          fontSize: 13, fontWeight: 700,
          color: improving ? C.good : C.bad
        }}>
          {delta > 0 ? "↑" : "↓"} {delta > 0 ? delta : -delta}{m.unit}
        </div>
        {/* Now — label + value stacked */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.24)", marginBottom: 1 }}>Now</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.82)" }}>
            {values[values.length - 1]}{m.unit}
          </div>
        </div>
      </div>
    </div>
  );
}



/* ─── Metric Row (expandable) ───────────────────────────────── */
function MetricRow({ m, last, trendData }: { m: Metric; last: boolean; trendData: { all: TrendPt[]; y1: TrendPt[]; m6: TrendPt[]; m3: TrendPt[] } }) {
  const [open, setOpen] = useState(false);
  const inRange = m.value >= m.ideal[0] && m.value <= m.ideal[1];
  const sc = STATUS_COLOR[m.status];
  const d3m = (trendData.m3.length ? trendData.m3 : trendData.all).map(d => d[m.trendKey]);
  const diff3m = parseFloat((Number(d3m[d3m.length - 1]) - Number(d3m[0])).toFixed(1));
  const latest = Number(d3m[d3m.length - 1]);
  const prev = Number(d3m[0]);
  const midIdeal = (m.ideal[0] + m.ideal[1]) / 2;
  const distLatest = latest > midIdeal ? latest - midIdeal : midIdeal - latest;
  const distPrev = prev > midIdeal ? prev - midIdeal : midIdeal - prev;
  const improving = d3m.length < 2 ? null : distLatest < distPrev;
  return (
    <div style={{ borderBottom: last ? "none" : `1px solid rgba(255,255,255,0.09)` }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", background: "transparent", border: "none",
        cursor: "pointer", fontFamily: "Figtree, sans-serif",
        padding: "14px 16px", textAlign: "left", display: "block",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

          {/* Left accent — hairline, only coloured when out of range */}
          <div style={{
            width: 2, height: 30, borderRadius: 100, flexShrink: 0,
            background: inRange ? "rgba(255,255,255,0.08)" : sc,
          }} />

          {/* Label + value */}
          <div style={{ width: 80, flexShrink: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 500,
              color: "rgba(255,255,255,0.44)", lineHeight: 1, marginBottom: 4
            }}>{m.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
              <span style={{
                fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em",
                lineHeight: 1, color: inRange ? "rgba(255,255,255,0.90)" : sc
              }}>
                {m.value}
              </span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>
                {m.unit === "kg/m²" ? "bmi" : m.unit}
              </span>
            </div>
          </div>

          {/* Range bar */}
          <RangeBar m={m} />

          {/* Delta — quiet */}
          <div style={{ flexShrink: 0, textAlign: "right", minWidth: 36 }}>
            {diff3m === 0 || d3m.length < 2 ? (
              <div style={{
                fontSize: 11, fontWeight: 500,
                color: "rgba(255,255,255,0.14)",
                letterSpacing: "0.04em",
              }}>—</div>
            ) : (
              <>
                <div style={{
                  fontSize: 11, fontWeight: 600,
                  letterSpacing: "-0.01em",
                  color: improving
                    ? "rgba(48,209,88,0.70)"
                    : "rgba(255,69,58,0.70)",
                }}>
                  {diff3m > 0 ? "↑" : "↓"} {diff3m < 0 ? -diff3m : diff3m}{m.unit === "kcal" ? "" : m.unit}
                </div>
              </>
            )}
          </div>

          {/* Chevron */}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{
              flexShrink: 0, opacity: 0.30,
              transition: "transform 0.20s ease",
              transform: open ? "rotate(180deg)" : "rotate(0deg)"
            }}>
            <path d="M2.5 4L6 7.5L9.5 4" stroke="white"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 14 }} />
          <HistoryGraph m={m} trendData={trendData} />
        </div>
      )}
    </div>
  );
}



/* ─── Page ───────────────────────────────────────────────────── */
export default function ScanReport() {
  const router = useRouter();

  // ── UI state ──────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [focusKey, setFocusKey] = useState<string | null>(null);

  // ── API loading state ─────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [scanValues, setScanValues] = useState(EMPTY_SCAN);
  const [trendData, setTrendData] = useState<{ all: TrendPt[]; y1: TrendPt[]; m6: TrendPt[]; m3: TrendPt[] }>({
    all: [], y1: [], m6: [], m3: [],
  });
  const [lastScanDate, setLastScanDate] = useState<string>("—");
  const [nextScanDate, setNextScanDate] = useState<string>("—");
  const [daysUntilScan, setDaysUntilScan] = useState<number | null>(null);
  // ── Profile state ─────────────────────────────────────────────
  const [age, setAge] = useState("32");
  const [gender, setGender] = useState<Gender>("male");
  const [activity, setActivity] = useState<Activity>("moderate");
  const [height, setHeight] = useState("177");

  // ── Empty / error state ───────────────────────────────────────
  const [apiError, setApiError] = useState<string | null>(null);
  const [showStartMeasure, setShowStartMeasure] = useState(false);
  const [pendingModal, setPendingModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  // ── Derived ───────────────────────────────────────────────────
  const ageNum = parseInt(age) || 32;
  const heightNum = parseInt(height) || 177;
  const ranges = computeRanges(ageNum, gender, activity, heightNum, scanValues.weight);
  const METRICS = buildMetrics(ranges, scanValues);

  const [form, setForm] = useState<Record<string, string>>(() =>
    Object.fromEntries(METRICS.map(m => [m.key, String(m.value)]))
  );

  const scanDueLabel = daysUntilScan === null ? "—"
    : daysUntilScan > 1 ? `Due in ${daysUntilScan}d`
      : daysUntilScan === 1 ? "Due tomorrow"
        : daysUntilScan === 0 ? "Due today"
          : `Overdue · ${daysUntilScan < 0 ? -daysUntilScan : daysUntilScan}d`;

  const scanDueColor = daysUntilScan === null ? "rgba(255,255,255,0.38)"
    : daysUntilScan > 3 ? "rgba(255,255,255,0.45)"
      : daysUntilScan > 0 ? C.warn
        : daysUntilScan === 0 ? C.bad
          : "rgba(255,69,58,0.60)";

  // ── Load profile + latest scan + history on mount ─────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [profileRes, latestRes, historyRes] = await Promise.all([
          getBodyProfile(),
          getLatestScan().catch(() => null) as Promise<BodyMetricScan | null>,
          getScanHistory().catch(() => ({ all: [], y1: [], m6: [], m3: [] } as BodyMetricHistory)),
        ]);

        if (cancelled) return;

        if (profileRes.age) setAge(String(profileRes.age));
        if (profileRes.gender) setGender(profileRes.gender as Gender);
        if (profileRes.activity_level) setActivity(profileRes.activity_level as Activity);
        if (profileRes.height_cm) setHeight(String((profileRes.height_cm + 0.5) | 0));
        if (latestRes) {
          const sv = scanToValues(latestRes);
          setScanValues(sv);
          setForm(Object.fromEntries(Object.entries(sv).map(([k, v]) => [k, String(v)])));
          setLastScanDate(new Date(latestRes.recorded_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }));
          const nextDate = new Date(latestRes.recorded_date);
          nextDate.setDate(nextDate.getDate() + 7);
          const diffMs = nextDate.getTime() - Date.now();
          const daysLeft = (diffMs / (1000 * 60 * 60 * 24) + 1) | 0;
          setDaysUntilScan(daysLeft);
          setNextScanDate(nextDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" }));
        } else {
          setShowStartMeasure(true);
        }

        setTrendData({
          all: historyToTrend(historyRes.all),
          y1: historyToTrend(historyRes.y1),
          m6: historyToTrend(historyRes.m6),
          m3: historyToTrend(historyRes.m3),
        });

      } catch (err: any) {
        if (err?.status === 401) router.push("/login");
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Save profile changes back to API ──────────────────────────
  const saveProfile = useCallback(async () => {
    try {
      await updateBodyProfile({
        age: ageNum,
        gender: gender,
        activity_level: activity,
        height_cm: heightNum,
      });
    } catch { /* silent */ }
    if (pendingModal) {
      setPendingModal(false);
      setShowModal(true);
    }
  }, [ageNum, gender, activity, heightNum, pendingModal]);

  // ── Scroll lock ───────────────────────────────────────────────
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  const isProfileComplete = () => {
    const a = parseInt(age); const h = parseInt(height);
    return a >= 10 && a <= 99 && h >= 100 && h <= 220 && !!gender && !!activity;
  };

  const openModal = (key: string | null = null) => {
    setFocusKey(key); setSaved(false); setSaving(false);
    setModalStep(isProfileComplete() ? 2 : 1);
    setShowModal(true);
  };

  // ── Save scan to API ──────────────────────────────────────────
  const handleSave = async () => {
    // Validate — every field must be filled and > 0
    const errors: Record<string, boolean> = {};
    METRICS.forEach(m => {
      const val = parseFloat(form[m.key]);
      if (!form[m.key] || isNaN(val) || val < m.min || val > m.max) errors[m.key] = true;
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return; // stop — don't save
    }

    setFormErrors({});
    setSaving(true);
    try {
      const newScan = await saveScan({
        weight_kg: parseFloat(form.weight) || null,
        body_fat_pct: parseFloat(form.fat) || null,
        visceral_fat: parseFloat(form.visceral) || null,
        muscle_mass_kg: parseFloat(form.muscle) || null,
        bone_mass_kg: parseFloat(form.bone) || null,
        hydration_pct: parseFloat(form.water) || null,
        protein_pct: parseFloat(form.protein) || null,
        bmr_kcal: parseInt(form.bmr) || null,
        metabolic_age: parseInt(form.metage) || null,
      });
      const sv = scanToValues(newScan);
      setScanValues(sv);
      setLastScanDate(
        new Date(newScan.recorded_date).toLocaleDateString("en-GB", {
          day: "numeric", month: "short", year: "numeric",
        })
      );
      const h = await getScanHistory();
      setTrendData({
        all: historyToTrend(h.all), y1: historyToTrend(h.y1),
        m6: historyToTrend(h.m6), m3: historyToTrend(h.m3),
      });
      setShowStartMeasure(false);
      setSaving(false); setSaved(true);
      setTimeout(() => { setSaved(false); setShowModal(false); }, 1800);
    } catch {
      setSaving(false);
    }
  };

  const fade = (i = 0): CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "none" : "translateY(10px)",
    transition: `opacity 0.38s ease ${i * 0.07}s, transform 0.38s ease ${i * 0.07}s`,
  });

  const outOfRange = METRICS.filter(m => m.value < m.ideal[0] || m.value > m.ideal[1]);
  const goodCount = METRICS.length - outOfRange.length;


  // ── Measurement modal (reused in empty state + main view) ──────────
  const renderMeasurementModal = () => {
    if (!showModal) return null;

    const closeModal = () => {
      setShowModal(false);
      setModalStep(1);
      setFormErrors({});
      setProfileErrors({});
    };
    const handleProfileNext = async () => {
      const errors: Record<string, string> = {};
      const a = parseInt(age);
      const h = parseInt(height);
      if (!age || isNaN(a) || a < 10 || a > 99) errors.age = "Enter age between 10–99";
      if (!height || isNaN(h) || h < 100 || h > 220) errors.height = "Enter height between 100–220 cm";
      if (!gender) errors.gender = "Select a biological sex";
      if (!activity) errors.activity = "Select an activity level";

      if (Object.keys(errors).length > 0) { setProfileErrors(errors); return; }
      setProfileErrors({});

      try { await updateBodyProfile({ age: a, gender, activity_level: activity, height_cm: h }); }
      catch { /* silent */ }
      setModalStep(2);
    };

    return (
      <>
        <div onClick={closeModal} style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }} />
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 390, zIndex: 201,
          background: "#141519", borderRadius: "24px 24px 0 0",
          boxShadow: "0 -1px 0 rgba(255,255,255,0.06)",
          animation: "slideUp 0.32s cubic-bezier(0.32,0.72,0,1)",
          maxHeight: "88vh", display: "flex", flexDirection: "column",
        }}>
          {/* Handle */}
          <div onClick={closeModal} style={{ display: "flex", justifyContent: "center", padding: "14px 0 4px", cursor: "pointer" }}>
            <div style={{ width: 36, height: 4, borderRadius: 100, background: "rgba(255,255,255,0.22)" }} />
          </div>

          {/* Step dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, paddingBottom: 8 }}>
            {([1, 2] as const).map(s => (
              <div key={s} style={{
                height: 5, borderRadius: 100, transition: "width 0.2s ease, background 0.2s ease",
                width: modalStep === s ? 20 : 6,
                background: modalStep === s ? "#7B5CF5" : "rgba(255,255,255,0.15)",
              }} />
            ))}
          </div>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 20px 14px" }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {modalStep === 1 ? "Your Profile" : (focusKey ? METRICS.find(m => m.key === focusKey)?.label : "New Measurement")}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", marginTop: 2 }}>
                {modalStep === 1 ? "Step 1 of 2 — personalises your ideal ranges" : "Step 2 of 2 — enter your scan values"}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {modalStep === 2 && (
                <button onClick={() => setModalStep(1)} style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "rgba(255,255,255,0.40)", fontSize: 13, fontFamily: "Figtree,sans-serif",
                  padding: "4px 8px",
                }}>← Back</button>
              )}
              <button onClick={closeModal} style={{
                width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.09)",
                border: "none", cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", color: "rgba(255,255,255,0.55)", fontSize: 16,
              }}>✕</button>
            </div>
          </div>

          {/* ── STEP 1: Profile ── */}
          {modalStep === 1 && (
            <>
              <div style={{ overflowY: "auto", flex: 1, padding: "0 20px 8px", display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.36)", marginBottom: 8 }}>Biological Sex</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["male", "female"] as Gender[]).map(g => (
                      <button key={g} onClick={() => setGender(g)} style={{
                        flex: 1, height: 44, borderRadius: 12, cursor: "pointer",
                        fontFamily: "Figtree,sans-serif", fontSize: 13, fontWeight: 600,
                        border: gender === g ? "1px solid rgba(255,255,255,0.28)" : "1px solid rgba(255,255,255,0.07)",
                        background: gender === g ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.03)",
                        color: gender === g ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.34)",
                        transition: "all 0.15s",
                      }}>{g === "male" ? "Male" : "Female"}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {([["Age", "age", "10", "99"], ["Height (cm)", "height", "100", "220"]] as [string, string, string, string][]).map(([label, key, min, max]) => (
                    <div key={key}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.36)", marginBottom: 8 }}>
                        {label}
                        {profileErrors[key] && (
                          <span style={{ fontSize: 10, color: C.bad, marginLeft: 6, fontWeight: 600 }}>
                            {profileErrors[key]}
                          </span>
                        )}
                      </div>
                      <input
                        type="number" value={key === "age" ? age : height}
                        min={min} max={max}
                        onChange={e => {
                          const v = e.target.value;
                          if (key === "age") {
                            setAge(v);
                            const n = parseInt(v);
                            setProfileErrors(pe => ({
                              ...pe,
                              age: !v || isNaN(n) || n < 10 || n > 99 ? "Enter age between 10–99" : "",
                            }));
                          } else {
                            setHeight(v);
                            const n = parseInt(v);
                            setProfileErrors(pe => ({
                              ...pe,
                              height: !v || isNaN(n) || n < 100 || n > 220 ? "Enter height between 100–220 cm" : "",
                            }));
                          }
                        }}
                        style={{
                          width: "100%", height: 44,
                          background: profileErrors[key] ? "rgba(255,69,58,0.10)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${profileErrors[key] ? C.bad : "rgba(255,255,255,0.09)"}`,
                          borderRadius: 12, padding: "0 14px",
                          color: "rgba(255,255,255,0.90)",
                          fontSize: 15, fontWeight: 600, fontFamily: "Figtree,sans-serif",
                          outline: "none", boxSizing: "border-box" as const,
                          transition: "border-color 0.12s, background 0.12s",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.36)", marginBottom: 8 }}>Activity Level</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {([
                      ["sedentary", "Sedentary", "Desk job, little movement"],
                      ["light", "Light", "1–2 workouts / week"],
                      ["moderate", "Moderate", "3–4 workouts / week"],
                      ["active", "Active", "5–6 workouts / week"],
                      ["athlete", "Athlete", "Daily intense training"],
                    ] as [Activity, string, string][]).map(([val, label, sub]) => (
                      <button key={val} onClick={() => setActivity(val)} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "11px 14px", borderRadius: 12, cursor: "pointer",
                        fontFamily: "Figtree,sans-serif", textAlign: "left",
                        border: activity === val ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.06)",
                        background: activity === val ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                        transition: "all 0.15s",
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: activity === val ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.44)" }}>{label}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.26)", marginTop: 1 }}>{sub}</div>
                        </div>
                        {activity === val && (
                          <div style={{
                            width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.15)",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                          }}>
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ height: 8 }} />
              </div>
              <div style={{ padding: "14px 16px 32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <button onClick={handleProfileNext} style={{
                  width: "100%", height: 50, background: "#7B5CF5", border: "none", borderRadius: 14,
                  color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer",
                  fontFamily: "Figtree,sans-serif", letterSpacing: "-0.01em",
                }}>Continue →</button>
              </div>
            </>
          )}

          {/* ── STEP 2: Scan values ── */}
          {modalStep === 2 && (
            <>
              <div style={{ overflowY: "auto", flex: 1, padding: "0 16px 8px" }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "11px 4px 13px", borderBottom: "1px solid rgba(255,255,255,0.06)"
                }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.34)" }}>Date</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.60)", letterSpacing: "-0.01em" }}>
                    {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                {[
                  { label: "Body Measurements", keys: ["weight", "bmi"] },
                  { label: "Composition", keys: ["fat", "visceral", "muscle", "bone"] },
                  { label: "Metabolic", keys: ["water", "protein", "bmr", "metage"] },
                ].map(group => {
                  const gm = group.keys.map(k => METRICS.find(m => m.key === k)!).filter(Boolean);
                  return (
                    <div key={group.label} style={{ marginTop: 24 }}>
                      <div style={{
                        fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.28)",
                        letterSpacing: "0.05em", textTransform: "uppercase", paddingLeft: 2, marginBottom: 7
                      }}>
                        {group.label}
                      </div>
                      <div style={{
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 14, overflow: "hidden"
                      }}>
                        {gm.map((m, i) => {
                          const hasError = formErrors[m.key];
                          const val = parseFloat(form[m.key]);
                          const inRange = val >= m.ideal[0] && val <= m.ideal[1];
                          const displayUnit = m.unit === "" ? "bmi" : m.unit;
                          return (
                            <div key={m.key} style={{
                              display: "flex", alignItems: "center", padding: "0 16px", minHeight: 56,
                              borderBottom: i < gm.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                              background: hasError ? "rgba(255,69,58,0.04)" : "transparent",
                              transition: "background 0.15s",
                            }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.82)", letterSpacing: "-0.01em" }}>
                                  {m.label}
                                  {hasError && (
                                    <span style={{ fontSize: 10, color: C.bad, marginLeft: 6, fontWeight: 600 }}>
                                      {!form[m.key] || isNaN(parseFloat(form[m.key]))
                                        ? "Required"
                                        : parseFloat(form[m.key]) < m.min
                                          ? `Min ${m.min}`
                                          : `Max ${m.max}`}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.24)", marginTop: 2 }}>
                                  Ideal {m.ideal[0]}–{m.ideal[1]} {displayUnit}
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                <input
                                  type="number"
                                  step={m.unit === "kcal" || m.unit === "yrs" ? "1" : "0.1"}
                                  value={form[m.key]}
                                  min={m.min}
                                  max={m.max}
                                  autoFocus={focusKey === m.key}
                                  onChange={e => {
                                    const raw = e.target.value;
                                    const n = parseFloat(raw);

                                    // Hard clamp — silently cap at machine bounds
                                    if (!isNaN(n) && n > m.max) {
                                      setForm(f => ({ ...f, [m.key]: String(m.max) }));
                                      setFormErrors(fe => ({ ...fe, [m.key]: false }));
                                      return;
                                    }
                                    if (!isNaN(n) && n < 0) {
                                      setForm(f => ({ ...f, [m.key]: "0" }));
                                      return;
                                    }

                                    setForm(f => ({ ...f, [m.key]: raw }));

                                    // Clear error once valid
                                    if (formErrors[m.key] && !isNaN(n) && n > 0) {
                                      setFormErrors(fe => ({ ...fe, [m.key]: false }));
                                    }
                                  }}
                                  style={{
                                    width: m.unit === "kcal" ? 70 : 62, height: 38,
                                    background: hasError ? "rgba(255,69,58,0.10)" : "rgba(255,255,255,0.07)",
                                    border: `1px solid ${hasError ? C.bad : "rgba(255,255,255,0.10)"}`,
                                    borderRadius: 9, outline: "none",
                                    color: isNaN(val) || val <= 0 ? "rgba(255,255,255,0.40)" : inRange ? "rgba(255,255,255,0.92)" : C.warn,
                                    fontSize: 15, fontWeight: 600, fontFamily: "Figtree,sans-serif",
                                    textAlign: "right", paddingRight: 9,
                                    transition: "border-color 0.12s, background 0.12s, color 0.12s",
                                  }}
                                  onFocus={e => {
                                    e.currentTarget.style.borderColor = hasError ? C.bad : "rgba(255,255,255,0.32)";
                                    e.currentTarget.style.background = hasError ? "rgba(255,69,58,0.12)" : "rgba(255,255,255,0.10)";
                                  }}
                                  onBlur={e => {
                                    e.currentTarget.style.borderColor = hasError ? C.bad : "rgba(255,255,255,0.10)";
                                    e.currentTarget.style.background = hasError ? "rgba(255,69,58,0.10)" : "rgba(255,255,255,0.07)";
                                  }}
                                />
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", minWidth: 28 }}>{displayUnit}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <div style={{ height: 20 }} />
              </div>
              <div style={{ padding: "10px 16px 32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {Object.values(formErrors).some(Boolean) && (
                  <div style={{
                    background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.20)",
                    borderRadius: 10, padding: "9px 13px", marginBottom: 10,
                    fontSize: 12, color: C.bad, fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 7,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" stroke={C.bad} strokeWidth="1.3" />
                      <path d="M7 4v4" stroke={C.bad} strokeWidth="1.4" strokeLinecap="round" />
                      <circle cx="7" cy="10" r="0.7" fill={C.bad} />
                    </svg>
                    Fill in all {Object.values(formErrors).filter(Boolean).length} missing fields before saving
                  </div>
                )}
                <button onClick={handleSave} disabled={saving || saved} style={{
                  width: "100%", height: 50, background: saved ? C.good : "#7B5CF5",
                  border: "none", borderRadius: 14, color: saved ? "#07090F" : "#fff",
                  fontSize: 15, fontWeight: 600, cursor: saving || saved ? "default" : "pointer",
                  fontFamily: "Figtree,sans-serif", letterSpacing: "-0.01em",
                  transition: "background 0.25s, opacity 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
                  onMouseDown={e => { if (!saving && !saved) (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
                  onMouseUp={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  {saving ? (
                    <>
                      <div style={{
                        width: 15, height: 15, borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "#fff",
                        animation: "spin 0.7s linear infinite",
                      }} />
                      Saving…
                    </>
                  ) : saved ? "✓  Saved" : "Save Measurement"}
                </button>
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  // ── Loading skeleton ──────────────────────────────────────────
  if (loading) return (
    <div style={{
      minHeight: "100vh", background: "#0F0F11", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "Figtree,sans-serif"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.08)",
          borderTopColor: "rgba(255,255,255,0.50)", animation: "spin 0.8s linear infinite", margin: "0 auto"
        }} />
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.30)", marginTop: 16 }}>Loading your data…</div>
      </div>
    </div>
  );

  // ── API error ─────────────────────────────────────────────────
  if (apiError) return (
    <div style={{
      minHeight: "100vh", background: "#0F0F11", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "Figtree,sans-serif",
      padding: "0 32px", textAlign: "center"
    }}>
      <div>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 15, color: "#FF453A", fontWeight: 600, marginBottom: 8 }}>{apiError}</div>
        <button onClick={() => window.location.reload()} style={{
          marginTop: 16, padding: "10px 24px", background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, color: "rgba(255,255,255,0.60)",
          fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "Figtree,sans-serif",
        }}>Try Again</button>
      </div>
    </div>
  );

  // ── First time — no scan yet ───────────────────────────────────
  if (showStartMeasure) return (
    <>
      <style>{`
        @keyframes fadeUp  { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideUp { from { transform:translateX(-50%) translateY(100%) } to { transform:translateX(-50%) translateY(0) } }
        @keyframes spin    { to { transform:rotate(360deg) } }
        * { box-sizing:border-box } button { outline:none }
        input[type=number] { -moz-appearance:textfield; }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; margin:0 }
        html, body { background: #0F0F11 !important; }
      `}</style>
      <div style={{
        minHeight: "100dvh", width: "100vw", background: C.bg, color: C.text,
        fontFamily: "Figtree, sans-serif",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "0 32px", textAlign: "center"
      }}>

        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 28, animation: "fadeUp 0.4s ease both"
        }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4C16 4 8 10 8 18a8 8 0 0016 0c0-8-8-14-8-14z"
              stroke="rgba(255,255,255,0.40)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 12v8M12 18h8"
              stroke="rgba(255,255,255,0.50)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Title */}
        <div style={{ animation: "fadeUp 0.4s ease 0.07s both", marginBottom: 24, width: "100%" }}>
          <div style={{
            fontSize: 34, fontWeight: 700, letterSpacing: "-0.04em",
            color: "rgba(255,255,255,0.92)", lineHeight: 1.15, marginBottom: 6
          }}>
            Body <span style={{ color: C.purple }}>Composition</span>
          </div>
          {/* <div style={{ fontSize:13, fontWeight:400, color:"rgba(255,255,255,0.32)",
            lineHeight:1.5, letterSpacing:"-0.01em" }}>
            Before you improve, you need to measure.
          </div> */}
          <div style={{
            fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.36)",
            lineHeight: 1.65, animation: "fadeUp 0.4s ease 0.14s both"
          }}>
            Get a complete picture of your{" "}
            <span style={{ color: C.purple, fontWeight: 600 }}>body metrics</span>
            {" "}— fat, muscle, hydration, and more —<br />all in one place.
          </div>
        </div>

        {/* Subtext */}


        {/* What you will track */}
        <div style={{
          width: "100%", background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16,
          padding: "16px 20px", marginBottom: 32, animation: "fadeUp 0.4s ease 0.21s both"
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.24)",
            letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 14
          }}>
            You will track
          </div>
          {([
            ["Body Fat %", "vs your ideal range"],
            ["Muscle Mass", "personalised to your height"],
            ["Metabolic Age", "your real biological age"],
            ["Visceral Fat", "the dangerous kind"],
            ["+ 6 more", "hydration, BMR, bone mass…"],
          ] as [string, string][]).map(([label, sub]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "rgba(255,255,255,0.20)", flexShrink: 0
              }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.60)" }}>{label}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.24)", marginLeft: "auto" }}>{sub}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            width: "100%", height: 52, background: "#7B5CF5",
            border: "none", borderRadius: 14, color: "#fff",
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            fontFamily: "Figtree, sans-serif", letterSpacing: "-0.01em",
            transition: "opacity 0.15s", animation: "fadeUp 0.4s ease 0.28s both"
          }}
          onMouseDown={e => { (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
          onMouseUp={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        >
          Start My First Measurement
        </button>

        <div style={{
          fontSize: 12, color: "rgba(255,255,255,0.20)", marginTop: 16,
          animation: "fadeUp 0.4s ease 0.32s both"
        }}>
          Takes about 2 minutes
        </div>
      </div>

      {/* Measurement modal renders on top */}
      {renderMeasurementModal()}
    </>
  );

  return (
    <>
      <div style={{
        minHeight: "100vh", background: C.bg, color: C.text,
        fontFamily: "Figtree, sans-serif", maxWidth: 390, margin: "0 auto", paddingBottom: 60
      }}>
        <style>{`
        * { box-sizing:border-box }
        button { outline:none }
        input[type=number] { -moz-appearance:textfield; }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; margin:0 }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateX(-50%) translateY(100%) } to { transform:translateX(-50%) translateY(0) } }
        @keyframes spin    { to { transform:rotate(360deg) } }
      `}</style>

        <div style={{ position: "relative", zIndex: 1 }}>

          {/* ── HEADER ── */}
          <div style={{
            position: "sticky", top: 0, zIndex: 100,
            background: `${C.bg}E8`, backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          } as CSSProperties}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px 14px" }}>

              {/* Left — Back button */}
              <button onClick={() => router.push("/challenges")} style={{
                display: "flex", alignItems: "center", gap: 5, background: "transparent",
                border: "none", cursor: "pointer", fontFamily: "Figtree, sans-serif",
                color: "rgba(255,255,255,0.60)", fontSize: 15, fontWeight: 400,
                padding: "6px 12px 6px 4px", borderRadius: 10, minHeight: 40, flexShrink: 0,
              }}>
                <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
                  <path d="M8 1L1.5 8L8 15" stroke="rgba(255,255,255,0.50)" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>

              {/* Centre — Title only, no date */}
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em",
                  color: "rgba(255,255,255,0.88)",
                }}>Body Composition</div>
              </div>

              {/* Right — Health Guide icon only */}
              <button onClick={() => setShowGuide(true)} style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "transparent", border: "none", cursor: "pointer",
                padding: "6px 4px 6px 8px", borderRadius: 10, minHeight: 40, flexShrink: 0,
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 500,
                  color: "rgba(255,255,255,0.30)", letterSpacing: "-0.01em",
                }}>Guide</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
                  <path d="M8 7v4" stroke="rgba(255,255,255,0.40)" strokeWidth="1.3" strokeLinecap="round" />
                  <circle cx="8" cy="5" r="0.85" fill="rgba(255,255,255,0.40)" />
                </svg>
              </button>

            </div>
          </div>

          {/* ── HERO ── */}
          {(() => {
            const worst = [...METRICS].sort((a, b) => {
              const g = (m: Metric) => m.value > m.ideal[1]
                ? (m.value - m.ideal[1]) / (m.max - m.ideal[1])
                : m.value < m.ideal[0]
                  ? (m.ideal[0] - m.value) / (m.ideal[0] - m.min) : 0;
              return g(b) - g(a);
            })[0];
            const worstInRange = worst.value >= worst.ideal[0] && worst.value <= worst.ideal[1];
            const over = worst.value > worst.ideal[1];
            const gap = over ? (worst.value - worst.ideal[1]).toFixed(1) : (worst.ideal[0] - worst.value).toFixed(1);
            const wLast = Number(trendData.all[trendData.all.length - 1]?.[worst.trendKey]);
            const wPrev = Number(trendData.all[trendData.all.length - 2]?.[worst.trendKey]);
            const wMidIdeal = (worst.ideal[0] + worst.ideal[1]) / 2;
            const wDistLast = wLast > wMidIdeal ? wLast - wMidIdeal : wMidIdeal - wLast;
            const wDistPrev = wPrev > wMidIdeal ? wPrev - wMidIdeal : wMidIdeal - wPrev;
            const wImproving = wLast === 0 && wPrev === 0 ? false : wDistLast < wDistPrev;
            const best = METRICS.filter(m => m.value >= m.ideal[0] && m.value <= m.ideal[1])
              .sort((a, b) => {
                const d = (m: Metric) => {
                  const diff = m.value - (m.ideal[0] + m.ideal[1]) / 2;
                  return (diff < 0 ? -diff : diff) / ((m.ideal[1] - m.ideal[0]) / 2);
                };
                return d(a) - d(b);
              })[0];
            const iColor = worstInRange ? C.good : wImproving ? C.good : C.bad;
            const headline = worstInRange ? "All clear" : goodCount >= 6 ? "Looking good" : "Needs work";
            return (
              <div style={{ padding: "12px 16px 20px", ...fade(0) }}>
                <div style={{
                  borderRadius: 22,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div style={{ padding: "18px 20px 14px" }}>


                    {/* Left — greeting + last scan date stacked */}

                    <div style={{
                      fontSize: 13, fontWeight: 400,
                      color: "rgba(255,255,255,0.36)",
                      letterSpacing: "-0.01em",
                    }}>Hello, Alex</div>


                  </div>
                  <div style={{ padding: "12px 20px 18px", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ flexShrink: 0, lineHeight: 1 }}>
                      <span style={{
                        fontSize: 64, fontWeight: 700, letterSpacing: "-0.04em",
                        lineHeight: 1, color: iColor
                      }}>{goodCount}</span>
                      <span style={{
                        fontSize: 18, fontWeight: 400, letterSpacing: "-0.01em",
                        color: "rgba(255,255,255,0.18)", marginLeft: 1
                      }}>/{METRICS.length}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.90)",
                        letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 5
                      }}>{headline}</div>
                      <div style={{
                        fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.36)",
                        lineHeight: 1.4
                      }}>
                        {outOfRange.length === 0
                          ? "All metrics in healthy range"
                          : `${outOfRange.length} metric${outOfRange.length > 1 ? "s" : ""} outside range`}
                      </div>
                    </div>
                  </div>
                  <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 20px" }} />
                  <div style={{ padding: "14px 20px 18px", lineHeight: 1.65 }}>
                    {worstInRange ? (
                      <p style={{ margin: 0 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: C.good }}>{"Everything's healthy. "}</span>
                        <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.40)" }}>
                          {best?.label ?? "Your metrics"} is your strongest — trending well.
                        </span>
                      </p>
                    ) : wImproving ? (
                      <p style={{ margin: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.38)" }}>Your </span>
                        <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>{worst.label} </span>
                        <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.38)" }}>
                          is {gap}{worst.unit} {over ? "above" : "below"} range — but{" "}
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 600, color: C.good }}>improving.</span>
                      </p>
                    ) : (
                      <p style={{ margin: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.38)" }}>Your </span>
                        <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>{worst.label} </span>
                        <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.38)" }}>
                          is {gap}{worst.unit} {over ? "above" : "below"} range and still{" "}
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 600, color: C.bad }}>worsening.</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── ALL METRICS ── */}
          <div style={{ padding: "20px 16px 0", ...fade(1) }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 10, paddingLeft: 2, paddingRight: 2,
            }}>
              <span style={{
                color: "rgba(255,255,255,0.32)", fontWeight: 600, fontSize: 11,
                letterSpacing: "0.05em", textTransform: "uppercase",
              }}>All Metrics</span>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {/* Last scan */}


                {/* Divider */}
                <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.10)" }} />

                {/* Next scan */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 400,
                    color: "rgba(255,255,255,0.22)",
                    letterSpacing: "-0.01em",
                  }}>Scanned</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: "-0.02em",
                    color: "rgba(255,255,255,0.50)",
                  }}>{lastScanDate}</span>
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.10)" }} />

                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 400,
                    color: "rgba(255,255,255,0.22)",
                    letterSpacing: "-0.01em",
                  }}>Next scan</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: "-0.02em",
                    color: scanDueColor,
                    transition: "color 0.2s",
                  }}>{scanDueLabel}</span>
                </div>
              </div>
            </div>
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 16, overflow: "hidden"
            }}>
              {METRICS.map((m, i) => (
                <MetricRow key={m.key} m={m} last={i === METRICS.length - 1} trendData={trendData} />
              ))}
            </div>
          </div>

          {/* ── CTA ── */}
          <div style={{ padding: "20px 16px 0", ...fade(3) }}>
            <button
              onClick={() => openModal(null)}
              style={{
                width: "100%", height: 50, background: "#7B5CF5",
                border: "none", borderRadius: 14, color: "#ffffff",
                fontSize: 15, fontWeight: 600, cursor: "pointer",
                fontFamily: "Figtree, sans-serif", letterSpacing: "-0.01em",
                transition: "opacity 0.15s",
              }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >New Measurement</button>
          </div>

        </div>
      </div >

      {/* ── MEASUREMENT MODAL ── */}
      {renderMeasurementModal()}

      {/* ── PROFILE SHEET ── */}
      {
        showProfile && (
          <>
            <div onClick={() => { setShowProfile(false); saveProfile(); }} style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }} />
            <div style={{
              position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
              width: "100%", maxWidth: 390, zIndex: 201,
              background: "#141519", borderRadius: "24px 24px 0 0",
              boxShadow: "0 -1px 0 rgba(255,255,255,0.06)",
              animation: "slideUp 0.30s cubic-bezier(0.32,0.72,0,1)",
              maxHeight: "88vh", overflowY: "auto", paddingBottom: 40,
            }}>
              <div onClick={() => { setShowProfile(false); saveProfile(); }}
                style={{
                  display: "flex", justifyContent: "center",
                  padding: "14px 0 4px", cursor: "pointer"
                }}>
                <div style={{
                  width: 36, height: 4, borderRadius: 100,
                  background: "rgba(255,255,255,0.22)"
                }} />
              </div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 20px 20px"
              }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>Your Profile</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 2 }}>
                    Personalises all ideal ranges
                  </div>
                </div>
                <button onClick={() => { setShowProfile(false); saveProfile(); }} style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(255,255,255,0.09)", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "rgba(255,255,255,0.55)", fontSize: 16,
                }}>✕</button>
              </div>
              <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Sex */}
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.36)",
                    marginBottom: 8
                  }}>Biological Sex</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["male", "female"] as Gender[]).map(g => (
                      <button key={g} onClick={() => setGender(g)} style={{
                        flex: 1, height: 44, borderRadius: 12, cursor: "pointer",
                        fontFamily: "Figtree,sans-serif", fontSize: 13, fontWeight: 600,
                        border: gender === g ? "1px solid rgba(255,255,255,0.28)" : "1px solid rgba(255,255,255,0.07)",
                        background: gender === g ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.03)",
                        color: gender === g ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.34)",
                        transition: "all 0.15s",
                      }}>{g === "male" ? "Male" : "Female"}</button>
                    ))}
                  </div>
                </div>
                {/* Age + Height */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{
                      fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.36)",
                      marginBottom: 8
                    }}>Age</div>
                    <input type="number" value={age} min={10} max={99}
                      onChange={e => setAge(e.target.value)}
                      style={{
                        width: "100%", height: 44, background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12,
                        padding: "0 14px", color: "rgba(255,255,255,0.90)",
                        fontSize: 15, fontWeight: 600, fontFamily: "Figtree,sans-serif",
                        outline: "none", boxSizing: "border-box"
                      }}
                    />
                  </div>
                  <div>
                    <div style={{
                      fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.36)",
                      marginBottom: 8
                    }}>Height (cm)</div>
                    <input type="number" value={height} min={100} max={220}
                      onChange={e => setHeight(e.target.value)}
                      style={{
                        width: "100%", height: 44, background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12,
                        padding: "0 14px", color: "rgba(255,255,255,0.90)",
                        fontSize: 15, fontWeight: 600, fontFamily: "Figtree,sans-serif",
                        outline: "none", boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>
                {/* Activity */}
                <div>
                  <div style={{
                    fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.36)",
                    marginBottom: 8
                  }}>Activity Level</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {([
                      ["sedentary", "Sedentary", "Desk job, little movement"],
                      ["light", "Light", "1–2 workouts / week"],
                      ["moderate", "Moderate", "3–4 workouts / week"],
                      ["active", "Active", "5–6 workouts / week"],
                      ["athlete", "Athlete", "Daily intense training"],
                    ] as [Activity, string, string][]).map(([val, label, sub]) => (
                      <button key={val} onClick={() => setActivity(val)} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "11px 14px", borderRadius: 12, cursor: "pointer",
                        fontFamily: "Figtree,sans-serif", textAlign: "left",
                        border: activity === val ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.06)",
                        background: activity === val ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                        transition: "all 0.15s",
                      }}>
                        <div>
                          <div style={{
                            fontSize: 13, fontWeight: 600,
                            color: activity === val ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.44)"
                          }}>
                            {label}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.26)", marginTop: 1 }}>
                            {sub}
                          </div>
                        </div>
                        {activity === val && (
                          <div style={{
                            width: 18, height: 18, borderRadius: "50%",
                            background: "rgba(255,255,255,0.15)", display: "flex",
                            alignItems: "center", justifyContent: "center", flexShrink: 0
                          }}>
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5"
                                strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      }
      {showGuide && <BodyMetricsGuide onClose={() => setShowGuide(false)} />}

    </>
  );

}
