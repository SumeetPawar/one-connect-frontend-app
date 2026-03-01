"use client";
import { useState } from "react";

interface MetricGuide {
  key: string;
  label: string;
  abbr: string;
  category: "Foundation" | "Composition" | "Metabolic" | "Cellular";
  color: string;
  tagline: string;
  what: string;
  why: string;
  how: string;
  idealMale: string;
  idealFemale: string;
  unit: string;
  lowMeans: string;
  highMeans: string;
  tip: string;
}

const GUIDES: MetricGuide[] = [
  {
    key: "weight", label: "Body Weight", abbr: "kg",
    category: "Foundation", color: "#5AC8FA",
    tagline: "What you weigh — but not the whole picture.",
    what: "This is the total weight of everything inside you — bones, muscle, fat, water, and organs. Think of it as a starting number, not a final score.",
    why: "Two people can weigh exactly the same but look and feel completely different. One could be mostly muscle, the other mostly fat. Weight alone can't tell you which — that's why you need fat % and muscle data too.",
    how: "Weigh yourself every morning after using the toilet, before eating anything. Use the same scale each time. Look at your average over a whole week — your weight can go up or down 1–3 kg in a single day just from water and food.",
    idealMale: "BMI 18.5–22.9 for your height",
    idealFemale: "BMI 18.5–22.9 for your height",
    unit: "kg",
    lowMeans: "You may not be eating enough, or you might be losing muscle — check if you're getting enough protein and total calories each day",
    highMeans: "Higher weight can put strain on your heart and raise diabetes risk — but check your fat % first for the real picture",
    tip: "Your weight changes by 1–3 kg every single day because of water, meals, and hormones — this is completely normal. Don't judge yourself on one day's number. Look at the 7-day trend instead.",
  },
  {
    key: "bmi", label: "BMI", abbr: "index",
    category: "Foundation", color: "#FFD60A",
    tagline: "A rough size check — not a health verdict.",
    what: "BMI is a simple maths formula: weight (kg) divided by height (m) squared. It was originally created to study large groups of people, not to assess individuals.",
    why: "The big problem with BMI is that it can't tell the difference between fat and muscle. A fit, muscular person and a completely inactive person of the same height and weight get the same BMI number — which makes no sense for individual health.",
    how: "We calculate it automatically from your weight and height. You don't need to do anything extra.",
    idealMale: "18.5–22.9 (Asian Pacific guideline)",
    idealFemale: "18.5–22.9 (Asian Pacific guideline)",
    unit: "",
    lowMeans: "You may be underweight — this can mean you're not eating enough or that you're losing muscle or bone strength",
    highMeans: "Don't panic — check your body fat % first. If you exercise regularly, a high BMI often just means you have more muscle, not more fat",
    tip: "If you work out regularly, don't stress about a high BMI number. Your body fat % is a much more honest and useful number for understanding your actual health.",
  },
  {
    key: "fat", label: "Body Fat %", abbr: "%",
    category: "Composition", color: "#FF453A",
    tagline: "The most important number for your health.",
    what: "This tells you what percentage of your body is actually fat. Some fat is essential — your body needs it to protect organs and make hormones. The rest is stored energy from food you've eaten.",
    why: "Too much fat, especially around your belly and organs, makes it harder for your body to manage blood sugar, raises your heart disease risk, and causes low-level inflammation throughout your body. This number matters far more than just your weight on a scale.",
    how: "Your smart scale measures this by sending a tiny, completely painless electrical signal through your body (this is called BIA). For the most accurate reading: measure first thing in the morning, after using the toilet, before eating, and try to drink a similar amount of water each day.",
    idealMale: "18–24% (age 30–39) · 19–27% (40–49) · 20–28% (50–59)",
    idealFemale: "25–31% (age 30–39) · 26–34% (40–49) · 27–35% (50–59)",
    unit: "%",
    lowMeans: "Very athletic build — but if it drops too low (below 8% for men, 15% for women), it can disrupt your hormones and energy levels",
    highMeans: "Higher health risk — the most effective fix is adding strength training and improving your diet. This is very achievable",
    tip: "How much water you drank before measuring changes this reading. For consistent results, always measure at the same time of day — ideally first thing in the morning before breakfast.",
  },
  {
    key: "visceral", label: "Visceral Fat", abbr: "lvl",
    category: "Composition", color: "#FF6B35",
    tagline: "The hidden fat around your organs.",
    what: "This is fat stored deep inside your belly, wrapped around organs like your liver, stomach, and intestines. It's rated on a scale from 1 to 30. You can't see or feel it from outside your body.",
    why: "This type of fat is the most dangerous kind because it doesn't just sit there — it actively releases harmful chemicals into your blood that cause heart disease, type 2 diabetes, poor memory, and hormonal problems.",
    how: "Your smart scale estimates this during your regular BIA measurement. Levels 1–9 are healthy. If you're at level 10 or above, it's worth taking action — starting with daily walking and cutting back on sugar and white rice.",
    idealMale: "Level 1–12 (under 40) · 1–10 (40–49) · 1–9 (50+)",
    idealFemale: "Level 1–9 (under 40) · 1–8 (40–49) · 1–7 (50+)",
    unit: "lvl",
    lowMeans: "Great — your organ fat is in a healthy range. Keep doing what you're doing",
    highMeans: "This is a health warning sign. Daily walks and eating less sugar and refined carbs (white bread, rice, sweets) will help bring this down",
    tip: "Good news: this fat shrinks faster than the fat you can pinch on your stomach. Just 30 minutes of brisk walking every day can produce a noticeable drop in 6–8 weeks — even before you see changes on the scale.",
  },
  {
    key: "muscle", label: "Muscle Mass", abbr: "kg",
    category: "Composition", color: "#30D158",
    tagline: "Your body's engine — and your best health investment.",
    what: "This is the total weight of all the muscles in your body. Muscle isn't just for looking fit — it's what keeps your body running efficiently and strongly as you age.",
    why: "More muscle means your body burns more calories even while you sleep, your blood sugar stays more stable, your bones become stronger, and you stay active and independent as you get older. It's the most overlooked health metric.",
    how: "Your smart scale estimates this from the resistance your body gives to the BIA signal. Drink a consistent amount of water before measuring each time for more accurate tracking.",
    idealMale: "SMI ≥ 8.87 kg/m² (adjusted for height) · Active: +6–10%",
    idealFemale: "SMI ≥ 6.42 kg/m² (adjusted for height) · Active: +6–10%",
    unit: "kg",
    lowMeans: "Low muscle mass increases your risk of weakness and health problems as you age — start adding strength training and eat more protein",
    highMeans: "Excellent — strong muscles are one of the best signs of long-term good health and longevity",
    tip: "Building muscle is slow — expect about 0.5–1 kg per month if you're training and eating well. Aim for 1.6–2.2g of protein per kg of your body weight each day. Even 2 gym sessions a week makes a real difference.",
  },
  {
    key: "water", label: "Hydration", abbr: "%",
    category: "Cellular", color: "#0A84FF",
    tagline: "How well-hydrated your body is right now.",
    what: "This shows how much of your body weight is water — both inside your cells and in your blood and tissues. About 60% of your body is water, and it plays a role in literally everything your body does.",
    why: "Being just 2% dehydrated noticeably affects your memory, focus, physical energy, and even your heart rate. Every single process in your body — digesting food, removing waste, regulating temperature — needs water to work properly.",
    how: "Your smart scale measures this through the BIA signal during your regular scan. For the most consistent results, measure at the same time each morning before eating.",
    idealMale: "55–65% (sedentary) · 57–67% (active) · 59–69% (athlete)",
    idealFemale: "50–60% (sedentary) · 52–62% (active) · 54–64% (athlete)",
    unit: "%",
    lowMeans: "You're dehydrated — drink more water through the day and consider adding electrolytes (like a pinch of salt, coconut water, or an electrolyte drink)",
    highMeans: "Well hydrated — great. If it's consistently very high (above 68%), check with a doctor as it can sometimes indicate fluid retention",
    tip: "In a hot climate, aim for the higher end of your range. Plain water is good, but electrolyte drinks or coconut water help your body hold onto hydration better — especially after sweating.",
  },
  {
    key: "bmr", label: "Resting Burn", abbr: "kcal",
    category: "Metabolic", color: "#BF5AF2",
    tagline: "Calories your body burns just to stay alive.",
    what: "BMR (Basal Metabolic Rate) is the number of calories your body burns every day just to keep you alive — breathing, pumping blood, keeping you warm, and repairing cells — without any movement at all.",
    why: "This is the most important number for understanding how much you should eat. If you consistently eat less than your BMR, your body starts breaking down muscle for energy and slows your metabolism — which is exactly why crash diets cause you to regain weight so quickly afterwards.",
    how: "We calculate this from your weight, height, age, and sex using the Mifflin-St Jeor formula — the most clinically validated method. Active people have a higher range because muscle burns more at rest.",
    idealMale: "1,600–2,000 kcal (sedentary) · higher with more activity",
    idealFemale: "1,400–1,800 kcal (sedentary) · higher with more activity",
    unit: "kcal",
    lowMeans: "You may have low muscle mass or have been eating very little for a long time — gradually increasing food and exercise will help rebuild this",
    highMeans: "A higher BMR means more muscle — your body is an efficient calorie burner. This is a great sign",
    tip: "Your BMR covers about 60–70% of all the calories you burn in a day. Multiply it by 1.2 if you're mostly sitting, or up to 1.9 if you train hard daily — that gives you your actual daily calorie need.",
  },
  {
    key: "protein", label: "Protein %", abbr: "%",
    category: "Cellular", color: "#32ADE6",
    tagline: "How much of your body is made of protein.",
    what: "Protein makes up your muscles, organs, skin, hair, enzymes, and hormones. This number shows what percentage of your total body is protein.",
    why: "Eating enough protein helps you keep your muscle when losing fat, recover faster after exercise, fight off illness better, and keep your blood sugar steady. When this number is low, it's usually the first sign that you're not eating enough protein in your daily diet.",
    how: "Your smart scale works this out from your muscle mass and overall body composition during the BIA measurement.",
    idealMale: "17–20% (under 45) · 18–21% (45–60) · 19–22% (60+)",
    idealFemale: "16–19% (under 45) · 17–20% (45–60) · 18–21% (60+)",
    unit: "%",
    lowMeans: "You're probably not eating enough protein — try adding more dal, eggs, chicken, paneer, or Greek yogurt to your daily meals",
    highMeans: "Excellent — this means you have good muscle and low fat, which is exactly the combination you want",
    tip: "Many Indian diets are lower in protein than people realise. Try tracking your protein grams for just one week — most people are surprised how far below target they are. Dal, eggs, paneer, chicken, and curd are the easiest sources.",
  },
  {
    key: "metage", label: "Metabolic Age", abbr: "yrs",
    category: "Metabolic", color: "#FF9F0A",
    tagline: "How old your body acts — not how old you are.",
    what: "This compares how many calories your body burns at rest to what's typical for people your actual age. If your metabolic age is lower than your real age, your body is working more efficiently than average — like a younger person's body.",
    why: "A younger metabolic age means you have better muscle, less fat, and a healthier metabolism — all of which are linked to living longer and feeling better day to day. Even reducing it by 5 years makes a real difference to your health.",
    how: "We compare your BMR (how many calories you burn at rest) to average values for people your age and sex, then convert that difference into an age number.",
    idealMale: "Same as or up to 10 years below your actual age",
    idealFemale: "Same as or up to 10 years below your actual age",
    unit: "yrs",
    lowMeans: "Your body is performing younger than your years — this is a very good sign for your long-term health",
    highMeans: "Your metabolism is running older than your age — building muscle and losing fat will bring this number down, and it's very achievable",
    tip: "Strength training brings your metabolic age down faster than cardio does. Just two consistent gym sessions a week can produce visible improvements in 8–12 weeks.",
  },
  {
    key: "bone", label: "Bone Mass", abbr: "kg",
    category: "Foundation", color: "#98989D",
    tagline: "How strong and dense your bones are.",
    what: "This is an estimate of how much your bones weigh — specifically the minerals that make them dense and strong. Heavier, denser bones are better and less likely to break.",
    why: "Bone density peaks around age 30 and slowly declines after that. Weak bones break easily, especially as you get older. Osteoporosis (brittle bone disease) is one of the biggest causes of disability and loss of independence in later life.",
    how: "Your smart scale estimates this from your BIA reading and body weight. For a precise clinical measurement, a DEXA scan at a hospital is the gold standard.",
    idealMale: "3.0–3.8 kg (under 40) · 2.8–3.6 kg (40–59) · 2.5–3.2 kg (60+)",
    idealFemale: "2.0–2.8 kg (under 40) · 1.8–2.5 kg (40–59) · 1.5–2.2 kg (60+)",
    unit: "kg",
    lowMeans: "Your bones may need more support — eat more calcium (dairy, green vegetables), get more sunlight for vitamin D, and do weight-bearing exercise like walking or weight training",
    highMeans: "Dense, strong bones — keep it up with regular exercise and good nutrition",
    tip: "Vitamin D is essential for your body to absorb calcium. Without it, even eating lots of calcium won't help your bones much. Getting 20 minutes of morning sunlight daily is one of the simplest things you can do. In India, vitamin D deficiency is extremely common.",
  },
];

