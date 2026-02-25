import { useState, useEffect, useRef, useCallback } from "react";
// ─── Icons — inline SVGs (lucide style, strokeWidth 1.5) ─────────────────────
// In your Next.js app swap these for the lucide-react package imports

const Info = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);
const X = ({ size = 12, color = "currentColor", strokeWidth = 1.8 }: { size?: number; color?: string; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const Square = ({ size = 9, fill = "none", strokeWidth = 1.5 }: { size?: number; fill?: string; strokeWidth?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill !== "none" ? "none" : "currentColor"} strokeWidth={strokeWidth} strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
  </svg>
);
const BellOff = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.73 21a2 2 0 01-3.46 0"/><path d="M18.63 13A17.9 17.9 0 0118 8"/><path d="M6.26 6.26A5.86 5.86 0 006 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 00-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const Armchair = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 9V6a2 2 0 00-2-2H7a2 2 0 00-2 2v3"/><path d="M3 11v5a2 2 0 002 2h14a2 2 0 002-2v-5a2 2 0 00-4 0v2H7v-2a2 2 0 00-4 0z"/><line x1="5" y1="18" x2="5" y2="21"/><line x1="19" y1="18" x2="19" y2="21"/>
  </svg>
);
const Wind = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.7 7.7a2.5 2.5 0 111.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1111 8H2"/><path d="M12.6 19.4A2 2 0 1014 16H2"/>
  </svg>
);
const Heart = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const RefreshCw = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
  </svg>
);
const Globe = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);

// ─── Types ─────────────────────────────────────────────────────────────────

type PhaseDir = "expand" | "shrink" | "hold";

interface Phase {
  label: "Inhale" | "Hold" | "Exhale";
  duration: number;
  dir: PhaseDir;
}

interface Technique {
  id: string;
  name: string;
  tagline: string;
  description: string;
  accent: string;
  guided?: boolean;
  comingSoon?: boolean;
  phases: Phase[];
}

interface TipItem {
  icon: React.ReactNode;
  title: string;
  detail: string;
}

interface TipSection {
  label: string;
  items: TipItem[];
}

interface BreathOrbProps {
  phase: Phase | null;
  accent: string;
  isActive: boolean;
  phaseKey: number;
  phaseProg: number;
  onTap: (() => void) | null;
  cue: string;
  cueVisible: boolean;
  labelReady: boolean;
}

// ─── Techniques ────────────────────────────────────────────────────────────

const TECHNIQUES: Technique[] = [
  {
    id: "box",
    name: "Box Breathing",
    tagline: "Calm · Focus · Reset",
    description: "Practiced by Navy SEALs and surgeons. Four equal sides create perfect mental stillness.",
    accent: "#5E5CE6",
    phases: [
      { label: "Inhale", duration: 4, dir: "expand" },
      { label: "Hold",   duration: 4, dir: "hold"   },
      { label: "Exhale", duration: 4, dir: "shrink" },
      { label: "Hold",   duration: 4, dir: "hold"   },
    ],
  },
  {
    id: "478",
    name: "4 · 7 · 8",
    tagline: "Sleep · Anxiety · Relief",
    description: "Dr. Andrew Weil's natural tranquiliser. The long exhale activates the parasympathetic system.",
    accent: "#30A0C8",
    phases: [
      { label: "Inhale", duration: 4, dir: "expand" },
      { label: "Hold",   duration: 7, dir: "hold"   },
      { label: "Exhale", duration: 8, dir: "shrink" },
    ],
  },
  {
    id: "coherent",
    name: "Coherent",
    tagline: "Balance · Flow · HRV",
    description: "Five breaths per minute synchronises heart rate variability — perfect between meetings.",
    accent: "#34C759",
    phases: [
      { label: "Inhale", duration: 5, dir: "expand" },
      { label: "Exhale", duration: 5, dir: "shrink" },
    ],
  },
  {
    id: "power",
    name: "Power Breath",
    tagline: "Energy · Clarity · Alert",
    description: "Sharp inhale, controlled exhale. A desk-side oxygen boost in under 60 seconds.",
    accent: "#FF9F0A",
    phases: [
      { label: "Inhale", duration: 2, dir: "expand" },
      { label: "Hold",   duration: 1, dir: "hold"   },
      { label: "Exhale", duration: 4, dir: "shrink" },
    ],
  },
  {
    id: "guided",
    name: "Guided",
    tagline: "Coming soon",
    description: "A full guided meditation with voice — body, breath, and mind. Available soon.",
    accent: "#BF5AF2",
    guided: true,
    comingSoon: true,
    phases: [
      { label: "Inhale", duration: 4, dir: "expand" },
      { label: "Exhale", duration: 6, dir: "shrink" },
    ],
  },
];

// ─── Tips data ──────────────────────────────────────────────────────────────

const TIPS: TipSection[] = [
  {
    label: "Before you start",
    items: [
      { icon: <BellOff size={16} />,  title: "Turn on Do Not Disturb",    detail: "One buzz breaks your calm. Silence your phone before you begin." },
      { icon: <Armchair size={16} />, title: "Sit up, relax your jaw",     detail: "Sit slightly forward, feet flat. Slouching makes it harder to breathe deeply." },
      { icon: <Wind size={16} />, title: "Breathe through your nose", detail: "Nasal breathing filters air, adds nitric oxide, and slows your breath naturally — all of which calm the nervous system. Mouth breathing bypasses this and is linked to higher cortisol. Exhale through your mouth only if you feel anxious or need to release tension faster." },
    ],
  },
  {
    label: "Good to know",
    items: [
      { icon: <Heart size={16} />,      title: "Breathing out calms you down", detail: "A long exhale signals your body to relax. You'll feel it within the first minute." },
      { icon: <RefreshCw size={16} />,  title: "A little every day goes far",  detail: "3 minutes daily is more effective than 30 minutes once a week. Small and consistent wins." },
      { icon: <Globe size={16} />,      title: "Do it anywhere",               detail: "At your desk, on the bus, in bed. Nobody can tell you're doing it." },
    ],
  },
];

