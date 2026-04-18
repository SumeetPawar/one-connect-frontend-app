'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/app/components/BottomNav';

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */
type OptionId = string;

interface RsvpOption {
  id: OptionId;
  label: string;
  icon?: string;
  sub?: string;
}

interface RsvpSection {
  id: string;
  step: number;
  question: string;
  hint?: string;
  multi?: boolean;
  required: boolean;
  type: 'choice' | 'chips' | 'rating';
  options: RsvpOption[];
}

/* ─────────────────────────────────────────────
   Form definition
   ───────────────────────────────────────────── */
const SECTIONS: RsvpSection[] = [
  {
    id: 's1',
    step: 1,
    question: 'Will you be attending?',
    required: true,
    multi: false,
    type: 'choice',
    options: [
      { id: 's1-a', label: 'Yes — in person',   icon: '🏃', sub: 'Main campus · Apr 26' },
      { id: 's1-b', label: 'Yes — virtually',    icon: '💻', sub: 'Live stream link sent by email' },
      { id: 's1-c', label: "Can't make it",      icon: '😔', sub: "You'll get the recording" },
    ],
  },
  {
    id: 's2',
    step: 2,
    question: 'Which sessions are you joining?',
    hint: 'Pick all that interest you',
    required: true,
    multi: true,
    type: 'choice',
    options: [
      { id: 's2-a', label: 'Morning 5K Fun Run',          icon: '🏅', sub: '7:00 am · East lawn' },
      { id: 's2-b', label: 'Nutrition Masterclass',       icon: '🥗', sub: '10:00 am · Hall B' },
      { id: 's2-c', label: 'Mental Health & Resilience',  icon: '🧘', sub: '11:30 am · Hall A' },
      { id: 's2-d', label: 'Team HIIT Circuit',           icon: '⚡', sub: '2:00 pm · Gym floor' },
      { id: 's2-e', label: 'Sleep Science Talk',          icon: '😴', sub: '4:00 pm · Auditorium' },
      { id: 's2-f', label: 'Closing Mixer',               icon: '🎉', sub: '6:00 pm · Rooftop' },
    ],
  },
  {
    id: 's3',
    step: 3,
    question: 'T-shirt size',
    hint: 'Unisex fit · distributed on arrival',
    required: true,
    multi: false,
    type: 'chips',
    options: [
      { id: 's3-xs',  label: 'XS'  },
      { id: 's3-s',   label: 'S'   },
      { id: 's3-m',   label: 'M'   },
      { id: 's3-l',   label: 'L'   },
      { id: 's3-xl',  label: 'XL'  },
      { id: 's3-xxl', label: 'XXL' },
    ],
  },
  {
    id: 's4',
    step: 4,
    question: 'Dietary preference',
    hint: 'For catering — choose one',
    required: false,
    multi: false,
    type: 'chips',
    options: [
      { id: 's4-a', label: 'No restriction', icon: '🍽️' },
      { id: 's4-b', label: 'Vegetarian',     icon: '🥦' },
      { id: 's4-c', label: 'Vegan',          icon: '🌱' },
      { id: 's4-d', label: 'Gluten-free',    icon: '🌾' },
      { id: 's4-e', label: 'Dairy-free',     icon: '🥛' },
    ],
  },
  {
    id: 's5',
    step: 5,
    question: 'How excited are you?',
    hint: 'Purely for vibes 😄',
    required: false,
    multi: false,
    type: 'rating',
    options: [
      { id: 's5-1', label: 'Meh',       icon: '😐' },
      { id: 's5-2', label: 'Curious',   icon: '🙂' },
      { id: 's5-3', label: 'Pumped',    icon: '😄' },
      { id: 's5-4', label: 'Hyped',     icon: '🤩' },
      { id: 's5-5', label: 'CAN\'T WAIT', icon: '🚀' },
    ],
  },
];

type Answers = Record<string, string[]>;

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */
const accent = '#5DCFFF';
const accentPurple = '#9D82FF';