const CAT_COLOR: Record<string, string> = {
  Foundation: "#98989D",
  Composition: "#FF453A",
  Metabolic:   "#BF5AF2",
  Cellular:    "#0A84FF",
};

const CATEGORIES = ["Foundation", "Composition", "Metabolic", "Cellular"] as const;

// ── Personalised range resolver ──────────────────────────────
function resolveIdealRange(
  key: string,
  gender: "male" | "female",
  ranges: Record<string, [number, number]>
): string | null {
  const r = ranges[key];
  if (!r) return null;
  const isMale = gender === "male";

  const fmt = (n: number) => Number.isInteger(n) ? String(n) : n.toFixed(1);

  switch (key) {
    case "weight":   return `${fmt(r[0])} – ${fmt(r[1])} kg`;
    case "bmi":      return `${fmt(r[0])} – ${fmt(r[1])}`;
    case "fat":      return `${fmt(r[0])} – ${fmt(r[1])}%`;
    case "visceral": return `Level ${fmt(r[0])} – ${fmt(r[1])}`;
    case "muscle":   return `${fmt(r[0])} – ${fmt(r[1])} kg`;
    case "water":    return `${fmt(r[0])} – ${fmt(r[1])}%`;
    case "bmr":      return `${Math.round(r[0])} – ${Math.round(r[1])} kcal`;
    case "protein":  return `${fmt(r[0])} – ${fmt(r[1])}%`;
    case "metage":   return `${fmt(r[0])} – ${fmt(r[1])} yrs`;
    case "bone":     return `${fmt(r[0])} – ${fmt(r[1])} kg`;
    default:         return null;
  }
}

