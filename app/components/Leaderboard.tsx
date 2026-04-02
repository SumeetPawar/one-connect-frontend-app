'use client';
import React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

const BG = "#0A0A0A";
const T1 = "#F0EDE8";
const T3 = "rgba(240,237,232,0.28)";

export const TEAM = [
  { name:"Sumeet",    habits:[4,4,3,4,4,2,4], habitCount:4 },
  { name:"Priya",     habits:[3,4,4,2,3,4,3], habitCount:4 },
  { name:"Arjun",     habits:[4,3,2,4,3,2,4], habitCount:4 },
  { name:"Meera",     habits:[4,4,4,3,4,4,4], habitCount:4 },
  { name:"Rohan",     habits:[2,3,3,2,4,2,3], habitCount:4 },
  { name:"Anjali",    habits:[4,4,3,4,2,3,4], habitCount:4 },
  { name:"Vikram",    habits:[3,2,4,3,3,2,3], habitCount:4 },
  { name:"Neha",      habits:[4,3,2,3,4,3,2], habitCount:4 },
  { name:"Karan",     habits:[2,3,2,4,2,3,2], habitCount:4 },
  { name:"Shreya",    habits:[3,2,3,2,3,2,3], habitCount:4 },
  { name:"Dev",       habits:[2,2,3,2,2,3,2], habitCount:3 },
  { name:"Kavya",     habits:[3,2,2,3,2,2,3], habitCount:3 },
  { name:"Rahul",     habits:[2,1,3,2,2,1,2], habitCount:3 },
  { name:"Isha",      habits:[1,2,2,1,3,2,1], habitCount:3 },
  { name:"Nikhil",    habits:[2,2,1,2,1,2,2], habitCount:3 },
  { name:"Tanvi",     habits:[1,2,1,2,2,1,2], habitCount:3 },
  { name:"Aditya",    habits:[2,1,2,1,2,1,2], habitCount:3 },
  { name:"Pooja",     habits:[1,1,2,1,1,2,1], habitCount:2 },
  { name:"Siddharth", habits:[1,2,1,1,1,2,1], habitCount:2 },
  { name:"Riya",      habits:[1,1,1,2,1,1,1], habitCount:2 },
  { name:"Mihir",     habits:[1,1,1,1,1,1,1], habitCount:2 },
  { name:"Zara",      habits:[0,1,1,0,1,1,0], habitCount:2 },
  { name:"Kunal",     habits:[1,0,1,0,1,0,1], habitCount:2 },
  { name:"Ananya",    habits:[0,0,1,0,0,1,0], habitCount:2 },
  { name:"Harsh",     habits:[0,0,0,1,0,0,0], habitCount:2 },
  { name:"Tanya",     habits:[4,4,4,4,4,3,4], habitCount:4 },
  { name:"Manish",    habits:[3,3,4,3,4,3,3], habitCount:4 },
  { name:"Divya",     habits:[2,3,2,3,3,2,3], habitCount:4 },
  { name:"Amit",      habits:[4,3,4,4,3,4,4], habitCount:4 },
  { name:"Sneha",     habits:[1,2,1,1,2,1,1], habitCount:2 },
];

export function Leaderboard({ accent, userName, onBack }: { accent: string; userName: string; onBack: () => void }) {
  const withTotals = TEAM
    .map(m => {
      const total    = m.habits.reduce((a,b)=>a+b,0);
      const possible = m.habitCount * 7 * 1; // each habit worth 1 per day, max 1
      // Normalise: each day a habit is done counts as 1, max is habitCount per day
      const pctRaw = m.habits.reduce((a,b)=>a + Math.min(b/m.habitCount,1), 0) / 7;
      return { ...m, total, possible, pct: Math.round(pctRaw*100) };
    })
    .sort((a,b) => b.pct - a.pct);

  const rankColors = ["#F5C518","#A8B8C8","#C8824A"];

  return (
    <motion.div
      initial={{ opacity:0, x:32 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:32 }}
      transition={{ type:"spring", stiffness:300, damping:32 }}
      style={{ position:"fixed",inset:0,zIndex:200,background:BG,display:"flex",
        flexDirection:"column",maxWidth:480,margin:"0 auto",overflow:"hidden" }}>

      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"54px 20px 12px",flexShrink:0 }}>
        <div>
          <p style={{ fontSize:10,fontWeight:700,color:accent,letterSpacing:"0.1em",
            textTransform:"uppercase",marginBottom:6,opacity:0.75 }}>Last 7 Days</p>
          <h2 style={{ fontSize:28,fontWeight:700,color:T1,letterSpacing:"-0.6px",lineHeight:1,margin:0 }}>
            Rankings
          </h2>
        </div>
        <motion.button whileTap={{ scale:0.9 }} onClick={onBack}
          style={{ width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.08)",
            border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center" }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="rgba(240,237,232,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </motion.button>
      </div>

      {/* Rows */}
      <div style={{ flex:1,overflowY:"auto",padding:"8px 16px 100px" }}>
        {withTotals.map((member, i) => {
          const isMe   = member.name === userName;
          const rColor = rankColors[i] || (isMe ? accent : "rgba(240,237,232,0.5)");

          return (
            <motion.div key={member.name}
              initial={{ opacity:0, y:8 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay:i*0.04, type:"spring", stiffness:300, damping:28 }}
              style={{ marginBottom:8,
                background: i===0 ? "rgba(245,197,24,0.07)"
                  : i===1 ? "rgba(168,184,200,0.05)"
                  : i===2 ? "rgba(200,130,74,0.05)"
                  : isMe  ? `${accent}0d`
                  : "rgba(255,255,255,0.04)",
                borderRadius:14,
                border:`1px solid ${
                  i===0?"rgba(245,197,24,0.2)":i===1?"rgba(168,184,200,0.15)":
                  i===2?"rgba(200,130,74,0.15)":isMe?`${accent}30`:"rgba(255,255,255,0.07)"
                }`,
                padding:"12px 14px" }}>

              <div style={{ display:"flex",alignItems:"center",gap:10 }}>

                {/* Rank chip — separate pill */}
                <div style={{ width:30,height:30,borderRadius:9,
                  background:`${rColor}18`,border:`1px solid ${rColor}40`,
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <span style={{ fontSize:12,fontWeight:800,color:rColor }}>{i+1}</span>
                </div>

                {/* Avatar */}
                <div style={{ width:34,height:34,borderRadius:"50%",
                  background:isMe?`${accent}22`:"rgba(255,255,255,0.09)",
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                  border:`1.5px solid ${isMe?accent+"45":rColor+"30"}` }}>
                  <span style={{ fontSize:13,fontWeight:700,color:isMe?accent:rColor }}>
                    {member.name.charAt(0)}
                  </span>
                </div>

                {/* Name */}
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ fontSize:15,fontWeight:isMe?600:500,color:T1,
                      letterSpacing:"-0.2px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
                      {member.name}
                    </span>
                    {isMe && <span style={{ fontSize:8,fontWeight:700,color:accent,
                      background:`${accent}22`,borderRadius:20,padding:"2px 7px",
                      letterSpacing:"0.06em",flexShrink:0 }}>YOU</span>}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ textAlign:"right",flexShrink:0 }}>
                  <p style={{ fontSize:16,fontWeight:800,margin:0,color:rColor,letterSpacing:"-0.4px" }}>
                    {member.pct}%
                  </p>
                  <p style={{ fontSize:10,color:T3,margin:0 }}>
                    {member.total}/{member.habitCount*7}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}