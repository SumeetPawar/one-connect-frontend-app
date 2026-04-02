'use client';
import React from "react";

export const SA   = ["#8E6940","#4A9B5F","#2D8A52","#1E7A42","#166A34","#30D158"];

// ─── Haptics ───────────────────────────────────────────────────────────────
export const haptic = {
  light:   () => navigator.vibrate && navigator.vibrate(8),
  medium:  () => navigator.vibrate && navigator.vibrate(18),
  success: () => navigator.vibrate && navigator.vibrate([10,50,20]),
  unlock:  () => navigator.vibrate && navigator.vibrate([20,40,30,40,50]),
  tile:    () => navigator.vibrate && navigator.vibrate(5),
};
export const BG   = "#0A0A0A";
export const S1   = "#141414";
export const S2   = "#1E1E1E";
export const S3   = "#2A2A2A";
export const T1   = "#F0EDE8";
export const T2   = "rgba(240,237,232,0.52)";
export const T3   = "rgba(240,237,232,0.28)";
export const SEP  = "rgba(240,237,232,0.07)";
export const WARN = "#C8873A";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const easeT  = { duration:0.55, ease:[0.22,1,0.36,1] } as any;
export const springT = { type:"spring" as const, stiffness:280, damping:32 };
export const slowT   = { type:"spring" as const, stiffness:140, damping:24 };

// Returns a sized-SVG React component — drop-in for HabitRow's Icon prop
function svgIcon(inner: React.ReactNode): React.ElementType {
  return function SvgIcon() {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {inner}
      </svg>
    );
  };
}

