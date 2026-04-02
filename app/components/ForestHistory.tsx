'use client';
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import { SA, STAGE_META, ALL_HABITS_DEF, haptic } from "./constants";
import { TreeSVG } from "./TreeSVG";

export function CycleAISummary({ cycle, accent }: { cycle: Record<string, any>; accent: string }) {
  const isCurrent = cycle.dates.includes("now");
  const cycleHabits = (cycle.habits as string[] || ["water","move","read","sleep"])
    .map((id: string) => ALL_HABITS_DEF?.find(h=>h.id===id))
    .filter((h): h is typeof ALL_HABITS_DEF[number] => !!h);

  const habitStats = cycleHabits.map(h => {
    const dayArr = Array.from({length:21},(_,i)=>cycle.days?.[i+1]?.[h.id]||false);
    const total = dayArr.filter(Boolean).length;
    let best=0,cur=0;
    dayArr.forEach(v=>{ cur=v?cur+1:0; best=Math.max(best,cur); });
    const firstMiss = dayArr.findIndex(v=>!v);
    return { id:h.id, label:h.label, total, best, firstMiss };
  });
  const sorted = [...habitStats].sort((a,b)=>b.total-a.total);
  const best = sorted[0];
  const worst = sorted[sorted.length-1];

  const habitName = (h: { label: string } | undefined) => h?.label.split(' ').slice(0,2).join(' ') || "";
  const bestHabit = habitName(cycleHabits.find(h=>h.id===best?.id));
  const worstHabit = habitName(cycleHabits.find(h=>h.id===worst?.id));

  const messages = isCurrent ? [
    `${bestHabit} has been your most reliable one so far. ${worstHabit} is the one quietly slipping — worth an eye on it.`,
    `You're building something. ${bestHabit} is holding. Just don't let ${worstHabit} disappear entirely.`,
  ] : best.total >= 18 ? [
    `${bestHabit} barely missed a day. That kind of consistency is rare — it carried the whole cycle.`,
    `You practically never skipped ${bestHabit}. Whatever made that easy, it worked.`,
  ] : worst.total <= 5 ? [
    `${bestHabit} showed up. ${worstHabit} mostly didn't — and that's okay, cycles aren't perfect.`,
    `This one had a clear leader and a clear gap. ${bestHabit} held, ${worstHabit} didn't land this time.`,
  ] : worst.firstMiss >= 0 && worst.firstMiss <= 5 ? [
    `${bestHabit} was steady. ${worstHabit} struggled from the start — never quite found its rhythm here.`,
    `${worstHabit} couldn't get going this cycle. ${bestHabit} picked up the weight.`,
  ] : [
    `Strong first half. ${bestHabit} stayed consistent all the way. ${worstHabit} faded — but most of the work got done.`,
    `${bestHabit} was reliable. ${worstHabit} ran out of steam near the end, which is where most habits do.`,
  ];

  const msg = messages[cycle.id % messages.length];

  return (
    <p style={{ fontSize:13,color:"rgba(240,237,232,0.55)",lineHeight:1.7,margin:0,fontStyle:"normal" }}>
      {msg}
    </p>
  );
}

