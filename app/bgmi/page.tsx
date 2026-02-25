"use client";
import { useState, useEffect, useCallback, CSSProperties } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";
import { api, BodyMetricHistory, BodyMetricScan, getBodyProfile, getLatestScan, getScanHistory, saveScan } from "@/lib/api";

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
function scanToValues(s: BodyMetricScan | undefined | null) {
  if (!s) {
    return {
      weight: 0,
      bmi: 0,
      visceral: 0,
      fat: 0,
      muscle: 0,
      water: 0,
      bmr: 0,
      protein: 0,
      metage: 0,
      bone: 0,
    };
  }
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
  const ageAdj = Math.max(0, Math.floor((age - 30) / 10));

  const bmiIdeal: [number, number] = [18.5, 22.9];
  const fatBase = isMale ? [18, 24] : [25, 31];
  const fatIdeal: [number, number] = [fatBase[0] + ageAdj, fatBase[1] + 2 + ageAdj];
  const visMax = age >= 50 ? 7 : age >= 40 ? 8 : 9;
  const smi = isMale ? 8.87 : 6.42;
  const muscleTgt = smi * heightM * heightM * 0.93;
  const muscleIdeal: [number, number] = [parseFloat((muscleTgt * 0.88).toFixed(1)), parseFloat((muscleTgt * 1.12).toFixed(1))];
  const waterIdeal: [number, number] = isMale ? [55, 65] : [50, 60];
  const w = weight || 70;
  const bmrBase = isMale
    ? (10 * w) + (6.25 * height) - (5 * age) + 5
    : (10 * w) + (6.25 * height) - (5 * age) - 161;
  const bmrIdeal: [number, number] = [Math.round(bmrBase * 0.92), Math.round(bmrBase * 1.08)];
  const pLow = activity === "sedentary" ? 15 : activity === "light" ? 16 : 17;
  const pHigh = activity === "athlete" ? 22 : activity === "active" ? 21 : 20;
  const boneMale = age < 40 ? [3.0, 3.8] : age < 60 ? [2.8, 3.6] : [2.5, 3.2];
  const boneFemale = age < 40 ? [2.0, 2.8] : age < 60 ? [1.8, 2.5] : [1.5, 2.2];
  const weightLow = parseFloat((18.5 * heightM * heightM).toFixed(1));
  const weightHigh = parseFloat((22.9 * heightM * heightM).toFixed(1));

  return {
    weight: [weightLow, weightHigh], bmi: bmiIdeal, visceral: [1, visMax],
    fat: fatIdeal, muscle: muscleIdeal, water: waterIdeal, bmr: bmrIdeal,
    protein: [pLow, pHigh], metage: [0, age], bone: (isMale ? boneMale : boneFemale) as [number, number],
  };
}

