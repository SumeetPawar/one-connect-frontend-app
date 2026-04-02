// "use client";

// import { useState, useRef, useEffect } from "react";



// const GOAL = 8;
// const DAYS = 21;
// const ML   = 250;

// const STAGES = [
//   { label: "Seed",       emoji: "🌰", minDays: 0  },
//   { label: "Sprout",     emoji: "🌱", minDays: 3  },
//   { label: "Seedling",   emoji: "🌿", minDays: 7  },
//   { label: "Sapling",    emoji: "🌳", minDays: 11 },
//   { label: "Young Tree", emoji: "🌲", minDays: 15 },
//   { label: "Forest",     emoji: "🏕", minDays: 21 },
// ];

// const getStage     = (d) => [...STAGES].reverse().find(s => d >= s.minDays) || STAGES[0];
// const getNextStage = (d) => STAGES.find(s => s.minDays > d);
// const initLogs     = (): DayLog[] => Array.from({length:DAYS},(_,i)=>({day:i+1,glasses:0,completed:false}));



// const MOCK_PARTICIPANTS: Participant[] = [
//   { id:1,  name:"Sarah K.",  avatar:"SK", color:"#0ea5e9", completedDays:18, streak:12 },
//   { id:2,  name:"You",       avatar:"ME", color:"#8b5cf6", completedDays:14, streak:7, isYou:true },
//   { id:3,  name:"James R.",  avatar:"JR", color:"#f97316", completedDays:13, streak:6  },
//   { id:4,  name:"Priya M.",  avatar:"PM", color:"#ec4899", completedDays:12, streak:4  },
//   { id:5,  name:"Alex T.",   avatar:"AT", color:"#10b981", completedDays:11, streak:2  },
//   { id:6,  name:"Chen W.",   avatar:"CW", color:"#f59e0b", completedDays:10, streak:8  },
//   { id:7,  name:"Diana L.",  avatar:"DL", color:"#6366f1", completedDays:9,  streak:3  },
//   { id:8,  name:"Marcus B.", avatar:"MB", color:"#14b8a6", completedDays:8,  streak:1  },
//   { id:9,  name:"Zoe A.",    avatar:"ZA", color:"#f43f5e", completedDays:6,  streak:0  },
//   { id:10, name:"Noah P.",   avatar:"NP", color:"#84cc16", completedDays:4,  streak:0  },
// ];

// const RANK_LABELS = ["🥇","🥈","🥉"];

// function getStreak(logs: DayLog[]) {
//   let s = 0;
//   for (let i = logs.length - 1; i >= 0; i--) {
//     if (logs[i].completed) s++; else break;
//   }
//   return s;
// }


// function getMissedDays(logs: DayLog[]) {
//   let missed = 0;
//   for (let i = logs.length - 2; i >= 0; i--) {
//     if (!logs[i].completed && logs[i].glasses === 0) missed++;
//     else break;
//   }
//   return missed;
// }



// function getBannerType(streak, missed, completedDays, participants) {
//   if (missed >= 2) return "missed-social";
//   if (missed === 1 && streak > 0) return "streak-at-risk";
//   if (missed === 1 && streak === 0) return "comeback";
//   if (streak >= 14) return "streak-legendary";
//   if (streak >= 5) {
//     const sorted = [...participants].sort((a,b)=>b.completedDays-a.completedDays);
//     const youIdx = sorted.findIndex(p=>p.isYou);
//     if (youIdx > 0 && sorted[youIdx-1].completedDays - completedDays <= 1) return "almost-caught";
//     return "streak-fire";
//   }
//   const sorted = [...participants].sort((a,b)=>b.completedDays-a.completedDays);
//   const youIdx = sorted.findIndex(p=>p.isYou);
//   if (youIdx >= 0 && youIdx < sorted.length - 1) {
//     const behind = sorted[youIdx+1];
//     if (completedDays - behind.completedDays <= 1) return "overtake-threat";
//   }
//   return null;
// }

// /* -- CINEMATIC TREE -- */
// function CinematicTree({ done, size=260, animate=false, glowing=false }) {
//   const si  = STAGES.indexOf(getStage(done));
//   const wb  = animate ? "leafWobble 2.4s ease-in-out infinite" : "none";
//   const wbR = animate ? "leafWobbleR 2.6s ease-in-out infinite" : "none";
//   const wbS = animate ? "leafWobble 3.1s .4s ease-in-out infinite" : "none";
//   const G   = glowing;

//   // Leaf colours
//   const lDark  = G ? "#15803d" : "#14532d";
//   const lMid   = G ? "#22c55e" : "#16a34a";
//   const lBright= G ? "#4ade80" : "#22c55e";
//   const lHi    = G ? "#86efac" : "#4ade80";
//   const lTop   = G ? "#d1fae5" : "#86efac";

//   return (
//     <svg viewBox="0 0 260 260" width={size} height={size} style={{overflow:"visible",display:"block",flexShrink:0}}>
//       <defs>
//         {/* Trunk gradients */}
//         <linearGradient id="trkSide" x1="0%" y1="0%" x2="100%" y2="0%">
//           <stop offset="0%"   stopColor="#3b0f06"/>
//           <stop offset="22%"  stopColor="#7c2d12"/>
//           <stop offset="55%"  stopColor="#9a3412"/>
//           <stop offset="80%"  stopColor="#7c2d12"/>
//           <stop offset="100%" stopColor="#3b0f06"/>
//         </linearGradient>
//         <linearGradient id="trkFace" x1="0%" y1="0%" x2="100%" y2="0%">
//           <stop offset="0%"   stopColor="rgba(255,255,255,0)"/>
//           <stop offset="35%"  stopColor="rgba(255,200,150,0.18)"/>
//           <stop offset="60%"  stopColor="rgba(255,200,150,0.08)"/>
//           <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
//         </linearGradient>
//         <linearGradient id="brkL" x1="0%" y1="0%" x2="100%" y2="0%">
//           <stop offset="0%"  stopColor="#3b0f06"/>
//           <stop offset="50%" stopColor="#7c2d12"/>
//           <stop offset="100%" stopColor="#5b1a09"/>
//         </linearGradient>
//         <linearGradient id="brkR" x1="0%" y1="0%" x2="100%" y2="0%">
//           <stop offset="0%"  stopColor="#5b1a09"/>
//           <stop offset="50%" stopColor="#7c2d12"/>
//           <stop offset="100%" stopColor="#3b0f06"/>
//         </linearGradient>
//         {/* Canopy radial gradients - 3 light zones */}
//         <radialGradient id="cnpA" cx="38%" cy="28%" r="65%">
//           <stop offset="0%"   stopColor={lTop}/>
//           <stop offset="40%"  stopColor={lBright}/>
//           <stop offset="75%"  stopColor={lMid}/>
//           <stop offset="100%" stopColor={lDark}/>
//         </radialGradient>
//         <radialGradient id="cnpB" cx="32%" cy="22%" r="65%">
//           <stop offset="0%"   stopColor={lHi}/>
//           <stop offset="45%"  stopColor={lBright}/>
//           <stop offset="100%" stopColor={lDark}/>
//         </radialGradient>
//         <radialGradient id="cnpC" cx="42%" cy="30%" r="60%">
//           <stop offset="0%"   stopColor={lTop}/>
//           <stop offset="35%"  stopColor={lHi}/>
//           <stop offset="70%"  stopColor={lBright}/>
//           <stop offset="100%" stopColor={lMid}/>
//         </radialGradient>
//         <radialGradient id="cnpDark" cx="50%" cy="50%" r="55%">
//           <stop offset="0%"   stopColor={lMid}/>
//           <stop offset="100%" stopColor={lDark}/>
//         </radialGradient>
//         {/* Soil */}
//         <radialGradient id="soil" cx="50%" cy="30%" r="70%">
//           <stop offset="0%"   stopColor="#3d1a0a"/>
//           <stop offset="60%"  stopColor="#2a1106"/>
//           <stop offset="100%" stopColor="#1a0a03"/>
//         </radialGradient>
//         <radialGradient id="gnd" cx="50%" cy="50%" r="50%">
//           <stop offset="0%"   stopColor={G?"rgba(74,222,128,0.32)":"rgba(52,211,153,0.24)"}/>
//           <stop offset="100%" stopColor="rgba(52,211,153,0)"/>
//         </radialGradient>
//         {/* Filters */}
//         <filter id="fShad" x="-25%" y="-25%" width="150%" height="150%">
//           <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#052e16" floodOpacity="0.55"/>
//         </filter>
//         <filter id="fSoft" x="-15%" y="-15%" width="130%" height="130%">
//           <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#052e16" floodOpacity="0.35"/>
//         </filter>
//         <filter id="fGlow" x="-35%" y="-35%" width="170%" height="170%">
//           <feGaussianBlur stdDeviation="6" result="b"/>
//           <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
//         </filter>
//         <filter id="fLeafGlow" x="-30%" y="-30%" width="160%" height="160%">
//           <feGaussianBlur stdDeviation="5" result="b"/>
//           <feFlood floodColor="#4ade80" floodOpacity="0.35" result="c"/>
//           <feComposite in="c" in2="b" operator="in" result="cb"/>
//           <feMerge><feMergeNode in="cb"/><feMergeNode in="SourceGraphic"/></feMerge>
//         </filter>
//         <filter id="fSubtle" x="-10%" y="-10%" width="120%" height="120%">
//           <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#052e16" floodOpacity="0.3"/>
//         </filter>
//         {/* Clip for soil pot */}
//         <clipPath id="potClip">
//           <ellipse cx="130" cy="248" rx="28" ry="10"/>
//         </clipPath>
//       </defs>

//       {/* -- GROUND GLOW -- */}
//       <ellipse cx="130" cy="248" rx={G?96:78} ry={G?20:14} fill="url(#gnd)" style={{transition:"all .8s ease"}}/>
//       <ellipse cx="130" cy="248" rx="42" ry="7" fill="#0a1a0a" opacity="0.5"/>

//       {/* ---- STAGE 0 - SEED ---- */}
//       {si===0 && (
//         <g style={animate?{animation:"budPop .7s cubic-bezier(.34,1.56,.64,1) both"}:{}}>
//           {/* soil mound */}
//           <ellipse cx="130" cy="246" rx="30" ry="10" fill="url(#soil)"/>
//           <ellipse cx="130" cy="244" rx="22" ry="6"  fill="#4a1e08" opacity="0.6"/>
//           {/* soil texture lines */}
//           <path d="M112 246 Q120 243 130 245 Q140 243 148 246" stroke="#5a2a0a" strokeWidth="1" fill="none" opacity="0.5"/>
//           <path d="M116 248 Q125 246 134 248" stroke="#3d1508" strokeWidth="0.8" fill="none" opacity="0.4"/>
//           {/* seed body */}
//           <ellipse cx="130" cy="237" rx="10" ry="7" fill="#78350f"/>
//           <ellipse cx="130" cy="236" rx="7"  ry="5" fill="#92400e"/>
//           <ellipse cx="130" cy="235" rx="4"  ry="3" fill="#a35116"/>
//           {/* seed shine */}
//           <ellipse cx="127" cy="234" rx="2.5" ry="1.5" fill="rgba(255,220,180,0.35)" transform="rotate(-20,127,234)"/>
//           {/* tiny crack line */}
//           <path d="M130 233 L130 237" stroke="#5c1a05" strokeWidth="0.8" opacity="0.6"/>
//           {/* rootlet */}
//           <path d="M128 242 Q126 246 124 248" stroke="#5c2a0a" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7"/>
//           <path d="M132 242 Q134 246 136 249" stroke="#5c2a0a" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7"/>
//         </g>
//       )}

//       {/* ---- STAGE 1 - SPROUT ---- */}
//       {si>=1 && (
//         <g style={animate?{animation:"budPop .7s cubic-bezier(.34,1.56,.64,1) both"}:{}}>
//           {/* soil */}
//           <ellipse cx="130" cy="246" rx="30" ry="10" fill="url(#soil)"/>
//           <ellipse cx="130" cy="244" rx="22" ry="6"  fill="#4a1e08" opacity="0.55"/>
//           <path d="M112 246 Q121 243 130 245 Q139 243 148 246" stroke="#5a2a0a" strokeWidth="1" fill="none" opacity="0.4"/>
//           {/* stem - tapered path not rectangle */}
//           <path d="M127 244 Q126 234 128 222 Q129 212 130 200 Q131 212 132 222 Q134 234 133 244Z"
//             fill="url(#trkSide)" opacity="0.95"/>
//           {/* stem highlight */}
//           <path d="M129 242 Q129 230 130 218 Q130.5 228 131 240"
//             stroke="rgba(255,200,150,0.2)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
//           {/* left cotyledon leaf */}
//           <g style={{animation:wb,transformOrigin:"130px 210px"}}>
//             <path d="M130 210 Q112 200 104 208 Q108 220 124 214 Z"
//               fill={lMid} opacity="0.95"/>
//             <path d="M130 210 Q112 200 104 208" stroke={lDark} strokeWidth="0.8" fill="none" opacity="0.5"/>
//             {/* leaf vein */}
//             <path d="M130 210 Q117 207 106 208" stroke={lHi} strokeWidth="0.7" fill="none" opacity="0.5"/>
//           </g>
//           {/* right cotyledon leaf */}
//           <g style={{animation:wbR,transformOrigin:"130px 206px"}}>
//             <path d="M130 206 Q148 195 157 204 Q152 216 136 210 Z"
//               fill={lBright} opacity="0.95"/>
//             <path d="M130 206 Q148 195 157 204" stroke={lDark} strokeWidth="0.8" fill="none" opacity="0.5"/>
//             <path d="M130 206 Q143 202 155 204" stroke={lHi} strokeWidth="0.7" fill="none" opacity="0.5"/>
//           </g>
//           {/* tiny top bud */}
//           <ellipse cx="130" cy="199" rx="5" ry="4" fill={lBright}/>
//           <ellipse cx="129" cy="198" rx="2" ry="1.5" fill={lTop} opacity="0.7"/>
//         </g>
//       )}