// ─── Forest History ─────────────────────────────────────────────────────────
export function ForestHistory({ cycles, onClose, accent }: { cycles: Record<string, any>[]; onClose: () => void; accent: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [shaking, setShaking] = useState<number | null>(null);
  const [forestH, setForestH] = useState(220);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const sy = el.scrollTop;
    if (sy > 10) {
      setForestH(60);
    } else {
      setForestH(220);
    }
  };

  return (
    <motion.div
      initial={{ opacity:0, x:32 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:32 }}
      transition={{ type:"spring", stiffness:300, damping:32 }}
      style={{ position:"fixed",inset:0,zIndex:200,background:"#040a04",display:"flex",
        flexDirection:"column",maxWidth:480,margin:"0 auto",overflow:"hidden" }}>

      <div style={{ display:"flex",alignItems:"center",gap:12,
        padding:"54px 20px 16px",flexShrink:0 }}>
        <motion.button whileTap={{ scale:0.9 }} onClick={onClose}
          style={{ width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,0.07)",
            border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",flexShrink:0,
            display:"flex",alignItems:"center",justifyContent:"center" }}>
          <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
            <path d="M8 1L1.5 7.5L8 14" stroke="rgba(240,237,232,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
        <div>
          <p style={{ fontSize:10,fontWeight:700,color:accent,letterSpacing:"0.1em",
            textTransform:"uppercase",marginBottom:4,opacity:0.75 }}>Your Growth</p>
          <h2 style={{ fontSize:26,fontWeight:700,color:"#F0EDE8",
            letterSpacing:"-0.5px",lineHeight:1,margin:0 }}>The Forest</h2>
        </div>
      </div>

        {/* Faded overlay for preview/coming soon */}
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 300,
          background: "rgba(10,20,10,0.72)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "auto",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 12,
          }}>
            <span style={{
              color: accent,
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "-1px",
              textTransform: 'uppercase',
              fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
            }}>Forest</span>
            <span style={{
              color: '#fff',
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "-1px",
              textTransform: 'uppercase',
              fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
            }}>History</span>
          </div>
          <div style={{
            color: "#e0e8d0",
            fontSize: 16,
            fontWeight: 500,
            textAlign: "center",
            marginBottom: 28,
          }}>
            This page will soon show your habit progress across cycles.
          </div>
          <button
            onClick={onClose}
            style={{
              marginTop: 8,
              padding: "12px 32px",
              borderRadius: 22,
              border: `2px solid ${accent}`,
              background: accent+"18",
              color: accent,
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: "0.04em",
              boxShadow: `0 2px 16px ${accent}22`,
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s, border-color 0.2s",
              fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
              outline: "none",
              borderWidth: 2,
            }}
          >
            Go Back
          </button>
        </div>

      <motion.div animate={{ height: forestH }}
        transition={{ type:"spring", stiffness:200, damping:28 }}
        style={{ position:"relative",flexShrink:0,overflow:"hidden" }}>

        {/* Sky */}
        <div style={{ position:"absolute",inset:0,
          background:"linear-gradient(180deg,#010306 0%,#02080e 40%,#041510 70%,#061a10 100%)" }}/>

        {/* Moon */}
        <div style={{ position:"absolute",top:12,right:48,width:26,height:26,borderRadius:"50%",
          background:"radial-gradient(circle at 35% 35%,#e8f0d0,#c8d8a0)",
          boxShadow:"0 0 30px rgba(200,220,140,0.2), 0 0 60px rgba(200,220,140,0.08)" }}/>

        {/* Stars */}
        {[18,42,78,110,145,172,210,252,288,320,348].map((l,i)=>(
          <motion.div key={i}
            animate={{ opacity:[0.2,0.7,0.2] }}
            transition={{ duration:2+i*0.4,repeat:Infinity,ease:"easeInOut",delay:i*0.3 }}
            style={{ position:"absolute",left:l,top:[6,14,4,18,8,12,5,16,10,7,15][i],
              width:[1.5,1,2,1,1.5,1,2,1.5,1,2,1][i],
              height:[1.5,1,2,1,1.5,1,2,1.5,1,2,1][i],
              borderRadius:"50%",background:"#e8f4e8" }}/>
        ))}

        {/* Background trees — depth layer */}
        {[{x:-130,s:0.14,st:4,op:0.18},{x:-80,s:0.11,st:5,op:0.15},{x:90,s:0.13,st:3,op:0.18},{x:145,s:0.10,st:5,op:0.14}].map((t,i)=>(
          <div key={i} style={{ position:"absolute",left:`calc(50% + ${t.x}px)`,bottom:28,
            transformOrigin:"bottom center",transform:`translateX(-50%) scale(${t.s})`,
            opacity:t.op,filter:"saturate(0.2) brightness(0.4)" }}>
            <TreeSVG stage={t.st} pct={1}/>
          </div>
        ))}

        {/* Ground mist */}
        <motion.div animate={{ opacity:[0.5,0.8,0.5],x:[-6,6,-6] }}
          transition={{ duration:7,repeat:Infinity,ease:"easeInOut" }}
          style={{ position:"absolute",bottom:22,left:-20,right:-20,height:30,
            background:"radial-gradient(ellipse 70% 100% at 50% 100%,rgba(50,90,50,0.35) 0%,transparent 100%)",
            pointerEvents:"none" }}/>

        {/* Grass tufts */}
        {[20,60,105,150,195,240,285,325,360].map((l,i)=>(
          <div key={i} style={{ position:"absolute",bottom:27,left:l,opacity:0.3+i%3*0.08 }}>
            <svg width="10" height="9" viewBox="0 0 12 10" fill="none">
              <path d="M2 10 Q3 4 4 0M6 10 Q6 3 6 0M10 10 Q9 4 8 0" stroke="#3a6e30" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
        ))}

        {/* Ground soil */}
        <div style={{ position:"absolute",bottom:24,left:0,right:0,height:8,
          background:"linear-gradient(0deg,#0a1a08 0%,#0d2010 100%)" }}/>

        {/* Fireflies */}
        {[{x:55,y:110},{x:290,y:130},{x:175,y:90},{x:95,y:165},{x:315,y:100}].map((f,i)=>(
          <motion.div key={i}
            animate={{ x:[0,i%2?7:-6,0],y:[0,-10,4,0],opacity:[0,0.75,0.3,0] }}
            transition={{ duration:2.8+i*0.6,repeat:Infinity,ease:"easeInOut",delay:i*0.7 }}
            style={{ position:"absolute",left:f.x,top:f.y,width:3,height:3,borderRadius:"50%",
              background:"#d0f070",boxShadow:"0 0 6px #a0d840",pointerEvents:"none" }}/>
        ))}

        {/* Scroll hint */}
        <motion.div
          animate={{ opacity:[0.6,0,0.6] }}
          transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut", delay:1 }}
          style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
            zIndex:20,pointerEvents:"none",display:"flex",alignItems:"center",gap:4 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="rgba(240,237,232,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>

        {/* Foreground cycle trees — horizontally scrollable */}
        <div style={{ position:"absolute",bottom:10,left:0,right:0,overflowX:"auto",overflowY:"visible",
          WebkitOverflowScrolling:"touch",scrollbarWidth:"none" }}>
          <div style={{ display:"flex",alignItems:"flex-end",
            paddingLeft:40,paddingRight:40,gap:0,
            width:`${cycles.length * 80 + 80}px`,height:220,position:"relative" }}>
          {cycles.map((cycle,i)=>{
            const isCurrent = cycle.dates.includes("now");
            const baseX = i * 80;
            const scaleVal = 0.28+(cycle.stage/5)*0.22;
            const depthOp = 0.55+(i/cycles.length)*0.45;
            return (
              <motion.div key={cycle.id}
                whileTap={{ opacity: depthOp * 0.7 }}
                onClick={()=>{
                  haptic.light();
                  setShaking(cycle.id);
                  setTimeout(()=>setShaking(null),400);
                  setSelected(selected===cycle.id?null:cycle.id);
                }}
                initial={{ opacity:0,y:24 }} animate={{ opacity:depthOp,y:0 }}
                transition={{ delay:i*0.14,type:"spring",stiffness:240,damping:26 }}
                style={{ position:"absolute",left:baseX,bottom:0,
                  width:80,display:"flex",justifyContent:"center",
                  transformOrigin:"bottom center",
                  cursor:"pointer",zIndex:i+1 }}>

              {/* Selection ring */}
              {selected===cycle.id && null}
                {/* Ground shadow */}
                <div style={{ position:"absolute",bottom:-1,left:"50%",
                  transform:"translateX(-50%)",
                  width:scaleVal*140,height:5,borderRadius:"50%",
                  background:"rgba(0,0,0,0.3)",filter:"blur(3px)" }}/>
                {/* Current glow */}
                {isCurrent && (
                  <motion.div animate={{ opacity:[0.25,0.55,0.25],scaleX:[0.85,1.1,0.85] }}
                    transition={{ duration:3.5,repeat:Infinity,ease:"easeInOut" }}
                    style={{ position:"absolute",bottom:-1,left:"50%",
                      transform:"translateX(-50%)",
                      width:70,height:12,borderRadius:"50%",
                      background:`radial-gradient(ellipse,${accent}70 0%,transparent 70%)` }}/>
                )}
                {/* Fireflies near current */}
                {isCurrent && [0,1,2].map(fi=>(
                  <motion.div key={fi}
                    animate={{ x:[0,fi%2?8:-6,0],y:[0,-14,-6,0],opacity:[0,0.8,0.4,0] }}
                    transition={{ duration:2.5+fi*0.8,repeat:Infinity,ease:"easeInOut",delay:fi*0.9 }}
                    style={{ position:"absolute",bottom:scaleVal*80+fi*18,
                      left:`calc(50% + ${fi*16-16}px)`,
                      width:3,height:3,borderRadius:"50%",
                      background:"#c8f060",boxShadow:"0 0 6px #a8e040",pointerEvents:"none" }}/>
                ))}
                <div style={{ transformOrigin:"bottom center", transform:`scale(${scaleVal})`,
                    filter:isCurrent
                      ?"drop-shadow(0 0 10px rgba(60,160,60,0.35))"
                      :`saturate(${0.3+cycle.stage*0.1}) brightness(${0.45+cycle.stage*0.08})` }}>
                  <motion.div
                    animate={ shaking===cycle.id
                      ? { rotate:[0,-4,4,-2,1,0] }
                      : isCurrent ? { rotate:[0,0.6,-0.5,0.3,0] } : {} }
                    transition={ shaking===cycle.id
                      ? { duration:0.4, ease:"easeOut" }
                      : { duration:4.5, repeat:Infinity, ease:"easeInOut" } }
                    style={{ transformOrigin:"bottom center" }}>
                    <TreeSVG stage={cycle.stage} pct={1}/>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
          </div>
        </div>

        {/* Ground fade */}
        <div style={{ position:"absolute",bottom:0,left:0,right:0,height:26,
          background:"linear-gradient(0deg,#020804 0%,transparent 100%)",pointerEvents:"none" }}/>

        {/* Collapse overlay */}
        <motion.div animate={{ opacity: forestH < 120 ? 0.85 : 0 }}
          transition={{ duration:0.4 }}
          style={{ position:"absolute",inset:0,background:"#020804",zIndex:10,pointerEvents:"none" }}/>
      </motion.div>

      {/* Bottom sheet — slides up when tree tapped */}
      <AnimatePresence>
        {selected!==null&&(()=>{
          const cycle = cycles.find(c=>c.id===selected);
          if(!cycle) return null;
          const color = SA[cycle.stage];
          const isCurrent = cycle.dates.includes("now");
          return (
            <motion.div key={selected}
              initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
              transition={{ type:"spring",stiffness:320,damping:34 }}
              style={{ position:"absolute",bottom:0,left:0,right:0,zIndex:50,
                background:"#0e0e0e",borderRadius:"24px 24px 0 0",
                border:`1px solid rgba(255,255,255,0.07)`,borderBottom:"none",
                padding:"16px 20px 40px" }}>

              {/* Handle */}
              <div style={{ width:32,height:3,borderRadius:99,background:"rgba(255,255,255,0.12)",margin:"0 auto 24px" }}/>
              <div style={{ position:"fixed",inset:0,zIndex:-1 }} onClick={()=>setSelected(null)}/>

              {/* Header */}
              <div style={{ display:"flex",alignItems:"flex-start",gap:16,marginBottom:24 }}>
                <div style={{ width:48,height:58,flexShrink:0,display:"flex",alignItems:"flex-end",justifyContent:"center",overflow:"visible" }}>
                  <div style={{ transform:`scale(${[0.22,0.20,0.18,0.14,0.13,0.11][cycle.stage]})`,transformOrigin:"bottom center" }}>
                    <TreeSVG stage={cycle.stage} pct={1}/>
                  </div>
                </div>
                <div style={{ flex:1,paddingTop:2 }}>
                  {/* Title row */}
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                    <h2 style={{ fontSize:22,fontWeight:700,color:"#F0EDE8",letterSpacing:"-0.4px",lineHeight:1,margin:0 }}>{cycle.label}</h2>
                    {isCurrent&&<span style={{ fontSize:9,fontWeight:700,color:accent,background:`${accent}22`,borderRadius:20,padding:"3px 9px",letterSpacing:"0.06em" }}>NOW</span>}
                  </div>
                  {/* Stage — secondary, accent color */}
                  <p style={{ fontSize:13,fontWeight:500,color,margin:"0 0 6px",opacity:0.9 }}>{STAGE_META[cycle.stage].label}</p>
                  {/* Meta line — quietest */}
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ fontSize:11,color:"rgba(240,237,232,0.35)" }}>{cycle.dates}</span>
                    <span style={{ fontSize:11,color:"rgba(240,237,232,0.15)" }}>·</span>
                    <span style={{ display:"flex",alignItems:"center",gap:3,fontSize:11,color:"rgba(240,237,232,0.35)" }}>
                      <Flame size={10} color="#C8873A" fill="#C8873A" strokeWidth={1.5}/>
                      {cycle.streak}d
                    </span>
                    <span style={{ fontSize:11,color:"rgba(240,237,232,0.15)" }}>·</span>
                    <span style={{ fontSize:11,color:"rgba(240,237,232,0.35)" }}>{cycle.habitsTotal} logged</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height:1,background:"rgba(255,255,255,0.05)",marginBottom:20 }}/>

              {/* AI summary */}
              <CycleAISummary cycle={cycle} accent={color}/>

              {/* Habit blocks — variable per cycle */}
              <div style={{ display:"flex",flexDirection:"column",gap:8,marginTop:20 }}>
                {(cycle.habits as string[]||[]).map((hid: string)=>{
                  const habit = ALL_HABITS_DEF.find(h=>h.id===hid);
                  if(!habit) return null;
                  const habitDays = Array.from({length:21},(_,di)=>cycle.days?.[di+1]?.[hid]||false);
                  const total = habitDays.filter(Boolean).length;
                  return (
                    <div key={hid}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                        <div style={{ width:18,height:18,borderRadius:5,background:`${habit.color}18`,
                          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          <habit.Icon size={9} color={habit.color}/>
                        </div>
                        <span style={{ fontSize:11,fontWeight:500,color:"rgba(240,237,232,0.55)",flex:1 }}>
                          {habit.label}
                        </span>
                        <span style={{ fontSize:10,color:habit.color,fontWeight:600 }}>
                          {total}/21
                        </span>
                      </div>
                      <div style={{ display:"flex",gap:2 }}>
                        {habitDays.map((done,di)=>(
                          <div key={di} style={{ flex:1,height:10,borderRadius:2,
                            background: done ? habit.color+"cc" : "rgba(255,255,255,0.05)" }}/>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <div ref={scrollRef} onScroll={handleScroll}
        style={{ flex:1,overflowY:"auto",padding:"16px 16px 40px" }}>
        <p style={{ fontSize:10,fontWeight:600,color:"rgba(240,237,232,0.3)",
          letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12 }}>
          {cycles.length} Cycle{cycles.length!==1?"s":""}
        </p>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {[...cycles].reverse().map((cycle,i)=>{
            const color = SA[cycle.stage];
            const isSel = selected===cycle.id;
            const isCurrent = cycle.dates.includes("now");
            return (
              <motion.div key={cycle.id}
                initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
                transition={{ delay:i*0.07 }}
                onClick={()=>setSelected(cycle.id)}
                style={{ background:"rgba(255,255,255,0.04)",
                  borderRadius:16,
                  border:`1px solid ${isCurrent?color+"40":"rgba(255,255,255,0.07)"}`,
                  padding:"12px 14px",cursor:"pointer",
                  position:"relative",overflow:"hidden" }}>
                {isCurrent && (
                  <div style={{ position:"absolute",left:0,top:0,bottom:0,width:3,
                    background:color,borderRadius:"16px 0 0 16px" }}/>
                )}
                <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap" }}>
                      <span style={{ fontSize:14,fontWeight:600,color:"rgba(240,237,232,0.8)" }}>{cycle.label}</span>
                      <span style={{ fontSize:13 }}>{STAGE_META[cycle.stage].emoji}</span>
                      <span style={{ fontSize:11,fontWeight:500,color }}>
                        {STAGE_META[cycle.stage].label}
                      </span>
                      {isCurrent&&<span style={{ fontSize:9,fontWeight:700,color:accent,
                        background:`${accent}20`,borderRadius:20,padding:"2px 7px",
                        letterSpacing:"0.05em" }}>NOW</span>}
                    </div>
                    <span style={{ fontSize:11,color:"rgba(240,237,232,0.28)" }}>{cycle.dates}</span>
                  </div>
                  {/* Streak badge */}
                  <div style={{ display:"flex",alignItems:"center",gap:4,flexShrink:0,
                    background:"rgba(200,135,58,0.1)",borderRadius:20,padding:"4px 10px",
                    border:"1px solid rgba(200,135,58,0.2)" }}>
                    <Flame size={11} color="#C8873A" fill="#C8873A" strokeWidth={1.5}/>
                    <span style={{ fontSize:11,fontWeight:600,color:"#C8873A" }}>{cycle.streak}d</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
