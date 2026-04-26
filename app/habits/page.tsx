'use client';
import { useState, useEffect, useRef, createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

// ── Habits context (populated from GET /api/habits) ───────────────────────────
const HabitsCtx = createContext<Habit[]>([]);
const useHabits = () => useContext(HabitsCtx);

// ── Shared types ──────────────────────────────────────────────────────────────
interface Habit {
  id: string;
  label: string;
  desc: string;
  why: string;
  impact: string;
  category: string;
  color: string;
  icon: ReactNode;
}

interface Pack {
  id: string;
  label: string;
  subtitle: string;
  desc?: string;
  research?: string;
  color: string;
  icon?: ReactNode;
  ids: string[];
  tags: string[];
  insights?: { metric: string; status: string; color: string }[];
}

const MIN_HABITS = 2;
const MAX_HABITS = 6;

const svgI = (d: ReactNode) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

// ── Text hierarchy ─────────────────────────────────────────────────────────────
const T1 = "#ffffff";                    // headlines, selected labels
const T2 = "rgba(235,235,245,0.75)";    // body text, descriptions
const T3 = "rgba(235,235,245,0.45)";    // secondary/supporting text
const T4 = "rgba(235,235,245,0.28)";    // captions, metadata, divider labels
const C_BRAND    = "#0a84ff"; // UI chrome, CTAs
const C_PHYSICAL = "#30d158"; // movement, body, positive
const C_ENERGY   = "#ff9f0a"; // nutrition, energy, caution
const C_ALERT    = "#ff453a"; // eliminate, risk, avoid
const C_MENTAL   = "#bf5af2"; // mindfulness, focus, mind

const ALL_HABITS = [
  { id:"sleep",              label:"Sleep 7–8 hours",              desc:"In bed before 11pm — same time every night",                        why:"Sleep is when muscle repairs, memory consolidates and hormones reset. Nothing else comes close.",                                          impact:"Recovery",    category:"Body",      color:C_MENTAL,   icon: svgI(<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>) },
  { id:"exercise",           label:"Exercise 30 min",              desc:"Any movement — gym, run, swim, bike",                     why:"30 min of daily movement adds years to your life and is the most effective antidepressant known.",                                          impact:"Longevity",   category:"Body",      color:C_PHYSICAL, icon: svgI(<><path d="M6.5 6.5h11M6.5 17.5h11M4 9h3m10 0h3M4 15h3m10 0h3M9.5 6.5v11M14.5 6.5v11"/></>) },
  { id:"steps",              label:"5,000–10,000 steps",           desc:"Start at 5k, build to 10k",                               why:"Walking daily lowers cardiovascular disease risk by 40% and improves mood within minutes.",                                                impact:"Cardio",      category:"Body",      color:C_PHYSICAL, icon: svgI(<path d="M13 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0M7.5 17.5L9 13l3 2 2-3.5M6 20l2-4 4 1 3-5 2 1"/>) },
  { id:"water",              label:"Drink 2.5L water",             desc:"10 glasses across the day",                               why:"Your body is 60% water. Even 2% dehydration kills focus, mood and physical output.",                                                       impact:"Hydration",   category:"Body",      color:C_PHYSICAL, icon: svgI(<path d="M12 2s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13z"/>) },
  { id:"sunlight",           label:"Morning sunlight 10 min",      desc:"Outside within 1hr of waking, no sunglasses",             why:"Morning light sets your circadian rhythm, boosts cortisol at the right time, and improves sleep that night.",                             impact:"Energy",      category:"Body",      color:C_ENERGY,   icon: svgI(<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/></>) },
  { id:"stretch",            label:"Stretch / mobility 10 min",    desc:"Morning or post-work — hips, spine, shoulders",           why:"Daily stretching reduces injury risk by 54% and is one of the most under-rated longevity habits.",                                         impact:"Mobility",    category:"Body",      color:C_PHYSICAL, icon: svgI(<path d="M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>) },
  { id:"walkaftermeals",     label:"Walk after meals 10 min",      desc:"Short walk after lunch or dinner",                        why:"Post-meal walking reduces blood glucose spikes by up to 30% and aids digestion significantly.",                                           impact:"Metabolism",  category:"Body",      color:C_PHYSICAL, icon: svgI(<path d="M13 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0M7.5 17.5L9 13l3 2 2-3.5"/>) },
  { id:"callsomeone",        label:"Call someone you care about",  desc:"5 min with family or a close friend",                     why:"Regular social connection reduces all-cause mortality by 50% — stronger effect than exercise or diet.",                                    impact:"Connection",  category:"Body",      color:C_ENERGY,   icon: svgI(<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>) },
  { id:"noprocessed",        label:"No junk food",                 desc:"If it's fried, packaged, bakery or maida — skip it",      why:"Cut it for 7 days and you'll stop craving it. Your energy and hunger become predictable again.",                                          impact:"Nutrition",   category:"Body",      color:C_ALERT,    icon: svgI(<><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>) },
  { id:"nosmoking",          label:"No smoking",                   desc:"Zero cigarettes — not even one",                          why:"The body begins healing within 20 minutes of stopping. Every cigarette not smoked adds ~11 minutes.",                                      impact:"Health",      category:"Body",      color:C_ALERT,    icon: svgI(<><line x1="2" y1="2" x2="22" y2="22"/><path d="M12 12H2M22 12h-4"/></>) },
  { id:"noalcohol",          label:"No alcohol",                   desc:"Zero drinks — not even one",                              why:"Alcohol fragments sleep cycles, spikes cortisol and depletes B vitamins. Even one drink has measurable effects.",                           impact:"Recovery",    category:"Body",      color:C_ALERT,    icon: svgI(<><path d="M8 2h8l1 7H7L8 2zM7 9c0 5 2 9 5 9s5-4 5-9"/><line x1="4" y1="4" x2="20" y2="20"/></>) },
  { id:"veggies",            label:"Fill half plate with veg",     desc:"Any vegetable — sabzi, salad, soup or raw",               why:"Every snack you replace with a vegetable is a vote for the body you want. Most feel the shift in 10 days.",                               impact:"Nutrition",   category:"Body",      color:C_ENERGY,   icon: svgI(<path d="M12 2a5 5 0 0 1 5 5c0 5-5 11-5 11S7 12 7 7a5 5 0 0 1 5-5z"/>) },
  { id:"meditation",         label:"Meditate 10 min",              desc:"Quiet sit, breathing app or guided",                      why:"10 min daily measurably shrinks the amygdala and thickens the prefrontal cortex in 8 weeks.",                                             impact:"Clarity",     category:"Mind",      color:C_MENTAL,   icon: svgI(<><circle cx="12" cy="6" r="2"/><path d="M9 21c.5-3 1.5-5 3-5s2.5 2 3 5M9.5 14V11a2.5 2.5 0 0 1 5 0v3"/></>) },
  { id:"read",               label:"Read 20 minutes",              desc:"Books only — not articles or feeds",                      why:"Reading reduces cortisol by 68% in 6 minutes and is the best-studied cognitive reserve builder.",                                         impact:"Growth",      category:"Mind",      color:C_MENTAL,   icon: svgI(<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>) },
  { id:"learn",              label:"Learn 15 min",                 desc:"One skill, consistently — language, code, music",         why:"Deliberate daily practice grows myelin around neural pathways, making skills permanent over 21 days.",                                    impact:"Mastery",     category:"Mind",      color:C_MENTAL,   icon: svgI(<><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>) },
  { id:"journal",            label:"Gratitude journal",            desc:"3 things you're grateful for, 2 min",                     why:"Writing gratitude rewires neural pathways toward positive patterns — measurable in brain scans after 21 days.",                           impact:"Mindset",     category:"Mind",      color:C_MENTAL,   icon: svgI(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></>) },
  { id:"breathwork",         label:"Breathwork 5 min",             desc:"Box breathing, 4-7-8 or Wim Hof",                        why:"Controlled breathing activates the vagus nerve, dropping cortisol and heart rate in under 90 seconds.",                                  impact:"Calm",        category:"Mind",      color:C_MENTAL,   icon: svgI(<><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></>) },
  { id:"deepwork",           label:"Deep work block 90 min",       desc:"Single task, zero interruptions, phone away",             why:"90-minute ultradian cycles align with peak cognitive performance. One real block beats 4 distracted hours.",                             impact:"Focus",       category:"Mind",      color:C_MENTAL,   icon: svgI(<><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>) },
  { id:"noscreens",          label:"No screens 1hr before bed",    desc:"Phone down, book or conversation instead",                why:"Blue light blocks melatonin for up to 3 hours. Cutting it before bed doubles deep sleep duration.",                                      impact:"Sleep",       category:"Mind",      color:C_ALERT,    icon: svgI(<><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4M4 4l16 16"/></>) },
  { id:"nosocialmedia",      label:"No social media before 10am",  desc:"First 2hrs are for you, not feeds",                       why:"Morning dopamine from social media hijacks your motivation system for hours. Protecting the AM protects the day.",                       impact:"Focus",       category:"Mind",      color:C_ALERT,    icon: svgI(<><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85"/></>) },
  { id:"proactivelanguage",  label:"Use proactive language",       desc:"Replace I can't with I choose not to",                why:"Language shapes identity. Proactive framing measurably increases locus of control and follow-through.",                                  impact:"Mindset",     category:"Mind",      color:C_MENTAL,   icon: svgI(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>) },
  { id:"discomfortchallenge",label:"Daily discomfort challenge",   desc:"One uncomfortable-but-beneficial action today",           why:"Deliberate discomfort expands your comfort zone permanently. Each rep builds courage as a skill.",                                      impact:"Resilience",  category:"Mind",      color:C_ENERGY,   icon: svgI(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>) },
  { id:"eatingwindow",       label:"Eat within a 10–12 hour window",  desc:"First meal and last meal within a 10–12hr span", why:"Studies show eating within a consistent daily window — even 12 hours — improves metabolic health, sleep quality and energy without strict restriction.",                                       impact:"Metabolism",  category:"Lifestyle", color:C_ENERGY,   icon: svgI(<><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>) },
  { id:"caffeine",           label:"No caffeine after 2pm",        desc:"Coffee, chai, tea or energy drinks — stop by 2pm",        why:"Caffeine stays in your body for 6 hours. A 3pm chai is still 50% active at 9pm — wrecking your sleep.",                               impact:"Sleep",       category:"Lifestyle", color:C_ALERT,    icon: svgI(<><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/></>) },
  { id:"nosugar",            label:"No added sugar",               desc:"Check labels — sugar hides in everything",                why:"Sugar spikes insulin then crashes energy. Cutting it for 21 days resets taste sensitivity permanently.",                                 impact:"Energy",      category:"Lifestyle", color:C_ALERT,    icon: svgI(<><path d="M12 2c1 2 3 3.5 3 5.5a3 3 0 0 1-6 0C9 5.5 11 4 12 2z"/><line x1="4" y1="4" x2="20" y2="20"/></>) },
  { id:"trackspending",      label:"Track daily spending",         desc:"Log every purchase — app or note",                        why:"Awareness of spending is the first step to financial health. Most people underestimate daily spend by 40%.",                             impact:"Finance",     category:"Lifestyle", color:C_ENERGY,   icon: svgI(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>) },
  { id:"preparetomorrow",    label:"Prepare tomorrow tonight",     desc:"Top 3 tasks + clothes + bag, 5 min",                      why:"A 5-minute evening prep reduces morning cortisol and decision fatigue, leading to better focus from the first hour.",                    impact:"Clarity",     category:"Lifestyle", color:C_MENTAL,   icon: svgI(<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>) },
  { id:"timeblock",          label:"Time-block your day",          desc:"Assign every hour to a task — 5 min planning",            why:"Time-blocking increases task completion by 60%. It converts intentions into scheduled reality.",                                        impact:"Productivity",category:"Lifestyle", color:C_MENTAL,   icon: svgI(<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>) },
  { id:"nearfareye",         label:"Near-far eye training 5 min",  desc:"Alternate focus: close object, then distant point",       why:"Daily near-far training reduces myopia progression and eye strain from screen work by up to 30%.",                                     impact:"Vision",      category:"Lifestyle", color:C_PHYSICAL, icon: svgI(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>) },
  { id:"presleepbath",       label:"Warm bath before bed",         desc:"10 min, 60–90 min before sleep",                          why:"A warm bath drops core body temperature post-bath, triggering the physiological signal your body uses to initiate sleep.",              impact:"Sleep",       category:"Lifestyle", color:C_MENTAL,   icon: svgI(<><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"/></>) },
  { id:"daily5goals",        label:"Write 5 micro-goals for today",desc:"5 small, achievable wins — takes 3 min",                  why:"Small wins activate the brain's progress principle. Each completed micro-goal triggers dopamine, sustaining motivation.",               impact:"Momentum",    category:"Lifestyle", color:C_ENERGY,   icon: svgI(<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>) },
  { id:"coldshower",         label:"Cold shower 2 min",             desc:"End shower on cold — 2 min minimum",                      why:"Cold exposure raises dopamine by 250% and norepinephrine by 300% — lasting 2–3 hours. One of the most replicated single-habit effects.",  impact:"Alertness",   category:"Body",      color:C_PHYSICAL, icon: svgI(<><path d="M12 2v6M12 22v-2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/><circle cx="12" cy="12" r="4"/></>) },
  { id:"proteintarget",      label:"Hit daily protein target",      desc:"1.6g per kg bodyweight — track it once",                  why:"1.6g/kg is the evidence threshold for muscle protein synthesis. Below this, resistance training produces minimal muscle gain regardless of effort.", impact:"Muscle",      category:"Body",      color:C_PHYSICAL, icon: svgI(<><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>) },
  { id:"zone2cardio",        label:"Zone 2 cardio 30 min",          desc:"Conversational pace — bike, walk, swim, jog",             why:"Zone 2 (conversational pace) is the strongest single predictor of longevity and VO2 max. 150 min/week reduces all-cause mortality by 35%.", impact:"Longevity",   category:"Body",      color:C_PHYSICAL, icon: svgI(<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>) },
  { id:"visualisation",      label:"Visualisation 5 min",           desc:"Mental rehearsal of your day or a key goal",              why:"Mental practice activates the same motor cortex regions as physical practice. Pascual-Leone (Harvard) showed it produces measurable neural changes.", impact:"Performance", category:"Mind",      color:C_MENTAL,   icon: svgI(<><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></>) },
  { id:"strengthtraining",           label:"Strength train 3×/week",        desc:"Weights, bands or bodyweight — 3 sessions a week",        why:"Resistance training builds skeletal muscle, raises BMR by up to 15% and reduces visceral fat more effectively than cardio alone.",            impact:"Muscle",      category:"Body",      color:C_PHYSICAL, icon: svgI(<><path d="M6 4v16M18 4v16M3 8h4M17 8h4M3 16h4M17 16h4"/></>) },
  { id:"hiit",               label:"HIIT session 20 min",           desc:"4–8 rounds: 20–40 sec max effort, 60 sec rest",           why:"HIIT reduces visceral fat 3× faster than steady-state cardio and elevates metabolic rate for up to 24 hrs post-session.",                 impact:"Fat loss",    category:"Body",      color:C_PHYSICAL, icon: svgI(<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>) },
];

const HABIT_TIERS = {
  // Core — foundational physical/daily habits
  sleep:"core", exercise:"core", steps:"core", water:"core",
  walkaftermeals:"core", sunlight:"core", veggies:"core",
  nearfareye:"core", presleepbath:"core", zone2cardio:"core",
  // Growth — intentional practice, mental, skill-building
  meditation:"growth", read:"growth", learn:"growth", breathwork:"growth",
  deepwork:"growth", journal:"growth", preparetomorrow:"growth",
  timeblock:"growth", daily5goals:"growth", discomfortchallenge:"growth",
  proactivelanguage:"growth", trackspending:"growth", visualisation:"growth",
  stretch:"growth", callsomeone:"growth", coldshower:"growth", proteintarget:"growth",
  strength:"growth", hiit:"growth",
  // Avoid — eliminating something harmful
  noprocessed:"avoid", noalcohol:"avoid", nosmoking:"avoid",
  noscreens:"avoid", nosugar:"avoid", nosocialmedia:"avoid",
  eatingwindow:"avoid", caffeine:"avoid",
};

const tierIcon = (d: ReactNode) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const TIER_META = {
  core:   { label:"Core",   icon: tierIcon(<><path d="M12 2C8 6 6 9 6 12a6 6 0 0 0 12 0c0-3-2-6-6-10z"/><path d="M12 12c0 0 2 1.5 2 3a2 2 0 0 1-4 0c0-1.5 2-3 2-3z"/></>), color:C_PHYSICAL, desc:"Foundation habits" },
  growth: { label:"Growth", icon: tierIcon(<><path d="M12 22V12"/><path d="M12 12C12 12 7 10 7 6a5 5 0 0 1 10 0c0 4-5 6-5 6z"/><path d="M9 17c-2 0-4-1-4-3"/></>), color:C_MENTAL,   desc:"Mind & skill building" },
  avoid:  { label:"Avoid",  icon: tierIcon(<><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>), color:C_ALERT,    desc:"Things to eliminate" },
};

// ─── HABIT CARD ───────────────────────────────────────────────────────────────
function HabitSelectCard({ habit, selected, disabled, onToggle, aiSuggested }: { habit: Habit; selected: boolean; disabled: boolean; onToggle: () => void; aiSuggested?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const tier = HABIT_TIERS[habit.id as keyof typeof HABIT_TIERS];
  const barColor = tier ? TIER_META[tier as keyof typeof TIER_META].color : habit.color;

  useEffect(() => { setExpanded(selected); }, [selected]);

  return (
    <div style={{
      borderRadius:14, overflow:"hidden", display:"flex",
      background: selected ? (habit.color+"0e") : aiSuggested ? "rgba(100,50,220,0.07)" : "#111116",
      border:"1px solid " + (selected ? (habit.color+"30") : aiSuggested ? "rgba(130,80,255,0.22)" : "#1e1e28"),
      opacity: (disabled && !selected) ? 0.38 : 1,
      transition:"all 0.2s",
    }}>
      {/* left slab */}
      <div style={{ width:4, flexShrink:0, background:barColor, opacity: selected ? 1 : 0.35, transition:"opacity 0.2s" }}/>

      <div style={{ flex:1, padding:"13px 13px" }}>
        {/* main row */}
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          {/* icon */}
          <div style={{
            width:36, height:36, borderRadius:10, flexShrink:0,
            display:"flex", alignItems:"center", justifyContent:"center",
            background: selected ? (habit.color+"20") : "rgba(255,255,255,0.06)",
            color: selected ? habit.color : "rgba(255,255,255,0.45)",
            transition:"all 0.2s",
          }}>
            {habit.icon}
          </div>

          {/* name + desc */}
          <div style={{ flex:1, minWidth:0 }}
            onClick={e => { e.stopPropagation(); if (!disabled || selected) onToggle(); }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
              <p style={{ fontSize:14, fontWeight:700, letterSpacing:"-0.025em", margin:0,
                color: selected ? "#fff" : "rgba(255,255,255,0.88)" }}>
                {habit.label}
              </p>
              {aiSuggested && !selected && (
                <span style={{
                  fontSize:9, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase",
                  color:"#a78bfa", background:"rgba(130,80,255,0.15)", border:"1px solid rgba(130,80,255,0.28)",
                  borderRadius:4, padding:"1px 5px", flexShrink:0,
                }}>AI</span>
              )}
            </div>
            <p style={{ fontSize:11, color: selected ? "rgba(235,235,245,0.60)" : "rgba(255,255,255,0.45)",
              margin:0, lineHeight:1.4 }}>
              {habit.desc}
            </p>
          </div>

          {/* expand + checkbox row */}
          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            {/* info toggle */}
            <button
              onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
              style={{ width:22, height:22, borderRadius:99, border:"1px solid rgba(255,255,255,0.1)",
                background:"transparent", cursor:"pointer", display:"flex", alignItems:"center",
                justifyContent:"center", color: expanded ? "#fff" : T4, transition:"all 0.15s",
                padding:0 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                {expanded
                  ? <path d="M18 15l-6-6-6 6"/>
                  : <><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}
              </svg>
            </button>

            {/* checkbox */}
            <div
              onClick={e => { e.stopPropagation(); if (!disabled || selected) onToggle(); }}
              style={{
                width:22, height:22, borderRadius:"50%", cursor: (disabled && !selected) ? "not-allowed" : "pointer",
                border:"2px solid " + (selected ? habit.color : "#3a3a3c"),
                background: selected ? habit.color : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow: selected ? ("0 0 10px " + habit.color + "50") : "none",
                transition:"all 0.18s",
              }}>
              {selected && <svg width="10" height="10" viewBox="0 0 11 11" fill="none">
                <path d="M2 5.5L4.5 8L9 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>}
            </div>
          </div>
        </div>

        {/* expanded why */}
        {expanded && (
          <div style={{ paddingTop:10, marginTop:10, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize:9, fontWeight:700, color: habit.color+"99",
              letterSpacing:"0.06em", textTransform:"uppercase" }}>
              {habit.impact}
            </span>
            <p style={{ fontSize:12, color:T3, margin:"4px 0 0", lineHeight:1.6 }}>
              {habit.why}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── RECOMMENDED PACKS ────────────────────────────────────────────────────────
const packIcon = (children: ReactNode) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const PACKS = [
  {
    id:"longevity",
    label:"Longevity Stack",
    subtitle:"Most replicated across populations",
    desc:"Four habits consistently found across the world's longest-living populations — walking, plants, social connection, and aerobic base. The most replicated longevity data on earth.",
    research:"Blue Zones · Buettner, Am J Lifestyle Med 2016 · Kaplan et al., NEJM 2011",
    color:C_PHYSICAL,
    icon: packIcon(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>),
    ids:["steps","veggies","callsomeone","zone2cardio"],
    tags:["Daily walking","Vegetables","Social connection","Zone 2 cardio"],
  },
  {
    id:"energyOS",
    label:"Circadian Reset",
    subtitle:"Strongest current RCT evidence",
    desc:"Five habits targeting circadian biology — the most active area of habit research right now. Morning light, eating window, post-meal walks and two cortisol disruptors all have replicated RCT evidence.",
    research:"Circadian biology · Panda et al., Cell Metab 2019 · Sutton et al., Cell Metab 2018",
    color:C_ENERGY,
    icon: packIcon(<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/></>),
    ids:["sunlight","walkaftermeals","eatingwindow","noalcohol","caffeine"],
    tags:["Morning sunlight","Post-meal walk","10–12hr window","No alcohol","No late caffeine"],
  },
  {
    id:"gut",
    label:"Gut & Metabolism",
    subtitle:"Tier-1 peer-reviewed evidence",
    desc:"Four habits with the strongest combined RCT evidence for microbiome diversity and glucose control. Physiology Reviews is the highest-tier journal in this field.",
    research:"Cryan et al., Physiol Rev 2019 · Sonnenburg & Sonnenburg, Nature 2022",
    color:C_PHYSICAL,
    icon: packIcon(<><ellipse cx="12" cy="12" rx="10" ry="6"/><path d="M12 6c0 0-4 2-4 6s4 6 4 6"/><path d="M12 6c0 0 4 2 4 6s-4 6-4 6"/></>),
    ids:["veggies","walkaftermeals","nosugar","eatingwindow"],
    tags:["Vegetables","Post-meal walk","No sugar","10–12hr window"],
  },
  {
    id:"recovery",
    label:"Recover & Rebuild",
    subtitle:"HRV & cortisol — measurable outcomes",
    desc:"Four habits with peer-reviewed evidence for improving HRV and reducing cortisol — the two most reliable physiological markers of recovery. Thayer's HRV work has 3,000+ citations.",
    research:"Thayer et al., Neurosci Biobehav Rev 2012 · Zaccaro et al., Front Hum Neurosci 2018",
    color:C_MENTAL,
    icon: packIcon(<><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>),
    ids:["sleep","breathwork","coldshower","presleepbath"],
    tags:["Sleep 7–8hrs","Breathwork","Cold shower","Pre-sleep bath"],
  },
  {
    id:"momentum",
    label:"Momentum Builder",
    subtitle:"Highest completion rate",
    desc:"Three habits chosen by the actual research behind the 21-day myth. Lally's UCL study tracked 96 people over 12 weeks — these are the habits with the lowest dropout and fastest automaticity.",
    research:"Lally et al., Eur J Soc Psychol 2010 · Wood & Neal, Annu Rev Psychol 2016",
    color:C_BRAND,
    icon: packIcon(<><path d="M5 12h14M12 5l7 7-7 7"/></>),
    ids:["water","steps","preparetomorrow"],
    tags:["Hydration","Steps","Prep tomorrow"],
  },
  {
    id:"mindBody",
    label:"Mind–Body",
    subtitle:"Cognitive + physical, evidence-matched",
    desc:"Five habits where both the mental and physical effects have been independently replicated. Meditation's structural brain changes and exercise's neuroplasticity effects are among the most cited habit studies.",
    research:"Hölzel et al., Psychiatry Res 2011 · Cotman & Berchtold, Trends Neurosci 2002",
    color:C_MENTAL,
    icon: packIcon(<><circle cx="12" cy="5" r="2"/><path d="M9.5 14V11a2.5 2.5 0 0 1 5 0v3"/><path d="M6.5 6.5h11M9.5 17.5h5"/></>),
    ids:["meditation","read","exercise","nosocialmedia","journal"],
    tags:["Meditation","Reading","Exercise","No social media","Journaling"],
  },
  {
    id:"foundation",
    label:"Foundation",
    subtitle:"Minimum effective dose",
    desc:"Four habits — one physical, one mental, one hydration, one elimination. Designed around Fogg's minimum viable habit framework. Best starting point for habit-naive users.",
    research:"Fogg Behavior Model, Stanford 2019 · Gardner et al., Br J Gen Pract 2012",
    color:C_BRAND,
    icon: packIcon(<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>),
    ids:["sleep","steps","water","nosugar"],
    tags:["Sleep","Steps","Hydration","No sugar"],
  },
  {
    id:"balanced",
    label:"Balanced Daily",
    subtitle:"Cross-domain coverage",
    desc:"Four habits covering movement, hydration, reflection and elimination. Designed for people who want coverage across domains without overloading any single area.",
    research:"Oaten & Cheng, J Exp Soc Psychol 2006 · Pressman et al., Psychosom Med 2009",
    color:C_PHYSICAL,
    icon: packIcon(<><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></>),
    ids:["exercise","water","read","stretch"],
    tags:["Exercise","Hydration","Reading","Stretch / mobility"],
  },
  {
    id:"performance",
    label:"Peak Performance",
    subtitle:"VO2 max + sleep + focus",
    desc:"Five habits where the performance evidence is strongest. Zone 2 cardio is the single best predictor of all-cause mortality. Sleep and deep work have the highest effect sizes for cognitive output.",
    research:"Mandsager et al., JAMA Network 2018 · Walker, Why We Sleep, Nat Rev Neurosci 2017",
    color:C_ENERGY,
    icon: packIcon(<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>),
    ids:["sleep","proteintarget","deepwork","visualisation","preparetomorrow"],
    tags:["Sleep","Protein target","Deep work","Visualisation","Prep tomorrow"],
  },
  {
    id:"clean",
    label:"Clean Slate",
    subtitle:"Elimination — maximum transformation",
    desc:"Six eliminations — the hardest pack. Each removal has independent RCT evidence for energy, mood and sleep improvement. For people who know exactly what is holding them back.",
    research:"Kessler et al., Psychol Med 2014 · Rehm et al., Lancet 2009 · Calder et al., AJCN 2020",
    color:C_ALERT,
    icon: packIcon(<><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>),
    ids:["noalcohol","nosugar","noscreens","noprocessed","caffeine","nosmoking"],
    tags:["No alcohol","No sugar","No screens","No junk food","No late caffeine","No smoking"],
  },
];

// ─── TOP PICKS — highest evidence, widest population research ─────────────────
const COACHED_PACKS = [
  {
    id:"top_foundation",
    label:"Foundation",
    subtitle:"Highest completion rate in 21-day studies",
    color:C_BRAND,
    ids:["sleep","steps","water","nosugar"],
    tags:["Sleep","Steps","Hydration","No sugar"],
    insights:[
      { metric:"Effect size", status:"Very high", color:C_PHYSICAL },
      { metric:"Completion",  status:"82%",       color:C_BRAND    },
    ],
  },
  {
    id:"top_balanced",
    label:"Balanced Daily",
    subtitle:"Most replicated across studies",
    color:C_PHYSICAL,
    ids:["exercise","water","read","stretch"],
    tags:["Exercise","Hydration","Reading","Stretch"],
    insights:[
      { metric:"Research base", status:"Strongest", color:C_PHYSICAL },
      { metric:"Popularity",    status:"#1 pick",   color:C_BRAND    },
    ],
  },
  {
    id:"top_momentum",
    label:"Momentum Builder",
    subtitle:"Easiest to stick with long-term",
    color:C_ENERGY,
    ids:["water","steps","preparetomorrow"],
    tags:["Hydration","Steps","Prep tomorrow"],
    insights:[
      { metric:"Dropout rate", status:"Lowest",  color:C_PHYSICAL },
      { metric:"Avg streak",   status:"19 days", color:C_ENERGY   },
    ],
  },
];

const PACK_META = {
  longevity:   { benefit:"Most replicated evidence",    pill:"#1 Evidence",     pillColor:C_PHYSICAL },
  energyOS:    { benefit:"Strongest current RCTs",      pill:"Top RCT",         pillColor:C_ENERGY   },
  gut:         { benefit:"Tier-1 journal research",     pill:"Tier-1",          pillColor:C_PHYSICAL },
  recovery:    { benefit:"Measurable in 7 days",        pill:"Recovery",        pillColor:C_MENTAL   },
  momentum:    { benefit:"Easiest to stick with",       pill:"Easy start",      pillColor:C_BRAND    },
  mindBody:    { benefit:"Mind + body balance",         pill:"Balanced",        pillColor:C_MENTAL   },
  foundation:  { benefit:"Best for beginners",          pill:"Beginner",        pillColor:C_BRAND    },
  balanced:    { benefit:"Cross-domain coverage",       pill:"Popular",         pillColor:C_PHYSICAL },
  performance: { benefit:"VO2 max + sleep + focus",     pill:"Advanced",        pillColor:C_ENERGY   },
  clean:       { benefit:"Maximum transformation",      pill:"High discipline", pillColor:C_ALERT    },
};
interface AiSuggestedHabit { name: string; slug: string; why: string; first_step: string; category: string; }

/** Resolve an API slug + habit name to a known ALL_HABITS id.
 *  Tries: exact slug → alias map → normalised slug → label word match → original slug. */
const SLUG_ALIASES: Record<string, string> = {
  // protein
  protein_first: "proteintarget", proteinfirst: "proteintarget",
  eat_protein_first: "proteintarget", eatproteinfirst: "proteintarget",
  // walking
  walk_after_dinner: "walkaftermeals", walkafterdinner: "walkaftermeals",
  walk_after_meal: "walkaftermeals", walkaftermeal: "walkaftermeals",
  post_meal_walk: "walkaftermeals", postmealwalk: "walkaftermeals",
  // strength
  strength: "strengthtraining",
  strength_train: "strengthtraining", strengthtrain: "strengthtraining",
  strength_training: "strengthtraining",
  resistance_training: "strengthtraining", resistancetraining: "strengthtraining",
  // hiit
  hiit_session: "hiit", hiitsession: "hiit",
  // zone2
  zone_2: "zone2cardio", zone2: "zone2cardio",
  zone_2_cardio: "zone2cardio", zone2_cardio: "zone2cardio",
};
const NAME_ALIASES: Record<string, string> = {
  "eat protein": "proteintarget",
  "protein first": "proteintarget",
  "walk after dinner": "walkaftermeals",
  "walk after meal": "walkaftermeals",
  "strength train": "strengthtraining",
  "strength training": "strengthtraining",
  "resistance training": "strengthtraining",
  "hiit session": "hiit",
  "hiit workout": "hiit",
  "12-hour eating window": "eatingwindow",
  "12 hour eating window": "eatingwindow",
  "cut added sugar": "nosugar",
  "no added sugar": "nosugar",
  "sleep 7-9 hours": "sleep",
  "sleep 7–9 hours": "sleep",
  "sleep 7-8 hours": "sleep",
};
function resolveHabitId(slug: string | null | undefined, name?: string): string {
  if (!slug) return name ?? "";
  // 0. name-alias wins first when name is provided (handles wrong slugs from API)
  if (name) {
    const nameLow = name.toLowerCase().trim();
    const nameAlias = NAME_ALIASES[nameLow] ?? NAME_ALIASES[nameLow.split(/\s+/).slice(0, 2).join(" ")];
    if (nameAlias) return nameAlias;
  }
  // 1. exact slug match
  const direct = ALL_HABITS.find(h => h.id === slug);
  if (direct) return direct.id;
  // 2. alias override
  const norm = slug.replace(/[_\-\s]+/g, "").toLowerCase();
  const alias = SLUG_ALIASES[slug] ?? SLUG_ALIASES[norm];
  if (alias) return alias;
  // 3. strip underscores/hyphens/spaces (snake_case → camelcase)
  const byNorm = ALL_HABITS.find(h => h.id.toLowerCase() === norm);
  if (byNorm) return byNorm.id;
  // 4. match by label prefix
  if (name) {
    const nameLow = name.toLowerCase().trim();
    const w = nameLow.split(/\s+/).slice(0, 2).join(" ");
    const byLabel = ALL_HABITS.find(h => h.label.toLowerCase().startsWith(w) || h.label.toLowerCase().includes(w));
    if (byLabel) return byLabel.id;
  }
  // 5. fall back to original slug
  return slug;
}

function PackPickerScreen({ onSelectPack, onStartDirect, onSelectAiPack, onCustom, onBack }: {
  onSelectPack: (ids: string[]) => void;
  onStartDirect: (ids: string[], packId?: string) => void;
  onSelectAiPack: (ids: string[]) => void;
  onCustom: () => void;
  onBack?: () => void;
}) {
  const ah = useHabits();
  const router = useRouter();
  const packsRef = useRef<HTMLDivElement>(null);
  const [pressed, setPressed]       = useState<string | null>(null);
  const [showAll, setShowAll]       = useState(false);
  const [filterCat, setFilterCat]   = useState<string | null>(null);
  const [preview, setPreview]       = useState<Pack | null>(null);

  const [aiHabits, setAiHabits]         = useState<AiSuggestedHabit[] | null>(null);
  const [aiLoading, setAiLoading]       = useState(true);
  const [aiPressed, setAiPressed]       = useState(false);
  const [showAiPreview, setShowAiPreview] = useState(false);
  const [scanOverdueDays, setScanOverdueDays] = useState<number | null>(null); // null = loading, 0 = never scanned, >0 = days overdue

  useEffect(() => {
    api<{ scan?: any; ai_insight?: any } | any>("/api/body-metrics/insight", { method: "GET", auth: true })
      .then((raw: any) => {
        const insight = raw?.ai_insight ?? raw;
        const habits: AiSuggestedHabit[] = insight?.suggested_habits ?? [];
        setAiHabits(habits.length > 0 ? habits : null);
        // Check scan recency
        const scanDate = raw?.scan?.recorded_date ?? insight?.generated_at ?? null;
        if (!scanDate) {
          setScanOverdueDays(0); // never scanned
        } else {
          const daysSince = Math.floor((Date.now() - new Date(scanDate).getTime()) / 86400000);
          setScanOverdueDays(daysSince > 22 ? daysSince : -1); // -1 = not overdue
        }
      })
      .catch(() => { setAiHabits(null); setScanOverdueDays(0); })
      .finally(() => setAiLoading(false));
  }, []);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 120); }
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTop() { window.scrollTo({ top:0, behavior:"smooth" }); }

  return (
    <>
    <div style={{ minHeight:"100vh", background:"#000", fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif", WebkitFontSmoothing:"antialiased", paddingBottom:120 }}>

      {/* ── Scroll-to-top FAB ── */}
      <style>{"@keyframes fabIn { from { opacity:0; transform:translateY(12px) scale(0.85); } to { opacity:1; transform:translateY(0) scale(1); } } @keyframes fabOut { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(12px) scale(0.85); } }"}</style>
      {scrolled && (
        <button onClick={scrollTop} style={{
          position:"fixed", bottom:28, right:20, zIndex:100,
          width:44, height:44, borderRadius:"50%", cursor:"pointer",
          background:"rgba(20,20,30,0.92)",
          border:"1px solid rgba(255,255,255,0.14)",
          backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
          boxShadow:"0 4px 20px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset",
          display:"flex", alignItems:"center", justifyContent:"center",
          animation:"fabIn 0.22s cubic-bezier(0.34,1.4,0.64,1) forwards",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.75)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </button>
      )}
      <div style={{ maxWidth:390, margin:"0 auto", padding:"0 20px" }}>

        {/* ── Header ── */}
        <div style={{ paddingTop:60, paddingBottom:24 }}>
          {onBack && (
            <button onClick={onBack} style={{
              display:"flex", alignItems:"center", gap:6, marginBottom:16,
              background:"none", border:"none", cursor:"pointer", padding:0,
              color:"rgba(255,255,255,0.6)", fontSize:14, fontWeight:500,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back
            </button>
          )}
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase",
            color:"rgba(255,255,255,0.3)", margin:"0 0 10px" }}>
            21-Day Challenge
          </p>
          <h1 style={{ fontSize:32, fontWeight:800, letterSpacing:"-0.04em", lineHeight:1.05,
            color:"#fff", margin:"0 0 10px" }}>
            Pick your focus.
          </h1>
          <p style={{ fontSize:15, lineHeight:1.55, color:T3, margin:0 }}>
            Each pack is a set of habits built to work together. Pick one to start your 21 days.
          </p>
        </div>

        {/* ── Scan nudge — shown when no scan or overdue 22+ days ── */}
        {!aiLoading && (scanOverdueDays === 0 || (scanOverdueDays !== null && scanOverdueDays > 0)) && !aiHabits && (() => {
          const isNever = scanOverdueDays === 0;
          const overdueDays = scanOverdueDays ?? 0;
          return (
          <div style={{
            borderRadius:16, overflow:"hidden", marginBottom:20,
            background:"#080B14",
            border:"1px solid rgba(56,189,248,0.16)",
          }}>
            <div style={{ height:1, background:"linear-gradient(90deg,transparent,#0ea5e9 30%,#38bdf8 50%,#0ea5e9 70%,transparent)", opacity:0.55 }}/>
            <div style={{ padding:"14px 16px 16px" }}>
              {/* eyebrow */}
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(56,189,248,0.65)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
                </svg>
                <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.09em", textTransform:"uppercase" as const, color:"rgba(56,189,248,0.55)" }}>
                  {isNever ? "No body scan yet" : `Scan overdue · ${overdueDays}d`}
                </span>
              </div>
              {/* headline */}
              <p style={{ fontSize:16, fontWeight:700, letterSpacing:"-0.03em", lineHeight:1.3, color:"rgba(255,255,255,0.90)", margin:"0 0 8px" }}>
                {isNever
                  ? "A body scan unlocks your personalised habits."
                  : "Your scan is due — habits work best with fresh data."}
              </p>
              {/* body */}
              <p style={{ fontSize:13, fontWeight:400, lineHeight:1.65, color:"rgba(255,255,255,0.44)", margin:"0 0 14px", letterSpacing:"-0.01em" }}>
                {isNever
                  ? "Log your body composition once and we'll build a Smart Plan around your actual metrics — visceral fat, muscle, BMR and more."
                  : "After 21 days your body changes. Log a new scan and your next habit set will be built around what's actually changed."}
              </p>
              {/* actions */}
              <div style={{ display:"flex", gap:8 }}>
                <button
                  onClick={() => router.push("/bgmi")}
                  style={{
                    flex:1, height:40, borderRadius:11, border:"none", cursor:"pointer",
                    background:"rgba(14,165,233,0.18)", color:"rgba(56,189,248,0.90)",
                    fontSize:13, fontWeight:700, letterSpacing:"-0.02em",
                  }}>
                  Log scan first
                </button>
                <button
                  onClick={() => packsRef.current?.scrollIntoView({ behavior:"smooth", block:"start" })}
                  style={{
                    flex:1, height:40, borderRadius:11, cursor:"pointer",
                    background:"transparent", border:"1px solid rgba(255,255,255,0.08)",
                    color:"rgba(255,255,255,0.35)", fontSize:12, fontWeight:500, letterSpacing:"-0.01em",
                  }}>
                  Pick habits anyway
                </button>
              </div>
            </div>
          </div>
          );
        })()}

        {/* ── AI Coach Card ── */}
        {(aiLoading || aiHabits) && (
          <div style={{ marginBottom:20 }}>
            {aiLoading ? (
              <div style={{ borderRadius:16, overflow:"hidden", border:"1px solid rgba(130,80,255,0.18)", background:"rgba(14,10,28,0.97)" }}>
                <div style={{ height:2, background:"linear-gradient(90deg,#7c3aed,#a78bfa,#7c3aed)", opacity:0.6 }}/>
                <div style={{ padding:"12px 14px 14px" }}>
                  <div style={{ height:9, width:70, borderRadius:4, background:"rgba(130,80,255,0.2)", marginBottom:10 }}/>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ height:10, borderRadius:4, background:"rgba(255,255,255,0.05)", marginBottom:6, width:i===1?"100%":i===2?"82%":"65%" }}/>
                  ))}
                </div>
              </div>
            ) : aiHabits && aiHabits.length > 0 && (
              <button
                onMouseDown={() => setAiPressed(true)}
                onMouseUp={() => setAiPressed(false)}
                onMouseLeave={() => setAiPressed(false)}
                onClick={() => setShowAiPreview(true)}
                style={{
                  width:"100%", textAlign:"left", cursor:"pointer", display:"block", padding:0,
                  borderRadius:16, overflow:"hidden",
                  border:"1px solid rgba(130,80,255," + (aiPressed ? "0.38" : "0.22") + ")",
                  background: aiPressed ? "rgba(20,12,40,1)" : "rgba(14,10,28,0.97)",
                  transform: aiPressed ? "scale(0.985)" : "scale(1)",
                  transition:"all 0.14s cubic-bezier(0.4,0,0.2,1)",
                }}>
                <div style={{ height:2, background:"linear-gradient(90deg,#7c3aed,#a78bfa,#7c3aed)", opacity:0.75 }}/>
                {/* header */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px 9px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                    <span style={{ fontSize:10, fontWeight:700, color:"#a78bfa", letterSpacing:"0.07em", textTransform:"uppercase" as const }}>Smart Plan</span>
                  </div>
                  <span style={{ fontSize:10, color:"rgba(167,139,250,0.45)", letterSpacing:"-0.01em" }}>{aiHabits.length} habits · View →</span>
                </div>
                {/* habit rows */}
                {aiHabits.map((h, i) => {
                  const catColor = h.category === "fitness" ? "#30D158" : h.category === "nutrition" ? "#FF9F0A" : "#a78bfa";
                  const why = h.why ? h.why.split(".")[0] + "." : "";
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"stretch", borderBottom: i < aiHabits.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <div style={{ width:3, flexShrink:0, background:catColor, opacity:0.7 }}/>
                      <div style={{ flex:1, padding:"9px 14px" }}>
                        <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.90)", letterSpacing:"-0.02em", marginBottom:2 }}>{h.name}</div>
                        {why && <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", lineHeight:1.4 }}>{why}</div>}
                      </div>
                    </div>
                  );
                })}
              </button>
            )}
          </div>
        )}

        {/* ── Single list ── */}
        <div ref={packsRef} style={{ marginBottom:24 }}>

          <p style={{ fontSize:12, color:T3, margin:"0 0 12px", letterSpacing:"-0.01em" }}>
            Tap any pack to preview
          </p>

          {/* goal filter */}
          <div style={{ display:"flex", gap:5, marginBottom:14, flexWrap:"wrap" }}>
            {[
              { key:null,       label:"All"       },
              { key:"beginner", label:"Beginner"  },
              { key:"energy",   label:"Energy"    },
              { key:"focus",    label:"Focus"     },
              { key:"recovery", label:"Recovery"  },
              { key:"advanced", label:"Advanced"  },
            ].map(f => {
              const active = filterCat === f.key;
              return (
                <button key={String(f.key)} onClick={() => setFilterCat(f.key)} style={{
                  padding:"4px 12px", borderRadius:99, fontSize:11, fontWeight:600,
                  cursor:"pointer", flexShrink:0, letterSpacing:"-0.01em",
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  color: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)",
                  border:"1px solid " + (active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)"),
                }}>{f.label}</button>
              );
            })}
          </div>

          {/* pack list — main 6 + explore more */}
          {(() => {
            const PROVEN_IDS = ["foundation","balanced","momentum"];
            const MAIN = ["foundation","balanced","momentum","recovery","energyOS","performance"];
            const MORE = ["longevity","gut","mindBody","clean"];
            const GOAL_TAGS = {
              foundation:  ["beginner"],
              balanced:    ["beginner","focus"],
              momentum:    ["beginner"],
              recovery:    ["recovery"],
              energyOS:    ["energy"],
              performance: ["advanced","focus"],
              longevity:   ["energy","advanced"],
              gut:         ["energy","recovery"],
              mindBody:    ["focus","recovery"],
              clean:       ["advanced"],
            };
            const applyFilter = (ids: string[]) => {
              const packs = ids.map(id => PACKS.find(p => p.id === id)).filter((p): p is typeof PACKS[number] => p !== undefined);
              return filterCat ? packs.filter(p => ((GOAL_TAGS as Record<string, string[]>)[p.id] || []).includes(filterCat)) : packs;
            };

            const renderCard = (pack: Pack) => {
              const meta = (PACK_META as Record<string, { benefit: string; pill: string; pillColor: string }>)[pack.id] || {};
              const isProven = PROVEN_IDS.includes(pack.id);
              return (
                <button key={pack.id}
                  onClick={() => setPreview(pack)}
                  onMouseDown={() => setPressed(pack.id)}
                  onMouseUp={() => setPressed(null)}
                  onMouseLeave={() => setPressed(null)}
                  style={{
                    width:"100%", textAlign:"left", cursor:"pointer",
                    borderRadius:12, overflow:"hidden", display:"flex",
                    background: pressed === pack.id ? "#1a1a1a" : "#111114",
                    border:"1px solid rgba(255,255,255,0.07)",
                    transform: pressed === pack.id ? "scale(0.985)" : "scale(1)",
                    transition:"all 0.14s cubic-bezier(0.4,0,0.2,1)",
                  }}>
                  <div style={{ width:4, flexShrink:0, background:pack.color, opacity:0.9 }}/>
                  <div style={{ flex:1, padding:"12px 12px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
                      <div style={{ width:30, height:30, borderRadius:8, flexShrink:0,
                        background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)",
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {pack.icon}
                      </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <span style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.88)", letterSpacing:"-0.02em" }}>
                            {pack.label}
                          </span>
                          <p style={{ fontSize:10, color:"rgba(255,255,255,0.48)", margin:"2px 0 0" }}>{meta.benefit || pack.subtitle}</p>
                        </div>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </div>
                  </div>
                </button>
              );
            };

            const visibleMain = applyFilter(MAIN);
            const visibleMore = applyFilter(MORE);

            return (
              <>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {visibleMain.map(renderCard)}
                </div>

                {visibleMore.length > 0 && (
                  <div style={{ marginTop:16 }}>
                    <button onClick={() => setShowAll(v => !v)} style={{
                      display:"flex", alignItems:"center", gap:6,
                      background:"none", border:"none", cursor:"pointer", padding:"8px 0",
                    }}>
                      <span style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.35)", letterSpacing:"0.01em" }}>
                        {showAll ? "Show less" : "Explore more packs"}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(255,255,255,0.25)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: showAll ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.2s" }}>
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </button>
                    {showAll && (
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        {visibleMore.map(renderCard)}
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* ── Build your own ── */}
        <button onClick={onCustom} style={{
          width:"100%", padding:"16px", borderRadius:14, cursor:"pointer",
          background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.09)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          transition:"all 0.14s",
        }}
          onMouseDown={e => { e.currentTarget.style.background="rgba(255,255,255,0.07)"; }}
          onMouseUp={e => { e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}>
          <div style={{ textAlign:"left" }}>
            <p style={{ fontSize:14, fontWeight:700, color:T2, margin:"0 0 2px", letterSpacing:"-0.02em" }}>Build your own</p>
            <p style={{ fontSize:11, color:T4, margin:0 }}>Start from scratch — choose habits individually</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

      </div>
    </div>

    {/* ── Pack preview modal ── */}
    {preview && (
      <div onClick={() => setPreview(null)} style={{
        position:"fixed", inset:0, zIndex:200,
        background:"rgba(0,0,0,0.75)",
        backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
        display:"flex", alignItems:"flex-end",
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          width:"100%", maxWidth:390, margin:"0 auto",
          background:"#111116", borderRadius:"20px 20px 0 0",
          border:"1px solid rgba(255,255,255,0.08)",
          borderBottom:"none", padding:"20px 20px 40px",
        }}>
          {/* handle + close */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div style={{ width:36, height:4, borderRadius:99, background:"rgba(255,255,255,0.12)" }}/>
            <button onClick={() => setPreview(null)} style={{
              width:28, height:28, borderRadius:"50%", border:"none", cursor:"pointer",
              background:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center",
              color:"rgba(255,255,255,0.5)", padding:0,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* header */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
            {preview.icon && (
              <div style={{ width:38, height:38, borderRadius:11, flexShrink:0,
                background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.45)",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                {preview.icon}
              </div>
            )}
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:18, fontWeight:800, color:"#fff", letterSpacing:"-0.035em" }}>{preview.label}</span>
                {(PACK_META as Record<string, { benefit: string; pill: string; pillColor: string }>)[preview.id] && (
                  <span style={{ fontSize:9, fontWeight:600, padding:"2px 6px", borderRadius:99,
                    background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.52)",
                    letterSpacing:"0.03em" }}>
                    {(PACK_META as Record<string, { benefit: string; pill: string; pillColor: string }>)[preview.id].pill}
                  </span>
                )}
              </div>
              {(PACK_META as Record<string, { benefit: string; pill: string; pillColor: string }>)[preview.id] && (
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)", margin:"2px 0 0" }}>{(PACK_META as Record<string, { benefit: string; pill: string; pillColor: string }>)[preview.id].benefit}</p>
              )}
            </div>
          </div>

          {/* color accent under title */}
          <div style={{ width:24, height:2, borderRadius:99, background:preview.color, marginBottom:16, opacity:0.8 }}/>

          {/* habits list */}
          <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase", color:"rgba(255,255,255,0.2)", margin:"0 0 8px" }}>
            Included habits
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:20 }}>
            {preview.ids.map(id => {
              const h = ALL_HABITS.find(x => x.id === id);
              if (!h) return null;
              return (
                <div key={id} style={{ display:"flex", alignItems:"center", gap:10,
                  padding:"10px 12px", borderRadius:10,
                  background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ width:4, alignSelf:"stretch", borderRadius:99, background:h.color, flexShrink:0, opacity:0.7 }}/>
                  <div style={{ width:26, height:26, borderRadius:7, flexShrink:0,
                    background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)",
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {h.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.85)", margin:"0 0 1px", letterSpacing:"-0.02em" }}>{h.label}</p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.48)", margin:0 }}>{h.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* actions */}
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => { onStartDirect(preview.ids, preview.id); setPreview(null); }} style={{
              flex:1, height:50, borderRadius:12, border:"none", cursor:"pointer",
              background:"#fff", fontSize:14, fontWeight:700, color:"#000", letterSpacing:"-0.02em",
            }}>
              Start this pack
            </button>
            <button onClick={() => { onSelectPack(preview.ids); setPreview(null); }} style={{
              flex:1, height:50, borderRadius:12, cursor:"pointer",
              background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.09)",
              fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.55)", letterSpacing:"-0.01em",
            }}>
              Customize it
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── AI Coach preview modal ── */}
    {showAiPreview && aiHabits && (
      <div onClick={() => setShowAiPreview(false)} style={{
        position:"fixed", inset:0, zIndex:200,
        background:"rgba(0,0,0,0.72)",
        backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)",
        display:"flex", alignItems:"flex-end",
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          width:"100%", maxWidth:390, margin:"0 auto",
          background:"rgba(14,10,28,0.99)", borderRadius:"20px 20px 0 0",
          border:"1px solid rgba(130,80,255,0.2)", borderBottom:"none", overflow:"hidden",
        }}>
          {/* top rule */}
          <div style={{ height:2, background:"linear-gradient(90deg,#7c3aed,#a78bfa,#7c3aed)", opacity:0.75 }}/>

          {/* header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px 12px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              <span style={{ fontSize:10, fontWeight:700, color:"#a78bfa", letterSpacing:"0.07em", textTransform:"uppercase" as const }}>Smart Plan</span>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.2)", marginLeft:2 }}>· {aiHabits.length} habits</span>
            </div>
            <button onClick={() => setShowAiPreview(false)} style={{
              width:26, height:26, borderRadius:"50%", border:"none", cursor:"pointer",
              background:"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", padding:0,
            }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* habit rows */}
          {aiHabits.map((ah, i) => {
            const catColor = ah.category === "fitness" ? "#30D158" : ah.category === "nutrition" ? "#FF9F0A" : "#a78bfa";
            const why = ah.why ? ah.why.split(".")[0] + "." : "";
            return (
              <div key={i} style={{ display:"flex", alignItems:"stretch", borderBottom: i < aiHabits.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div style={{ width:3, flexShrink:0, background:catColor, opacity:0.7 }}/>
                <div style={{ flex:1, padding:"11px 16px" }}>
                  <div style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.90)", letterSpacing:"-0.02em", marginBottom:3 }}>{ah.name}</div>
                  {why && <div style={{ fontSize:11, color:"rgba(255,255,255,0.38)", lineHeight:1.45 }}>{why}</div>}
                </div>
              </div>
            );
          })}

          {/* actions */}
          <div style={{ display:"flex", gap:0, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
            <button
              onClick={() => { const slugs = [...new Set(aiHabits.map(h => resolveHabitId(h.slug, h.name)).filter(Boolean))]; onSelectAiPack(slugs); setShowAiPreview(false); }}
              style={{ flex:1, height:52, border:"none", borderRight:"1px solid rgba(255,255,255,0.06)", cursor:"pointer", background:"transparent", fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.50)", letterSpacing:"-0.01em" }}>
              Customise
            </button>
            <button
              onClick={() => { const slugs = [...new Set(aiHabits.map(h => resolveHabitId(h.slug, h.name)).filter(Boolean))]; onStartDirect(slugs); setShowAiPreview(false); }}
              style={{ flex:1, height:52, border:"none", cursor:"pointer", background:"transparent", fontSize:14, fontWeight:700, color:"#c4b5fd", letterSpacing:"-0.02em" }}>
              Start now
            </button>
          </div>
          <div style={{ height:34 }}/>
        </div>
      </div>
    )}
  </>
  );
}


function HabitSetupPage({ initialSelected, aiSuggestedIds, isReview, onComplete, onBack }: {
  initialSelected?: string[];
  aiSuggestedIds?: string[];
  isReview?: boolean;
  onComplete: (ids: string[], customIds: number[]) => void;
  onBack?: () => void;
}) {
  const ah = useHabits();
  const [selected, setSelected] = useState<string[]>(initialSelected || []);
  const [activeTier, setActiveTier] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [customHabits, setCustomHabits] = useState<{ id: number; name: string; emoji: string }[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmoji, setCustomEmoji] = useState("✨");
  const [savingCustom, setSavingCustom] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 120); }
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTop() { window.scrollTo({ top:0, behavior:"smooth" }); }

  const toggle = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter((x: string) => x !== id);
      if (prev.length + customHabits.length >= MAX_HABITS) return prev;
      return [...prev, id];
    });
  };

  const totalSelected = selected.length + customHabits.length;
  const canProceed = totalSelected >= MIN_HABITS;
  const atMax = totalSelected >= MAX_HABITS;

  const saveCustomHabit = async () => {
    const name = customName.trim();
    if (!name || savingCustom) return;
    if (totalSelected >= MAX_HABITS) return;
    setSavingCustom(true);
    try {
      const res = await api<{ id: number; name: string; emoji: string }>("/api/habits/custom", {
        method: "POST",
        body: JSON.stringify({ name, emoji: customEmoji }),
      });
      setCustomHabits(prev => [...prev, res]);
      setCustomName("");
      setCustomEmoji("✨");
      setShowCustomInput(false);
    } catch {
      // ignore
    } finally {
      setSavingCustom(false);
    }
  };

  const removeCustom = (id: number) => {
    setCustomHabits(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div style={{ minHeight:"100vh", background:"#000", fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif", WebkitFontSmoothing:"antialiased", paddingBottom:120 }}>

      {/* ── Sticky bar — shows whenever at least one habit selected ── */}
      {selected.length > 0 && (
        <div style={{
          position:"fixed", top:0, left:0, right:0, zIndex:90,
          background:"rgba(0,0,0,0.94)",
          backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
          borderBottom:"1px solid rgba(255,255,255,0.07)",
          padding:"10px 20px 8px",
          animation:"fabIn 0.2s cubic-bezier(0.4,0,0.2,1) forwards",
        }}>
          <div style={{ maxWidth:390, margin:"0 auto" }}>

            {/* row: back + title + count */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {onBack && (
                  <button onClick={onBack} style={{
                    width:28, height:28, borderRadius:"50%", flexShrink:0,
                    background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)",
                    cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:0,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 5l-7 7 7 7"/>
                    </svg>
                  </button>
                )}
                <span style={{ fontSize:13, fontWeight:700, color:"#fff", letterSpacing:"-0.02em" }}>
                  Your habits
                </span>
              </div>
              <span style={{ fontSize:12, fontWeight:600, color:T3, letterSpacing:"-0.01em", fontVariantNumeric:"tabular-nums" }}>
                {totalSelected}/{MAX_HABITS}
              </span>
            </div>

            {/* load + balance — single compact row */}
            {(() => {
              const hasBody      = selected.some((id: string) => { const h = ALL_HABITS.find(x => x.id===id); return h && h.category==="Body"; });
              const hasMind      = selected.some((id: string) => { const h = ALL_HABITS.find(x => x.id===id); return h && h.category==="Mind"; });
              const hasLifestyle = selected.some((id: string) => { const h = ALL_HABITS.find(x => x.id===id); return h && h.category==="Lifestyle"; });
              const catCount     = [hasBody,hasMind,hasLifestyle].filter(Boolean).length;
              const loadLabel = selected.length <= 2 ? "Light" : selected.length <= 4 ? "Moderate" : "Challenging";
              const loadColor = selected.length <= 2 ? C_PHYSICAL : selected.length <= 4 ? C_ENERGY : C_ALERT;
              let hint: string | null = null, hintColor = T4;
              if (!hasBody)            { hint = "Add a Body habit";              hintColor = T4; }
              else if (catCount === 1) { hint = "Add a Mind habit for balance";  hintColor = C_MENTAL; }
              else if (catCount === 2) { hint = "Add Lifestyle for full balance"; hintColor = C_ENERGY; }
              return (
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                  <span style={{ fontSize:11, fontWeight:600, color:loadColor, letterSpacing:"-0.01em", flexShrink:0 }}>{loadLabel}</span>
                  {hint && <>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.15)" }}>·</span>
                    <div style={{ width:4, height:4, borderRadius:"50%", background:hintColor, flexShrink:0 }}/>
                    <span style={{ fontSize:11, color:hintColor, letterSpacing:"-0.01em", fontWeight:500 }}>{hint}</span>
                  </>}
                </div>
              );
            })()}

            {/* progress track */}
            <div style={{ display:"flex", gap:4, marginBottom:8 }}>
              {Array.from({ length: MAX_HABITS }).map((_, i) => (
                <div key={i} style={{
                  flex:1, height:2, borderRadius:99,
                  background: i < totalSelected ? C_BRAND : "rgba(255,255,255,0.1)",
                  boxShadow: i < totalSelected ? "0 0 6px rgba(10,132,255,0.5)" : "none",
                  transition:"all 0.25s",
                }}/>
              ))}
            </div>

            {/* individual selected habit chips — sorted by impact rank */}
            {(() => {
              const RANK = {
                sleep:1, exercise:2, water:3, steps:4,
                meditation:5, nosugar:6, noscreens:7, noalcohol:8,
                sunlight:9, journal:10, breathwork:11, zone2cardio:12,
                veggies:13, walkaftermeals:14, eatingwindow:15, caffeine:16,
                deepwork:17, read:18, noprocessed:19, nosocialmedia:20,
                stretch:21, coldshower:22, proteintarget:23, visualisation:24,
                learn:25, callsomeone:26, preparetomorrow:27, presleepbath:28,
                timeblock:29, daily5goals:30, nosmoking:31, discomfortchallenge:32,
                trackspending:33, nearfareye:34, proactivelanguage:35,
                strength:36, hiit:37,
              };
              const sorted = [...selected].sort((a: string, b: string) => (RANK[a as keyof typeof RANK]||99) - (RANK[b as keyof typeof RANK]||99));
              return (
                <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
                  {sorted.map(id => {
                    const h = ALL_HABITS.find(x => x.id === id);
                    if (!h) return null;
                    return (
                      <div key={id} style={{
                        display:"flex", alignItems:"center", gap:5,
                        padding:"4px 6px 4px 9px", borderRadius:7,
                        background: h.color+"12", border:"1px solid " + h.color+"25",
                      }}>
                        <div style={{ width:5, height:5, borderRadius:"50%", background:h.color, flexShrink:0 }}/>
                        <span style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.85)", letterSpacing:"-0.01em", whiteSpace:"nowrap" }}>
                          {h.label.split(" ").slice(0,3).join(" ")}
                        </span>
                        <button onClick={() => toggle(id)} style={{
                          width:14, height:14, borderRadius:"50%", flexShrink:0,
                          background:"rgba(255,255,255,0.08)", border:"none", cursor:"pointer",
                          display:"flex", alignItems:"center", justifyContent:"center", padding:0,
                          transition:"background 0.15s",
                        }}
                          onMouseDown={e => { e.currentTarget.style.background="rgba(255,255,255,0.2)"; }}
                          onMouseUp={e => { e.currentTarget.style.background="rgba(255,255,255,0.08)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.08)"; }}>
                          <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                            <path d="M1 1l6 6M7 1L1 7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* sticky category filter chips */}
            <div style={{ display:"flex", gap:6, overflowX:"auto" }}>
              {[
                { key:null,        label:"All",       color:"rgba(255,255,255,0.85)", border:"rgba(255,255,255,0.1)" },
                { key:"Body",      label:"Body",      color:C_PHYSICAL,               border:C_PHYSICAL+"45" },
                { key:"Mind",      label:"Mind",      color:C_MENTAL,                 border:C_MENTAL+"45" },
                { key:"Lifestyle", label:"Lifestyle", color:C_ENERGY,                 border:C_ENERGY+"45" },
              ].map(item => {
                const active = activeTier === item.key;
                return (
                  <button key={String(item.key)} onClick={() => setActiveTier(item.key)} style={{
                    padding:"4px 12px", borderRadius:99, fontSize:11, fontWeight:600, cursor:"pointer", flexShrink:0,
                    background: active ? (item.key ? item.color+"18" : "rgba(255,255,255,0.1)") : "transparent",
                    color: active ? item.color : "rgba(255,255,255,0.3)",
                    border:"1px solid " + (active ? item.border : "rgba(255,255,255,0.08)"),
                  }}>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {scrolled && (
        <button onClick={scrollTop} style={{
          position:"fixed", bottom:110, right:20, zIndex:100,
          width:44, height:44, borderRadius:"50%", cursor:"pointer",
          background:"rgba(20,20,30,0.92)",
          border:"1px solid rgba(255,255,255,0.14)",
          backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
          boxShadow:"0 4px 20px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset",
          display:"flex", alignItems:"center", justifyContent:"center",
          animation:"fabIn 0.22s cubic-bezier(0.34,1.4,0.64,1) forwards",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.75)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </button>
      )}
      <div style={{ maxWidth:390, margin:"0 auto", padding:"0 18px" }}>

        {/* Header */}
        <div style={{ paddingTop: selected.length > 0 ? 168 : 56, paddingBottom:24, transition:"padding-top 0.2s" }}>
          {onBack && (
            <button onClick={onBack} style={{
              display:"flex", alignItems:"center", gap:6, marginBottom:16,
              background:"none", border:"none", cursor:"pointer", padding:0,
              color:T3, fontSize:14, fontWeight:500,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back
            </button>
          )}
          <p style={{ fontSize:12, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:C_BRAND, margin:"0 0 8px" }}>
            {isReview ? "Day 21 Review" : "21-Day Commitment"}
          </p>
          <h1 style={{ fontSize:30, fontWeight:800, letterSpacing:"-0.04em", lineHeight:1.15, color:"#fff", margin:"0 0 10px" }}>
            {isReview ? "Adjust your habits" : "Choose your habits"}
          </h1>
          <p style={{ fontSize:15, lineHeight:1.6, color:T2, margin:0 }}>
            {isReview ? "Keep what worked. Swap what didn't." : "Pick 2–6 habits for 21 days. Start lighter if you're new to this."}
          </p>
        </div>

        {/* AI Coach banner — shown when habits were AI-suggested */}
        {aiSuggestedIds && aiSuggestedIds.length > 0 && (
          <div style={{
            borderRadius:14, overflow:"hidden", marginBottom:20,
            border:"1px solid rgba(130,80,255,0.22)",
            background:"rgba(100,50,220,0.08)",
          }}>
            <div style={{ height:2, background:"linear-gradient(90deg,#7c3aed,#a78bfa,#7c3aed)", opacity:0.7 }}/>
            <div style={{ padding:"12px 14px 14px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#a78bfa" }}>
                  Tailored for you
                </span>
              </div>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", margin:"0 0 10px", lineHeight:1.5 }}>
                Pre-selected based on your body metrics. Swap any habit below — these are suggestions, not requirements.
              </p>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {aiSuggestedIds.map(slug => {
                  const h = ALL_HABITS.find(x => x.id === slug);
                  if (!h) return null;
                  const isKept = selected.includes(slug);
                  return (
                    <span key={slug} style={{
                      fontSize:11, fontWeight:600, letterSpacing:"-0.01em",
                      padding:"3px 9px", borderRadius:99,
                      background: isKept ? "rgba(130,80,255,0.2)" : "rgba(255,255,255,0.05)",
                      border:"1px solid " + (isKept ? "rgba(130,80,255,0.4)" : "rgba(255,255,255,0.1)"),
                      color: isKept ? "#c4b5fd" : "rgba(255,255,255,0.35)",
                      textDecoration: isKept ? "none" : "line-through",
                      transition:"all 0.2s",
                    }}>{h.label.split(" ").slice(0,3).join(" ")}</span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Category filter chips — hidden when sticky bar showing */}
        {!(selected.length > 0) && (
        <div style={{ display:"flex", gap:7, marginBottom:24, marginTop:20, overflowX:"auto" }}>
          {[
            { key:null,          label:"All",       color:"rgba(255,255,255,0.85)", border:"rgba(255,255,255,0.1)" },
            { key:"Body",        label:"Body",      color:C_PHYSICAL,               border:C_PHYSICAL+"45" },
            { key:"Mind",        label:"Mind",      color:C_MENTAL,                 border:C_MENTAL+"45" },
            { key:"Lifestyle",   label:"Lifestyle", color:C_ENERGY,                 border:C_ENERGY+"45" },
          ].map(item => {
            const active = activeTier === item.key;
            return (
              <button key={String(item.key)} onClick={() => setActiveTier(item.key)} style={{
                padding:"5px 14px", borderRadius:99, fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0,
                background: active ? (item.key ? item.color+"18" : "rgba(255,255,255,0.1)") : "transparent",
                color: active ? item.color : "rgba(255,255,255,0.3)",
                border: "1px solid " + (active ? item.border : "rgba(255,255,255,0.08)"),
              }}>
                {item.label}
              </button>
            );
          })}
        </div>
        )}

        {/* Habit groups — by category */}
        {[
          { key:"Body",      label:"Body",      color:C_PHYSICAL, icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 22V12m0 0l-4-4m4 4l4-4M8 22v-4m8 0v4"/></svg> },
          { key:"Mind",      label:"Mind",      color:C_MENTAL,   icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44L5.5 12H2"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44L19 12h2.5"/></svg> },
          { key:"Lifestyle", label:"Lifestyle", color:C_ENERGY,   icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg> },
        ]
          .filter(g => !activeTier || activeTier === g.key)
          .map(group => {
            const habits = ah.filter(h => h.category === group.key);
            if (!habits.length) return null;
            return (
              <div key={group.key} style={{ marginBottom:28 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
                  <div style={{ width:3, height:16, borderRadius:99, background:group.color }}/>
                  <span style={{ color:group.color }}>{group.icon}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:group.color, letterSpacing:"-0.01em" }}>{group.label}</span>
                  <span style={{ fontSize:11, color:T4 }}>· {habits.length}</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {habits.map(h => (
                    <HabitSelectCard
                      key={h.id} habit={h}
                      selected={selected.includes(h.id)}
                      disabled={atMax}
                      onToggle={() => toggle(h.id)}
                      aiSuggested={aiSuggestedIds?.includes(h.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

        {/* Suggest */}
        <div style={{ marginBottom:32 }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:T4, margin:"0 0 8px" }}>Suggest a habit</p>
          <div style={{ display:"flex", gap:8 }}>
            <input
              value={suggestion}
              onChange={e => setSuggestion(e.target.value)}
              placeholder="e.g. Oil pulling, Surya namaskar..."
              style={{ flex:1, height:46, borderRadius:13, fontSize:14, padding:"0 14px", background:"#1c1c1e", border:"1px solid " + (suggestion ? "#0a84ff" : "#3a3a3c"), color:"#fff", fontFamily:"inherit", outline:"none" }}
            />
            <button
              onClick={() => { if (!suggestion.trim()) return; setSuggestion(""); setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); }}
              style={{ width:46, height:46, borderRadius:13, flexShrink:0, border:"none", cursor: suggestion.trim() ? "pointer" : "default", display:"flex", alignItems:"center", justifyContent:"center", background: submitted ? "#30d158" : (suggestion.trim() ? "#0a84ff" : "#2c2c2e") }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                {submitted
                  ? <path d="M3 9l4 4 8-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  : <path d="M9 3v12M3 9h12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Custom habits section */}
      <div style={{ maxWidth: 390, margin: "0 auto", padding: "0 20px 16px" }}>
        {customHabits.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: T4, marginBottom: 8 }}>Your custom habits</p>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {customHabits.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span style={{ fontSize: 22 }}>{c.emoji}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.88)" }}>{c.name}</span>
                  <button onClick={() => removeCustom(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 18, lineHeight: 1, padding: "2px 4px" }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showCustomInput ? (
          <div style={{ padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input
                value={customEmoji}
                onChange={e => setCustomEmoji(e.target.value)}
                maxLength={2}
                style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: 22, textAlign: "center" as const, outline: "none" }}
              />
              <input
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveCustomHabit()}
                placeholder="e.g. Cold shower, Journal..."
                maxLength={60}
                style={{ flex: 1, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", color: "#fff", fontSize: 14, padding: "0 14px", outline: "none", fontFamily: "-apple-system,sans-serif" }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setShowCustomInput(false); setCustomName(""); }} style={{ flex: 1, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: T3, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={saveCustomHabit} disabled={!customName.trim() || savingCustom} style={{ flex: 2, height: 38, borderRadius: 12, background: customName.trim() ? C_BRAND : "rgba(255,255,255,0.06)", border: "none", color: customName.trim() ? "#fff" : T4, fontSize: 13, fontWeight: 700, cursor: customName.trim() ? "pointer" : "default" }}>{savingCustom ? "Saving…" : "Add habit"}</button>
            </div>
          </div>
        ) : !atMax && (
          <button
            onClick={() => setShowCustomInput(true)}
            style={{ width: "100%", height: 44, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.12)", color: T3, fontSize: 14, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <span style={{ fontSize: 18 }}>+</span> Add your own habit
          </button>
        )}
      </div>

      {/* Sticky CTA */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:"20px 18px 40px", background:"linear-gradient(to top, #000 60%, transparent)" }}>
        <div style={{ maxWidth:390, margin:"0 auto" }}>
          <button
            onClick={() => canProceed && onComplete(selected, customHabits.map(c => c.id))}
            style={{
              width:"100%", height:56, borderRadius:17, fontSize:16, fontWeight:700,
              letterSpacing:"-0.025em", border:"none",
              color: canProceed ? "#fff" : T3,
              background: canProceed ? "linear-gradient(150deg,#0a84ff 0%,#0060cc 100%)" : "#1c1c1e",
              boxShadow: canProceed ? "0 8px 32px rgba(10,132,255,0.4), inset 0 1px 0 rgba(255,255,255,0.12)" : "none",
              cursor: canProceed ? "pointer" : "default",
            }}
            onMouseDown={e => { if (canProceed) e.currentTarget.style.transform = "scale(0.97)"; }}
            onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {!canProceed
              ? "Choose " + (MIN_HABITS - selected.length) + " more habit" + ((MIN_HABITS - selected.length) !== 1 ? "s" : "") + " to continue"
              : isReview ? "Update my commitment →" : "Review my commitment →"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COMMITMENT SCREEN ────────────────────────────────────────────────────────
function CommitmentScreen({ selectedIds, customHabitIds, packId, onCommit, onBack }: {
  selectedIds: string[];
  customHabitIds: number[];
  packId: string | null;
  onCommit: () => void;
  onBack?: () => void;
}) {
  const ah = useHabits();
  const habits = ah.filter(h => selectedIds.includes(h.id));
  const end = new Date(); end.setDate(end.getDate() + 20);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month:"short", day:"numeric" });
  const [pressed, setPressed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div style={{ minHeight:"100vh", background:"#000", fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif", WebkitFontSmoothing:"antialiased", display:"flex", flexDirection:"column" }}>
      <div style={{ maxWidth:390, margin:"0 auto", width:"100%", padding:"0 20px", flex:1, display:"flex", flexDirection:"column" }}>

        <div style={{ paddingTop:64, paddingBottom:28 }}>
          {onBack && (
            <button onClick={onBack} style={{
              display:"flex", alignItems:"center", gap:6, marginBottom:20,
              background:"none", border:"none", cursor:"pointer", padding:0,
              color:T3, fontSize:14, fontWeight:500,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back
            </button>
          )}
          <div style={{ width:52, height:52, borderRadius:16, marginBottom:20, background:"rgba(129,140,248,0.12)", border:"1px solid rgba(129,140,248,0.22)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(129,140,248,0.85)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <p style={{ fontSize:12, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:C_BRAND, margin:"0 0 8px" }}>Your 21-Day Commitment</p>
          <h1 style={{ fontSize:28, fontWeight:800, letterSpacing:"-0.04em", lineHeight:1.15, color:"#fff", margin:"0 0 10px" }}>
            This is your promise to yourself.
          </h1>
          <p style={{ fontSize:15, color:T3, lineHeight:1.6, margin:0 }}>21 days. Small actions, every day. No exceptions.</p>
        </div>

        <div style={{ flex:1 }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:T4, margin:"0 0 12px" }}>I commit to</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
            {habits.map(h => {
              const tier = HABIT_TIERS[h.id as keyof typeof HABIT_TIERS];
              const tc = tier ? TIER_META[tier as keyof typeof TIER_META].color : h.color;
              return (
                <div key={h.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:14, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:tc, borderRadius:"0 2px 2px 0" }}/>
                  <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, background:(h.color + "16"), color:h.color, display:"flex", alignItems:"center", justifyContent:"center" }}>{h.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.88)", margin:0 }}>{h.label}</p>
                    <p style={{ fontSize:11, color:T3, margin:"2px 0 0" }}>{h.desc}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3L11.5 3.5" stroke="rgba(129,140,248,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              );
            })}
          </div>

          <div style={{ display:"flex", gap:8, marginBottom:32 }}>
            {[{ label:"Starts", value:"Today", color:C_PHYSICAL }, { label:"Ends", value:"Day 21 · " + fmt(end), color:"rgba(255,255,255,0.4)" }].map(s => (
              <div key={s.label} style={{ flex:1, padding:"11px 14px", borderRadius:13, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ fontSize:10, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:T4, margin:"0 0 3px" }}>{s.label}</p>
                <p style={{ fontSize:13, fontWeight:700, color:s.color, margin:0 }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ paddingBottom:48 }}>
          <button
            onClick={async () => {
              if (pressed) return;
              setError(null);
              setPressed(true);
              if (navigator.vibrate) navigator.vibrate([40, 60, 40, 60, 120]);
              try {
                await api('/api/habit-challenges', {
                  method: 'POST',
                  auth: true,
                  body: JSON.stringify({
                    pack_id: packId ?? null,
                    habit_slugs: selectedIds,
                    custom_habit_ids: customHabitIds,
                  }),
                });
                setTimeout(onCommit, 600);
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
                setError(msg);
                setPressed(false);
              }
            }}
            disabled={pressed}
            style={{
              width:"100%", height:58, borderRadius:18, fontSize:16, fontWeight:700,
              letterSpacing:"-0.025em", border:"none",
              cursor: pressed ? "default" : "pointer",
              color: pressed ? "rgba(255,255,255,0.5)" : "#fff",
              background: pressed ? "rgba(129,140,248,0.2)" : "linear-gradient(150deg,#818cf8 0%,#5e5ce6 100%)",
              boxShadow: pressed ? "none" : "0 8px 32px rgba(129,140,248,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
              transition:"all 0.3s ease",
            }}
            onMouseDown={e => { if (!pressed) e.currentTarget.style.transform = "scale(0.97)"; }}
            onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {pressed ? "Committed ✓" : "I Commit To This Challenge"}
          </button>
          <p style={{ textAlign:"center", fontSize:11, color:T4, marginTop:12 }}>No streak. No pressure. Just show up.</p>
          {error && (
            <p style={{ textAlign:"center", fontSize:12, color:"#ff453a", marginTop:8, lineHeight:1.5 }}>{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── COMMITTED SCREEN ────────────────────────────────────────────────────────
function CommittedScreen({ selectedIds, onDone }: { selectedIds: string[]; onDone: () => void }) {
  const ah = useHabits();
  const [fading, setFading] = useState(false);
  const habits = ah.filter(h => selectedIds.includes(h.id));

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 2800);
    const t2 = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate([30, 40, 30, 40, 30, 80, 200]);
      onDone();
    }, 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      minHeight:"100vh", background:"#000",
      fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif",
      WebkitFontSmoothing:"antialiased",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"0 28px", textAlign:"center",
      opacity: fading ? 0 : 1, transition:"opacity 0.8s ease",
    }}>
      <div style={{ width:64, height:64, borderRadius:20, marginBottom:24, background:"rgba(48,209,88,0.12)", border:"1px solid rgba(48,209,88,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M5 14l6 6L23 7" stroke="#30d158" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(48,209,88,0.7)", margin:"0 0 12px" }}>Committed</p>
      <h2 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.04em", lineHeight:1.2, color:"#fff", margin:"0 0 16px" }}>
        You've committed to improving yourself for 21 days.
      </h2>
      <p style={{ fontSize:15, color:T2, lineHeight:1.65, margin:"0 0 32px", maxWidth:280 }}>
        Small actions every day will build momentum.
      </p>
      <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
        {habits.map(h => (
          <div key={h.id} style={{ width:40, height:40, borderRadius:12, background:(h.color + "14"), border:"1px solid " + (h.color + "28"), display:"flex", alignItems:"center", justifyContent:"center", color:h.color }}>
            {h.icon}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function HabitFlow() {
  const router = useRouter();
  const [flow, setFlow] = useState("packs");
  const [selected, setSelected] = useState<string[]>([]);
  const [customHabitIds, setCustomHabitIds] = useState<number[]>([]);
  const [packId, setPackId] = useState<string | null>(null);
  const [aiSuggestedIds, setAiSuggestedIds] = useState<string[]>([]);
  const [availableHabits, setAvailableHabits] = useState<Habit[]>(ALL_HABITS);
  const [habitsLoading, setHabitsLoading] = useState(true);

  // Read ?suggested=slug1,slug2 from URL — pre-select AI-recommended habits
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const suggested = params.get("suggested");
    if (suggested) {
      const rawSlugs = suggested.split(",").map(s => s.trim()).filter(Boolean);
      const resolved = [...new Set(rawSlugs.map(s => resolveHabitId(s)).filter(Boolean))];
      if (resolved.length > 0) {
        setSelected(resolved);
        setAiSuggestedIds(resolved);
        setFlow("setup");
      }
    }
  }, []);

  useEffect(() => {
    Promise.all([
      api<{ id: string; slug?: string; name?: string; label?: string }[]>("/api/habits").catch(() => [] as { id: string; slug?: string }[]),
      api<{ id: number } | null>("/api/habit-challenges/active").catch(() => null),
    ]).then(([habitsData, activeChallenge]) => {
      if (activeChallenge && activeChallenge.id) {
        router.replace("/habits/tree");
        return;
      }
      // Always show all locally defined habits; API list only used to order/verify
      const apiIds = new Set((habitsData as { id: string; slug?: string }[]).map(h => h.slug ?? h.id));
      const merged = apiIds.size > 0
        ? ALL_HABITS.filter(h => apiIds.has(h.id)).concat(ALL_HABITS.filter(h => !apiIds.has(h.id)))
        : ALL_HABITS;
      setAvailableHabits(merged.length > 0 ? merged : ALL_HABITS);
      setHabitsLoading(false);
    });
  }, [router]);

  if (habitsLoading) return (
    <div style={{ minHeight:"100vh", background:"#000", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:32, height:32, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.08)", borderTop:"2px solid rgba(10,132,255,0.7)", animation:"spin 0.9s linear infinite" }}/>
      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </div>
  );

  return (
    <HabitsCtx.Provider value={availableHabits}>
      {flow === "setup"
        ? <HabitSetupPage key={selected.join("|") || "empty"} initialSelected={selected} aiSuggestedIds={aiSuggestedIds.length > 0 ? aiSuggestedIds : undefined} onBack={() => { setAiSuggestedIds([]); setFlow("packs"); }} onComplete={(ids: string[], customIds: number[]) => { setSelected(ids); setCustomHabitIds(customIds); setFlow("commit"); }}/>
        : flow === "commit"
        ? <CommitmentScreen selectedIds={selected} customHabitIds={customHabitIds} packId={packId} onBack={() => setFlow("setup")} onCommit={() => setFlow("committed")}/>
        : flow === "committed"
        ? <CommittedScreen selectedIds={selected} onDone={() => setFlow("tracking")}/>
        : flow === "packs"
        ? <PackPickerScreen
            onSelectPack={(ids: string[]) => { setAiSuggestedIds([]); setSelected(ids); setPackId(null); setFlow("setup"); }}
            onStartDirect={(ids: string[], pid?: string) => { setSelected(ids); setPackId(pid ?? null); setFlow("commit"); }}
            onSelectAiPack={(ids: string[]) => { setAiSuggestedIds(ids); setSelected(ids); setPackId(null); setFlow("setup"); }}
            onCustom={() => { setAiSuggestedIds([]); setSelected([]); setPackId(null); setFlow("setup"); }}
            onBack={() => router.back()}
          />
        : <Day1Screen selected={selected} onRestart={() => setFlow("packs")} />
      }
    </HabitsCtx.Provider>
  );
}

function Day1Screen({ selected, onRestart }: { selected: string[]; onRestart: () => void }) {
  const [phase, setPhase] = useState("hidden"); // hidden → in → hold → out → done
  const router = useRouter();

  useEffect(() => {
    const t0 = setTimeout(() => setPhase("in"),   50);
    const t1 = setTimeout(() => setPhase("hold"), 900);
    const t2 = setTimeout(() => setPhase("out"),  3200);
    const t3 = setTimeout(() => setPhase("done"), 4200);
    const t4 = setTimeout(() => router.push("/habits/tree"), 4500);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [router]);

  const opacity   = phase === "hidden" || phase === "out" || phase === "done" ? 0 : 1;
  const dayScale  = phase === "in" ? 0.88 : 1;
  const dayOpacity= phase === "hidden" || phase === "out" || phase === "done" ? 0 : 1;

  if (phase === "done") {
    return (
      <div style={{
        minHeight:"100vh", background:"#000",
        fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif",
        WebkitFontSmoothing:"antialiased",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding:"0 32px", textAlign:"center",
        animation:"day1Reveal 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
      }}>
        <style>{"@keyframes day1Reveal { from { opacity:0; transform:scale(0.94); filter:blur(8px); } to { opacity:1; transform:scale(1); filter:blur(0px); } }"}</style>
        <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.25)", margin:"0 0 16px" }}>
          21-Day Challenge
        </p>
        <p style={{ fontSize:72, fontWeight:800, letterSpacing:"-0.06em", lineHeight:1, color:"#fff", margin:"0 0 8px" }}>
          Day 1
        </p>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.35)", margin:"0 0 48px" }}>
          {selected.length} {selected.length === 1 ? "habit" : "habits"} locked in
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight:"100vh", background:"#000",
      fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif",
      WebkitFontSmoothing:"antialiased",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"0 32px", textAlign:"center",
      opacity, transition: phase === "out" ? "opacity 0.8s ease, filter 0.8s ease, transform 0.8s ease" : "opacity 0.5s ease",
      filter: phase === "out" ? "blur(6px)" : "blur(0px)",
      transform: phase === "out" ? "scale(1.06)" : "scale(1)",
    }}>

      {/* eyebrow */}
      <p style={{
        fontSize:11, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase",
        color:"rgba(255,255,255,0.3)", margin:"0 0 20px",
        opacity, transition:"opacity 0.6s ease 0.1s",
      }}>
        21-Day Challenge
      </p>

      {/* DAY 1 */}
      <p style={{
        fontSize:88, fontWeight:800, letterSpacing:"-0.06em", lineHeight:1,
        color:"#fff", margin:"0 0 6px",
        transform: dayScale !== 1 ? "scale("+dayScale+")" : "scale(1)",
        opacity: dayOpacity,
        transition:"transform 0.7s cubic-bezier(0.34,1.4,0.64,1), opacity 0.5s ease",
      }}>
        Day 1
      </p>

      {/* thin accent line */}
      <div style={{
        width: phase === "in" || phase === "hidden" ? 0 : 40,
        height:2, borderRadius:99, background:"rgba(255,255,255,0.15)",
        margin:"0 auto 24px", transition:"width 0.6s cubic-bezier(0.4,0,0.2,1) 0.3s",
      }}/>

      {/* habit count */}
      <p style={{
        fontSize:14, color:"rgba(255,255,255,0.35)", margin:"0 0 4px",
        opacity, transition:"opacity 0.5s ease 0.4s",
      }}>
        {selected.length} {selected.length === 1 ? "habit" : "habits"} locked in
      </p>

      {/* back to setup */}
       
    </div>
  );
}