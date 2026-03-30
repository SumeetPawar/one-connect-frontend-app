"use client";
import { useState, useEffect, useCallback, CSSProperties } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";
import { api, BodyMetricHistory, BodyMetricScan, BodyProfile, getBodyProfile, getCachedUserMe, getLatestScan, getScanHistory, saveScan, updateBodyProfile } from "@/lib/api";


const C = {
  bg: "#0F0F11",
  card: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.12)",
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
  key: string;
  label: string;      // short primary label — always fits on one line
  sublabel?: string;  // optional second line (dimmer), for context
  value: number;
  unit: string;
  ideal: [number, number];
  min: number;
  max: number;
  color: string;
  status: Status;
  statusLabel: string;
  lowerIsBetter?: boolean;
  trendKey: keyof TrendPt;
}

// Removed duplicate interface TrendPt; using type TrendPt with nullable fields below
type TrendPt = {
  label: string;
  weight: number | null;
  bmi: number | null;
  fat: number | null;
  subcutaneous_fat: number | null;
  visceral: number | null;
  skeletal: number | null;
  bmr: number | null;
  metage: number | null;
}

/* ─────────────────────────────────────────────────────────────
   API TYPES
───────────────────────────────────────────────────────────── */
/* Map API scan → SCAN_VALUES shape — null means the field wasn't recorded */
function scanToValues(s: BodyMetricScan) {
  return {
    weight: s.weight_kg ?? null,
    bmi: s.bmi ?? null,
    fat: s.body_fat_pct ?? null,
    subcutaneous_fat: s.subcutaneous_fat_pct ?? null,
    visceral: s.visceral_fat ?? null,
    skeletal: s.skeletal_muscle_pct ?? s.muscle_pct ?? null,
    bmr: s.bmr_kcal ?? null,
    metage: s.metabolic_age ?? null,
  };
}

/* Map API history → TrendPt[] */
function historyToTrend(scans: BodyMetricScan[]): TrendPt[] {
  return scans.map(s => {
    const d = new Date(s.recorded_date);
    const label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return {
      label,
      weight: s.weight_kg ?? null,
      bmi: s.bmi ?? null,
      fat: s.body_fat_pct ?? null,
      subcutaneous_fat: s.subcutaneous_fat_pct ?? null,
      visceral: s.visceral_fat ?? null,
      skeletal: s.skeletal_muscle_pct ?? s.muscle_pct ?? null,
      bmr: s.bmr_kcal ?? null,
      metage: s.metabolic_age ?? null,
    };
  });
}