/* ─────────────────────────────────────────────────────────────
   BUILD METRICS from scan values + ranges
───────────────────────────────────────────────────────────── */
function buildMetrics(ranges: Record<string, [number, number]>, sv: typeof EMPTY_SCAN): Metric[] {
  const ir = (v: number, r: [number, number]) => v >= r[0] && v <= r[1];
  const gs = (v: number, r: [number, number], lb?: boolean): Status => {
    if (ir(v, r)) { const pct = Math.abs(v - (r[0] + r[1]) / 2) / ((r[1] - r[0]) / 2); return pct < 0.3 ? "excellent" : "good"; }
    if (lb) return v > r[1] * 1.3 ? "high" : "fair";
    return v > r[1] * 1.2 ? "high" : "fair";
  };
  const gl = (v: number, r: [number, number]): string => {
    if (ir(v, r)) return Math.abs(v - (r[0] + r[1]) / 2) / ((r[1] - r[0]) / 2) < 0.3 ? "Optimal" : "Normal";
    return v > r[1] ? "Above range" : "Below range";
  };
  return [
    { key: "weight", label: "Weight", value: sv.weight, unit: "kg", ideal: ranges.weight, min: 40, max: 150, color: C.blue, lowerIsBetter: false, status: gs(sv.weight, ranges.weight), statusLabel: gl(sv.weight, ranges.weight), trendKey: "weight" },
    { key: "bmi", label: "BMI", value: sv.bmi, unit: "", ideal: ranges.bmi, min: 10, max: 40, color: C.warn, lowerIsBetter: false, status: gs(sv.bmi, ranges.bmi), statusLabel: gl(sv.bmi, ranges.bmi), trendKey: "bmi" },
    { key: "visceral", label: "Visceral Fat", value: sv.visceral, unit: "lvl", ideal: ranges.visceral, min: 1, max: 30, color: C.bad, lowerIsBetter: true, status: gs(sv.visceral, ranges.visceral, true), statusLabel: gl(sv.visceral, ranges.visceral), trendKey: "visceral" },
    { key: "fat", label: "Body Fat", value: sv.fat, unit: "%", ideal: ranges.fat, min: 5, max: 50, color: C.warn, lowerIsBetter: true, status: gs(sv.fat, ranges.fat, true), statusLabel: gl(sv.fat, ranges.fat), trendKey: "fat" },
    { key: "muscle", label: "Muscle Mass", value: sv.muscle, unit: "kg", ideal: ranges.muscle, min: 10, max: 80, color: C.good, lowerIsBetter: false, status: gs(sv.muscle, ranges.muscle), statusLabel: gl(sv.muscle, ranges.muscle), trendKey: "muscle" },
    { key: "water", label: "Hydration", value: sv.water, unit: "%", ideal: ranges.water, min: 30, max: 80, color: C.blue, lowerIsBetter: false, status: gs(sv.water, ranges.water), statusLabel: gl(sv.water, ranges.water), trendKey: "water" },
    { key: "bmr", label: "Resting Burn", value: sv.bmr, unit: "kcal", ideal: ranges.bmr, min: 1000, max: 3000, color: C.blue, lowerIsBetter: false, status: gs(sv.bmr, ranges.bmr), statusLabel: gl(sv.bmr, ranges.bmr), trendKey: "bmr" },
    { key: "protein", label: "Protein", value: sv.protein, unit: "%", ideal: ranges.protein, min: 5, max: 35, color: C.good, lowerIsBetter: false, status: gs(sv.protein, ranges.protein), statusLabel: gl(sv.protein, ranges.protein), trendKey: "protein" },
    { key: "metage", label: "Metabolic Age", value: sv.metage, unit: "yrs", ideal: ranges.metage, min: 10, max: 80, color: C.good, lowerIsBetter: true, status: gs(sv.metage, ranges.metage, true), statusLabel: gl(sv.metage, ranges.metage), trendKey: "metage" },
    { key: "bone", label: "Bone Mass", value: sv.bone, unit: "kg", ideal: ranges.bone, min: 0.5, max: 6, color: C.purple, lowerIsBetter: false, status: gs(sv.bone, ranges.bone), statusLabel: gl(sv.bone, ranges.bone), trendKey: "bone" },
  ];
}


/* TREND DATA is now loaded from API — see historyToTrend() */