//       {/* ---- STAGE 2 - SEEDLING ---- */}
//       {si>=2 && (
//         <g filter="url(#fSoft)" style={animate?{animation:"budPop .6s .1s cubic-bezier(.34,1.56,.64,1) both"}:{}}>
//           {/* soil */}
//           <ellipse cx="130" cy="247" rx="34" ry="11" fill="url(#soil)"/>
//           <path d="M108 247 Q119 244 130 246 Q141 244 152 247" stroke="#5a2a0a" strokeWidth="1.1" fill="none" opacity="0.4"/>
//           {/* roots peeking */}
//           <path d="M122 247 Q118 250 115 253" stroke="#4a1a06" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
//           <path d="M138 247 Q142 251 145 254" stroke="#4a1a06" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6"/>
//           {/* main trunk - tapered polygon */}
//           <path d="M123 246 Q121 220 124 190 Q127 160 130 130 Q133 160 136 190 Q139 220 137 246Z"
//             fill="url(#trkSide)"/>
//           {/* bark highlight strip */}
//           <path d="M128 244 Q127 215 129 182 Q130 155 130.5 128"
//             stroke="url(#trkFace)" strokeWidth="4" fill="none" strokeLinecap="round"/>
//           {/* bark texture - horizontal fissures */}
//           {[190,205,218,230,240].map((y,i)=>(
//             <path key={i} d={`M${124+i*0.3} ${y} Q130 ${y-2} ${136-i*0.3} ${y}`}
//               stroke="#3b0f06" strokeWidth="0.9" fill="none" opacity="0.4"/>
//           ))}
//           {/* left branch */}
//           <path d="M124 190 Q108 178 98 168 Q104 165 114 172 Q118 180 126 186Z"
//             fill="url(#brkL)" filter="url(#fSubtle)"/>
//           <path d="M124 190 Q112 180 100 168" stroke="#3b0f06" strokeWidth="0.6" fill="none" opacity="0.4"/>
//           {/* right branch */}
//           <path d="M136 185 Q152 174 162 163 Q156 160 146 168 Q142 176 134 182Z"
//             fill="url(#brkR)" filter="url(#fSubtle)"/>
//           {/* leaf cluster left - 3 individual leaves */}
//           <g style={{animation:wb,transformOrigin:"103px 165px"}}>
//             <path d="M103 165 Q90 152 84 158 Q86 170 100 170Z" fill={lMid}/>
//             <path d="M103 165 Q94 148 100 142 Q108 148 106 160Z" fill={lBright}/>
//             <path d="M103 165 Q98 155 92 152" stroke={lHi} strokeWidth="0.8" fill="none" opacity="0.6"/>
//           </g>
//           {/* leaf cluster right */}
//           <g style={{animation:wbR,transformOrigin:"158px 160px"}}>
//             <path d="M158 160 Q172 148 178 154 Q175 166 161 166Z" fill={lMid}/>
//             <path d="M158 160 Q168 144 162 138 Q153 145 156 157Z" fill={lBright}/>
//             <path d="M158 160 Q164 151 170 148" stroke={lHi} strokeWidth="0.8" fill="none" opacity="0.6"/>
//           </g>
//           {/* top leaves */}
//           <g style={{animation:wbS,transformOrigin:"130px 128px"}}>
//             <path d="M130 128 Q116 114 118 106 Q128 108 132 120Z" fill={lBright}/>
//             <path d="M130 128 Q144 113 142 105 Q132 107 128 120Z" fill={lHi}/>
//             <path d="M130 128 Q130 110 130 100" stroke={lTop} strokeWidth="1" fill="none" opacity="0.5"/>
//           </g>
//         </g>
//       )}

//       {/* ---- STAGE 3 - SAPLING ---- */}
//       {si>=3 && (
//         <g filter="url(#fShad)" style={animate?{animation:"budPop .65s .15s cubic-bezier(.34,1.56,.64,1) both"}:{}}>
//           {/* soil */}
//           <ellipse cx="130" cy="248" rx="38" ry="11" fill="url(#soil)"/>
//           <path d="M104 248 Q117 244 130 247 Q143 244 156 248" stroke="#5a2a0a" strokeWidth="1.2" fill="none" opacity="0.4"/>
//           {/* exposed roots */}
//           <path d="M120 247 Q113 251 108 255" stroke="#4a1a06" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.65"/>
//           <path d="M140 247 Q147 252 152 256" stroke="#4a1a06" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.65"/>
//           <path d="M125 248 Q120 253 117 257" stroke="#3d1508" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.45"/>
//           {/* trunk - wider, tapered */}
//           <path d="M120 247 Q118 210 121 170 Q124 135 128 95 Q132 135 139 170 Q142 210 140 247Z"
//             fill="url(#trkSide)"/>
//           <path d="M126 245 Q125 205 127 165 Q128.5 130 130 93"
//             stroke="url(#trkFace)" strokeWidth="5" fill="none" strokeLinecap="round"/>
//           {/* bark fissures */}
//           {[165,182,200,215,228,238].map((y,i)=>(
//             <path key={i} d={`M${121+i*0.2} ${y} Q${125+i*0.5} ${y-3} ${130} ${y-1} Q${135-i*0.5} ${y-3} ${139-i*0.2} ${y}`}
//               stroke="#3b0f06" strokeWidth="1" fill="none" opacity="0.38"/>
//           ))}
//           {/* knot detail */}
//           <ellipse cx="132" cy="200" rx="3.5" ry="2.5" fill="#3b0f06" opacity="0.5"/>
//           {/* main left branch - bezier arm */}
//           <path d="M122 170 Q105 158 90 148 Q96 142 108 152 Q116 162 124 166Z"
//             fill="url(#brkL)"/>
//           <path d="M122 170 Q107 160 92 150" stroke="#3b0f06" strokeWidth="0.7" fill="none" opacity="0.4"/>
//           {/* main right branch */}
//           <path d="M138 162 Q155 150 170 140 Q164 134 152 144 Q144 155 136 158Z"
//             fill="url(#brkR)"/>
//           {/* secondary left branch higher */}
//           <path d="M125 135 Q112 126 102 118 Q107 113 116 120 Q121 128 127 132Z"
//             fill="url(#brkL)" opacity="0.85"/>
//           {/* secondary right */}
//           <path d="M135 128 Q148 119 158 111 Q153 106 143 114 Q138 122 133 125Z"
//             fill="url(#brkR)" opacity="0.85"/>

//           {/* Left canopy cluster - multiple lobes */}
//           <g style={{animation:wb,transformOrigin:"96px 148px"}}>
//             <path d="M96 148 Q74 134 68 142 Q70 158 90 156Z" fill={lDark}/>
//             <path d="M96 148 Q78 128 84 118 Q96 124 96 140Z" fill={lMid}/>
//             <path d="M96 148 Q88 132 80 130" stroke={lHi} strokeWidth="0.9" fill="none" opacity="0.5"/>
//             <path d="M96 148 Q82 138 76 136" stroke={lTop} strokeWidth="0.7" fill="none" opacity="0.4"/>
//             {/* leaf tips */}
//             <path d="M84 118 Q80 111 82 108 Q86 112 86 118Z" fill={lBright}/>
//             <path d="M68 142 Q62 138 61 132 Q67 133 70 140Z" fill={lMid}/>
//           </g>
//           {/* Right canopy cluster */}
//           <g style={{animation:wbR,transformOrigin:"164px 140px"}}>
//             <path d="M164 140 Q186 126 192 134 Q190 150 170 148Z" fill={lDark}/>
//             <path d="M164 140 Q182 120 176 110 Q164 116 164 132Z" fill={lMid}/>
//             <path d="M164 140 Q178 128 184 126" stroke={lHi} strokeWidth="0.9" fill="none" opacity="0.5"/>
//             <path d="M176 110 Q180 103 178 100 Q173 104 174 110Z" fill={lBright}/>
//             <path d="M192 134 Q198 130 199 124 Q193 125 190 132Z" fill={lMid}/>
//           </g>
//           {/* Top canopy */}
//           <g style={{animation:wbS,transformOrigin:"130px 95px"}}>
//             <path d="M130 95 Q108 80 106 68 Q120 66 126 82Z" fill={lMid}/>
//             <path d="M130 95 Q152 80 154 68 Q140 66 134 82Z" fill={lBright}/>
//             <path d="M130 95 Q130 74 130 62" stroke={lTop} strokeWidth="1.2" fill="none" opacity="0.6"/>
//             <path d="M130 62 Q124 52 126 46 Q132 50 130 62Z" fill={lHi}/>
//             <path d="M130 62 Q136 52 134 46 Q128 50 130 62Z" fill={lTop}/>
//           </g>
//           {/* scattered highlight dots */}
//           {[[90,130],[102,115],[162,122],[172,108],[128,72],[116,76],[144,74]].map(([x,y],i)=>(
//             <circle key={i} cx={x} cy={y} r={2.5} fill={lTop} opacity={0.45}/>
//           ))}
//         </g>
//       )}

//       {/* ---- STAGE 4 - YOUNG TREE ---- */}
//       {si>=4 && (
//         <g filter={G?"url(#fLeafGlow)":"url(#fShad)"} style={animate?{animation:"budPop .7s .2s cubic-bezier(.34,1.56,.64,1) both"}:{}}>
//           {/* soil & roots */}
//           <ellipse cx="130" cy="248" rx="44" ry="12" fill="url(#soil)"/>
//           <path d="M102 248 Q116 243 130 247 Q144 243 158 248" stroke="#5a2a0a" strokeWidth="1.3" fill="none" opacity="0.4"/>
//           {[{x:116,dx:-10,dy:8},{x:122,dx:-6,dy:10},{x:138,dx:6,dy:10},{x:144,dx:10,dy:8}].map((r,i)=>(
//             <path key={i} d={`M${r.x} 248 Q${r.x+r.dx*0.5} 252 ${r.x+r.dx} ${248+r.dy}`}
//               stroke="#4a1a06" strokeWidth={i%2===0?2:1.3} fill="none" strokeLinecap="round" opacity="0.6"/>
//           ))}
//           {/* trunk - broad, tapered with flare at base */}
//           <path d="M116 248 Q114 205 117 165 Q120 125 126 85 Q130 60 130 55 Q130 60 134 85 Q140 125 143 165 Q146 205 144 248Z"
//             fill="url(#trkSide)"/>
//           <path d="M123 246 Q121 200 123 160 Q126 120 129 78"
//             stroke="url(#trkFace)" strokeWidth="6" fill="none" strokeLinecap="round"/>
//           {/* bark fissures - more pronounced */}
//           {[165,182,198,212,225,236,244].map((y,i)=>(
//             <path key={i} d={`M${117+i*0.15} ${y} Q${122+i*0.4} ${y-4} 130 ${y-2} Q${138-i*0.4} ${y-4} ${143-i*0.15} ${y}`}
//               stroke="#3b0f06" strokeWidth="1.1" fill="none" opacity="0.4"/>
//           ))}
//           {/* knots */}
//           <ellipse cx="128" cy="210" rx="4" ry="3" fill="#3b0f06" opacity="0.45"/>
//           <ellipse cx="133" cy="178" rx="3" ry="2" fill="#3b0f06" opacity="0.35"/>
//           {/* lower-left branch */}
//           <path d="M118 200 Q98 185 82 172 Q88 164 102 176 Q112 188 120 196Z" fill="url(#brkL)"/>
//           {/* lower-right branch */}
//           <path d="M142 194 Q162 179 178 166 Q172 158 158 170 Q148 182 140 190Z" fill="url(#brkR)"/>
//           {/* mid-left branch */}
//           <path d="M120 158 Q100 143 86 132 Q92 125 104 134 Q114 146 122 154Z" fill="url(#brkL)"/>
//           {/* mid-right branch */}
//           <path d="M140 150 Q160 135 174 124 Q168 117 156 126 Q146 138 138 146Z" fill="url(#brkR)"/>
//           {/* upper-left */}
//           <path d="M123 112 Q108 100 96 90 Q101 84 112 92 Q119 104 125 108Z" fill="url(#brkL)" opacity="0.9"/>
//           {/* upper-right */}
//           <path d="M137 106 Q152 94 164 84 Q159 78 148 86 Q141 98 135 103Z" fill="url(#brkR)" opacity="0.9"/>

//           {/* Lower-left foliage - layered lobes */}
//           <g style={{animation:wb,transformOrigin:"88px 172px"}}>
//             <path d="M88 172 Q64 156 56 166 Q58 182 80 180Z" fill={lDark}/>
//             <path d="M88 172 Q68 150 74 138 Q88 144 90 162Z" fill={lMid}/>
//             <path d="M88 172 Q76 154 66 150" stroke={lHi} strokeWidth="1" fill="none" opacity="0.5"/>
//             <path d="M74 138 Q70 128 72 122 Q78 126 76 136Z" fill={lBright}/>
//             <path d="M56 166 Q48 160 46 152 Q54 154 56 164Z" fill={lMid}/>
//           </g>
//           {/* Lower-right foliage */}
//           <g style={{animation:wbR,transformOrigin:"172px 166px"}}>
//             <path d="M172 166 Q196 150 204 160 Q202 176 180 174Z" fill={lDark}/>
//             <path d="M172 166 Q192 144 186 132 Q172 138 170 158Z" fill={lMid}/>
//             <path d="M172 166 Q186 148 196 144" stroke={lHi} strokeWidth="1" fill="none" opacity="0.5"/>
//             <path d="M186 132 Q190 122 188 116 Q182 120 184 130Z" fill={lBright}/>
//             <path d="M204 160 Q212 154 214 146 Q206 148 204 158Z" fill={lMid}/>
//           </g>
//           {/* Mid canopy - dense blob with individual lobe detail */}
//           <path d="M88 150 Q90 118 110 104 Q130 92 150 104 Q170 118 172 150 Q162 164 130 168 Q98 164 88 150Z"
//             fill={lDark}/>
//           <path d="M92 144 Q96 116 114 104 Q130 96 146 104 Q164 116 168 144 Q158 156 130 160 Q102 156 92 144Z"
//             fill={lMid}/>
//           {/* individual lobes on mid-canopy edge */}
//           {[[96,128],[108,96],[130,88],[152,96],[164,128],[158,148],[102,148]].map(([x,y],i)=>(
//             <path key={i}
//               d={`M130 140 Q${x} ${y} ${x+(x<130?-12:12)} ${y-8} Q${x+(x<130?-8:8)} ${y+8} 130 140`}
//               fill={i%2===0?lBright:lHi} opacity="0.7"/>
//           ))}
//           {/* Upper canopy */}
//           <path d="M104 104 Q106 74 130 60 Q154 74 156 104 Q146 116 130 118 Q114 116 104 104Z"
//             fill={lMid}/>
//           <path d="M108 100 Q112 74 130 64 Q148 74 152 100 Q144 110 130 112 Q116 110 108 100Z"
//             fill={lBright}/>
//           {/* top spire lobes */}
//           <g style={{animation:wbS,transformOrigin:"130px 60px"}}>
//             <path d="M130 60 Q114 44 116 34 Q126 36 128 52Z" fill={lBright}/>
//             <path d="M130 60 Q146 44 144 34 Q134 36 132 52Z" fill={lHi}/>
//             <path d="M130 60 Q130 40 130 30 Q134 38 130 60Z" fill={lTop}/>
//             <path d="M130 30 Q126 20 128 16 Q132 20 130 30Z" fill={lTop}/>
//           </g>
//           {/* highlight sparkles */}
//           {[[94,110],[110,80],[130,52],[150,80],[166,110],[120,90],[140,90]].map(([x,y],i)=>(
//             <circle key={i} cx={x} cy={y} r={G?4:3} fill={lTop}
//               style={{animation:`twinkle ${G?1.6:2.4}s ${i*.22}s ease-in-out infinite`}} opacity="0.75"/>
//           ))}
//           {/* ambient wing leaves */}
//           <path d="M60 158 Q44 148 40 138 Q52 132 62 144 Q64 154 64 160Z"
//             fill={lMid} style={{animation:wb}} opacity="0.85"/>
//           <path d="M200 150 Q216 140 220 130 Q208 124 198 136 Q196 146 196 152Z"
//             fill={lMid} style={{animation:wbR}} opacity="0.85"/>
//         </g>
//       )}

