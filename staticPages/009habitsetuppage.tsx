// "use client";

// import { useState, useEffect } from "react";

// // ─── DESIGN TOKENS — matches HabitBuilderPage exactly ─────────────────────────
// const T = {
//   bg:          "#000000",
//   card:        "#1c1c1e",
//   border:      "#3a3a3c",
//   borderLo:    "#2c2c2e",
//   t1:          "#ffffff",
//   t2:          "rgba(235,235,245,0.6)",
//   t3:          "rgba(235,235,245,0.3)",
//   t4:          "rgba(235,235,245,0.18)",
//   brand:       "#0a84ff",
//   brandLo:     "rgba(10,132,255,0.14)",
//   brandBorder: "rgba(10,132,255,0.28)",
// };

// const MIN_HABITS = 2;
// const MAX_HABITS = 4;

// // ─── ALL AVAILABLE HABITS ─────────────────────────────────────────────────────
// // Curated for maximum 21-day health impact. Research-backed, binary enough
// // to log daily, meaningful enough to build real habit loops.

// interface HabitDef {
//   id:       string;
//   label:    string;
//   desc:     string;         // short benefit — shown on card
//   why:     string;          // deeper reason — shown as info line
//   impact:   string;         // one-word impact tag
//   category: string;
//   color:    string;         // Apple system palette
//   icon:     React.ReactNode;
//   type:     "toggle" | "counter";
// }

// const svgI = (d: React.ReactNode) => (
//   <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
//     stroke="currentColor" strokeWidth="1.6"
//     strokeLinecap="round" strokeLinejoin="round">
//     {d}
//   </svg>
// );