// ─── Web Audio ─────────────────────────────────────────────────────────────

interface AudioNodes {
  base?: OscillatorNode;
  schumann?: OscillatorNode;
  baseGain?: GainNode;
  [key: string]: AudioNode | undefined;
}

function useAudio() {
  const ctxRef     = useRef<AudioContext | null>(null);
  const bedRef     = useRef<boolean>(false);
  const activeCues = useRef<Array<{ gain: GainNode; osc: OscillatorNode }>>([]);

  const ensure = useCallback((): AudioContext => {
    if (!ctxRef.current)
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const stopCues = useCallback((ctx: AudioContext) => {
    const now = ctx.currentTime;
    activeCues.current.forEach(({ gain, osc }) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.stop(now + 0.35);
      } catch (_) {}
    });
    activeCues.current = [];
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tone = useCallback((
    ctx: AudioContext, freq: number, vol: number,
    attack: number, decay: number, dur: number
  ) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    const now  = ctx.currentTime;
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + attack);
    gain.gain.linearRampToValueAtTime(vol * 0.6, now + attack + decay);
    gain.gain.linearRampToValueAtTime(0, now + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.1);
    return { osc, gain };
  }, []);

  const startBed = useCallback(() => {
    if (bedRef.current) return;
    try {
      const ctx = ensure();
      const now = ctx.currentTime;
      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0, now);
      droneGain.gain.linearRampToValueAtTime(0.030, now + 4);
      droneGain.connect(ctx.destination);
      [432, 432.7].forEach(f => {
        const o = ctx.createOscillator();
        o.type = "sine"; o.frequency.value = f;
        o.connect(droneGain); o.start(now);
      });

      const len = ctx.sampleRate * 6;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d   = buf.getChannelData(0);
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (let i = 0; i < len; i++) {
        const w = Math.random()*2-1;
        b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
        b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
        b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
        d[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.08;
        b6=w*0.115926;
      }
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const lp  = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 400;
      const pg  = ctx.createGain();
      pg.gain.setValueAtTime(0, now); pg.gain.linearRampToValueAtTime(0.012, now+3);
      src.connect(lp); lp.connect(pg); pg.connect(ctx.destination);
      src.start(now);
      bedRef.current = true;
    } catch (_) {}
  }, [ensure]);

  const playPhase = useCallback((label: string, duration: number) => {
    startBed();
    try {
      const ctx = ensure();
      const now = ctx.currentTime;
      const dur = duration || 4;
      stopCues(ctx);

      if (label === "Inhale") {
        const fundamental = ctx.createOscillator();
        const fGain       = ctx.createGain();
        fundamental.type = "sine";
        fundamental.frequency.setValueAtTime(164.8, now);
        fundamental.frequency.linearRampToValueAtTime(246.9, now + dur * 0.85);
        fGain.gain.setValueAtTime(0, now);
        fGain.gain.linearRampToValueAtTime(0.055, now + 0.4);
        fGain.gain.linearRampToValueAtTime(0.030, now + dur * 0.8);
        fGain.gain.linearRampToValueAtTime(0, now + dur);
        fundamental.connect(fGain); fGain.connect(ctx.destination);
        fundamental.start(now); fundamental.stop(now + dur + 0.1);

        const oct = ctx.createOscillator();
        const oGain = ctx.createGain();
        oct.type = "sine";
        oct.frequency.setValueAtTime(329.6, now);
        oct.frequency.linearRampToValueAtTime(493.8, now + dur * 0.85);
        oGain.gain.setValueAtTime(0, now); oGain.gain.linearRampToValueAtTime(0.020, now + 0.5);
        oGain.gain.linearRampToValueAtTime(0, now + dur * 0.9);
        oct.connect(oGain); oGain.connect(ctx.destination);
        oct.start(now); oct.stop(now + dur + 0.1);
        activeCues.current = [{ osc: fundamental, gain: fGain }, { osc: oct, gain: oGain }];

      } else if (label === "Exhale") {
        const fundamental = ctx.createOscillator();
        const fGain       = ctx.createGain();
        fundamental.type = "sine";
        fundamental.frequency.setValueAtTime(246.9, now);
        fundamental.frequency.linearRampToValueAtTime(164.8, now + dur * 0.9);
        fGain.gain.setValueAtTime(0, now);
        fGain.gain.linearRampToValueAtTime(0.052, now + 0.25);
        fGain.gain.linearRampToValueAtTime(0.025, now + dur * 0.6);
        fGain.gain.linearRampToValueAtTime(0, now + dur);
        fundamental.connect(fGain); fGain.connect(ctx.destination);
        fundamental.start(now); fundamental.stop(now + dur + 0.1);

        const fifth = ctx.createOscillator();
        const fifthGain = ctx.createGain();
        fifth.type = "sine"; fifth.frequency.value = 369.9;
        fifthGain.gain.setValueAtTime(0, now); fifthGain.gain.linearRampToValueAtTime(0.016, now + 0.3);
        fifthGain.gain.linearRampToValueAtTime(0, now + dur * 0.75);
        fifth.connect(fifthGain); fifthGain.connect(ctx.destination);
        fifth.start(now); fifth.stop(now + dur + 0.1);
        activeCues.current = [{ osc: fundamental, gain: fGain }, { osc: fifth, gain: fifthGain }];

      } else {
        const hold  = ctx.createOscillator();
        const hGain = ctx.createGain();
        hold.type = "sine"; hold.frequency.value = 196.0;
        hGain.gain.setValueAtTime(0, now);
        hGain.gain.linearRampToValueAtTime(0.038, now + 0.5);
        hGain.gain.setValueAtTime(0.038, now + dur - 0.6);
        hGain.gain.linearRampToValueAtTime(0, now + dur);
        hold.connect(hGain); hGain.connect(ctx.destination);
        hold.start(now); hold.stop(now + dur + 0.1);

        const shimmer = ctx.createOscillator();
        const sGain   = ctx.createGain();
        shimmer.type = "sine"; shimmer.frequency.value = 293.7;
        sGain.gain.setValueAtTime(0, now); sGain.gain.linearRampToValueAtTime(0.012, now + 0.8);
        sGain.gain.linearRampToValueAtTime(0, now + dur - 0.5);
        shimmer.connect(sGain); sGain.connect(ctx.destination);
        shimmer.start(now); shimmer.stop(now + dur + 0.1);
        activeCues.current = [{ osc: hold, gain: hGain }, { osc: shimmer, gain: sGain }];
      }
    } catch (_) {}
  }, [startBed, ensure, stopCues]);

  return { playPhase };
}

