"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";


const GUIDES = [
	{
		key: "weight", label: "Body Weight", abbr: "kg",
		category: "Foundation", color: "#5AC8FA",
		tagline: "What you weigh — but not the whole picture.",
		what: "This is the total weight of everything inside you — bones, muscle, fat, water, and organs. Think of it as a starting number, not a final score.",
		why: "Two people can weigh exactly the same but look and feel completely different. One could be mostly muscle, the other mostly fat. Weight alone can't tell you which — that's why you need fat % and muscle data too.",
		how: "Weigh yourself every morning after using the toilet, before eating anything. Use the same scale each time. Look at your average over a whole week — your weight can go up or down 1–3 kg in a single day just from water and food.",
		idealMale: "BMI 18.5–22.9 for your height",
		idealFemale: "BMI 18.5–22.9 for your height",
		source: "WHO / Asia-Pacific BMI guidelines",
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
		source: "WHO Western Pacific Region / IOTF Asia-Pacific BMI guidelines",
		unit: "",
		lowMeans: "You may be underweight — this can mean you're not eating enough or that you're losing muscle or bone strength",
		highMeans: "Don't panic — check your body fat % first. If you exercise regularly, a high BMI often just means you have more muscle, not more fat",
		tip: "If you work out regularly, don't stress about a high BMI number. Your body fat % is a much more honest and useful number for understanding your actual health.",
	},
	{
		key: "fat", label: "Body Fat %", abbr: "fat%",
		category: "Composition", color: "#FF453A",
		tagline: "How much of you is fat — not just weight.",
		what: "Body fat % is the proportion of your weight that is fat tissue. This is the most important number for understanding your health risk.",
		why: "High body fat % increases your risk for diabetes, heart disease, and many other conditions. Lowering fat % (not just weight) is the healthiest way to improve your body.",
		how: "Your smart scale estimates this using bioelectrical impedance analysis (BIA) — a safe, painless current measures how much of you is fat vs. muscle/water.",
		idealMale: "10–19% (age 20–39) · 11–21% (40–59) · 13–24% (60+)",
		idealFemale: "20–28% (age 20–39) · 21–30% (40–59) · 22–33% (60+)",
		source: "American Council on Exercise / Tanita BIA reference data",
		unit: "%",
		lowMeans: "Very low fat % can disrupt hormones and lower immunity — especially for women. Don't aim for zero!",
		highMeans: "High fat % increases risk for diabetes, heart disease, and more. Focus on slow, steady fat loss, not crash diets.",
		tip: "Fat % can fluctuate with hydration. Measure at the same time each day for best accuracy.",
	},
	{
		key: "visceral", label: "Visceral Fat", abbr: "VF",
		category: "Composition", color: "#FF453A",
		tagline: "Fat around your organs — the most dangerous kind.",
		what: "Visceral fat is the fat stored deep inside your belly, wrapped around your organs. It's different from the fat you can pinch under your skin.",
		why: "High visceral fat is strongly linked to diabetes, heart disease, and stroke. Lowering this is the single best thing you can do for your health.",
		how: "Your scale estimates this using BIA. It's not as precise as a CT scan, but it's a useful trend to watch.",
		idealMale: "1–9",
		idealFemale: "1–9",
		source: "Tanita BIA reference data / clinical studies",
		unit: "index",
		lowMeans: "Great — your organ fat is in a healthy range. Keep doing what you're doing",
		highMeans: "This is a health warning sign. Daily walks and eating less sugar and refined carbs (white bread, rice, sweets) will help bring this down",
		tip: "Good news: this fat shrinks faster than the fat you can pinch on your stomach. Just 30 minutes of brisk walking every day can produce a noticeable drop in 6–8 weeks — even before you see changes on the scale.",
	},
	{
		key: "subcutaneous_fat", label: "Subcutaneous Fat %", abbr: "subQ%",
		category: "Composition", color: "#FFB300",
		tagline: "Fat under your skin — the pinchable kind.",
		what: "Subcutaneous fat is the layer of fat stored just beneath your skin. It's the fat you can pinch on your belly, thighs, or arms. Unlike visceral fat, it's less dangerous but still important to monitor.",
		why: "While subcutaneous fat is less harmful than visceral fat, high levels can still increase your risk for metabolic issues and affect your appearance. Tracking this helps you understand where your body stores fat and how your lifestyle changes are working.",
		how: "Your smart scale estimates this using bioelectrical impedance analysis (BIA). It's not as precise as medical imaging, but it gives a useful trend over time.",
		idealMale: "8–18% (age 20–39) · 10–20% (40–59) · 12–22% (60+)",
		idealFemale: "18–28% (age 20–39) · 20–32% (40–59) · 22–34% (60+)",
		source: "Tanita BIA reference data / clinical studies",
		unit: "%",
		lowMeans: "Very low subcutaneous fat can be a sign of undernutrition or excessive dieting. Ensure you're eating enough healthy fats and calories.",
		highMeans: "Higher subcutaneous fat may affect your appearance and can be a sign to review your diet and activity. Focus on gradual, sustainable fat loss.",
		tip: "Subcutaneous fat is usually the last to go when losing weight. Don't get discouraged if it seems stubborn — keep tracking your progress!",
	},
	{
		key: "skeletal", label: "Skeletal Muscle", abbr: "sm%",
		category: "Composition", color: "#34C759",
		tagline: "The muscle that moves you — your functional strength.",
		what: "Skeletal muscle is the muscle attached to your bones that you consciously control — used for every movement from walking to lifting. It's measured as a percentage of your total body weight and is the most functionally important type of muscle for health and longevity.",
		why: "Higher skeletal muscle percentage means better strength, faster metabolism, improved insulin sensitivity, and greater physical independence as you age. It's one of the strongest predictors of long-term health outcomes — people with more skeletal muscle live longer and stay active further into old age.",
		how: "Your smart scale estimates this via BIA by measuring the resistance of muscle tissue to the electrical signal. Note: clinicians typically use Skeletal Muscle Index (SMI in kg/m²) rather than percentage — so if you see different numbers in medical literature, that's why. For consistent scale readings, measure at the same time each day under the same hydration conditions.",
		idealMale: "33–39% (age 20–39) · 31–37% (40–59) · 29–35% (60+)",
		idealFemale: "24–30% (age 20–39) · 23–29% (40–59) · 21–27% (60+)",
		source: "Derived from population BIA studies (Janssen et al., 2000; Tanita reference data) — no single global standard exists for SM%",
		unit: "%",
		lowMeans: "Low skeletal muscle raises your risk of weakness, poor balance, and metabolic issues — prioritise resistance training and ensure you're eating enough protein daily",
		highMeans: "Excellent — a high skeletal muscle percentage is one of the best indicators of overall health, fitness, and healthy ageing",
		tip: "Skeletal muscle percentage can appear to drop even when you're gaining muscle if you're also gaining fat. Track both muscle mass in kg and this percentage together for the clearest picture of your progress.",
	},

	{
		key: "bmr", label: "Resting Metabolism", abbr: "kcal",
		category: "Metabolic", color: "#BF5AF2",
		tagline: "Calories your body burns just to stay alive.",
		what: "BMR (Basal Metabolic Rate) is the number of calories your body burns every day just to keep you alive — breathing, pumping blood, keeping you warm, and repairing cells — without any movement at all.",
		why: "This is the most important number for understanding how much you should eat. If you consistently eat less than your BMR, your body starts breaking down muscle for energy and slows your metabolism — which is exactly why crash diets cause you to regain weight so quickly afterwards.",
		how: "We calculate this from your weight, height, age, and sex using the Mifflin-St Jeor formula — the most clinically validated method. Active people have a higher range because muscle burns more at rest.",
		idealMale: "1,600–2,000 kcal (sedentary) · higher with more activity",
		idealFemale: "1,400–1,800 kcal (sedentary) · higher with more activity",
		source: "Mifflin-St Jeor equation (1990) — validated by the Academy of Nutrition and Dietetics as the most accurate BMR formula",
		unit: "kcal",
		lowMeans: "You may have low muscle mass or have been eating very little for a long time — gradually increasing food and exercise will help rebuild this",
		highMeans: "A higher BMR means more muscle — your body is an efficient calorie burner. This is a great sign",
		tip: "Your BMR covers about 60–70% of all the calories you burn in a day. Multiply it by 1.2 if you're mostly sitting, or up to 1.9 if you train hard daily — that gives you your actual daily calorie need.",
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
		source: "Derived from BMR comparison to age-group averages — a consumer wellness metric, not a clinical standard",
		unit: "yrs",
		lowMeans: "Your body is performing younger than your years — this is a very good sign for your long-term health",
		highMeans: "Your metabolism is running older than your age — building muscle and losing fat will bring this number down, and it's very achievable",
		tip: "Strength training brings your metabolic age down faster than cardio does. Just two consistent gym sessions a week can produce visible improvements in 8–12 weeks.",
	},
];