// const ALL_HABITS: HabitDef[] = [
//   // ── Body — ordered by research impact ─────────────────────────────────────
//   // #1 Sleep — single highest-impact habit, no contest
//   {
//     id:"sleep", label:"Sleep 7–8 hours", desc:"In bed by 10:30, wake consistent",
//     why:"Sleep is when muscle repairs, memory consolidates and hormones reset. Nothing else comes close.",
//     impact:"Recovery", category:"Body", color:"#5e5ce6", type:"toggle",
//     icon: svgI(<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>),
//   },
//   // #2 Exercise — most effective antidepressant, longevity driver
//   {
//     id:"exercise", label:"Exercise 30 min", desc:"Any movement — gym, run, swim, bike",
//     why:"30 min of daily movement adds years to your life and is the most effective antidepressant known.",
//     impact:"Fitness", category:"Body", color:"#ff9f0a", type:"toggle",
//     icon: svgI(<><path d="M6.5 6.5h11m-11 11h11M4 9h3m10 0h3M4 15h3m10 0h3M9.5 6.5v11M14.5 6.5v11"/></>),
//   },
//   // #3 Steps — accessible, immediate cardiovascular benefit
//   {
//     id:"steps", label:"5,000–10,000 steps", desc:"Start at 5k, build to 10k",
//     why:"Walking daily lowers cardiovascular disease risk by 40% and improves mood within minutes.",
//     impact:"Cardio", category:"Body", color:"#30d158", type:"counter",
//     icon: svgI(<><path d="M13 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/><path d="M7.5 17.5L9 13l3 2 2-3.5"/><path d="M6 20l2-4 4 1 3-5 2 1"/></>),
//   },
//   // #4 Water — foundational, affects everything
//   {
//     id:"water", label:"Drink 2.5L water", desc:"10 glasses across the day",
//     why:"Your body is 60% water. Even 2% dehydration kills focus, mood and physical output.",
//     impact:"Hydration", category:"Body", color:"#32ade6", type:"counter",
//     icon: svgI(<><path d="M12 2s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13z"/><path d="M10 17.5a2.5 2.5 0 0 0 2.5 1.5"/></>),
//   },
//   // #5 No junk — biggest dietary change, fastest visible results
//   {
//     id:"noprocessed", label:"No junk food", desc:"If it's fried, packaged, bakery or maida — skip it",
//     why:"Cut it for 7 days and you'll stop craving it. Your energy and hunger become predictable again.",
//     impact:"Nutrition", category:"Body", color:"#ff453a", type:"toggle",
//     icon: svgI(<><circle cx="12" cy="12" r="9"/><line x1="4.5" y1="4.5" x2="19.5" y2="19.5"/></>),
//   },
//   // #6 Vegetables — add goodness, not just remove bad
//   {
//     id:"veggies", label:"Fill half your plate with veg", desc:"Any vegetable — sabzi, salad, soup or raw",
//     why:"Every packaged snack you replace with a vegetable is a vote for the body you want. Clearer skin, sharper energy, better digestion — most people feel the shift in 10 days.",
//     impact:"Nutrition", category:"Body", color:"#30d158", type:"counter",
//     icon: svgI(<><path d="M12 2a5 5 0 0 1 5 5c0 5-5 11-5 11S7 12 7 7a5 5 0 0 1 5-5z"/><path d="M12 7v4"/></>),
//   },
//   // #7 No alcohol — strong impact but harder commitment
//   {
//     id:"noalcohol", label:"No alcohol", desc:"Zero drinks — not even one",
//     why:"Alcohol fragments sleep cycles, spikes cortisol and depletes B vitamins. Even one drink has measurable effects.",
//     impact:"Detox", category:"Body", color:"#ff453a", type:"toggle",
//     icon: svgI(<><path d="M8 2h8l1 7H7L8 2z"/><path d="M7 9c0 5 2 9 5 9s5-4 5-9"/><line x1="4" y1="4" x2="20" y2="20"/></>),
//   },
//   // #8 Cold shower — alertness, recovery, dopamine spike
//   {
//     id:"coldshower", label:"Cold shower", desc:"End shower with 30–60s cold water",
//     why:"Cold exposure triggers a 250% dopamine spike that lasts hours. Reduces inflammation, improves circulation and builds mental resilience — all in under a minute.",
//     impact:"Recovery", category:"Body", color:"#32ade6", type:"toggle",
//     icon: svgI(<><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></>),
//   },
//   // #9 Morning sunlight — circadian anchor, mood, energy
//   {
//     id:"sunlight", label:"Morning sunlight 10 min", desc:"Outside within 1hr of waking, no sunglasses",
//     why:"Morning light sets your circadian clock, boosts cortisol at the right time (giving you energy) and triggers serotonin that converts to melatonin at night — better energy all day and better sleep at night.",
//     impact:"Energy", category:"Body", color:"#ffd60a", type:"toggle",
//     icon: svgI(<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>),
//   },
//   // #10 Stretch — mobility, posture, desk worker essential
//   {
//     id:"stretch", label:"Stretch / mobility 10 min", desc:"Morning or post-work — hips, spine, shoulders",
//     why:"Sitting for 8hrs shortens hip flexors and rounds the spine. 10 min of daily mobility undoes this and reduces injury risk by 40%. Most people feel the difference in 5 days.",
//     impact:"Mobility", category:"Body", color:"#30d158", type:"toggle",
//     icon: svgI(<><path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z"/><path d="M7 15a7 7 0 0 0 10 0"/><path d="M12 18v4"/></>),
//   },
//   // #11 No smoking
//   {
//     id:"nosmoking", label:"No smoking", desc:"Zero cigarettes — not even one",
//     why:"Within 20 minutes of quitting, heart rate drops. Within 12 hours, carbon monoxide clears. Within 21 days, lung cilia regrow and circulation measurably improves.",
//     impact:"Longevity", category:"Body", color:"#ff453a", type:"toggle",
//     icon: svgI(<><line x1="2" y1="12" x2="22" y2="12"/><path d="M17 8c0-2.5 2-2.5 2-5"/><path d="M19 12v2"/><line x1="4" y1="4" x2="20" y2="20"/></>),
//   },
//   // ── Mind — ordered by research impact ─────────────────────────────────────
//   // #1 Meditation — strongest evidence base, measurable brain changes
//   {
//     id:"meditation", label:"Meditate 10 min", desc:"Quiet sit, breathing app or guided",
//     why:"10 min daily measurably shrinks the amygdala (stress centre) and thickens the prefrontal cortex in 8 weeks.",
//     impact:"Mindfulness", category:"Mind", color:"#bf5af2", type:"toggle",
//     icon: svgI(<><circle cx="12" cy="4.5" r="1.5"/><path d="M9 21c.5-3 1.5-5 3-5s2.5 2 3 5"/><path d="M9.5 14V11a2.5 2.5 0 0 1 5 0v3c0 1.5-.9 2.5-2.5 2.5S9.5 15.5 9.5 14z"/></>),
//   },
//   // #2 No screens — directly protects sleep quality
//   {
//     id:"noscreens", label:"No screens 1hr before bed", desc:"Phone down, book or conversation instead",
//     why:"Blue light blocks melatonin for up to 3 hours. Cutting it before bed doubles deep sleep duration.",
//     impact:"Sleep Quality", category:"Mind", color:"#5e5ce6", type:"toggle",
//     icon: svgI(<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="4" y1="4" x2="20" y2="20"/></>),
//   },
//   // #3 Gratitude — fastest mood shift, lowest effort
//   {
//     id:"journal", label:"Gratitude journal", desc:"3 things you're grateful for, 2 min",
//     why:"Writing gratitude rewires neural pathways toward positive patterns — measurable in brain scans after 21 days.",
//     impact:"Mental health", category:"Mind", color:"#ff9f0a", type:"toggle",
//     icon: svgI(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></>),
//   },
//   // #4 Read — stress reduction + cognitive reserve
//   {
//     id:"read", label:"Read 20 minutes", desc:"Books only — not articles or feeds",
//     why:"Reading reduces cortisol by 68% in 6 minutes and is the best-studied cognitive reserve builder.",
//     impact:"Cognition", category:"Mind", color:"#0a84ff", type:"toggle",
//     icon: svgI(<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>),
//   },
//   // #5 Learn — neuroplasticity, long-term compound benefit
//   {
//     id:"learn", label:"Learn 15 min", desc:"One skill, consistently — language, code, music",
//     why:"Deliberate daily practice grows myelin around neural pathways, making skills permanent over 21 days.",
//     impact:"Growth", category:"Mind", color:"#bf5af2", type:"toggle",
//     icon: svgI(<><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>),
//   },
//   // #6 No social media before 10am — protect morning focus window
//   {
//     id:"nosocialmedia", label:"No social media before 10am", desc:"First 2hrs are for you, not feeds",
//     why:"Checking social media first thing hijacks your attention and puts you in reactive mode all day. Protecting your morning window is the single highest-leverage focus habit for knowledge workers.",
//     impact:"Focus", category:"Mind", color:"#0a84ff", type:"toggle",
//     icon: svgI(<><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/><line x1="4" y1="4" x2="20" y2="20"/></>),
//   },
//   // ── Lifestyle — ordered by research impact ────────────────────────────────
//   // #1 Eating window — metabolic, sleep and digestion combined
//   {
//     id:"eatingwindow", label:"Eat within a 10-hour window", desc:"Breakfast within 1hr of waking · last meal 2–3hrs before sleep",
//     why:"Dr. Satchin Panda: your body repairs itself only when it's not digesting. A 10-hour window gives your gut 14hrs rest — better blood sugar, sleep and digestion. Push to 16hrs and your cells start self-cleaning (autophagy). No dieting. Just timing.",
//     impact:"Metabolism", category:"Lifestyle", color:"#ff9f0a", type:"toggle",
//     icon: svgI(<><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>),
//   },
//   // #2 No caffeine after 2pm — protects sleep architecture
//   {
//     id:"caffeine", label:"No caffeine after 2pm", desc:"Coffee, chai, tea or energy drinks — stop by 2pm",
//     why:"Caffeine stays in your body for 6 hours. A 3pm chai is still 50% active at 9pm — silently wrecking your deep sleep even if you fall asleep fine. Stop by 2pm and most people sleep deeper within 3 days.",
//     impact:"Sleep Quality", category:"Lifestyle", color:"#ff9f0a", type:"toggle",
//     icon: svgI(<><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></>),
//   },
//   // #3 No sugar — fast visible results, strong 21-day habit loop
//   {
//     id:"nosugar", label:"No added sugar", desc:"Check labels — sugar hides in everything",
//     why:"Sugar spikes insulin then crashes energy. Cutting it for 21 days resets taste sensitivity and reduces cravings permanently.",
//     impact:"Nutrition", category:"Lifestyle", color:"#ff453a", type:"toggle",
//     icon: svgI(<><path d="M12 2c1 2 3 3.5 3 5.5a3 3 0 0 1-6 0C9 5.5 11 4 12 2z"/><line x1="4" y1="20" x2="20" y2="20"/><line x1="4" y1="4" x2="20" y2="20"/></>),
//   },
//   // #4 Call someone — relationships are the #1 longevity predictor
//   {
//     id:"callsomeone", label:"Call someone you care about", desc:"5 min with family or a close friend",
//     why:"The Harvard Study of Adult Development (80 years of data) found strong relationships are the single biggest predictor of long, happy lives — more than money, fame or exercise.",
//     impact:"Connection", category:"Lifestyle", color:"#30d158", type:"toggle",
//     icon: svgI(<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>),
//   },
//   // #5 Track spending — financial awareness reduces stress
//   {
//     id:"trackspending", label:"Track daily spending", desc:"Log every purchase — app or note",
//     why:"Financial stress is the #1 cause of anxiety in working adults. Simply tracking spending (not budgeting) reduces impulsive purchases by 30% in the first week — awareness alone changes behaviour.",
//     impact:"Finance", category:"Lifestyle", color:"#32ade6", type:"toggle",
//     icon: svgI(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>),
//   },
//   {
//     id:"walkaftermeals", label:"Walk after meals 10 min", desc:"Short walk after lunch or dinner",
//     why:"A 10-min walk after eating lowers blood sugar spikes by 30% (Stanford). Reduces post-lunch energy crash and improves digestion.",
//     impact:"Metabolism", category:"Body", color:"#30d158", type:"toggle",
//     icon: svgI(<><path d="M13 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/><path d="M7.5 17.5L9 13l3 2 2-3.5"/><path d="M6 20l2-4 4 1 3-5 2 1"/></>),
//   },
//   {
//     id:"breathwork", label:"Breathwork 5 min", desc:"Box breathing, 4-7-8 or Wim Hof",
//     why:"5 min of controlled breathing lowers cortisol and blood pressure. Stanford 2023: cyclic sighing outperforms meditation for same-day stress relief.",
//     impact:"Calm", category:"Mind", color:"#32ade6", type:"toggle",
//     icon: svgI(<><circle cx="12" cy="12" r="10"/><path d="M8 12h4M12 8v4"/></>),
//   },
//   {
//     id:"deepwork", label:"Deep work block 90 min", desc:"Single task, zero interruptions, phone away",
//     why:"90 min matches the brain's ultradian focus cycle. One deep work block produces more meaningful output than 4hrs of fragmented work.",
//     impact:"Focus", category:"Lifestyle", color:"#5e5ce6", type:"toggle",
//     icon: svgI(<><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>),
//   },
//   {
//     id:"preparetomorrow", label:"Prepare tomorrow tonight", desc:"Top 3 tasks + clothes + bag, 5 min",
//     why:"Prepping the night before removes 8-12 morning decisions and increases goal follow-through by 40%. Decision fatigue is real.",
//     impact:"Clarity", category:"Lifestyle", color:"#ff9f0a", type:"toggle",
//     icon: svgI(<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>),
//   },
//   {
//     id:"nearfareye", label:"Near-far eye training 5 min", desc:"Alternate focus: close object, then distant point",
//     why:"Alternating between near (~15cm) and far (6m+) targets exercises ciliary muscles controlling lens accommodation. Counteracts screen-induced eye fatigue and may slow age-related vision decline. Huberman recommends daily to preserve visual flexibility.",
//     impact:"Vision", category:"Body", color:"#32ade6", type:"toggle",
//     icon: svgI(<><circle cx="12" cy="12" r="3"/><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><line x1="3" y1="3" x2="21" y2="21"/></>),
//   },
//   {
//     id:"presleepbath", label:"Warm bath or foot soak before bed", desc:"10 min, 60–90 min before sleep",
//     why:"Warm water causes peripheral vasodilation. Upon exiting, your body rapidly radiates heat, dropping core temperature 2–3°F — the precise thermoregulatory signal for sleep onset. Matthew Walker: significantly reduces sleep onset latency and enhances deep NREM sleep.",
//     impact:"Sleep Quality", category:"Body", color:"#5e5ce6", type:"toggle",
//     icon: svgI(<><path d="M4 12h16M4 12a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2"/><path d="M6 12V6a4 4 0 0 1 8 0v1"/><line x1="10" y1="16" x2="10" y2="18"/><line x1="14" y1="16" x2="14" y2="18"/></>),
//   },
//   {
//     id:"timeblock", label:"Time-block your day", desc:"Assign every hour to a task — 5 min planning",
//     why:"Assigning every hour to a specific task offloads working memory, activates implementation intentions, and eliminates attention residue between tasks. Cal Newport: time blockers accomplish roughly twice as much work per week as reactive workers.",
//     impact:"Productivity", category:"Lifestyle", color:"#0a84ff", type:"toggle",
//     icon: svgI(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="8" y1="18" x2="14" y2="18"/></>),
//   },
//   {
//     id:"discomfortchallenge", label:"Daily discomfort challenge", desc:"One uncomfortable-but-beneficial action today",
//     why:"Stress inoculation (Meichenbaum) upregulates the brain's stress-response systems, widening your window of tolerance. Goggins: you are only at 40% of your capacity when you first want to quit. Daily deliberate discomfort builds the mental toughness muscle systematically.",
//     impact:"Resilience", category:"Mind", color:"#ff453a", type:"toggle",
//     icon: svgI(<><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></>),
//   },
//   {
//     id:"proactivelanguage", label:"Proactive language practice", desc:"Replace 'I can't / I have to' with 'I choose to'",
//     why:"Reactive language ('I can't', 'I have to') activates the amygdala and external locus of control. Proactive language ('I choose', 'I will') shifts neural activation to the PFC. Covey: language reveals and shapes mindset — the words you use literally alter your brain's activation patterns.",
//     impact:"Mindset", category:"Mind", color:"#bf5af2", type:"toggle",
//     icon: svgI(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="12" y1="7" x2="12" y2="13"/></>),
//   },
//   {
//     id:"daily5goals", label:"Write 5 micro-goals for today", desc:"5 small, achievable wins — takes 3 min",
//     why:"Small wins activate the brain's progress principle (Amabile & Kramer, Harvard). Each completed micro-goal triggers ventral tegmental dopamine, sustaining motivation across the day. Sharma: distinct from a to-do list — these are small victories that compound into momentum.",
//     impact:"Momentum", category:"Lifestyle", color:"#30d158", type:"toggle",
//     icon: svgI(<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>),
//   },
// ];