// ─── useGuide ───────────────────────────────────────────────────────────────

function useGuide(enabled: boolean, techName: string) {
  const [phrase, setPhrase]     = useState<string>("");
  const [speaking, setSpeaking] = useState<boolean>(false);
  const lastCycleRef = useRef<number>(-1);
  const utterRef     = useRef<SpeechSynthesisUtterance | null>(null);
  const voiceRef     = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const pick = () => {
      const voices   = window.speechSynthesis?.getVoices() || [];
      const preferred = ["Google UK English Female","Samantha","Karen","Moira","Tessa","Victoria","Fiona"];
      for (const name of preferred) {
        const v = voices.find(v => v.name === name);
        if (v) { voiceRef.current = v; return; }
      }
      voiceRef.current = voices.find(v => v.lang?.startsWith("en")) || voices[0] || null;
    };
    pick();
    window.speechSynthesis?.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", pick);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    utterRef.current = null;
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.82; utter.pitch = 0.95; utter.volume = 0.88;
    if (voiceRef.current) utter.voice = voiceRef.current;
    utter.onstart = () => setSpeaking(true);
    utter.onend   = () => { setSpeaking(false); utterRef.current = null; };
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, []);

  const fetchPhrase = useCallback(async (cycle: number, name: string): Promise<string> => {
    try {
      const moment = cycle === 0 ? "session beginning"
                   : cycle === 1 ? "second cycle"
                   : cycle % 5 === 0 ? "fifth cycle milestone"
                   : "ongoing session";
      const res  = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 60,
          system: `You are a meditation guide. Respond with ONE short calming phrase (8–12 words maximum). Present tense, gentle, non-commanding. No quotes, no punctuation except a period.`,
          messages: [{ role: "user", content: `Technique: ${name}. Moment: ${moment}. Cycle: ${cycle + 1}. Give one phrase.` }]
        })
      });
      const data = await res.json();
      const text = data?.content?.[0]?.text?.trim();
      if (text) { setPhrase(text); return text; }
    } catch (_) {}
    const fallbacks = [
      "Let your body soften with each breath.",
      "Nothing to do right now but breathe.",
      "You are exactly where you need to be.",
      "Each breath slows your world a little.",
      "Let the exhale take the weight with it.",
    ];
    const f = fallbacks[cycle % fallbacks.length];
    setPhrase(f);
    return f;
  }, []);

  const onCycle = useCallback(async (cycle: number) => {
    if (!enabled) return;
    if (lastCycleRef.current === cycle) return;
    lastCycleRef.current = cycle;
    if (cycle > 0 && cycle % 2 !== 0 && cycle > 3) return;
    const text = await fetchPhrase(cycle, techName);
    if (text && enabled) speak(text);
  }, [enabled, fetchPhrase, speak, techName]);

  return { phrase, speaking, onCycle, stop };
}

// ─── useGuidedSession ───────────────────────────────────────────────────────

interface GuidedSessionReturn {
  current: string;
  loading: boolean;
  speaking: boolean;
  progress: number;
  start: () => void;
  stop: () => void;
}

function useGuidedSession(): GuidedSessionReturn {
  const [current, setCurrent]   = useState<string>("");
  const [loading, setLoading]   = useState<boolean>(false);
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const activeRef = useRef<boolean>(false);

  const stopAll = useCallback(() => {
    activeRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setSpeaking(false);
    setCurrent("");
    setProgress(0);
  }, []);

  const start = useCallback(() => {
    stopAll();
    activeRef.current = true;
    setLoading(true);
    setCurrent("");

    const audio = new Audio("/audio/guided-meditation.mp3");
    audioRef.current = audio;

    audio.addEventListener("canplaythrough", () => {
      if (!activeRef.current) return;
      setLoading(false);
      setSpeaking(true);
      setCurrent("Close your eyes and follow the voice.");
      audio.play().catch(() => {
        setLoading(false);
        setCurrent("Tap the orb to begin.");
      });
    }, { once: true });

    audio.addEventListener("timeupdate", () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    });

    audio.addEventListener("ended", () => {
      setSpeaking(false);
      setProgress(1);
      setCurrent("Gently open your eyes.");
    }, { once: true });

    audio.addEventListener("error", () => {
      setLoading(false);
      setSpeaking(false);
      setCurrent("Audio file not found in /public/audio/");
    }, { once: true });

    audio.load();
  }, [stopAll]);

  return { current, loading, speaking, progress, start, stop: stopAll };
}

// ─── BreathOrb ──────────────────────────────────────────────────────────────

// ─── Mindful cues — technique-specific, neuroscience-grounded ──────────────

const CUES: Record<string, string[]> = {
  box: [
    "Keep your gaze on the centre of the orb.",
    "Let your jaw unclench. Let your shoulders drop.",
    "Your only task right now is to stay here.",
    "Notice the stillness between each breath.",
    "You are lowering cortisol with every cycle.",
    "Imagine roots growing down from the base of your spine.",
  ],
  "478": [
    "Soften your eyes. Let your gaze go unfocused.",
    "Let any thoughts drift past like clouds.",
    "Feel the weight of your body in the chair.",
    "Your amygdala is quieting right now.",
    "Stay with the orb. Nothing else exists.",
  ],
  coherent: [
    "Gaze at the centre without blinking.",
    "Your heart and breath are becoming one rhythm.",
    "Feel the floor beneath you. You are grounded.",
    "Notice how your body feels heavier each cycle.",
    "Stay present. One breath at a time.",
  ],
  power: [
    "Keep your gaze forward. Stay sharp.",
    "Feel the clarity building in your mind.",
    "Anchor your attention on the centre of the orb.",
    "You are exactly where you need to be.",
  ],
  guided: [
    "Let your body be completely still.",
    "Your only job right now is to listen.",
    "Feel the floor or chair beneath you.",
    "Soften your face. Unclench your teeth.",
  ],
};