function gradientBg(selected: boolean, error: boolean) {
  if (selected) return 'linear-gradient(135deg,rgba(93,207,255,0.16) 0%,rgba(157,130,255,0.12) 100%)';
  if (error)    return 'rgba(255,92,135,0.06)';
  return 'rgba(255,255,255,0.04)';
}
function gradientBorder(selected: boolean, error: boolean) {
  if (selected) return '1.5px solid rgba(93,207,255,0.5)';
  if (error)    return '1px solid rgba(255,92,135,0.3)';
  return '1px solid rgba(255,255,255,0.08)';
}

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */
const CheckIndicator = ({ checked, multi }: { checked: boolean; multi: boolean }) => (
  <div style={{
    width: 20, height: 20,
    borderRadius: multi ? 6 : 10,
    flexShrink: 0,
    background: checked ? `linear-gradient(135deg,${accent},${accentPurple})` : 'transparent',
    border: checked ? 'none' : '1.5px solid #3A3A3C',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s ease',
    boxShadow: checked ? `0 0 10px rgba(93,207,255,0.4)` : 'none',
  }}>
    {checked && (
      <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="11" height="11" viewBox="0 0 11 11" fill="none">
        {multi
          ? <path d="M1.5 5.5l2.8 2.8 5-5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          : <circle cx="5.5" cy="5.5" r="2.8" fill="#fff" />
        }
      </motion.svg>
    )}
  </div>
);

const ChoiceRow = ({
  opt, selected, error, multi, onToggle, index,
}: {
  opt: RsvpOption; selected: boolean; error: boolean; multi: boolean;
  onToggle: () => void; index: number;
}) => (
  <motion.button
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.04, duration: 0.2 }}
    whileTap={{ scale: 0.975 }}
    onClick={onToggle}
    className="flex items-center text-left w-full"
    style={{
      borderRadius: 14,
      padding: '12px 14px',
      gap: 12,
      background: gradientBg(selected, error),
      border: gradientBorder(selected, error),
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      boxShadow: selected ? '0 3px 14px rgba(93,207,255,0.12)' : 'none',
    }}
  >
    <CheckIndicator checked={selected} multi={multi} />
    {opt.icon && (
      <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{opt.icon}</span>
    )}
    <div className="flex flex-col" style={{ gap: 1 }}>
      <span style={{
        fontSize: 14, fontWeight: selected ? 700 : 500,
        color: selected ? '#E8F8FF' : '#AEAEB2',
        transition: 'color 0.15s',
      }}>{opt.label}</span>
      {opt.sub && (
        <span style={{ fontSize: 11, color: '#636366' }}>{opt.sub}</span>
      )}
    </div>
  </motion.button>
);

const ChipOption = ({
  opt, selected, error, onToggle, index, showIcon,
}: {
  opt: RsvpOption; selected: boolean; error: boolean;
  onToggle: () => void; index: number; showIcon: boolean;
}) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.85 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.04, duration: 0.18 }}
    whileTap={{ scale: 0.92 }}
    onClick={onToggle}
    className="flex items-center gap-1.5"
    style={{
      borderRadius: 12,
      padding: showIcon ? '9px 14px' : '9px 18px',
      background: gradientBg(selected, error),
      border: gradientBorder(selected, error),
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      boxShadow: selected ? '0 2px 12px rgba(93,207,255,0.15)' : 'none',
    }}
  >
    {showIcon && opt.icon && <span style={{ fontSize: 16, lineHeight: 1 }}>{opt.icon}</span>}
    <span style={{
      fontSize: 13, fontWeight: selected ? 700 : 500,
      color: selected ? '#E8F8FF' : '#AEAEB2',
    }}>{opt.label}</span>
  </motion.button>
);