// const CATEGORIES = ["Body", "Mind", "Lifestyle"];

// // ─── CATEGORY COLOUR ──────────────────────────────────────────────────────────
// const CAT_COLOR: Record<string, string> = {
//   Body:      "#30d158",  // green — physical
//   Mind:      "#bf5af2",  // purple — mental
//   Lifestyle: "#ff9f0a",  // orange — daily choices
// };

// // ─── IMPACT BADGE ─────────────────────────────────────────────────────────────
// function ImpactBadge({ label, color }: { label: string; color: string }) {
//   return (
//     <div style={{
//       display:"inline-flex", alignItems:"center",
//       padding:"2px 7px", borderRadius:99,
//       background:`${color}18`,
//       border:`1px solid ${color}30`,
//       flexShrink:0,
//     }}>
//       <span style={{ fontSize:10, fontWeight:600, color, letterSpacing:"0.04em", textTransform:"uppercase" }}>
//         {label}
//       </span>
//     </div>
//   );
// }

// // ─── HABIT SELECTION CARD ─────────────────────────────────────────────────────
// function HabitSelectCard({
//   habit, selected, disabled, onToggle,
// }: {
//   habit: HabitDef; selected: boolean; disabled: boolean; onToggle: () => void;
// }) {
//   return (
//     <button
//       onClick={onToggle}
//       disabled={disabled && !selected}
//       style={{
//         width:"100%", textAlign:"left", cursor: disabled && !selected ? "not-allowed" : "pointer",
//         padding:"14px 16px 14px 18px",
//         borderRadius:16,
//         display:"flex", alignItems:"flex-start", gap:13,
//         background: selected ? `${habit.color}12` : T.card,
//         border: `1px solid ${selected ? habit.color + "40" : T.borderLo}`,
//         opacity: disabled && !selected ? 0.4 : 1,
//         transition:"all 0.2s cubic-bezier(.4,0,.2,1)",
//         position:"relative", overflow:"hidden",
//       }}
//       onMouseDown={e => { if (!disabled || selected) e.currentTarget.style.transform="scale(0.983)"; }}
//       onMouseUp={e => (e.currentTarget.style.transform="scale(1)")}
//       onMouseLeave={e => (e.currentTarget.style.transform="scale(1)")}
//     >
//       {/* Left accent */}
//       <div style={{
//         position:"absolute", left:0, top:"18%", bottom:"18%", width:3,
//         borderRadius:"0 3px 3px 0",
//         background: habit.color,
//         opacity: selected ? 1 : 0.15,
//         transition:"opacity 0.25s",
//       }}/>

