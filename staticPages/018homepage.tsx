import { useState, useEffect } from "react";

function useCount(target: number, delay = 300, dur = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const s = performance.now();
      const f = (n: number) => { const p = Math.min((n-s)/dur,1); setV(Math.round((1-Math.pow(1-p,3))*target)); if(p<1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay, dur]);
  return v;
}
function usePct(target: number, delay = 400, dur = 1100) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const s = performance.now();
      const f = (n: number) => { const p = Math.min((n-s)/dur,1); setV((1-Math.pow(1-p,4))*target); if(p<1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay, dur]);
  return v;
}

// ── Premium Purple-Pink Fitness Theme ─────────────────────────────────────
// ── Premium Wellness Colour System ────────────────────────────────────────
// Reference: Headspace calm + Nothing OS precision + Oura ring premium
// One gradient. One accent family. Everything else recedes.
const T = {
  // Canvas — warm dark, not cold
  bg:   "#08080F",   // deep warm black
  card: "#100E1A",   // barely lifted surface

  // Brand gradient — soft lavender to violet, dusk not rave
  grad:     "linear-gradient(135deg,#A78BF5 0%,#7C5CE8 100%)",
  gradSoft: "linear-gradient(180deg,rgba(155,127,232,.22) 0%,rgba(124,92,232,.04) 100%)",
  gradHero: "linear-gradient(180deg,rgba(167,139,245,.28) 0%,rgba(124,92,232,.08) 60%,rgba(91,65,200,.02) 100%)",

  // Accent — single violet family, no competing hues
  purple: "#9B7FE8",   // primary — muted lavender violet
  purpleL:"#C4B0F8",   // light variant for text on dark
  violet: "#6D4FCC",   // deep pressed state

  // Semantic — carefully chosen, never neon
  green:  "#2DD4BF",   // completion — calm teal-green (Oura style)
  orange: "#F4A261",   // streak — warm amber, human not aggressive
  rose:   "#E87A8A",   // body — dusty rose, not hot pink
  teal:   "#38BDF8",   // mindfulness — clear sky blue

  // Typography — warm off-white, not pure white
  t1: "#F2EEFF",
  t2: "rgba(242,238,255,0.65)",
  t3: "rgba(242,238,255,0.38)",
  t4: "rgba(242,238,255,0.20)",
  t5: "rgba(242,238,255,0.09)",

  // Surfaces
  s1: "rgba(255,255,255,0.06)",
  b1: "rgba(255,255,255,0.09)",
  b2: "rgba(255,255,255,0.06)",
};

type Tab = "not-joined"|"morning"|"evening"|"logged";