const RatingRow = ({
  opt, selected, onToggle, index,
}: {
  opt: RsvpOption; selected: boolean; onToggle: () => void; index: number;
}) => (
  <motion.button
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, type: 'spring', damping: 18, stiffness: 300 }}
    whileHover={{ y: -4, scale: 1.08 }}
    whileTap={{ scale: 0.9 }}
    onClick={onToggle}
    className="flex flex-col items-center gap-1"
    style={{
      flex: 1,
      padding: '10px 4px 8px',
      borderRadius: 14,
      background: selected
        ? `linear-gradient(145deg,rgba(93,207,255,0.18),rgba(157,130,255,0.14))`
        : 'rgba(255,255,255,0.04)',
      border: selected ? '1.5px solid rgba(93,207,255,0.45)' : '1px solid rgba(255,255,255,0.07)',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      boxShadow: selected ? '0 4px 16px rgba(93,207,255,0.18)' : 'none',
    }}
  >
    <motion.span
      animate={{ scale: selected ? 1.2 : 1 }}
      transition={{ type: 'spring', damping: 12, stiffness: 400 }}
      style={{ fontSize: 26, lineHeight: 1, filter: selected ? `drop-shadow(0 0 6px rgba(93,207,255,0.5))` : 'none' }}
    >
      {opt.icon}
    </motion.span>
    <span style={{ fontSize: 9, fontWeight: selected ? 800 : 500, color: selected ? accent : '#636366', textAlign: 'center', lineHeight: 1.2 }}>
      {opt.label}
    </span>
  </motion.button>
);

/* ─────────────────────────────────────────────
   Section card
   ───────────────────────────────────────────── */