//       {/* Icon well — top-aligned */}
//       <div style={{
//         width:40, height:40, borderRadius:12, flexShrink:0,
//         alignSelf:"flex-start",
//         display:"flex", alignItems:"center", justifyContent:"center",
//         background: selected ? `${habit.color}20` : "#2c2c2e",
//         color: selected ? habit.color : T.t3,
//         transition:"all 0.2s",
//       }}>
//         {habit.icon}
//       </div>

//       {/* Text block — full width, no competing right column */}
//       <div style={{ flex:1, minWidth:0 }}>

//         {/* Row 1: label + badge + checkbox — all top */}
//         <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
//           <p style={{
//             fontSize:15, fontWeight:600, letterSpacing:"-0.02em",
//             color: selected ? T.t1 : T.t2,
//             margin:0, lineHeight:1.2, flex:1, minWidth:0,
//             transition:"color 0.2s",
//           }}>
//             {habit.label}
//           </p>
//           {/* Badge inline with title */}
//           <ImpactBadge label={habit.impact} color={habit.color}/>
//           {/* Checkbox */}
//           <div style={{
//             width:22, height:22, borderRadius:"50%", flexShrink:0,
//             border: `2px solid ${selected ? habit.color : "#3a3a3c"}`,
//             background: selected ? habit.color : "transparent",
//             display:"flex", alignItems:"center", justifyContent:"center",
//             transition:"all 0.2s cubic-bezier(.4,0,.2,1)",
//             boxShadow: selected ? `0 0 10px ${habit.color}50` : "none",
//           }}>
//             {selected && (
//               <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
//                 <path d="M2 5.5L4.5 8L9 3" stroke="#fff" strokeWidth="1.8"
//                   strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//             )}
//           </div>
//         </div>