//       {/* ---- STAGE 5 - FOREST ---- */}
//       {si>=5 && (
//         <g filter={G?"url(#fLeafGlow)":"url(#fShad)"} style={animate?{animation:"budPop .8s .25s cubic-bezier(.34,1.56,.64,1) both"}:{}}>
//           {/* rich soil & root system */}
//           <ellipse cx="130" cy="249" rx="50" ry="13" fill="url(#soil)"/>
//           <path d="M96 249 Q113 243 130 247 Q147 243 164 249" stroke="#5a2a0a" strokeWidth="1.4" fill="none" opacity="0.4"/>
//           {[{x:112,dx:-14,dy:10},{x:120,dx:-8,dy:12},{x:128,dx:-3,dy:13},{x:132,dx:3,dy:13},{x:140,dx:8,dy:12},{x:148,dx:14,dy:10}].map((r,i)=>(
//             <path key={i} d={`M${r.x} 249 Q${r.x+r.dx*0.4} 253 ${r.x+r.dx} ${249+r.dy}`}
//               stroke="#4a1a06" strokeWidth={i===0||i===5?2.2:i===1||i===4?1.6:1.2} fill="none" strokeLinecap="round" opacity="0.65"/>
//           ))}
//           {/* trunk - massive, strongly tapered */}
//           <path d="M112 249 Q110 195 114 150 Q118 108 124 72 Q128 48 130 42 Q132 48 136 72 Q142 108 146 150 Q150 195 148 249Z"
//             fill="url(#trkSide)"/>
//           <path d="M120 247 Q118 195 120 150 Q123 108 127 72"
//             stroke="url(#trkFace)" strokeWidth="7" fill="none" strokeLinecap="round"/>
//           {/* bark fissures - deep */}
//           {[155,172,188,204,218,230,240,247].map((y,i)=>(
//             <path key={i} d={`M${113+i*0.1} ${y} Q${119+i*0.3} ${y-5} 130 ${y-3} Q${141-i*0.3} ${y-5} ${147-i*0.1} ${y}`}
//               stroke="#3b0f06" strokeWidth="1.2" fill="none" opacity="0.42"/>
//           ))}
//           {/* knot & scar details */}
//           <ellipse cx="127" cy="225" rx="5" ry="3.5" fill="#3b0f06" opacity="0.5"/>
//           <ellipse cx="134" cy="188" rx="4" ry="2.8" fill="#3b0f06" opacity="0.4"/>
//           <path d="M128 162 Q124 158 126 154 Q132 156 130 162Z" fill="#3b0f06" opacity="0.35"/>

//           {/* -- BRANCH ARCHITECTURE -- */}
//           {/* Lower pair */}
//           <path d="M114 210 Q90 193 72 178 Q78 168 94 182 Q106 196 116 206Z" fill="url(#brkL)"/>
//           <path d="M146 202 Q170 185 188 170 Q182 160 166 174 Q154 188 144 198Z" fill="url(#brkR)"/>
//           {/* Mid pair */}
//           <path d="M116 170 Q92 152 74 138 Q80 128 96 142 Q108 156 118 166Z" fill="url(#brkL)"/>
//           <path d="M144 162 Q168 144 186 130 Q180 120 164 134 Q152 148 142 158Z" fill="url(#brkR)"/>
//           {/* Upper pair */}
//           <path d="M119 128 Q100 114 84 100 Q90 92 104 104 Q114 118 121 124Z" fill="url(#brkL)" opacity="0.9"/>
//           <path d="M141 120 Q160 106 176 92 Q170 84 156 96 Q146 110 139 116Z" fill="url(#brkR)" opacity="0.9"/>
//           {/* Crown pair */}
//           <path d="M123 86 Q108 73 96 62 Q102 56 112 65 Q119 77 125 82Z" fill="url(#brkL)" opacity="0.85"/>
//           <path d="M137 79 Q152 66 164 55 Q158 49 148 58 Q141 70 135 75Z" fill="url(#brkR)" opacity="0.85"/>

//           {/* -- FOLIAGE SYSTEM -- 5 distinct layers */}
//           {/* Layer 1 - base wide spread */}
//           <g style={{animation:wb,transformOrigin:"78px 178px"}}>
//             <path d="M78 178 Q52 160 42 170 Q44 188 68 186Z" fill={lDark}/>
//             <path d="M78 178 Q56 154 62 140 Q78 146 80 166Z" fill={lMid}/>
//             <path d="M62 140 Q58 128 60 120 Q68 124 66 138Z" fill={lBright}/>
//             <path d="M42 170 Q32 162 30 152 Q40 154 42 168Z" fill={lMid}/>
//             <path d="M78 178 Q64 162 52 158" stroke={lHi} strokeWidth="1.1" fill="none" opacity="0.5"/>
//           </g>
//           <g style={{animation:wbR,transformOrigin:"182px 170px"}}>
//             <path d="M182 170 Q208 152 218 162 Q216 180 192 178Z" fill={lDark}/>
//             <path d="M182 170 Q204 146 198 132 Q182 138 180 158Z" fill={lMid}/>
//             <path d="M198 132 Q202 120 200 112 Q192 116 194 130Z" fill={lBright}/>
//             <path d="M218 162 Q228 154 230 144 Q220 146 218 160Z" fill={lMid}/>
//           </g>
//           {/* Layer 2 - mid-low dense canopy */}
//           <path d="M68 162 Q72 128 98 110 Q130 96 162 110 Q188 128 192 162 Q178 178 130 182 Q82 178 68 162Z"
//             fill={lDark}/>
//           <path d="M74 156 Q80 124 104 108 Q130 96 156 108 Q180 124 186 156 Q174 170 130 174 Q86 170 74 156Z"
//             fill={lMid}/>
//           {/* lobe details on layer 2 */}
//           {[[74,138],[88,106],[110,90],[130,84],[150,90],[172,106],[186,138],[178,158],[82,158]].map(([x,y],i)=>(
//             <path key={i}
//               d={`M130 148 Q${x} ${y} ${x+(x<130?-14:14)} ${y-10} Q${x+(x<130?-8:8)} ${y+10} 130 148`}
//               fill={i%3===0?lBright:i%3===1?lHi:lMid} opacity="0.65"/>
//           ))}
//           {/* Layer 3 - mid canopy */}
//           <path d="M88 128 Q92 94 116 78 Q130 70 144 78 Q168 94 172 128 Q160 144 130 148 Q100 144 88 128Z"
//             fill={lMid}/>
//           <path d="M92 122 Q98 90 120 76 Q130 70 140 76 Q162 90 168 122 Q156 136 130 140 Q104 136 92 122Z"
//             fill={lBright}/>
//           {/* Layer 4 - upper canopy */}
//           <path d="M104 96 Q106 62 130 46 Q154 62 156 96 Q146 112 130 116 Q114 112 104 96Z"
//             fill={lBright}/>
//           <path d="M108 90 Q112 60 130 50 Q148 60 152 90 Q142 104 130 108 Q118 104 108 90Z"
//             fill={lHi}/>
//           {/* Layer 5 - crown spire with complex shape */}
//           <g style={{animation:wbS,transformOrigin:"130px 46px"}}>
//             <path d="M130 46 Q112 28 114 16 Q124 18 126 36Z" fill={lBright}/>
//             <path d="M130 46 Q148 28 146 16 Q136 18 134 36Z" fill={lHi}/>
//             <path d="M130 46 Q120 26 122 14 Q130 18 130 40Z" fill={lHi}/>
//             <path d="M130 46 Q140 26 138 14 Q130 18 130 40Z" fill={lTop}/>
//             <path d="M130 14 Q126 4 128 0 Q132 4 130 14Z" fill={lTop}/>
//             {/* crown tip highlight */}
//             <ellipse cx="130" cy="10" rx="3.5" ry="5" fill={G?"#ecfdf5":"#d1fae5"} filter="url(#fGlow)" opacity="0.9"/>
//           </g>
//           {/* Far-extending wing leaves */}
//           <path d="M44 150 Q24 135 18 120 Q34 114 46 130 Q50 144 50 154Z"
//             fill={lMid} style={{animation:wb}} opacity="0.8"/>
//           <path d="M216 142 Q236 127 242 112 Q226 106 214 122 Q210 136 210 146Z"
//             fill={lMid} style={{animation:wbR}} opacity="0.8"/>
//           {/* Floating individual leaf shapes at canopy edge */}
//           {[
//             {x:86,y:108,rot:-35},{x:100,y:78,rot:-20},{x:116,y:55,rot:-10},
//             {x:144,y:55,rot:10},{x:160,y:78,rot:20},{x:174,y:108,rot:35},
//             {x:68,y:138,rot:-50},{x:192,y:130,rot:50},
//           ].map((l,i)=>(
//             <path key={i}
//               d={`M${l.x} ${l.y} Q${l.x-6} ${l.y-10} ${l.x} ${l.y-16} Q${l.x+6} ${l.y-10} ${l.x} ${l.y}`}
//               fill={i%2===0?lHi:lTop} opacity={G?0.8:0.55}
//               transform={`rotate(${l.rot},${l.x},${l.y})`}/>
//           ))}
//           {/* Sparkle dew drops */}
//           {[{x:100,y:80},{x:120,y:54},{x:130,y:28},{x:140,y:54},{x:160,y:80},
//             {x:82,y:112},{x:178,y:104},{x:116,y:68},{x:144,y:68},{x:130,y:116}].map((d,i)=>(
//             <circle key={i} cx={d.x} cy={d.y} r={G?4.5:3.2} fill={G?"#d1fae5":"#bae6fd"}
//               style={{animation:`twinkle ${G?1.3:2.0}s ${i*.18}s ease-in-out infinite`}} opacity={G?0.9:0.7}/>
//           ))}
//           {/* Ambient glow orb at crown when glowing */}
//           {G&&<ellipse cx="130" cy="28" rx="18" ry="14" fill="rgba(187,247,208,0.2)" filter="url(#fGlow)"/>}
//         </g>
//       )}
//     </svg>
//   );
// }

// function TreeSVG({ done, glowing=false }) {
//   return <CinematicTree done={done} size={108} animate={false} glowing={glowing}/>;
// }

// /* -- LEADERBOARD -- */
// function LeaderboardSheet({ onClose, myCompleted }) {
//   const participants = MOCK_PARTICIPANTS.map(p => p.isYou ? {...p,completedDays:myCompleted} : p);
//   const sorted = [...participants].sort((a,b)=>b.completedDays-a.completedDays||b.streak-a.streak);
//   const youRank = sorted.findIndex(p=>p.isYou)+1;

//   return (
//     <>
//       <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:600,background:"rgba(1,5,10,0.75)",backdropFilter:"blur(12px)",animation:"fadeBack .25s ease forwards"}}/>
//       <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:700,maxWidth:430,margin:"0 auto",background:"linear-gradient(170deg,#080f1a,#040b12)",borderRadius:"32px 32px 0 0",border:"1px solid rgba(255,255,255,0.07)",borderBottom:"none",boxShadow:"0 -24px 80px rgba(0,0,0,0.7)",animation:"slideUp .38s cubic-bezier(.34,1.2,.64,1) forwards",maxHeight:"84vh",display:"flex",flexDirection:"column"}}>
//         <div style={{width:36,height:4,borderRadius:100,background:"rgba(255,255,255,0.1)",margin:"14px auto 0",flexShrink:0}}/>

//         <div style={{padding:"16px 22px 0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
//           <div>
//             <div style={{fontSize:20,fontWeight:900,letterSpacing:"-0.04em",color:"#f0f9ff"}}>Leaderboard</div>
//             <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:1}}>{participants.length} challengers</div>
//           </div>
//           <button onClick={onClose} style={{width:36,height:36,borderRadius:12,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.4)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
//             <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
//           </button>
//         </div>

//         {/* Your rank banner */}
//         <div style={{margin:"14px 22px 0",padding:"12px 16px",borderRadius:18,flexShrink:0,background:youRank<=3?"linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.05))":"linear-gradient(135deg,rgba(139,92,246,0.15),rgba(139,92,246,0.05))",border:youRank<=3?"1px solid rgba(245,158,11,0.25)":"1px solid rgba(139,92,246,0.22)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
//           <div style={{display:"flex",alignItems:"center",gap:12}}>
//             <div style={{fontSize:26,lineHeight:1}}>{youRank<=3?RANK_LABELS[youRank-1]:`#${youRank}`}</div>
//             <div>
//               <div style={{fontSize:13,fontWeight:800,color:"#f0f9ff"}}>Your rank</div>
//               <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:1}}>{youRank===1?"You're leading the pack!":youRank<=3?"Top 3 - legendary!":youRank<=5?`${youRank-1} ahead of you`:`Push harder, ${youRank-1} ahead`}</div>
//             </div>
//           </div>
//           <div style={{textAlign:"right"}}>
//             <div style={{fontSize:24,fontWeight:900,color:youRank<=3?"#f59e0b":"#8b5cf6",letterSpacing:"-0.04em"}}>{myCompleted}d</div>
//             <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",textTransform:"uppercase",letterSpacing:"0.08em"}}>completed</div>
//           </div>
//         </div>

