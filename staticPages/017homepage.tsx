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

const T = {
  bg:      "#08080F",
  grad:    "linear-gradient(135deg,#A78BF5 0%,#7C5CE8 100%)",
  gradSoft:"linear-gradient(180deg,rgba(155,127,232,.22) 0%,rgba(124,92,232,.04) 100%)",
  purple:  "#9B7FE8",
  purpleL: "#C4B0F8",
  green:   "#2DD4BF",
  orange:  "#F4A261",
  rose:    "#E87A8A",
  teal:    "#38BDF8",
  t1: "#F2EEFF",
  t2: "rgba(242,238,255,0.65)",
  t3: "rgba(242,238,255,0.38)",
  t4: "rgba(242,238,255,0.20)",
  t5: "rgba(242,238,255,0.09)",
};

type Tab = "not-joined"|"morning"|"evening"|"logged";

const Ic = {
  Bell:   ({c=T.t2,s=17}:{c?:string;s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Walk:   ({c=T.t1,s=17}:{c?:string;s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="1.5"/><path d="M9 8.5l-2 5 3 1-1 5"/><path d="M12 8.5l1.5 4-3.5 1"/><path d="M14 8l2 2-2 3"/></svg>,
  Flame:  ({c=T.t1,s=17}:{c?:string;s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2s-5 4.5-5 9.5a5 5 0 0010 0C17 7.5 14.5 4 12 2z"/><path d="M12 12s-2-1.5-2-3c0-1.2.8-2.5 2-3 1.2.5 2 1.8 2 3 0 1.5-2 3-2 3z"/></svg>,
  Check:  ({c=T.t1,s=12}:{c?:string;s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>,
  Up:     ({c=T.t1,s=10}:{c?:string;s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
  ChevR:  ({c=T.t3,s=13}:{c?:string;s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>,
  Body:   ({c=T.t1,s=17}:{c?:string;s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4.5" r="2"/><path d="M8 9.5h8l-1 5H9l-1-5z"/><path d="M10 14.5l-1.5 5M14 14.5l1.5 5"/><path d="M12 9.5v5"/></svg>,
  Breath: ({c=T.t1,s=17}:{c?:string;s?:number})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>,
};

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

function TreeSvg({stage,size=90}:{stage:0|1|2|3;size?:number}) {
  const g="#4ADE9F",gd="#2A9E6E",br="#8B6A45",brd="#6B4E2E";
  if(stage===0) return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="108" rx="22" ry="6" fill="rgba(139,106,69,.25)"/>
      <path d="M58 108 Q57 94 59 84 Q60 78 61 84 Q63 94 62 108Z" fill={br}/>
      <path d="M59 88 Q50 80 46 72 Q52 76 59 82Z" fill={gd} opacity=".85"/>
      <path d="M61 85 Q70 77 74 69 Q68 74 61 80Z" fill={gd} opacity=".85"/>
      <circle cx="60" cy="78" r="5" fill={g}/>
      <circle cx="60" cy="75" r="3" fill="#5EE8A8"/>
      <circle cx="60" cy="76" r="12" fill="none" stroke="rgba(74,222,159,.22)" strokeWidth="2"/>
      <circle cx="60" cy="76" r="18" fill="none" stroke="rgba(74,222,159,.12)" strokeWidth="1.5"/>
      <circle cx="60" cy="76" r="25" fill="none" stroke="rgba(74,222,159,.06)" strokeWidth="1"/>
      <circle cx="42" cy="68" r="1.5" fill="rgba(94,232,168,.70)"/>
      <circle cx="78" cy="64" r="1.5" fill="rgba(94,232,168,.70)"/>
    </svg>
  );
  if(stage===1) return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="108" rx="24" ry="6" fill="rgba(139,106,69,.22)"/>
      <path d="M56 72 Q54 58 57 46 Q59 38 61 46 Q64 58 63 72Z" fill={br} opacity=".9"/>
      <path d="M56 62 Q44 56 38 44 Q47 52 57 58Z" fill={brd} opacity=".7"/>
      <path d="M64 59 Q76 53 82 41 Q73 50 63 56Z" fill={brd} opacity=".7"/>
      <ellipse cx="60" cy="46" rx="22" ry="18" fill="rgba(30,100,60,.40)"/>
      <ellipse cx="60" cy="42" rx="18" ry="16" fill={gd} opacity=".9"/>
      <ellipse cx="60" cy="36" rx="14" ry="13" fill="#34C47A"/>
      <ellipse cx="60" cy="30" rx="10" ry="10" fill={g}/>
      <ellipse cx="56" cy="26" rx="5" ry="4" fill="rgba(94,232,168,.55)"/>
    </svg>
  );
  if(stage===2) return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="110" rx="28" ry="7" fill="rgba(139,106,69,.20)"/>
      <path d="M54 110 Q52 88 55 72 Q58 62 62 72 Q65 88 66 110Z" fill={brd}/>
      <path d="M55 88 Q40 82 32 68 Q43 78 56 84Z" fill={brd}/>
      <path d="M65 84 Q80 78 88 64 Q77 75 64 81Z" fill={brd}/>
      <ellipse cx="30" cy="60" rx="18" ry="13" fill="rgba(30,100,60,.45)"/>
      <ellipse cx="30" cy="56" rx="15" ry="11" fill={gd}/>
      <ellipse cx="30" cy="52" rx="11" ry="8" fill="#3ABD7E"/>
      <ellipse cx="90" cy="56" rx="18" ry="13" fill="rgba(30,100,60,.45)"/>
      <ellipse cx="90" cy="52" rx="15" ry="11" fill={gd}/>
      <ellipse cx="90" cy="48" rx="11" ry="8" fill="#3ABD7E"/>
      <ellipse cx="60" cy="48" rx="26" ry="28" fill="rgba(30,100,60,.30)"/>
      <ellipse cx="60" cy="44" rx="22" ry="24" fill={gd}/>
      <ellipse cx="60" cy="37" rx="18" ry="20" fill="#34C47A"/>
      <ellipse cx="60" cy="30" rx="13" ry="15" fill={g}/>
      <ellipse cx="56" cy="25" rx="6" ry="5" fill="rgba(94,232,168,.50)"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <ellipse cx="60" cy="112" rx="32" ry="7" fill="rgba(139,106,69,.18)"/>
      <path d="M54 110 Q42 112 36 118" stroke={brd} strokeWidth="3" strokeLinecap="round" fill="none" opacity=".55"/>
      <path d="M66 110 Q78 112 84 118" stroke={brd} strokeWidth="3" strokeLinecap="round" fill="none" opacity=".55"/>
      <path d="M52 112 Q50 88 53 70 Q56 58 60 58 Q64 58 67 70 Q70 88 68 112Z" fill={brd}/>
      <path d="M53 88 Q38 82 28 70 Q40 78 53 84Z" fill={brd}/>
      <path d="M67 84 Q82 78 92 66 Q80 75 67 81Z" fill={brd}/>
      <ellipse cx="24" cy="62" rx="18" ry="12" fill="rgba(30,100,60,.50)"/>
      <ellipse cx="24" cy="58" rx="15" ry="10" fill={gd}/>
      <ellipse cx="96" cy="58" rx="18" ry="12" fill="rgba(30,100,60,.50)"/>
      <ellipse cx="96" cy="54" rx="15" ry="10" fill={gd}/>
      <ellipse cx="42" cy="46" rx="16" ry="11" fill={gd}/>
      <ellipse cx="42" cy="42" rx="12" ry="8" fill="#34C47A"/>
      <ellipse cx="78" cy="42" rx="16" ry="11" fill={gd}/>
      <ellipse cx="78" cy="38" rx="12" ry="8" fill="#34C47A"/>
      <ellipse cx="60" cy="40" rx="28" ry="30" fill="rgba(30,100,60,.28)"/>
      <ellipse cx="60" cy="35" rx="24" ry="26" fill={gd}/>
      <ellipse cx="60" cy="28" rx="20" ry="22" fill="#34C47A"/>
      <ellipse cx="60" cy="22" rx="15" ry="17" fill={g}/>
      <ellipse cx="60" cy="16" rx="10" ry="12" fill="#5EE8A8"/>
      <circle  cx="60" cy="11" r="6" fill="#7EFFC0"/>
      <circle  cx="60" cy="10" r="3" fill="rgba(220,255,235,.85)"/>
      <ellipse cx="48" cy="20" rx="6" ry="4" fill="rgba(126,255,192,.30)"/>
      <ellipse cx="72" cy="17" rx="6" ry="4" fill="rgba(126,255,192,.30)"/>
    </svg>
  );
}

const HABITS=[
  {id:"water",   label:"Drink 8 glasses", emoji:"💧"},
  {id:"stretch", label:"Morning stretch",  emoji:"🧘"},
  {id:"journal", label:"Write in journal", emoji:"📝"},
  {id:"read",    label:"Read 20 min",      emoji:"📖"},
  {id:"grateful",label:"3 things grateful",emoji:"🙏"},
];
const SEL=["water","stretch","journal","read","grateful"];

const SEP=()=><div style={{height:".5px",background:"rgba(242,238,255,.07)",margin:"0 18px"}}/>;

function PillBtn({label,icon,onClick}:{label:string;icon?:React.ReactNode;onClick:()=>void}) {
  return (
    <div style={{display:"flex",justifyContent:"center"}}>
      <button onClick={onClick}
        onMouseDown={e=>{e.currentTarget.style.transform="scale(.97)";e.currentTarget.style.opacity=".82";}}
        onMouseUp={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.opacity="1";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.opacity="1";}}
        style={{
          display:"flex",alignItems:"center",gap:8,padding:"14px 32px",
          borderRadius:99,border:"none",cursor:"pointer",
          background:T.grad,color:"#fff",fontSize:14,fontWeight:700,
          letterSpacing:"-.1px",fontFamily:"'Syne',sans-serif",
          boxShadow:"0 8px 28px rgba(124,92,232,.45),0 1px 0 rgba(255,255,255,.16) inset",
          transition:"opacity .15s,transform .15s",
        }}>{icon}{label}</button>
    </div>
  );
}

function FullBtn({label,onClick,disabled=false}:{label:string;onClick:()=>void;disabled?:boolean}) {
  return (
    <button onClick={onClick}
      onMouseDown={e=>{if(!disabled){e.currentTarget.style.transform="scale(.98)";e.currentTarget.style.opacity=".84";}}}
      onMouseUp={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.opacity="1";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.opacity="1";}}
      style={{
        width:"100%",padding:"15px 0",borderRadius:14,border:"none",
        cursor:disabled?"default":"pointer",
        background:disabled?"rgba(242,238,255,.07)":T.grad,
        color:disabled?T.t4:"#fff",fontSize:14,fontWeight:700,
        letterSpacing:"-.1px",fontFamily:"'Syne',sans-serif",
        boxShadow:disabled?"none":"0 8px 28px rgba(124,92,232,.40),0 1px 0 rgba(255,255,255,.14) inset",
        transition:"all .18s",
      }}>{label}</button>
  );
}

function AiInsightCard({fd}:{fd:(d:number)=>React.CSSProperties}) {
  const day=6;
  const week=day<=7?"Week 1 of 3":day<=14?"Week 2 of 3":"Week 3 of 3";
  const lines=[
    {icon:"◈", color:T.purpleL, text:"73% habits kept — strongest week since you started the challenge."},
    {icon:"◈", color:T.green,   text:"Rank #5 held all week. 2,000 steps separates you from #4 this month."},
    {icon:"◈", color:T.orange,  text:"Evening routines slipped most. Protect those going into Week 2."},
  ];
  return (
    <div style={{
      ...fd(40),margin:"16px 16px 0",
      background:"linear-gradient(180deg,rgba(155,127,232,.20) 0%,rgba(124,92,232,.04) 100%)",
      border:".5px solid rgba(155,127,232,.18)",borderRadius:20,
      boxShadow:"0 4px 24px rgba(0,0,0,.50),0 1px 0 rgba(242,238,255,.05) inset",
    }}>
      <div style={{padding:"13px 16px 14px"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{
            width:28,height:28,borderRadius:8,flexShrink:0,
            background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 4px 12px rgba(124,92,232,.40)",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2z"/></svg>
          </div>
          <p style={{fontSize:9,fontWeight:700,color:T.purple,letterSpacing:".12em",textTransform:"uppercase" as const}}>{week} · AI Summary</p>
        </div>
        {/* 3 scannable lines */}
        <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
          {lines.map(({icon,color,text},i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:9}}>
              <span style={{fontSize:8,color,marginTop:3,flexShrink:0}}>{icon}</span>
              <p style={{fontSize:12,fontWeight:400,color:T.t2,lineHeight:1.5,margin:0}}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepsCard({ts,setTs,setShowLog,steps,stepsP,fd}:{
  ts:Tab;setTs:(t:Tab)=>void;setShowLog:(b:boolean)=>void;
  steps:number;stepsP:number;fd:(d:number)=>React.CSSProperties;
}) {
  const wrap=(accent:string,children:React.ReactNode)=>(
    <div style={{
      ...fd(250),margin:"0 16px 12px",
      background:`linear-gradient(180deg,${accent}1E 0%,${accent}05 100%)`,
      border:`.5px solid ${accent}28`,borderRadius:22,overflow:"hidden",
      boxShadow:"0 8px 40px rgba(0,0,0,.60),0 1px 0 rgba(255,255,255,.05) inset",
    }}>{children}</div>
  );

  const Ladder=({rows,accent,moved=false}:{rows:{rank:number;name:string;s:number;you:boolean}[];accent:string;moved?:boolean})=>(
    <div style={{display:"flex",flexDirection:"column" as const,gap:3}}>
      {rows.map(({rank,name,s,you})=>(
        <div key={rank} style={{
          display:"flex",alignItems:"center",gap:9,
          padding:you?"9px 12px":"5px 12px",borderRadius:12,
          background:you?`${accent}12`:"transparent",
          border:you?`.5px solid ${accent}28`:"none",
        }}>
          <span style={{fontSize:10,fontWeight:700,color:you?accent:T.t4,width:18,textAlign:"center" as const,flexShrink:0}}>#{rank}</span>
          <span style={{fontSize:11,fontWeight:you?700:400,color:you?T.t1:T.t3,width:42,flexShrink:0}}>{name}</span>
          <div style={{flex:1,height:3,background:"rgba(242,238,255,.07)",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:99,width:`${(s/11200)*100}%`,
              background:you?`linear-gradient(90deg,${accent},${accent}BB)`:"rgba(242,238,255,.14)"}}/>
          </div>
          <span style={{fontSize:10,fontWeight:you?700:400,color:you?accent:T.t3,width:34,textAlign:"right" as const,flexShrink:0}}>{(s/1000).toFixed(1)}k</span>
          {you&&moved&&<div style={{display:"flex",alignItems:"center",gap:1,flexShrink:0,marginLeft:2}}>
            <Ic.Up c={T.green} s={7}/><span style={{fontSize:8,fontWeight:700,color:T.green}}>+1</span>
          </div>}
        </div>
      ))}
    </div>
  );

  if(ts==="not-joined") return wrap(T.purple, <>
    <div style={{
      background:"linear-gradient(180deg,rgba(167,139,245,.28) 0%,rgba(124,92,232,.08) 60%,transparent 100%)",
      padding:"22px 20px 18px",position:"relative" as const,overflow:"hidden",
    }}>
      <div style={{position:"absolute",top:-50,right:-50,width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,245,.14) 0%,transparent 70%)",pointerEvents:"none" as const}}/>
      <p style={{fontSize:9,fontWeight:700,color:T.purpleL,letterSpacing:".14em",textTransform:"uppercase" as const,marginBottom:10}}>Monthly Team Challenge</p>
      <p style={{fontSize:22,fontWeight:800,color:T.t1,letterSpacing:"-.4px",lineHeight:1.2,marginBottom:8}}>Walk together.<br/>Rise together.</p>
      <p style={{fontSize:12,fontWeight:400,color:T.t3,lineHeight:1.65,marginBottom:20}}>Log your daily steps and compete with colleagues. Resets every month.</p>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{display:"flex"}}>
          {["RK","ME","SJ","KP","AR","NR"].map((av,i)=>(
            <div key={i} style={{
              width:26,height:26,borderRadius:"50%",
              background:`linear-gradient(135deg,rgba(167,139,245,${.40+i*.04}),rgba(124,92,232,${.48+i*.03}))`,
              border:`1.5px solid ${T.bg}`,fontSize:7,fontWeight:800,color:"rgba(242,238,255,.92)",
              display:"flex",alignItems:"center",justifyContent:"center",
              marginLeft:i===0?0:-7,position:"relative" as const,zIndex:6-i,
            }}>{av}</div>
          ))}
          <div style={{width:26,height:26,borderRadius:"50%",background:"rgba(242,238,255,.08)",border:`1.5px solid ${T.bg}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:700,color:T.t3,marginLeft:-7}}>+12</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:T.green}}/>
          <span style={{fontSize:11,fontWeight:600,color:T.green}}>18 colleagues already in</span>
        </div>
      </div>
    </div>
    <div style={{padding:"14px 16px 18px"}}>
      <PillBtn label="Join the Challenge"
        icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
        onClick={()=>setTs("morning")}/>
    </div>
  </>);

  if(ts==="morning") return wrap(T.purple, <>
    <div style={{padding:"16px 18px 14px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div>
          <p style={{fontSize:9,fontWeight:700,color:T.t4,letterSpacing:".10em",textTransform:"uppercase" as const,marginBottom:5}}>Yesterday</p>
          <div style={{display:"flex",alignItems:"baseline",gap:5,marginBottom:4}}>
            <span style={{fontSize:30,fontWeight:800,color:T.t1,letterSpacing:"-.04em",lineHeight:1}}>{steps.toLocaleString()}</span>
            <span style={{fontSize:11,fontWeight:600,color:T.t3}}>steps</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <Ic.Up c={T.green} s={8}/><span style={{fontSize:10,fontWeight:600,color:T.green}}>Up 12%</span>
          </div>
        </div>
        <div style={{
          width:50,height:50,borderRadius:14,flexShrink:0,
          background:"rgba(155,127,232,.14)",border:".5px solid rgba(155,127,232,.26)",
          display:"flex",flexDirection:"column" as const,alignItems:"center",justifyContent:"center",
          boxShadow:"0 4px 16px rgba(124,92,232,.20)",
        }}>
          <span style={{fontSize:19,fontWeight:900,color:T.t1,lineHeight:1}}>#5</span>
          <span style={{fontSize:7,fontWeight:700,color:T.t4,letterSpacing:".08em",marginTop:2}}>RANK</span>
        </div>
      </div>
      <Ladder rows={[
        {rank:3,name:"Priya",s:11200,you:false},
        {rank:4,name:"Rahul",s:10240,you:false},
        {rank:5,name:"You",  s:8240, you:true},
        {rank:6,name:"Sam",  s:7100, you:false},
      ]} accent={T.purple}/>
    </div>
    <SEP/>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 18px 13px"}}>
      <span style={{fontSize:11,fontWeight:400,color:T.t3}}>2k steps to pass Rahul for <span style={{color:T.purple,fontWeight:700}}>#4</span></span>
      <button style={{fontSize:11,fontWeight:700,color:T.purple,background:"transparent",border:"none",cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>View →</button>
    </div>
  </>);

  if(ts==="evening") return wrap(T.purple, <>
    <div style={{padding:"20px 18px 18px",textAlign:"center" as const}}>
      <div style={{
        width:50,height:50,borderRadius:15,margin:"0 auto 14px",
        background:"rgba(155,127,232,.12)",border:".5px solid rgba(155,127,232,.22)",
        display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:"0 4px 16px rgba(124,92,232,.20)",
      }}>
        <Ic.Walk c={T.purple} s={22}/>
      </div>
      <p style={{fontSize:16,fontWeight:700,color:T.t1,letterSpacing:"-.2px",lineHeight:1.35,marginBottom:6}}>How many steps today?</p>
      <p style={{fontSize:11,fontWeight:400,color:T.t3,marginBottom:18,lineHeight:1.55}}>12 teammates logged · Rank #5 holding</p>
      <FullBtn label="Log Today's Steps" onClick={()=>setShowLog(true)}/>
    </div>
  </>);

  return wrap(T.green, <>
    <div style={{padding:"16px 18px 14px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
            <div style={{width:17,height:17,borderRadius:"50%",background:T.green,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 2px 8px ${T.green}55`}}>
              <Ic.Check c="#08080F" s={8}/>
            </div>
            <span style={{fontSize:9,fontWeight:700,color:T.green,letterSpacing:".10em",textTransform:"uppercase" as const}}>Logged today</span>
          </div>
          <div style={{display:"flex",alignItems:"baseline",gap:5,marginBottom:4}}>
            <span style={{fontSize:30,fontWeight:800,color:T.t1,letterSpacing:"-.04em",lineHeight:1}}>{steps.toLocaleString()}</span>
            <span style={{fontSize:11,fontWeight:600,color:T.t3}}>steps</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <Ic.Up c={T.green} s={8}/><span style={{fontSize:10,fontWeight:600,color:T.green}}>Above daily goal</span>
          </div>
        </div>
        <div style={{position:"relative",width:52,height:52,flexShrink:0}}>
          <Arc pct={stepsP} size={52} sw={4} color={T.green} bg="rgba(45,212,191,.12)"/>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:11,fontWeight:700,color:T.green}}>{Math.round(stepsP)}%</span>
          </div>
        </div>
      </div>
      <Ladder rows={[
        {rank:3,name:"Priya",s:11200,you:false},
        {rank:4,name:"You",  s:8240, you:true},
        {rank:5,name:"Rahul",s:7900, you:false},
        {rank:6,name:"Sam",  s:7100, you:false},
      ]} accent={T.green} moved/>
    </div>
    <SEP/>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 18px 13px"}}>
      <span style={{fontSize:11,fontWeight:600,color:T.green}}>Moved to rank #4 today</span>
      <button style={{fontSize:11,fontWeight:700,color:T.purple,background:"transparent",border:"none",cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>Details →</button>
    </div>
  </>);
}

function PromisesCard({ts,setTs,fd}:{ts:Tab;setTs:(t:Tab)=>void;fd:(d:number)=>React.CSSProperties}) {
  const DAY=6,TOTAL=21;
  const stage:0|1|2|3=DAY<7?1:DAY<14?2:DAY<19?3:3;
  const pct=Math.round((DAY/TOTAL)*100);
  const isLogged=ts==="logged";

  const base:React.CSSProperties={
    ...fd(180),margin:"0 16px 12px",borderRadius:22,overflow:"hidden",
    boxShadow:"0 8px 40px rgba(0,0,0,.60),0 1px 0 rgba(255,255,255,.05) inset",
  };

  if(ts==="not-joined") return (
    <div style={{...base,
      background:"linear-gradient(180deg,rgba(167,139,245,.22) 0%,rgba(124,92,232,.06) 60%,rgba(74,222,159,.03) 100%)",
      border:".5px solid rgba(155,127,232,.20)",
    }}>
      <div style={{padding:"22px 20px 16px",position:"relative" as const,overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-30,width:160,height:160,borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,245,.12) 0%,transparent 70%)",pointerEvents:"none" as const}}/>
        <p style={{fontSize:9,fontWeight:700,color:T.purpleL,letterSpacing:".14em",textTransform:"uppercase" as const,marginBottom:10}}>21-Day Habit Challenge</p>
        <p style={{fontSize:21,fontWeight:800,color:T.t1,letterSpacing:"-.4px",lineHeight:1.25,marginBottom:8}}>Grow your tree.<br/>Grow yourself.</p>
        <p style={{fontSize:12,fontWeight:400,color:T.t3,lineHeight:1.65,marginBottom:16}}>Pick your daily habits. Every habit you log grows your tree — one branch at a time.</p>
        <div style={{display:"flex",alignItems:"flex-end",gap:0,background:"rgba(0,0,0,.18)",borderRadius:14,padding:"10px 6px 6px",margin:"0 -4px"}}>
          {([
            {s:0 as const,sz:32,l:"Day 1",bright:true},
            {s:1 as const,sz:46,l:"Day 7",bright:false},
            {s:2 as const,sz:60,l:"Day 14",bright:false},
            {s:3 as const,sz:76,l:"Day 21",bright:false},
          ]).map(({s,sz,l,bright},i)=>(
            <div key={s} style={{flex:1,display:"flex",flexDirection:"column" as const,alignItems:"center",gap:4}}>
              <div style={{opacity:bright?1:0.45+i*.12}}><TreeSvg stage={s} size={sz}/></div>
              <span style={{fontSize:8,fontWeight:700,color:bright?T.green:T.t4,letterSpacing:".04em",paddingBottom:4}}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"14px 16px 18px"}}>
        <PillBtn label="Begin Your Challenge"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2s-5 4.5-5 9.5a5 5 0 0010 0C17 7.5 14.5 4 12 2z"/></svg>}
          onClick={()=>setTs("morning")}/>
      </div>
    </div>
  );

  const heroBg=isLogged
    ?"linear-gradient(180deg,rgba(45,212,191,.18) 0%,rgba(124,92,232,.05) 100%)"
    :"linear-gradient(180deg,rgba(167,139,245,.24) 0%,rgba(124,92,232,.06) 100%)";

  return (
    <div style={{...base,
      background:"linear-gradient(180deg,rgba(155,127,232,.18) 0%,rgba(124,92,232,.04) 100%)",
      border:".5px solid rgba(155,127,232,.18)",
    }}>
      <div style={{background:heroBg,padding:"16px 18px 14px",position:"relative" as const,overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",
          background:`radial-gradient(circle,${isLogged?"rgba(45,212,191,.10)":"rgba(167,139,245,.10)"} 0%,transparent 70%)`,
          pointerEvents:"none" as const}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{flex:1,paddingRight:10}}>
            {isLogged?(
              <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(45,212,191,.12)",border:".5px solid rgba(45,212,191,.24)",borderRadius:99,padding:"3px 10px",marginBottom:10}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:T.green}}/>
                <span style={{fontSize:9,fontWeight:700,color:T.green,letterSpacing:".08em",textTransform:"uppercase" as const}}>Day {DAY} complete</span>
              </div>
            ):(
              <p style={{fontSize:9,fontWeight:700,color:T.purpleL,letterSpacing:".12em",textTransform:"uppercase" as const,marginBottom:8}}>My Habits</p>
            )}
            <div style={{display:"flex",alignItems:"baseline",gap:7,marginBottom:10}}>
              <span style={{fontSize:30,fontWeight:800,color:T.t1,letterSpacing:"-.04em",lineHeight:1}}>Day {DAY}</span>
              <span style={{fontSize:12,fontWeight:400,color:T.t3}}>of {TOTAL}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{width:88,height:3,background:"rgba(155,127,232,.14)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:T.grad,borderRadius:99}}/>
              </div>
              <span style={{fontSize:10,fontWeight:700,color:T.purple}}>{pct}%</span>
            </div>
            {ts==="morning"&&<p style={{fontSize:11,fontWeight:400,color:T.t3,fontStyle:"italic"}}>Log tonight to grow your tree</p>}
            {ts==="evening"&&(
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:T.orange}}/>
                <span style={{fontSize:11,fontWeight:400,color:T.t3}}><span style={{color:T.t2,fontWeight:600}}>3 of 5</span> logged today</span>
              </div>
            )}
            {isLogged&&(
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                <span style={{fontSize:11,fontWeight:600,color:T.green}}>All 5 habits kept today</span>
              </div>
            )}
          </div>
          <div style={{flexShrink:0}}><TreeSvg stage={stage} size={72}/></div>
        </div>
      </div>

      {ts==="evening"&&(<>
        <SEP/>
        <div style={{padding:"11px 18px 13px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:10,fontWeight:400,color:T.t3}}>Today's progress</span>
            <button style={{fontSize:11,fontWeight:700,color:T.purple,background:"transparent",border:"none",cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>Log habits →</button>
          </div>
          <div style={{display:"flex",gap:4}}>
            {SEL.map((_,i)=>(
              <div key={i} style={{flex:1,height:4,borderRadius:99,background:i<3?"linear-gradient(90deg,#A78BF5,#7C5CE8)":"rgba(242,238,255,.09)"}}/>
            ))}
          </div>
        </div>
      </>)}

      {isLogged&&(<>
        <SEP/>
        <div style={{padding:"11px 18px 13px",display:"flex",flexWrap:"wrap" as const,gap:5}}>
          {SEL.map(id=>{
            const h=HABITS.find(x=>x.id===id)!;
            return (
              <div key={id} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:99,background:"rgba(45,212,191,.10)",border:".5px solid rgba(45,212,191,.22)"}}>
                <span style={{fontSize:10}}>{h.emoji}</span>
                <span style={{fontSize:10,fontWeight:600,color:T.green}}>{h.label}</span>
              </div>
            );
          })}
        </div>
      </>)}

      <SEP/>
      <div style={{display:"flex",alignItems:"center",gap:7,padding:"10px 18px 13px"}}>
        <Ic.Flame c={T.orange} s={12}/>
        <span style={{fontSize:11,fontWeight:400,color:T.t2}}>
          Showing up for <span style={{color:T.orange,fontWeight:700}}>6 days</span> in a row
        </span>
        <button style={{marginLeft:"auto",fontSize:11,fontWeight:700,color:T.purple,background:"transparent",border:"none",cursor:"pointer",fontFamily:"'Syne',sans-serif",flexShrink:0}}>Open →</button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [vis,     setVis]     = useState(false);
  const [ts,      setTs]      = useState<Tab>("not-joined");
  const [showLog, setShowLog] = useState(false);
  const [logVal,  setLogVal]  = useState("");

  useEffect(()=>{const t=setTimeout(()=>setVis(true),50);return()=>clearTimeout(t);},[]);

  const steps  = useCount(8240, 300, 900);
  const stepsP = usePct(ts==="logged"?82:0, 200, 1000);
  const tod    = ts==="morning"?"Good morning":"Good evening";

  const fd=(d:number):React.CSSProperties=>({
    opacity:vis?1:0,
    transform:vis?"none":"translateY(12px)",
    transition:`opacity .45s ease ${d}ms,transform .55s cubic-bezier(.22,1,.36,1) ${d}ms`,
  });

  const padPress=(k:string)=>{
    if(k==="⌫") setLogVal(v=>v.slice(0,-1));
    else if(logVal.length<6) setLogVal(v=>v+k);
  };
  const confirmLog=()=>{
    if(!logVal) return;
    setTs("logged"); setShowLog(false); setLogVal("");
  };

  const TABS:{key:Tab;label:string}[]=[
    {key:"not-joined",label:"⊕ New"},
    {key:"morning",   label:"☀ Morning"},
    {key:"evening",   label:"◑ Evening"},
    {key:"logged",    label:"✓ Logged"},
  ];

  return (<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      html,body{background:${T.bg};margin:0;}
      @keyframes notif{0%,100%{opacity:1}50%{opacity:.15}}
      @keyframes slideUp{from{transform:translateX(-50%) translateY(100%)}to{transform:translateX(-50%) translateY(0)}}
      .page{min-height:100vh;max-width:390px;margin:0 auto;background:${T.bg};font-family:'Syne',-apple-system,sans-serif;color:${T.t1};-webkit-font-smoothing:antialiased;padding-bottom:56px;}
      .hdr{display:flex;align-items:center;justify-content:space-between;padding:20px 20px 14px;background:rgba(8,8,15,.96);backdrop-filter:blur(32px);-webkit-backdrop-filter:blur(32px);position:sticky;top:0;z-index:20;border-bottom:.5px solid rgba(242,238,255,.06);}
      .demo{display:flex;gap:5px;padding:14px 16px 0;overflow-x:auto;scrollbar-width:none;}
      .demo::-webkit-scrollbar{display:none;}
      .dtab{flex-shrink:0;padding:5px 13px;border-radius:99px;border:.5px solid rgba(242,238,255,.11);cursor:pointer;font-size:10px;font-weight:700;font-family:'Syne',sans-serif;transition:all .18s;letter-spacing:.02em;}
      .overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:40;backdrop-filter:blur(10px);}
      .sheet{position:fixed;bottom:0;left:50%;width:100%;max-width:390px;background:#0E0C18;border-radius:26px 26px 0 0;border-top:.5px solid rgba(155,127,232,.22);box-shadow:0 -16px 60px rgba(0,0,0,.80);z-index:50;animation:slideUp .3s cubic-bezier(.22,1,.36,1);}
      .kbtn{padding:15px 0;border-radius:13px;border:.5px solid rgba(242,238,255,.07);background:rgba(242,238,255,.05);cursor:pointer;font-size:18px;font-weight:600;color:${T.t1};font-family:'Syne',sans-serif;transition:background .12s,transform .1s;}
      .kbtn:active{background:rgba(155,127,232,.20);transform:scale(.95);}
      .sec{font-size:9px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:${T.t4};padding:18px 20px 8px;}
    `}</style>

    {showLog&&(<>
      <div className="overlay" onClick={()=>setShowLog(false)}/>
      <div className="sheet">
        <div style={{width:34,height:4,borderRadius:99,background:"rgba(242,238,255,.18)",margin:"14px auto 0"}}/>
        <div style={{padding:"20px 20px 6px",textAlign:"center" as const}}>
          <p style={{fontSize:9,fontWeight:700,color:T.t4,letterSpacing:".13em",textTransform:"uppercase" as const,marginBottom:14}}>Today's steps</p>
          <p style={{fontSize:48,fontWeight:800,color:logVal?T.t1:"rgba(242,238,255,.14)",letterSpacing:"-.05em",lineHeight:1,minHeight:56}}>
            {logVal?parseInt(logVal).toLocaleString():"—"}
          </p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,padding:"16px 16px 6px"}}>
          {["1","2","3","4","5","6","7","8","9","0","000","⌫"].map(k=>(
            <button key={k} className="kbtn" style={{fontSize:k==="000"?13:18}} onClick={()=>padPress(k)}>{k}</button>
          ))}
        </div>
        <div style={{padding:"10px 16px 32px"}}>
          <FullBtn label={logVal?`Save ${parseInt(logVal).toLocaleString()} steps`:"Enter your steps above"} onClick={confirmLog} disabled={!logVal}/>
        </div>
      </div>
    </>)}

    <div className="page">
      <div className="demo">
        {TABS.map(({key,label})=>(
          <button key={key} className="dtab" onClick={()=>setTs(key)}
            style={{background:ts===key?T.purple:"transparent",color:ts===key?"#08080F":T.t3,
              border:ts===key?"none":".5px solid rgba(242,238,255,.11)"}}>
            {label}
          </button>
        ))}
      </div>

      <div className="hdr" style={fd(0)}>
        <div>
          <p style={{fontSize:11,fontWeight:600,color:T.t3,marginBottom:3,letterSpacing:".01em"}}>{ts==="not-joined"?"Welcome back":tod}</p>
          <h1 style={{fontSize:23,fontWeight:800,color:T.t1,letterSpacing:"-.4px",lineHeight:1.1}}>Alex</h1>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button style={{width:36,height:36,borderRadius:11,background:"rgba(242,238,255,.06)",border:".5px solid rgba(242,238,255,.09)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative" as const}}>
            <Ic.Bell c={T.t3} s={16}/>
            <span style={{position:"absolute",top:8,right:8,width:6,height:6,borderRadius:"50%",background:T.rose,border:`1.5px solid ${T.bg}`,animation:"notif 2.2s ease-in-out infinite"}}/>
          </button>
          <div style={{width:36,height:36,borderRadius:11,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",boxShadow:"0 4px 16px rgba(124,92,232,.40)",letterSpacing:".02em"}}>AK</div>
        </div>
      </div>

      {ts!=="not-joined" && <AiInsightCard fd={fd}/>}

      <p className="sec" style={fd(130)}>{ts==="not-joined"?"Daily Habits":"My Habits"}</p>
      <PromisesCard ts={ts} setTs={setTs} fd={fd}/>

      <p className="sec" style={fd(250)}>{ts==="not-joined"?"Monthly Steps Challenge":"Monthly Team Challenge"}</p>
      <StepsCard ts={ts} setTs={setTs} setShowLog={setShowLog} steps={steps} stepsP={stepsP} fd={fd}/>

      <p className="sec" style={fd(390)}>Wellbeing</p>
      <div style={{display:"flex",flexDirection:"column" as const,gap:8,margin:"0 16px",...fd(420)}}>
        {[
          {
            color:T.rose, bg:"rgba(232,122,138,.08)", border:"rgba(232,122,138,.18)",
            Icon:<Ic.Body c={T.rose} s={16}/>, label:"Body Metrics",
            val:  ts==="not-joined" ? "—"  : "74",
            unit: ts==="not-joined" ? ""   : "score",
            sub:  ts==="not-joined"
              ? <span style={{color:T.t3}}>Track your body composition</span>
              : <>Next check-in in <span style={{color:T.rose,fontWeight:700}}>4 days</span></>,
          },
          {
            color:T.teal, bg:"rgba(56,189,248,.08)", border:"rgba(56,189,248,.18)",
            Icon:<Ic.Breath c={T.teal} s={16}/>, label:"Mindfulness",
            val:  ts==="not-joined" ? "—"  : "4",
            unit: ts==="not-joined" ? ""   : "streak",
            sub:  ts==="not-joined"
              ? <span style={{color:T.t3}}>Start your first session</span>
              : <><span style={{color:T.teal,fontWeight:700}}>2 sessions</span> this week</>,
          },
        ].map(({color,bg,border,Icon,label,val,unit,sub})=>(
          <button key={label}
            onMouseDown={e=>e.currentTarget.style.transform="scale(.98)"}
            onMouseUp={e=>e.currentTarget.style.transform="none"}
            onMouseLeave={e=>e.currentTarget.style.transform="none"}
            style={{display:"flex",alignItems:"center",gap:14,background:bg,border:`.5px solid ${border}`,borderRadius:18,padding:"14px 16px",cursor:"pointer",textAlign:"left" as const,width:"100%",boxShadow:"0 4px 20px rgba(0,0,0,.40),0 1px 0 rgba(255,255,255,.04) inset",fontFamily:"'Syne',sans-serif",transition:"transform .15s"}}>
            <div style={{width:38,height:38,borderRadius:11,background:`${color}18`,border:`.5px solid ${color}28`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 2px 10px ${color}18`}}>{Icon}</div>
            <div style={{flex:1}}>
              <p style={{fontSize:14,fontWeight:700,color:T.t1,marginBottom:3}}>{label}</p>
              <p style={{fontSize:11,fontWeight:400,color:T.t3,lineHeight:1.4}}>{sub}</p>
            </div>
            <div style={{textAlign:"right" as const,flexShrink:0,marginRight:4}}>
              <p style={{fontSize:22,fontWeight:800,color,letterSpacing:"-.03em",lineHeight:1}}>{val}</p>
              <p style={{fontSize:8,fontWeight:700,color:T.t4,letterSpacing:".09em",textTransform:"uppercase" as const,marginTop:2}}>{unit}</p>
            </div>
            <Ic.ChevR c={T.t4} s={11}/>
          </button>
        ))}
      </div>
    </div>
  </>);
}