const CAT_COLOR = {
	Foundation: "#98989D",
	Composition: "#FF453A",
	Metabolic: "#BF5AF2",
	Cellular: "#0A84FF",
} as const;

type CatKey = keyof typeof CAT_COLOR;
type Guide = typeof GUIDES[number];

const CATEGORIES = ["Foundation", "Composition", "Metabolic", "Cellular"];

function Block({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div style={{ padding: "0 22px 20px" }}>
			<div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.13em", color: "rgba(255,255,255,0.16)", textTransform: "uppercase", marginBottom: 9 }}>{label}</div>
			{children}
		</div>
	);
}

function Body({ children }: { children: ReactNode }) {
	return (
		<p style={{ margin: 0, fontSize: 13.5, fontWeight: 300, color: "rgba(255,255,255,0.48)", lineHeight: 1.78, letterSpacing: "-0.01em" }}>{children}</p>
	);
}


export default function BodyMetricsGuide({ onClose }: { onClose?: () => void }) {
	const [selected, setSelected] = useState<Guide | null>(null);
	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	const router = useRouter();

	const filtered = activeCategory ? GUIDES.filter(g => g.category === activeCategory) : GUIDES;

	return (
		<>
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap');
				* { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
				body { margin: 0; background: #0D0D0F; }
				.bmg { font-family: 'DM Sans', sans-serif; }
				.bmg-row { transition: background 0.10s ease; -webkit-tap-highlight-color: transparent; cursor: pointer; }
				.bmg-row:hover { background: rgba(255,255,255,0.03) !important; }
				.bmg-row:active { background: rgba(255,255,255,0.05) !important; }
				.bmg-pill { -webkit-tap-highlight-color: transparent; transition: background 0.12s, color 0.12s, border-color 0.12s; cursor: pointer; }
				.bmg-sheet { animation: sheet-rise 0.44s cubic-bezier(0.22,1,0.36,1) both; }
				@keyframes sheet-rise { from { transform: translateX(-50%) translateY(100%); } to { transform: translateX(-50%) translateY(0); } }
				.bmg-scroll { scrollbar-width: none; }
				.bmg-scroll::-webkit-scrollbar { display: none; }
			`}</style>

			<div className="bmg" style={{
				position: "fixed", inset: 0, zIndex: 1,
				background: "#0D0D0F",
				display: "flex", justifyContent: "center",
			}}>
				<div style={{
					width: "100%", maxWidth: 430,
					background: "#0D0D0F",
					display: "flex", flexDirection: "column",
					height: "100vh",
					overflowY: "hidden",
				}}>

					{/* HEADER */}
					<div style={{ flexShrink: 0, padding: "16px 22px", background: "#0D0D0F", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
						<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
							{/* Back Button */}
							<button
								onClick={() => router.push("/bgmi")}
								style={{
									background: "none", border: "none", cursor: "pointer",
									display: "flex", alignItems: "center", gap: "8px",
									padding: "8px 0",
									color: "rgba(255,255,255,0.7)",
									fontSize: "14px", fontWeight: "500",
									letterSpacing: "-0.01em",
									WebkitTapHighlightColor: "transparent",
									transition: "color 0.2s ease",
								}}
								onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.9)"}
								onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
							>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<path d="M10 12l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
								Back
							</button>
							<div style={{ fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.88)" }}>Metrics Guide</div>
							<div style={{ width: "44px" }} />
						</div>
					</div>

					{/* TITLE SECTION */}
					<div style={{ flexShrink: 0, padding: "20px 22px 0", background: "#0D0D0F" }}>
						<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
							<div>
								<div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", color: "rgba(255,255,255,0.50)", textTransform: "uppercase", marginBottom: 7 }}>Health Guide</div>
								<div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.1 }}>
									<span style={{ color: "rgba(255,255,255,0.92)" }}>Understanding</span>
									<br />
									<span style={{ color: "#BF5AF2" }}>Your Metrics</span>
								</div>
							</div>
						</div>

						{/* Filter pills */}
						<div className="bmg-scroll" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 16, marginRight: -22, paddingRight: 22 }}>
							{[null, ...CATEGORIES].map(cat => {
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
												background: active ? CAT_COLOR[cat as CatKey] : "rgba(255,255,255,0.18)",
												transition: "background 0.12s",
											}} />
										)}
										{cat ?? "All metrics"}
									</button>
								);
							})}
						</div>
						<div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginLeft: -22, marginRight: -22 }} />
					</div>

					{/* LIST */}
					<div className="bmg-scroll" style={{ overflowY: "auto", flex: 1 }}>
						<div style={{ padding: "10px 22px 4px" }}>
							<span style={{ fontSize: 10, color: "rgba(255,255,255,0.16)", letterSpacing: "0.04em" }}>
								{filtered.length} metrics{activeCategory ? ` · ${activeCategory}` : ""}
							</span>
						</div>

						{filtered.map((g, i) => (
							<button key={g.key} className="bmg-row" onClick={() => setSelected(g)} style={{
								width: "100%", display: "flex", alignItems: "center",
								padding: "15px 22px",
								background: "transparent", border: "none",
								borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
								textAlign: "left", gap: 16,
								fontFamily: "'DM Sans', sans-serif",
							}}>
								<div style={{ width: 54, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
									<div style={{
										fontFamily: "'DM Serif Display', serif",
										fontSize: g.abbr.length > 3 ? 14 : g.abbr.length === 3 ? 18 : 24,
										fontWeight: 400, color: g.color, lineHeight: 1, letterSpacing: "-0.02em",
									}}>{g.abbr}</div>
									<div style={{ width: 16, height: 1.5, borderRadius: 100, background: g.color, opacity: 0.30 }} />
								</div>

								<div style={{ flex: 1, minWidth: 0 }}>
									<div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.025em", color: "rgba(255,255,255,0.88)", marginBottom: 3, lineHeight: 1.15 }}>{g.label}</div>
									<div style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.26)", letterSpacing: "-0.01em", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
										{g.tagline}
									</div>
								</div>

								<div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
									<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
										<path d="M5.5 3.5L9 7l-3.5 3.5" stroke="rgba(255,255,255,0.16)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
									<div style={{ display: "flex", alignItems: "center", gap: 4 }}>
										<div style={{ width: 4, height: 4, borderRadius: "50%", background: CAT_COLOR[g.category as CatKey], opacity: 0.55 }} />
										<span style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", letterSpacing: "0.05em" }}>{g.category}</span>
									</div>
								</div>
							</button>
						))}

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

				{/* DETAIL BOTTOM SHEET */}
				{selected && (
					<>
						<div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, zIndex: 10, background: "rgba(0,0,0,0.45)" }} />
						<div className="bmg-sheet" style={{
							position: "fixed",
							left: "50%",
							top: 80, // 80px gap at the top
							bottom: 0,
							transform: "translateX(-50%)",
							width: "100%",
							maxWidth: 430,
							zIndex: 20,
							background: "#111113",
							borderRadius: "24px 24px 0 0",
							borderTop: "1px solid rgba(255,255,255,0.08)",
							height: "auto",
							maxHeight: "calc(100vh - 80px)",
							display: "flex",
							flexDirection: "column",
							boxShadow: "0 8px 32px 0 rgba(0,0,0,0.32)",
							transition: "top 0.25s cubic-bezier(.4,1,.4,1)",
						}}>

							{/* Handle */}
							<div onClick={() => setSelected(null)} style={{ display: "flex", justifyContent: "center", padding: "12px 0 0", cursor: "pointer", flexShrink: 0 }}>
								<div style={{ width: 32, height: 3, borderRadius: 100, background: "rgba(255,255,255,0.10)" }} />
							</div>

							{/* Sheet header */}
							<div style={{ padding: "14px 22px 18px", flexShrink: 0, position: "relative" }}>
								{/* Close button at top right */}
								<button onClick={() => setSelected(null)} style={{
									position: "absolute",
									top: 8,
									right: 8,
									width: 32,
									height: 32,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									background: "none",
									border: "none",
									borderRadius: 16,
									cursor: "pointer",
									color: "rgba(255,255,255,0.32)",
									transition: "background 0.15s, color 0.15s",
									fontSize: 18,
								}}
									onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
									onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.32)"}
									aria-label="Close"
								>
									<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
										<path d="M5.6 5.6l6.8 6.8M12.4 5.6l-6.8 6.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
									</svg>
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
										<div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.10em", color: `${CAT_COLOR[selected.category as CatKey]}80`, textTransform: "uppercase", marginBottom: 4 }}>{selected.category}</div>
										<div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "rgba(255,255,255,0.90)" }}>{selected.label}</div>
									</div>
								</div>

								<div style={{ fontSize: 13, fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.34)", letterSpacing: "-0.01em", lineHeight: 1.5, marginBottom: 16 }}>{selected.tagline}</div>
								<div style={{ height: 1, borderRadius: 100, background: `linear-gradient(90deg, ${selected.color}88 0%, transparent 60%)` }} />
							</div>

							{/* Scrollable content */}
							<div className="bmg-scroll" style={{ overflowY: "auto", flex: 1, padding: "4px 0 64px" }}>

								<Block label="What is it"><Body>{selected.what}</Body></Block>
								<Block label="Why it matters"><Body>{selected.why}</Body></Block>
								<Block label="How it's measured"><Body>{selected.how}</Body></Block>

								<Block label="Ideal ranges">
									{(() => {
										const maleBrackets = selected.idealMale.split(" · ");
										const femaleBrackets = selected.idealFemale.split(" · ");
										const isTable = maleBrackets.length > 1;

										if (!isTable) {
											// Simple two-row display for single-value ranges
											return (
												<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
													{[{ label: "Male", value: selected.idealMale }, { label: "Female", value: selected.idealFemale }].map(row => (
														<div key={row.label} style={{
															display: "flex", alignItems: "center", gap: 12,
															padding: "10px 14px",
															background: "rgba(255,255,255,0.03)",
															border: "1px solid rgba(255,255,255,0.06)",
															borderRadius: 10,
														}}>
															<div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase", flexShrink: 0, width: 42 }}>{row.label}</div>
															<div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.75)", letterSpacing: "-0.02em" }}>{row.value}</div>
														</div>
													))}
												</div>
											);
										}

										// Parse brackets from each entry
										const parse = (str: string) => {
											const match = str.match(/^(.*?)\s*(\(.*?\))?$/);
											return { value: match?.[1]?.trim() ?? str, label: match?.[2]?.replace(/[()]/g, "").trim() ?? "" };
										};

										const cols = maleBrackets.map(parse);

										// Move gender rows array outside JSX for mapping
										const genderRows = [
											{ sex: "Male", brackets: maleBrackets },
											{ sex: "Female", brackets: femaleBrackets },
										];
										return (
											<div style={{
												background: "rgba(255,255,255,0.025)",
												border: "1px solid rgba(255,255,255,0.06)",
												borderRadius: 12,
												overflow: "hidden",
											}}>
												{/* Header row */}
												<div style={{
													display: "grid",
													gridTemplateColumns: `64px repeat(${cols.length}, 1fr)`,
													borderBottom: "1px solid rgba(255,255,255,0.05)",
												}}>
													<div style={{ padding: "8px 12px" }} />
													{cols.map((col: { label: string; value: string }, i) => (
														<div key={i} style={{
															padding: "8px 10px",
															fontSize: 9, fontWeight: 700, letterSpacing: "0.07em",
															color: "rgba(255,255,255,0.22)", textTransform: "uppercase",
															borderLeft: "1px solid rgba(255,255,255,0.04)",
															textAlign: "center",
														}}>{col.label}</div>
													))}
												</div>

												{/* Gender rows */}
												{genderRows.map((row, ri) => (
													<div key={row.sex} style={{
														display: "grid",
														gridTemplateColumns: `64px repeat(${cols.length}, 1fr)`,
														borderTop: ri > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
													}}>
														<div style={{
															padding: "11px 12px",
															fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
															color: "rgba(255,255,255,0.22)", textTransform: "uppercase",
															display: "flex", alignItems: "center",
														}}>{row.sex}</div>
														{row.brackets.map((b: string, i: number) => {
															const { value } = parse(b);
															return (
																<div key={i} style={{
																	padding: "11px 10px",
																	borderLeft: "1px solid rgba(255,255,255,0.04)",
																	display: "flex", alignItems: "center", justifyContent: "center",
																}}>
																	<span style={{
																		fontSize: 13, fontWeight: 600,
																		color: "rgba(255,255,255,0.72)",
																		letterSpacing: "-0.02em",
																		textAlign: "center",
																	}}>{value}</span>
																</div>
															);
														})}
													</div>
												))}
											</div>
										);
									})()}
									{selected.source && (
										<div style={{ marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: "-0.01em", lineHeight: 1.5, fontStyle: "italic" }}>
											Source: {selected.source}
										</div>
									)}
								</Block>

								<Block label="What your number signals">
									<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
										{[
											{ label: "Too Low", text: selected.lowMeans, color: "#5AC8FA" },
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