//         <div style={{overflowY:"auto",padding:"10px 22px 36px",display:"flex",flexDirection:"column",gap:5,flex:1}}>
//           {sorted.map((p,i)=>{
//             const rank=i+1,isTop3=rank<=3,barPct=p.completedDays/DAYS,st=getStage(p.completedDays);
//             return (
//               <div key={p.id} style={{borderRadius:20,background:p.isYou?"linear-gradient(135deg,rgba(139,92,246,0.12),rgba(139,92,246,0.04))":isTop3?"rgba(255,255,255,0.045)":"rgba(255,255,255,0.02)",border:p.isYou?"1px solid rgba(139,92,246,0.28)":isTop3?"1px solid rgba(255,255,255,0.08)":"1px solid rgba(255,255,255,0.04)",padding:"11px 14px",display:"flex",alignItems:"center",gap:11}}>
//                 <div style={{width:26,textAlign:"center",flexShrink:0,fontSize:isTop3?20:12,fontWeight:900,color:isTop3?undefined:"rgba(255,255,255,0.22)",lineHeight:1}}>{isTop3?RANK_LABELS[rank-1]:rank}</div>
//                 <div style={{width:38,height:38,borderRadius:14,flexShrink:0,background:p.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff",boxShadow:`0 4px 14px ${p.color}55`,border:p.isYou?`2px solid ${p.color}`:"none",letterSpacing:"0.02em"}}>{p.avatar}</div>
//                 <div style={{flex:1,minWidth:0}}>
//                   <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
//                     <div style={{display:"flex",alignItems:"center",gap:5}}>
//                       <span style={{fontSize:13,fontWeight:800,color:p.isYou?"#c4b5fd":"#f0f9ff"}}>{p.name}</span>
//                       <span style={{fontSize:11}}>{st.emoji}</span>
//                       {p.streak>0&&<span style={{fontSize:9,fontWeight:700,color:"#fb923c",background:"rgba(251,146,60,0.1)",borderRadius:100,padding:"1px 6px"}}>🔥{p.streak}</span>}
//                     </div>
//                     <span style={{fontSize:13,fontWeight:900,color:p.completedDays>=DAYS?"#22c55e":p.isYou?"#c4b5fd":"rgba(255,255,255,0.7)",flexShrink:0,marginLeft:6}}>{p.completedDays}<span style={{fontSize:9,fontWeight:600,opacity:0.5}}>d</span></span>
//                   </div>
//                   <div style={{height:3,borderRadius:100,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}>
//                     <div style={{height:"100%",borderRadius:100,width:`${barPct*100}%`,background:p.completedDays>=DAYS?"linear-gradient(90deg,#22c55e,#4ade80)":p.isYou?"linear-gradient(90deg,#8b5cf6,#a78bfa)":"linear-gradient(90deg,#0ea5e9,#38bdf8)",transition:"width .6s cubic-bezier(.34,1.56,.64,1)"}}/>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </>
//   );
// }

// /* -- RING BUTTON -- */
// function RingButton({ glasses, completed, onTap, onUndo }) {
//   const [scale, setScale] = useState(1);
//   const [ripples, setRipples] = useState([]);
//   const [drops, setDrops] = useState([]);
//   const dropId = useRef(0);
//   const R=90, C=2*Math.PI*90, pct=glasses/GOAL;

//   function handleTap() {
//     if (completed) return;
//     setScale(0.93);
//     setTimeout(()=>setScale(1),200);
//     // ripple
//     const rid = dropId.current++;
//     setRipples(p=>[...p,{id:rid}]);
//     setTimeout(()=>setRipples(p=>p.filter(r=>r.id!==rid)),700);
//     // drops
//     const nd=Array.from({length:6},()=>({id:dropId.current++,x:25+Math.random()*50,angle:-70+Math.random()*140,size:6+Math.random()*8}));
//     setDrops(p=>[...p,...nd]);
//     setTimeout(()=>setDrops(p=>p.filter(d=>!nd.find(n=>n.id===d.id))),950);
//     onTap();
//   }

//   return (
//     <div style={{position:"relative",width:228,height:228,flexShrink:0}}>
//       {/* water particles */}
//       {drops.map(d=>(
//         <div key={d.id} style={{position:"absolute",left:`${d.x}%`,top:"50%",width:d.size,height:d.size*1.35,borderRadius:"50% 50% 50% 50% / 60% 60% 40% 40%",background:"linear-gradient(180deg,#7dd3fc,#0ea5e9)",pointerEvents:"none",transform:`rotate(${d.angle}deg)`,animation:"waterDropLaunch .9s cubic-bezier(.2,.8,.4,1) forwards",boxShadow:"0 0 8px rgba(56,189,248,0.55)",zIndex:10}}/>
//       ))}
//       {/* tap ripple */}
//       {ripples.map(r=>(
//         <div key={r.id} style={{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid rgba(56,189,248,0.5)",animation:"tapRipple .65s ease-out forwards",pointerEvents:"none",zIndex:5}}/>
//       ))}

//       {/* ambient glow */}
//       <div style={{position:"absolute",inset:-14,borderRadius:"50%",background:completed?"radial-gradient(circle,rgba(52,211,153,0.18) 0%,transparent 65%)":"radial-gradient(circle,rgba(56,189,248,0.12) 0%,transparent 65%)",transition:"background 0.7s",animation:"ambientPulse 3s ease-in-out infinite"}}/>

//       <svg width="228" height="228" style={{position:"absolute",inset:0}}>
//         {/* track */}
//         <circle cx="114" cy="114" r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="13"/>
//         {/* segmented tick marks */}
//         {Array.from({length:GOAL}).map((_,i)=>{
//           const angle = (i/GOAL)*2*Math.PI - Math.PI/2;
//           const x1 = 114 + (R-8)*Math.cos(angle), y1 = 114 + (R-8)*Math.sin(angle);
//           const x2 = 114 + (R+2)*Math.cos(angle), y2 = 114 + (R+2)*Math.sin(angle);
//           return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,0,0,0.6)" strokeWidth="2.5" strokeLinecap="round"/>;
//         })}
//         {/* progress arc */}
//         <circle cx="114" cy="114" r={R} fill="none" stroke={completed?"url(#doneArc)":"url(#waterArc)"} strokeWidth="13" strokeLinecap="round"
//           strokeDasharray={`${C*Math.min(pct,0.999)} ${C}`} transform="rotate(-90 114 114)"
//           style={{transition:"stroke-dasharray .5s cubic-bezier(.34,1.56,.64,1),stroke .4s",filter:completed?"drop-shadow(0 0 8px rgba(52,211,153,0.6))":"drop-shadow(0 0 8px rgba(14,165,233,0.5))"}}/>
//         {/* moving dot */}
//         {pct>0.01&&pct<0.995&&(
//           <circle cx={114+R*Math.cos(2*Math.PI*pct-Math.PI/2)} cy={114+R*Math.sin(2*Math.PI*pct-Math.PI/2)} r="7" fill="#fff" style={{transition:"all .5s cubic-bezier(.34,1.56,.64,1)",filter:"drop-shadow(0 0 6px rgba(56,189,248,1))"}}/>
//         )}
//         <defs>
//           <linearGradient id="waterArc" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor="#0ea5e9"/><stop offset="100%" stopColor="#7dd3fc"/>
//           </linearGradient>
//           <linearGradient id="doneArc" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#6ee7b7"/>
//           </linearGradient>
//         </defs>
//       </svg>

//       {/* tap button */}
//       <button onClick={handleTap} disabled={completed} style={{position:"absolute",inset:20,borderRadius:"50%",background:completed?"radial-gradient(circle at 35% 30%,#064e3b,#022c22)":"radial-gradient(circle at 35% 30%,#0c2d48,#030d1c)",border:"none",cursor:completed?"default":"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,transform:`scale(${scale})`,transition:"transform .2s cubic-bezier(.34,1.56,.64,1),background .6s",boxShadow:completed?"0 0 50px rgba(16,185,129,.18),inset 0 1px 0 rgba(255,255,255,.06)":"0 0 50px rgba(14,165,233,.14),inset 0 1px 0 rgba(255,255,255,.06)",WebkitTapHighlightColor:"transparent"}}>
//         {completed?(
//           <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
//             <circle cx="12" cy="12" r="11" fill="rgba(52,211,153,0.12)"/>
//             <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
//           </svg>
//         ):(
//           <svg width="30" height="36" viewBox="0 0 24 28" fill="none">
//             <path d="M12 2 C12 2 4 11 4 17 a8 8 0 0 0 16 0 C20 11 12 2 12 2Z" fill="url(#dropFill)" opacity=".92"/>
//             <path d="M9 19 C9 19 8 17 9.5 16" stroke="rgba(255,255,255,.3)" strokeWidth="1.4" strokeLinecap="round"/>
//             <defs>
//               <linearGradient id="dropFill" x1="50%" y1="0%" x2="50%" y2="100%">
//                 <stop offset="0%" stopColor="#7dd3fc"/><stop offset="100%" stopColor="#0284c7"/>
//               </linearGradient>
//             </defs>
//           </svg>
//         )}
//         <div style={{fontSize:44,fontWeight:900,letterSpacing:"-0.07em",lineHeight:1,color:completed?"#34d399":"#f0f9ff",fontFamily:"'SF Pro Display','Outfit',system-ui,sans-serif",marginTop:2}}>
//           {glasses}<span style={{fontSize:16,fontWeight:500,color:completed?"rgba(52,211,153,0.6)":"rgba(255,255,255,0.3)",letterSpacing:"-0.02em"}}>/{GOAL}</span>
//         </div>
//         <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:completed?"rgba(52,211,153,0.7)":"rgba(255,255,255,0.3)",marginTop:1}}>
//           {completed?"complete":glasses===0?"tap to log":"keep going"}
//         </div>
//         {glasses>0&&!completed&&(
//           <button onClick={e=>{e.stopPropagation();onUndo();}} style={{marginTop:6,background:"none",border:"none",cursor:"pointer",fontSize:10,color:"rgba(255,255,255,0.18)",letterSpacing:"0.04em",fontFamily:"'Outfit',sans-serif",padding:"2px 8px",borderRadius:100}}>
//             - undo
//           </button>
//         )}
//       </button>
//     </div>
//   );
// }

// /* -- GLASS BARS -- */
// function GlassBars({ glasses, completed, onSet }) {
//   const [hoveredIdx, setHoveredIdx] = useState(null);

//   return (
//     <div style={{flex:1,display:"flex",gap:4,alignItems:"flex-end",height:170,paddingBottom:2}}>
//       {Array.from({length:GOAL}).map((_,i)=>{
//         const filled = i < glasses;
//         const isHovered = hoveredIdx !== null && i <= hoveredIdx;
//         const heightPct = 28 + (i / (GOAL-1)) * 68;
//         return (
//           <button key={i}
//             onClick={()=>onSet(filled && i===glasses-1 ? i : i+1)}
//             onMouseEnter={()=>setHoveredIdx(i)}
//             onMouseLeave={()=>setHoveredIdx(null)}
//             style={{
//               flex:1,
//               height:`${heightPct}%`,
//               borderRadius:"7px 7px 5px 5px",
//               border:"none",
//               cursor:"pointer",
//               background: filled
//                 ? completed
//                   ? `linear-gradient(180deg,#4ade80,#16a34a,#064e3b)`
//                   : `linear-gradient(180deg,#7dd3fc,#38bdf8,#0369a1)`
//                 : isHovered
//                   ? "rgba(56,189,248,0.12)"
//                   : "rgba(255,255,255,0.04)",
//               boxShadow: filled
//                 ? completed
//                   ? "0 0 12px rgba(74,222,128,0.3),inset 0 1px 0 rgba(255,255,255,0.25)"
//                   : "0 0 12px rgba(56,189,248,0.3),inset 0 1px 0 rgba(255,255,255,0.25)"
//                 : isHovered
//                   ? "inset 0 1px 0 rgba(255,255,255,0.08)"
//                   : "inset 0 1px 0 rgba(255,255,255,0.04)",
//               transition:"all .2s cubic-bezier(.34,1.56,.64,1)",
//               transform: filled ? "scaleY(1.02)" : isHovered ? "scaleY(1.04)" : "scaleY(1)",
//               transformOrigin:"bottom",
//               WebkitTapHighlightColor:"transparent",
//               position:"relative",
//               overflow:"hidden",
//             }}>
//             {filled&&(
//               <div style={{position:"absolute",top:0,left:"18%",width:"22%",height:"32%",background:"rgba(255,255,255,0.22)",borderRadius:"0 0 50% 50%"}}/>
//             )}
//           </button>
//         );
//       })}
//     </div>
//   );
// }

// /* -- CELEBRATION -- */
// function Celebration({ day, completedDays, onDone, userName }) {
//   const [phase, setPhase] = useState("burst");
//   const stage     = getStage(completedDays);
//   const prevStage = getStage(completedDays - 1);
//   const stageUp   = stage.label !== prevStage.label;
//   const nextSt    = getNextStage(completedDays);
//   const totalML   = completedDays * GOAL * ML;
//   const streak    = completedDays; // simplified for popup

//   const [treeRevealed, setTreeRevealed] = useState(false);
//   const [showOldTree, setShowOldTree] = useState(true);
//   const aiMessage = ((): string => {
//     if (completedDays === 1)  return `Day one done, ${userName}. The hardest step is always the first - you just took it.`;
//     if (completedDays === 3)  return `Three days in, ${userName}. You're already building something real.`;
//     if (completedDays === 5)  return `Five days straight, ${userName}. Most people quit before this. You didn't.`;
//     if (completedDays === 7)  return `A full week, ${userName}. Your consistency is quietly becoming a part of who you are.`;
//     if (completedDays === 10) return `Ten days, ${userName}. You're in the top third of everyone who started this challenge.`;
//     if (completedDays === 11) return `${userName}, your tree is growing because you keep showing up. So are you.`;
//     if (completedDays === 14) return `Two weeks of showing up, ${userName}. This is what discipline looks like from the inside.`;
//     if (completedDays === 15) return `${userName}, 15 days. You have more follow-through than most people ever develop.`;
//     if (completedDays === 21) return `You did it, ${userName}. Every single day. That's not luck - that's character.`;
//     if (completedDays <= 6)   return `${userName}, you're in the habit-forming window. Keep going - it gets easier.`;
//     if (completedDays <= 13)  return `Halfway there, ${userName}. Your future self is already grateful.`;
//     if (completedDays <= 20)  return `${userName}, the finish line is close. You've come too far to stop now.`;
//     return `Another day, ${userName}. Another drop in the tree. It's adding up.`;
//   })();