//         {/* Row 2: how — what to do */}
//         <p style={{ fontSize:12, color:T.t3, margin:"0 0 5px", letterSpacing:"-0.01em" }}>
//           {habit.desc}
//         </p>

//         {/* Row 3: why — full width now, no squeezing */}
//         <p style={{
//           fontSize:11, color: selected ? `${habit.color}cc` : T.t4,
//           margin:0, lineHeight:1.5, letterSpacing:"-0.005em",
//           transition:"color 0.25s",
//         }}>
//           {habit.why}
//         </p>

//       </div>
//     </button>
//   );
// }

// // ─── 21-DAY REVIEW PROMPT ─────────────────────────────────────────────────────
// function ReviewPrompt({
//   selectedIds, onContinue, onModify,
// }: {
//   selectedIds: string[];
//   onContinue: () => void;
//   onModify: (ids: string[]) => void;
// }) {
//   const habits = ALL_HABITS.filter(h => selectedIds.includes(h.id));
//   const [modifying, setModifying] = useState(false);
//   const [newSelected, setNewSelected] = useState<string[]>(selectedIds);

//   if (modifying) {
//     return (
//       <HabitSetupPage
//         initialSelected={newSelected}
//         isReview
//         onComplete={(ids) => { onModify(ids); }}
//       />
//     );
//   }

//   return (
//     <div style={{
//       minHeight:"100vh", background:T.bg, paddingBottom:64,
//       fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif",
//       WebkitFontSmoothing:"antialiased",
//     }}>
//       <div style={{ maxWidth:390, margin:"0 auto", padding:"0 18px" }}>

//         {/* Header */}
//         <div style={{ paddingTop:64, paddingBottom:32 }}>
//           {/* Trophy */}
//           <div style={{
//             width:64, height:64, borderRadius:20, marginBottom:20,
//             background:"rgba(255,159,10,0.15)", border:"1px solid rgba(255,159,10,0.3)",
//             display:"flex", alignItems:"center", justifyContent:"center",
//           }}>
//             <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
//               stroke="#ff9f0a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M6 9H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h2"/>
//               <path d="M18 9h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/>
//               <path d="M6 9V4h12v5"/>
//               <path d="M6 14c0 3.3 2.7 6 6 6s6-2.7 6-6"/>
//               <path d="M9 21h6M12 21v-1"/>
//             </svg>
//           </div>

//           <p style={{ fontSize:12, fontWeight:600, letterSpacing:"0.1em",
//             textTransform:"uppercase", color:"#ff9f0a", margin:"0 0 8px" }}>
//             21 Days Complete
//           </p>
//           <h1 style={{ fontSize:30, fontWeight:700, letterSpacing:"-0.04em",
//             color:T.t1, lineHeight:1.1, margin:"0 0 10px" }}>
//             You built real habits.
//           </h1>
//           <p style={{ fontSize:15, color:T.t2, lineHeight:1.6,
//             letterSpacing:"-0.01em", margin:0 }}>
//             Research shows 21 days creates a habit loop. Review your commitment — keep what worked, swap what didn't.
//           </p>
//         </div>

//         {/* Stats row */}
//         <div style={{
//           display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:24,
//         }}>
//           {[
//             { label:"Days logged", value:"21", color:"#30d158" },
//             { label:"Habits kept", value:String(habits.length), color:T.brand },
//             { label:"Streak best", value:"18d", color:"#ff9f0a" },
//           ].map(s => (
//             <div key={s.label} style={{
//               background:T.card, border:`1px solid ${T.borderLo}`,
//               borderRadius:14, padding:"14px 12px", textAlign:"center",
//             }}>
//               <p style={{ fontSize:24, fontWeight:700, letterSpacing:"-0.04em",
//                 color:s.color, margin:"0 0 4px", lineHeight:1 }}>
//                 {s.value}
//               </p>
//               <p style={{ fontSize:11, color:T.t3, margin:0, letterSpacing:"-0.01em" }}>
//                 {s.label}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* Current habits */}
//         <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em",
//           textTransform:"uppercase", color:T.t3, margin:"0 0 10px 2px" }}>
//           Your habits
//         </p>
//         <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:28 }}>
//           {habits.map(h => (
//             <div key={h.id} style={{
//               display:"flex", alignItems:"center", gap:12,
//               padding:"13px 16px", borderRadius:14,
//               background:T.card, border:`1px solid ${T.borderLo}`,
//             }}>
//               <div style={{
//                 width:36, height:36, borderRadius:10, flexShrink:0,
//                 display:"flex", alignItems:"center", justifyContent:"center",
//                 background:`${h.color}18`, color:h.color,
//               }}>
//                 {h.icon}
//               </div>
//               <div style={{ flex:1 }}>
//                 <p style={{ fontSize:14, fontWeight:600, color:T.t1,
//                   margin:0, letterSpacing:"-0.02em" }}>
//                   {h.label}
//                 </p>
//                 <p style={{ fontSize:11, color:T.t3, margin:"2px 0 0" }}>
//                   {h.impact}
//                 </p>
//               </div>
//               <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//                 <path d="M3 8l4 4 6-7" stroke="#30d158" strokeWidth="2"
//                   strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//             </div>
//           ))}
//         </div>

//         {/* CTAs */}
//         <button onClick={onContinue}
//           style={{
//             width:"100%", height:56, borderRadius:17,
//             fontSize:16, fontWeight:700, letterSpacing:"-0.02em",
//             color:"#fff",
//             background:"linear-gradient(150deg,#0a84ff 0%,#0060cc 100%)",
//             border:"none",
//             boxShadow:"0 8px 32px rgba(10,132,255,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
//             cursor:"pointer", marginBottom:10,
//             transition:"transform 0.12s",
//           }}
//           onMouseDown={e => (e.currentTarget.style.transform="scale(0.97)")}
//           onMouseUp={e => (e.currentTarget.style.transform="scale(1)")}
//         >
//           Continue with these habits
//         </button>

