'use client';
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Footprints, BookOpen, Moon, Flame, Zap, ChevronRight, Check } from "lucide-react";

import { api, getCachedUserMe } from "@/lib/api";
import { NavBar } from "./NavBar";
import { BottomNav } from "../../components/BottomNav";
import { ForestHistory } from "../../components/ForestHistory";
import { Leaderboard } from "../../components/Leaderboard";
import {TreeSVG}  from "../../components/TreeSVG";

 
import { SA, haptic, BG, S1, S2, S3, T1, T2, T3, SEP, WARN, easeT, springT, slowT, ALL_HABITS_DEF, STAGE_META } from "../../components/constants";


const DEFAULT_HABITS = [
  { id: "water", label: "Drink 8 glasses of water", icon: "💧" },
  { id: "move",  label: "30 min movement",          icon: "🏃" },
  { id: "read",  label: "Read 10 pages",             icon: "📖" },
  { id: "sleep", label: "Sleep by 10 PM",            icon: "🌙" },
];
const TOTAL_DAYS = 21;
// Stage thresholds: front-loaded to hook users early, steep final push for full bloom.
// With 4 habits over 21 days (84 total checks):
//   Sprout    ≥  5% →  ~4 checks  (1 good day to feel the tree move)
//   Seedling  ≥ 20% → ~17 checks  (~4-5 solid days)
//   Sapling   ≥ 40% → ~34 checks  (~8-9 consistent days)
//   Young     ≥ 62% → ~52 checks  (~13 days — serious commitment)
//   Full Bloom≥ 85% → ~71 checks  (~18 near-perfect days — worth chasing)
const STAGE_THRESHOLDS = [0, 0.05, 0.20, 0.40, 0.62, 0.85, 1.0] as const;
function getTreeStage(pct: number): number {
  if (pct < STAGE_THRESHOLDS[1])       return 0; // Seed:       0% – 5%
  if (pct < STAGE_THRESHOLDS[2])       return 1; // Sprout:     5% – 20%
  if (pct < STAGE_THRESHOLDS[3])       return 2; // Seedling:  20% – 40%
  if (pct < STAGE_THRESHOLDS[4])       return 3; // Sapling:   40% – 62%
  if (pct < STAGE_THRESHOLDS[5])       return 4; // Young Tree: 62% – 85%
  return 5;                                       // Full Bloom: 85%+
}




const DAY_MSG: Record<number, { today: (n?: string) => string; missed: (n?: string) => string }> = {
  1:  { today:(n)=>`This is it, ${n}. The tree starts today.`,                    missed:(n)=>`Day one waiting, ${n}. Still yours.` },
  2:  { today:( )=>`Back again. That already puts you ahead.`,                    missed:( )=>`One day off. Come back today.` },
  3:  { today:( )=>`Three days. The tree felt it.`,                               missed:( )=>`Day three. Return before it fades.` },
  4:  { today:(n)=>`The easy part is over, ${n}. This is where it counts.`,       missed:(n)=>`The dip is normal, ${n}. Push through it.` },
  5:  { today:( )=>`Halfway through your first week. Keep that going.`,           missed:( )=>`Five days in. Don't let momentum die.` },
  6:  { today:( )=>`Tomorrow is one week. Don't break the chain tonight.`,        missed:( )=>`One week is still ahead. Come back.` },
  7:  { today:(n)=>`One week, ${n}. Most people never get here.`,                 missed:(n)=>`A week slipped, ${n}. Restart now.` },
  8:  { today:( )=>`Week two. The quiet grind begins. Stay in it.`,               missed:( )=>`Week two is harder. That's why it matters.` },
  9:  { today:( )=>`Nine days of choosing this. That's real.`,                    missed:( )=>`Nine days. Don't let it slip further.` },
  10: { today:( )=>`Double digits. Your brain is rewiring right now.`,            missed:( )=>`Ten days in. One habit today is enough.` },
  11: { today:(n)=>`This is the hardest week, ${n}. You're still opening the app.`, missed:(n)=>`Still here, ${n}. That counts for something.` },
  12: { today:( )=>`Twelve days. The person who does this — that's you now.`,     missed:( )=>`Come back before the identity fades.` },
  13: { today:( )=>`Last day of week two. Finish it strong.`,                     missed:( )=>`Week two almost done. Salvage today.` },
  14: { today:(n)=>`Halfway, ${n}. You've proven you can. Now prove you will.`,   missed:(n)=>`Halfway, ${n}. The second half is yours.` },
  15: { today:( )=>`Final stretch. Every log from here builds the ending.`,       missed:( )=>`Seven days left. Make them count.` },
  16: { today:( )=>`Six days left. The tree is watching.`,                        missed:( )=>`Six left. Come back and finish this.` },
  17: { today:(n)=>`Five days, ${n}. You're going to want to say you did this.`,  missed:(n)=>`Five days, ${n}. Still a strong finish.` },
  18: { today:( )=>`Four days. So close you can feel it.`,                        missed:( )=>`Four days. Don't stop this close to the end.` },
  19: { today:( )=>`Three days left. The tree almost has its final form.`,        missed:( )=>`Three left. End with something.` },
  20: { today:( )=>`One day after this. Make it count.`,                          missed:( )=>`One day left. Take it.` },
  21: { today:(n)=>`Day 21, ${n}. The tree is yours. You built it.`,              missed:(n)=>`You showed up, ${n}. That still grew a tree.` },
};