//   // Phase sequencing
//   useEffect(() => {
//     const t1  = setTimeout(() => setPhase(stageUp ? "transform" : "reveal"), stageUp ? 700 : 400);
//     const t1b = stageUp ? setTimeout(() => setShowOldTree(false), 700 + 900)  : undefined; // old fully collapsed
//     const t1c = stageUp ? setTimeout(() => setTreeRevealed(true), 700 + 900 + 1200) : undefined; // sprout done
//     const t2  = setTimeout(() => setPhase("reveal"),  stageUp ? 3200 : 400);
//     const t3  = setTimeout(() => setPhase("details"), stageUp ? 4200 : 1000);
//     const t4  = setTimeout(onDone, stageUp ? 10500 : 7000);
//     return () => { clearTimeout(t1); if(t1b) clearTimeout(t1b); if(t1c) clearTimeout(t1c); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
//   }, [onDone, stageUp]);

//   // Per-day milestone detail
//   const milestone = (d) => {
//     if (d === 1)  return { icon:"💧", title:"First Drop",        sub:"The habit starts today.",                      color:"#38bdf8" };
//     if (d === 3)  return { icon:"🌱", title:"Sprout Unlocked",   sub:"3 days in - your tree is sprouting.",          color:"#4ade80" };
//     if (d === 5)  return { icon:"🔥", title:"5-Day Streak",      sub:"You're 4x more likely to stick with it now.", color:"#fb923c" };
//     if (d === 7)  return { icon:"🌿", title:"One Full Week",      sub:"Seedling stage reached. Keep growing.",        color:"#34d399" };
//     if (d === 10) return { icon:"⚡", title:"10 Days Straight",  sub:"Top 30% of all challengers.",                 color:"#a78bfa" };
//     if (d === 11) return { icon:"🌳", title:"Sapling Unlocked",  sub:"Your tree has real roots now.",                color:"#4ade80" };
//     if (d === 14) return { icon:"👑", title:"Two Weeks",         sub:"Half the challenge - you're consistent.",      color:"#f59e0b" };
//     if (d === 15) return { icon:"🌲", title:"Young Tree Stage",  sub:"5 days from a full Forest.",                   color:"#22c55e" };
//     if (d === 21) return { icon:"🏕", title:"Forest Complete!",  sub:"Perfect challenge. Absolute legend.",          color:"#fbbf24" };
//     if (d % 7 === 0) return { icon:"📅", title:`Week ${d/7} Done`, sub:`${d} days of consistent hydration.`,        color:"#38bdf8" };
//     if (stageUp)  return { icon:"✨", title:`${stage.label} Unlocked`, sub:`${prevStage.label} to ${stage.label}`,   color:"#f59e0b" };
//     return        { icon:"💧", title:`Day ${d} Complete`,        sub:`${(completedDays*GOAL*ML/1000).toFixed(1)}L total hydration logged.`, color:"#38bdf8" };
//   };
//   const m = milestone(day);

//   // Water-intake context detail
//   const waterDetail = () => {
//     const L = (completedDays * GOAL * ML / 1000).toFixed(1);
//     const cups = completedDays * GOAL;
//     if (completedDays <= 3)  return { stat: `${L}L`, label: "total logged", sub: `${cups} glasses so far` };
//     if (completedDays <= 7)  return { stat: `${L}L`, label: "total hydration", sub: `avg 8 glasses/day` };
//     if (completedDays <= 14) return { stat: `${L}L`, label: "water logged", sub: `${cups} glasses / ${completedDays} days` };
//     return                          { stat: `${L}L`, label: "hydration journey", sub: `${cups} glasses consumed` };
//   };
//   const wd = waterDetail();

//   // Next stage progress
//   const toNext = nextSt ? nextSt.minDays - completedDays : 0;
//   const stageSpan = nextSt ? nextSt.minDays - stage.minDays : 1;
//   const stagePct  = nextSt ? Math.min(1, (completedDays - stage.minDays) / stageSpan) : 1;

//   const showDetails = phase === "details";
//   const showReveal  = phase === "reveal" || phase === "details";



//   return (
//     <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(1,5,10,0.97)",backdropFilter:"blur(36px) saturate(1.6)",animation:"celebFadeIn .28s ease forwards",overflow:"hidden",fontFamily:"'Outfit',system-ui,sans-serif"}}>

//       {/* -- AMBIENT BG GLOW -- */}
//       <div style={{position:"absolute",top:"15%",left:"50%",transform:"translateX(-50%)",width:"80%",height:"50%",background:stageUp?"radial-gradient(ellipse,rgba(245,158,11,0.08) 0%,rgba(52,211,153,0.06) 50%,transparent 70%)":"radial-gradient(ellipse,rgba(14,165,233,0.09) 0%,rgba(52,211,153,0.07) 50%,transparent 70%)",pointerEvents:"none",animation:"glowPulse 3s ease-in-out infinite"}}/>

//       {/* -- BURST PARTICLES - always -- */}
//       {Array.from({length: stageUp ? 10 : 22}).map((_,i)=>(
//         <div key={i} style={{position:"absolute",left:`${5+Math.random()*90}%`,top:`${5+Math.random()*90}%`,width:4+Math.random()*9,height:4+Math.random()*9,borderRadius:"50% 50% 50% 50% / 60% 60% 40% 40%",background:`rgba(${Math.random()>.5?"56,189,248":"52,211,153"},${.4+Math.random()*.55})`,animation:`dropFall ${.5+Math.random()*1.0}s ${Math.random()*.3}s ease-out forwards`,pointerEvents:"none"}}/>
//       ))}

//       {/* -- STAGE UPGRADE RADIAL BURST -- */}
//       {stageUp && Array.from({length:24}).map((_,i)=> {
//         const angle = (i / 24) * 360;
//         const dist = 120 + Math.random() * 80;
//         const dx = Math.cos(angle * Math.PI / 180) * dist;
//         const dy = Math.sin(angle * Math.PI / 180) * dist;
//         const size = 3 + Math.random() * 7;
//         const colors = ["245,158,11","251,191,36","74,222,128","167,139,250"];
//         const color = colors[Math.floor(Math.random()*colors.length)];
//         return (
//           <div key={`g${i}`} style={{position:"absolute",left:"50%",top:"42%",width:size,height:size,borderRadius:"50%",marginLeft:-size/2,marginTop:-size/2,background:`rgba(${color},0.9)`,boxShadow:`0 0 ${size*2}px rgba(${color},0.6)`,animation:`radialShot ${0.5+Math.random()*0.4}s ${Math.random()*0.15}s cubic-bezier(.2,.8,.3,1) forwards`,"--dx":`${dx}px`,"--dy":`${dy}px`}} pointerEvents="none"/>
//         );
//       })}
//       {/* shockwave rings */}
//       {stageUp && [0,1,2].map(i=>(
//         <div key={`r${i}`} style={{position:"absolute",left:"50%",top:"42%",width:20,height:20,borderRadius:"50%",marginLeft:-10,marginTop:-10,border:`${2-i*0.5}px solid rgba(245,158,11,${0.7-i*0.2})`,animation:`shockRing ${0.7+i*0.15}s ${i*0.12}s cubic-bezier(.1,.8,.2,1) forwards`,pointerEvents:"none"}}/>
//       ))}

//       {/* -- STAGE UNLOCK TOP INDICATOR -- */}
//       {stageUp && treeRevealed && (
//         <div style={{position:"absolute",top:20,left:0,right:0,display:"flex",justifyContent:"center",zIndex:15,pointerEvents:"none",animation:"fadeUp .5s ease both"}}>
//           <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.22)",borderRadius:100,padding:"7px 18px",backdropFilter:"blur(12px)",position:"relative",overflow:"hidden"}}>
//             <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(245,158,11,0.08),transparent)",animation:"shimmer 2.5s ease-in-out infinite"}}/>
//             <div style={{width:5,height:5,borderRadius:"50%",background:"#f59e0b",boxShadow:"0 0 8px rgba(245,158,11,0.8)",animation:"glowPulse 1.5s ease-in-out infinite",flexShrink:0}}/>
//             <span style={{fontSize:10,fontWeight:700,color:"rgba(245,158,11,0.9)",letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Outfit',sans-serif",whiteSpace:"nowrap"}}>Stage Unlocked</span>
//             <div style={{width:5,height:5,borderRadius:"50%",background:"#f59e0b",boxShadow:"0 0 8px rgba(245,158,11,0.8)",animation:"glowPulse 1.5s .4s ease-in-out infinite",flexShrink:0}}/>
//           </div>
//         </div>
//       )}
//       {stageUp && phase !== "burst" && (<>
//         {/* prevtonext label - sits below tree with clear gap */}
//         <div style={{position:"absolute",top:"calc(6vh + 32px + 260px + 16px)",left:0,right:0,display:"flex",justifyContent:"center",alignItems:"center",gap:10,opacity:treeRevealed?1:0,transition:"opacity .4s ease",fontFamily:"'Outfit',sans-serif",zIndex:5,pointerEvents:"none"}}>
//           <span style={{fontSize:12,color:"rgba(255,255,255,0.25)",fontWeight:600,textDecoration:"line-through",letterSpacing:"-0.01em"}}>{prevStage.emoji} {prevStage.label}</span>
//           <div style={{display:"flex",gap:4,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:3,height:3,borderRadius:"50%",background:"#f59e0b",animation:`arrowDot .45s ${i*.1}s ease-in-out infinite alternate`}}/>)}</div>
//           <span style={{fontSize:15,fontWeight:900,color:"#fef3c7",textShadow:"0 0 16px rgba(245,158,11,0.7)",letterSpacing:"-0.025em"}}>{stage.emoji} {stage.label}</span>
//         </div>
//         {/* tree container - explicit absolute center */}
//         <div style={{position:"absolute",top:"calc(6vh + 32px)",left:"50%",transform:"translateX(-50%)",width:240,height:260,zIndex:phase==="transform"?10:4,pointerEvents:"none"}}>
//           {phase==="transform" && !showOldTree && <div style={{position:"absolute",bottom:"8%",left:"50%",width:"85%",height:28,borderRadius:"50%",background:"radial-gradient(ellipse,rgba(245,158,11,0.45) 0%,rgba(74,222,128,0.25) 50%,transparent 70%)",animation:"morphGroundFlash .6s ease-out forwards",opacity:0,transform:"translateX(-50%)"}}/>}
//           {showOldTree && (
//             <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",transformOrigin:"bottom center",animation:"morphOldOut 0.8s cubic-bezier(.6,0,.8,1) forwards"}}>
//               <CinematicTree done={completedDays-1} size={220} animate={false} glowing={false}/>
//             </div>
//           )}
//           {!showOldTree && (
//             <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
//               <div style={{position:"absolute",inset:"-14%",borderRadius:"50%",background:"radial-gradient(circle,rgba(74,222,128,0.22) 0%,rgba(245,158,11,0.08) 55%,transparent 70%)",animation:"glowPulse 2s ease-in-out infinite"}}/>
//               <div style={{position:"absolute",inset:"-7%",borderRadius:"50%",border:"1.5px solid rgba(245,158,11,0.2)",animation:"ringPulse 2.4s ease-out infinite"}}/>
//               <div style={{position:"absolute",inset:"-16%",borderRadius:"50%",border:"1px solid rgba(74,222,128,0.1)",animation:"ringPulse 2.5s .7s ease-out infinite"}}/>
//               <div style={{display:"flex",alignItems:"center",justifyContent:"center",animation:"morphNewIn 1.1s cubic-bezier(.34,1.56,.64,1) forwards",transformOrigin:"center center",opacity:0,willChange:"transform,opacity"}}>
//                 <CinematicTree done={completedDays} size={220} animate={treeRevealed} glowing={treeRevealed}/>
//               </div>
//             </div>
//           )}
//         </div>
//       </>)}

//       {/* -- CLOSE BUTTON -- */}
//       <button onClick={onDone} style={{position:"absolute",top:16,right:20,width:38,height:38,borderRadius:13,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:20,animation:"fadeUp .4s .15s ease both"}}>
//         <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="rgba(255,255,255,0.45)" strokeWidth="2.2" strokeLinecap="round"/></svg>
//       </button>


//       {/* -- WATER DROPS falling onto tree -- */}
//       {showReveal && Array.from({length:9}).map((_,i) => {
//         const xOffsets  = [-38,-22,-8,6,20,34,-30,12,-4];
//         const delays    = [0,1.1,2.2,0.6,1.8,0.3,2.8,1.5,3.2];
//         const durations = [2.4,2.8,2.2,3.0,2.6,2.3,2.9,2.5,2.7];
//         const sizes     = [7,5,8,6,7,5,6,8,5];
//         const s = sizes[i];
//         return (
//           <div key={`wd${i}`} style={{position:"absolute",top:"11vh",left:`calc(50% + ${xOffsets[i]}px)`,zIndex:6,animation:`waterDropFall ${durations[i]}s ${delays[i]}s ease-in infinite`,opacity:0,pointerEvents:"none"}}>
//             <svg width={s} height={Math.round(s*1.4)} viewBox="0 0 7 10" fill="none">
//               <path d="M3.5 0.5 C3.5 0.5 0.5 4 0.5 6.2 C0.5 8 1.8 9.5 3.5 9.5 C5.2 9.5 6.5 8 6.5 6.2 C6.5 4 3.5 0.5 3.5 0.5Z" fill={`rgba(56,189,248,${0.45+i%3*0.15})`}/>
//             </svg>
//             <div style={{position:"absolute",bottom:-2,left:"50%",width:s+3,height:2,borderRadius:"50%",background:"rgba(56,189,248,0.2)",animation:`waterSplash ${durations[i]}s ${delays[i]}s ease-in infinite`,opacity:0,transform:"translateX(-50%)"}}/>
//           </div>
//         );
//       })}

//       {/* -- MAIN CONTENT -- */}
//       {(stageUp ? showDetails : showReveal) && (
//         <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",paddingTop:stageUp?"calc(6vh + 420px)":"calc(6vh + 295px)",paddingLeft:20,paddingRight:20,zIndex:5,pointerEvents:"none"}}>

//           {/* tree - normal days only, absolutely positioned */}
//           {!stageUp && (
//             <div style={{position:"absolute",top:"6vh",width:250,height:250,display:"flex",alignItems:"center",justifyContent:"center"}}>
//               <div style={{position:"absolute",inset:"-20%",borderRadius:"50%",background:"radial-gradient(circle,rgba(52,211,153,0.2) 0%,transparent 65%)",animation:"glowPulse 2.2s ease-in-out infinite"}}/>
//               <div style={{position:"absolute",inset:"-7%",borderRadius:"50%",border:"1.5px solid rgba(52,211,153,0.18)",animation:"ringPulse 2.4s ease-out infinite"}}/>
//               <CinematicTree done={completedDays} size={250} animate={true} glowing={false}/>
//             </div>
//           )}