//         <button onClick={() => setModifying(true)}
//           style={{
//             width:"100%", height:52, borderRadius:17,
//             fontSize:15, fontWeight:600, letterSpacing:"-0.02em",
//             color:T.brand,
//             background:T.brandLo,
//             border:`1px solid ${T.brandBorder}`,
//             cursor:"pointer",
//             transition:"all 0.15s",
//           }}
//           onMouseDown={e => (e.currentTarget.style.transform="scale(0.97)")}
//           onMouseUp={e => (e.currentTarget.style.transform="scale(1)")}
//         >
//           Review & modify habits
//         </button>

//       </div>
//     </div>
//   );
// }

// // ─── HABIT SETUP PAGE ─────────────────────────────────────────────────────────

// function HabitSetupPage({
//   initialSelected = [],
//   isReview = false,
//   onComplete,
// }: {
//   initialSelected?: string[];
//   isReview?: boolean;
//   onComplete: (selectedIds: string[]) => void;
// }) {
//   const [selected, setSelected] = useState<string[]>(initialSelected);
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);
//   const [suggestion, setSuggestion] = useState("");
//   const [submitted, setSubmitted] = useState(false);

//   const submitSuggestion = () => {
//     if (!suggestion.trim()) return;
//     // In production: POST to /api/habit-suggestions with suggestion + user id
//     console.log("Habit suggestion submitted for admin review:", suggestion.trim());
//     setSuggestion("");
//     setSubmitted(true);
//     setTimeout(() => setSubmitted(false), 3000);
//   };

//   const toggle = (id: string) => {
//     setSelected(prev => {
//       if (prev.includes(id)) return prev.filter(x => x !== id);
//       if (prev.length >= MAX_HABITS) return prev;
//       return [...prev, id];
//     });
//   };

//   const canProceed = selected.length >= MIN_HABITS;
//   const remaining  = MAX_HABITS - selected.length;

//   // Filter by active category or show all
//   const filteredHabits = activeCategory
//     ? ALL_HABITS.filter(h => h.category === activeCategory)
//     : ALL_HABITS;

//   // Group by category for display
//   const grouped = CATEGORIES.reduce((acc, cat) => {
//     const habits = filteredHabits.filter(h => h.category === cat);
//     if (habits.length) acc[cat] = habits;
//     return acc;
//   }, {} as Record<string, HabitDef[]>);

//   return (
//     <div style={{
//       minHeight:"100vh", background:T.bg, paddingBottom:120,
//       fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif",
//       WebkitFontSmoothing:"antialiased",
//     }}>
//       <div style={{ maxWidth:390, margin:"0 auto", padding:"0 18px" }}>

//         {/* ── Header ──────────────────────────────────────────────────── */}
//         <div style={{ paddingTop:60, paddingBottom:24 }}>
//           <p style={{ fontSize:12, fontWeight:600, letterSpacing:"0.1em",
//             textTransform:"uppercase", color:T.brand, margin:"0 0 8px" }}>
//             {isReview ? "Day 21 Review" : "21-Day Commitment"}
//           </p>
//           <h1 style={{ fontSize:30, fontWeight:700, letterSpacing:"-0.04em",
//             color:T.t1, lineHeight:1.1, margin:"0 0 8px" }}>
//             {isReview ? "Adjust your habits" : "Choose your habits"}
//           </h1>
//           <p style={{ fontSize:15, color:T.t2, lineHeight:1.55,
//             letterSpacing:"-0.01em", margin:0 }}>
//             {isReview
//               ? "Keep what worked. Swap what didn't. You know yourself better now."
//               : "Pick 2–4 habits you'll commit to for 21 days. Science shows this is when habits become automatic."}
//           </p>
//         </div>

//         {/* ── Selection counter ───────────────────────────────────────── */}
//         <div style={{
//           display:"flex", alignItems:"center", justifyContent:"space-between",
//           marginBottom:16,
//         }}>
//           {/* Progress pills */}
//           <div style={{ display:"flex", gap:5 }}>
//             {Array.from({ length:MAX_HABITS }).map((_,i) => (
//               <div key={i} style={{
//                 width:28, height:6, borderRadius:99,
//                 background: i < selected.length ? T.brand : "#2c2c2e",
//                 transition:"background 0.25s",
//                 boxShadow: i < selected.length ? `0 0 8px ${T.brand}60` : "none",
//               }}/>
//             ))}
//           </div>
//           <p style={{ fontSize:13, color:T.t3, margin:0, letterSpacing:"-0.01em" }}>
//             {selected.length}/{MAX_HABITS} selected
//             {selected.length < MIN_HABITS && (
//               <span style={{ color:T.t3 }}> · pick {MIN_HABITS - selected.length} more</span>
//             )}
//           </p>
//         </div>

//         {/* ── Category filter tabs ─────────────────────────────────────── */}
//         <div style={{
//           display:"flex", gap:8, marginBottom:24, overflowX:"auto",
//           paddingBottom:2,
//         }}>
//           <button
//             onClick={() => setActiveCategory(null)}
//             style={{
//               padding:"7px 16px", borderRadius:99, flexShrink:0,
//               fontSize:13, fontWeight:600, letterSpacing:"-0.01em",
//               background: activeCategory === null ? T.brand : "#1c1c1e",
//               color: activeCategory === null ? "#fff" : T.t2,
//               border: `1px solid ${activeCategory === null ? T.brand : "#3a3a3c"}`,
//               cursor:"pointer", transition:"all 0.18s",
//             }}
//           >
//             All
//           </button>
//           {CATEGORIES.map(cat => (
//             <button key={cat}
//               onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
//               style={{
//                 padding:"7px 16px", borderRadius:99, flexShrink:0,
//                 fontSize:13, fontWeight:600, letterSpacing:"-0.01em",
//                 background: activeCategory === cat ? `${CAT_COLOR[cat]}18` : "#1c1c1e",
//                 color: activeCategory === cat ? CAT_COLOR[cat] : T.t2,
//                 border: `1px solid ${activeCategory === cat ? CAT_COLOR[cat]+"40" : "#3a3a3c"}`,
//                 cursor:"pointer", transition:"all 0.18s",
//               }}
//             >
//               {cat}
//             </button>
//           ))}
//         </div>