function StagePopup({ stage, day, userName, onClose }: { stage: number; day?: number; userName?: string; onClose: () => void }) {
  const [ph, setPh]     = useState(0);
  const [tick, setTick] = useState(8);
  const prev     = Math.max(0, stage - 1);
  const meta     = STAGE_META[stage];
  const color    = SA[stage];
  const circ     = 2 * Math.PI * 13;
  const isDayMode = day !== undefined;

  useEffect(() => {
    const ts = isDayMode
      ? [setTimeout(()=>setPh(2),200), setTimeout(()=>setPh(3),700),  setTimeout(()=>setPh(4),1100)]
      : [setTimeout(()=>setPh(1),500), setTimeout(()=>setPh(2),1100), setTimeout(()=>setPh(3),1800), setTimeout(()=>setPh(4),2200)];
    return () => ts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (ph < 4) return;
    if (tick === 0) { onClose(); return; }
    const t = setTimeout(() => setTick(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [ph, tick]);

  const dayMsg  = (DAY_MSG[day as number] || {}) as Partial<{ today: (n?: string) => string; missed: (n?: string) => string }>;
  const name    = userName || "there";
  const eyebrow = isDayMode ? `Day ${day} complete` : meta.label;
  const title   = isDayMode ? (dayMsg.today ? dayMsg.today(name) : "") : meta.title;
  const body    = isDayMode ? "" : meta.body;
  const cta     = isDayMode ? "Keep going" : "Continue growing";

  const particles = isDayMode
    ? [{icon:"🌿",a:0},{icon:"✨",a:90},{icon:"🍃",a:180},{icon:"🌱",a:270}]
    : [{icon:"🍃",a:0},{icon:"✨",a:60},{icon:"🌿",a:120},{icon:"⭐",a:180},{icon:"🌱",a:240},{icon:"💫",a:300}];

  return (
    <AnimatePresence>
      <motion.div key="popup"
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        transition={{ duration:0.35 }}
        style={{ position:"fixed",inset:0,zIndex:300,background:"#050805",display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto",overflow:"hidden" }}>

        {/* Water droplets — centered like hero, falling into tree */}
        {isDayMode && (()=>{
          const drops = [
            {sx:-24,tx:-18,d:0,  r:2.8},
            {sx: 20,tx: 15,d:.7, r:3.0},
            {sx:-32,tx:-26,d:1.5,r:2.6},
            {sx: 28,tx: 22,d:.3, r:2.9},
            {sx:-14,tx:-10,d:2.0,r:3.1},
            {sx: 14,tx: 10,d:1.1,r:2.7},
            {sx:-20,tx:-16,d:1.8,r:2.9},
            {sx: 18,tx: 14,d:.5, r:2.8},
            // Left side
            {sx:-90, tx:-75,d:0.4,r:3.2},
            {sx:-110,tx:-92,d:1.6,r:2.8},
            {sx:-75, tx:-62,d:1.0,r:3.0},
            // Right side
            {sx: 95, tx: 80,d:1.3,r:2.9},
            {sx: 112,tx: 95,d:0.7,r:3.1},
            {sx: 80, tx: 68,d:2.0,r:2.8},
          ];
          const startY = 0;
          const fallPx = 320;
          return drops.map((dp,i)=>{
            const isSide = Math.abs(dp.sx) > 60;
            return (
            <motion.div key={`pd-${i}`}
              style={{ position:"absolute",left:`calc(50% + ${dp.sx}px)`,top:startY,pointerEvents:"none",zIndex:2 }}
              animate={{ x:dp.tx-dp.sx, y:fallPx, opacity:[0,isSide?0.55:0.9,isSide?0.45:0.85,0] }}
              transition={{ duration:dp.r,delay:dp.d,repeat:Infinity,ease:"easeIn" }}>
              <svg width={isSide?"4":"5"} height={isSide?"7":"8"} viewBox="0 0 6 9" fill="none">
                <path d="M3 .5C3 .5.5 3.5.5 5.5a2.5 2.5 0 005 0C5.5 3.5 3 .5 3 .5Z" fill="#5BB8F0" opacity={isSide?".6":".9"}/>
                <path d="M3 2C3 2 1.5 4 1.8 5.2" stroke="rgba(255,255,255,0.4)" strokeWidth=".7" strokeLinecap="round"/>
              </svg>
            </motion.div>
          )});
        })()}

        <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }}
          transition={{ delay:0.4, duration:1.2, ease:[0.22,1,0.36,1] }}
          style={{ height:1, background:`linear-gradient(90deg,transparent,${color},transparent)`, transformOrigin:"left", flexShrink:0 }}/>

        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"54px 20px 0",flexShrink:0 }}>
          <motion.button whileTap={{ scale:0.9 }} onClick={onClose}
            style={{ width:36,height:36,borderRadius:"50%",background:S2,border:`1px solid ${SEP}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke={T3} strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </motion.button>

          {/* From → To only for stage unlock */}
          <AnimatePresence>
            {ph >= 4 && !isDayMode && (
              <motion.div key="fromto" initial={{ opacity:0,y:4 }} animate={{ opacity:1,y:0 }} transition={easeT}
                style={{ display:"flex",alignItems:"center",gap:6 }}>
                <span style={{ fontSize:12,color:T3,fontWeight:400 }}>{STAGE_META[prev].emoji} {STAGE_META[prev].label}</span>
                <svg width="14" height="8" viewBox="0 0 16 8" fill="none">
                  <path d="M0 4h12M9 1l3 3-3 3" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
                </svg>
                <span style={{ fontSize:12,color,fontWeight:600 }}>{meta.emoji} {meta.label}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div animate={{ opacity: ph >= 4 ? 0.6 : 0 }} transition={{ duration:0.5 }}>
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="13" fill="none" stroke={S3} strokeWidth="2"/>
              <motion.circle cx="16" cy="16" r="13" fill="none" stroke={color} strokeWidth="2"
                strokeDasharray={circ} strokeDashoffset={circ*(1-tick/8)}
                strokeLinecap="round" transform="rotate(-90 16 16)"
                transition={{ duration:1, ease:"linear" }}/>
              <text x="16" y="20.5" textAnchor="middle" style={{ font:"500 10px -apple-system,sans-serif", fill:T3 }}>{tick}</text>
            </svg>
          </motion.div>
        </div>

        <div style={{ height:260,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",position:"relative" }}>
          {ph >= 2 && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:0.6 }} transition={{ duration:1.4 }}
              style={{ position:"absolute",width:260,height:260,borderRadius:"50%",background:`radial-gradient(circle,${color}18 0%,transparent 65%)` }}/>
          )}

          <AnimatePresence>
            {!isDayMode && ph === 1 && (
              <motion.div key="prev" initial={{ opacity:1,scale:0.62 }} animate={{ opacity:0,scale:0.58 }}
                transition={{ duration:0.5,ease:[0.4,0,0.8,0.2] }}
                style={{ position:"absolute",transformOrigin:"bottom center" }}>
                <TreeSVG stage={prev} pct={1}/>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {ph >= 2 && (
              <motion.div key="next"
                initial={{ opacity:0, scale:isDayMode?0.66:0.54, y:isDayMode?8:24 }}
                animate={{ opacity:1, scale:0.72, y:0 }}
                transition={{ type:"spring", stiffness:isDayMode?260:180, damping:28, delay:0.1 }}
                style={{ transformOrigin:"bottom center" }}>
                <TreeSVG stage={stage} pct={1}/>
              </motion.div>
            )}
          </AnimatePresence>

          {ph >= 3 && particles.map((p, i) => {
            const rad = p.a * Math.PI / 180;
            const r = 55 + (i % 2) * 20;
            return (
              <motion.div key={i}
                initial={{ x:0,y:0,opacity:0,scale:0 }}
                animate={{ x:Math.cos(rad)*r, y:Math.sin(rad)*r, opacity:[0,0.65,0], scale:1 }}
                transition={{ duration:1.4, delay:i*0.1, ease:"easeOut" }}
                style={{ position:"absolute",top:"50%",left:"50%",fontSize:14,pointerEvents:"none" }}>
                {p.icon}
              </motion.div>
            );
          })}
        </div>

        {/* Text block */}
        <motion.div animate={{ opacity:ph>=4?1:0, y:ph>=4?0:10 }} transition={easeT}
          style={{ padding:"0 24px",flexShrink:0,pointerEvents:ph>=4?"auto":"none" }}>

          {isDayMode ? (
            /* Day reward — simple, warm */
            <>
              <p style={{ fontSize:11,fontWeight:600,color,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:10,opacity:0.75 }}>{eyebrow}</p>
              <h2 style={{ fontSize:22,fontWeight:500,color:T1,margin:0,lineHeight:1.5,letterSpacing:"-0.2px" }}>{title}</h2>
            </>
          ) : (
            /* Stage unlock — game achievement layout */
            <>
              {/* Unlock label */}
              <motion.p
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.0, duration:0.4, ease:[0.22,1,0.36,1] }}
                style={{ fontSize:10,fontWeight:700,color,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:14,opacity:0.7 }}>
                Stage Unlocked
              </motion.p>

              {/* Stage name */}
              <motion.div
                initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }}
                transition={{ delay:0.10, type:"spring", stiffness:300, damping:28 }}
                style={{ marginBottom:14 }}>
                <h1 style={{ fontSize:34,fontWeight:800,color:T1,lineHeight:1,letterSpacing:"-1.5px",margin:0 }}>
                  {meta.title}
                </h1>
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.14, duration:0.5, ease:[0.22,1,0.36,1] }}
                style={{ fontSize:14,color:T2,margin:0,lineHeight:1.7 }}>
                {meta.body}
              </motion.p>
            </>
          )}
        </motion.div>

        <motion.div animate={{ opacity:ph>=4?1:0 }} transition={{ delay:0.22, duration:0.5, ease:[0.22,1,0.36,1] }}
          style={{ padding:"20px 24px 52px",flexShrink:0,pointerEvents:ph>=4?"auto":"none" }}>
          <motion.button whileTap={{ scale:0.97 }} onClick={onClose}
            style={{
              width:"100%",padding:"15px",
              background:isDayMode?"transparent":color,
              border:`1px solid ${isDayMode?color+"60":color}`,
              borderRadius:14,fontSize:15,fontWeight:isDayMode?500:700,
              color:T1,cursor:"pointer",letterSpacing:"0.02em",
              boxShadow:isDayMode?"none":`0 4px 20px ${color}40`,
            }}>
            {cta}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StagesModal({ stage, onClose }: { stage: number; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div key="scrim" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        transition={{ duration:0.3 }} onClick={onClose}
        style={{ position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)" }}/>

      <motion.div key="modal"
        initial={{ opacity:0, y:40, scale:0.96 }}
        animate={{ opacity:1, y:0,  scale:1 }}
        exit={{    opacity:0, y:20, scale:0.96 }}
        transition={{ type:"spring",stiffness:320,damping:32 }}
        style={{ position:"fixed",inset:0,zIndex:401,display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto",overflow:"hidden" }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"54px 20px 20px",flexShrink:0 }}>
          <div>
            <p style={{ fontSize:11,fontWeight:600,color:SA[stage],letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:4 }}>Your Journey</p>
            <h2 style={{ fontSize:24,fontWeight:600,color:T1,letterSpacing:"-0.4px",lineHeight:1 }}>Tree Stages</h2>
          </div>
          <motion.button whileTap={{ scale:0.9 }} onClick={onClose}
            style={{ width:36,height:36,borderRadius:"50%",background:S2,border:`1px solid ${SEP}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke={T3} strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </motion.button>
        </div>

        {/* Stages grid — horizontal scroll of 6 trees */}
        <div style={{ flex:1,overflowY:"auto",padding:"0 16px 40px" }}>
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            {STAGE_META.map((s,i)=>{
              const unlocked = i <= stage;
              const current  = i === stage;
              const color    = SA[i];
              return (
                <motion.div key={i}
                  initial={{ opacity:0, x:-16 }}
                  animate={{ opacity:1, x:0 }}
                  transition={{ delay:i*0.06, type:"spring",stiffness:300,damping:30 }}
                  style={{
                    display:"flex",alignItems:"center",gap:14,
                    background: current ? `${color}14` : S1,
                    borderRadius:18,
                    border:`1px solid ${current?color+"40":unlocked?`${color}20`:SEP}`,
                    padding:"12px 14px",
                    opacity: unlocked ? 1 : 0.35,
                    position:"relative",
                    overflow:"hidden",
                  }}>

                  {/* Current indicator bar */}
                  {current && (
                    <motion.div
                      initial={{ scaleY:0 }} animate={{ scaleY:1 }} transition={{ delay:i*0.06+0.2 }}
                      style={{ position:"absolute",left:0,top:0,bottom:0,width:3,background:color,borderRadius:"18px 0 0 18px",transformOrigin:"top" }}/>
                  )}

                  {/* Tree preview — fixed container, tree scales to fit fully */}
                  <div style={{ width:40,height:52,flexShrink:0,overflow:"visible",position:"relative",borderRadius:6 }}>
                    {unlocked ? (
                      <div style={{
                        position:"absolute",bottom:0,left:0,right:0,
                        display:"flex",justifyContent:"center",
                        overflow:"visible",
                      }}>
                        <div style={{
                          transform:`scale(${[0.22,0.20,0.18,0.14,0.13,0.11][i]})`,
                          transformOrigin:"bottom center",
                          filter: current?"none":"saturate(0.65) brightness(0.8)",
                          flexShrink:0,
                        }}>
                          <TreeSVG stage={i} pct={1}/>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100%",fontSize:18,opacity:0.2 }}>🔒</div>
                    )}
                  </div>

                  {/* Text — no emoji, clean */}
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                      <span style={{ fontSize:14,fontWeight:current?700:600,color:unlocked?T1:T3,letterSpacing:"-0.1px" }}>
                        {s.label}
                      </span>
                      {current&&(
                        <span style={{ fontSize:9,fontWeight:700,color,background:`${color}22`,borderRadius:20,padding:"2px 8px",letterSpacing:"0.05em" }}>
                          NOW
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize:12,color:unlocked?T2:T3,lineHeight:1.45 }}>
                      {unlocked ? s.body : [
                        "Your journey begins here.",
                        "Something is about to stir.",
                        "Roots are waiting to form.",
                        "A real tree is closer than you think.",
                        "The forest is almost complete.",
                        "",
                      ][i]}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Shield SVG component
function ShieldIcon({ size=14, color, filled=false, broken=false }: { size?: number; color: string; filled?: boolean; broken?: boolean }) {
  return (
    <svg width={size} height={size*1.14} viewBox="0 0 14 16" fill="none">
      <path d="M7 1L1 3.5V8C1 11.5 3.5 14.5 7 15.5C10.5 14.5 13 11.5 13 8V3.5L7 1Z"
        fill={filled?color:`${color}25`}
        stroke={broken?"rgba(255,255,255,0.15)":color}
        strokeWidth="1.2" strokeLinejoin="round"
        strokeDasharray={broken?"2 2":"none"}/>
      {filled && !broken && (
        <path d="M4.5 8L6.2 9.8L9.5 6.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      )}
      {broken && (
        <path d="M6 4L8 8L6 12" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round"/>
      )}
    </svg>
  );
}

function StreakBadge({ streak, shields, perfectStreak, bestStreak, habitCount, onUseShield }: { streak: number; shields: number; perfectStreak: number; bestStreak: number; habitCount: number; onUseShield: () => void }) {
  const minHabitsForShield = Math.ceil(habitCount * 0.5);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, { passive:true });
    document.addEventListener("touchmove", close, { passive:true });
    return () => {
      window.removeEventListener("scroll", close);
      document.removeEventListener("touchmove", close);
    };
  }, [open]);

  return (
    <>
      <motion.button
        initial={{ opacity:0, x:8 }}
        animate={{ opacity:1, x:0 }}
        transition={springT}
        whileTap={{ scale:0.92 }}
        onClick={() => setOpen(o => !o)}
        style={{ position:"absolute",top:54,right:16,zIndex:5,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",borderRadius:20,padding:"5px 12px",border:`1px solid ${WARN}30`,display:"flex",alignItems:"center",gap:8,cursor:"pointer" }}
      >
        {/* Flame + streak */}
        <div style={{ display:"flex",alignItems:"center",gap:4 }}>
          <Flame size={11} color={streak>0?WARN:"rgba(255,255,255,0.2)"} fill={streak>0?WARN:"none"} strokeWidth={1.5}/>
          <span style={{ fontSize:11,fontWeight:700,color:streak>0?WARN:"rgba(255,255,255,0.3)" }}>{streak}d</span>
        </div>

        {/* Divider */}
        <div style={{ width:1,height:12,background:"rgba(255,255,255,0.12)" }}/>

        {/* Single shield */}
        <motion.div
          animate={{ scale: shields>0?1:0.85, opacity: shields>0?1:0.3 }}
          transition={{ type:"spring",stiffness:400,damping:28 }}>
          <ShieldIcon size={13} color={shields>0?"#5B9BD5":"rgba(255,255,255,0.4)"} filled={shields>0}/>
        </motion.div>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div key="ov" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:0.18 }} onClick={() => setOpen(false)}
              style={{ position:"fixed",inset:0,zIndex:9 }}/>

            <motion.div key="tip"
              initial={{ opacity:0, scale:0.9, y:-6 }}
              animate={{ opacity:1, scale:1,   y:0 }}
              exit={{    opacity:0, scale:0.9,  y:-6 }}
              transition={{ type:"spring",stiffness:400,damping:30 }}
              style={{ position:"fixed",top:100,right:16,zIndex:10,width:210,background:"rgba(14,14,14,0.98)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderRadius:18,overflow:"hidden",border:"1px solid rgba(255,255,255,0.07)",boxShadow:"0 16px 48px rgba(0,0,0,0.8)" }}>

              <div style={{ height:2,background:"linear-gradient(90deg,transparent,#5B9BD5 40%,transparent)" }}/>

              <div style={{ padding:"14px 14px 12px" }}>

                {/* Best streak */}
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                  marginBottom:12,paddingBottom:12,borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <p style={{ fontSize:9,fontWeight:600,color:T3,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2 }}>All-time best</p>
                    <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                      <Flame size={12} color={WARN} fill={WARN} strokeWidth={1.5}/>
                      <span style={{ fontSize:18,fontWeight:800,color:WARN,letterSpacing:"-0.5px" }}>{bestStreak}d</span>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontSize:9,fontWeight:600,color:T3,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2 }}>Current</p>
                    <span style={{ fontSize:18,fontWeight:800,color:streak>0?WARN:"rgba(255,255,255,0.3)",letterSpacing:"-0.5px" }}>{streak}d</span>
                  </div>
                </div>

                {/* How shields work */}
                <div style={{ marginBottom:streak>=1&&streak<4?12:0 }}>
                  <p style={{ fontSize:10,fontWeight:600,color:T3,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10 }}>How Shields Work</p>
                  <div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:8 }}>
                    <div style={{ width:24,height:24,borderRadius:8,background:"rgba(91,155,213,0.12)",border:"1px solid rgba(91,155,213,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1 }}>
                      <ShieldIcon size={12} color="#5B9BD5" filled={true}/>
                    </div>
                    <div>
                      <p style={{ fontSize:12,fontWeight:600,color:T1,lineHeight:1.2,marginBottom:2 }}>Earn a shield</p>
                      <p style={{ fontSize:11,color:T3,lineHeight:1.4 }}>Do at least {minHabitsForShield} of {habitCount} habits every day for 4 days straight. Use it before earning another.</p>
                    </div>
                  </div>
                  <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
                    <div style={{ width:24,height:24,borderRadius:8,background:`${WARN}12`,border:`1px solid ${WARN}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1 }}>
                      <Flame size={12} color={WARN} fill={WARN} strokeWidth={1.5}/>
                    </div>
                    <div>
                      <p style={{ fontSize:12,fontWeight:600,color:T1,lineHeight:1.2,marginBottom:2 }}>Miss a day — no problem</p>
                      <p style={{ fontSize:11,color:T3,lineHeight:1.4 }}>A shield absorbs the miss. Streak stays alive.</p>
                    </div>
                  </div>
                </div>

                {streak>=1&&streak<4&&(
                  <div style={{ marginTop:12,padding:"7px 9px",background:"rgba(91,155,213,0.08)",borderRadius:8,border:"1px solid rgba(91,155,213,0.18)" }}>
                    <p style={{ fontSize:10,fontWeight:600,color:"#5B9BD5",lineHeight:1.4 }}>{4-streak} more day{(4-streak)!==1?"s":""} — shield incoming</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function HabitRow({ habit, checked, onToggle, dimmed }: { habit: { id: string; label: string; sub: string; Icon: React.ElementType; color: string }; checked: boolean; onToggle: () => void; dimmed: boolean }) {
  const { Icon, color, label, sub } = habit;
  return (
    <motion.button whileTap={{ scale:0.982 }} onClick={onToggle} transition={springT}
      style={{ display:"flex",alignItems:"center",gap:14,padding:"15px 16px",background:checked?`${color}0E`:S1,borderRadius:14,border:`1px solid ${checked?color+"28":SEP}`,width:"100%",textAlign:"left",cursor:"pointer",opacity:dimmed&&!checked?0.45:1,transition:"background 0.3s,border-color 0.3s,opacity 0.3s" }}>
      <motion.div animate={{ background:checked?color:S2 }} transition={{ duration:0.35 }}
        style={{ width:40,height:40,borderRadius:11,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
        <motion.div animate={{ color: checked ? "#fff" : color }} transition={{ duration:0.25 }}>
          <Icon size={17} strokeWidth={1.8}/>
        </motion.div>
      </motion.div>
      <div style={{ flex:1,minWidth:0 }}>
        <motion.p
          animate={{ color:checked?T2:T1 }}
          transition={{ duration:0.25 }}
          style={{ fontSize:15,fontWeight:500,lineHeight:1.25,letterSpacing:"-.01em" }}>
          {label}
        </motion.p>
        <p style={{ fontSize:12,color:checked?`${color}90`:T3,marginTop:2,lineHeight:1,fontWeight:400 }}>
          {checked ? "Completed" : sub}
        </p>
      </div>

      {/* Trailing — clean check on done, chevron on pending */}
      <AnimatePresence mode="wait">
        {checked
          ? <motion.div key="d"
              initial={{ scale:0, opacity:0 }}
              animate={{ scale:1, opacity:1 }}
              exit={{ scale:0, opacity:0 }}
              transition={springT}
              style={{ width:22,height:22,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <Check size={13} color="#fff" strokeWidth={2.5}/>
            </motion.div>
          : <motion.div key="a" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ width:22,height:22,borderRadius:"50%",border:`1.5px solid ${T3}`,flexShrink:0 }}/>}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── AI Cycle Summary ────────────────────────────────────────────────────────
// ─── Leaderboard ─────────────────────────────────────────────────────────────

function genDays(streakDays: number, seed: number, habitIds: string[]): Record<number, Record<string, boolean>> {
  const d: Record<number, Record<string, boolean>> = {};
  let s = seed;
  const rnd = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  for (let day = 1; day <= 21; day++) {
    d[day] = {};
    habitIds.forEach((id: string) => { d[day][id] = rnd() < (day <= streakDays ? 0.88 : 0.18); });
  }
  return d;
}

const PAST_CYCLES = [
  { id:1, label:"Cycle 1", dates:"Jan 1 – Jan 21",  stage:5, streak:18, highlight:"First full bloom.",                  habits:["water","move","read","sleep"],                       days:genDays(18,101,["water","move","read","sleep"]) },
  { id:2, label:"Cycle 2", dates:"Feb 1 – Feb 21",  stage:4, streak:14, highlight:"Strong second week carried this one.", habits:["water","move","sleep","meditate"],                 days:genDays(14,202,["water","move","sleep","meditate"]) },
  { id:3, label:"Cycle 3", dates:"Feb 22 – Mar 14", stage:2, streak:6,  highlight:"Toughest cycle. Life got in the way.", habits:["water","read"],                                   days:genDays(6,303,["water","read"]) },
  { id:4, label:"Cycle 4", dates:"Mar 15 – Apr 4",  stage:5, streak:21, highlight:"Perfect streak.",                    habits:["water","move","read","sleep","meditate","journal"], days:genDays(21,404,["water","move","read","sleep","meditate","journal"]) },
  { id:5, label:"Cycle 5", dates:"Apr 5 – Apr 25",  stage:3, streak:9,  highlight:"Lost momentum late.",                habits:["water","move","journal"],                           days:genDays(9,505,["water","move","journal"]) },
  { id:6, label:"Cycle 6", dates:"Apr 26 – May 16", stage:4, streak:13, highlight:"Back on track.",                     habits:["water","move","read","sleep","journal"],             days:genDays(13,606,["water","move","read","sleep","journal"]) },
].map(c => ({ ...c, habitsTotal: Object.values(c.days).reduce((a: number, d) => a + Object.values(d as Record<string,boolean>).filter(Boolean).length, 0) }));

export default function HabitTree() {
  const [habits,    setHabits]    = useState(DEFAULT_HABITS);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [loadingDays,   setLoadingDays]   = useState(true);
  const [challengeId,  setChallengeId]  = useState<number | null>(null);
  const [habitCommitmentIds, setHabitCommitmentIds] = useState<Record<string, number>>({});
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [apiStreak,       setApiStreak]       = useState<number | null>(null);
  const [apiLongestStreak,setApiLongestStreak]= useState<number | null>(null);
  const [apiPerfectDays,  setApiPerfectDays]  = useState<number | null>(null);
  const [shieldUsedDays,  setShieldUsedDays]  = useState<Set<number>>(new Set());
  const router = useRouter();
  const [selDay,    setSelDay]    = useState(1);
  const [days,      setDays]      = useState<Record<number, Record<string, boolean>>>(() => { const d: Record<number, Record<string, boolean>> = {}; for (let i=1;i<=TOTAL_DAYS;i++) d[i]={}; return d; });

  // ── History API shapes ───────────────────────────────────────────────────
  type HistoryTopHabit = {
    commitment_id: number;
    habit: { id: number; slug: string; label?: string; icon?: string };
  };
  type HistoryLogHabit = {
    commitment_id: number;
    habit_slug: string;
    completed: boolean;
    value: number | null;
  };
  type HistoryDailyLog = {
    day_number: number;
    habits?: HistoryLogHabit[];
  };
  type HistoryChallenge = {
    id?: number;
    started_at?: string;
    habits?: HistoryTopHabit[];
    daily_logs?: HistoryDailyLog[];
  };

  // Primary data load — history gives us everything in one shot
  useEffect(() => {
    api<HistoryChallenge[]>("/api/habit-challenges/history")
      .then(history => {
        if (!Array.isArray(history) || history.length === 0) return;
        const latest = history[0];
        if (!latest) return;

        // Build slug → String(id) lookup from top-level habits
        const slugToId: Record<string, string> = {};

        if (Array.isArray(latest.habits) && latest.habits.length > 0) {
          latest.habits.forEach(h => { slugToId[h.habit.slug] = String(h.habit.id); });

          // Populate habits state
          setHabits(latest.habits.map(h => ({
            id:    String(h.habit.id),
            slug:  h.habit.slug,
            label: h.habit.label || h.habit.slug,
            icon:  h.habit.icon  || "✦",
          })));

          // Populate commitment-id map
          const cids: Record<string, number> = {};
          latest.habits.forEach(h => { cids[String(h.habit.id)] = h.commitment_id; });
          setHabitCommitmentIds(cids);
        }

        if (latest.id)          setChallengeId(latest.id);
        if (latest.started_at) {
          setStartedAt(latest.started_at);
          const day = Math.min(TOTAL_DAYS, Math.max(1,
            Math.floor((Date.now() - Date.parse(latest.started_at)) / 86400000) + 1));
          setSelDay(day);
        }

        // Populate ALL 21 day squares from daily_logs
        if (Array.isArray(latest.daily_logs)) {
          const d: Record<number, Record<string, boolean>> = {};
          for (let i = 1; i <= TOTAL_DAYS; i++) d[i] = {};
          latest.daily_logs.forEach(dayLog => {
            const dayNum = dayLog.day_number;
            d[dayNum] = {};
            dayLog.habits?.forEach(habitLog => {
              // Use numeric id as key to stay consistent with the rest of the app
              const key = slugToId[habitLog.habit_slug] ?? habitLog.habit_slug;
              d[dayNum][key] = !!habitLog.completed;
            });
          });
          setDays(d);
        }
      })
      .finally(() => {
        setLoadingHabits(false);
        setLoadingDays(false);
      });
  }, []);
  const [popup,     setPopup]     = useState<number | null>(null);
  const [dayReward, setDayReward] = useState<number | null>(null);
  const [tapped,    setTapped]    = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const [userName,  setUserName]  = useState("You");

  // Fetch real first name from cached /api/me
  useEffect(() => {
    getCachedUserMe()
      .then(me => { if (me?.name) setUserName(me.name.split(' ')[0]); })
      .catch(() => {});
  }, []);
  const [stagesOpen,setStagesOpen]= useState(false);
  const [shields,   setShields]   = useState(0);
  const [activeTab, setActiveTab] = useState("habit"); // habit | forest | leaderboard

  // Fetch active habit challenge — secondary: confirms/patches data after history loads
  useEffect(() => {
    api<{ id: number; status: string; started_at: string; ends_at: string; habits: { id: string; slug?: string; label?: string; name?: string; icon?: string }[] }>("/api/habit-challenges/active")
      .then(data => {
        if (data.id) setChallengeId(data.id);
        if (data.habits && data.habits.length > 0) {
          setHabits(data.habits.map(h => ({
            id: String(h.id),
            slug: h.slug ?? "",
            label: h.label || h.name || String(h.id),
            icon: h.icon || "✦",
          })));
        }
        if (data.started_at) {
          setStartedAt(data.started_at);
          const day = Math.min(TOTAL_DAYS, Math.max(1, Math.floor((Date.now() - Date.parse(data.started_at)) / 86400000) + 1));
          setSelDay(day);
        } else {
          setLoadingDays(false);
        }
      })
      .catch(() => { setLoadingDays(false); /* keep defaults */ })
      .finally(() => setLoadingHabits(false));
  }, []);

  // Fetch completion status for the selected day
  // Refresh TODAY's data once after history loads — in case the user logged
  // something on another device. Past days are already accurate from history.
  // NOT triggered by day-clicks; history pre-populates all 21 days.
  useEffect(() => {
    if (!startedAt) return;
    const todayNum = Math.min(TOTAL_DAYS, Math.max(1,
      Math.floor((Date.now() - Date.parse(startedAt)) / 86400000) + 1));

    type TodayEntry = { commitment_id: number; habit: { id: string }; completed: boolean };
    api<{ habits?: TodayEntry[] }>("/api/habit-challenges/today")
      .then(data => {
        const entries = data.habits ?? [];
        if (entries.length === 0) return;
        const dayMap: Record<string, boolean> = {};
        const commitMap: Record<string, number> = {};
        entries.forEach((e: TodayEntry) => {
          const key = String(e.habit?.id ?? "");
          if (key) { dayMap[key] = e.completed; commitMap[key] = e.commitment_id; }
        });
        setDays(prev => ({ ...prev, [todayNum]: { ...prev[todayNum], ...dayMap } }));
        setHabitCommitmentIds(prev => ({ ...prev, ...commitMap }));
      })
      .catch(() => { /* keep history data */ });
  }, [startedAt]); // runs once when startedAt is known, not on every day-click

  // Fetch streak data from backend
  useEffect(() => {
    if (challengeId === null) return;
    api<{ current_streak: number; effective_streak?: number; longest_streak: number; perfect_days: number; completion_pct: number; shields_earned?: number; shields_used?: number; shield_used_on_dates?: string[] }>(
      `/api/habit-challenges/${challengeId}/streak`
    )
      .then(d => {
        setApiStreak(d.effective_streak ?? d.current_streak);
        setApiLongestStreak(d.longest_streak);
        setApiPerfectDays(d.perfect_days);
        // Derive available shields from API
        const earned = d.shields_earned ?? 0;
        const used   = d.shields_used   ?? 0;
        setShields(Math.max(0, earned - used));
        // Convert shield-used dates → day numbers
        if (d.shield_used_on_dates && startedAt) {
          const origin = Date.parse(startedAt);
          const usedSet = new Set(
            d.shield_used_on_dates.map(dateStr =>
              Math.floor((Date.parse(dateStr) - origin) / 86400000) + 1
            ).filter(n => n >= 1 && n <= TOTAL_DAYS)
          );
          setShieldUsedDays(usedSet);
        }
      })
      .catch(() => { /* keep computed fallbacks */ });
  }, [challengeId, startedAt]);

  const TOTAL_POSSIBLE = TOTAL_DAYS * habits.length;

  if (loadingHabits) return (
    <div style={{ minHeight:"100svh", background:"#0a0a0a", overflowY:"hidden",
      fontFamily:"-apple-system,'SF Pro Text','Helvetica Neue',sans-serif" }}>
      <style>{`
        @keyframes skPulse { 0%,100%{opacity:.2} 50%{opacity:.5} }
        @keyframes skSway  { 0%,100%{transform:scale(0.66) rotate(0deg)} 50%{transform:scale(0.66) rotate(1deg)} }
        .sk { animation: skPulse 1.6s ease-in-out infinite; border-radius:8px; background:rgba(255,255,255,0.07); }
      `}</style>

      {/* Hero skeleton */}
      <div style={{ height:300, background:"linear-gradient(180deg,#040a04 0%,#0a1208 100%)",
        position:"relative", display:"flex", alignItems:"flex-end", justifyContent:"center",
        paddingBottom:32 }}>
        {/* Stage badge skeleton */}
        <div className="sk" style={{ position:"absolute", top:54, left:16,
          width:80, height:24, borderRadius:20, animationDelay:"0s" }}/>
        {/* Tree skeleton */}
        <div style={{ animation:"skSway 3s ease-in-out infinite", transformOrigin:"bottom center" }}>
          <svg width="200" height="230" viewBox="0 0 200 230">
            {/* trunk */}
            <rect x="88" y="130" width="24" height="90" rx="6" fill="rgba(255,255,255,0.08)"/>
            {/* canopy rings — concentric circles growing up */}
            <circle cx="100" cy="120" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18"/>
            <circle cx="100" cy="90"  r="30" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="16"/>
            <circle cx="100" cy="68"  r="22" fill="rgba(255,255,255,0.07)"/>
            <circle cx="100" cy="52"  r="14" fill="rgba(255,255,255,0.08)"/>
          </svg>
        </div>
      </div>

      {/* Body skeleton */}
      <div style={{ padding:"20px 20px 100px", display:"flex", flexDirection:"column", gap:16 }}>

        {/* Stats row */}
        <div style={{ display:"flex", gap:10 }}>
          {[90, 70, 80].map((w,i) => (
            <div key={i} className="sk" style={{ flex:1, height:58, borderRadius:14, animationDelay:`${i*0.15}s` }}/>
          ))}
        </div>

        {/* Section label */}
        <div className="sk" style={{ width:80, height:10, borderRadius:6, animationDelay:"0.1s" }}/>

        {/* Habit rows */}
        {[0,1,2,3].map(i => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
            background:"rgba(255,255,255,0.03)", borderRadius:14, padding:"14px 14px" }}>
            <div className="sk" style={{ width:36, height:36, borderRadius:10, flexShrink:0, animationDelay:`${i*0.1}s` }}/>
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
              <div className="sk" style={{ width:`${60+i*8}%`, height:11, borderRadius:6, animationDelay:`${i*0.1+0.05}s` }}/>
              <div className="sk" style={{ width:"40%", height:9, borderRadius:6, animationDelay:`${i*0.1+0.1}s` }}/>
            </div>
            <div className="sk" style={{ width:32, height:32, borderRadius:"50%", flexShrink:0, animationDelay:`${i*0.1+0.15}s` }}/>
          </div>
        ))}

        {/* 21-day grid section */}
        <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:16, padding:"16px" }}>
          <div className="sk" style={{ width:100, height:10, borderRadius:6, marginBottom:14, animationDelay:"0.2s" }}/>
          {/* Header row */}
          <div style={{ display:"grid", gridTemplateColumns:"16px repeat(7,1fr)", gap:4, marginBottom:4 }}>
            <div/>
            {[...Array(7)].map((_,i) => (
              <div key={i} className="sk" style={{ height:8, borderRadius:4, animationDelay:`${i*0.06}s` }}/>
            ))}
          </div>
          {/* 3 weeks */}
          {[0,1,2].map(w => (
            <div key={w} style={{ display:"grid", gridTemplateColumns:"16px repeat(7,1fr)", gap:4, marginBottom:4 }}>
              <div className="sk" style={{ width:8, height:"100%", borderRadius:4, animationDelay:`${w*0.1}s` }}/>
              {[...Array(7)].map((_,d) => (
                <div key={d} className="sk" style={{ aspectRatio:"1", borderRadius:6,
                  animationDelay:`${(w*7+d)*0.04}s` }}/>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const totalDone = Object.values(days).reduce((a: number, d)=>a+(habits as typeof DEFAULT_HABITS).filter(h=>d[h.id]).length, 0);
  const pct       = totalDone/TOTAL_POSSIBLE;
  const stage     = getTreeStage(pct);
  const accent    = SA[stage];
  const meta      = STAGE_META[stage];
  const dayDone      = (d: number) => (habits as typeof DEFAULT_HABITS).filter(h=>days[d]&&days[d][h.id]).length;
  const dayAny       = (d: number) => dayDone(d) > 0;  // any habit logged = streak counts
  // Streak: consecutive days where at least 1 habit was logged (fallback if API not yet loaded)
  const streak       = apiStreak       ?? (()=>{ let s=0; for(let i=selDay;i>=1;i--){ if(dayAny(i))s++; else break; } return s; })();
  // Perfect streak: perfect days from API or computed locally
  const minForShield  = Math.ceil((habits as typeof DEFAULT_HABITS).length * 0.5);
  const perfectStreak= apiPerfectDays  ?? (()=>{ let s=0; for(let i=selDay;i>=1;i--){ if(dayDone(i)>=minForShield)s++; else break; } return s; })();
  const bestStreak   = apiLongestStreak ?? streak;

  const THRESHOLDS = STAGE_THRESHOLDS;
  // Progress-within-stage bounds mirror STAGE_THRESHOLDS exactly
  const STAGE_LOWER = [0, 0.05, 0.20, 0.40, 0.62, 0.85];
  const STAGE_UPPER = [0.05, 0.20, 0.40, 0.62, 0.85, 1.0];
  const stageRange  = STAGE_UPPER[stage] - STAGE_LOWER[stage];
  const stagePct    = stage < 5 ? Math.min(Math.max((pct - STAGE_LOWER[stage]) / stageRange, 0), 1) : 1;
  // currentDay — always anchored to today regardless of which day is selected
  const currentDay  = startedAt
    ? Math.min(TOTAL_DAYS, Math.max(1, Math.floor((Date.now() - Date.parse(startedAt)) / 86400000) + 1))
    : selDay;
  // Tree status always reflects TODAY, not the selected day
  const todayN      = dayDone(currentDay);
  const allDone     = todayN === (habits as typeof DEFAULT_HABITS).length;
  // Missed: show dried tree only when yesterday was missed AND nothing logged today
  const yesterdayMissed = currentDay > 1 && dayDone(currentDay - 1) === 0;
  const isMissed    = (yesterdayMissed && todayN === 0) && shields === 0;

  const toggle = (hid: string) => {
    const cur    = stage;
    const wasChk = !!(days[selDay]&&days[selDay][hid]);
    const nowChk = !wasChk;
    haptic.light();
    setTapped(hid); setTimeout(()=>setTapped(null),500);

    // Fire log to backend (optimistic — don't block UI)
    const cid = habitCommitmentIds[hid];
    if (cid !== undefined && startedAt) {
      const logDate = new Date(Date.parse(startedAt) + (selDay - 1) * 86400000);
      const logged_date = logDate.toISOString().slice(0, 10);
      api<{
        current_streak?: number; effective_streak?: number;
        longest_streak?: number; perfect_days?: number;
        shields_earned?: number; shields_used?: number;
        shield_used_on_dates?: string[];
      }>("/api/habit-challenges/logs", {
        method: "POST",
        body: JSON.stringify({
          commitment_id: cid,
          logged_date,
          completed: nowChk,
          value: nowChk ? 1 : 0,
        }),
      }).then(res => {
        if (res.effective_streak != null) setApiStreak(res.effective_streak);
        else if (res.current_streak != null) setApiStreak(res.current_streak);
        if (res.longest_streak != null) setApiLongestStreak(res.longest_streak);
        if (res.perfect_days   != null) setApiPerfectDays(res.perfect_days);
        const earned = res.shields_earned ?? 0;
        const used   = res.shields_used   ?? 0;
        setShields(Math.max(0, earned - used));
        if (res.shield_used_on_dates && startedAt) {
          const origin = Date.parse(startedAt);
          setShieldUsedDays(new Set(
            res.shield_used_on_dates.map(d =>
              Math.floor((Date.parse(d) - origin) / 86400000) + 1
            ).filter(n => n >= 1 && n <= TOTAL_DAYS)
          ));
        }
      }).catch(() => {/* silent fail — UI already updated */});
    }
    setDays(prev=>{
      const next = {...prev,[selDay]:{...prev[selDay],[hid]:!(prev[selDay]&&prev[selDay][hid])}};
      const nt   = Object.values(next).reduce((a: number, d)=>a+(habits as typeof DEFAULT_HABITS).filter(h=>(d as Record<string,boolean>)[h.id]).length, 0);
      const ns   = getTreeStage(nt/TOTAL_POSSIBLE);
      if(ns>cur) setTimeout(()=>{ haptic.unlock(); setPopup(ns); },200);
      const td = (habits as typeof DEFAULT_HABITS).filter(h=>next[selDay]&&next[selDay][h.id]).length;
      if(td===(habits as typeof DEFAULT_HABITS).length&&!wasChk){
        haptic.success();
        if(mainScrollRef.current) {
          mainScrollRef.current.scrollTo({ top:0, behavior:"smooth" });
        }
        setCelebrating(true);
        setTimeout(()=>setCelebrating(false), 1800);
        setTimeout(()=>setDayReward(selDay), 300);
        const last4 = [selDay-3,selDay-2,selDay-1,selDay];
        const perfect4 = selDay>=4 && last4.every(d=>(habits as typeof DEFAULT_HABITS).every(h=>next[d]&&next[d][h.id]));
        if(perfect4){ haptic.medium(); setShields(s=>Math.min(s+1,1)); }
      }
      return next;
    });
  };

  const handleHardDelete = async () => {
    if (challengeId === null) return;
    if (!window.confirm("[DEV] Hard delete this habit challenge?")) return;
    try {
      await api(`/api/habit-challenges/${challengeId}/hard`, { method: "DELETE" });
      router.push("/habits");
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div ref={mainScrollRef} style={{ background:BG,minHeight:"100svh",fontFamily:"-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",color:T1,overflowX:"hidden",overflowY:"auto",height:"100svh" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{display:none}
        @keyframes breathe{0%,100%{transform:scale(.68) rotate(0deg)}30%{transform:scale(.68) rotate(1.2deg)}65%{transform:scale(.68) rotate(-.9deg)}85%{transform:scale(.68) rotate(.5deg)}}
        @keyframes wilt{0%,100%{transform:scale(.64) rotate(0deg)}30%{transform:scale(.64) rotate(-2deg) scaleX(.96)}65%{transform:scale(.64) rotate(.4deg)}}
        @keyframes drip{0%{opacity:0;transform:translateY(0) scale(.5)}12%{opacity:.9;transform:scale(1)}80%{opacity:.4}100%{opacity:0;transform:translateY(36px) scale(.75)}}
        @keyframes leaf{0%{opacity:0;transform:translate(0,0) rotate(0)}15%{opacity:.75}100%{opacity:0;transform:translate(var(--lx),50px) rotate(var(--lr))}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes skeletonPulse{0%,100%{opacity:.35}50%{opacity:.75}}
      `}</style>

      {popup!==null && <StagePopup stage={popup} onClose={()=>setPopup(null)}/>}
      {dayReward!==null && popup===null && <StagePopup stage={stage} day={dayReward} userName={userName} onClose={()=>setDayReward(null)}/>}

      {/* [DEV] Hard delete button */}
      <div style={{ position:"fixed", top:12, right:12, zIndex:999 }}>
        {/* <button onClick={handleHardDelete} style={{
          background:"rgba(255,59,48,0.15)", border:"1px solid rgba(255,59,48,0.35)",
          borderRadius:10, padding:"6px 12px", color:"rgba(255,59,48,0.9)",
          fontSize:11, fontWeight:700, letterSpacing:"0.04em", cursor:"pointer",
          backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
        }}>
          ✕ Reset challenge
        </button> */}
      </div>



      {/* Bottom nav — consistent app-wide */}
      <BottomNav active="habits" />

      {/* Forest History overlay */}
      <AnimatePresence>
        {activeTab === "forest" && (
          <ForestHistory cycles={PAST_CYCLES} accent={accent} onClose={() => setActiveTab("habit")} />
        )}
      </AnimatePresence>

      {/* Leaderboard overlay */}
      <AnimatePresence>
        {activeTab === "leaderboard" && (
          <Leaderboard accent={accent} userName={userName} onBack={() => setActiveTab("habit")} />
        )}
      </AnimatePresence>

      {/* HERO */}
      <motion.div
        animate={{ background: isMissed
          ? "linear-gradient(180deg,#0a0805 0%,#130f08 55%,#181208 100%)"
          : allDone
          ? "linear-gradient(180deg,#030c06 0%,#061408 55%,#0c1e0c 100%)"
          : "linear-gradient(180deg,#040a04 0%,#070e07 55%,#0a1208 100%)" }}
        transition={{ duration:1.2 }}
        style={{ position:"relative",height:300,overflow:"clip" }}>

        {/* Stars — brighter and twinkling when all done */}
        {[18,52,88,124,162,196,232,266,298,334,358].map((l,i)=>(
          allDone ? (
            <motion.div key={i}
              animate={{ opacity:[0.4,1,0.4], scale:[1,1.4,1] }}
              transition={{ duration:1.8+i*0.3, repeat:Infinity, ease:"easeInOut", delay:i*0.2 }}
              style={{ position:"absolute",left:l,top:[16,6,22,9,19,4,14,21,8,16,12][i],
                width:2,height:2,borderRadius:"50%",
                background:"rgba(240,237,232,0.9)",
                boxShadow:"0 0 4px rgba(240,237,232,0.6)" }}/>
          ) : (
            <div key={i} style={{ position:"absolute",left:l,top:[16,6,22,9,19,4,14,21,8,16,12][i],width:1.5,height:1.5,borderRadius:"50%",background:"rgba(240,237,232,0.3)" }}/>
          )
        ))}

        {/* Aurora shimmer — layered, drifting */}
        {allDone && (
          <>
            <motion.div
              animate={{ opacity:[0.15,0.3,0.15], x:[-12,12,-12] }}
              transition={{ duration:5, repeat:Infinity, ease:"easeInOut" }}
              style={{ position:"absolute",top:16,left:"5%",right:"5%",height:90,
                background:`radial-gradient(ellipse 90% 100% at 50% 0%,${accent}45 0%,transparent 70%)`,
                pointerEvents:"none",filter:"blur(10px)" }}/>
            <motion.div
              animate={{ opacity:[0.08,0.18,0.08], x:[8,-8,8] }}
              transition={{ duration:7, repeat:Infinity, ease:"easeInOut", delay:2 }}
              style={{ position:"absolute",top:0,left:"20%",right:"20%",height:60,
                background:`radial-gradient(ellipse 70% 100% at 50% 0%,rgba(180,255,160,0.3) 0%,transparent 70%)`,
                pointerEvents:"none",filter:"blur(6px)" }}/>
          </>
        )}

        {/* Ground ambient */}
        <motion.div
          animate={{ background: allDone
            ? `radial-gradient(ellipse,${accent}35 0%,transparent 65%)`
            : `radial-gradient(ellipse,${isMissed?"rgba(120,80,30,0.12)":accent+"18"} 0%,transparent 65%)` }}
          transition={{ duration:1.2 }}
          style={{ position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:260,height:120,pointerEvents:"none" }}/>

        {/* Persistent canopy glow when all done */}
        {allDone && (
          <div style={{ position:"absolute",top:"32%",left:0,right:0,display:"flex",justifyContent:"center",transform:"translateY(-50%)",pointerEvents:"none",zIndex:2 }}>
            <motion.div
              animate={{ opacity:[0.35,0.65,0.35], scale:[0.9,1.1,0.9] }}
              transition={{ duration:3.5, repeat:Infinity, ease:"easeInOut" }}
              style={{ width:220,height:220,borderRadius:"50%",
                background:`radial-gradient(circle,${accent}28 0%,transparent 70%)` }}/>
          </div>
        )}

        {/* Glowing mushrooms — bioluminescent, at ground level on sides */}
        {allDone && (
          <svg style={{ position:"absolute",bottom:68,left:0,right:0,width:"100%",height:60,pointerEvents:"none",zIndex:4 }}
            viewBox="0 0 380 60" preserveAspectRatio="none">
            <defs>
              <radialGradient id="mush1" cx="50%" cy="60%"><stop offset="0%" stopColor="#90f080" stopOpacity="0.9"/><stop offset="100%" stopColor="#40a030" stopOpacity="0"/></radialGradient>
              <radialGradient id="mush2" cx="50%" cy="60%"><stop offset="0%" stopColor="#a0f8a0" stopOpacity="0.8"/><stop offset="100%" stopColor="#50b040" stopOpacity="0"/></radialGradient>
            </defs>

            {/* Left side mushrooms */}
            <ellipse cx="28" cy="50" rx="14" ry="6" fill="url(#mush1)" opacity="0.7"/>
            <ellipse cx="28" cy="48" rx="10" ry="4" fill="#7ae870" opacity="0.5"/>
            <rect x="26" y="48" width="4" height="10" rx="2" fill="#5ab850" opacity="0.6"/>

            <ellipse cx="52" cy="52" rx="10" ry="5" fill="url(#mush2)" opacity="0.6"/>
            <ellipse cx="52" cy="50" rx="7" ry="3.5" fill="#8af08a" opacity="0.4"/>
            <rect x="50" y="50" width="3" height="8" rx="1.5" fill="#4aaa40" opacity="0.5"/>

            <ellipse cx="18" cy="54" rx="7" ry="3" fill="url(#mush1)" opacity="0.5"/>
            <rect x="16.5" y="53" width="2.5" height="6" rx="1" fill="#3a9830" opacity="0.4"/>

            {/* Right side mushrooms */}
            <ellipse cx="352" cy="50" rx="14" ry="6" fill="url(#mush1)" opacity="0.7"/>
            <ellipse cx="352" cy="48" rx="10" ry="4" fill="#7ae870" opacity="0.5"/>
            <rect x="350" y="48" width="4" height="10" rx="2" fill="#5ab850" opacity="0.6"/>

            <ellipse cx="328" cy="52" rx="10" ry="5" fill="url(#mush2)" opacity="0.6"/>
            <ellipse cx="328" cy="50" rx="7" ry="3.5" fill="#8af08a" opacity="0.4"/>
            <rect x="326" y="50" width="3" height="8" rx="1.5" fill="#4aaa40" opacity="0.5"/>

            <ellipse cx="362" cy="54" rx="7" ry="3" fill="url(#mush1)" opacity="0.5"/>
            <rect x="360.5" y="53" width="2.5" height="6" rx="1" fill="#3a9830" opacity="0.4"/>
          </svg>
        )}

        {/* Mushroom glow pulse */}
        {allDone && (
          <>
            <motion.div animate={{ opacity:[0.15,0.35,0.15] }} transition={{ duration:4,repeat:Infinity,ease:"easeInOut" }}
              style={{ position:"absolute",bottom:66,left:12,width:60,height:20,borderRadius:"50%",
                background:"radial-gradient(ellipse,rgba(100,240,80,0.4) 0%,transparent 70%)",pointerEvents:"none",zIndex:3 }}/>
            <motion.div animate={{ opacity:[0.15,0.35,0.15] }} transition={{ duration:4,repeat:Infinity,ease:"easeInOut",delay:1.5 }}
              style={{ position:"absolute",bottom:66,right:12,width:60,height:20,borderRadius:"50%",
                background:"radial-gradient(ellipse,rgba(100,240,80,0.4) 0%,transparent 70%)",pointerEvents:"none",zIndex:3 }}/>
          </>
        )}

        {/* Ground fade */}
        <motion.div animate={{ background:`linear-gradient(0deg,${isMissed?"#130f08":"#0a1208"} 0%,transparent 100%)` }} transition={{ duration:1.2 }}
          style={{ position:"absolute",bottom:0,left:0,right:0,height:36 }}/>
        <motion.div animate={{ background:`linear-gradient(0deg,${isMissed?"#130f08":"#0a1208"} 0%,transparent 100%)` }} transition={{ duration:1.2 }}
          style={{ position:"absolute",bottom:0,left:0,right:0,height:36 }}/>

        {/* Stage badge — tappable, shows all stages */}
        {stagesOpen&&<StagesModal stage={stage} onClose={()=>setStagesOpen(false)}/>}
        <motion.button
          animate={{ borderColor:isMissed?"rgba(120,80,30,0.35)":`${accent}35` }}
          transition={{ duration:1 }}
          whileTap={{ scale:0.93 }}
          onClick={()=>{ haptic.light(); setStagesOpen(true); }}
          style={{ position:"absolute",top:54,left:16,zIndex:5,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",borderRadius:20,padding:"4px 12px",border:"1px solid",display:"flex",alignItems:"center",gap:5,cursor:"pointer" }}>
          <span style={{ fontSize:12 }}>{meta.emoji}</span>
          <motion.span animate={{ color:isMissed?"#9E7040":accent }} transition={{ duration:1 }}
            style={{ fontSize:10,fontWeight:600,letterSpacing:"0.05em" }}>
            {meta.label.toUpperCase()}
          </motion.span>
        </motion.button>

        {/* Streak badge with shield + popup */}
        {<StreakBadge streak={streak} shields={shields} perfectStreak={perfectStreak} bestStreak={bestStreak} habitCount={habits.length} onUseShield={()=>setShields(s=>Math.max(s-1,0))}/>}

        {/* Tree */}
        <div
          onClick={()=>{ haptic.light(); setStagesOpen(true); }}
          style={{ position:"absolute",top:0,left:0,right:0,bottom:72,display:"flex",alignItems:"flex-end",justifyContent:"center",cursor:"pointer" }}>

          {/* Water system — converging drops + soil ripples + accumulating glow */}
          {todayN>0&&!isMissed&&(()=>{
            const drops = [
              {sx:-24, tx:-18, d:0,   r:2.8},
              {sx: 20, tx: 15, d:.7,  r:3.0},
              {sx:-32, tx:-26, d:1.5, r:2.6},
              {sx: 28, tx: 22, d:.3,  r:2.9},
              {sx:-14, tx:-10, d:2.0, r:3.1},
              {sx: 14, tx: 10, d:1.1, r:2.7},
              {sx:-20, tx:-16, d:1.8, r:2.9},
              {sx: 18, tx: 14, d:.5,  r:2.8},
            ];

            // Extra side drops when all habits done
            const sideDrops = allDone ? [
              {sx:-90, tx:-75, d:0.4, r:3.2},
              {sx: 95, tx: 80, d:1.3, r:2.9},
              {sx:-110,tx:-92, d:2.1, r:3.4},
              {sx: 112,tx: 95, d:0.7, r:3.1},
              {sx:-75, tx:-62, d:1.6, r:2.8},
              {sx: 80, tx: 68, d:0.2, r:3.0},
            ] : [];

            const startY = 20;
            const rootY  = 222;
            const fallPx = rootY - startY;
            return (
              <>
                {drops.map((dp,i)=>(
                  <motion.div key={`dp-${i}`}
                    style={{ position:"absolute",left:`calc(50% + ${dp.sx}px)`,top:startY,pointerEvents:"none",zIndex:3 }}
                    animate={{ x:dp.tx-dp.sx, y:fallPx, opacity:[0,0.9,0.85,0.7,0] }}
                    transition={{ duration:dp.r, delay:dp.d, repeat:Infinity, ease:"easeIn" }}>
                    <svg width="5" height="8" viewBox="0 0 6 9" fill="none">
                      <path d="M3 .5C3 .5.5 3.5.5 5.5a2.5 2.5 0 005 0C5.5 3.5 3 .5 3 .5Z" fill="#5BB8F0" opacity=".9"/>
                      <path d="M3 2C3 2 1.5 4 1.8 5.2" stroke="rgba(255,255,255,0.4)" strokeWidth=".7" strokeLinecap="round"/>
                    </svg>
                  </motion.div>
                ))}

                {/* Side drops — only when all habits done */}
                {sideDrops.map((dp,i)=>(
                  <motion.div key={`sdp-${i}`}
                    style={{ position:"absolute",left:`calc(50% + ${dp.sx}px)`,top:startY,pointerEvents:"none",zIndex:3 }}
                    animate={{ x:dp.tx-dp.sx, y:fallPx, opacity:[0,0.65,0.5,0] }}
                    transition={{ duration:dp.r, delay:dp.d, repeat:Infinity, ease:"easeIn" }}>
                    <svg width="4" height="7" viewBox="0 0 6 9" fill="none">
                      <path d="M3 .5C3 .5.5 3.5.5 5.5a2.5 2.5 0 005 0C5.5 3.5 3 .5 3 .5Z" fill="#5BB8F0" opacity=".6"/>
                    </svg>
                  </motion.div>
                ))}

                {/* Ripples at soil where drops land */}
                {drops.map((dp,i)=>(
                  <motion.div key={`rp-${i}`}
                    style={{ position:"absolute",left:`calc(50% + ${dp.tx}px)`,top:rootY-3,pointerEvents:"none",zIndex:2,
                      width:0,height:0,display:"flex",alignItems:"center",justifyContent:"center" }}
                    animate={{ scale:[0,1,1.8], opacity:[0,0.55,0] }}
                    transition={{ duration:dp.r, delay:dp.d, repeat:Infinity, ease:"easeOut" }}>
                    <div style={{ width:16,height:5,borderRadius:"50%",border:"1px solid rgba(91,184,240,0.8)",position:"absolute" }}/>
                  </motion.div>
                ))}

                {/* Soil glow — inside tree container at its very bottom */}
                {todayN>0&&(
                  <div style={{ position:"absolute",bottom:0,left:0,right:0,display:"flex",justifyContent:"center",pointerEvents:"none" }}>
                    <motion.div
                      animate={{ opacity:[0.15+0.1*(todayN-1),0.32+0.12*(todayN-1),0.15+0.1*(todayN-1)], scaleX:[0.85,1.05,0.85] }}
                      transition={{ duration:3.5, repeat:Infinity, ease:"easeInOut" }}
                      style={{ width:80+todayN*18, height:14, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(91,184,240,0.8) 0%,transparent 70%)" }}
                    />
                  </div>
                )}
              </>
            );
          })()}

          {/* Dust particles rising from ground */}
          {isMissed&&stage>=1&&[
            {x:-18,y:185,d:0,  r:2.8,ex:"-6px", ey:"-55px"},
            {x: 12,y:190,d:.7, r:3.2,ex:"8px",  ey:"-48px"},
            {x:-36,y:192,d:1.3,r:2.6,ex:"-12px",ey:"-44px"},
            {x: 28,y:188,d:.4, r:3.0,ex:"10px", ey:"-52px"},
            {x: -8,y:194,d:1.8,r:2.9,ex:"-4px", ey:"-40px"},
            {x: 42,y:186,d:.9, r:2.7,ex:"14px", ey:"-46px"},
          ].map((p,i)=>(
            <motion.div key={`dust-${i}`}
              initial={{ x:0,y:0,opacity:0,scale:0.4 }}
              animate={{ x:p.ex,y:p.ey,opacity:[0,0.45,0.3,0],scale:[0.4,1,0.8,0.3] }}
              transition={{ duration:p.r,delay:p.d,repeat:Infinity,ease:"easeOut" }}
              style={{ position:"absolute",left:`calc(50% + ${p.x}px)`,top:p.y,pointerEvents:"none",zIndex:3 }}>
              <svg width="4" height="4" viewBox="0 0 4 4">
                <circle cx="2" cy="2" r="2" fill="rgba(180,140,80,0.6)"/>
              </svg>
            </motion.div>
          ))}

          <motion.div animate={{ filter: isMissed
            ? "saturate(0.12) brightness(0.62) sepia(0.25)"
            : allDone
            ? "saturate(1.2) brightness(1.15) drop-shadow(0 0 16px rgba(60,200,60,0.4))"
            : "saturate(1) brightness(1)" }} transition={{ duration:1.2 }}
            style={{ transformOrigin:"bottom center",width:200,display:"flex",justifyContent:"center" }}>
            <motion.div
              animate={ isMissed
                ? { rotate:[0,-2,0.4,-2,0], scaleX:[1,0.96,1,0.96,1] }
                : { rotate:[0,1.2,-0.9,0.5,0], scale:0.68 }
              }
              transition={ isMissed
                ? { duration:5, repeat:Infinity, ease:"easeInOut", times:[0,0.25,0.5,0.75,1] }
                : { duration:4.5, repeat:Infinity, ease:"easeInOut", times:[0,0.3,0.65,0.85,1] }
              }
              style={{ transformOrigin:"bottom center", scale: isMissed ? 0.64 : 0.68 }}
            >
              <TreeSVG stage={stage} pct={pct}/>
            </motion.div>
          </motion.div>

          {/* Celebration burst — fires when all habits complete */}
          <AnimatePresence>
            {celebrating && (
              <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:4 }}>
                {/* Radial glow burst */}
                <motion.div
                  initial={{ opacity:0, scale:0.5 }}
                  animate={{ opacity:[0,0.7,0], scale:[0.5,1.4,1.8] }}
                  exit={{ opacity:0 }}
                  transition={{ duration:1.2, ease:"easeOut" }}
                  style={{ position:"absolute",
                    width:200,height:200,borderRadius:"50%",
                    background:`radial-gradient(circle,${accent}40 0%,transparent 70%)` }}/>
                {/* Particle ring */}
                {[0,45,90,135,180,225,270,315].map((angle,i)=>{
                  const rad = angle*Math.PI/180;
                  const tx = Math.cos(rad)*70;
                  const ty = Math.sin(rad)*70;
                  return (
                    <motion.div key={i}
                      initial={{ x:0,y:0,opacity:0,scale:0 }}
                      animate={{ x:tx,y:ty,opacity:[0,0.9,0],scale:[0,1,0.5] }}
                      transition={{ duration:0.9,delay:i*0.04,ease:"easeOut" }}
                      style={{ position:"absolute",
                        width:6,height:6,borderRadius:"50%",marginLeft:-3,marginTop:-3,
                        background: i%2===0 ? accent : "#fff" }}/>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress strip */}
        <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"12px 18px 20px",background:"linear-gradient(0deg,rgba(0,0,0,0.82) 0%,transparent 100%)" }}>
          {stage<5?(
            <>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:8 }}>
                {/* Left — action signal, most important */}
                {(()=>{
                  const left = Math.ceil((1 - stagePct) * stageRange * TOTAL_POSSIBLE);
                  return (
                    <motion.span key={left} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}
                      style={{ fontSize:13,fontWeight:600,color:T1,letterSpacing:"-0.1px" }}>
                      {left<=0?"Almost there":`${left} habit${left!==1?"s":""} to unlock`}
                    </motion.span>
                  );
                })()}
                {/* Right — destination, quieter */}
                <span style={{ fontSize:11,fontWeight:500,color:T3 }}>
                  {STAGE_META[stage+1].emoji} {STAGE_META[stage+1].label}
                </span>
              </div>
              <div style={{ height:6,background:"rgba(255,255,255,0.08)",borderRadius:99,overflow:"hidden" }}>
                <motion.div animate={{ width:`${stagePct*100}%` }} transition={slowT}
                  style={{ height:"100%",background:`linear-gradient(90deg,${accent}88,${accent})`,borderRadius:99 }}/>
              </div>
            </>
          ):(
            <>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                <span style={{ fontSize:13,fontWeight:600,color:T1 }}>🌸 Full Bloom</span>
                <motion.span animate={{ opacity:[0.6,1,0.6] }} transition={{ duration:2,repeat:Infinity,ease:"easeInOut" }}
                  style={{ fontSize:11,fontWeight:700,color:accent,letterSpacing:"0.04em" }}>COMPLETE</motion.span>
              </div>
              <div style={{ height:6,background:"rgba(255,255,255,0.08)",borderRadius:99,overflow:"hidden" }}>
                <motion.div animate={{ width:"100%",boxShadow:`0 0 12px ${accent}` }}
                  transition={slowT}
                  style={{ height:"100%",background:`linear-gradient(90deg,${accent}88,${accent})`,borderRadius:99 }}/>
              </div>
            </>
          )}
        </div>
      </motion.div>



      {/* BODY */}
      {activeTab==="habit" && (
      <div style={{ padding:"20px 16px 120px",display:"flex",flexDirection:"column",gap:20 }}>

        {/* TODAY */}
        <section style={{ animation:"fadeUp .5s ease both" }}>
          <div style={{ display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:14,marginTop:0 }}>
            <div>
              <h2 style={{ fontSize:22,fontWeight:600,
                color:selDay===currentDay?T1:"rgba(240,237,232,0.5)",
                letterSpacing:"-0.4px",lineHeight:1,display:"flex",alignItems:"center",gap:8,margin:0 }}>
                {selDay===currentDay ? "Today" : `Day ${selDay}`}
                {isMissed&&<span style={{ fontSize:14,opacity:0.6 }}>🍂</span>}
              </h2>
              {selDay===currentDay && !allDone && (
                <p style={{
                  fontSize: 13,
                  fontWeight: 400,
                  color: isMissed ? "rgba(196,154,90,0.55)" : "rgba(240,237,232,0.38)",
                  marginTop: 4,
                  lineHeight: 1.4,
                  letterSpacing: "-0.1px",
                }}>
                  {isMissed
                    ? (DAY_MSG[currentDay]||{missed:()=>""}).missed(userName)
                    : (DAY_MSG[currentDay]||{today:()=>""}).today(userName)}
                </p>
              )}
            </div>
            <span style={{ fontSize:13,color:T3 }}>
              {dayDone(selDay) < habits.length ? `${dayDone(selDay)}/${habits.length}` : ""}
            </span>
          </div>



          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {habits.map(h => {
              const hAny = h as { id: string; slug?: string; label: string; icon: string };
              const def = ALL_HABITS_DEF.find(d => d.id === hAny.slug || d.id === hAny.id);
              const emoji = hAny.icon || "✦";
              const FallbackIcon = () => <span style={{ fontSize:15, lineHeight:1 }}>{emoji}</span>;
              const habit = def || { id: hAny.id, label: hAny.label, sub: hAny.label, Icon: FallbackIcon, color: "#4A9B5F" };
              // Always use the numeric backend id (hAny.id) as the key so that
              // it matches what the API stored in `days` and `habitCommitmentIds`.
              // Only allow editing for today and yesterday
              const canEdit = selDay === currentDay || selDay === currentDay - 1;
              return (
                <HabitRow key={hAny.id} habit={habit}
                  checked={!!(days[selDay]&&days[selDay][hAny.id])}
                  onToggle={canEdit ? ()=>toggle(hAny.id) : ()=>{}}
                  dimmed={!canEdit}/>
              );
            })}
          </div>
        </section>

        {/* 21 DAYS — heat map */}
        <section style={{ animation:"fadeUp .5s .08s ease both",marginTop:0 }}>

          {/* Grid: week label + 7 day cols */}
          <div style={{ display:"grid",gridTemplateColumns:"16px repeat(7,1fr)",gap:3 }}>

            {/* Header row */}
            <div/>
            {["M","T","W","T","F","S","S"].map((d,i)=>(
              <div key={i} style={{ textAlign:"center",fontSize:9,fontWeight:600,color:T3,letterSpacing:"0.05em",paddingBottom:4 }}>{d}</div>
            ))}

            {[1,2,3].map(week=>{
              const weekDays = Array.from({length:7},(_,i)=>(week-1)*7+i+1);
              return [
                /* Week label */
                <div key={`w${week}`} style={{ display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <span style={{ fontSize:8,fontWeight:600,color:T3,letterSpacing:"0.04em",writingMode:"vertical-rl",transform:"rotate(180deg)" }}>W{week}</span>
                </div>,

                /* Day cells */
                ...weekDays.map(day=>{
                  if (loadingDays) {
                    return (
                      <div key={day} style={{
                        aspectRatio:"1", borderRadius:6,
                        background:`rgba(255,255,255,${0.04 + (day % 3) * 0.015})`,
                        animation:`skeletonPulse 1.5s ease-in-out ${(day % 7) * 0.09}s infinite`,
                      }}/>
                    );
                  }
                  const done    = dayDone(day);
                  const sel     = day===selDay;
                  const today   = day===currentDay;
                  const comp    = done===habits.length;
                  const future  = day > currentDay && done === 0;
                  const missed  = done===0 && day<currentDay;

                  // Solid color blend — opacity-on-dark is indistinguishable at small sizes.
                  // Parse accent hex → blend toward page dark (#0a0a0a) at 4 levels.
                  // This gives visually distinct squares for any habit count, like GitHub.
                  const hexR = parseInt(accent.slice(1,3),16);
                  const hexG = parseInt(accent.slice(3,5),16);
                  const hexB = parseInt(accent.slice(5,7),16);
                  const blend = (t:number) =>
                    `rgb(${Math.round(10+(hexR-10)*t)},${Math.round(10+(hexG-10)*t)},${Math.round(10+(hexB-10)*t)})`;
                  const ratio = habits.length > 0 ? done / habits.length : 0;
                  const heat = done === 0 ? "rgba(255,255,255,0.03)"
                    : ratio <= 0.25     ? blend(0.22)   // ~1 habit
                    : ratio <= 0.50     ? blend(0.45)   // mid-low
                    : ratio <= 0.75     ? blend(0.68)   // mid-high
                    : ratio <  1.0      ? blend(0.86)   // almost full
                    : accent;                           // complete

                  const bg = sel&&!today ? "transparent"
                    : today&&comp ? accent
                    : today ? `${accent}20`
                    : missed ? "rgba(139,99,64,0.10)"
                    : future ? "rgba(255,255,255,0.02)"
                    : heat;

                  return (
                    <motion.button key={day}
                      whileTap={{ scale:0.86 }}
                      animate={{ scale:sel||today?1.08:1 }}
                      transition={{ type:"spring",stiffness:440,damping:32 }}
                      onClick={()=>{ if(day>currentDay) return; haptic.tile(); setSelDay(day); }}
                      style={{
                        position:"relative",
                        aspectRatio:"1",
                        borderRadius:6,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        background:bg,
                        border:`1.5px solid ${
                          today ? accent
                          : sel ? T1
                          : comp ? `${accent}60`
                          : missed ? "rgba(139,99,64,0.2)"
                          : "transparent"
                        }`,
                        boxShadow: sel?`0 0 0 2px ${accent}60`:"none",
                        cursor: future ? "default" : "pointer",
                        transition:"background 0.3s",
                        overflow:"hidden",
                      }}>

                      {/* Today/selected: show day number. Missed with no data: faint number. */}
                      {(sel || today || (done===0 && !future)) && (
                        <span style={{
                          fontSize:9, fontWeight:sel||today?700:400,
                          color: today&&!sel ? accent : sel ? T1 : missed ? "rgba(139,99,64,0.3)" : "rgba(255,255,255,0.08)",
                          lineHeight:1,
                        }}>{day}</span>
                      )}

                      {/* Checkmark — complete days */}
                      {comp&&!sel&&(
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4.2 7.2L8 3" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}

                      {/* Fraction count — partial days only, bottom-right corner.*/}
                      {!comp && !sel && !today && done > 0 && !shieldUsedDays.has(day) && (
                        <span style={{
                          position:"absolute", bottom:1, right:2,
                          fontSize:6, fontWeight:700, lineHeight:1,
                          color:"rgba(255,255,255,0.75)",
                          fontVariantNumeric:"tabular-nums",
                        }}>{done}/{habits.length}</span>
                      )}

                      {/* Shield used on this day */}
                      {shieldUsedDays.has(day) && (
                        <div style={{
                          position:"absolute", inset:0,
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>
                          <svg width="10" height="12" viewBox="0 0 20 24" fill="none">
                            <path d="M10 1L2 5v7c0 5 3.5 9.74 8 11 4.5-1.26 8-6 8-11V5L10 1z"
                              fill="rgba(91,155,213,0.35)" stroke="#5B9BD5" strokeWidth="1.8"
                              strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </motion.button>
                  );
                })
              ];
            })}
          </div>

        </section>

        {/* Week summary — below heatmap, reads after seeing the data */}
        {(()=>{
          const weekNum = Math.ceil(currentDay / 7);
          if(weekNum < 2) return null;

          const prevWeekStart = (weekNum - 2) * 7 + 1;
          const prevWeekEnd   = (weekNum - 1) * 7;
          const possible      = 7 * (habits as typeof DEFAULT_HABITS).length;
          let completed       = 0;
          for(let d = prevWeekStart; d <= prevWeekEnd; d++){
            (habits as typeof DEFAULT_HABITS).forEach(h => { if(days[d]?.[h.id]) completed++; });
          }
          const pct = Math.round(completed/possible*100);

          const habitTotals = (habits as typeof DEFAULT_HABITS).map(h => ({
            label: h.label.split(' ').slice(0,2).join(' '),
            count: Array.from({length:7},(_,i)=>days[prevWeekStart+i]?.[h.id]||false).filter(Boolean).length
          })).sort((a,b)=>a.count-b.count);
          const weakest  = habitTotals[0];
          const strongest= habitTotals[habitTotals.length-1];

          const wellMsg = pct >= 85
            ? `You barely missed a day with ${strongest.label} last week.`
            : pct >= 60
            ? `${strongest.label} was your most consistent habit last week.`
            : `${strongest.label} was the one that kept showing up.`;

          const growMsg = pct >= 85
            ? `${weakest.label} slipped once or twice — keep an eye on it this week.`
            : pct >= 60
            ? `${weakest.label} was harder to stick to. Try logging it first thing tomorrow.`
            : pct >= 35
            ? `${weakest.label} barely made it through. Give it a real chance this week.`
            : `Most habits struggled last week. Just pick one and protect it — that's enough.`;

          return (
            <div style={{ marginTop:16,paddingTop:14,borderTop:`1px solid ${SEP}` }}>
              <span style={{ fontSize:9,fontWeight:700,color:accent,
                letterSpacing:"0.08em",textTransform:"uppercase",opacity:0.55 }}>
                Week {weekNum-1}
              </span>
              <div style={{ marginTop:8,display:"flex",flexDirection:"column",gap:5 }}>
                <p style={{ fontSize:13,color:"rgba(240,237,232,0.6)",margin:0,lineHeight:1.65 }}>
                  {wellMsg}
                </p>
                <p style={{ fontSize:13,color:"rgba(240,237,232,0.38)",margin:0,lineHeight:1.65 }}>
                  {growMsg}
                </p>
              </div>
            </div>
          );
        })()}

      </div>
      )}

      {/* ── History & Rank inline buttons ───────────────────────────── */}
      <div style={{ display:"flex", gap:10, padding:"16px 16px 100px" }}>
        <button
          onClick={() => setActiveTab("forest")}
          style={{
            flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)",
            borderRadius:14, padding:"13px 0", cursor:"pointer", color:T2,
            fontFamily:"-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="17" rx="2" stroke={T3} strokeWidth="1.5"/>
            <path d="M3 9h18" stroke={T3} strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8 2v4M16 2v4" stroke={T3} strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2" stroke={T3} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize:13, fontWeight:600, letterSpacing:".01em" }}>History</span>
        </button>
        <button
          onClick={() => router.push("/habits/tree/leaderboard")}
          style={{
            flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)",
            borderRadius:14, padding:"13px 0", cursor:"pointer", color:T2,
            fontFamily:"-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="8" width="6" height="13" rx="1" stroke={T3} strokeWidth="1.5"/>
            <rect x="2" y="13" width="6" height="8" rx="1" stroke={T3} strokeWidth="1.5"/>
            <rect x="16" y="11" width="6" height="10" rx="1" stroke={T3} strokeWidth="1.5"/>
          </svg>
          <span style={{ fontSize:13, fontWeight:600, letterSpacing:".01em" }}>Rank</span>
        </button>
      </div>
    </div>
  );
}