//           {/* day complete title */}
//           <div style={{textAlign:"center",animation:"fadeUp .45s .2s ease both",pointerEvents:"auto",width:"100%"}}>
//             <div style={{fontSize:stageUp?19:28,fontWeight:900,letterSpacing:"-0.045em",background:stageUp?"linear-gradient(135deg,#f59e0b 20%,#34d399 80%)":"linear-gradient(135deg,#34d399 25%,#38bdf8 80%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.05}}>
//               Day {day} Complete!
//             </div>
//           </div>

//           {/* detail cards */}
//           {showDetails && (
//             <div style={{width:"100%",marginTop:12,display:"flex",flexDirection:"column",gap:7,pointerEvents:"auto"}}>

//               {/* AI motivational message card */}
//               <div style={{borderRadius:18,background:"linear-gradient(135deg,rgba(56,189,248,0.07),rgba(52,211,153,0.04))",border:"1px solid rgba(255,255,255,0.07)",padding:"16px 18px",animation:"slideDetailIn .45s cubic-bezier(.34,1.56,.64,1) both",position:"relative",overflow:"hidden"}}>
//                 <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(56,189,248,0.04),transparent)",animation:"shimmer 3s ease-in-out infinite"}}/>
//                 <div style={{fontSize:15,fontWeight:500,color:"rgba(255,255,255,0.88)",lineHeight:1.6,letterSpacing:"-0.02em"}}>{aiMessage}</div>
//               </div>

//               {nextSt && (
//                 <div style={{borderRadius:16,background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.055)",padding:"11px 14px",animation:"slideDetailIn .42s .1s cubic-bezier(.34,1.56,.64,1) both"}}>
//                   <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
//                     <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.28)",letterSpacing:"0.06em",textTransform:"uppercase"}}>Next stage</span>
//                     <div style={{display:"flex",alignItems:"center",gap:5}}>
//                       <span style={{fontSize:11,fontWeight:900,color:"#38bdf8"}}>{toNext}d</span>
//                       <span style={{fontSize:12}}>{nextSt.emoji}</span>
//                       <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.4)"}}>{nextSt.label}</span>
//                     </div>
//                   </div>
//                   <div style={{height:4,borderRadius:100,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}>
//                     <div style={{height:"100%",borderRadius:100,width:`${stagePct*100}%`,background:"linear-gradient(90deg,#0ea5e9,#38bdf8,#7dd3fc)",boxShadow:"0 0 7px rgba(56,189,248,0.4)",animation:"progressReveal .8s .2s ease both"}}/>
//                   </div>
//                 </div>
//               )}

//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// /* -- MOTIVATION BANNER -- */
// function MotivationBanner({ type, streak, missed, completedDays, participants }) {
//   if (!type) return null;

//   const sorted = [...participants].sort((a,b)=>b.completedDays-a.completedDays);
//   const youIdx = sorted.findIndex(p=>p.isYou);
//   const ahead  = youIdx > 0 ? sorted[youIdx-1] : null;
//   const behind = youIdx < sorted.length-1 ? sorted[youIdx+1] : null;

//   const configs = {
//     "streak-fire": {
//       bg:"linear-gradient(135deg,rgba(251,146,60,0.12),rgba(249,115,22,0.06))",
//       border:"rgba(251,146,60,0.3)",
//       icon:"🔥", iconColor:"#fb923c",
//       title:`${streak}-day streak - you're on fire`,
//       sub: behind ? `${behind.name} is ${completedDays - behind.completedDays}d behind. Don't let up.` : "Keep the momentum going.",
//       pill:`${streak}d`, pillColor:"#fb923c", pillBg:"rgba(251,146,60,0.15)",
//     },
//     "streak-legendary": {
//       bg:"linear-gradient(135deg,rgba(245,158,11,0.15),rgba(251,191,36,0.06))",
//       border:"rgba(245,158,11,0.4)",
//       icon:"⚡", iconColor:"#fbbf24",
//       title:`${streak} days straight - legendary`,
//       sub:"Less than 5% of challengers ever reach this. You're elite.",
//       pill:"LEGEND", pillColor:"#f59e0b", pillBg:"rgba(245,158,11,0.18)",
//     },
//     "streak-at-risk": {
//       bg:"linear-gradient(135deg,rgba(239,68,68,0.1),rgba(220,38,38,0.05))",
//       border:"rgba(239,68,68,0.3)",
//       icon:"⚠", iconColor:"#f87171",
//       title:"Your streak is at risk",
//       sub:`You had a ${streak}-day streak. Log today's water to protect it.`,
//       pill:"At Risk", pillColor:"#ef4444", pillBg:"rgba(239,68,68,0.15)",
//     },
//     "missed-social": {
//       bg:"linear-gradient(135deg,rgba(99,102,241,0.12),rgba(79,70,229,0.06))",
//       border:"rgba(99,102,241,0.3)",
//       icon:"👀", iconColor:"#818cf8",
//       title: ahead ? `${ahead.name} gained ${missed} days on you` : `${missed} days without logging`,
//       sub:"They're still going. The gap is growing. Today is your restart.",
//       pill:`-${missed}d`, pillColor:"#f87171", pillBg:"rgba(239,68,68,0.15)",
//     },
//     "comeback": {
//       bg:"linear-gradient(135deg,rgba(14,165,233,0.1),rgba(2,132,199,0.05))",
//       border:"rgba(14,165,233,0.28)",
//       icon:"💧", iconColor:"#38bdf8",
//       title:"Every comeback starts with one day",
//       sub:`You've completed ${completedDays} days total. That's real. Start again today.`,
//     },
//     "overtake-threat": {
//       bg:"linear-gradient(135deg,rgba(239,68,68,0.1),rgba(220,38,38,0.05))",
//       border:"rgba(239,68,68,0.28)",
//       icon:"🚨", iconColor:"#f87171",
//       title: behind ? `${behind.name} is ${completedDays - behind.completedDays}d behind you` : "Someone is closing in",
//       sub:"Log today before they catch up. Your lead is not safe.",
//       pill:"Closing in", pillColor:"#f87171", pillBg:"rgba(239,68,68,0.13)",
//     },
//     "almost-caught": {
//       bg:"linear-gradient(135deg,rgba(245,158,11,0.12),rgba(217,119,6,0.06))",
//       border:"rgba(245,158,11,0.32)",
//       icon:"⚡", iconColor:"#fbbf24",
//       title: ahead ? `${ahead.name} is just 1 day ahead of you` : "You're almost in the lead",
//       sub:"One completed day and you climb the leaderboard. Do it now.",
//       pill:"1 day gap", pillColor:"#fbbf24", pillBg:"rgba(245,158,11,0.15)",
//     },
//   };

//   const c = configs[type];
//   const isWarning = type==="streak-at-risk"||type==="missed-social"||type==="overtake-threat";

//   return (
//     <div style={{
//       borderRadius:18,
//       background:c.bg,
//       border:`1px solid ${c.border}`,
//       padding:"12px 14px",
//       marginBottom:10,
//       display:"flex",
//       alignItems:"center",
//       gap:12,
//       flexShrink:0,
//       position:"relative",
//       overflow:"hidden",
//       animation:"fadeUp .4s ease both",
//     }}>
//       {/* shimmer for warnings */}
//       {isWarning&&<div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)",animation:"shimmer 2.5s ease-in-out infinite"}}/>}
//       {/* pulse dot for active warnings */}
//       {isWarning&&<div style={{position:"absolute",top:10,right:12,width:6,height:6,borderRadius:"50%",background:"#f87171",boxShadow:"0 0 8px rgba(248,113,113,0.8)",animation:"warningPulse 1.2s ease-in-out infinite"}}/>}

//       <div style={{fontSize:26,lineHeight:1,flexShrink:0}}>{c.icon}</div>
//       <div style={{flex:1,minWidth:0}}>
//         <div style={{fontSize:13,fontWeight:800,color:"#f0f9ff",letterSpacing:"-0.02em",lineHeight:1.2}}>{c.title}</div>
//         <div style={{fontSize:11,color:"rgba(255,255,255,0.38)",marginTop:3,lineHeight:1.4}}>{c.sub}</div>
//       </div>
//       {c.pill&&(
//         <div style={{flexShrink:0,background:c.pillBg,borderRadius:100,padding:"4px 10px",fontSize:10,fontWeight:800,color:c.pillColor,letterSpacing:"0.06em",whiteSpace:"nowrap"}}>{c.pill}</div>
//       )}
//     </div>
//   );
// }

// /* -- STREAK MILESTONE TOAST -- */
// function StreakMilestone({ streak, onDone }) {
//   useEffect(()=>{ const t=setTimeout(onDone, 3500); return ()=>clearTimeout(t); },[onDone]);
//   if (streak!==5&&streak!==7&&streak!==10&&streak!==14&&streak!==21) return null;

//   const msgs: Record<number,{title:string;sub:string;color:string;glow:string}> = {
//     5:  { title:"5-Day Streak 🔥",       sub:"You're building something real.",         color:"#fb923c", glow:"rgba(251,146,60,0.4)"  },
//     7:  { title:"One Week Streak ⚡",     sub:"One full week. Most people quit by now.",  color:"#fbbf24", glow:"rgba(251,191,36,0.4)"  },
//     10: { title:"10 Days Straight 🏆",    sub:"Top 20% of all challengers.",             color:"#a78bfa", glow:"rgba(167,139,250,0.4)"  },
//     14: { title:"14-Day Legend 👑",       sub:"Two weeks. You are relentless.",          color:"#f59e0b", glow:"rgba(245,158,11,0.5)"  },
//     21: { title:"Perfect Challenge ✨",   sub:"21 of 21. Absolute elite.",               color:"#34d399", glow:"rgba(52,211,153,0.5)"  },
//   };

//   const m = msgs[streak];
//   return (
//     <div style={{position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",zIndex:800,animation:"toastSlide .45s cubic-bezier(.34,1.56,.64,1) both",maxWidth:340,width:"calc(100% - 40px)"}}>
//       <div style={{background:"rgba(8,16,28,0.96)",backdropFilter:"blur(24px)",border:`1px solid ${m.color}40`,borderRadius:22,padding:"14px 18px",boxShadow:`0 8px 40px ${m.glow},0 2px 12px rgba(0,0,0,0.5)`,display:"flex",alignItems:"center",gap:14}}>
//         <div style={{width:42,height:42,borderRadius:14,background:`${m.color}18`,border:`1.5px solid ${m.color}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
//           <div style={{fontSize:20,lineHeight:1}}>{streak===5?"🔥":streak===7?"⚡":streak===10?"🏆":streak===14?"👑":"✨"}</div>
//         </div>
//         <div>
//           <div style={{fontSize:14,fontWeight:900,color:m.color,letterSpacing:"-0.03em",lineHeight:1.1}}>{m.title}</div>
//           <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:3}}>{m.sub}</div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* -- PAGE -- */

// const DAY_HABITS = [
//   { id:"water",    label:"Drink 2L water",    color:"#38bdf8",
//     icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3S5 10.5 5 15a7 7 0 0014 0c0-4.5-7-12-7-12z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg> },
//   { id:"exercise", label:"Exercise 30 min",   color:"#4ade80",
//     icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12h3l2-6 4 12 3-8 2 2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
//   { id:"sleep",    label:"Sleep 7-8 hours",   color:"#a78bfa",
//     icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg> },
//   { id:"meditate", label:"Meditate 10 min",   color:"#f59e0b",
//     icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.8"/><path d="M7 21c0-3 1.5-6 5-6s5 3 5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
//   { id:"nosugar",  label:"No added sugar",    color:"#f87171",
//     icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><line x1="4.5" y1="4.5" x2="19.5" y2="19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
// ];

// function HeroBannerMsg({ type, streak, missed, completedDays, participants }) {
//   const [idx, setIdx] = useState(0);
//   useEffect(() => {
//     const t = setInterval(() => setIdx(i => i + 1), 8000);
//     return () => clearInterval(t);
//   }, [type]);
//   const sorted = [...participants].sort((a,b) => b.completedDays - a.completedDays);
//   const youIdx = sorted.findIndex(p => p.isYou);
//   const ahead  = youIdx > 0 ? sorted[youIdx - 1] : null;
//   const gap    = ahead ? ahead.completedDays - completedDays : 0;
//   const pools = {
//     "streak-fire":      [streak+"d straight.", "Most quit by now.", "Keep the chain.", "Momentum is compounding.", "Identity building."],
//     "streak-legendary": [streak+"d - elite.", "Top 5% of challengers.", "Brain rewired.", "Automaticity achieved.", "Made it permanent."],
//     "streak-at-risk":   ["Log today - protect it.", streak+"d on the line.", "One log. All saved.", "Do not let it slip.", "Protect the chain."],
//     "missed-social":    [ahead ? ahead.name+" is "+gap+"d ahead." : "Gap is growing.", "Comeback starts now.", completedDays+"d logged, not lost.", "Open. Start again.", "Gaps close fast."],
//     "comeback":         ["One day restarts all.", completedDays+"d of proof.", "Muscle memory lives.", "Direction over streaks.", "Come back. It counts."],
//     "overtake-threat":  ["One log saves rank.", "Lead needs defending.", "Stay consistent.", "Do not hand it over.", "Log now."],
//     "almost-caught":    [ahead ? ahead.name+" is 1d ahead." : "So close.", "One log = tied.", "Gap is nothing.", "Strike now.", "Make today count."],
//   };
//   const msgs  = pools[type] || pools["comeback"];
//   const msg   = msgs[idx % msgs.length];
//   const cur   = idx % msgs.length;
//   const colors = {"streak-fire":"#fb923c","streak-legendary":"#fbbf24","streak-at-risk":"#f87171","missed-social":"#818cf8","comeback":"#38bdf8","overtake-threat":"#f87171","almost-caught":"#fbbf24"};
//   const color = colors[type] || "#818cf8";
//   return (
//     <div key={idx} style={{marginTop:2}}>
//       <div style={{fontSize:11,fontWeight:500,color:"rgba(255,255,255,0.5)",lineHeight:1.45,animation:"fadeUp .3s ease both"}}>
//         <span style={{color,fontWeight:700}}>{msg.split(" ")[0]} </span>
//         {msg.split(" ").slice(1).join(" ")}
//       </div>
//       <div style={{display:"flex",gap:3,marginTop:5}}>
//         {msgs.map((_,i) => (
//           <div key={i} style={{height:2,borderRadius:99,width:i===cur?12:4,background:i===cur?color:"rgba(255,255,255,0.12)",transition:"all .3s ease"}}/>
//         ))}
//       </div>
//     </div>
//   );
// }