/* Fallback values when no scan exists yet — all null so no metrics render */
const EMPTY_SCAN = {
  weight: null as number | null,
  bmi: null as number | null,
  fat: null as number | null,
  subcutaneous_fat: null as number | null,
  visceral: null as number | null,
  skeletal: null as number | null,
  bmr: null as number | null,
  metage: null as number | null,
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

  // Body fat % — ACE / Tanita BIA reference (matches the guide)
  // Male:   10–19% (20–39) · 11–21% (40–59) · 13–24% (60+)
  // Female: 20–28% (20–39) · 21–30% (40–59) · 22–33% (60+)
  const fatIdeal: [number, number] = isMale
    ? (age < 40 ? [10, 19] : age < 60 ? [11, 21] : [13, 24])
    : (age < 40 ? [20, 28] : age < 60 ? [21, 30] : [22, 33]);

  // Visceral fat — guide: 1–9 for both genders (Tanita BIA reference)
  const visMax = 9;

  // BMR — Mifflin-St Jeor (Mifflin-St Jeor equation, 1990 — most clinically validated)
  const w = weight || 70;
  const bmrBase = isMale
    ? (10 * w) + (6.25 * height) - (5 * age) + 5
    : (10 * w) + (6.25 * height) - (5 * age) - 161;
  const bmrIdeal: [number, number] = [round(bmrBase * 0.92), round(bmrBase * 1.08)];

  // Metabolic age — guide: "same as or up to 10 years below actual age"
  // Ideal upper bound is actual age (not older), lower bound is age-10
  const mageIdeal: [number, number] = [
    age - 10 > 18 ? age - 10 : 18,
    age > 18 ? age : 19,
  ];

  // Skeletal Muscle % — from BodyMetricsGuide source (population BIA studies)
  // Male:   33–39% (20–39) · 31–37% (40–59) · 29–35% (60+)
  // Female: 24–30% (20–39) · 23–29% (40–59) · 21–27% (60+)
  const skeletalMale: [number, number] = age < 40 ? [33, 39] : age < 60 ? [31, 37] : [29, 35];
  const skeletalFemale: [number, number] = age < 40 ? [24, 30] : age < 60 ? [23, 29] : [21, 27];

  // Subcutaneous fat % — rough population ranges (Tanita BIA reference)
  const subqMale: [number, number] = age < 40 ? [8, 18] : age < 60 ? [10, 20] : [12, 22];
  const subqFemale: [number, number] = age < 40 ? [18, 28] : age < 60 ? [20, 32] : [22, 34];
  return {
    weight: [weightLow, weightHigh],
    bmi: bmiIdeal,
    fat: fatIdeal,
    subcutaneous_fat: isMale ? subqMale : subqFemale,
    visceral: [1, visMax] as [number, number],
    skeletal: (isMale ? skeletalMale : skeletalFemale),
    bmr: bmrIdeal,
    metage: mageIdeal,
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
    if (ir(v, r)) return abs(v - (r[0] + r[1]) / 2) / ((r[1] - r[0]) / 2) < 0.3 ? "Optimal" : "Good";
    return v > r[1] ? "High" : "Low";
  };
  // Only include a metric if the scan actually has that value (not null)
  const all: (Metric | null)[] = [
    sv.weight != null ? { key: "weight", label: "Weight", sublabel: "Body weight", value: sv.weight, unit: "kg", ideal: ranges.weight, min: 20, max: 250, color: C.blue, lowerIsBetter: false, status: gs(sv.weight, ranges.weight), statusLabel: gl(sv.weight, ranges.weight), trendKey: "weight" } : null,
    sv.bmi != null ? { key: "bmi", label: "BMI", sublabel: "Body mass index", value: sv.bmi, unit: "", ideal: ranges.bmi, min: 10, max: 50, color: C.warn, lowerIsBetter: false, status: gs(sv.bmi, ranges.bmi), statusLabel: gl(sv.bmi, ranges.bmi), trendKey: "bmi" } : null,
    sv.fat != null ? { key: "fat", label: "Body Fat", sublabel: "% of total weight", value: sv.fat, unit: "%", ideal: ranges.fat, min: 3, max: 60, color: C.warn, lowerIsBetter: true, status: gs(sv.fat, ranges.fat, true), statusLabel: gl(sv.fat, ranges.fat), trendKey: "fat" } : null,
    sv.visceral != null ? { key: "visceral", label: "Visceral", sublabel: "Organ fat level", value: sv.visceral, unit: "lvl", ideal: ranges.visceral, min: 1, max: 30, color: C.bad, lowerIsBetter: true, status: gs(sv.visceral, ranges.visceral, true), statusLabel: gl(sv.visceral, ranges.visceral), trendKey: "visceral" } : null,
    sv.subcutaneous_fat != null ? { key: "subcutaneous_fat", label: "Subcutaneous Fat", sublabel: "% under skin", value: sv.subcutaneous_fat, unit: "%", ideal: ranges.subcutaneous_fat, min: 3, max: 60, color: "#FFB300", lowerIsBetter: true, status: gs(sv.subcutaneous_fat, ranges.subcutaneous_fat, true), statusLabel: gl(sv.subcutaneous_fat, ranges.subcutaneous_fat), trendKey: "subcutaneous_fat" } : null,
    sv.skeletal != null ? { key: "skeletal", label: "Skeletal", sublabel: "Muscle %", value: sv.skeletal, unit: "%", ideal: ranges.skeletal ?? [0, 0], min: 10, max: 60, color: C.good, lowerIsBetter: false, status: gs(sv.skeletal, ranges.skeletal ?? [0, 0]), statusLabel: gl(sv.skeletal, ranges.skeletal ?? [0, 0]), trendKey: "skeletal" } : null,
    sv.bmr != null ? { key: "bmr", label: "Resting", sublabel: "Metabolism kcal", value: sv.bmr, unit: "kcal", ideal: ranges.bmr, min: 500, max: 4000, color: C.blue, lowerIsBetter: false, status: gs(sv.bmr, ranges.bmr), statusLabel: gl(sv.bmr, ranges.bmr), trendKey: "bmr" } : null,
    sv.metage != null ? { key: "metage", label: "Body Age", sublabel: "Metabolic age", value: sv.metage, unit: "yrs", ideal: ranges.metage, min: 10, max: 80, color: C.good, lowerIsBetter: true, status: gs(sv.metage, ranges.metage, true), statusLabel: gl(sv.metage, ranges.metage), trendKey: "metage" } : null,
  ];
  return all.filter((m): m is Metric => m !== null);
}


/* TREND DATA is now loaded from API — see historyToTrend() */

/* Static metadata for ALL possible form fields — used by the modal
   to render inputs even when a metric has no recorded value yet. */
const FORM_METRIC_META: Record<string, { label: string; sublabel: string; unit: string; min: number; max: number; color: string; lowerIsBetter?: boolean }> = {
  weight:            { label: "Weight",            sublabel: "Body weight",         unit: "kg",   min: 20,  max: 250, color: C.blue },
  bmi:               { label: "BMI",               sublabel: "Body mass index",      unit: "",     min: 10,  max: 50,  color: C.warn },
  fat:               { label: "Body Fat",           sublabel: "% of total weight",   unit: "%",   min: 3,   max: 60,  color: C.warn,  lowerIsBetter: true },
  subcutaneous_fat:  { label: "Subcutaneous Fat",   sublabel: "% under skin",        unit: "%",   min: 3,   max: 60,  color: "#FFB300", lowerIsBetter: true },
  visceral:          { label: "Visceral",           sublabel: "Organ fat level",     unit: "lvl", min: 1,   max: 30,  color: C.bad,   lowerIsBetter: true },
  skeletal:          { label: "Skeletal",           sublabel: "Muscle %",            unit: "%",   min: 10,  max: 60,  color: C.good },
  bmr:               { label: "Resting",            sublabel: "Metabolism kcal",     unit: "kcal",min: 500, max: 4000,color: C.blue },
  metage:            { label: "Body Age",           sublabel: "Metabolic age",       unit: "yrs", min: 10,  max: 80,  color: C.good,  lowerIsBetter: true },
};

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
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{m.min}</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.36)", fontWeight: 500, letterSpacing: "0.01em" }}>
          {m.ideal[0]}–{m.ideal[1]}{m.unit === "kg/m²" ? "" : ` ${m.unit}`}
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{m.max}</span>
      </div>
    </div>
  );
}