//         {/* ── Habit groups ─────────────────────────────────────────────── */}
//         {Object.entries(grouped).map(([cat, habits]) => (
//           <div key={cat} style={{ marginBottom:28 }}>
//             {/* Category heading */}
//             <div style={{
//               display:"flex", alignItems:"center", gap:8, marginBottom:10,
//             }}>
//               <div style={{
//                 width:6, height:6, borderRadius:"50%",
//                 background: CAT_COLOR[cat],
//                 boxShadow:`0 0 8px ${CAT_COLOR[cat]}80`,
//               }}/>
//               <p style={{
//                 fontSize:11, fontWeight:700, letterSpacing:"0.1em",
//                 textTransform:"uppercase", color: CAT_COLOR[cat], margin:0,
//               }}>
//                 {cat}
//               </p>
//             </div>

//             {/* Cards */}
//             <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
//               {habits.map(h => (
//                 <HabitSelectCard
//                   key={h.id} habit={h}
//                   selected={selected.includes(h.id)}
//                   disabled={selected.length >= MAX_HABITS}
//                   onToggle={() => toggle(h.id)}
//                 />
//               ))}
//             </div>
//           </div>
//         ))}

//         {/* ── Suggest a habit ─────────────────────────────────────────── */}
//         <div style={{ marginBottom:120 }}>
//           <div style={{
//             display:"flex", alignItems:"center", gap:8, marginBottom:10,
//           }}>
//             <div style={{
//               width:6, height:6, borderRadius:"50%",
//               background:T.brand, boxShadow:`0 0 8px ${T.brand}80`,
//             }}/>
//             <p style={{
//               fontSize:11, fontWeight:700, letterSpacing:"0.1em",
//               textTransform:"uppercase", color:T.brand, margin:0,
//             }}>
//               Suggest a habit
//             </p>
//           </div>

//           <p style={{ fontSize:13, color:T.t3, margin:"0 0 12px", letterSpacing:"-0.01em" }}>
//             Know a habit that should be here? Suggest it — our team will review and add the best ones.
//           </p>

//           {/* Input row */}
//           <div style={{ display:"flex", gap:8 }}>
//             <input
//               value={suggestion}
//               onChange={e => setSuggestion(e.target.value)}
//               onKeyDown={e => e.key === "Enter" && submitSuggestion()}
//               placeholder="e.g. Oil pulling, Surya namaskar..."
//               style={{
//                 flex:1, height:46, borderRadius:13,
//                 background:"#1c1c1e", border:`1px solid ${suggestion ? T.brand : "#3a3a3c"}`,
//                 color:T.t1, fontSize:14, padding:"0 14px",
//                 outline:"none", transition:"border-color 0.2s",
//                 fontFamily:"inherit", letterSpacing:"-0.01em",
//               }}
//             />
//             <button onClick={submitSuggestion}
//               disabled={!suggestion.trim()}
//               style={{
//                 height:46, width:46, borderRadius:13, flexShrink:0,
//                 background: submitted ? "#30d158" : suggestion.trim() ? T.brand : "#2c2c2e",
//                 border:"none", cursor: suggestion.trim() ? "pointer" : "default",
//                 display:"flex", alignItems:"center", justifyContent:"center",
//                 transition:"background 0.25s",
//               }}>
//               {submitted
//                 ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
//                     <path d="M3 9l4 4 8-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                 : <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
//                     <path d="M9 3v12M3 9h12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
//                   </svg>
//               }
//             </button>
//           </div>

//           {/* Confirmation message */}
//           {submitted && (
//             <div style={{
//               display:"flex", alignItems:"center", gap:10,
//               marginTop:12, padding:"12px 14px", borderRadius:13,
//               background:"rgba(48,209,88,0.1)", border:"1px solid rgba(48,209,88,0.25)",
//             }}>
//               <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//                 <path d="M3 8l4 4 6-7" stroke="#30d158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//               </svg>
//               <div>
//                 <p style={{ fontSize:13, fontWeight:600, color:"#30d158", margin:0, letterSpacing:"-0.01em" }}>
//                   Suggestion sent — thank you!
//                 </p>
//                 <p style={{ fontSize:11, color:T.t3, margin:"2px 0 0" }}>
//                   Our team will review and add the best ones to the list.
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>

//       </div>

//       {/* ── Sticky bottom CTA ───────────────────────────────────────────── */}
//       <div style={{
//         position:"fixed", bottom:0, left:0, right:0,
//         background:"linear-gradient(to top, #000 60%, transparent)",
//         padding:"20px 18px 36px",
//       }}>
//         <div style={{ maxWidth:390, margin:"0 auto" }}>
//           {/* Selected habit chips */}
//           {selected.length > 0 && (
//             <div style={{
//               display:"flex", gap:6, flexWrap:"wrap", marginBottom:12,
//             }}>
//               {selected.map(id => {
//                 const h = ALL_HABITS.find(x => x.id === id)!;
//                 return (
//                   <button key={id}
//                     onClick={() => toggle(id)}
//                     style={{
//                       display:"flex", alignItems:"center", gap:5,
//                       padding:"5px 10px 5px 8px", borderRadius:99,
//                       background:`${h.color}18`,
//                       border:`1px solid ${h.color}30`,
//                       cursor:"pointer", transition:"all 0.15s",
//                     }}>
//                     <div style={{ color:h.color, display:"flex", alignItems:"center" }}>
//                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
//                         stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//                         <line x1="18" y1="6" x2="6" y2="18"/>
//                         <line x1="6" y1="6" x2="18" y2="18"/>
//                       </svg>
//                     </div>
//                     <span style={{ fontSize:12, fontWeight:600,
//                       color:h.color, letterSpacing:"-0.01em" }}>
//                       {h.label.split(" ").slice(0,2).join(" ")}
//                     </span>
//                   </button>
//                 );
//               })}
//             </div>
//           )}