// function HabitsCard({ habits, checked, onToggle, activeDay, dayComplete, onPrev, onNext }) {
//   const [pressed, setPressed] = useState(null);
//   const [justChecked, setJustChecked] = useState(null);
//   function handleTap(id) {
//     setPressed(id); setTimeout(() => setPressed(null), 120);
//     if (!checked[id]) { setJustChecked(id); setTimeout(() => setJustChecked(null), 600); }
//     onToggle(id);
//   }
//   const doneCount = habits.filter(h => checked[h.id]).length;
//   return (
//     <div style={{borderRadius:24,overflow:"hidden",background:dayComplete?"rgba(74,222,128,0.06)":"rgba(255,255,255,0.04)",border:"1px solid "+(dayComplete?"rgba(74,222,128,0.18)":"rgba(255,255,255,0.07)"),backdropFilter:"blur(20px)",transition:"border-color .4s",boxShadow:"0 8px 32px rgba(0,0,0,0.35)"}}>
//       <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)"}}/>
//       <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px 10px"}}>
//         <button onClick={onPrev} style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,0.06)",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center",WebkitTapHighlightColor:"transparent"}}>
//           <svg width="6" height="11" viewBox="0 0 7 12" fill="none"><path d="M6 1L1 6l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
//         </button>
//         <div style={{textAlign:"center"}}>
//           <div style={{fontSize:18,fontWeight:700,color:"#fff",letterSpacing:"-0.03em",lineHeight:1}}>Day {activeDay}</div>
//           <div style={{fontSize:11,marginTop:3,color:dayComplete?"#4ade80":"rgba(255,255,255,0.3)",transition:"color .3s"}}>
//             {dayComplete ? "All habits complete" : doneCount+" of "+habits.length+" done"}
//           </div>
//         </div>
//         <button onClick={onNext} style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,0.06)",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.5)",display:"flex",alignItems:"center",justifyContent:"center",WebkitTapHighlightColor:"transparent"}}>
//           <svg width="6" height="11" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
//         </button>
//       </div>
//       <div style={{height:2,margin:"0 16px 12px",background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
//         <div style={{height:"100%",borderRadius:99,width:((doneCount/habits.length)*100)+"%",background:dayComplete?"#4ade80":"linear-gradient(90deg,#38bdf8,#818cf8)",transition:"width .4s cubic-bezier(.34,1.56,.64,1)"}}/>
//       </div>
//       <div style={{padding:"0 0 6px"}}>
//         {habits.map((habit, hidx) => {
//           const done=checked[habit.id];
//           const isFirst=hidx===0, isLast=hidx===habits.length-1;
//           const isPressed=pressed===habit.id, isJustChecked=justChecked===habit.id;
//           const rr=isFirst&&isLast?"12px":isFirst?"12px 12px 3px 3px":isLast?"3px 3px 12px 12px":"3px";
//           return (
//             <React.Fragment key={habit.id}>
//               <button
//                 onPointerDown={()=>setPressed(habit.id)}
//                 onPointerUp={()=>handleTap(habit.id)}
//                 onPointerLeave={()=>setPressed(null)}
//                 style={{display:"flex",alignItems:"center",gap:13,width:"100%",padding:"0 16px 0 14px",height:58,borderRadius:rr,border:"none",cursor:"pointer",textAlign:"left",
//                   background:isPressed?"rgba(255,255,255,0.06)":done?(habit.color+"12"):"rgba(255,255,255,0.03)",
//                   transform:isPressed?"scale(0.984)":"scale(1)",
//                   transition:isPressed?"transform .08s ease":"transform .3s cubic-bezier(.34,1.4,.64,1), background .2s ease",
//                   WebkitTapHighlightColor:"transparent",position:"relative",overflow:"hidden"}}>
//                 {isJustChecked&&<div style={{position:"absolute",inset:0,background:habit.color+"20",animation:"habitFlash .5s ease-out forwards",borderRadius:"inherit",pointerEvents:"none"}}/>}
//                 <div style={{position:"absolute",left:0,top:"20%",bottom:"20%",width:3,borderRadius:"0 2px 2px 0",background:habit.color,opacity:done?0.85:0.2,transition:"opacity .25s"}}/>
//                 <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
//                   background:done?"linear-gradient(145deg,"+habit.color+","+habit.color+"cc)":"transparent",
//                   border:done?"none":"2px solid rgba(255,255,255,0.15)",
//                   color:done?"#fff":(habit.color+"99"),
//                   transform:isJustChecked?"scale(1.2)":"scale(1)",
//                   transition:isJustChecked?"transform .25s cubic-bezier(.34,1.9,.64,1)":"transform .3s cubic-bezier(.34,1.4,.64,1), background .2s",
//                   boxShadow:done?"0 2px 12px "+habit.color+"55":"none"}}>
//                   {done
//                     ? <svg width="14" height="11" viewBox="0 0 14 11" fill="none" style={{animation:isJustChecked?"checkDraw .28s cubic-bezier(.4,0,.2,1) both":"none"}}><path d="M1.5 5.5L5 9L12.5 1.5" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
//                     : habit.icon
//                   }
//                 </div>
//                 <div style={{flex:1,minWidth:0}}>
//                   <div style={{fontSize:15,fontWeight:done?400:500,letterSpacing:"-0.02em",color:done?"rgba(255,255,255,0.4)":"#fff",textDecoration:done?"line-through":"none",textDecorationColor:"rgba(255,255,255,0.2)",transition:"color .2s"}}>{habit.label}</div>
//                 </div>
//                 <div style={{width:7,height:7,borderRadius:"50%",flexShrink:0,background:done?habit.color:"rgba(255,255,255,0.1)",boxShadow:done?"0 0 6px "+habit.color:"none",transition:"all .3s"}}/>
//               </button>
//               {!isLast&&<div style={{height:1,margin:"0 0 0 56px",background:"rgba(255,255,255,0.05)"}}/>}
//             </React.Fragment>
//           );
//         })}
//       </div>
//       <div style={{height:4}}/>
//     </div>
//   );
// }
// export default function WaterChallengePage() {
//   const [logs, setLogs]                       = useState(initLogs);
//   const [active, setActive]                   = useState(1);
//   const [celebrate, setCelebrate]             = useState(false);
//   const [showLeaderboard, setShowLeaderboard] = useState(false);
//   const [streakToast, setStreakToast]         = useState(null);
//   const prevStreakRef = useRef(0);

//   const [allDayHabits, setAllDayHabits] = useState(() =>
//     Object.fromEntries(Array.from({length:DAYS}, (_, i) => [
//       i+1,
//       Object.fromEntries(DAY_HABITS.map(h => [h.id, false]))
//     ]))
//   );

//   const habitChecked = allDayHabits[active] || {};

//   function toggleHabit(id) {
//     const wasComplete = logs[active-1] && logs[active-1].completed;
//     setAllDayHabits(prev => {
//       const dayState = { ...prev[active], [id]: !prev[active][id] };
//       const allDone = DAY_HABITS.every(h => dayState[h.id]);
//       if (allDone && !wasComplete) {
//         setLogs(ls => ls.map(l => l.day !== active ? l : { ...l, glasses:GOAL, completed:true }));
//         setCelebrate(true);
//       } else if (!allDone && wasComplete) {
//         setLogs(ls => ls.map(l => l.day !== active ? l : { ...l, completed:false }));
//       }
//       return { ...prev, [active]: dayState };
//     });
//   }

//   const log = logs[active-1];
//   const completedDays = logs.filter(l=>l.completed).length;
//   const totalHabitsChecked = Object.values(allDayHabits).reduce(
//     (sum, day) => sum + Object.values(day).filter(Boolean).length, 0
//   );
//   const treeDone = Math.min(21, Math.floor(totalHabitsChecked / DAY_HABITS.length));
//   const stage         = getStage(treeDone);
//   const nextStage     = getNextStage(treeDone);
//   const streak        = getStreak(logs);
//   const missed        = getMissedDays(logs);
//   const totalML       = logs.reduce((s,l)=>s+l.glasses*ML,0);
//   const todayPct      = log.glasses / GOAL;
//   const bannerType    = getBannerType(streak, missed, completedDays, MOCK_PARTICIPANTS);

//   // Fire streak milestone toast
//   useEffect(()=>{
//     if (streak > prevStreakRef.current && [5,7,10,14,21].includes(streak)) {
//       setStreakToast(streak);
//     }
//     prevStreakRef.current = streak;
//   }, [streak]);

//   function addGlass() {
//     if (log.completed) return;
//     setLogs(prev=>prev.map(l=>{
//       if (l.day!==active) return l;
//       const g=Math.min(l.glasses+1,GOAL), done=g>=GOAL;
//       if (done&&!l.completed) setCelebrate(true);
//       return {...l,glasses:g,completed:done};
//     }));
//   }

//   function removeGlass() {
//     setLogs(prev=>prev.map(l=>l.day!==active?l:{...l,glasses:Math.max(l.glasses-1,0),completed:false}));
//   }

//   function setGlasses(g) {
//     setLogs(prev=>prev.map(l=>{
//       if(l.day!==active) return l;
//       const done=g>=GOAL;
//       if(done&&!l.completed) setCelebrate(true);
//       return {...l,glasses:Math.min(g,GOAL),completed:done};
//     }));
//   }

//   return (
//     <div style={{minHeight:"100svh",background:"#01050a",color:"#f0f9ff",fontFamily:"'Outfit','SF Pro Display',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
//       {celebrate&&<Celebration day={active} completedDays={completedDays} onDone={()=>setCelebrate(false)} userName="Alex"/>}
//       {showLeaderboard&&<LeaderboardSheet onClose={()=>setShowLeaderboard(false)} myCompleted={completedDays}/>}
//       {streakToast&&<StreakMilestone streak={streakToast} onDone={()=>setStreakToast(null)}/>}

//       {/* ambient bg */}
//       <div style={{position:"fixed",top:0,left:0,right:0,height:420,pointerEvents:"none",zIndex:0,background:"radial-gradient(ellipse 90% 55% at 50% -5%,rgba(14,165,233,0.09) 0%,transparent 70%)"}}/>
//       <div style={{position:"fixed",top:"30%",left:"-20%",width:"60%",height:"40%",pointerEvents:"none",zIndex:0,background:"radial-gradient(circle,rgba(52,211,153,0.04) 0%,transparent 70%)",borderRadius:"50%"}}/>

//       <div style={{flex:1,display:"flex",flexDirection:"column",maxWidth:390,margin:"0 auto",width:"100%",padding:"0 18px 110px",position:"relative",zIndex:1}}>

//         {/* -- HEADER -- */}
//         <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:54,paddingBottom:16,flexShrink:0}}>
//           <div>
//             <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:"rgba(56,189,248,0.55)",marginBottom:4}}>21-Day Challenge</div>
//             <div style={{fontSize:24,fontWeight:900,letterSpacing:"-0.05em",lineHeight:1,color:"#f0f9ff"}}>Habit Tree</div>
//           </div>
//           <div style={{display:"flex",alignItems:"center",gap:8}}>
//             {/* streak */}
//             {streak>0&&(
//               <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(251,146,60,0.08)",border:"1px solid rgba(251,146,60,0.18)",borderRadius:16,padding:"8px 12px"}}>
//                 <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
//                   <path d="M8 1C8 1 12 5.5 12 9.5C12 11.7 10.6 13.6 8.6 14.4C9.1 13.2 8.9 11.6 8 10.8C7.5 11.7 6.8 12.2 6 12.1C6 12.1 7 9.5 5 8C5 8 5 11 3 12C3 12 2 8.5 4 6.5C4 6.5 3 9.5 5 10C5 7 8 1 8 1Z" fill="url(#flame2)"/>
//                   <defs><linearGradient id="flame2" x1="8" y1="1" x2="8" y2="14" gradientUnits="userSpaceOnUse"><stop stopColor="#fde68a"/><stop offset="1" stopColor="#f97316"/></linearGradient></defs>
//                 </svg>
//                 <div style={{fontSize:18,fontWeight:900,color:"#fb923c",lineHeight:1,letterSpacing:"-0.04em"}}>{streak}</div>
//               </div>
//             )}
//             {/* leaderboard */}
//             <button onClick={()=>setShowLeaderboard(true)} style={{width:44,height:44,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,background:"rgba(99,102,241,0.09)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:16,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
//               <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
//                 <path d="M6 3h12v8a6 6 0 01-12 0V3z" stroke="url(#trophyG)" strokeWidth="1.8" strokeLinejoin="round"/>
//                 <path d="M6 6H3a3 3 0 003 3M18 6h3a3 3 0 01-3 3M12 17v3M8 20h8" stroke="url(#trophyG)" strokeWidth="1.8" strokeLinecap="round"/>
//                 <defs><linearGradient id="trophyG" x1="12" y1="3" x2="12" y2="20" gradientUnits="userSpaceOnUse"><stop stopColor="#818cf8"/><stop offset="1" stopColor="#6366f1"/></linearGradient></defs>
//               </svg>
//               <span style={{fontSize:7,color:"rgba(129,140,248,0.7)",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase"}}>Rank</span>
//             </button>
//           </div>
//         </div>

//         {/* -- HERO CARD - Tree + Stage -- */}
//         <div style={{borderRadius:28,background:"linear-gradient(160deg,rgba(255,255,255,0.045) 0%,rgba(255,255,255,0.01) 100%)",border:"1px solid rgba(255,255,255,0.07)",padding:"20px 18px 18px",marginBottom:10,flexShrink:0,position:"relative",overflow:"hidden"}}>
//           {/* subtle inner glow bottom */}
//           <div style={{position:"absolute",bottom:-20,left:"50%",transform:"translateX(-50%)",width:"75%",height:60,background:"radial-gradient(ellipse,rgba(52,211,153,0.07),transparent 70%)",pointerEvents:"none"}}/>

//           <div style={{display:"flex",alignItems:"center",gap:14}}>
//             {/* tree + watch grow button */}
//             <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,flexShrink:0}}>
//               <div style={{animation:log.completed?"treeSway 4s ease-in-out infinite, leafGlowPulse 2.2s ease-in-out infinite":"treeSway 4s ease-in-out infinite",transformOrigin:"bottom center"}}>
//                 <TreeSVG done={treeDone} glowing={log.completed}/>
//               </div>
//             </div>