const GENERAL_CUES = [
  "Focus on the centre of the orb.",
  "Let any thoughts pass. Return to the breath.",
  "Feel the cool air in. Warm air out.",
  "You are here. Nowhere else.",
  "Anchor your gaze. Anchor your mind.",
  "Notice the silence between your thoughts.",
  "Your body knows how to do this.",
];

function useMindfulCues(active: boolean, techId: string) {
  const [cue, setCue]         = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const indexRef  = useRef<number>(0);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef<boolean>(false);
  const allCuesRef = useRef<string[]>([]);

  useEffect(() => {
    allCuesRef.current = [...(CUES[techId] || []), ...GENERAL_CUES];
  }, [techId]);

  const showNext = useCallback(() => {
    if (!activeRef.current) return;
    const cues = allCuesRef.current;
    setCue(cues[indexRef.current % cues.length]);
    indexRef.current += 1;
    setVisible(true);
    // Fade out after 4s, next cue in 30s
    timerRef.current = setTimeout(() => {
      setVisible(false);
      timerRef.current = setTimeout(() => {
        if (activeRef.current) showNext();
      }, 30000);
    }, 4000);
  }, []);

  useEffect(() => {
    if (active) {
      activeRef.current = true;
      indexRef.current  = 0;
      showNext(); // show immediately
    } else {
      activeRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      setVisible(false);
      setCue("");
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, showNext]);

  return { cue, visible };
}

function BreathOrb({ phase, accent, isActive, phaseKey, phaseProg, onTap, cue, cueVisible, labelReady }: BreathOrbProps) {
  const lastDirRef              = useRef<PhaseDir>("expand");
  const [scale, setScale]       = useState<number>(0.55);
  const [holdScale, setHoldScale] = useState<number>(0.55);

  // Smooth crossfade countdown
  const [displayNum, setDisplayNum]   = useState<number>(0);
  const [numVisible, setNumVisible]   = useState<boolean>(true);
  const prevNumRef                    = useRef<number>(-1);

  useEffect(() => {
    if (!isActive || !phase) return;
    const cur = Math.ceil(phase.duration * (1 - phaseProg));
    if (cur === prevNumRef.current) return;
    // fade out → swap → fade in
    setNumVisible(false);
    const t = setTimeout(() => {
      setDisplayNum(cur);
      prevNumRef.current = cur;
      setNumVisible(true);
    }, 180);
    return () => clearTimeout(t);
  }, [Math.ceil((phase?.duration ?? 1) * (1 - phaseProg)), isActive]);

  useEffect(() => {
    if (!isActive || !phase) { setScale(0.55); return; }
    if (phase.dir === "hold") return;
    lastDirRef.current = phase.dir;
    if (phase.dir === "expand") {
      setScale(0.55 + (1.0 - 0.55) * phaseProg);
    } else {
      setScale(1.0 - (1.0 - 0.55) * phaseProg);
    }
  }, [phaseProg, isActive, phase]);

  useEffect(() => {
    if (phase && phase.dir !== "hold") {
      setHoldScale(phase.dir === "expand" ? 1.0 : 0.55);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseKey]);

  const sz       = phase?.dir === "hold" ? holdScale : scale;
  const coreSize = 150;
  const dots     = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div
      onClick={onTap ?? undefined}
      style={{
        width: 240, height: 240, position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        cursor: onTap ? "pointer" : "default",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <style>{`
        @keyframes orbDrift {
          0%,100% { transform: translateY(0)   scale(1);    }
          50%      { transform: translateY(-5px) scale(1.03); }
        }
        @keyframes rippleOut {
          0%   { transform: scale(1);   opacity: 0.35; }
          100% { transform: scale(2.2); opacity: 0;    }
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* Idle drift wrapper */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: !isActive ? "orbDrift 4s ease-in-out infinite" : "none",
      }}>
        {/* Ripple rings */}
        {isActive && [0, 1, 2].map(i => (
          <div key={i} style={{
            position: "absolute",
            width:  coreSize * sz,
            height: coreSize * sz,
            borderRadius: "50%",
            border: `1px solid ${accent}55`,
            animation: `rippleOut ${(phase?.duration ?? 4)}s ${i * 0.4}s ease-out infinite`,
            pointerEvents: "none",
          }} />
        ))}

        {/* Orbiting particles */}
        {isActive && (
          <div style={{
            position: "absolute",
            width: coreSize * sz + 44,
            height: coreSize * sz + 44,
            borderRadius: "50%",
            animation: `orbitSpin ${phase?.label === "Inhale" ? 8 : 12}s linear infinite`,
          }}>
            {dots.map(i => (
              <div key={i} style={{
                position: "absolute",
                width: 4, height: 4, borderRadius: "50%",
                background: accent,
                opacity: i % 2 === 0 ? 0.6 : 0.25,
                top: "50%", left: "50%",
                transform: `rotate(${i * 60}deg) translateX(${(coreSize * sz) / 2 + 22}px) translateY(-50%)`,
              }} />
            ))}
          </div>
        )}

        {/* Core sphere */}
        <div style={{
          width:  coreSize * sz,
          height: coreSize * sz,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 35%, ${accent}ee, ${accent}55 60%, ${accent}22)`,
          boxShadow: `0 0 ${30 * sz}px ${accent}44, 0 0 ${60 * sz}px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.15)`,
          transition: isActive ? "width 0.08s linear, height 0.08s linear, box-shadow 0.08s linear" : "all 0.3s ease",
          willChange: "transform",
          flexShrink: 0,
        }}>
          {/* Specular highlight */}
          <div style={{
            position: "absolute",
            width: 38, height: 26, borderRadius: "50%",
            background: "rgba(255,255,255,0.22)",
            filter: "blur(4px)",
            top: "22%", left: "22%",
            pointerEvents: "none",
          }} />
        </div>
      </div>

      {/* Phase label + countdown — Apple style */}
      {isActive && labelReady && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 2,
          gap: 4,
        }}>
          {/* Phase label above */}
          <p key={`label-${phaseKey}`} style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.28)",
          }}>
            {phase?.label}
          </p>
          {/* Countdown number — smooth crossfade */}
          <div style={{ position: "relative", height: 40, width: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{
              position: "absolute",
              fontSize: 34,
              fontWeight: 200,
              letterSpacing: "-0.04em",
              color: "rgba(255,255,255,0.45)",
            transition: "color 0.6s ease",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              opacity: numVisible ? 1 : 0,
              transform: numVisible ? "translateY(0) scale(1)" : "translateY(4px) scale(0.9)",
              transition: "opacity 0.22s ease, transform 0.22s ease",
            }}>
              {displayNum}
            </p>
          </div>
        </div>
      )}

      {/* Cue text removed from orb — shown below end session button */}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function MeditationPage() {
  const [tech, setTech]           = useState<Technique>(TECHNIQUES[0]);
  const [active, setActive]       = useState<boolean>(false);
  const [phaseIdx, setPhaseIdx]   = useState<number>(0);
  const [phaseKey, setPhaseKey]   = useState<number>(0);
  const [phaseProg, setPhaseProg] = useState<number>(0);
  const [cycles, setCycles]       = useState<number>(0);
  const [secs, setSecs]           = useState<number>(0);
  const [mounted, setMounted]     = useState<boolean>(false);
  const [showTips, setShowTips]   = useState<boolean>(false);
  const [guideEnabled, setGuideEnabled] = useState<boolean>(false);
  const [labelReady, setLabelReady] = useState<boolean>(false);
  const sessionCountRef             = useRef<number>(0);
  const [milestone, setMilestone]   = useState<number | null>(null);
  const [summary, setSummary]       = useState<{ cycles: number; secs: number; tech: Technique; sessionCount: number } | null>(null);

  const phaseStartRef   = useRef<number>(0);
  const sessionStartRef = useRef<number>(0);
  const rafRef          = useRef<number | null>(null);
  const activeRef       = useRef<boolean>(false);
  const phaseIdxRef     = useRef<number>(0);
  const techRef         = useRef<Technique>(tech);
  const meditationRef   = useRef<HTMLDivElement>(null);

  const { playPhase } = useAudio();
  const { phrase, speaking: guideSpeaking, onCycle, stop: stopGuide } =
    useGuide(guideEnabled && !tech.guided, tech.name);
  const guidedSession = useGuidedSession();
  const isGuided = !!tech.guided;
  const { cue, visible: cueVisible } = useMindfulCues(active, tech.id);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { techRef.current = tech; }, [tech]);
  useEffect(() => { phaseIdxRef.current = phaseIdx; }, [phaseIdx]);

  // rAF loop
  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    activeRef.current = true;

    const tick = () => {
      if (!activeRef.current) return;
      const now     = Date.now();
      const elapsed = (now - phaseStartRef.current) / 1000;
      const t       = techRef.current;
      const idx     = phaseIdxRef.current;
      const dur     = t.phases[idx].duration;
      const prog    = Math.min(elapsed / dur, 1);

      setPhaseProg(prog);
      setSecs(Math.floor((now - sessionStartRef.current) / 1000));

      if (elapsed >= dur) {
        const next      = (idx + 1) % t.phases.length;
        const nextLabel = t.phases[next].label;

        if (navigator.vibrate) {
          if (nextLabel === "Inhale")    navigator.vibrate([40]);
          else if (nextLabel === "Hold") navigator.vibrate([20, 60, 20]);
          else                           navigator.vibrate([60]);
        }

        if (next === 0) {
          setCycles(c => { onCycle(c + 1); return c + 1; });
        }
        setPhaseIdx(next);
        setPhaseKey(k => k + 1);
        phaseIdxRef.current = next;
        setPhaseProg(0);
        phaseStartRef.current = Date.now();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      activeRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, onCycle]);

  const start = () => {
    const t = techRef.current;
    phaseStartRef.current   = Date.now();
    sessionStartRef.current = Date.now();
    setPhaseIdx(0);
    setPhaseKey(k => k + 1);
    phaseIdxRef.current = 0;
    setPhaseProg(0);
    setCycles(0);
    setSecs(0);
    setSummary(null);
    setActive(true);
    setLabelReady(false);
    setTimeout(() => setLabelReady(true), 600);
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    setTimeout(() => meditationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    if (isGuided) {
      guidedSession.start();
    } else {
      onCycle(0);
    }
  };

  const stop = () => {
    activeRef.current = false;
    setActive(false);
    setLabelReady(false);
    setPhaseIdx(0);
    phaseIdxRef.current = 0;
    setPhaseProg(0);
    stopGuide();
    guidedSession.stop();
    // Summary on every session, milestone badge every 5th
    if (secs > 10) {
      sessionCountRef.current += 1;
      if (sessionCountRef.current % 5 === 0) {
        setMilestone(sessionCountRef.current);
        setTimeout(() => setMilestone(null), 3500);
      }
      setSummary({ cycles, secs, tech, sessionCount: sessionCountRef.current });
    }
    setTimeout(() => meditationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const selectTech = (t: Technique) => {
    if (active) stop();
    setTech(t);
    techRef.current = t;
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const currentPhase = tech.phases[phaseIdx];
  const accent       = tech.accent;

  if (!mounted) return null;

  return (
    <>
    <div style={{
      minHeight: "100vh",
      background: "#09090B",
      color: "#fff",
      fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',BlinkMacSystemFont,'Helvetica Neue',sans-serif",
      WebkitFontSmoothing: "antialiased",
      overflowX: "hidden",
    }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1);    }
        }
        .pill-btn {
          cursor: pointer; border: none; outline: none;
          -webkit-tap-highlight-color: transparent;
          transition: opacity 0.18s ease, transform 0.15s ease;
          user-select: none;
        }
        .pill-btn:hover  { opacity: 0.82; }
        .pill-btn:active { transform: scale(0.95); }
        .action-btn {
          cursor: pointer; border: none; outline: none;
          -webkit-tap-highlight-color: transparent;
          transition: opacity 0.16s ease, transform 0.15s cubic-bezier(0.4,0,0.2,1);
          user-select: none;
        }
        .action-btn:hover  { opacity: 0.86; }
        .action-btn:active { transform: scale(0.97); }
        @keyframes dotPulse {
          0%, 100% { transform: scale(1);    opacity: 1;   }
          50%       { transform: scale(0.75); opacity: 0.7; }
        }
        @keyframes countPop {
          from { opacity: 0; transform: scale(0.82) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
        @keyframes countFadeOut {
          from { opacity: 1; transform: scale(1)    translateY(0);    }
          to   { opacity: 0; transform: scale(1.12) translateY(-5px); }
        }
        @keyframes dotRing {
          0%   { transform: scale(1);   opacity: 0.5; }
          70%  { transform: scale(2.4); opacity: 0;   }
          100% { transform: scale(2.4); opacity: 0;   }
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Ambient top wash */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: "50vh",
        background: `radial-gradient(ellipse 80% 55% at 50% -5%, ${accent}16 0%, transparent 65%)`,
        transition: "background 1s ease",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 390, margin: "0 auto", padding: "0 0 64px" }}>

        {/* ── Header */}
        <div style={{
          position: "sticky", top: 0, zIndex: 20,
          display: "flex", alignItems: "center",
          padding: "0 16px",
          height: 56,
          background: "rgba(9,9,11,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          {/* Back — chevron + label like Apple */}
          <button
            className="action-btn"
            onClick={() => window.history.back()}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "transparent", border: "none",
              color: "#7B5CF5", fontSize: 15, fontWeight: 600,
              letterSpacing: "-0.01em", padding: "6px 10px 6px 2px",
              minWidth: 64, flexShrink: 0,
            }}
            aria-label="Go back"
          >
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
              <path d="M8 1L1 8L8 15" stroke="#7B5CF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>

          {/* Centred title — absolute so it's always truly centred */}
          <div style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            textAlign: "center", pointerEvents: "none",
          }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em", lineHeight: 1 }}>
              Breathe
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", marginTop: 2 }}>
              Mindfulness
            </p>
          </div>

          {/* Info — right aligned */}
          <button
            className="action-btn"
            onClick={() => setShowTips(true)}
            style={{
              marginLeft: "auto",
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(255,255,255,0.55)", flexShrink: 0,
            }}
            aria-label="Practice tips"
          >
            <Info size={15} strokeWidth={1.5} />
          </button>
        </div>

        <div style={{ padding: "20px 24px 0" }}>

        {/* ── Title */}
        <div style={{ animation: "fadeUp 0.5s ease both", marginBottom: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.2 }}>
            Breathing{" "}
            <span style={{ color: "rgba(255,255,255,0.36)", fontWeight: 300 }}>exercises</span>
          </h1>
        </div>

        {/* ── Technique selector */}
        <div ref={meditationRef} style={{
          display: "flex", gap: 8, marginTop: 24,
          overflowX: "auto", paddingBottom: 2,
          animation: "fadeUp 0.5s 0.07s ease both",
          scrollMarginTop: 24,
        }}>
          {TECHNIQUES.map(t => {
            const sel = tech.id === t.id;
            return (
              <button
                key={t.id}
                className="pill-btn"
                onClick={() => !t.comingSoon && selectTech(t)}
                style={{
                  flexShrink: 0, padding: "9px 15px", borderRadius: 30,
                  border: sel ? `1.5px solid ${t.accent}65` : "1.5px solid rgba(255,255,255,0.08)",
                  background: sel ? `${t.accent}1a` : "rgba(255,255,255,0.04)",
                  color: t.comingSoon ? "rgba(255,255,255,0.22)" : sel ? t.accent : "rgba(255,255,255,0.42)",
                  fontSize: 13, fontWeight: sel ? 600 : 400,
                  letterSpacing: "-0.01em", backdropFilter: "blur(12px)",
                  cursor: t.comingSoon ? "default" : "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  opacity: t.comingSoon ? 0.6 : 1,
                }}
              >
                {t.name}
                {t.comingSoon && (
                  <span style={{
                    fontSize: 9, fontWeight: 600, letterSpacing: "0.06em",
                    textTransform: "uppercase", color: t.accent,
                    background: `${t.accent}20`, borderRadius: 4,
                    padding: "2px 5px",
                  }}>
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tagline + description */}
        <div style={{ marginTop: 20, animation: "fadeUp 0.5s 0.12s ease both" }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", color: accent, marginBottom: 5, transition: "color 0.6s ease" }}>
            {tech.tagline}
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.62, fontWeight: 400, letterSpacing: "-0.004em" }}>
            {tech.description}
          </p>
        </div>

        {/* ── Phase track */}
        {!isGuided && (
          <div style={{ marginTop: 22 }}>
            <div style={{ display: "flex", gap: 3, alignItems: "stretch" }}>
              {tech.phases.map((p, i) => {
                const cur     = active && i === phaseIdx;
                const done    = active && i < phaseIdx;
                const totalDur = tech.phases.reduce((s, x) => s + x.duration, 0);
                const weight  = p.duration / totalDur;
                return (
                  <div key={i} style={{
                    flex: weight, height: 30, borderRadius: 8,
                    background: cur ? `${accent}22` : done ? `${accent}10` : "rgba(255,255,255,0.05)",
                    border: cur ? `1px solid ${accent}55` : done ? `1px solid ${accent}20` : "1px solid rgba(255,255,255,0.10)",
                    transition: "background 0.4s ease, border-color 0.4s ease",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  }}>
                    <span style={{
                      fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                      color: cur ? accent : done ? `${accent}70` : "rgba(255,255,255,0.38)",
                      transition: "color 0.4s ease", lineHeight: 1,
                    }}>
                      {p.label}
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 500,
                      color: cur ? `${accent}cc` : done ? `${accent}55` : "rgba(255,255,255,0.30)",
                      transition: "color 0.4s ease", lineHeight: 1,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {p.duration}s
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Cue — fixed height slot between pills and orb, never shifts */}
        {!isGuided && (
          <div style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 8 }}>
            <p style={{
              fontSize: 12, fontWeight: 400,
              color: active && cueVisible ? "rgba(255,255,255,0.28)" : "transparent",
              letterSpacing: "0.01em", maxWidth: 240,
              lineHeight: 1.5, textAlign: "center",
              transition: "color 1.2s ease",
              pointerEvents: "none",
            }}>
              {cue}
            </p>
          </div>
        )}

        {/* ── Orb area */}
        <div style={{ position: "relative", marginTop: 4 }}>

        <div
          onClick={!active ? start : undefined}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            cursor: !active ? "pointer" : "default",
            WebkitTapHighlightColor: "transparent", userSelect: "none",
            padding: "0 40px 0", margin: "0 -40px 0",
            position: "relative",
          }}
        >
          <BreathOrb
            phase={active ? currentPhase : null}
            accent={accent}
            isActive={active}
            phaseKey={phaseKey}
            phaseProg={phaseProg}
            onTap={!active ? start : null}
            cue={cue}
            cueVisible={cueVisible && active}
            labelReady={labelReady}
          />

          {/* Milestone badge */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: `translate(-50%, -50%) translateY(${milestone ? "72px" : "60px"})`,
            opacity: milestone ? 1 : 0,
            transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.4,0.64,1)",
            pointerEvents: "none",
            display: "flex", alignItems: "center", gap: 7,
            background: "rgba(18,18,22,0.88)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1px solid ${accent}50`,
            borderRadius: 50,
            padding: "8px 14px",
            whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: 13 }}>✦</span>
            <p style={{
              fontSize: 12, fontWeight: 500,
              color: accent, letterSpacing: "0.04em",
            }}>
              {milestone} sessions
            </p>
          </div>

          {/* Below-orb content */}
          <div style={{
            marginTop: 8, textAlign: "center",
            display: "flex", flexDirection: "column",
            alignItems: "center",
          }}>
            {active ? (
              isGuided ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                  {guidedSession.loading ? (
                    <>
                      <div style={{ display: "flex", gap: 5 }}>
                        {[0,1,2,3].map(i => (
                          <div key={i} style={{
                            width: 4, height: 4, borderRadius: "50%", background: accent,
                            animation: `dotPulse 1.4s ${i*0.18}s ease-in-out infinite`,
                          }} />
                        ))}
                      </div>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>
                        Preparing your session
                      </p>
                    </>
                  ) : (
                    <>
                      {guidedSession.speaking && (
                        <div style={{ display: "flex", alignItems: "center", gap: 3, height: 14 }}>
                          {[0.6,1,0.7,1,0.5,0.9,0.6].map((h, i) => (
                            <div key={i} style={{
                              width: 3, height: `${h * 14}px`, borderRadius: 2,
                              background: accent, opacity: 0.7,
                              animation: `dotPulse 0.9s ${i*0.1}s ease-in-out infinite`,
                            }} />
                          ))}
                        </div>
                      )}
                      {guidedSession.current ? (
                        <p key={guidedSession.current} style={{
                          fontSize: 15, fontWeight: 300,
                          color: "rgba(255,255,255,0.72)", lineHeight: 1.55,
                          letterSpacing: "-0.01em", maxWidth: 260,
                          fontStyle: "italic", animation: "fadeUp 0.5s ease both",
                        }}>
                          {guidedSession.current}
                        </p>
                      ) : (
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>
                          Eyes closed · Follow the voice
                        </p>
                      )}
                      {guidedSession.progress > 0 && guidedSession.progress < 1 && (
                        <div style={{ width: 160, height: 2, borderRadius: 1, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 1, background: accent,
                            width: `${guidedSession.progress * 100}%`,
                            transition: "width 1s linear",
                          }} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : null
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ position: "relative", width: 6, height: 6 }}>
                  <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: accent, opacity: 0.7, animation: "dotPulse 1.8s ease-in-out infinite" }} />
                  <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: accent, animation: "dotRing 1.8s ease-in-out infinite" }} />
                </span>
                <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>
                  {isGuided ? "Tap · Close your eyes" : "Tap to begin"}
                </p>
              </div>
            )}
          </div>

          {/* Stop button */}
          {active && (
            <>
              {/* Cycles counter */}
              {!isGuided && (
                <div style={{
                  marginTop: 14,
                  display: "flex", alignItems: "center", gap: 8,
                  animation: "scaleIn 0.3s ease both",
                }}>
                  <p style={{ fontSize: 22, fontWeight: 200, letterSpacing: "-0.03em", color: "#fff", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                    {cycles}
                  </p>
                  <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
                    Cycles
                  </p>
                </div>
              )}
              <button
                className="action-btn"
                onClick={stop}
                style={{
                  marginTop: 14, display: "inline-flex", alignItems: "center", gap: 9,
                  padding: "11px 24px 11px 18px", borderRadius: 50,
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)",
                  color: "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 500,
                  letterSpacing: "-0.005em",
                }}
              >
                <Square size={9} fill="rgba(255,255,255,0.38)" strokeWidth={0} />
                End session
              </button>
            </>
          )}
        </div>
        </div> {/* end orb wrapper */}
        </div> {/* end inner padding */}
      </div>
    </div>

    {/* ── Session summary overlay */}
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "#09090B",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "0 32px",
      opacity: summary ? 1 : 0,
      transform: summary ? "translateY(0)" : "translateY(40px)",
      pointerEvents: summary ? "auto" : "none",
      transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.34,1.2,0.64,1)",
      fontFamily: "-apple-system,'SF Pro Display',BlinkMacSystemFont,'Helvetica Neue',sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      {summary && (
        <>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "60vh",
            background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${summary.tech.accent}14 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />

          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            border: `1.5px solid ${summary.tech.accent}55`,
            background: `${summary.tech.accent}12`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 28,
            animation: "scaleIn 0.4s 0.2s ease both",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke={summary.tech.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.13em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8,
            animation: "fadeUp 0.4s 0.25s ease both",
          }}>
            You showed up
          </p>
          <h2 style={{
            fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em",
            color: "#fff", marginBottom: 6, lineHeight: 1.2, textAlign: "center",
            animation: "fadeUp 0.4s 0.3s ease both",
          }}>
            {summary.sessionCount === 1
              ? "This is who you are."
              : summary.sessionCount % 5 === 0
              ? "You take care of your mind."
              : "You showed up for yourself."}
          </h2>
          <p style={{
            fontSize: 13, color: "rgba(255,255,255,0.28)", marginBottom: 44,
            letterSpacing: "-0.004em", textAlign: "center",
            animation: "fadeUp 0.4s 0.35s ease both",
          }}>
            {summary.sessionCount === 1
              ? "People who breathe intentionally handle stress differently."
              : summary.sessionCount % 5 === 0
              ? `${summary.sessionCount} sessions. That's a practice, not a habit.`
              : "Every session rewires how you respond to the world."}
          </p>

          <div style={{
            display: "flex", alignItems: "center",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20, overflow: "hidden",
            animation: "fadeUp 0.4s 0.4s ease both",
            width: "100%", maxWidth: 280,
          }}>
            {[
              { value: `${Math.floor(summary.secs / 60)}:${String(summary.secs % 60).padStart(2,"0")}`, label: "Duration" },
              { value: String(summary.cycles), label: "Cycles" },
            ].map((stat, i) => (
              <div key={i} style={{
                flex: 1, padding: "20px 0", textAlign: "center",
                borderRight: i === 0 ? "1px solid rgba(255,255,255,0.07)" : "none",
              }}>
                <p style={{ fontSize: 28, fontWeight: 200, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginTop: 5 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Milestone — identity anchor on every 5th */}
          {summary.sessionCount % 5 === 0 && (
            <p style={{
              marginTop: 16, fontSize: 12, fontWeight: 500,
              color: summary.tech.accent, letterSpacing: "0.04em",
              animation: "fadeUp 0.4s 0.45s ease both",
              textAlign: "center",
            }}>
              ✦ You are someone who does this.
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 28, width: "100%", maxWidth: 280, animation: "fadeUp 0.4s 0.48s ease both" }}>
            <button
              className="action-btn"
              onClick={() => { setSummary(null); start(); }}
              style={{
                width: "100%", padding: "15px 0", borderRadius: 50,
                background: summary.tech.accent, border: "none",
                color: "#fff", fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em",
              }}
            >
              Go again
            </button>
            <button
              className="action-btn"
              onClick={() => setSummary(null)}
              style={{
                width: "100%", padding: "15px 0", borderRadius: 50,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.45)", fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em",
              }}
            >
              I'm done for now
            </button>
          </div>
        </>
      )}
    </div>

    {/* ── Tips bottom sheet ──────────────────────────────────── */}
    <div
      onClick={() => setShowTips(false)}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)", zIndex: 50,
        opacity: showTips ? 1 : 0,
        pointerEvents: showTips ? "auto" : "none",
        transition: "opacity 0.28s ease",
      }}
    />
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 51,
      transform: showTips ? "translateY(0)" : "translateY(100%)",
      transition: "transform 0.38s cubic-bezier(0.32,0.72,0,1)",
      background: "#111113", borderTopLeftRadius: 24, borderTopRightRadius: 24,
      border: "1px solid rgba(255,255,255,0.09)", borderBottom: "none",
      paddingBottom: "env(safe-area-inset-bottom, 24px)",
      fontFamily: "-apple-system,'SF Pro Display','SF Pro Text',BlinkMacSystemFont,'Helvetica Neue',sans-serif",
      WebkitFontSmoothing: "antialiased", maxHeight: "88vh", overflowY: "auto",
    }}>
      {/* Grab handle */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
      </div>

      {/* Sheet header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px 0" }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 4 }}>
            Science-backed
          </p>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em", color: "#fff", margin: 0, lineHeight: 1.2 }}>
            Quick guide
          </h2>
        </div>
        <button
          className="action-btn"
          onClick={() => setShowTips(false)}
          style={{
            width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)",
            border: "none", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
          aria-label="Close"
        >
          <X size={12} color="rgba(255,255,255,0.6)" strokeWidth={1.8} />
        </button>
      </div>

      {/* Tip sections */}
      {TIPS.map((section, si) => (
        <div key={si} style={{ padding: `${si === 0 ? 22 : 16}px 24px 0` }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 12 }}>
            {section.label}
          </p>
          <div style={{ borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
            {section.items.map((tip, i, arr) => (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "13px 16px" }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 1, color: "rgba(255,255,255,0.55)",
                  }}>
                    {tip.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.015em", color: "rgba(255,255,255,0.88)", lineHeight: 1.3, marginBottom: 3 }}>
                      {tip.title}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.38)", lineHeight: 1.55, letterSpacing: "-0.003em", margin: 0 }}>
                      {tip.detail}
                    </p>
                  </div>
                </div>
                {i < arr.length - 1 && <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginLeft: 48 }} />}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Got it */}
      <div style={{ padding: "20px 24px" }}>
        <button
          className="action-btn"
          onClick={() => setShowTips(false)}
          style={{
            width: "100%", padding: "15px 0", borderRadius: 50,
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.72)", fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em",
          }}
        >
          Got it
        </button>
      </div>
    </div>

    </>
  );
}