const SectionCard = ({
  sec, answers, errors, onToggle,
}: {
  sec: RsvpSection;
  answers: Answers;
  errors: Record<string, boolean>;
  onToggle: (secId: string, optId: string) => void;
}) => {
  const sel = answers[sec.id] || [];
  const hasError = errors[sec.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'linear-gradient(160deg,#1C1C1E 0%,#1A1A1C 100%)',
        borderRadius: 20,
        padding: '18px 16px',
        border: hasError ? '1px solid rgba(255,92,135,0.3)' : '1px solid rgba(255,255,255,0.07)',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Step badge + question */}
      <div className="flex items-start gap-3 mb-3">
        <div style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
          background: `linear-gradient(135deg,${accent},${accentPurple})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: '#0A0A0C',
          boxShadow: `0 2px 8px rgba(93,207,255,0.3)`,
        }}>
          {sec.step}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: 14, fontWeight: 700, color: hasError ? '#FF6B8A' : '#F2F2F7',
            lineHeight: 1.35, fontFamily: 'Syne, sans-serif',
          }}>
            {sec.question}
            {sec.required && <span style={{ color: '#FF5C87', marginLeft: 3 }}>*</span>}
          </p>
          {sec.hint && (
            <p style={{ fontSize: 11, color: '#636366', marginTop: 2 }}>{sec.hint}</p>
          )}
          {hasError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 11, color: '#FF5C87', marginTop: 4, fontWeight: 600 }}
            >
              This field is required
            </motion.p>
          )}
        </div>
      </div>

      {/* Options */}
      {sec.type === 'choice' && (
        <div className="flex flex-col gap-2">
          {sec.options.map((opt, i) => (
            <ChoiceRow
              key={opt.id}
              opt={opt}
              selected={sel.includes(opt.id)}
              error={hasError}
              multi={sec.multi || false}
              onToggle={() => onToggle(sec.id, opt.id)}
              index={i}
            />
          ))}
        </div>
      )}

      {sec.type === 'chips' && (
        <div className="flex flex-wrap gap-2">
          {sec.options.map((opt, i) => (
            <ChipOption
              key={opt.id}
              opt={opt}
              selected={sel.includes(opt.id)}
              error={hasError}
              onToggle={() => onToggle(sec.id, opt.id)}
              index={i}
              showIcon={!!opt.icon}
            />
          ))}
        </div>
      )}

      {sec.type === 'rating' && (
        <div className="flex gap-2">
          {sec.options.map((opt, i) => (
            <RatingRow
              key={opt.id}
              opt={opt}
              selected={sel.includes(opt.id)}
              onToggle={() => onToggle(sec.id, opt.id)}
              index={i}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   Success screen
   ───────────────────────────────────────────── */
const SuccessScreen = ({ answers, onEdit }: { answers: Answers; onEdit: () => void }) => {
  const attending = answers['s1']?.includes('s1-a')
    ? 'In person' : answers['s1']?.includes('s1-b') ? 'Virtual' : 'Not attending';
  const sessions = SECTIONS[1].options
    .filter((o) => (answers['s2'] || []).includes(o.id))
    .map((o) => o.label);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 18, stiffness: 260 }}
      className="flex flex-col items-center"
      style={{ padding: '32px 20px 100px', gap: 0 }}
    >
      {/* Confetti burst icon */}
      <motion.div
        initial={{ scale: 0.3, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 10, stiffness: 280, delay: 0.12 }}
        style={{ fontSize: 62, lineHeight: 1, marginBottom: 18,
          filter: 'drop-shadow(0 0 24px rgba(93,207,255,0.4))' }}
      >
        🎉
      </motion.div>

      <h2 style={{
        fontSize: 24, fontWeight: 900, color: '#F2F2F7',
        fontFamily: 'Syne, sans-serif', textAlign: 'center', marginBottom: 6,
      }}>
        You&apos;re registered!
      </h2>
      <p style={{ fontSize: 13, color: '#AEAEB2', textAlign: 'center', marginBottom: 28, lineHeight: 1.5 }}>
        A confirmation is on its way to your email.<br />See you at the Wellness Summit 🏆
      </p>

      {/* Summary card */}
      <div style={{
        width: '100%', borderRadius: 20,
        background: 'linear-gradient(145deg,#1C1C1E,#1A1A1C)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '18px 16px',
        marginBottom: 20,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#636366', letterSpacing: 1, marginBottom: 14 }}>YOUR SUMMARY</p>
        {[
          { label: 'Attendance', value: attending },
          { label: 'Sessions', value: sessions.length ? sessions.join(', ') : '—' },
          { label: 'T-shirt', value: SECTIONS[2].options.find((o) => (answers['s3'] || []).includes(o.id))?.label || '—' },
          { label: 'Dietary', value: SECTIONS[3].options.find((o) => (answers['s4'] || []).includes(o.id))?.label || 'No preference' },
          { label: 'Excitement', value: SECTIONS[4].options.find((o) => (answers['s5'] || []).includes(o.id))?.label || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-start" style={{ marginBottom: 10, gap: 12 }}>
            <span style={{ fontSize: 12, color: '#636366', flexShrink: 0 }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#AEAEB2', textAlign: 'right', lineHeight: 1.4 }}>{value}</span>
          </div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onEdit}
        style={{
          padding: '11px 28px', borderRadius: 30,
          background: 'rgba(93,207,255,0.1)',
          border: '1px solid rgba(93,207,255,0.25)',
          color: accent, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}
      >
        Edit response
      </motion.button>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   Main page
   ───────────────────────────────────────────── */
export default function RsvpPage() {
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors]   = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const toggle = (secId: string, optId: string) => {
    const sec = SECTIONS.find((s) => s.id === secId)!;
    setAnswers((prev) => {
      const cur = prev[secId] || [];
      if (sec.multi) {
        return { ...prev, [secId]: cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId] };
      }
      return { ...prev, [secId]: cur[0] === optId ? [] : [optId] };
    });
    setErrors((e) => ({ ...e, [secId]: false }));
  };

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    let valid = true;
    for (const s of SECTIONS) {
      if (s.required && !(answers[s.id] || []).length) {
        newErrors[s.id] = true;
        valid = false;
      }
    }
    setErrors(newErrors);
    if (!valid) {
      // scroll to first error
      const firstErrId = SECTIONS.find((s) => newErrors[s.id])?.id;
      if (firstErrId) {
        document.getElementById(`sec-${firstErrId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filled = SECTIONS.filter((s) => (answers[s.id] || []).length > 0).length;
  const progress = (filled / SECTIONS.length) * 100;

  const CAPACITY = 200;
  const REGISTERED = 134;

  return (
    <div style={{ minHeight: '100dvh', background: '#111113', color: '#F2F2F7' }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(17,17,19,0.88)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'env(safe-area-inset-top,0) 0 0',
      }}>
        <div style={{ padding: '14px 20px 0' }}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 20,
                background: `rgba(93,207,255,0.12)`,
                border: `1px solid rgba(93,207,255,0.25)`,
                fontSize: 10, fontWeight: 700, color: accent, letterSpacing: 0.8,
                marginBottom: 4,
              }}>
                ✅ RSVP · CLOSES APR 25
              </div>
              <h1 style={{
                fontSize: 18, fontWeight: 900, color: '#F2F2F7',
                fontFamily: 'Syne, sans-serif', lineHeight: 1.2,
              }}>
                Annual Wellness Summit 2026
              </h1>
            </div>
            {/* Capacity pill */}
            <div style={{
              flexShrink: 0,
              padding: '6px 12px', borderRadius: 12,
              background: REGISTERED / CAPACITY > 0.85
                ? 'rgba(255,92,135,0.1)' : 'rgba(76,217,123,0.1)',
              border: REGISTERED / CAPACITY > 0.85
                ? '1px solid rgba(255,92,135,0.28)' : '1px solid rgba(76,217,123,0.28)',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: 14, fontWeight: 800, color: REGISTERED / CAPACITY > 0.85 ? '#FF6B8A' : '#4CD97B',
                lineHeight: 1,
              }}>
                {CAPACITY - REGISTERED}
              </p>
              <p style={{ fontSize: 9, color: '#636366', marginTop: 1 }}>spots left</p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12 }}>
            <div style={{
              flex: 1, height: 3, borderRadius: 3,
              background: 'rgba(255,255,255,0.07)', overflow: 'hidden',
            }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  height: '100%', borderRadius: 3,
                  background: `linear-gradient(90deg,${accent},${accentPurple})`,
                }}
              />
            </div>
            <span style={{ fontSize: 10, color: '#636366', whiteSpace: 'nowrap' }}>
              {filled}/{SECTIONS.length}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <SuccessScreen
              answers={answers}
              onEdit={() => { setSubmitted(false); setAnswers({}); setErrors({}); }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            ref={formRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: '16px 16px 120px', display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {/* Event info strip */}
            <div style={{
              borderRadius: 16,
              overflow: 'hidden',
              position: 'relative',
              height: 140,
              marginBottom: 4,
            }}>
              <img
                src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=80&fit=crop"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.55 }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top,rgba(17,17,19,0.95) 0%,rgba(17,17,19,0.2) 100%)',
              }} />
              <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
                <div className="flex gap-3">
                  {[
                    { icon: '📅', text: 'April 26, 2026' },
                    { icon: '📍', text: 'Main Campus' },
                    { icon: '👥', text: `${REGISTERED} registered` },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-1">
                      <span style={{ fontSize: 12 }}>{icon}</span>
                      <span style={{ fontSize: 11, color: '#AEAEB2', fontWeight: 600 }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section cards */}
            {SECTIONS.map((sec) => (
              <div key={sec.id} id={`sec-${sec.id}`}>
                <SectionCard
                  sec={sec}
                  answers={answers}
                  errors={errors}
                  onToggle={toggle}
                />
              </div>
            ))}

            {/* Submit */}
            <div style={{ marginTop: 8 }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                className="w-full"
                style={{
                  padding: '15px',
                  borderRadius: 16,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: 800,
                  fontFamily: 'Syne, sans-serif',
                  letterSpacing: 0.3,
                  background: `linear-gradient(135deg,${accent} 0%,${accentPurple} 100%)`,
                  color: '#0A0A0C',
                  boxShadow: '0 6px 24px rgba(93,207,255,0.35)',
                }}
              >
                Submit Registration →
              </motion.button>
              <p style={{ fontSize: 10, color: '#636366', textAlign: 'center', marginTop: 8 }}>
                * required fields · you can edit your response after submitting
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav active="feed" />
    </div>
  );
}
