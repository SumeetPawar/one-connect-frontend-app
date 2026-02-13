'use client';



import React, { JSX, useMemo, useState } from 'react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

// Centralized login/API check
useAuthRedirect({ apiCheck: true });

interface Reading {
  date: string;
  weight: number;
  bmi: number;
  bodyFat: number;
  muscle: number | null;
  visceralFat: number | null;
  water: number | null;
  bmr: number | null;
  boneMass: number | null;
}

interface ChangeIndicator {
  symbol: string;
  value: string;
  color: string;
}

interface SparkGraphProps {
  data: Reading[];
  metricKey: keyof Reading;
  label: string;
  unit: string;
}

interface GraphPoint {
  x: number;
  y: number;
  v: number;
  date: string;
  i: number;
}

// Add this interface at the top with your other interfaces
interface GraphTab {
  key: keyof Reading;
  label: string;
}

// ---------------- helpers (pure) ----------------

function getChange(current: number | null | undefined, prev: number | null | undefined): ChangeIndicator {
  if (current == null || prev == null) return { symbol: '●', value: '', color: '#94a3b8' };
  const diff = current - prev;
  if (Math.abs(diff) < 0.1) return { symbol: '—', value: '', color: '#94a3b8' };
  return {
    symbol: diff > 0 ? '▲' : '▼',
    value: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`,
    color: diff > 0 ? '#ef4444' : '#10b981'
  };
}

function getBMICategory(bmi: number | null | undefined): string
 {
  if (bmi == null) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function getBMIColor(bmi: number | null | undefined): string
 {
  if (bmi == null) return '#94a3b8';
  if (bmi < 18.5) return '#60a5fa';
  if (bmi < 25) return '#10b981';
  if (bmi < 30) return '#f59e0b';
  return '#ef4444';
}

function sortByDateAsc(arr: Reading[]) {
  return arr.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Lightweight self-tests (run only in test env)
export const __test__ = { getChange, getBMICategory, getBMIColor, sortByDateAsc };
if (typeof window === 'undefined' && process?.env?.NODE_ENV === 'test') {
  // Basic sanity checks
  const t1 = getBMICategory(24.0);
  if (t1 !== 'Normal') throw new Error('getBMICategory test failed');
  const t2 = getBMIColor(31.0);
  if (t2 !== '#ef4444') throw new Error('getBMIColor test failed');
  const t3 = getChange(10, 11);
  if (t3.symbol !== '▼') throw new Error('getChange test failed');
}

// ---------------- mini chart ----------------

function SparkGraph({ data, metricKey, label, unit }: SparkGraphProps): JSX.Element | null
 {
  if (!data || data.length === 0) return null;

  const values = data.map((d) => d[metricKey]).filter((v): v is number => typeof v === 'number');

  if (values.length === 0) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const healthyMin = 18.5;
  const healthyMax = 24.9;

  const W = 320;
  const H = 132;
  const PAD_X = 10;
  const PAD_Y = 10;

  const points = data
  .map((d, i) => {
    const v = d[metricKey];
    if (v == null || typeof v !== 'number') return null;
    const x = PAD_X + (i * (W - PAD_X * 2)) / Math.max(data.length - 1, 1);
    const y = PAD_Y + (1 - (v - min) / range) * (H - PAD_Y * 2);
    return { x, y, v, date: d.date, i };
  })
  .filter((p): p is GraphPoint => p !== null);

  const pathD = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  const last = points[points.length - 1];

  // Healthy band positions (only BMI)
  const bandTop = PAD_Y + (1 - (healthyMax - min) / range) * (H - PAD_Y * 2);
  const bandBottom = PAD_Y + (1 - (healthyMin - min) / range) * (H - PAD_Y * 2);
  const bandY = Math.min(bandTop, bandBottom);
  const bandH = Math.abs(bandBottom - bandTop);

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '16px',
        padding: '14px',
        marginBottom: '12px',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '10px',
          marginBottom: '10px'
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: '700',
            color: 'rgba(255,255,255,0.72)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px'
          }}
        >
          {label} Over Time
        </div>
        {last && (
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#c4b5fd'
            }}
          >
            {last.v}
            {unit}
            <span
              style={{
                marginLeft: '8px',
                fontSize: '10px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.45)'
              }}
            >
              {new Date(last.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      <div
        style={{
          background: 'rgba(124, 58, 237, 0.06)',
          border: '1px solid rgba(124, 58, 237, 0.12)',
          borderRadius: '14px',
          padding: '10px'
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="140" style={{ display: 'block' }}>
          {metricKey === 'bmi' && bandH > 0 && (
            <rect
              x="0"
              y={bandY}
              width={W}
              height={bandH}
              rx="8"
              fill="rgba(16, 185, 129, 0.10)"
              stroke="rgba(16, 185, 129, 0.25)"
              strokeDasharray="4 4"
            />
          )}

          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1="0"
              x2={W}
              y1={PAD_Y + t * (H - PAD_Y * 2)}
              y2={PAD_Y + t * (H - PAD_Y * 2)}
              stroke="rgba(255,255,255,0.06)"
            />
          ))}

          {/* glow */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(124, 58, 237, 0.35)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* line */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(168, 85, 247, 0.95)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p: GraphPoint) => (
            <circle
              key={p.i}
              cx={p.x}
              cy={p.y}
              r={p.i === points.length - 1 ? 5 : 3.5}
              fill={p.i === points.length - 1 ? '#ffffff' : 'rgba(196, 181, 253, 0.9)'}
              stroke="rgba(124, 58, 237, 0.9)"
              strokeWidth={p.i === points.length - 1 ? 3 : 2}
            />
          ))}
        </svg>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.45)',
            marginTop: '6px'
          }}
        >
          <span>
            {min.toFixed(1)}
            {unit}
          </span>
          {metricKey === 'bmi' && (
            <span style={{ color: 'rgba(16, 185, 129, 0.95)' }}>Healthy {healthyMin}–{healthyMax}</span>
          )}
          <span>
            {max.toFixed(1)}
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function BodyComposition() {
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [showMoreMetrics, setShowMoreMetrics] = useState(false);
  const [selectedGraph, setSelectedGraph] = useState<keyof Reading>('bmi');

  // Form inputs
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscle, setMuscle] = useState('');
  const [visceralFat, setVisceralFat] = useState('');
  const [water, setWater] = useState('');
  const [bmr, setBmr] = useState('');
  const [boneMass, setBoneMass] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Historical data (sample)
const [readings, setReadings] = useState<Reading[]>([
    {
      date: '2025-12-15',
      weight: 74.5,
      bmi: 24.6,
      bodyFat: 23.5,
      muscle: 37.8,
      visceralFat: 9,
      water: 56.9,
      bmr: 1660,
      boneMass: 3.1
    },
    {
      date: '2025-12-22',
      weight: 74.0,
      bmi: 24.4,
      bodyFat: 23.1,
      muscle: 38.0,
      visceralFat: 9,
      water: 57.1,
      bmr: 1665,
      boneMass: 3.1
    },
    {
      date: '2025-12-29',
      weight: 73.6,
      bmi: 24.2,
      bodyFat: 22.7,
      muscle: 38.2,
      visceralFat: 8,
      water: 57.4,
      bmr: 1670,
      boneMass: 3.2
    },
    {
      date: '2026-01-05',
      weight: 73.2,
      bmi: 24.0,
      bodyFat: 22.4,
      muscle: 38.4,
      visceralFat: 8,
      water: 57.6,
      bmr: 1675,
      boneMass: 3.2
    },
    {
      date: '2026-01-10',
      weight: 73.0,
      bmi: 23.9,
      bodyFat: 22.2,
      muscle: 38.5,
      visceralFat: 8,
      water: 57.8,
      bmr: 1680,
      boneMass: 3.2
    },
    {
      date: '2026-01-13',
      weight: 72.7,
      bmi: 23.8,
      bodyFat: 21.9,
      muscle: 38.7,
      visceralFat: 7,
      water: 58.2,
      bmr: 1685,
      boneMass: 3.2
    },
    {
      date: '2026-01-17',
      weight: 72.4,
      bmi: 24.1,
      bodyFat: 21.8,
      muscle: 38.8,
      visceralFat: 7,
      water: 58.5,
      bmr: 1690,
      boneMass: 3.2
    }
  ]);

  const readingsSorted = useMemo(() => sortByDateAsc(readings), [readings]);
  const latest = readingsSorted[readingsSorted.length - 1] || {};
  const previous = readingsSorted[readingsSorted.length - 2] || {};

  const saveReading = () => {
    if (!weight || !bmi || !bodyFat) return;

    const newReading = {
      date,
      weight: parseFloat(weight),
      bmi: parseFloat(bmi),
      bodyFat: parseFloat(bodyFat),
      muscle: muscle ? parseFloat(muscle) : null,
      visceralFat: visceralFat ? parseFloat(visceralFat) : null,
      water: water ? parseFloat(water) : null,
      bmr: bmr ? parseFloat(bmr) : null,
      boneMass: boneMass ? parseFloat(boneMass) : null
    };

    setReadings((prevList) => sortByDateAsc([...prevList, newReading]));
    resetForm();
    setShowBottomSheet(false);
  };

  const resetForm = () => {
    setWeight('');
    setBmi('');
    setBodyFat('');
    setMuscle('');
    setVisceralFat('');
    setWater('');
    setBmr('');
    setBoneMass('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowMoreMetrics(false);
  };

  const getInsight = () => {
    const bmiChange = (latest.bmi ?? 0) - (previous.bmi ?? 0);
    const fatChange = (latest.bodyFat ?? 0) - (previous.bodyFat ?? 0);
    const muscleChange = (latest.muscle ?? 0) - (previous.muscle ?? 0);
    const weightChange = (latest.weight ?? 0) - (previous.weight ?? 0);

    if (Math.abs(bmiChange) < 0.1 && fatChange < 0) return 'BMI stable, body fat decreasing — good progress.';
    if (weightChange < 0 && muscleChange < 0) return 'Weight down but muscle also down — add strength training.';
    if (bmiChange > 0 && muscleChange > 0) return 'Weight gain from muscle — excellent progress.';
    if (Math.abs(bmiChange) < 0.3) return 'Maintaining steady composition — keep it up.';
    return 'Track regularly to see trends over time.';
  };

  const selectedUnit = selectedGraph === 'weight' ? 'kg' : selectedGraph === 'bmi' ? '' : '%';
  const selectedLabel =
    selectedGraph === 'bmi'
      ? 'BMI'
      : selectedGraph === 'weight'
        ? 'Weight'
        : selectedGraph === 'bodyFat'
          ? 'Body Fat'
          : 'Muscle';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', padding: 0 }}>
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.15) 0%, rgba(15, 23, 42, 1) 100%)',
          padding: '16px',
          minHeight: '100vh'
        }}
      >
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          {/* Header */}
          <div
            style={{
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <button
                  onClick={() => window.history.back()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#a855f7',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label="Go back"
                >
                  ←
                </button>
                <h1
                  style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#ffffff',
                    margin: 0,
                    letterSpacing: '-0.02em',
                    lineHeight: '1.1'
                  }}
                >
                  Body Composition
                </h1>
              </div>
              <p
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.45)',
                  margin: '0 0 0 26px',
                  fontWeight: '500'
                }}
              >
                From machine readings
              </p>
            </div>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px'
              }}
              aria-label="Info"
              onClick={() => alert('Tip: Measure at the same time of day for best comparisons.')}
            >
              ℹ️
            </button>
          </div>

          {/* Snapshot */}
          <div
            style={{
              background: 'rgba(124, 58, 237, 0.1)',
              border: '1px solid rgba(124, 58, 237, 0.25)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '12px'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {/* BMI */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', fontWeight: '500' }}>
                  BMI
                </div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: getBMIColor(latest.bmi),
                    lineHeight: '1',
                    marginBottom: '4px'
                  }}
                >
                  {latest.bmi}
                </div>
                <div style={{ fontSize: '9px', color: getBMIColor(latest.bmi), fontWeight: '600', marginBottom: '4px' }}>
                  ● {getBMICategory(latest.bmi)}
                </div>
                <div style={{ fontSize: '9px', color: getChange(latest.bmi, previous.bmi).color, fontWeight: '600' }}>
                  {getChange(latest.bmi, previous.bmi).symbol} {getChange(latest.bmi, previous.bmi).value}
                </div>
              </div>

              {/* Weight */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', fontWeight: '500' }}>
                  Weight
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', lineHeight: '1', marginBottom: '4px' }}>
                  {latest.weight}
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>kg</span>
                </div>
                <div
                  style={{
                    fontSize: '9px',
                    color: getChange(latest.weight, previous.weight).color,
                    fontWeight: '600',
                    marginTop: '13px'
                  }}
                >
                  {getChange(latest.weight, previous.weight).symbol} {getChange(latest.weight, previous.weight).value}kg
                </div>
              </div>

              {/* Body Fat */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', fontWeight: '500' }}>
                  Body Fat
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', lineHeight: '1', marginBottom: '4px' }}>
                  {latest.bodyFat}
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>%</span>
                </div>
                <div
                  style={{
                    fontSize: '9px',
                    color: getChange(latest.bodyFat, previous.bodyFat).color,
                    fontWeight: '600',
                    marginTop: '13px'
                  }}
                >
                  {getChange(latest.bodyFat, previous.bodyFat).symbol} {getChange(latest.bodyFat, previous.bodyFat).value}%
                </div>
              </div>
            </div>
          </div>

          {/* Graph Selector */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '12px',
              overflowX: 'hidden',
              padding: '2px 0'
            }}
          >
            {([
              { key: 'bmi', label: 'BMI' },
              { key: 'weight', label: 'Weight' },
              { key: 'bodyFat', label: 'Body Fat %' },
              { key: 'muscle', label: 'Muscle %' }
            ] as const).map((tab: GraphTab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedGraph(tab.key)}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: selectedGraph === tab.key ? '#ffffff' : 'rgba(255,255,255,0.6)',
                  background:
                    selectedGraph === tab.key
                      ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                      : 'rgba(255,255,255,0.05)',
                  border: selectedGraph === tab.key ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Graph */}
          <SparkGraph data={readingsSorted} metricKey={selectedGraph} label={selectedLabel} unit={selectedUnit} />

          {/* Insight */}
          <div
            style={{
              background: 'rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '12px'
            }}
          >
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: '1.4', fontWeight: '600' }}>
              💡 {getInsight()}
            </p>
          </div>

          {/* History */}
          <div
            style={{
              background: 'rgba(124, 58, 237, 0.06)',
              border: '1px solid rgba(124, 58, 237, 0.15)',
              borderRadius: '14px',
              padding: '14px',
              marginBottom: '14px'
            }}
          >
            <button
              onClick={() => setHistoryOpen((v) => !v)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
              aria-expanded={historyOpen}
              aria-controls="history-panel"
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'rgba(255,255,255,0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                History
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.45)' }}>
                  {readingsSorted.length} readings
                </div>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.65)',
                    transform: historyOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                  aria-hidden="true"
                >
                  ▾
                </div>
              </div>
            </button>

            <div
              id="history-panel"
              style={{
                marginTop: '10px',
                overflow: 'hidden',
                maxHeight: historyOpen ? '520px' : '0px',
                opacity: historyOpen ? 1 : 0,
                transform: historyOpen ? 'translateY(0)' : 'translateY(-4px)',
                transition: 'max-height 0.28s ease, opacity 0.2s ease, transform 0.2s ease'
              }}
            >
              {readingsSorted
                .slice()
                .reverse()
                .map((reading: Reading) => (
                  <div
                    key={reading.date}
                    style={{
                      padding: '10px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '10px',
                      marginBottom: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: '700', marginBottom: '2px' }}>
                        {new Date(reading.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
                        BMI {reading.bmi} • {reading.weight}kg • Fat {reading.bodyFat}% • Muscle {reading.muscle}%
                      </div>
                    </div>
                    <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.3)' }}>›</div>
                  </div>
                ))}
            </div>

            {!historyOpen && (
              <div style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: '600' }}>
                Tap “History” to expand
              </div>
            )}
          </div>

          {/* Add Reading Button (bottom) */}
          <button
            onClick={() => setShowBottomSheet(true)}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '14px',
              fontWeight: '800',
              color: '#ffffff',
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: '0 10px 24px rgba(124, 58, 237, 0.35)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '18px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 14px 30px rgba(124, 58, 237, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 24px rgba(124, 58, 237, 0.35)';
            }}
          >
            ➕ Add Machine Reading
          </button>

          {/* Bottom Sheet */}
          {showBottomSheet && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'flex-end',
                zIndex: 1000,
                backdropFilter: 'blur(4px)'
              }}
              onClick={() => setShowBottomSheet(false)}
            >
              <div
                style={{
                  background: '#0f172a',
                  borderRadius: '24px 24px 0 0',
                  padding: 0,
                  width: '100%',
                  maxWidth: '440px',
                  margin: '0 auto',
                  boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.5)',
                  animation: 'slideUp 0.3s ease',
                  maxHeight: '80vh',
                  overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    width: '40px',
                    height: '4px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '999px',
                    margin: '12px auto 20px'
                  }}
                />

                <div style={{ padding: '0 24px 24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' }}>
                    Add Machine Reading
                  </h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px', fontWeight: '600' }}>
                    Enter values from your body composition machine
                  </p>

                  {/* Date */}
                  <div style={{ marginBottom: '16px' }}>
                    <label
                      style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.7)',
                        marginBottom: '6px',
                        display: 'block',
                        fontWeight: '700'
                      }}
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '14px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(124, 58, 237, 0.3)',
                        borderRadius: '10px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        color: '#ffffff'
                      }}
                    />
                  </div>

                  {/* Required */}
                  <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {[
                        { label: 'Weight (kg)', value: weight, setter: setWeight },
                        { label: 'BMI', value: bmi, setter: setBmi },
                        { label: 'Body Fat (%)', value: bodyFat, setter: setBodyFat }
                      ].map((field) => (
                        <div key={field.label}>
                          <label
                            style={{
                              fontSize: '11px',
                              color: 'rgba(255,255,255,0.6)',
                              marginBottom: '6px',
                              display: 'block',
                              fontWeight: '700'
                            }}
                          >
                            {field.label} <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="number"
                            value={field.value}
                            onChange={(e) => field.setter(e.target.value)}
                            inputMode="decimal"
                            style={{
                              width: '100%',
                              padding: '10px',
                              fontSize: '14px',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(124, 58, 237, 0.25)',
                              borderRadius: '8px',
                              outline: 'none',
                              boxSizing: 'border-box',
                              color: '#ffffff'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* More metrics */}
                  <button
                    onClick={() => setShowMoreMetrics((v) => !v)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: '800',
                      color: '#a855f7',
                      background: 'transparent',
                      border: '1px solid rgba(124, 58, 237, 0.3)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {showMoreMetrics ? '▼' : '▶'} More metrics
                  </button>

                  {showMoreMetrics && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '12px',
                        marginBottom: '20px',
                        animation: 'fadeIn 0.2s ease'
                      }}
                    >
                      {[
                        { label: 'Muscle (%)', value: muscle, setter: setMuscle },
                        { label: 'Visceral Fat', value: visceralFat, setter: setVisceralFat },
                        { label: 'Water (%)', value: water, setter: setWater },
                        { label: 'BMR (kcal)', value: bmr, setter: setBmr },
                        { label: 'Bone Mass (kg)', value: boneMass, setter: setBoneMass, fullWidth: true }
                      ].map((field) => (
                        <div key={field.label} style={{ gridColumn: field.fullWidth ? '1 / -1' : 'auto' }}>
                          <label
                            style={{
                              fontSize: '11px',
                              color: 'rgba(255,255,255,0.6)',
                              marginBottom: '6px',
                              display: 'block',
                              fontWeight: '700'
                            }}
                          >
                            {field.label}
                          </label>
                          <input
                            type="number"
                            value={field.value}
                            onChange={(e) => field.setter(e.target.value)}
                            inputMode="decimal"
                            style={{
                              width: '100%',
                              padding: '10px',
                              fontSize: '14px',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(124, 58, 237, 0.25)',
                              borderRadius: '8px',
                              outline: 'none',
                              boxSizing: 'border-box',
                              color: '#ffffff'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => {
                        resetForm();
                        setShowBottomSheet(false);
                      }}
                      style={{
                        flex: 1,
                        padding: '14px',
                        fontSize: '15px',
                        fontWeight: '800',
                        color: 'rgba(255,255,255,0.7)',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveReading}
                      disabled={!weight || !bmi || !bodyFat}
                      style={{
                        flex: 1,
                        padding: '14px',
                        fontSize: '15px',
                        fontWeight: '800',
                        color: '#ffffff',
                        background: weight && bmi && bodyFat ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: weight && bmi && bodyFat ? 'pointer' : 'not-allowed',
                        opacity: weight && bmi && bodyFat ? 1 : 0.5
                      }}
                    >
                      Save Reading
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <style>{`
            *, *::before, *::after { box-sizing: border-box; }
            @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
            input[type=number] { -moz-appearance: textfield; }
          `}</style>
        </div>
      </div>
    </div>
  );
}