export const ALL_HABITS_DEF = [
  // ── Body ──────────────────────────────────────────────────────────────────
  { id:"sleep",             label:"Sleep 7–8 hours",              sub:"In bed before 11pm",              color:"#8B72BE", Icon:svgIcon(<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>) },
  { id:"exercise",          label:"Exercise 30 min",              sub:"Any movement counts",             color:"#5B9BD5", Icon:svgIcon(<><path d="M6.5 6.5h11M6.5 17.5h11M4 9h3m10 0h3M4 15h3m10 0h3M9.5 6.5v11M14.5 6.5v11"/></>) },
  { id:"steps",             label:"5,000–10,000 steps",           sub:"Walk it out",                     color:"#4A9B5F", Icon:svgIcon(<path d="M13 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0M7.5 17.5L9 13l3 2 2-3.5M6 20l2-4 4 1 3-5 2 1"/>) },
  { id:"water",             label:"Drink 2.5L water",             sub:"Nourish from within",             color:"#5B9BD5", Icon:svgIcon(<path d="M12 2s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13z"/>) },
  { id:"sunlight",          label:"Morning sunlight 10 min",      sub:"Outside within 1hr of waking",   color:"#C8873A", Icon:svgIcon(<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/></>) },
  { id:"stretch",           label:"Stretch 10 min",               sub:"Hips, spine, shoulders",          color:"#4A9B5F", Icon:svgIcon(<path d="M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>) },
  { id:"walkaftermeals",    label:"Walk after meals 10 min",      sub:"Short walk after lunch/dinner",   color:"#4A9B5F", Icon:svgIcon(<path d="M13 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0M7.5 17.5L9 13l3 2 2-3.5"/>) },
  { id:"callsomeone",       label:"Call someone you care about",  sub:"5 min with someone close",        color:"#C8873A", Icon:svgIcon(<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>) },
  { id:"noprocessed",       label:"No junk food",                 sub:"Skip fried and packaged",         color:"#E84F8A", Icon:svgIcon(<><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>) },
  { id:"nosmoking",         label:"No smoking",                   sub:"Zero cigarettes",                 color:"#E84F8A", Icon:svgIcon(<><line x1="2" y1="2" x2="22" y2="22"/><path d="M12 12H2M22 12h-4"/></>) },
  { id:"noalcohol",         label:"No alcohol",                   sub:"Zero drinks",                     color:"#E84F8A", Icon:svgIcon(<><path d="M8 2h8l1 7H7L8 2zM7 9c0 5 2 9 5 9s5-4 5-9"/><line x1="4" y1="4" x2="20" y2="20"/></>) },
  { id:"veggies",           label:"Fill half plate with veg",     sub:"Any vegetable counts",            color:"#4A9B5F", Icon:svgIcon(<path d="M12 2a5 5 0 0 1 5 5c0 5-5 11-5 11S7 12 7 7a5 5 0 0 1 5-5z"/>) },
  { id:"coldshower",        label:"Cold shower 2 min",            sub:"End on cold",                     color:"#5B9BD5", Icon:svgIcon(<><path d="M12 2v6M12 22v-2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/><circle cx="12" cy="12" r="4"/></>) },
  { id:"proteintarget",     label:"Hit daily protein target",     sub:"1.6g per kg bodyweight",          color:"#4A9B5F", Icon:svgIcon(<><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>) },
  { id:"zone2cardio",       label:"Zone 2 cardio 30 min",         sub:"Conversational pace",             color:"#5B9BD5", Icon:svgIcon(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>) },
  // ── Mind ──────────────────────────────────────────────────────────────────
  { id:"meditation",        label:"Meditate 10 min",              sub:"Quiet the noise",                 color:"#8B72BE", Icon:svgIcon(<><circle cx="12" cy="6" r="2"/><path d="M9 21c.5-3 1.5-5 3-5s2.5 2 3 5M9.5 14V11a2.5 2.5 0 0 1 5 0v3"/></>) },
  { id:"meditate",          label:"Meditate 10 min",              sub:"Quiet the noise",                 color:"#8B72BE", Icon:svgIcon(<><circle cx="12" cy="6" r="2"/><path d="M9 21c.5-3 1.5-5 3-5s2.5 2 3 5M9.5 14V11a2.5 2.5 0 0 1 5 0v3"/></>) },
  { id:"read",              label:"Read 20 minutes",              sub:"Feed a quiet mind",               color:"#8B72BE", Icon:svgIcon(<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>) },
  { id:"learn",             label:"Learn 15 min",                 sub:"One skill, consistently",         color:"#8B72BE", Icon:svgIcon(<><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></>) },
  { id:"journal",           label:"Gratitude journal",            sub:"3 things you're grateful for",    color:"#C8873A", Icon:svgIcon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></>) },
  { id:"breathwork",        label:"Breathwork 5 min",             sub:"Box or 4-7-8 breathing",          color:"#8B72BE", Icon:svgIcon(<><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></>) },
  { id:"deepwork",          label:"Deep work 90 min",             sub:"Single task, no interruptions",   color:"#8B72BE", Icon:svgIcon(<><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>) },
  { id:"noscreens",         label:"No screens 1hr before bed",    sub:"Phone down before sleep",         color:"#E84F8A", Icon:svgIcon(<><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4M4 4l16 16"/></>) },
  { id:"nosocialmedia",     label:"No social media before 10am",  sub:"Protect the morning",             color:"#E84F8A", Icon:svgIcon(<><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85"/></>) },
  { id:"proactivelanguage", label:"Proactive language",           sub:"Replace 'can't' with 'choose'",   color:"#8B72BE", Icon:svgIcon(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>) },
  { id:"discomfortchallenge",label:"Daily discomfort challenge",  sub:"One uncomfortable action",        color:"#C8873A", Icon:svgIcon(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>) },
  { id:"visualisation",     label:"Visualisation 5 min",          sub:"Mental rehearsal",                color:"#8B72BE", Icon:svgIcon(<><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></>) },
  // ── Lifestyle ─────────────────────────────────────────────────────────────
  { id:"eatingwindow",      label:"Eat in 10–12 hour window",     sub:"Consistent daily window",         color:"#C8873A", Icon:svgIcon(<><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>) },
  { id:"caffeine",          label:"No caffeine after 2pm",         sub:"Stop chai/coffee by 2pm",         color:"#E84F8A", Icon:svgIcon(<><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/></>) },
  { id:"nosugar",           label:"No added sugar",               sub:"Check labels",                    color:"#E84F8A", Icon:svgIcon(<><path d="M12 2c1 2 3 3.5 3 5.5a3 3 0 0 1-6 0C9 5.5 11 4 12 2z"/><line x1="4" y1="4" x2="20" y2="20"/></>) },
  { id:"trackspending",     label:"Track daily spending",         sub:"Log every purchase",              color:"#C8873A", Icon:svgIcon(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>) },
  { id:"preparetomorrow",   label:"Prepare tomorrow tonight",     sub:"Top 3 tasks + bag, 5 min",        color:"#8B72BE", Icon:svgIcon(<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>) },
  { id:"timeblock",         label:"Time-block your day",          sub:"Assign hours to tasks",           color:"#8B72BE", Icon:svgIcon(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>) },
  { id:"nearfareye",        label:"Near-far eye training 5 min", sub:"Alternate focus distances",       color:"#5B9BD5", Icon:svgIcon(<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>) },
  { id:"presleepbath",      label:"Warm bath before bed",         sub:"10 min, 60–90 min before sleep",  color:"#8B72BE", Icon:svgIcon(<><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h3v2.25"/></>) },
  { id:"daily5goals",       label:"Write 5 micro-goals today",    sub:"5 small achievable wins",         color:"#C8873A", Icon:svgIcon(<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>) },
  // ── Legacy aliases ────────────────────────────────────────────────────────
  { id:"move",  label:"30 min movement",  sub:"Let your body breathe", color:"#4A9B5F", Icon:svgIcon(<><path d="M6.5 6.5h11M6.5 17.5h11M4 9h3m10 0h3M4 15h3m10 0h3M9.5 6.5v11M14.5 6.5v11"/></>) },
];

export const STAGE_META = [
  { label:"Seed",       emoji:"🌰", title:"A seed is planted.",       body:"Something has been set in motion. The quietest beginnings hold the deepest roots." },
  { label:"Sprout",     emoji:"🌱", title:"Something stirs.",         body:"Beneath the surface, life is finding its way. You are already growing." },
  { label:"Seedling",   emoji:"🌿", title:"It takes hold.",           body:"The habit has a shape now. Keep returning to it, and it will keep growing." },
  { label:"Sapling",    emoji:"🌲", title:"A tree stands here.",      body:"You have passed the point where most give up. Let that quietly mean something." },
  { label:"Young Tree", emoji:"🌳", title:"Roots run deep.",          body:"This is no longer just a habit. It is becoming part of who you are." },
  { label:"Full Bloom", emoji:"🌸", title:"21 days.",                 body:"You grew a tree. Not with force — with patience, repetition, and showing up." },
];