//             {/* right panel */}
//             <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:10}}>
//               {/* progress to next */}
//               {nextStage&&(()=>{
//                 const prev=stage.minDays,next=nextStage.minDays,span=next-prev;
//                 const done2=completedDays-prev,pct2=Math.max(0,Math.min(1,done2/span)),left=next-completedDays;
//                 return (
//                   <div>
//                     <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
//                       <span style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.28)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Next: {nextStage.emoji} {nextStage.label}</span>
//                       <span style={{fontSize:12,fontWeight:900,color:left===1?"#4ade80":"#38bdf8",letterSpacing:"-0.02em"}}>{left}d</span>
//                     </div>
//                     <div style={{height:5,borderRadius:100,background:"rgba(255,255,255,0.05)",overflow:"hidden",position:"relative"}}>
//                       <div style={{height:"100%",borderRadius:100,width:`${pct2*100}%`,background:"linear-gradient(90deg,#0ea5e9,#38bdf8,#7dd3fc)",transition:"width .6s cubic-bezier(.34,1.56,.64,1)",boxShadow:"0 0 8px rgba(56,189,248,0.45)",position:"relative"}}>
//                         {pct2>0&&pct2<0.97&&<div style={{position:"absolute",right:-4,top:"50%",transform:"translateY(-50%)",width:11,height:11,borderRadius:"50%",background:"#7dd3fc",boxShadow:"0 0 8px rgba(125,211,252,1)"}}/>}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })()}

//               {!nextStage&&(
//                 <div style={{fontSize:11,fontWeight:700,color:"#4ade80",display:"flex",alignItems:"center",gap:5}}>
//                   <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
//                   Challenge Complete!
//                 </div>
//               )}

//               {/* stats row */}
//               <div style={{display:"flex",gap:5}}>
//                 {[{label:"Done",value:`${completedDays}/${DAYS}`},{label:"Total",value:`${(totalML/1000).toFixed(1)}L`},{label:"Left",value:`${DAYS-completedDays}d`}].map(s=>(
//                   <div key={s.label} style={{flex:1,background:"rgba(255,255,255,0.035)",borderRadius:10,padding:"6px 4px",textAlign:"center"}}>
//                     <div style={{fontSize:13,fontWeight:900,color:"#f0f9ff",lineHeight:1,letterSpacing:"-0.02em"}}>{s.value}</div>
//                     <div style={{fontSize:8,color:"rgba(255,255,255,0.22)",marginTop:2,letterSpacing:"0.06em",textTransform:"uppercase"}}>{s.label}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* -- ROADMAP -- */}
//           <div style={{marginTop:16,borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:14}}>
//             <div style={{fontSize:8,fontWeight:700,color:"rgba(255,255,255,0.18)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>Growth Roadmap</div>
//             <div style={{display:"flex",alignItems:"center",gap:0}}>
//               {STAGES.map((s,i)=>{
//                 const isReached=completedDays>=s.minDays,isCurrent=stage.label===s.label;
//                 const isNext=(nextStage && nextStage.label===s.label,isLast=i===STAGES.length-1;
//                 return (
//                   <div key={s.label} style={{display:"flex",alignItems:"center",flex:isLast?"0 0 auto":1,minWidth:0}}>
//                     <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,flexShrink:0}}>
//                       <div style={{
//                         width:isCurrent?36:28,height:isCurrent?36:28,borderRadius:"50%",
//                         background:isReached?isCurrent?"linear-gradient(145deg,#22c55e,#15803d)":"rgba(34,197,94,0.18)":isNext?"rgba(56,189,248,0.07)":"rgba(255,255,255,0.035)",
//                         border:isCurrent?"2.5px solid #4ade80":isNext?"1.5px dashed rgba(56,189,248,0.35)":isReached?"2px solid rgba(34,197,94,0.3)":"1px solid rgba(255,255,255,0.07)",
//                         display:"flex",alignItems:"center",justifyContent:"center",
//                         boxShadow:isCurrent?"0 0 16px rgba(34,197,94,0.45)":"none",
//                         transition:"all .35s cubic-bezier(.34,1.56,.64,1)",
//                         fontSize:isCurrent?17:13,
//                       }}>
//                         {isReached&&!isCurrent?(
//                           <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
//                         ):(<span>{s.emoji}</span>)}
//                       </div>
//                       <div style={{fontSize:8,fontWeight:isCurrent?800:600,color:isCurrent?"#4ade80":isNext?"rgba(56,189,248,0.7)":isReached?"rgba(34,197,94,0.5)":"rgba(255,255,255,0.16)",textAlign:"center",lineHeight:1.2,maxWidth:38,letterSpacing:"0.01em"}}>{s.label}</div>
//                     </div>
//                     {!isLast&&(
//                       <div style={{flex:1,height:2,margin:"0 2px",marginBottom:18,background:completedDays>=STAGES[i+1].minDays?"rgba(34,197,94,0.45)":"rgba(255,255,255,0.05)",borderRadius:100,position:"relative",overflow:"hidden"}}>
//                         {isNext&&i===STAGES.indexOf(stage)&&<div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(56,189,248,0.5),transparent)",animation:"shimmer 1.8s ease-in-out infinite"}}/>}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>

//         {/* -- MOTIVATION BANNER -- */}
//         <MotivationBanner type={bannerType} streak={streak} missed={missed} completedDays={completedDays} participants={MOCK_PARTICIPANTS}/>

//         {/* -- DAY STRIP -- */}
//         <div style={{borderRadius:22,background:"rgba(255,255,255,0.022)",border:"1px solid rgba(255,255,255,0.055)",padding:"12px 12px 10px",marginBottom:10,flexShrink:0}}>
//           <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
//             <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(255,255,255,0.2)"}}>21 Days</span>
//             <span style={{fontSize:10,color:"rgba(56,189,248,0.55)",fontWeight:600,letterSpacing:"-0.01em"}}>Day {active}</span>
//           </div>
//           <div style={{display:"flex",alignItems:"center",gap:3}}>
//             {logs.map(l=>{
//               const isAct=l.day===active;
//               const ds=allDayHabits[l.day]||{};
//               const chk=Object.values(ds).filter(Boolean).length;
//               const hasProg=chk>0&&!l.completed;
//               const pct=chk/DAY_HABITS.length;
//               return (
//                 <button key={l.day} onClick={()=>setActive(l.day)} title={`Day ${l.day}`} style={{flex:"1 1 0",height:isAct?30:22,minWidth:0,borderRadius:7,border:"none",cursor:"pointer",padding:0,position:"relative",overflow:"hidden",
//                   background:l.completed?"linear-gradient(180deg,#22c55e,#15803d)":isAct?"rgba(56,189,248,0.25)":hasProg?"rgba(56,189,248,0.12)":"rgba(255,255,255,0.055)",
//                   outline:isAct?"2px solid rgba(56,189,248,0.75)":"none",outlineOffset:2,
//                   boxShadow:l.completed?"0 0 7px rgba(34,197,94,0.4)":isAct?"0 0 10px rgba(14,165,233,0.5)":"none",
//                   transition:"all 0.22s cubic-bezier(.34,1.56,.64,1)",WebkitTapHighlightColor:"transparent"}}>
//                   {hasProg&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:(pct*100)+"%",background:"linear-gradient(180deg,rgba(56,189,248,0.55),rgba(56,189,248,0.3))",transition:"height .3s ease"}}/>}
//                   {l.completed&&(
//                     <svg width="8" height="8" viewBox="0 0 24 24" fill="none" style={{position:"absolute",inset:0,margin:"auto",display:"block",zIndex:1}}>
//                       <path d="M5 12l5 5L20 7" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
//                     </svg>
//                   )}
//                   {isAct&&!l.completed&&(
//                     <span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:900,color:"#fff",zIndex:1}}>{l.day}</span>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         <HabitsCard
//           habits={DAY_HABITS}
//           checked={habitChecked}
//           onToggle={toggleHabit}
//           activeDay={active}
//           dayComplete={log.completed}
//           onPrev={() => setActive(a => Math.max(1, a-1))}
//           onNext={() => setActive(a => Math.min(DAYS, a+1))}
//         />
//       </div>

//       {/* -- FOOTER -- */}
//       <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,display:"flex",justifyContent:"center",pointerEvents:"none"}}>
//         <div style={{width:"100%",maxWidth:390,padding:"0 18px",paddingBottom:"max(16px, env(safe-area-inset-bottom))",background:"linear-gradient(to top,#01050a 60%,transparent)",pointerEvents:"auto"}}>
//           <div style={{display:"flex",alignItems:"center",justifyContent:"space-around",background:"rgba(8,16,28,0.94)",backdropFilter:"blur(24px) saturate(1.8)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:26,padding:"10px 4px",boxShadow:"0 -2px 40px rgba(0,0,0,0.55)"}}>
//             {[
//               {label:"Home",active:true,icon:<svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>},
//               {label:"Habits",active:false,icon:<svg width="21" height="21" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M3 9h18M8 2v4M16 2v4M7 14l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>},
//               {label:"Progress",active:false,icon:<svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M3 17l4-5 4 3 4-6 4 4M3 21h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>},
//               {label:"Team",active:false,icon:<svg width="21" height="21" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M3 20c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.8"/><path d="M21 20c0-2.485-1.79-4-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>},
//               {label:"Profile",active:false,icon:<svg width="21" height="21" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c0-3.866 3.582-7 8-7s8 3.134 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>},
//             ].map(tab=>(
//               <button key={tab.label} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:tab.active?"rgba(56,189,248,0.1)":"none",border:"none",cursor:"pointer",padding:"7px 14px",borderRadius:16,color:tab.active?"#38bdf8":"rgba(255,255,255,0.26)",WebkitTapHighlightColor:"transparent",transition:"all .2s",position:"relative"}}>
//                 {tab.active&&<div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",width:20,height:2.5,borderRadius:100,background:"#38bdf8",boxShadow:"0 0 8px rgba(56,189,248,0.9)"}}/>}
//                 {tab.icon}
//                 <span style={{fontSize:9,fontWeight:tab.active?800:500,letterSpacing:"0.04em",textTransform:"uppercase",lineHeight:1}}>{tab.label}</span>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
//         *,*::before,*::after{box-sizing:border-box}
//         ::-webkit-scrollbar{display:none}
//         button{-webkit-tap-highlight-color:transparent}
//         body{margin:0}
//         @keyframes habitFlash{0%{opacity:1}100%{opacity:0}}
//         @keyframes checkDraw{from{stroke-dashoffset:18}to{stroke-dashoffset:0}}
//         @keyframes budPop{from{transform:scale(0.2) translateY(14px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
//         @keyframes trunkGrow{from{transform:scaleY(0);transform-origin:bottom;opacity:0.5}to{transform:scaleY(1);transform-origin:bottom;opacity:1}}
//         @keyframes leafWobble{0%,100%{transform:rotate(-4deg) scale(1)}50%{transform:rotate(5deg) scale(1.05)}}
//         @keyframes leafWobbleR{0%,100%{transform:rotate(4deg) scale(1)}50%{transform:rotate(-5deg) scale(1.05)}}
//         @keyframes ringPulse{0%{transform:scale(1);opacity:0.7}100%{transform:scale(1.4);opacity:0}}
//         @keyframes glowPulse{0%,100%{opacity:0.7;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
//         @keyframes ambientPulse{0%,100%{opacity:0.8}50%{opacity:1}}
//         @keyframes tapRipple{0%{transform:scale(1);opacity:0.6}100%{transform:scale(1.2);opacity:0}}
//         @keyframes fadeUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
//         @keyframes twinkle{0%,100%{opacity:.25;transform:scale(.65)}50%{opacity:1;transform:scale(1.5)}}
//         @keyframes celebFadeIn{from{opacity:0}to{opacity:1}}
//         @keyframes slideDown{from{transform:translateY(-18px);opacity:0}to{transform:translateY(0);opacity:1}}
//         @keyframes dropFall{0%{transform:translateY(-18px) scale(0);opacity:1}100%{transform:translateY(65px) scale(1.1);opacity:0}}
//         @keyframes treeSway{0%,100%{transform:rotate(-1.4deg)}50%{transform:rotate(1.4deg)}}
//         @keyframes waterDropLaunch{0%{transform:translateY(0) scale(1);opacity:1}55%{opacity:0.85}100%{transform:translateY(-60px) scale(0.35);opacity:0}}
//         @keyframes leafGlowPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.3) drop-shadow(0 0 7px rgba(74,222,128,0.7))}}
//         @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
//         @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
//         @keyframes fadeBack{from{opacity:0}to{opacity:1}}
//         @keyframes radialShot{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(0.3);opacity:0}}
//         @keyframes shockRing{0%{transform:scale(1);opacity:0.8}100%{transform:scale(18);opacity:0}}
//         @keyframes waterDropFall{0%{opacity:0;transform:translateY(0) scale(1)}8%{opacity:0.75}85%{opacity:0.6;transform:translateY(200px) scale(0.9)}95%{opacity:0;transform:translateY(218px) scale(0.5)}100%{opacity:0;transform:translateY(218px)}}
//         @keyframes waterSplash{84%{opacity:0;transform:translateX(-50%) scale(0.2)}90%{opacity:0.6;transform:translateX(-50%) scale(1.6)}100%{opacity:0;transform:translateX(-50%) scale(2.4)}}
//         @keyframes goldRingPulse{0%{transform:scale(1);opacity:0.55}100%{transform:scale(1.55);opacity:0}}
//         @keyframes stagePop{0%{transform:scale(0.72) translateY(10px);opacity:0}70%{transform:scale(1.04) translateY(-2px)}100%{transform:scale(1) translateY(0);opacity:1}}
//         @keyframes warningPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}
//         @keyframes toastSlide{from{transform:translateX(-50%) translateY(-20px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
//         @keyframes stageFadeOut{0%{opacity:1;transform:scale(1)}60%{opacity:0.3;transform:scale(0.88)}100%{opacity:0;transform:scale(0.72)}}
//         @keyframes morphOldOut{0%{opacity:1;transform:scale(1) translateY(0)}60%{opacity:0.2;transform:scale(0.45) translateY(20px)}100%{opacity:0;transform:scale(0) translateY(44px)}}
//         @keyframes morphNewIn{0%{opacity:0;transform:scale(0.01)}60%{opacity:1;transform:scale(1.06)}80%{transform:scale(0.97)}100%{opacity:1;transform:scale(1)}}
//         @keyframes morphGroundFlash{0%{opacity:0;transform:translateX(-50%) scaleX(0.2)}35%{opacity:1;transform:translateX(-50%) scaleX(1.3)}70%{opacity:0.5;transform:translateX(-50%) scaleX(1)}100%{opacity:0;transform:translateX(-50%) scaleX(0.7)}}
//         @keyframes fadeIn{from{opacity:0}to{opacity:1}}
//         @keyframes arrowDot{from{opacity:0.2;transform:scale(0.6)}to{opacity:1;transform:scale(1.2)}}
//         @keyframes slideDetailIn{from{opacity:0;transform:translateY(14px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
//         @keyframes progressReveal{from{width:0}}
//       `}</style>
//     </div>
//   );
// }