// ── Icons ──────────────────────────────────────────────────────────────────
const Ic = {
  Bell:   ({c=T.t2,s=17}:{c?:string;s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Walk:   ({c=T.t1,s=17}:{c?:string;s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="1.5"/><path d="M9 8.5l-2 5 3 1-1 5"/><path d="M12 8.5l1.5 4-3.5 1"/><path d="M14 8l2 2-2 3"/></svg>,
  Flame:  ({c=T.t1,s=17}:{c?:string;s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2s-5 4.5-5 9.5a5 5 0 0010 0C17 7.5 14.5 4 12 2z"/><path d="M12 12s-2-1.5-2-3c0-1.2.8-2.5 2-3 1.2.5 2 1.8 2 3 0 1.5-2 3-2 3z"/></svg>,
  Check:  ({c=T.t1,s=12}:{c?:string;s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>,
  Up:     ({c=T.t1,s=10}:{c?:string;s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
  ChevR:  ({c=T.t3,s=13}:{c?:string;s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>,
  Body:   ({c=T.t1,s=17}:{c?:string;s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4.5" r="2"/><path d="M8 9.5h8l-1 5H9l-1-5z"/><path d="M10 14.5l-1.5 5M14 14.5l1.5 5"/><path d="M12 9.5v5"/></svg>,
  Breath: ({c=T.t1,s=17}:{c?:string;s?:number}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>,
};

// ── Arc ring ───────────────────────────────────────────────────────────────
function Arc({pct,size,sw,color,bg}:{pct:number;size:number;sw:number;color:string;bg?:string}) {
  const r=(size-sw)/2, c=2*Math.PI*r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg||"rgba(238,237,245,.07)"} strokeWidth={sw}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeLinecap="round" strokeDasharray={`${c*pct/100} ${c}`}/>
    </svg>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────
function Spark({color,pts}:{color:string;pts:number[]}) {
  const w=72,h=22,p=2;
  const mn=Math.min(...pts),mx=Math.max(...pts);
  const x=(i:number)=>p+(i/(pts.length-1))*(w-p*2);
  const y=(v:number)=>h-p-((v-mn)/(mx-mn||1))*(h-p*2);
  const d=pts.map((v,i)=>`${i===0?"M":"L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".45"/>
      <circle cx={x(pts.length-1)} cy={y(pts[pts.length-1])} r="2.5" fill={color} opacity=".85"/>
    </svg>
  );
}

// ── Tree SVG — 4 growth stages, richly illustrated ────────────────────────
function TreeSvg({stage,size=90}:{stage:0|1|2|3;size?:number}) {

  // Stage 0 — tiny glowing sapling, invites curiosity
  if(stage===0) return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      {/* Soil mound */}
      <ellipse cx="60" cy="108" rx="22" ry="6" fill="rgba(139,106,69,.25)"/>
      {/* Trunk */}
      <path d="M58 108 Q57 94 59 84 Q60 78 61 84 Q63 94 62 108Z" fill="#8B6A45"/>
      {/* Tiny left leaf */}
      <path d="M59 88 Q50 80 46 72 Q52 76 59 82Z" fill="#2A9E6E" opacity=".85"/>
      {/* Tiny right leaf */}
      <path d="M61 85 Q70 77 74 69 Q68 74 61 80Z" fill="#2A9E6E" opacity=".85"/>
      {/* First bud */}
      <circle cx="60" cy="78" r="5" fill="#4ADE9F"/>
      <circle cx="60" cy="75" r="3" fill="#5EE8A8"/>
      {/* Glow rings — makes it feel alive and inviting */}
      <circle cx="60" cy="76" r="12" fill="none" stroke="rgba(74,222,159,.22)" strokeWidth="2"/>
      <circle cx="60" cy="76" r="18" fill="none" stroke="rgba(74,222,159,.12)" strokeWidth="1.5"/>
      <circle cx="60" cy="76" r="25" fill="none" stroke="rgba(74,222,159,.06)" strokeWidth="1"/>
      {/* Sparkle dots */}
      <circle cx="42" cy="68" r="1.5" fill="rgba(94,232,168,.70)"/>
      <circle cx="78" cy="64" r="1.5" fill="rgba(94,232,168,.70)"/>
      <circle cx="52" cy="58" r="1" fill="rgba(94,232,168,.50)"/>
      <circle cx="70" cy="60" r="1" fill="rgba(94,232,168,.50)"/>
    </svg>
  );

  // Stage 1 — sprout with character, first real canopy
  if(stage===1) return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="108" rx="24" ry="6" fill="rgba(139,106,69,.22)"/>
      {/* Trunk with slight curve */}
      <path d="M56 108 Q54 90 57 76 Q59 68 61 76 Q64 90 64 108Z" fill="#8B6A45" opacity=".9"/>
      {/* Root hints */}
      <path d="M56 106 Q48 108 44 112" stroke="#6B4E2E" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".5"/>
      <path d="M64 106 Q72 108 76 112" stroke="#6B4E2E" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".5"/>
      {/* Shadow canopy layers — depth */}
      <ellipse cx="60" cy="62" rx="26" ry="20" fill="rgba(30,100,60,.35)"/>
      <ellipse cx="60" cy="58" rx="22" ry="18" fill="rgba(42,158,110,.55)"/>
      {/* Side leaf clusters */}
      <path d="M38 64 Q30 54 34 44 Q40 56 46 62Z" fill="#2A9E6E" opacity=".80"/>
      <path d="M82 60 Q90 50 86 40 Q80 52 74 58Z" fill="#2A9E6E" opacity=".80"/>
      {/* Main canopy */}
      <ellipse cx="60" cy="52" rx="18" ry="20" fill="#2A9E6E"/>
      <ellipse cx="60" cy="46" rx="14" ry="16" fill="#34C47A"/>
      <ellipse cx="60" cy="40" rx="10" ry="12" fill="#4ADE9F"/>
      {/* Crown highlight */}
      <ellipse cx="56" cy="36" rx="5" ry="4" fill="rgba(94,232,168,.55)"/>
    </svg>
  );

  // Stage 2 — young strong tree, branching out
  if(stage===2) return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="110" rx="28" ry="7" fill="rgba(139,106,69,.20)"/>
      {/* Main trunk */}
      <path d="M54 110 Q52 88 55 72 Q58 62 62 72 Q65 88 66 110Z" fill="#7A5C3A"/>
      {/* Bark texture lines */}
      <path d="M57 100 Q55 88 57 78" stroke="rgba(0,0,0,.15)" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M62 102 Q64 90 62 80" stroke="rgba(0,0,0,.12)" strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Left branch */}
      <path d="M56 82 Q44 76 36 66" stroke="#7A5C3A" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M56 82 Q46 78 40 70" stroke="#8B6A45" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".5"/>
      {/* Right branch */}
      <path d="M64 78 Q76 72 84 62" stroke="#7A5C3A" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M64 78 Q74 74 80 66" stroke="#8B6A45" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".5"/>
      {/* Left canopy */}
      <ellipse cx="34" cy="58" rx="18" ry="14" fill="rgba(30,100,60,.40)"/>
      <ellipse cx="34" cy="55" rx="16" ry="12" fill="#2A9E6E"/>
      <ellipse cx="34" cy="52" rx="12" ry="9" fill="#3ABD7E"/>
      {/* Right canopy */}
      <ellipse cx="86" cy="54" rx="18" ry="14" fill="rgba(30,100,60,.40)"/>
      <ellipse cx="86" cy="51" rx="16" ry="12" fill="#2A9E6E"/>
      <ellipse cx="86" cy="48" rx="12" ry="9" fill="#3ABD7E"/>
      {/* Center main canopy */}
      <ellipse cx="60" cy="50" rx="24" ry="26" fill="rgba(30,100,60,.35)"/>
      <ellipse cx="60" cy="46" rx="21" ry="23" fill="#2A9E6E"/>
      <ellipse cx="60" cy="40" rx="17" ry="19" fill="#34C47A"/>
      <ellipse cx="60" cy="34" rx="13" ry="14" fill="#4ADE9F"/>
      {/* Crown highlights */}
      <ellipse cx="54" cy="30" rx="6" ry="5" fill="rgba(94,232,168,.50)"/>
      <ellipse cx="32" cy="46" rx="5" ry="4" fill="rgba(94,232,168,.40)"/>
      <ellipse cx="88" cy="42" rx="5" ry="4" fill="rgba(94,232,168,.40)"/>
    </svg>
  );

  // Stage 3 — full majestic tree, day 21 complete
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="112" rx="32" ry="7" fill="rgba(139,106,69,.18)"/>
      {/* Roots */}
      <path d="M54 110 Q42 112 36 118" stroke="#6B4E2E" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".55"/>
      <path d="M66 110 Q78 112 84 118" stroke="#6B4E2E" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".55"/>
      <path d="M58 110 Q54 116 52 120" stroke="#6B4E2E" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".40"/>
      {/* Main trunk — thick, strong */}
      <path d="M52 112 Q50 88 53 70 Q56 58 60 58 Q64 58 67 70 Q70 88 68 112Z" fill="#6B4E2E"/>
      <path d="M56 110 Q54 90 56 74 Q57 65 60 65" stroke="rgba(255,255,255,.07)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Lower branches */}
      <path d="M53 88 Q38 82 28 70" stroke="#6B4E2E" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <path d="M67 84 Q82 78 92 66" stroke="#6B4E2E" strokeWidth="8" strokeLinecap="round" fill="none"/>
      {/* Mid branches */}
      <path d="M54 76 Q42 70 36 60" stroke="#7A5C3A" strokeWidth="5" strokeLinecap="round" fill="none"/>
      <path d="M66 72 Q78 66 84 56" stroke="#7A5C3A" strokeWidth="5" strokeLinecap="round" fill="none"/>
      {/* Upper branches */}
      <path d="M56 66 Q48 58 44 48" stroke="#8B6A45" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M64 63 Q72 55 76 45" stroke="#8B6A45" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Far left canopy cluster */}
      <ellipse cx="24" cy="62" rx="16" ry="12" fill="rgba(30,100,60,.45)"/>
      <ellipse cx="24" cy="58" rx="14" ry="11" fill="#1F7A4A"/>
      <ellipse cx="24" cy="54" rx="11" ry="9" fill="#2A9E6E"/>
      {/* Far right canopy cluster */}
      <ellipse cx="96" cy="58" rx="16" ry="12" fill="rgba(30,100,60,.45)"/>
      <ellipse cx="96" cy="54" rx="14" ry="11" fill="#1F7A4A"/>
      <ellipse cx="96" cy="50" rx="11" ry="9" fill="#2A9E6E"/>
      {/* Mid left */}
      <ellipse cx="38" cy="50" rx="18" ry="14" fill="rgba(30,100,60,.40)"/>
      <ellipse cx="38" cy="46" rx="16" ry="12" fill="#2A9E6E"/>
      <ellipse cx="38" cy="42" rx="12" ry="9" fill="#34C47A"/>
      {/* Mid right */}
      <ellipse cx="82" cy="46" rx="18" ry="14" fill="rgba(30,100,60,.40)"/>
      <ellipse cx="82" cy="42" rx="16" ry="12" fill="#2A9E6E"/>
      <ellipse cx="82" cy="38" rx="12" ry="9" fill="#34C47A"/>
      {/* Upper left */}
      <ellipse cx="46" cy="38" rx="15" ry="12" fill="#2A9E6E"/>
      <ellipse cx="46" cy="34" rx="11" ry="9" fill="#4ADE9F"/>
      {/* Upper right */}
      <ellipse cx="74" cy="34" rx="15" ry="12" fill="#2A9E6E"/>
      <ellipse cx="74" cy="30" rx="11" ry="9" fill="#4ADE9F"/>
      {/* Main center crown — deepest layering */}
      <ellipse cx="60" cy="44" rx="28" ry="30" fill="rgba(30,100,60,.30)"/>
      <ellipse cx="60" cy="40" rx="25" ry="27" fill="#1F7A4A"/>
      <ellipse cx="60" cy="35" rx="22" ry="24" fill="#2A9E6E"/>
      <ellipse cx="60" cy="29" rx="18" ry="20" fill="#34C47A"/>
      <ellipse cx="60" cy="23" rx="14" ry="16" fill="#4ADE9F"/>
      <ellipse cx="60" cy="17" rx="10" ry="11" fill="#5EE8A8"/>
      {/* Crown tip glow */}
      <circle cx="60" cy="13" r="6" fill="#7EFFC0"/>
      <circle cx="60" cy="12" r="3" fill="rgba(180,255,220,.90)"/>
      {/* Highlight sparkles across canopy */}
      <ellipse cx="48" cy="24" rx="7" ry="5" fill="rgba(126,255,192,.30)"/>
      <ellipse cx="72" cy="20" rx="7" ry="5" fill="rgba(126,255,192,.30)"/>
      <ellipse cx="30" cy="44" rx="5" ry="4" fill="rgba(94,232,168,.35)"/>
      <ellipse cx="90" cy="40" rx="5" ry="4" fill="rgba(94,232,168,.35)"/>
    </svg>
  );
}

// ── Habits data ───────────────────────────────────────────────────────────
const HABITS = [
  {id:"water",    label:"Drink 8 glasses of water",      tag:"morning", emoji:"💧"},
  {id:"stretch",  label:"5 min morning stretch",          tag:"morning", emoji:"🧘"},
  {id:"journal",  label:"Write in journal",               tag:"morning", emoji:"📝"},
  {id:"read",     label:"Read for 20 minutes",            tag:"evening", emoji:"📖"},
  {id:"grateful", label:"Note 3 things I'm grateful for", tag:"evening", emoji:"🙏"},
];

const SEP = () => <div style={{height:".5px",background:"rgba(238,237,245,.07)",margin:"0 20px"}}/>;

// ── Pill CTA — centered, for intention actions ────────────────────────────
function PillBtn({label,icon,onClick}:{label:string;icon?:React.ReactNode;onClick:()=>void}) {
  return (
    <div style={{display:"flex",justifyContent:"center"}}>
      <button onClick={onClick}
        onMouseDown={e=>{e.currentTarget.style.transform="scale(.97)";e.currentTarget.style.opacity=".82";}}
        onMouseUp={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.opacity="1";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.opacity="1";}}
        style={{
          display:"flex",alignItems:"center",gap:9,padding:"13px 30px",
          borderRadius:99,border:"none",cursor:"pointer",
          background:T.grad,color:"#fff",fontSize:14,fontWeight:700,
          letterSpacing:"-.1px",fontFamily:"'Syne',sans-serif",
          boxShadow:"none",
          transition:"opacity .15s,transform .15s",
        }}>
        {icon}{label}
      </button>
    </div>
  );
}

// ── Full CTA — for task completions ──────────────────────────────────────
function FullBtn({label,onClick,disabled=false}:{label:string;onClick:()=>void;disabled?:boolean}) {
  return (
    <button onClick={onClick}
      onMouseDown={e=>{if(!disabled){e.currentTarget.style.transform="scale(.98)";e.currentTarget.style.opacity=".84";}}}
      onMouseUp={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.opacity="1";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.opacity="1";}}
      style={{
        width:"100%",padding:"15px 0",borderRadius:16,border:"none",cursor:disabled?"default":"pointer",
        background:T.grad,color:"#fff",fontSize:14,fontWeight:700,
        letterSpacing:"-.1px",fontFamily:"'Syne',sans-serif",
        boxShadow:"none",
        opacity:disabled?0.42:1,
        transition:"opacity .15s,transform .15s",
      }}>
      {label}
    </button>
  );
}

// ── STEPS CARD ────────────────────────────────────────────────────────────
function StepsCard({ts,setTs,setShowLog,steps,stepsP,fd}:{
  ts:Tab; setTs:(t:Tab)=>void; setShowLog:(b:boolean)=>void;
  steps:number; stepsP:number;
  fd:(d:number)=>React.CSSProperties;
}) {
  const cardStyle = (tint:string): React.CSSProperties => ({
    ...fd(60),
    margin:"0 16px 12px",
    background:`linear-gradient(180deg,${tint}20 0%,${tint}05 100%)`,
    border:`.5px solid ${tint}20`,
    borderRadius:22, overflow:"hidden",
    boxShadow:"0 4px 28px rgba(0,0,0,.58),0 1px 0 rgba(238,237,245,.04) inset",
  });

  // ── NOT JOINED ───────────────────────────────────────────────────────
  if(ts==="not-joined") return (
    <div style={cardStyle(T.purple)}>
      <div style={{
        background:"linear-gradient(180deg,rgba(167,139,245,.28) 0%,rgba(139,63,212,.10) 60%,rgba(91,45,184,.02) 100%)",
        padding:"24px 20px 20px",position:"relative" as const,overflow:"hidden",
      }}>
        <div style={{position:"absolute",top:-40,right:-40,width:170,height:170,borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,245,0.18) 0%,transparent 70%)",pointerEvents:"none" as const}}/>
        <p style={{fontSize:10,fontWeight:700,color:"rgba(167,139,245,.80)",letterSpacing:".12em",textTransform:"uppercase" as const,marginBottom:10}}>Team Steps Challenge</p>
        <p style={{fontSize:22,fontWeight:800,color:T.t1,letterSpacing:"-.4px",lineHeight:1.25,marginBottom:8}}>
          Walk together.<br/>Rise together.
        </p>
        <p style={{fontSize:13,fontWeight:400,color:T.t3,lineHeight:1.6,marginBottom:20}}>
          Log your daily steps once at end of day and compete with your colleagues over 21 days.
        </p>
        {/* Overlapping avatars */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <div style={{display:"flex"}}>
            {["RK","ME","SJ","KP","AR","NR"].map((av,i)=>(
              <div key={i} style={{
                width:28,height:28,borderRadius:"50%",
                background:`linear-gradient(135deg,rgba(167,139,245,${.38+i*.04}),rgba(139,63,212,${.45+i*.03}))`,
                border:`1.5px solid ${T.bg}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:8,fontWeight:800,color:"rgba(238,237,245,.92)",
                marginLeft:i===0?0:-8, position:"relative" as const, zIndex:6-i,
              }}>{av}</div>
            ))}
            <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(238,237,245,.08)",border:`1.5px solid ${T.bg}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:T.t3,marginLeft:-8,position:"relative" as const,zIndex:0}}>+8</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:T.green}}/>
            <span style={{fontSize:11,fontWeight:600,color:T.green}}>14 colleagues already in</span>
          </div>
        </div>
      </div>
      <div style={{padding:"16px 16px 20px"}}>
        <PillBtn
          label="Join Team Challenge"
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
          onClick={()=>setTs("morning")}
        />
      </div>
    </div>
  );

  // ── MORNING ──────────────────────────────────────────────────────────
  if(ts==="morning") return (
    <div style={cardStyle(T.purple)}>
      <div style={{padding:"16px 18px 14px"}}>
        {/* Step count + rank — compact row */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <p style={{fontSize:9,fontWeight:700,color:T.t4,letterSpacing:".10em",textTransform:"uppercase" as const,marginBottom:4}}>Yesterday</p>
            <div style={{display:"flex",alignItems:"baseline",gap:5,marginBottom:4}}>
              <span style={{fontSize:28,fontWeight:800,color:T.t1,letterSpacing:"-.04em",lineHeight:1}}>{steps.toLocaleString()}</span>
              <span style={{fontSize:11,fontWeight:600,color:T.t3}}>steps</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <Ic.Up c={T.green} s={8}/>
              <span style={{fontSize:10,fontWeight:600,color:T.green}}>Up 12% from yesterday</span>
            </div>
          </div>
          <div style={{width:48,height:48,borderRadius:13,background:"rgba(155,127,232,.14)",border:".5px solid rgba(155,127,232,.24)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:18,fontWeight:900,color:T.t1,lineHeight:1}}>#5</span>
            <span style={{fontSize:7,fontWeight:700,color:T.t4,letterSpacing:".08em",marginTop:2}}>RANK</span>
          </div>
        </div>
      </div>

      <SEP/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 18px 13px"}}>
        <span style={{fontSize:11,fontWeight:400,color:T.t3}}>2,000 steps to pass Rahul for <span style={{color:T.purple,fontWeight:600}}>#4</span></span>
        <button style={{fontSize:11,fontWeight:600,color:T.purple,background:"transparent",border:"none",cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>View →</button>
      </div>
    </div>
  );

  // ── EVENING ──────────────────────────────────────────────────────────
  if(ts==="evening") return (
    <div style={cardStyle(T.purple)}>
      <div style={{padding:"18px 18px 16px",textAlign:"center" as const}}>
        <div style={{width:48,height:48,borderRadius:14,background:"rgba(155,127,232,.12)",border:".5px solid rgba(155,127,232,.18)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
          <Ic.Walk c={T.purple} s={20}/>
        </div>
        <p style={{fontSize:16,fontWeight:700,color:T.t1,letterSpacing:"-.2px",lineHeight:1.35,marginBottom:5}}>How many steps today?</p>
        <p style={{fontSize:11,fontWeight:400,color:T.t3,marginBottom:16,lineHeight:1.5}}>12 teammates logged · Rank #5 holding</p>
        <FullBtn label="Log Today's Steps" onClick={()=>setShowLog(true)}/>
      </div>
    </div>
  );

  // ── LOGGED ───────────────────────────────────────────────────────────
  return (
    <div style={cardStyle(T.green)}>
      <div style={{padding:"16px 18px 14px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
              <div style={{width:16,height:16,borderRadius:"50%",background:T.green,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Ic.Check c="#0A0812" s={8}/>
              </div>
              <span style={{fontSize:9,fontWeight:700,color:T.green,letterSpacing:".08em",textTransform:"uppercase" as const}}>Logged today</span>
            </div>
            <div style={{display:"flex",alignItems:"baseline",gap:5,marginBottom:4}}>
              <span style={{fontSize:28,fontWeight:800,color:T.t1,letterSpacing:"-.04em",lineHeight:1}}>{steps.toLocaleString()}</span>
              <span style={{fontSize:11,fontWeight:600,color:T.t3}}>steps</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <Ic.Up c={T.green} s={8}/>
              <span style={{fontSize:10,fontWeight:600,color:T.green}}>Above daily goal</span>
            </div>
          </div>
          <div style={{position:"relative",width:52,height:52,flexShrink:0}}>
            <Arc pct={stepsP} size={52} sw={4} color={T.green} bg="rgba(45,212,191,.10)"/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:11,fontWeight:700,color:T.green}}>{Math.round(stepsP)}%</span>
            </div>
          </div>
        </div>
      </div>
      <SEP/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 18px 13px"}}>
        <span style={{fontSize:11,fontWeight:600,color:T.green}}>Moved to rank <span style={{fontWeight:800}}>#4</span> today</span>
        <button style={{fontSize:11,fontWeight:600,color:T.purple,background:"transparent",border:"none",cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>Details →</button>
      </div>
    </div>
  );
}

// ── HABITS / TREE CARD ──────────────────────────────────────────────────
function PromisesCard({ts,setTs,fd}:{ts:Tab;setTs:(t:Tab)=>void;fd:(d:number)=>React.CSSProperties}) {
  const DAY=6, TOTAL=21;
  const stage:0|1|2|3 = DAY<7?1:DAY<14?2:DAY<19?3:3;
  const pct = Math.round((DAY/TOTAL)*100);
  const SELECTED = ["water","stretch","journal","read","grateful"];
  const isLogged = ts==="logged";

  const baseStyle: React.CSSProperties = {
    ...fd(180),
    margin:"0 16px 12px",
    borderRadius:22, overflow:"hidden",
    boxShadow:"0 4px 28px rgba(0,0,0,.58),0 1px 0 rgba(238,237,245,.04) inset",
  };

  // ── NOT JOINED ───────────────────────────────────────────────────────
  if(ts==="not-joined") return (
    <div style={{
      ...baseStyle,
      background:"linear-gradient(180deg,rgba(167,139,245,.26) 0%,rgba(139,63,212,.08) 60%,rgba(74,222,159,.02) 100%)",
      border:".5px solid rgba(155,127,232,.22)",
    }}>
      {/* Hero */}
      <div style={{padding:"22px 20px 16px",position:"relative" as const,overflow:"hidden"}}>
        <div style={{position:"absolute",bottom:-30,right:-20,width:150,height:150,borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,245,0.14) 0%,transparent 70%)",pointerEvents:"none" as const}}/>
        <p style={{fontSize:10,fontWeight:700,color:"rgba(74,222,159,.70)",letterSpacing:".12em",textTransform:"uppercase" as const,marginBottom:8}}>21-Day Habit Challenge</p>
        <p style={{fontSize:20,fontWeight:800,color:T.t1,letterSpacing:"-.4px",lineHeight:1.3,marginBottom:6}}>
          Grow your tree.<br/>Grow yourself.
        </p>
        <p style={{fontSize:12,fontWeight:400,color:T.t3,lineHeight:1.6,marginBottom:16}}>
          Pick your daily habits. Every habit you log grows your tree — one branch at a time.
        </p>
        {/* Tree growth progression — the hook */}
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:4,padding:"8px 0 4px",background:"rgba(0,0,0,.12)",borderRadius:16,margin:"0 -4px"}}>
          {([
            {s:0 as const, size:34, label:"Day 1",  bright:true},
            {s:1 as const, size:50, label:"Day 7",  bright:false},
            {s:2 as const, size:64, label:"Day 14", bright:false},
            {s:3 as const, size:80, label:"Day 21", bright:false},
          ]).map(({s,size,label,bright},i)=>(
            <div key={s} style={{display:"flex",flexDirection:"column" as const,alignItems:"center",gap:3,flex:1}}>
              <div style={{opacity:bright?1:0.55+i*0.10,transition:"opacity .2s"}}>
                <TreeSvg stage={s} size={size}/>
              </div>
              <span style={{fontSize:8,fontWeight:700,color:bright?T.green:T.t4,letterSpacing:".04em",paddingBottom:6}}>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"14px 16px 18px"}}>
        <PillBtn
          label="Begin Your Challenge"
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2s-5 4.5-5 9.5a5 5 0 0010 0C17 7.5 14.5 4 12 2z"/></svg>}
          onClick={()=>setTs("morning")}
        />
      </div>
    </div>
  );

  // ── JOINED (morning / evening / logged) ───────────────────────────────
  const heroBg = isLogged
    ? "linear-gradient(145deg,rgba(61,219,168,.16) 0%,rgba(139,63,212,.10) 100%)"
    : "linear-gradient(180deg,rgba(167,139,245,.26) 0%,rgba(139,63,212,.08) 60%,rgba(91,65,200,.02) 100%)";

  return (
    <div style={{
      ...baseStyle,
      background:T.gradSoft,
      border:".5px solid rgba(155,127,232,.20)",
    }}>
      {/* Hero — tree + day */}
      <div style={{background:heroBg,padding:"16px 20px 14px",position:"relative" as const,overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:`radial-gradient(circle,${isLogged?"rgba(74,222,159,.10)":"rgba(155,127,232,.09)"} 0%,transparent 70%)`,pointerEvents:"none" as const}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{flex:1,paddingRight:12}}>
            {/* Status badge */}
            {isLogged ? (
              <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(74,222,159,.12)",border:".5px solid rgba(74,222,159,.22)",borderRadius:99,padding:"3px 10px",marginBottom:10}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:T.green}}/>
                <span style={{fontSize:9,fontWeight:700,color:T.green,letterSpacing:".07em",textTransform:"uppercase" as const}}>Day {DAY} complete</span>
              </div>
            ) : (
              <p style={{fontSize:10,fontWeight:700,color:"rgba(155,127,232,.60)",letterSpacing:".10em",textTransform:"uppercase" as const,marginBottom:8}}>My Habits</p>
            )}
            {/* Day hero */}
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:10}}>
              <span style={{fontSize:28,fontWeight:800,color:T.t1,letterSpacing:"-.04em",lineHeight:1}}>Day {DAY}</span>
              <span style={{fontSize:13,fontWeight:600,color:T.t3}}>of {TOTAL}</span>
            </div>
            {/* Progress */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:96,height:3,background:"rgba(155,127,232,.14)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:T.grad,borderRadius:99}}/>
              </div>
              <span style={{fontSize:11,fontWeight:600,color:T.purple}}>{pct}%</span>
            </div>
            {/* Status line */}
            {ts==="morning" && <p style={{fontSize:12,fontWeight:400,color:T.t3,fontStyle:"italic"}}>Log tonight to grow your tree</p>}
            {ts==="evening" && (
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:T.orange}}/>
                <span style={{fontSize:12,fontWeight:600,color:T.t3}}>
                  <span style={{color:T.t2,fontWeight:600}}>3 of 5</span> logged today
                </span>
              </div>
            )}
            {isLogged && (
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                <span style={{fontSize:12,fontWeight:600,color:T.green}}>All 5 habits kept today</span>
              </div>
            )}
          </div>
          <div style={{flexShrink:0}}>
            <TreeSvg stage={stage} size={72}/>
          </div>
        </div>
      </div>

      {/* Logged — green chips */}
      {isLogged && (<>
        <SEP/>
        <div style={{padding:"11px 20px 13px"}}>
          <div style={{display:"flex",flexWrap:"wrap" as const,gap:5}}>
            {SELECTED.map(id=>{
              const h=HABITS.find(x=>x.id===id)!;
              return (
                <div key={id} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:8,background:"rgba(74,222,159,.10)",border:".5px solid rgba(74,222,159,.20)"}}>
                  <span style={{fontSize:11}}>{h.emoji}</span>
                  <span style={{fontSize:10,fontWeight:600,color:T.green}}>{h.label.split(" ").slice(0,3).join(" ")}</span>
                </div>
              );
            })}
          </div>
        </div>
      </>)}

      {/* Footer — streak */}
      <SEP/>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 20px 14px"}}>
        <Ic.Flame c={T.orange} s={13}/>
        <span style={{fontSize:12,fontWeight:600,color:T.t2}}>
          Showing up for <span style={{color:T.orange,fontWeight:700}}>6 days</span> in a row
        </span>
        <button style={{marginLeft:"auto",fontSize:12,fontWeight:600,color:T.purple,background:"transparent",border:"none",cursor:"pointer",fontFamily:"'Syne',sans-serif",flexShrink:0}}>
          Open →
        </button>
      </div>
    </div>
  );
}

// ── AI INSIGHT CARD ───────────────────────────────────────────────────────
function AiInsightCard() {
  return (
    <div style={{
      margin:"14px 16px 14px",
      background:T.gradSoft,
      border:".5px solid rgba(155,127,232,.18)",
      borderRadius:22,
      boxShadow:"0 4px 28px rgba(0,0,0,.55),0 1px 0 rgba(242,238,255,.04) inset",
      overflow:"hidden",
    }}>
      <div style={{padding:"18px 20px 16px"}}>

        {/* Mood tag — one word personalisation */}
        <div style={{
          display:"inline-flex",alignItems:"center",gap:5,
          background:"rgba(45,212,191,.10)",
          border:".5px solid rgba(45,212,191,.22)",
          borderRadius:99,padding:"3px 10px",marginBottom:12,
        }}>
          <div style={{width:5,height:5,borderRadius:"50%",background:T.green}}/>
          <span style={{fontSize:9,fontWeight:700,color:T.green,letterSpacing:".08em",textTransform:"uppercase",fontFamily:"'Syne',sans-serif"}}>Your best Tuesday this month</span>
        </div>

        {/* Headline */}
        <p style={{
          fontFamily:"'Syne',sans-serif",
          fontSize:18,fontWeight:700,
          lineHeight:1.4,letterSpacing:"-.3px",
          margin:0,
        }}>
          <span style={{color:T.t1}}>Kept </span>
          <span style={{color:T.purple,fontWeight:800}}>4 of 5</span>
          <span style={{color:T.t1}}>{" "}habits & walked{" "}</span>
          <span style={{color:T.green,fontWeight:800}}>8,240 steps</span>
          <span style={{color:T.t1}}>{" "}yesterday.</span>
        </p>

        {/* Personalised insight */}
        <p style={{
          fontFamily:"'Syne',sans-serif",
          fontSize:12,fontWeight:400,
          color:T.t3,lineHeight:1.6,
          marginTop:10,paddingTop:10,
          borderTop:".5px solid rgba(155,127,232,.12)",
        }}>
          That's your{" "}
          <span style={{color:T.t2,fontWeight:600}}>best step count in 5 days.</span>
          {" "}Evening habits are the one gap — you tend to skip them after 9pm.
        </p>

      </div>
    </div>
  );
}

// ── HOME PAGE ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const [vis,     setVis]     = useState(false);
  const [ts,      setTs]      = useState<Tab>("not-joined");
  const [showLog, setShowLog] = useState(false);
  const [logVal,  setLogVal]  = useState("");

  useEffect(()=>{const t=setTimeout(()=>setVis(true),50);return()=>clearTimeout(t);},[]);

  const steps  = useCount(8240,  300, 900);
  const stepsP = usePct(ts==="logged"?82:0, 200, 1000);
  const promP  = usePct(28.6, 400, 1200);

  const tod = ts==="morning"?"Good morning":"Good evening";

  const fd=(d:number):React.CSSProperties=>({
    opacity:vis?1:0, transform:vis?"none":"translateY(10px)",
    transition:`opacity .45s ease ${d}ms,transform .55s cubic-bezier(.22,1,.36,1) ${d}ms`,
  });

  const padPress=(k:string)=>{
    if(k==="⌫") setLogVal(v=>v.slice(0,-1));
    else if(logVal.length<6) setLogVal(v=>v+k);
  };
  const confirmLog=()=>{
    if(!logVal) return;
    setTs("logged");
    setShowLog(false);
    setLogVal("");
  };

  const TABS: {key:Tab;label:string}[] = [
    {key:"not-joined", label:"⊕ New"},
    {key:"morning",    label:"☀ Morning"},
    {key:"evening",    label:"◑ Evening"},
    {key:"logged",     label:"✓ Logged"},
  ];

  return (<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      html,body{background:${T.bg};margin:0;}
      @keyframes notif{0%,100%{opacity:1}50%{opacity:.2}}
      @keyframes shimmer{0%,100%{opacity:.25}50%{opacity:.9}}
      @keyframes pop{0%{transform:scale(.75);opacity:0}70%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
      @keyframes slideUp{from{transform:translateX(-50%) translateY(100%)}to{transform:translateX(-50%) translateY(0)}}
      .page{min-height:100vh;max-width:390px;margin:0 auto;background:${T.bg};font-family:'Syne',-apple-system,sans-serif;color:${T.t1};-webkit-font-smoothing:antialiased;padding-bottom:48px;}
      .hdr{display:flex;align-items:center;justify-content:space-between;padding:22px 20px 16px;background:rgba(8,8,15,.97);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);position:sticky;top:0;z-index:20;border-bottom:.5px solid rgba(238,237,245,.06);}
      .demo{display:flex;gap:6px;padding:12px 16px 0;overflow-x:auto;scrollbar-width:none;}
      .demo::-webkit-scrollbar{display:none;}
      .dtab{flex-shrink:0;padding:5px 14px;border-radius:99px;border:.5px solid rgba(238,237,245,.12);cursor:pointer;font-size:10px;font-weight:700;font-family:'Syne',sans-serif;transition:all .15s;background:transparent;color:${T.t3};}
      .overlay{position:fixed;inset:0;background:rgba(0,0,0,.70);z-index:40;backdrop-filter:blur(8px);}
      .sheet{position:fixed;bottom:0;left:50%;width:100%;max-width:390px;background:#100E1A;border-radius:24px 24px 0 0;border-top:.5px solid rgba(155,127,232,.20);box-shadow:0 -12px 60px rgba(0,0,0,.80);z-index:50;animation:slideUp .3s cubic-bezier(.22,1,.36,1);}
      .kbtn{padding:14px 0;border-radius:13px;border:.5px solid rgba(238,237,245,.07);background:rgba(238,237,245,.05);cursor:pointer;font-size:17px;font-weight:600;color:${T.t1};font-family:'Syne',sans-serif;transition:background .12s;}
      .kbtn:active{background:rgba(138,124,246,.18);}
      .sec{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${T.t4};padding:20px 20px 8px;}
    `}</style>

    {/* Log sheet */}
    {showLog&&(<>
      <div className="overlay" onClick={()=>setShowLog(false)}/>
      <div className="sheet">
        <div style={{width:32,height:4,borderRadius:99,background:"rgba(238,237,245,.20)",margin:"12px auto 0"}}/>
        <div style={{padding:"20px 20px 6px",textAlign:"center" as const}}>
          <p style={{fontSize:10,fontWeight:700,color:T.t4,letterSpacing:".10em",textTransform:"uppercase" as const,marginBottom:12}}>Today's steps</p>
          <p style={{fontSize:44,fontWeight:800,color:logVal?T.t1:"rgba(238,237,245,.18)",letterSpacing:"-.04em",lineHeight:1,minHeight:52}}>
            {logVal?parseInt(logVal).toLocaleString():"—"}
          </p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,padding:"14px 16px 6px"}}>
          {["1","2","3","4","5","6","7","8","9","0","000","⌫"].map(k=>(
            <button key={k} className="kbtn" style={{fontSize:k==="000"?13:17}} onClick={()=>padPress(k)}>{k}</button>
          ))}
        </div>
        <div style={{padding:"10px 16px 28px"}}>
          <FullBtn label={logVal?`Save ${parseInt(logVal).toLocaleString()} steps`:"Enter your steps above"} onClick={confirmLog} disabled={!logVal}/>
        </div>
      </div>
    </>)}

    <div className="page">

      {/* Demo tabs */}
      <div className="demo">
        {TABS.map(({key,label})=>(
          <button key={key} className="dtab"
            onClick={()=>setTs(key)}
            style={{background:ts===key?T.purple:"transparent",color:ts===key?"#0A0812":T.t3}}>
            {label}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="hdr" style={fd(0)}>
        <div>
          <p style={{fontSize:11,fontWeight:600,color:T.t3,marginBottom:4}}>
            {ts==="not-joined"?"Welcome back":tod}
          </p>
          <h1 style={{fontSize:22,fontWeight:700,color:T.t1,letterSpacing:"-.3px",lineHeight:1.1}}>Alex</h1>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button style={{width:36,height:36,borderRadius:11,background:"rgba(238,237,245,.06)",border:".5px solid rgba(238,237,245,.09)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative"}}>
            <Ic.Bell c={T.t3} s={16}/>
            <span style={{position:"absolute",top:8,right:8,width:6,height:6,borderRadius:"50%",background:"#E87A8A",border:`1.5px solid ${T.bg}`,animation:"notif 2.2s ease-in-out infinite"}}/>
          </button>
          <div style={{width:36,height:36,borderRadius:11,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",boxShadow:"0 2px 14px rgba(124,92,232,.35)"}}>AK</div>
        </div>
      </div>

      {/* ── AI WEEKLY INSIGHT ─────────────────────────────────────────────
          One honest observation. No score. Just pattern recognition.
          Uses Claude API to generate a fresh insight each session.
      ──────────────────────────────────────────────────────────────────── */}
      {ts==="morning" && <AiInsightCard/>}

      <PromisesCard ts={ts} setTs={setTs} fd={fd}/>

      <StepsCard ts={ts} setTs={setTs} setShowLog={setShowLog} steps={steps} stepsP={stepsP} fd={fd}/>

      <div style={{display:"flex",flexDirection:"column" as const,gap:8,margin:"0 16px",...fd(330)}}>
        {[
          {color:T.rose, bg:"rgba(232,122,138,.08)", border:"rgba(232,122,138,.18)", Icon:<Ic.Body  c={T.rose}  s={17}/>, label:"Body Metrics", val:"74", unit:"score",  sub:<>Next check-in in <span style={{color:T.rose,fontWeight:600}}>4 days</span></>},
          {color:T.teal, bg:"rgba(56,189,248,.08)",  border:"rgba(56,189,248,.18)",  Icon:<Ic.Breath c={T.teal} s={17}/>, label:"Mindfulness",   val:"4",  unit:"streak", sub:<><span style={{color:T.teal,fontWeight:600}}>2 sessions</span> this week</>},
        ].map(({color,bg,border,Icon,label,val,unit,sub})=>(
          <button key={label} style={{display:"flex",alignItems:"center",gap:14,background:bg,border:`.5px solid ${border}`,borderRadius:16,padding:"14px 16px",cursor:"pointer",textAlign:"left" as const,width:"100%",boxShadow:"0 2px 16px rgba(0,0,0,.45)",fontFamily:"'Syne',sans-serif"}}>
            <div style={{width:38,height:38,borderRadius:11,background:`${color}18`,border:`.5px solid ${color}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{Icon}</div>
            <div style={{flex:1}}>
              <p style={{fontSize:14,fontWeight:600,color:T.t1,marginBottom:3}}>{label}</p>
              <p style={{fontSize:11,fontWeight:400,color:T.t3,lineHeight:1.4}}>{sub}</p>
            </div>
            <div style={{textAlign:"right" as const,flexShrink:0,marginRight:4}}>
              <p style={{fontSize:22,fontWeight:700,color,letterSpacing:"-.03em",lineHeight:1}}>{val}</p>
              <p style={{fontSize:8,fontWeight:600,color:T.t4,letterSpacing:".07em",textTransform:"uppercase" as const,marginTop:2}}>{unit}</p>
            </div>
            <Ic.ChevR c={T.t4} s={12}/>
          </button>
        ))}
      </div>

    </div>
  </>);
}