const clamp01 = (v: number, lo: number, hi: number) =>
  Math.min(Math.max((v - lo) / (hi - lo), 0), 1);

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
  const values = data.map(d => d.value);
  const numValues = values.map(v => typeof v === 'number' ? v : parseFloat(v) || 0);
  const domainMin = Math.min(...numValues, m.ideal[0]) - (m.ideal[0] - m.min) * 0.15;
  const domainMax = Math.max(...numValues, m.ideal[1]) + (m.max - m.ideal[1]) * 0.15;
  const improving = m.lowerIsBetter ? values[values.length - 1] <= values[0] : values[values.length - 1] >= values[0];
  const delta = parseFloat((Number(values[values.length - 1]) - Number(values[0])).toFixed(1));

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
            tickFormatter={(v: number) => `${parseFloat(v.toFixed(1))}`}
          />
          <Tooltip content={(props: any) => <ChartTooltip {...props} unit={m.unit} />}
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
          {improving ? "↑" : "↓"} {Math.abs(delta)}{m.unit}
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
  const improving = m.lowerIsBetter ? diff3m <= 0 : diff3m >= 0;

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
          <div style={{ flexShrink: 0, textAlign: "right", minWidth: 32 }}>
            <div style={{
              fontSize: 11, fontWeight: 600,
              color: improving ? "rgba(48,209,88,0.75)" : "rgba(255,69,58,0.75)"
            }}>
              {improving ? "↑" : "↓"}{Math.abs(diff3m)}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.24)", marginTop: 2 }}>3mo</div>
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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [focusKey, setFocusKey] = useState<string | null>(null);

  // ── API loading state ─────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [scanValues, setScanValues] = useState(EMPTY_SCAN);
  const [trendData, setTrendData] = useState<{ all: TrendPt[]; y1: TrendPt[]; m6: TrendPt[]; m3: TrendPt[] }>({
    all: [], y1: [], m6: [], m3: [],
  });
  const [lastScanDate, setLastScanDate] = useState<string>("—");

  // ── Profile state ─────────────────────────────────────────────
  const [age, setAge] = useState("32");
  const [gender, setGender] = useState<Gender>("male");
  const [activity, setActivity] = useState<Activity>("moderate");
  const [height, setHeight] = useState("177");

  // ── API error + startup state ─────────────────────────────────
  const [apiError, setApiError] = useState<string | null>(null);
  const [showStartup, setShowStartup] = useState(false);
  const [showStartMeasure, setShowStartMeasure] = useState(false);

  // ── Derived ───────────────────────────────────────────────────
  const ageNum = parseInt(age) || 32;
  const heightNum = parseInt(height) || 177;
  let METRICS: Metric[] = [];
  let ranges: Record<string, [number, number]> = {};
  if (!showStartMeasure) {
    ranges = computeRanges(ageNum, gender, activity, heightNum, scanValues.weight);
    METRICS = buildMetrics(ranges, scanValues);
  }

  const [form, setForm] = useState<Record<string, string>>(() =>
    METRICS.length > 0 ? Object.fromEntries(METRICS.map(m => [m.key, String(m.value)])) : {}
  );

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

        // Defensive: check for missing/null/undefined profile fields
        if (!profileRes || profileRes.age == null || profileRes.gender == null || profileRes.activity_level == null || profileRes.height_cm == null) {
          setShowStartup(true);
          setLoading(false);
          return;
        }

        if (profileRes.age) setAge(String(profileRes.age));
        if (profileRes.gender) setGender(profileRes.gender as Gender);
        if (profileRes.activity_level) setActivity(profileRes.activity_level as Activity);
        if (profileRes.height_cm) setHeight(String(Math.round(profileRes.height_cm)));

        if (!latestRes) {
          setShowStartMeasure(true);
          setLoading(false);
          return;
        }

        // Defensive: check for undefined properties before mapping
        try {
          const sv = scanToValues(latestRes);
          setScanValues(sv);
          setForm(Object.fromEntries(Object.entries(sv).map(([k, v]) => [k, String(v)])));
          setLastScanDate(new Date(latestRes.recorded_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }));
        } catch (e) {
          setApiError("Scan data is incomplete or malformed. Please check your latest measurement.");
          setLoading(false);
          return;
        }

        setTrendData({
          all: historyToTrend(historyRes.all || []),
          y1: historyToTrend(historyRes.y1 || []),
          m6: historyToTrend(historyRes.m6 || []),
          m3: historyToTrend(historyRes.m3 || []),
        });

      } catch (err: any) {
        if (err?.status === 401) router.push("/login");
        setApiError("Failed to load data from server. Please try again later.");
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
      await api("/api/users/me/profile", {
        method: "PUT", auth: true,
        body: JSON.stringify({
          age: ageNum,
          gender: gender,
          activity_level: activity,
          height_cm: heightNum,
        }),
      });
    } catch { /* silent */ }
  }, [ageNum, gender, activity, heightNum]);

  // ── Scroll lock ───────────────────────────────────────────────
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  const openModal = (key: string | null = null) => {
    setFocusKey(key); setSaved(false); setSaving(false); setShowModal(true);
  };

  // ── Save scan to API ──────────────────────────────────────────
  const handleSave = async () => {
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
      // Refresh history so charts update
      const h = await api<BodyMetricHistory>("/api/body-metrics/history", { method: "GET", auth: true });
      setTrendData({
        all: historyToTrend(h.all), y1: historyToTrend(h.y1),
        m6: historyToTrend(h.m6), m3: historyToTrend(h.m3),
      });
      setSaving(false); setSaved(true);
      setTimeout(() => { setSaved(false); setShowModal(false); }, 1800);
    } catch (err: any) {
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

  if (apiError) return (
    <div style={{
      minHeight: "100vh", background: "#0F0F11", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "Figtree,sans-serif"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.08)",
          borderTopColor: "rgba(255,255,255,0.50)", margin: "0 auto"
        }} />
        <div style={{ fontSize: 15, color: "#FF453A", marginTop: 18, fontWeight: 600 }}>{apiError}</div>
      </div>
    </div>
  );

  if (showStartMeasure) {
    return (
      <div style={{
        minHeight: "100vh", background: C.bg, color: C.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Figtree, sans-serif" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Start Body Measurement</h2>
        <p style={{ fontSize: 16, color: C.sub, marginBottom: 32 }}>No measurements found. Begin by adding your first body scan to track your progress!</p>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "#7B5CF5", color: "#fff", border: "none", borderRadius: 14, fontSize: 17, fontWeight: 600,
            padding: "14px 36px", cursor: "pointer", boxShadow: "0 2px 12px rgba(123,92,245,0.12)",
            transition: "opacity 0.15s"
          }}
          onMouseDown={e => { (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
          onMouseUp={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        >Add First Measurement</button>
      </div>
    );
  }

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
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px 0", opacity: 0.2 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>9:41</span>
              <span style={{ fontSize: 11 }}>●●●</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", padding: "10px 16px 14px" }}>
              <button style={{
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
              <div style={{
                position: "absolute", left: "50%", transform: "translateX(-50%)",
                textAlign: "center", pointerEvents: "none"
              }}>
                <div style={{
                  fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em",
                  color: "rgba(255,255,255,0.88)"
                }}>Body Composition</div>
                <div style={{ fontSize: 11, color: C.dim }}>{lastScanDate}</div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right", flexShrink: 0 }}>
                <div style={{
                  fontSize: 10, color: C.dim, textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>Next scan</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Feb 25</div>
              </div>
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
            const wLast = Number(trendData.all[trendData.all.length - 1][worst.trendKey]);
            const wPrev = Number(trendData.all[trendData.all.length - 2][worst.trendKey]);
            const wImproving = worst.lowerIsBetter ? wLast < wPrev : wLast > wPrev;
            const best = METRICS.filter(m => m.value >= m.ideal[0] && m.value <= m.ideal[1])
              .sort((a, b) => {
                const d = (m: Metric) => Math.abs(m.value - (m.ideal[0] + m.ideal[1]) / 2) / ((m.ideal[1] - m.ideal[0]) / 2);
                return d(a) - d(b);
              })[0];
            const iColor = worstInRange ? C.good : wImproving ? C.warn : C.bad;
            const headline = worstInRange ? "All clear" : goodCount >= 6 ? "Looking good" : "Needs work";
            return (
              <div style={{ padding: "12px 16px 20px", ...fade(0) }}>
                <div style={{
                  borderRadius: 22,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div style={{ padding: "18px 20px 0" }}>
                    <div style={{
                      fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.36)",
                      letterSpacing: "0.01em"
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
            <div style={{ marginBottom: 10, paddingLeft: 2 }}>
              <span style={{
                color: "rgba(255,255,255,0.32)", fontWeight: 600, fontSize: 11,
                letterSpacing: "0.05em", textTransform: "uppercase"
              }}>All Metrics</span>
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

          {/* ── HEALTH PROFILE ── */}
          <div style={{ padding: "20px 16px 0", ...fade(2) }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.28)",
              letterSpacing: "0.05em", textTransform: "uppercase",
              marginBottom: 8, paddingLeft: 2
            }}>Health Profile</div>
            <button
              onClick={() => setShowProfile(true)}
              style={{
                width: "100%", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14,
                padding: "0 16px", cursor: "pointer", fontFamily: "Figtree,sans-serif",
                transition: "background 0.15s", textAlign: "left",
              }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
            >
              {[
                ["Age", `${ageNum} yrs`],
                ["Sex", gender.charAt(0).toUpperCase() + gender.slice(1)],
                ["Height", `${heightNum} cm`],
                ["Activity", activity.charAt(0).toUpperCase() + activity.slice(1)],
              ].map(([label, value], i, arr) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", padding: "13px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"
                }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.50)" }}>{label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.80)" }}>{value}</span>
                    {i === arr.length - 1 && (
                      <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                        <path d="M1 1l5 5-5 5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </button>
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
      </div>

      {/* ── MEASUREMENT MODAL ── */}
      {showModal && (
        <>
          <div onClick={() => setShowModal(false)} style={{
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
            <div onClick={() => setShowModal(false)}
              style={{
                display: "flex", justifyContent: "center",
                padding: "14px 0 4px", cursor: "pointer"
              }}>
              <div style={{
                width: 36, height: 4, borderRadius: 100,
                background: "rgba(255,255,255,0.22)"
              }} />
            </div>
            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 20px 14px"
            }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>
                  {focusKey ? METRICS.find(m => m.key === focusKey)?.label : "New Measurement"}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", marginTop: 2 }}>
                  {focusKey ? "Log a new value for this metric" : "Enter your latest scan values"}
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.09)", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", color: "rgba(255,255,255,0.55)", fontSize: 16,
              }}>✕</button>
            </div>
            {/* Fields */}
            <div style={{ overflowY: "auto", flex: 1, padding: "0 16px 8px" }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 4px 13px", borderBottom: "1px solid rgba(255,255,255,0.06)"
              }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.34)" }}>Date</span>
                <span style={{
                  fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.60)",
                  letterSpacing: "-0.01em"
                }}>Feb 18, 2026</span>
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
                      fontSize: 11, fontWeight: 600,
                      color: "rgba(255,255,255,0.28)", letterSpacing: "0.05em",
                      textTransform: "uppercase", paddingLeft: 2, marginBottom: 7
                    }}>
                      {group.label}
                    </div>
                    <div style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 14, overflow: "hidden"
                    }}>
                      {gm.map((m, i) => {
                        const focused = focusKey === m.key;
                        const val = parseFloat(form[m.key]);
                        const inRange = val >= m.ideal[0] && val <= m.ideal[1];
                        const displayUnit = m.unit === "" ? "bmi" : m.unit;
                        return (
                          <div key={m.key} style={{
                            display: "flex", alignItems: "center",
                            padding: "0 16px", minHeight: 56,
                            borderBottom: i < gm.length - 1
                              ? "1px solid rgba(255,255,255,0.06)" : "none",
                          }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: 14, fontWeight: 500,
                                color: "rgba(255,255,255,0.82)", letterSpacing: "-0.01em"
                              }}>
                                {m.label}
                              </div>
                              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.24)", marginTop: 2 }}>
                                Ideal {m.ideal[0]}–{m.ideal[1]} {displayUnit}
                              </div>
                            </div>
                            <div style={{
                              display: "flex", alignItems: "center",
                              gap: 6, flexShrink: 0
                            }}>
                              <input
                                type="number" step="0.1"
                                value={form[m.key]}
                                autoFocus={focused}
                                onChange={e => setForm(f => ({ ...f, [m.key]: e.target.value }))}
                                style={{
                                  width: m.unit === "kcal" ? 70 : 62, height: 38,
                                  background: "rgba(255,255,255,0.07)",
                                  border: "1px solid rgba(255,255,255,0.10)",
                                  borderRadius: 9, outline: "none",
                                  color: isNaN(val) ? "rgba(255,255,255,0.40)"
                                    : inRange ? "rgba(255,255,255,0.92)" : C.warn,
                                  fontSize: 15, fontWeight: 600,
                                  fontFamily: "Figtree,sans-serif",
                                  textAlign: "right", paddingRight: 9,
                                  transition: "border-color 0.12s, color 0.12s",
                                }}
                                onFocus={e => {
                                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.32)";
                                  e.currentTarget.style.background = "rgba(255,255,255,0.10)";
                                }}
                                onBlur={e => {
                                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                                }}
                              />
                              <span style={{
                                fontSize: 11, fontWeight: 400,
                                color: "rgba(255,255,255,0.30)", minWidth: 28,
                                letterSpacing: "0.01em"
                              }}>{displayUnit}</span>
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
            {/* Save */}
            <div style={{
              padding: "14px 16px 32px",
              borderTop: "1px solid rgba(255,255,255,0.06)"
            }}>
              <button
                onClick={handleSave} disabled={saving || saved}
                style={{
                  width: "100%", height: 50,
                  background: saved ? C.good : "#7B5CF5",
                  border: "none", borderRadius: 14,
                  color: saved ? "#07090F" : "#ffffff",
                  fontSize: 15, fontWeight: 600,
                  cursor: saving || saved ? "default" : "pointer",
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
                      animation: "spin 0.7s linear infinite"
                    }} />
                    Saving…
                  </>
                ) : saved ? "✓  Saved" : "Save Measurement"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── PROFILE SHEET ── */}
      {showProfile && (
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
      )}

    </>
  );
}