/* ─── Chart Tooltip ──────────────────────────────────────────── */
function ChartTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(28,28,30,0.96)", backdropFilter: "blur(12px)",
      borderRadius: 10, padding: "8px 12px", fontSize: 11,
      fontFamily: "Figtree,sans-serif", border: "none",
      boxShadow: "0 4px 20px rgba(0,0,0,0.50)",
    }}>
      <div style={{ color: "rgba(255,255,255,0.40)", marginBottom: 2, fontSize: 11 }}>{label}</div>
      <div style={{ color: "rgba(255,255,255,0.92)", fontWeight: 600, fontSize: 15 }}>
        {payload[0].value}<span style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.42)", marginLeft: 3 }}>{unit}</span>
      </div>
    </div>
  );
}

/* ─── History Graph ──────────────────────────────────────────── */
function HistoryGraph({ m, trendData }: { m: Metric; trendData: { all: TrendPt[]; y1: TrendPt[]; m6: TrendPt[]; m3: TrendPt[] } }) {
  const [period, setPeriod] = useState<Period>("6M");
  const periodMap = { "3M": trendData.m3, "6M": trendData.m6, "1Y": trendData.y1, "All": trendData.all };
  const slice = periodMap[period];
  // Only include points where value is a valid number (not null, undefined, NaN, or empty string)
  const data = slice
    .map(d => ({ label: d.label, value: d[m.trendKey] }))
    .filter(d => d.value !== null && d.value !== undefined && d.value !== "" && !Number.isNaN(Number(d.value)));
  const values: number[] = data
    .map(d => typeof d.value === "number" ? d.value : parseFloat(d.value as string))
    .filter(v => v !== null && v !== undefined && !Number.isNaN(v));
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
      {/* Period pills — right aligned */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
        <div style={{ display: "flex", gap: 2 }}>
          {(["3M", "6M", "1Y", "All"] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: "5px 12px", borderRadius: 20, cursor: "pointer",
              fontFamily: "Figtree,sans-serif", fontSize: 11, fontWeight: 600,
              border: "none", minHeight: 28,
              background: p === period ? "rgba(255,255,255,0.12)" : "transparent",
              color: p === period ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.50)",
              transition: "all 0.15s",
            }}>{p}</button>
          ))}
        </div>
      </div>
      {/* Ideal range legend — below pills */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12 }}>
        <div style={{
          width: 8, height: 8, borderRadius: 2, flexShrink: 0,
          background: "rgba(123,143,255,0.22)",
          border: "1px solid rgba(123,143,255,0.45)",
        }} />
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "Figtree,sans-serif" }}>
          Ideal range · {m.ideal[0]}–{m.ideal[1]}{m.unit ? ` ${m.unit}` : ""}
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={175}>
        <LineChart data={data} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
          <defs>
            {/* Indigo fill for ideal zone band */}
            <linearGradient id={`ideal-${m.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7B8FFF" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#7B8FFF" stopOpacity={0.06} />
            </linearGradient>
          </defs>

          {/* Ideal zone — indigo band */}
          <ReferenceArea
            y1={m.ideal[0]} y2={m.ideal[1]}
            fill={`url(#ideal-${m.key})`}
            stroke="none"
          />

          {/* Lower boundary — dashed indigo line with right-side label */}
          <ReferenceLine
            y={m.ideal[0]}
            stroke="rgba(123,143,255,0.50)"
            strokeWidth={1}
            strokeDasharray="3 4"
            label={{
              value: String(m.ideal[0]),
              position: "insideBottomRight",
              fontSize: 10,
              fill: "rgba(123,143,255,0.80)",
              fontFamily: "Figtree,sans-serif",
            }}
          />

          {/* Upper boundary — dashed indigo line with right-side label */}
          <ReferenceLine
            y={m.ideal[1]}
            stroke="rgba(123,143,255,0.50)"
            strokeWidth={1}
            strokeDasharray="3 4"
            label={{
              value: String(m.ideal[1]),
              position: "insideTopRight",
              fontSize: 10,
              fill: "rgba(123,143,255,0.80)",
              fontFamily: "Figtree,sans-serif",
            }}
          />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.32)", fontFamily: "Figtree,sans-serif" }}
            axisLine={false} tickLine={false} interval="preserveStartEnd"
          />
          <YAxis
            domain={[domainMin, domainMax]}
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.28)", fontFamily: "Figtree,sans-serif" }}
            axisLine={false} tickLine={false} width={28}
            tickCount={4}
            tickFormatter={v => String(Math.round(v))}
          />
          <Tooltip
            content={(props) => <ChartTooltip {...props} unit={m.unit} />}
            cursor={{ stroke: "rgba(255,255,255,0.14)", strokeWidth: 1, strokeDasharray: "3 3" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={m.color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: m.color,
              stroke: C.bg,
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Footer — clear 3-tier hierarchy */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingLeft: 32, paddingRight: 6, marginTop: 10
      }}>
        {/* Start — label + value stacked */}
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", marginBottom: 2 }}>{data[0]?.label ?? "—"}</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>
            {(
              data[0]?.value === null ||
              data[0]?.value === undefined ||
              data[0]?.value === "" ||
              Number.isNaN(Number(data[0]?.value))
            ) ? "—" : data[0]?.value}{m.unit}
          </div>
        </div>
        {/* Delta — most prominent, centre */}
        <div style={{ textAlign: "center" }}>
          {values.length < 2 || delta === 0 ? (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", letterSpacing: "0.04em" }}>—</div>
          ) : (
            <>
              <div style={{
                fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em",
                color: improving ? C.good : C.bad,
              }}>
                {delta > 0 ? "↑" : "↓"} {Math.abs(delta)}{m.unit}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginTop: 2 }}>
                {improving ? "improving" : "worsening"}
              </div>
            </>
          )}
        </div>
        {/* Now — label + value stacked */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.36)", marginBottom: 2 }}>Now</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: m.color }}>
            {values[values.length - 1]}{m.unit}
          </div>
        </div>
      </div>
    </div>
  );
}