//           <button
//             onClick={() => canProceed && onComplete(selected)}
//             disabled={!canProceed}
//             style={{
//               width:"100%", height:56, borderRadius:17,
//               fontSize:16, fontWeight:700, letterSpacing:"-0.02em",
//               color: canProceed ? "#fff" : T.t4,
//               background: canProceed
//                 ? "linear-gradient(150deg,#0a84ff 0%,#0060cc 100%)"
//                 : "#1c1c1e",
//               border: canProceed ? "none" : `1px solid ${T.borderLo}`,
//               boxShadow: canProceed
//                 ? "0 8px 32px rgba(10,132,255,0.4), inset 0 1px 0 rgba(255,255,255,0.12)"
//                 : "none",
//               cursor: canProceed ? "pointer" : "default",
//               transition:"all 0.2s cubic-bezier(.4,0,.2,1)",
//             }}
//             onMouseDown={e => canProceed && (e.currentTarget.style.transform="scale(0.97)")}
//             onMouseUp={e => (e.currentTarget.style.transform="scale(1)")}
//           >
//             {!canProceed
//               ? `Choose ${MIN_HABITS - selected.length} more habit${MIN_HABITS - selected.length !== 1 ? "s" : ""} to continue`
//               : isReview
//               ? `Confirm ${selected.length} habits →`
//               : `Start 21-day challenge →`}
//           </button>
//         </div>
//       </div>

//       <style>{`
//         ::-webkit-scrollbar { display:none; }
//       `}</style>
//     </div>
//   );
// }

// // ─── ROOT EXPORT — orchestrates the full flow ──────────────────────────────────
// // Flow: Setup → HabitBuilder (21 days) → Review → back to HabitBuilder

// type FlowState = "setup" | "tracking" | "review";

// export default function HabitFlow() {
//   const [flow,     setFlow]     = useState<FlowState>("setup");
//   const [selected, setSelected] = useState<string[]>([]);
//   const [startDate,setStartDate]= useState<Date | null>(null);

//   // Check if 21 days have elapsed
//   useEffect(() => {
//     if (!startDate || flow !== "tracking") return;
//     const days = Math.floor((Date.now() - startDate.getTime()) / 86_400_000);
//     if (days >= 21) setFlow("review");
//   }, [startDate, flow]);

//   // For demo: show "review" trigger button in tracking mode
//   const [demoDay, setDemoDay] = useState(1);

//   if (flow === "setup") {
//     return (
//       <HabitSetupPage
//         onComplete={(ids) => {
//           setSelected(ids);
//           setStartDate(new Date());
//           setFlow("tracking");
//         }}
//       />
//     );
//   }

//   if (flow === "review") {
//     return (
//       <ReviewPrompt
//         selectedIds={selected}
//         onContinue={() => {
//           setStartDate(new Date());
//           setFlow("tracking");
//         }}
//         onModify={(ids) => {
//           setSelected(ids);
//           setStartDate(new Date());
//           setFlow("tracking");
//         }}
//       />
//     );
//   }

//   // tracking — renders the HabitBuilderPage (imported separately)
//   // For now, show a placeholder with day counter and demo controls
//   return (
//     <div style={{
//       minHeight:"100vh", background:T.bg,
//       fontFamily:"-apple-system,'SF Pro Display',BlinkMacSystemFont,sans-serif",
//       WebkitFontSmoothing:"antialiased",
//       display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
//       gap:16, padding:24,
//     }}>
//       <p style={{ fontSize:13, color:T.t3, letterSpacing:"0.08em",
//         textTransform:"uppercase", margin:0 }}>
//         21-Day Challenge
//       </p>
//       <p style={{ fontSize:48, fontWeight:700, letterSpacing:"-0.06em",
//         color:T.t1, margin:0, lineHeight:1 }}>
//         Day {demoDay}
//       </p>
//       <p style={{ fontSize:14, color:T.t2, margin:0 }}>
//         {selected.length} habits committed
//       </p>

//       <div style={{ display:"flex", gap:8, marginTop:8 }}>
//         {selected.map(id => {
//           const h = ALL_HABITS.find(x => x.id===id)!;
//           return (
//             <div key={id} style={{
//               width:36, height:36, borderRadius:10,
//               background:`${h.color}18`,
//               border:`1px solid ${h.color}30`,
//               display:"flex", alignItems:"center", justifyContent:"center",
//               color:h.color,
//             }}>
//               {h.icon}
//             </div>
//           );
//         })}
//       </div>

//       {/* Demo controls */}
//       <div style={{ display:"flex", gap:10, marginTop:16 }}>
//         <button onClick={() => setFlow("setup")}
//           style={{ padding:"10px 20px", borderRadius:12, background:"#1c1c1e",
//             border:"1px solid #3a3a3c", color:T.t2, fontSize:13,
//             fontWeight:600, cursor:"pointer" }}>
//           ← Back to setup
//         </button>
//         <button onClick={() => setFlow("review")}
//           style={{ padding:"10px 20px", borderRadius:12,
//             background:T.brandLo, border:`1px solid ${T.brandBorder}`,
//             color:T.brand, fontSize:13, fontWeight:600, cursor:"pointer" }}>
//           Skip to day 21 →
//         </button>
//       </div>
//     </div>
//   );
// }