interface Props {
  onClose?: () => void;
  ranges?: Record<string, [number, number]>;
  gender?: "male" | "female";
}

export default function BodyMetricsGuide({ onClose, ranges, gender }: Props) {
  const [selected, setSelected]             = useState<MetricGuide | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory ? GUIDES.filter(g => g.category === activeCategory) : GUIDES;
  const isPersonalised = !!(ranges && gender);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap');
        .bmg *, .bmg *::before, .bmg *::after { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        .bmg { font-family: 'DM Sans', sans-serif; }
        .bmg-row { transition: background 0.10s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
        .bmg-row:active { background: rgba(255,255,255,0.03) !important; }
        .bmg-pill { -webkit-tap-highlight-color: transparent; transition: background 0.12s, color 0.12s, border-color 0.12s; cursor: pointer; }
        .bmg-sheet { animation: sheet-rise 0.44s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes sheet-rise { from { transform: translateX(-50%) translateY(100%); } to { transform: translateX(-50%) translateY(0); } }
        .bmg-scroll { scrollbar-width: none; }
        .bmg-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="bmg" style={{
        position: "fixed", inset: 0, zIndex: 400,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          maxWidth: 430, margin: "0 auto",
          background: "#0D0D0F",
          display: "flex", flexDirection: "column",
          overflowY: "hidden",
        }}>

          {/* ── HEADER ── */}
          <div style={{ flexShrink: 0, padding: "52px 22px 0", background: "#0D0D0F" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", color: "rgba(255,255,255,0.20)", textTransform: "uppercase", marginBottom: 7 }}>Health Guide</div>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.1 }}>
                  <span style={{ color: "rgba(255,255,255,0.92)" }}>Understanding</span>
                  <br/>
                  <span style={{ color: "#BF5AF2" }}>Your Metrics</span>
                </div>
                {isPersonalised && (
                  <div style={{
                    marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5,
                    background: "rgba(191,90,242,0.08)", border: "1px solid rgba(191,90,242,0.18)",
                    borderRadius: 20, padding: "3px 10px",
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#BF5AF2" }}/>
                    <span style={{ fontSize: 10, color: "rgba(191,90,242,0.80)", fontWeight: 500, letterSpacing: "0.03em" }}>
                      Ranges personalised to you
                    </span>
                  </div>
                )}
              </div>
              {onClose && (
                <button onClick={onClose} style={{
                  width: 32, height: 32, borderRadius: "50%", marginTop: 4,
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, cursor: "pointer",
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 1l8 8M9 1L1 9" stroke="rgba(255,255,255,0.45)" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Filter pills */}
            <div className="bmg-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 16, marginRight: -22, paddingRight: 22 }}>
              {([null, ...CATEGORIES] as (string | null)[]).map(cat => {
                const active = activeCategory === cat;
                return (
                  <button key={cat ?? "all"} className="bmg-pill" onClick={() => setActiveCategory(cat)} style={{
                    height: 30, padding: "0 13px", borderRadius: 100, flexShrink: 0,
                    border: active ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.07)",
                    background: active ? "rgba(255,255,255,0.09)" : "transparent",
                    color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.28)",
                    fontSize: 11.5, fontWeight: active ? 600 : 400,
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex", alignItems: "center", gap: 6,
                    letterSpacing: "-0.01em",
                  }}>
                    {cat && (
                      <div style={{
                        width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                        background: active ? CAT_COLOR[cat] : "rgba(255,255,255,0.18)",
                        transition: "background 0.12s",
                      }}/>
                    )}
                    {cat ?? "All metrics"}
                  </button>
                );
              })}
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginLeft: -22, marginRight: -22 }}/>
          </div>

          {/* ── LIST ── */}
          <div className="bmg-scroll" style={{ overflowY: "auto", flex: 1 }}>
            <div style={{ padding: "10px 22px 4px" }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.16)", letterSpacing: "0.04em" }}>
                {filtered.length} metrics{activeCategory ? ` · ${activeCategory}` : ""}
              </span>
            </div>

            {filtered.map((g, i) => {
              const personalRange = isPersonalised ? resolveIdealRange(g.key, gender!, ranges!) : null;
              return (
                <button key={g.key} className="bmg-row" onClick={() => setSelected(g)} style={{
                  width: "100%", display: "flex", alignItems: "center",
                  padding: "15px 22px",
                  background: "transparent", border: "none",
                  borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  textAlign: "left", gap: 16,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {/* Unit anchor */}
                  <div style={{ width: 54, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                    <div style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: g.abbr.length > 3 ? 14 : g.abbr.length === 3 ? 18 : 24,
                      fontWeight: 400, color: g.color, lineHeight: 1, letterSpacing: "-0.02em",
                    }}>{g.abbr}</div>
                    <div style={{ width: 16, height: 1.5, borderRadius: 100, background: g.color, opacity: 0.30 }}/>
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.025em", color: "rgba(255,255,255,0.88)", marginBottom: 3, lineHeight: 1.15 }}>{g.label}</div>
                    {personalRange ? (
                      <div style={{ fontSize: 11.5, fontWeight: 500, color: g.color, opacity: 0.75, letterSpacing: "-0.01em" }}>
                        Ideal: {personalRange}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.26)", letterSpacing: "-0.01em", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {g.tagline}
                      </div>
                    )}
                  </div>

                  {/* Meta */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5.5 3.5L9 7l-3.5 3.5" stroke="rgba(255,255,255,0.16)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: CAT_COLOR[g.category], opacity: 0.55 }}/>
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", letterSpacing: "0.05em" }}>{g.category}</span>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Disclaimer */}
            <div style={{ padding: "24px 22px 52px", borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: 8 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 300, color: "rgba(255,255,255,0.16)", lineHeight: 1.75, letterSpacing: "-0.01em" }}>
                All values are estimates from your smart scale's BIA measurement.
                For medical-grade accuracy, ask your doctor about a DEXA scan.
                This is a guide to help you understand your numbers — not medical advice.
              </p>
            </div>
          </div>
        </div>

        {/* ── DETAIL BOTTOM SHEET ── */}
        {selected && (
          <>
            <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, zIndex: 410, background: "rgba(0,0,0,0.45)" }}/>
            <div className="bmg-sheet" style={{
              position: "fixed", bottom: 0, left: "50%",
              transform: "translateX(-50%)",
              width: "100%", maxWidth: 430,
              zIndex: 420,
              background: "#111113",
              borderRadius: "24px 24px 0 0",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              maxHeight: "92vh",
              display: "flex", flexDirection: "column",
            }}>

              {/* Handle */}
              <div onClick={() => setSelected(null)} style={{ display: "flex", justifyContent: "center", padding: "12px 0 0", cursor: "pointer", flexShrink: 0 }}>
                <div style={{ width: 32, height: 3, borderRadius: 100, background: "rgba(255,255,255,0.10)" }}/>
              </div>

              {/* Sheet header */}
              <div style={{ padding: "14px 22px 18px", flexShrink: 0 }}>
                <button onClick={() => setSelected(null)} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "none", border: "none", cursor: "pointer",
                  padding: "0 0 16px 0",
                  color: "rgba(255,255,255,0.22)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12, fontWeight: 400, letterSpacing: "-0.01em",
                  WebkitTapHighlightColor: "transparent",
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  All metrics
                </button>

                <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 6 }}>
                  <div style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: selected.abbr.length > 3 ? 38 : selected.abbr.length === 3 ? 48 : 60,
                    fontWeight: 400, lineHeight: 1,
                    color: selected.color,
                    letterSpacing: "-0.03em", flexShrink: 0,
                  }}>{selected.abbr}</div>
                  <div style={{ paddingBottom: 5 }}>
                    <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.10em", color: `${CAT_COLOR[selected.category]}80`, textTransform: "uppercase", marginBottom: 4 }}>{selected.category}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "rgba(255,255,255,0.90)" }}>{selected.label}</div>
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.34)", letterSpacing: "-0.01em", lineHeight: 1.5, marginBottom: 16 }}>{selected.tagline}</div>
                <div style={{ height: 1, borderRadius: 100, background: `linear-gradient(90deg, ${selected.color}88 0%, transparent 60%)` }}/>
              </div>

              {/* Scrollable content */}
              <div className="bmg-scroll" style={{ overflowY: "auto", flex: 1, padding: "4px 0 64px" }}>

                <Block label="What is it"><Body>{selected.what}</Body></Block>
                <Block label="Why it matters"><Body>{selected.why}</Body></Block>
                <Block label="How it's measured"><Body>{selected.how}</Body></Block>

                <Block label="Ideal ranges">
                  {/* Personalised range banner — shown when profile exists */}
                  {isPersonalised && resolveIdealRange(selected.key, gender!, ranges!) && (
                    <div style={{
                      marginBottom: 10,
                      background: `${selected.color}0D`,
                      border: `1px solid ${selected.color}22`,
                      borderRadius: 12, padding: "10px 14px",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: selected.color, flexShrink: 0 }}/>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", color: selected.color, textTransform: "uppercase", opacity: 0.75, marginBottom: 2 }}>Your personalised range</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.02em" }}>
                          {resolveIdealRange(selected.key, gender!, ranges!)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Full population table — always shown */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {[
                      { label: "Male",   value: selected.idealMale },
                      { label: "Female", value: selected.idealFemale },
                    ].map(row => (
                      <div key={row.label} style={{
                        display: "flex", alignItems: "baseline",
                        padding: "10px 14px", gap: 12,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 11,
                      }}>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase", flexShrink: 0, minWidth: 42 }}>{row.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.68)", letterSpacing: "-0.015em", lineHeight: 1.4 }}>{row.value}</div>
                      </div>
                    ))}
                  </div>
                </Block>

                <Block label="What your number signals">
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {[
                      { label: "Too Low",  text: selected.lowMeans,  color: "#5AC8FA" },
                      { label: "Too High", text: selected.highMeans, color: "#FF453A" },
                    ].map(row => (
                      <div key={row.label} style={{
                        display: "flex", alignItems: "flex-start",
                        padding: "10px 14px", borderRadius: 11, gap: 12,
                        background: `${row.color}07`,
                        border: `1px solid ${row.color}14`,
                      }}>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", color: row.color, textTransform: "uppercase", flexShrink: 0, minWidth: 44, paddingTop: 2, opacity: 0.85 }}>{row.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.46)", letterSpacing: "-0.01em", lineHeight: 1.65 }}>{row.text}</div>
                      </div>
                    ))}
                  </div>
                </Block>

                <div style={{ padding: "0 22px" }}>
                  <div style={{ background: `${selected.color}06`, border: `1px solid ${selected.color}12`, borderRadius: 14, padding: "14px 16px" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: selected.color, textTransform: "uppercase", marginBottom: 8, opacity: 0.75 }}>Tip to remember</div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.46)", lineHeight: 1.78, letterSpacing: "-0.01em" }}>{selected.tip}</p>
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "0 22px 20px" }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.13em", color: "rgba(255,255,255,0.16)", textTransform: "uppercase", marginBottom: 9 }}>{label}</div>
      {children}
    </div>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 300, color: "rgba(255,255,255,0.48)", lineHeight: 1.78, letterSpacing: "-0.01em" }}>{children}</p>
  );
}