/* ─── Mini Range Bar — Samsung Health style ─────────────────── */
function MiniRangeBar({ m }: { m: Metric }) {
  const mp  = clamp01(m.value,    m.min, m.max) * 100;
  const il  = clamp01(m.ideal[0], m.min, m.max) * 100;
  const ir  = clamp01(m.ideal[1], m.min, m.max) * 100;
  const iw  = ir - il;
  const unit = m.unit === "kg/m²" ? "" : m.unit ? ` ${m.unit}` : "";
  const dotColor  = STATUS_COLOR[m.status];
  const inIdeal   = m.value >= m.ideal[0] && m.value <= m.ideal[1];
  const TRACK_H   = 7;
  const DOT_SIZE  = 16;

  return (
    <div style={{ paddingTop: DOT_SIZE / 2 + 2 }}>
      {/* ── Track ────────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        height: TRACK_H,
        borderRadius: TRACK_H,
        background: "rgba(255,255,255,0.07)",
        overflow: "visible",
      }}>
        {/* Below-ideal zone — subtle left fill */}
        <div style={{
          position: "absolute", top: 0, height: "100%",
          left: 0, width: `${il}%`,
          background: "rgba(255,255,255,0.06)",
          borderRadius: `${TRACK_H}px 0 0 ${TRACK_H}px`,
        }} />

        {/* Ideal zone — always calm green to show the target, independent of status */}
        <div style={{
          position: "absolute", top: 0, height: "100%",
          left: `${il}%`, width: `${iw}%`,
          background: "rgba(48,209,88,0.28)",
          borderRadius: iw < 3 ? TRACK_H : 0,
        }} />

        {/* Above-ideal zone — subtle right fill */}
        <div style={{
          position: "absolute", top: 0, height: "100%",
          left: `${ir}%`, width: `${100 - ir}%`,
          background: "rgba(255,255,255,0.06)",
          borderRadius: `0 ${TRACK_H}px ${TRACK_H}px 0`,
        }} />

        {/* Indicator dot — sits on top of track */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: `${mp}%`,
          transform: "translate(-50%, -50%)",
          width: DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: "50%",
          background: dotColor,
          border: `3px solid ${C.bg}`,
          boxShadow: `0 0 0 2px ${dotColor}50, 0 3px 10px rgba(0,0,0,0.50)`,
          zIndex: 3,
        }} />
      </div>

      {/* ── Labels ───────────────────────────────────────────── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginTop: 7,
      }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.20)", letterSpacing: "-0.01em" }}>{m.min}</span>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.005em",
          color: inIdeal ? "rgba(48,209,88,0.80)" : "rgba(255,255,255,0.32)",
        }}>
          {m.ideal[0]}–{m.ideal[1]}{unit}
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.20)", letterSpacing: "-0.01em" }}>{m.max}</span>
      </div>
    </div>
  );
}

/* ─── Metric Row (Samsung Health card style) ───────────────── */
function MetricRow({ m, last, trendData }: { m: Metric; last: boolean; trendData: { all: TrendPt[]; y1: TrendPt[]; m6: TrendPt[]; m3: TrendPt[] } }) {
  const [open, setOpen] = useState(false);
  const inRange = m.value >= m.ideal[0] && m.value <= m.ideal[1];
  const sc = STATUS_COLOR[m.status];
  const isAlert = m.statusLabel === "High" || m.statusLabel === "Low";
  const unitDisplay = m.unit === "kg/m²" ? "BMI" : m.unit;

  return (
    <div style={{
      background: "rgba(255,255,255,0.08)",
      border: `1px solid ${isAlert && !inRange ? `${sc}30` : "rgba(255,255,255,0.12)"}`,
      borderRadius: 18,
      overflow: "hidden",
      transition: "box-shadow 0.2s",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", background: "transparent", border: "none",
          cursor: "pointer", fontFamily: "Figtree, sans-serif",
          padding: "16px 18px 15px", textAlign: "left", display: "block",
          WebkitTapHighlightColor: "transparent",
          transition: "opacity 0.12s",
        }}
        onMouseDown={e => { (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
        onMouseUp={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        onTouchStart={e => { (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
        onTouchEnd={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
      >
        {/* ── Samsung widget layout: label col left, hero number col right ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 15 }}>
          {/* LEFT — label and status text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em",
                color: "rgba(255,255,255,0.88)", lineHeight: 1.2,
              }}>{m.label}</span>
              {['High', 'Low', 'Good'].includes(m.statusLabel) ? (
                <span style={{
                  display: 'inline-block',
                  minWidth: 36,
                  padding: '1.5px 10px',
                  borderRadius: 10,
                  background: `${sc}18`,
                  color: sc,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  border: `1px solid ${sc}33`,
                  boxShadow: 'none',
                  opacity: 0.92,
                  textAlign: 'center',
                  marginLeft: 2,
                  lineHeight: 1.2,
                  transition: 'background 0.18s, color 0.18s, border 0.18s',
                }}>{m.statusLabel}</span>
              ) : (
                <span style={{
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.01em',
                  color: inRange ? sc : sc,
                  opacity: 0.92,
                }}>{m.statusLabel}</span>
              )}
            </div>
            {m.sublabel && (
              <div style={{
                fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.26)",
                marginTop: 3, letterSpacing: "0em", lineHeight: 1.3,
              }}>{m.sublabel}</div>
            )}
          </div>
          {/* RIGHT — hero number and chevron inline */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <div style={{ textAlign: "right", display: "flex", alignItems: "baseline", gap: 2, lineHeight: 1 }}>
              <span style={{
                fontSize: 28, fontWeight: 700, letterSpacing: "-0.045em",
                lineHeight: 1, color: inRange ? "rgba(255,255,255,0.96)" : sc,
                fontVariantNumeric: "tabular-nums" as any,
              }}>{m.value}</span>
              {unitDisplay && (
                <span style={{
                  fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.32)",
                  letterSpacing: "0em", paddingBottom: 2,
                }}>{unitDisplay}</span>
              )}
            </div>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"
              style={{
                flexShrink: 0, opacity: 0.28,
                transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
              }}>
              <path d="M3 5L7 9L11 5" stroke="white"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* ── Range bar ── */}
        <MiniRangeBar m={m} />
      </button>

      {/* ── Expanded detail ── */}
      {open && (
        <div style={{ padding: "0 16px 18px" }}>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 16 }} />
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
  const [userName, setUserName] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
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
  const ranges = computeRanges(ageNum, gender, activity, heightNum, scanValues.weight ?? 0);
  const METRICS = buildMetrics(ranges, scanValues);

  // Always include all possible fields in the form, even if null
  const ALL_FIELDS = [
    "weight", "bmi", "fat", "subcutaneous_fat", "visceral", "skeletal", "bmr", "metage"
  ];
  const [form, setForm] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const key of ALL_FIELDS) {
      const val = (scanValues as any)[key];
      initial[key] = val !== undefined && val !== null ? String(val) : "";
    }
    return initial;
  });

  const scanDueLabel = daysUntilScan === null ? "—"
    : daysUntilScan > 1 ? `Due in ${daysUntilScan}d`
      : daysUntilScan === 1 ? "Due tomorrow"
        : daysUntilScan === 0 ? "Due today"
          : `Overdue · ${daysUntilScan < 0 ? -daysUntilScan : daysUntilScan}d`;

  const [insightIdx, setInsightIdx] = useState(0);
  const [insightAnimate, setInsightAnimate] = useState(false);

  const scanDueColor = daysUntilScan === null ? "rgba(255,255,255,0.38)"
    : daysUntilScan > 3 ? "rgba(255,255,255,0.45)"
      : daysUntilScan > 0 ? C.warn
        : daysUntilScan === 0 ? C.bad
          : "rgba(255,69,58,0.60)";

  // ── Insight rotation ─────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    const t = setInterval(() => {
      setInsightIdx(i => i + 1);
    }, 7000);
    return () => clearInterval(t);
  }, [loading]);

  // ── Fetch user name from cached /api/me ─────────────────────
  useEffect(() => {
    getCachedUserMe()
      .then(me => { if (me?.name) setUserName(me.name.split(' ')[0]); })
      .catch(() => { });
  }, []);

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
          nextDate.setDate(nextDate.getDate() + 14);
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
        // Do NOT redirect on 401 here — api() already calls logout()
        // (which does window.location.href redirect) when the session truly expires.
        // Redirecting here too would wrongly kick users on transient network errors.
        const isSessionExpired = err?.status === 401 && typeof window !== 'undefined' && !localStorage.getItem('refresh_token');
        if (isSessionExpired) {
          router.replace("/login");
          return;
        }
        if (err?.status !== 401) setApiError(err?.message || "Failed to load data. Please try again.");
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
    const nextStep = isProfileComplete() ? 2 : 1;
    setModalStep(nextStep);
    // If opening directly to step 2, clear measurement fields
    if (nextStep === 2) {
      setForm(f => {
        const cleared = { ...f };
        for (const key of ALL_FIELDS) {
          cleared[key] = "";
        }
        return cleared;
      });
    }
    setShowModal(true);
  };

  // ── Save scan to API ──────────────────────────────────────────
  const handleSave = async () => {
    // Validate — ALL fields are mandatory
    const errors: Record<string, boolean> = {};
    ALL_FIELDS.forEach(key => {
      const meta = FORM_METRIC_META[key];
      if (!meta) return;
      const val = parseFloat(form[key] ?? "");
      if (!form[key] || isNaN(val) || val < meta.min || val > meta.max) errors[key] = true;
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
        subcutaneous_fat_pct: parseFloat(form.subcutaneous_fat) || null,
        skeletal_muscle_pct: parseFloat(form.skeletal) || null,
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

      // When entering new measurements, clear all measurement fields for step 2
      setForm(f => {
        const cleared = { ...f };
        for (const key of ALL_FIELDS) {
          cleared[key] = "";
        }
        return cleared;
      });
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
            <div style={{
              width: 36, height: 4, borderRadius: 100, background: "rgba(255,255,255,0.22)"
            }} />
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
              <div style={{ overflowY: "auto", flex: 1, padding: "0 16px 8px", marginTop: 0 }}>
                {[
                  { label: "Body Measurements", keys: ["weight", "bmi"] },
                  { label: "Composition", keys: ["fat", "subcutaneous_fat", "visceral", "skeletal"] },
                  { label: "Metabolic", keys: ["bmr", "metage"] },
                ].map(group => {
                  const gm = group.keys.map(k => {
                    const existing = METRICS.find(m => m.key === k);
                    if (existing) return existing;
                    const meta = FORM_METRIC_META[k];
                    if (!meta) return null;
                    const ideal = (ranges as any)[k] as [number, number] | undefined;
                    return { key: k, label: meta.label, sublabel: meta.sublabel, unit: meta.unit, min: meta.min, max: meta.max, ideal: ideal ?? [0, 0] as [number, number], value: 0, color: meta.color, status: "fair" as Status, statusLabel: "", lowerIsBetter: meta.lowerIsBetter, trendKey: k as any } as Metric;
                  }).filter((m): m is Metric => Boolean(m));
                  return (
                    <div key={group.label} style={{ marginTop: 24 }}>
                      <div style={{
                        fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.48)",
                        letterSpacing: "0.07em", textTransform: "uppercase", paddingLeft: 2, marginBottom: 7,
                        fontFamily: "Figtree, sans-serif",
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
                              display: "flex", alignItems: "center", padding: "0 16px", minHeight: 62,
                              borderBottom: i < gm.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                              background: hasError ? "rgba(255,69,58,0.04)" : "transparent",
                              transition: "background 0.15s",
                            }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.82)", letterSpacing: "-0.01em" }}>{m.label}</span>
                                  {hasError && (
                                    <span style={{ fontSize: 10, color: C.bad, marginLeft: 4, fontWeight: 600 }}>
                                      {!form[m.key] || isNaN(parseFloat(form[m.key]))
                                        ? "Required"
                                        : parseFloat(form[m.key]) < m.min
                                          ? `Min ${m.min}`
                                          : `Max ${m.max}`}
                                    </span>
                                  )}
                                </div>
                                {/* Show sublabel below input instead of ideal */}
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", marginTop: 6, fontWeight: 400, letterSpacing: "-0.01em" }}>
                                  {m.sublabel}
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
                                    setForm(f => ({ ...f, [m.key]: raw }));
                                    // Show error if out of allowed range
                                    if (!raw || isNaN(n) || n < m.min || n > m.max) {
                                      setFormErrors(fe => ({ ...fe, [m.key]: true }));
                                    } else {
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
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", minWidth: 28 }}>{displayUnit}</span>
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
    <div className="min-h-screen bg-[#0F0F11] flex items-center justify-center">
      {/* Custom Skeleton Loader for bgmi page */}
      {/* @ts-ignore */}
      {require('../../staticPages/loader').SkeletonLoader()}
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
            fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.50)",
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
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", marginLeft: "auto" }}>{sub}</span>
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
          fontSize: 12, color: "rgba(255,255,255,0.50)", marginTop: 16,
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
        fontFamily: "Figtree, sans-serif", width: "100%", paddingBottom: 60
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
        @keyframes insightSlide { 0% { opacity:0; transform:translateY(10px) } 100% { opacity:1; transform:translateY(0) } }
        @keyframes insightOut   { 0% { opacity:1; transform:translateY(0) } 100% { opacity:0; transform:translateY(-8px) } }
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
              <button onClick={() => router.push("/challanges")} style={{
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

              {/* Centre — Title only */}
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em",
                  color: "rgba(255,255,255,0.88)",
                }}>Body Composition</div>
              </div>

              {/* Right — Health Guide icon only */}
              <button onClick={() => router.push("/bgmi/guide")} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "linear-gradient(90deg, #f5f6fa 0%, #e7e9f3 100%)",
                border: "none", cursor: "pointer",
                padding: "4px 12px 4px 10px", borderRadius: 12, minHeight: 32, flexShrink: 0,
                boxShadow: "0 1px 6px 0 rgba(90,200,250,0.07)",
                transition: "transform 0.13s cubic-bezier(.4,1,.4,1), box-shadow 0.13s cubic-bezier(.4,1,.4,1)",
                fontWeight: 600,
                fontSize: 13.5,
                color: "#3a3a44",
                letterSpacing: "-0.01em",
                outline: "none",
                borderColor: "transparent",
                position: "relative",
                overflow: "hidden",
                opacity: 0.92,
              }}
              onMouseDown={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
              onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none" style={{ marginRight: 4 }}>
                  <circle cx="9" cy="9" r="7.2" stroke="#bfc3d1" strokeWidth="1.2" />
                  <path d="M9 8v4" stroke="#7B5CF5" strokeWidth="1.3" strokeLinecap="round" />
                  <circle cx="9" cy="6" r="0.9" fill="#7B5CF5" />
                </svg>
                <span style={{
                  fontSize: 13.5, fontWeight: 600,
                  color: "#3a3a44", letterSpacing: "-0.01em",
                  textShadow: "0 1px 4px #e7e9f3"
                }}>Health Guide</span>
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
            const wHasTwo = wLast > 0 && wPrev > 0 && !isNaN(wLast) && !isNaN(wPrev);
            const wDistLast = Math.abs(wLast - wMidIdeal);
            const wDistPrev = Math.abs(wPrev - wMidIdeal);
            // Only say "improving" when we have 2 valid data points AND the gap to ideal shrank
            const wImproving = wHasTwo && wDistLast < wDistPrev;
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
            // Arc circumference for r=36 → 2π×36 ≈ 226.2
            const ARC = 226.2;
            const pct = METRICS.length > 0 ? goodCount / METRICS.length : 0;
            return (
              <div style={{ padding: "12px 16px 0", ...fade(0) }}>
                <div style={{
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.13)",
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset",
                }}>
                  {/* Ambient glow */}
                  <div style={{
                    position: "absolute", top: -50, right: -50,
                    width: 180, height: 180, borderRadius: "50%",
                    background: iColor, opacity: 0.12, filter: "blur(55px)",
                    pointerEvents: "none",
                  }} />

                  {/* Top section: score ring + text */}
                  <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 20, position: "relative" }}>

                    {/* Score ring */}
                    <div style={{ flexShrink: 0, position: "relative", width: 88, height: 88 }}>
                      <svg width={88} height={88} style={{ transform: "rotate(-90deg)" }}>
                        <circle cx={44} cy={44} r={36} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={7.5} />
                        <circle
                          cx={44} cy={44} r={36}
                          fill="none"
                          stroke={iColor}
                          strokeWidth={7.5}
                          strokeLinecap="round"
                          strokeDasharray={ARC}
                          strokeDashoffset={ARC * (1 - pct)}
                          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1)" }}
                        />
                      </svg>
                      <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        lineHeight: 1,
                      }}>
                        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", color: iColor, lineHeight: 1 }}>{goodCount}</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.28)", letterSpacing: "-0.01em", lineHeight: 1, marginTop: 3 }}>/{METRICS.length}</span>
                      </div>
                    </div>

                    {/* Right — headline + chips */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.30)", marginBottom: 5, letterSpacing: "0em" }}>
                        {userName ? `Hi, ${userName}` : "Your summary"}
                      </div>
                      <div style={{
                        fontSize: 23, fontWeight: 700, color: "#fff",
                        letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: 10,
                      }}>{headline}</div>
                      {/* Pills */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {goodCount > 0 && (
                          <span style={{
                            display: "inline-flex", alignItems: "center",
                            padding: "3px 10px", borderRadius: 20,
                            background: `${C.good}18`, border: `1px solid ${C.good}30`,
                            fontSize: 11, fontWeight: 600, color: C.good, letterSpacing: "0em",
                          }}>
                            {goodCount} healthy
                          </span>
                        )}
                        {outOfRange.length > 0 && (
                          <span style={{
                            display: "inline-flex", alignItems: "center",
                            padding: "3px 10px", borderRadius: 20,
                            background: `${C.bad}18`, border: `1px solid ${C.bad}30`,
                            fontSize: 11, fontWeight: 600, color: C.bad, letterSpacing: "0em",
                          }}>
                            {outOfRange.length} need{outOfRange.length === 1 ? "s" : ""} work
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 20px" }} />

                  {/* Insight — rotating animated */}
                  {(() => {
                    // Priority order: visceral (highest health risk) first, then body fat, skeletal, body age, bmi, weight, others
                    const PRIORITY_KEYS = ["visceral", "fat", "skeletal", "metage", "subcutaneous_fat", "bmi", "weight", "bmr"];

                    // Only show metrics that are OUT of range, sorted by priority
                    const alertMetrics = PRIORITY_KEYS
                      .map(k => METRICS.find(m => m.key === k))
                      .filter((m): m is Metric => !!m && (m.value < m.ideal[0] || m.value > m.ideal[1]));

                    const msgs: { text: React.ReactElement; accent: string }[] = [];

                    if (alertMetrics.length === 0) {
                      // All good — single simple slide
                      msgs.push({
                        accent: C.good,
                        text: (
                          <p key="allgood" style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.65)" }}>
                            <span style={{ fontWeight: 700, color: C.good }}>Everything looks good. </span>
                            All your body metrics are in the healthy range.
                          </p>
                        ),
                      });
                    } else {
                      // One slide per out-of-range metric (max 3 to avoid clutter)
                      alertMetrics.slice(0, 3).forEach((m, i) => {
                        const isHigh = m.value > m.ideal[1];
                        const mLast = Number(trendData.all[trendData.all.length - 1]?.[m.trendKey]);
                        const mPrev = Number(trendData.all[trendData.all.length - 2]?.[m.trendKey]);
                        const mHasTwo = mLast > 0 && mPrev > 0 && !isNaN(mLast) && !isNaN(mPrev);
                        const mMid = (m.ideal[0] + m.ideal[1]) / 2;
                        const mImproving = mHasTwo && Math.abs(mLast - mMid) < Math.abs(mPrev - mMid);
                        const gap = isHigh
                          ? (m.value - m.ideal[1]).toFixed(m.unit === "lvl" || m.unit === "yrs" ? 0 : 1)
                          : (m.ideal[0] - m.value).toFixed(m.unit === "lvl" || m.unit === "yrs" ? 0 : 1);

                        // Simple human-readable status
                        let trendEl: React.ReactElement;
                        if (!mHasTwo) {
                          trendEl = <span style={{ color: "rgba(255,255,255,0.35)" }}>measure again to see trend</span>;
                        } else if (mImproving) {
                          trendEl = <span style={{ fontWeight: 600, color: C.good }}>getting better ↗</span>;
                        } else {
                          trendEl = <span style={{ fontWeight: 600, color: C.bad }}>still worsening ↘</span>;
                        }

                        msgs.push({
                          accent: !mHasTwo ? C.warn : mImproving ? C.good : C.bad,
                          text: (
                            <p key={`alert-${i}`} style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.65)" }}>
                              <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.93)" }}>{m.label}</span>
                              {" is "}
                              <span style={{ fontWeight: 700, color: C.bad }}>{isHigh ? "too high" : "too low"}</span>
                              {" by "}
                              <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>{gap}{m.unit}</span>
                              {" · "}{trendEl}
                            </p>
                          ),
                        });
                      });
                    }

                    const totalMsgs = msgs.length;
                    const idx = insightIdx % totalMsgs;

                    return (
                      <div style={{ padding: "12px 20px 13px" }}>
                        {/* Header row */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                          <div style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: msgs[idx].accent,
                            boxShadow: `0 0 6px 1px ${msgs[idx].accent}88`,
                            transition: "background 0.4s",
                          }} />
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>
                            {alertMetrics.length > 0 ? `Needs attention · ${idx + 1} of ${totalMsgs}` : "All clear"}
                          </span>
                          {totalMsgs > 1 && (
                            <span style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                              {Array.from({ length: totalMsgs }).map((_, i) => (
                                <span key={i} style={{
                                  width: i === idx ? 14 : 4, height: 4, borderRadius: 3,
                                  background: i === idx ? msgs[idx].accent : "rgba(255,255,255,0.13)",
                                  transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
                                  display: "inline-block",
                                }} />
                              ))}
                            </span>
                          )}
                        </div>
                        {/* Animated text */}
                        <div style={{
                          key: idx,
                          animation: `insightSlide 0.38s cubic-bezier(.4,0,.2,1) both`,
                          animationName: "insightSlide",
                        } as React.CSSProperties}>
                          <div key={idx} style={{ animation: "insightSlide 0.38s cubic-bezier(.4,0,.2,1) both" }}>
                            {msgs[idx].text}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Scan meta footer */}
                  <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 20px" }} />
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 20px 14px",
                  }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: "-0.01em" }}>
                      Updated <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.42)" }}>{lastScanDate}</span>
                    </span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: "-0.01em" }}>
                      Next <span style={{ fontWeight: 600, color: scanDueColor, transition: "color 0.2s" }}>{scanDueLabel}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── ALL METRICS (Grouped by Category) ── */}
          <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 28, ...fade(1) }}>
            {[
              { label: "Body Measurements", keys: ["weight", "bmi"] },
              { label: "Composition", keys: ["fat", "visceral", "subcutaneous_fat", "skeletal", "muscle", "bone"] },
              { label: "Metabolic", keys: ["water", "protein", "bmr", "metage"] },
            ].map(group => {
              const groupMetrics = group.keys.map(k => METRICS.find(m => m.key === k)).filter((m): m is Metric => Boolean(m));
              if (!groupMetrics.length) return null;
              return (
                <div key={group.label}>
                  {/* Section header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11, paddingLeft: 2 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: "rgba(255,255,255,0.36)",
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      fontFamily: "Figtree, sans-serif",
                    }}>{group.label}</span>
                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
                  </div>
                  {/* Individual cards — each is its own elevated card */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {groupMetrics.map((m) => (
                      <MetricRow key={m.key} m={m} last={true} trendData={trendData} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── CTA ── */}

          {/* Subtle small inline button for new measurement */}
          <div style={{ width: "100%", display: "flex", justifyContent: "center", margin: "18px 0 10px" }}>
            <button
              onClick={() => openModal(null)}
              style={{
                background: "#7B5CF5", color: "#fff", border: "none",
                borderRadius: 10, padding: "7px 18px", fontSize: 13, fontWeight: 600,
                letterSpacing: "-0.01em", boxShadow: "0 1px 6px 0 rgba(123,92,245,0.10)",
                cursor: "pointer", transition: "opacity 0.15s", opacity: 0.92,
              }}
              aria-label="Add new measurement"
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.opacity = "0.92"; }}
            >
              <span style={{ fontSize: 17, fontWeight: 700, marginRight: 7, position: "relative", top: 1 }}>+</span>
              New Measurement
            </button>
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
                        outline: "none", boxSizing: "border-box" as const,
                        transition: "border-color 0.12s, background 0.12s",
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
                        outline: "none", boxSizing: "border-box" as const,
                        transition: "border-color 0.12s, background 0.12s",
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


    </>
  );

}
