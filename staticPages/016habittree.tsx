import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Footprints, BookOpen, Moon, Flame, Zap, ChevronRight, Check } from "lucide-react";

const HABITS = [
  { id: "water", label: "Drink 8 glasses of water", icon: "💧" },
  { id: "move",  label: "30 min movement",          icon: "🏃" },
  { id: "read",  label: "Read 10 pages",             icon: "📖" },
  { id: "sleep", label: "Sleep by 10 PM",            icon: "🌙" },
];
const TOTAL_DAYS     = 21;
const TOTAL_POSSIBLE = TOTAL_DAYS * HABITS.length;
function getTreeStage(pct) {
  if (pct === 0) return 0;
  if (pct < 0.2) return 1;
  if (pct < 0.4) return 2;
  if (pct < 0.6) return 3;
  if (pct < 0.8) return 4;
  return 5;
}

function TreeSVG({ stage, pct }) {
  return (
    <svg viewBox="0 0 200 230" width="200" height="230" style={{ overflow: "visible", display: "block" }}>
      <defs>
        <radialGradient id="soilGrad" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#8B6340" />
          <stop offset="100%" stopColor="#5c3d1e" />
        </radialGradient>
        <radialGradient id="seedGrad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#c49a5a" />
          <stop offset="100%" stopColor="#7a5230" />
        </radialGradient>
        <linearGradient id="trunk1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6b3f1a" />
          <stop offset="40%" stopColor="#9c6030" />
          <stop offset="100%" stopColor="#7a4a22" />
        </linearGradient>
        <linearGradient id="trunk2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5a3315" />
          <stop offset="35%" stopColor="#8B5230" />
          <stop offset="100%" stopColor="#6b3f1a" />
        </linearGradient>
        <radialGradient id="leaf1" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#a8e06a" />
          <stop offset="60%" stopColor="#5aaa30" />
          <stop offset="100%" stopColor="#3a8020" />
        </radialGradient>
        <radialGradient id="leaf2" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#90d458" />
          <stop offset="60%" stopColor="#4a9828" />
          <stop offset="100%" stopColor="#2e6e18" />
        </radialGradient>
        <radialGradient id="leaf3" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#78c845" />
          <stop offset="60%" stopColor="#3d8c22" />
          <stop offset="100%" stopColor="#245c12" />
        </radialGradient>
        <filter id="treeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.18)" />
        </filter>
        <filter id="softShadow">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.12)" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="100" cy="220" rx="55" ry="10" fill="rgba(0,0,0,0.08)" />

      {/* === STAGE 0: SEED === */}
      {stage === 0 && (
        <g>
          {/* Soil mound */}
          <ellipse cx="100" cy="210" rx="44" ry="12" fill="url(#soilGrad)" />
          <ellipse cx="100" cy="208" rx="40" ry="9" fill="#7a5228" />
          {/* Soil texture lines */}
          <path d="M70 208 Q85 204 100 208 Q115 212 130 208" stroke="#6b4520" strokeWidth="1.2" fill="none" opacity="0.5" />
          <path d="M75 212 Q92 208 108 212 Q120 215 128 212" stroke="#6b4520" strokeWidth="1" fill="none" opacity="0.4" />
          {/* Seed */}
          <ellipse cx="100" cy="201" rx="13" ry="9" fill="url(#seedGrad)" filter="url(#softShadow)" />
          <ellipse cx="100" cy="200" rx="10" ry="7" fill="#b8844a" opacity="0.6" />
          {/* Seed ridge line */}
          <path d="M93 201 Q100 197 107 201" stroke="#8B6030" strokeWidth="1.5" fill="none" />
          {/* Tiny root hint */}
          <path d="M100 209 Q102 214 100 218" stroke="#7a5228" strokeWidth="1.2" fill="none" opacity="0.6" />
        </g>
      )}

      {/* === STAGE 1: SPROUT === */}
      {stage === 1 && (
        <g>
          {/* Soil */}
          <ellipse cx="100" cy="212" rx="44" ry="11" fill="url(#soilGrad)" />
          <ellipse cx="100" cy="210" rx="40" ry="8" fill="#7a5228" />
          <path d="M70 210 Q85 206 100 210 Q115 214 130 210" stroke="#6b4520" strokeWidth="1.2" fill="none" opacity="0.5" />
          {/* Crack in soil */}
          <path d="M98 207 L100 212 L103 208" stroke="#5c3d18" strokeWidth="1" fill="none" />
          {/* Thin stem */}
          <path d="M100 209 Q99 198 100 182" stroke="#7ab840" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Left cotyledon */}
          <ellipse cx="88" cy="181" rx="12" ry="7" fill="#a0d860"
            transform="rotate(-35 88 181)" filter="url(#softShadow)" />
          <ellipse cx="87" cy="180" rx="9" ry="5" fill="#b8e870" opacity="0.5"
            transform="rotate(-35 87 180)" />
          {/* Right cotyledon */}
          <ellipse cx="112" cy="181" rx="12" ry="7" fill="#90cc52"
            transform="rotate(35 112 181)" filter="url(#softShadow)" />
          <ellipse cx="113" cy="180" rx="9" ry="5" fill="#a8dc68" opacity="0.5"
            transform="rotate(35 113 180)" />
          {/* Tiny top bud */}
          <ellipse cx="100" cy="176" rx="4" ry="5" fill="#c0e878" />
        </g>
      )}

      {/* === STAGE 2: SEEDLING === */}
      {stage === 2 && (
        <g filter="url(#treeShadow)">
          {/* Soil */}
          <ellipse cx="100" cy="214" rx="44" ry="10" fill="url(#soilGrad)" />
          <ellipse cx="100" cy="212" rx="40" ry="7.5" fill="#7a5228" />
          {/* Tiny root hints */}
          <path d="M97 213 Q92 218 88 221" stroke="#6b4520" strokeWidth="1.2" fill="none" />
          <path d="M103 213 Q108 218 112 221" stroke="#6b4520" strokeWidth="1.2" fill="none" />
          {/* Stem — still young, green-brown, thin */}
          <path d="M100 212 Q99 200 100 168" stroke="#6a9e30" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M100 212 Q101 200 100 168" stroke="#88c040" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
          {/* Left branch — simple */}
          <path d="M99 192 Q88 184 76 178" stroke="#7aaa30" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Right branch */}
          <path d="M100 182 Q110 174 120 170" stroke="#7aaa30" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* Left small cluster — 3 circles, not 7 */}
          <circle cx="72" cy="175" r="11" fill="#82c040" />
          <circle cx="64" cy="169" r="9" fill="#92cc4e" />
          <circle cx="76" cy="165" r="8" fill="#a0d45a" />
          {/* Right small cluster */}
          <circle cx="124" cy="167" r="10" fill="#78ba38" />
          <circle cx="132" cy="161" r="8" fill="#88ca48" />
          {/* Top leaves — crown forming */}
          <circle cx="100" cy="158" r="13" fill="url(#leaf1)" />
          <circle cx="92" cy="150" r="10" fill="#98d458" />
          <circle cx="109" cy="151" r="9" fill="#8acc4c" />
          <circle cx="100" cy="143" r="8" fill="#a8de64" />
          {/* Highlight */}
          <circle cx="97" cy="146" r="4" fill="rgba(255,255,255,0.18)" />
        </g>
      )}

      {/* === STAGE 3: SAPLING === */}
      {stage === 3 && (
        <g filter="url(#treeShadow)">
          {/* Soil & roots */}
          <ellipse cx="100" cy="216" rx="50" ry="10" fill="url(#soilGrad)" />
          <ellipse cx="100" cy="214" rx="45" ry="7" fill="#7a5228" />
          <path d="M94 215 Q84 222 76 226" stroke="#6b4520" strokeWidth="2" fill="none" />
          <path d="M106 215 Q116 222 124 226" stroke="#6b4520" strokeWidth="2" fill="none" />
          <path d="M100 216 Q98 224 96 228" stroke="#6b4520" strokeWidth="1.5" fill="none" />
          {/* Trunk - wider, tapered */}
          <path d="M94 215 Q91 190 93 140 Q94 100 96 65" stroke="none" fill="url(#trunk1)" />
          <path d="M94 215 Q91 190 93 140 Q94 100 96 65
                   Q104 65 104 100 Q106 140 107 190 Q108 210 106 215 Z"
            fill="url(#trunk1)" />
          {/* Trunk highlight */}
          <path d="M99 215 Q98 180 99 120 Q100 80 100 65"
            stroke="#b07840" strokeWidth="1.5" fill="none" opacity="0.4" />
          {/* Left main branch */}
          <path d="M95 175 Q78 162 58 152" stroke="url(#trunk2)" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M58 152 Q48 144 42 135" stroke="#7a5228" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M58 152 Q52 155 44 158" stroke="#7a5228" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Right main branch */}
          <path d="M104 165 Q120 152 140 143" stroke="url(#trunk2)" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M140 143 Q150 135 156 126" stroke="#7a5228" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M140 143 Q148 148 154 155" stroke="#7a5228" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Upper branch left */}
          <path d="M97 130 Q82 118 68 108" stroke="#8B5228" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Upper branch right */}
          <path d="M101 120 Q116 108 130 100" stroke="#8B5228" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Left lower cluster */}
          <circle cx="42" cy="132" r="18" fill="#5aaa2e" />
          <circle cx="34" cy="124" r="15" fill="#6ab83a" />
          <circle cx="48" cy="120" r="16" fill="#78c845" />
          <circle cx="38" cy="115" r="12" fill="#88d450" />
          <circle cx="52" cy="112" r="11" fill="#70c040" />
          {/* Right lower cluster */}
          <circle cx="158" cy="122" r="17" fill="#4e9e28" />
          <circle cx="165" cy="113" r="14" fill="#5eb035" />
          <circle cx="152" cy="112" r="15" fill="#6ec040" />
          <circle cx="162" cy="104" r="11" fill="#7ed04e" />
          {/* Upper left cluster */}
          <circle cx="64" cy="103" r="16" fill="#60b030" />
          <circle cx="55" cy="96" r="13" fill="#72c040" />
          <circle cx="68" cy="93" r="14" fill="#82cc4c" />
          {/* Upper right cluster */}
          <circle cx="132" cy="95" r="15" fill="#58a82a" />
          <circle cx="141" cy="87" r="12" fill="#68b838" />
          <circle cx="126" cy="88" r="13" fill="#78c845" />
          {/* Center top cluster */}
          <circle cx="100" cy="88" r="22" fill="url(#leaf1)" />
          <circle cx="88" cy="78" r="17" fill="#88d050" />
          <circle cx="112" cy="80" r="16" fill="#78c040" />
          <circle cx="100" cy="68" r="15" fill="#98dc5c" />
          <circle cx="90" cy="65" r="11" fill="#a8e468" />
          <circle cx="110" cy="66" r="10" fill="#90d458" />
          {/* Highlights */}
          <circle cx="94" cy="70" r="7" fill="rgba(255,255,255,0.2)" />
          <circle cx="40" cy="118" r="5" fill="rgba(255,255,255,0.15)" />
          <circle cx="155" cy="108" r="5" fill="rgba(255,255,255,0.12)" />
        </g>
      )}

      {/* === STAGE 4: YOUNG TREE === */}
      {stage === 4 && (
        <g filter="url(#treeShadow)">
          {/* Soil */}
          <ellipse cx="100" cy="218" rx="56" ry="11" fill="url(#soilGrad)" />
          <ellipse cx="100" cy="215" rx="50" ry="7.5" fill="#7a5228" />
          {/* Root flare */}
          <path d="M90 216 Q78 222 68 228" stroke="#6b4520" strokeWidth="2.5" fill="none" />
          <path d="M110 216 Q122 222 132 228" stroke="#6b4520" strokeWidth="2.5" fill="none" />
          <path d="M96 217 Q92 225 88 230" stroke="#6b4520" strokeWidth="2" fill="none" />
          <path d="M104 217 Q108 225 112 230" stroke="#6b4520" strokeWidth="2" fill="none" />
          {/* Trunk - thick, textured */}
          <path d="M90 218 Q86 190 88 145 Q90 100 92 55
                   Q108 55 108 100 Q110 145 112 190 Q114 210 110 218 Z"
            fill="url(#trunk1)" />
          {/* Bark texture */}
          <path d="M94 210 Q93 180 94 145 Q95 110 96 80" stroke="#6b3f18" strokeWidth="1" fill="none" opacity="0.35" />
          <path d="M98 215 Q97 185 98 150 Q99 115 100 85" stroke="#7a4f28" strokeWidth="1.5" fill="none" opacity="0.3" />
          <path d="M103 212 Q104 182 103 148 Q102 112 102 82" stroke="#6b3f18" strokeWidth="1" fill="none" opacity="0.25" />
          {/* Branch L1 low */}
          <path d="M92 185 Q72 172 50 162" stroke="#7a4a20" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M50 162 Q36 154 26 143" stroke="#7a4a20" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M50 162 Q40 168 30 172" stroke="#7a4a20" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Branch R1 low */}
          <path d="M108 178 Q128 165 150 156" stroke="#7a4a20" strokeWidth="6.5" fill="none" strokeLinecap="round" />
          <path d="M150 156 Q162 148 170 138" stroke="#7a4a20" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M150 156 Q160 162 168 168" stroke="#7a4a20" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Branch L2 mid */}
          <path d="M91 148 Q74 135 56 124" stroke="#8B5228" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M56 124 Q44 115 36 104" stroke="#8B5228" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Branch R2 mid */}
          <path d="M108 140 Q126 127 146 118" stroke="#8B5228" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M146 118 Q158 110 164 99" stroke="#8B5228" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Branch L3 upper */}
          <path d="M93 112 Q78 99 62 88" stroke="#9a5e30" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Branch R3 upper */}
          <path d="M106 105 Q122 92 138 82" stroke="#9a5e30" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Top branch */}
          <path d="M98 80 Q92 64 88 48" stroke="#9a5e30" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M100 75 Q108 60 112 45" stroke="#9a5e30" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Far left cluster */}
          <circle cx="24" cy="140" r="20" fill="#4a9822" />
          <circle cx="15" cy="130" r="16" fill="#5aaa2e" />
          <circle cx="28" cy="125" r="18" fill="#6ab838" />
          <circle cx="18" cy="118" r="13" fill="#7ac845" />
          <circle cx="32" cy="116" r="14" fill="#80cc48" />
          {/* Left low cluster */}
          <circle cx="50" cy="170" r="18" fill="#52a028" />
          <circle cx="40" cy="162" r="15" fill="#62b034" />
          <circle cx="55" cy="160" r="16" fill="#70bc40" />
          {/* Far right cluster */}
          <circle cx="170" cy="135" r="19" fill="#489020" />
          <circle cx="178" cy="125" r="15" fill="#58a02c" />
          <circle cx="165" cy="122" r="17" fill="#68b038" />
          <circle cx="176" cy="114" r="13" fill="#78c044" />
          {/* Right low cluster */}
          <circle cx="150" cy="165" r="16" fill="#4e9824" />
          <circle cx="160" cy="158" r="14" fill="#5eaa30" />
          {/* Left mid cluster */}
          <circle cx="34" cy="101" r="18" fill="#4e9e26" />
          <circle cx="24" cy="92" r="14" fill="#5eae32" />
          <circle cx="40" cy="88" r="16" fill="#6ebc3e" />
          <circle cx="28" cy="82" r="12" fill="#7ecc4a" />
          {/* Right mid cluster */}
          <circle cx="166" cy="96" r="17" fill="#489020" />
          <circle cx="174" cy="87" r="13" fill="#58a02c" />
          <circle cx="160" cy="84" r="15" fill="#68b038" />
          {/* Left upper cluster */}
          <circle cx="58" cy="83" r="17" fill="#56a82e" />
          <circle cx="48" cy="74" r="14" fill="#66b83a" />
          <circle cx="62" cy="70" r="15" fill="#76c846" />
          {/* Right upper cluster */}
          <circle cx="140" cy="78" r="16" fill="#4e9e26" />
          <circle cx="150" cy="69" r="13" fill="#5eae32" />
          <circle cx="136" cy="66" r="14" fill="#6ebe3e" />
          {/* Top right */}
          <circle cx="114" cy="42" r="15" fill="#60b030" />
          <circle cx="122" cy="34" r="12" fill="#70c03c" />
          {/* Top left */}
          <circle cx="86" cy="44" r="14" fill="#58a82a" />
          <circle cx="78" cy="36" r="11" fill="#68b836" />
          {/* Central canopy */}
          <circle cx="100" cy="72" r="26" fill="url(#leaf2)" />
          <circle cx="86" cy="60" r="20" fill="#7ec848" />
          <circle cx="114" cy="62" r="19" fill="#70bc40" />
          <circle cx="100" cy="50" r="20" fill="#88d452" />
          <circle cx="88" cy="44" r="15" fill="#98de5e" />
          <circle cx="112" cy="46" r="14" fill="#88d050" />
          <circle cx="100" cy="36" r="14" fill="#a0e264" />
          {/* Highlight glints */}
          <circle cx="92" cy="44" r="8" fill="rgba(255,255,255,0.22)" />
          <circle cx="22" cy="124" r="6" fill="rgba(255,255,255,0.16)" />
          <circle cx="170" cy="120" r="6" fill="rgba(255,255,255,0.14)" />
          <circle cx="36" cy="84" r="5" fill="rgba(255,255,255,0.15)" />
          <circle cx="160" cy="80" r="5" fill="rgba(255,255,255,0.12)" />
        </g>
      )}

      {/* === STAGE 5: FULL BLOOM === */}
      {stage === 5 && (
        <g filter="url(#treeShadow)">
          {/* Rich soil */}
          <ellipse cx="100" cy="220" rx="60" ry="12" fill="url(#soilGrad)" />
          <ellipse cx="100" cy="217" rx="54" ry="8" fill="#7a5228" />
          {/* Exposed roots */}
          <path d="M88 218 Q74 226 62 232" stroke="#6b4520" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M83 219 Q70 228 58 236" stroke="#5c3a18" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M112 218 Q126 226 138 232" stroke="#6b4520" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M117 219 Q130 228 142 236" stroke="#5c3a18" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M95 220 Q90 230 86 236" stroke="#6b4520" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M105 220 Q110 230 114 236" stroke="#6b4520" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Thick trunk */}
          <path d="M86 220 Q82 190 84 145 Q86 100 88 52
                   Q112 52 112 100 Q114 145 116 190 Q118 210 114 220 Z"
            fill="url(#trunk1)" />
          {/* Bark texture detail */}
          <path d="M92 218 Q90 185 91 148 Q92 110 93 72" stroke="#5a3010" strokeWidth="1.5" fill="none" opacity="0.3" />
          <path d="M97 220 Q95 188 96 152 Q97 115 98 78" stroke="#7a5030" strokeWidth="2" fill="none" opacity="0.25" />
          <path d="M103 220 Q104 188 104 152 Q104 115 103 78" stroke="#5a3010" strokeWidth="1.5" fill="none" opacity="0.2" />
          <path d="M108 218 Q110 185 109 148 Q108 110 107 72" stroke="#6a4020" strokeWidth="1" fill="none" opacity="0.2" />
          {/* Bark horizontal scars */}
          <path d="M89 195 Q100 192 111 195" stroke="#5a3010" strokeWidth="1" fill="none" opacity="0.25" />
          <path d="M88 172 Q100 169 112 172" stroke="#5a3010" strokeWidth="1" fill="none" opacity="0.22" />
          <path d="M88 148 Q100 145 112 148" stroke="#5a3010" strokeWidth="1" fill="none" opacity="0.2" />

          {/* ---- BRANCHES ---- */}
          {/* Far left low */}
          <path d="M88 192 Q64 178 40 165" stroke="#6b3f18" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M40 165 Q24 155 14 142" stroke="#6b3f18" strokeWidth="6.5" fill="none" strokeLinecap="round" />
          <path d="M40 165 Q28 172 18 178" stroke="#6b3f18" strokeWidth="5.5" fill="none" strokeLinecap="round" />
          <path d="M14 142 Q6 132 4 120" stroke="#7a4a22" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          {/* Far right low */}
          <path d="M112 185 Q136 172 160 160" stroke="#6b3f18" strokeWidth="8.5" fill="none" strokeLinecap="round" />
          <path d="M160 160 Q175 150 184 138" stroke="#6b3f18" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M160 160 Q172 168 180 175" stroke="#6b3f18" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M184 138 Q192 128 194 116" stroke="#7a4a22" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Left mid */}
          <path d="M87 158 Q66 143 46 130" stroke="#7a4a22" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M46 130 Q30 118 20 105" stroke="#7a4a22" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M46 130 Q34 135 22 138" stroke="#7a4a22" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          {/* Right mid */}
          <path d="M113 152 Q133 138 154 126" stroke="#7a4a22" strokeWidth="6.5" fill="none" strokeLinecap="round" />
          <path d="M154 126 Q168 114 178 102" stroke="#7a4a22" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M154 126 Q166 132 176 136" stroke="#7a4a22" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Left upper */}
          <path d="M90 124 Q70 108 52 94" stroke="#8B5228" strokeWidth="5.5" fill="none" strokeLinecap="round" />
          <path d="M52 94 Q36 80 26 66" stroke="#8B5228" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M52 94 Q40 98 28 100" stroke="#8B5228" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Right upper */}
          <path d="M110 118 Q130 103 148 90" stroke="#8B5228" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M148 90 Q162 76 172 63" stroke="#8B5228" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M148 90 Q160 95 170 98" stroke="#8B5228" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Top center */}
          <path d="M96 92 Q88 72 84 50" stroke="#9a5e30" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M84 50 Q80 36 78 22" stroke="#9a5e30" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M103 88 Q112 68 116 46" stroke="#9a5e30" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M116 46 Q120 32 122 18" stroke="#9a5e30" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M100 96 Q100 78 100 60" stroke="#9a5e30" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* ---- LEAF CANOPY ---- */}
          {/* Far left clusters */}
          <circle cx="4" cy="116" r="22" fill="#3d8c1e" />
          <circle cx="-4" cy="104" r="18" fill="#4a9c28" />
          <circle cx="10" cy="100" r="20" fill="#5aac32" />
          <circle cx="0" cy="90" r="15" fill="#6abc3e" />
          <circle cx="16" cy="88" r="17" fill="#72c444" />
          <circle cx="6" cy="78" r="14" fill="#82cc50" />
          {/* Left low leaf mass */}
          <circle cx="18" cy="175" r="22" fill="#449020" />
          <circle cx="8" cy="165" r="18" fill="#54a02c" />
          <circle cx="22" cy="160" r="20" fill="#62ae38" />
          <circle cx="10" cy="150" r="16" fill="#72bc44" />
          <circle cx="26" cy="148" r="18" fill="#7cc44e" />
          {/* Right low leaf mass */}
          <circle cx="180" cy="172" r="21" fill="#3e8a1e" />
          <circle cx="190" cy="162" r="17" fill="#4e9a2a" />
          <circle cx="177" cy="158" r="19" fill="#5eaa36" />
          <circle cx="188" cy="148" r="15" fill="#6eba42" />
          <circle cx="174" cy="146" r="17" fill="#78c24c" />
          {/* Far right clusters */}
          <circle cx="196" cy="112" r="21" fill="#3c881c" />
          <circle cx="204" cy="102" r="17" fill="#4c9828" />
          <circle cx="192" cy="98" r="19" fill="#5ca834" />
          <circle cx="202" cy="88" r="14" fill="#6cb840" />
          <circle cx="188" cy="84" r="16" fill="#7ac84a" />
          {/* Left mid clusters */}
          <circle cx="18" cy="102" r="20" fill="#469222" />
          <circle cx="8" cy="92" r="16" fill="#56a22e" />
          <circle cx="22" cy="86" r="18" fill="#66b23a" />
          <circle cx="10" cy="76" r="14" fill="#76c246" />
          <circle cx="26" cy="74" r="16" fill="#7eca4e" />
          {/* Right mid clusters */}
          <circle cx="178" cy="99" r="19" fill="#408e1e" />
          <circle cx="188" cy="89" r="15" fill="#509e2a" />
          <circle cx="174" cy="84" r="17" fill="#60ae36" />
          <circle cx="184" cy="74" r="13" fill="#70be42" />
          <circle cx="170" cy="70" r="15" fill="#7ece4c" />
          {/* Left upper clusters */}
          <circle cx="24" cy="62" r="19" fill="#4a9624" />
          <circle cx="14" cy="52" r="15" fill="#5aa630" />
          <circle cx="28" cy="46" r="17" fill="#6ab63c" />
          <circle cx="16" cy="38" r="13" fill="#7ac648" />
          {/* Right upper clusters */}
          <circle cx="172" cy="60" r="18" fill="#448e20" />
          <circle cx="182" cy="50" r="14" fill="#549e2c" />
          <circle cx="168" cy="44" r="16" fill="#64ae38" />
          <circle cx="178" cy="34" r="12" fill="#74be44" />
          {/* Left side mid-high */}
          <circle cx="54" cy="90" r="21" fill="#52a228" />
          <circle cx="42" cy="80" r="17" fill="#62b234" />
          <circle cx="58" cy="75" r="19" fill="#72c240" />
          <circle cx="46" cy="66" r="15" fill="#82cc4c" />
          {/* Right side mid-high */}
          <circle cx="148" cy="86" r="20" fill="#4c9c24" />
          <circle cx="158" cy="76" r="16" fill="#5cac30" />
          <circle cx="144" cy="70" r="18" fill="#6cbc3c" />
          <circle cx="154" cy="61" r="14" fill="#7ccc48" />
          {/* Top right branch clusters */}
          <circle cx="166" cy="58" r="18" fill="#489820" />
          <circle cx="176" cy="48" r="14" fill="#58a82c" />
          <circle cx="162" cy="42" r="16" fill="#68b838" />
          {/* Top left branch clusters */}
          <circle cx="26" cy="56" r="18" fill="#509e26" />
          <circle cx="16" cy="46" r="14" fill="#60ae32" />
          <circle cx="30" cy="40" r="16" fill="#70be3e" />
          {/* Top center clusters */}
          <circle cx="78" cy="18" r="18" fill="#5aac30" />
          <circle cx="68" cy="10" r="14" fill="#6abc3c" />
          <circle cx="82" cy="6" r="15" fill="#7acc48" />
          <circle cx="122" cy="15" r="17" fill="#52a42a" />
          <circle cx="130" cy="7" r="13" fill="#62b436" />
          <circle cx="118" cy="4" r="14" fill="#72c442" />
          <circle cx="100" cy="10" r="16" fill="#68be3c" />
          <circle cx="92" cy="2" r="12" fill="#78ce48" />
          <circle cx="108" cy="2" r="12" fill="#70c840" />
          {/* Main dense center canopy */}
          <circle cx="100" cy="80" r="34" fill="url(#leaf3)" />
          <circle cx="82" cy="66" r="26" fill="#6ab838" />
          <circle cx="118" cy="68" r="25" fill="#5eae32" />
          <circle cx="100" cy="54" r="26" fill="#74c440" />
          <circle cx="84" cy="46" r="20" fill="#84d04c" />
          <circle cx="116" cy="48" r="19" fill="#78cc46" />
          <circle cx="100" cy="38" r="20" fill="#8ad454" />
          <circle cx="88" cy="30" r="15" fill="#98dc5e" />
          <circle cx="112" cy="32" r="15" fill="#8ed458" />
          <circle cx="100" cy="24" r="16" fill="#a0e264" />

          {/* Flowers/blossoms scattered */}
          {[
            [42, 76], [28, 58], [16, 42], [60, 48], [82, 24],
            [100, 14], [118, 22], [140, 46], [158, 62], [172, 44],
            [186, 80], [170, 136], [22, 140], [10, 88], [192, 86],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="5.5" fill="#ffecb0" opacity="0.9" />
              <circle cx={cx} cy={cy} r="2.5" fill="#f5a623" />
              {[0,72,144,216,288].map((angle, j) => {
                const rad = (angle * Math.PI) / 180;
                return (
                  <ellipse key={j}
                    cx={cx + Math.cos(rad) * 5}
                    cy={cy + Math.sin(rad) * 5}
                    rx="3" ry="2"
                    fill="#fff9d0"
                    opacity="0.85"
                    transform={`rotate(${angle} ${cx + Math.cos(rad)*5} ${cy + Math.sin(rad)*5})`}
                  />
                );
              })}
            </g>
          ))}

          {/* Highlight glints */}
          <circle cx="90" cy="36" r="10" fill="rgba(255,255,255,0.25)" />
          <circle cx="8" cy="96" r="7" fill="rgba(255,255,255,0.18)" />
          <circle cx="192" cy="93" r="7" fill="rgba(255,255,255,0.16)" />
          <circle cx="24" cy="50" r="6" fill="rgba(255,255,255,0.16)" />
          <circle cx="174" cy="46" r="6" fill="rgba(255,255,255,0.14)" />
          <circle cx="52" cy="68" r="5" fill="rgba(255,255,255,0.18)" />
          <circle cx="148" cy="64" r="5" fill="rgba(255,255,255,0.15)" />
        </g>
      )}

      {/* Progress ring — shown for stage >= 1 */}
    </svg>
  );
}


const SA   = ["#8E6940","#4A9B5F","#2D8A52","#1E7A42","#166A34","#30D158"];

// ─── Haptics ───────────────────────────────────────────────────────────────
const haptic = {
  light:   () => navigator.vibrate && navigator.vibrate(8),
  medium:  () => navigator.vibrate && navigator.vibrate(18),
  success: () => navigator.vibrate && navigator.vibrate([10,50,20]),
  unlock:  () => navigator.vibrate && navigator.vibrate([20,40,30,40,50]),
  tile:    () => navigator.vibrate && navigator.vibrate(5),
};
const BG   = "#0A0A0A";
const S1   = "#141414";
const S2   = "#1E1E1E";
const S3   = "#2A2A2A";
const T1   = "#F0EDE8";
const T2   = "rgba(240,237,232,0.52)";
const T3   = "rgba(240,237,232,0.28)";
const SEP  = "rgba(240,237,232,0.07)";
const WARN = "#C8873A";

const easeT  = { duration:0.55, ease:[0.22,1,0.36,1] };
const springT = { type:"spring", stiffness:280, damping:32 };
const slowT   = { type:"spring", stiffness:140, damping:24 };

const HABITS_DEF = [
  { id:"water", label:"Drink 8 glasses",  sub:"Nourish from within",   Icon:Droplets,  color:"#5B9BD5" },
  { id:"move",  label:"30 min movement",  sub:"Let your body breathe", Icon:Footprints,color:"#4A9B5F" },
  { id:"read",  label:"Read 10 pages",    sub:"Feed a quiet mind",      Icon:BookOpen,  color:"#8B72BE" },
  { id:"sleep", label:"Sleep by 10 PM",   sub:"Rest is part of growth", Icon:Moon,      color:"#C8873A" },
];

const ALL_HABITS_DEF = [
  ...HABITS_DEF,
  { id:"meditate", label:"10 min meditation", sub:"Quiet the noise",    Icon:Zap,   color:"#E84F8A" },
  { id:"journal",  label:"Write 3 lines",     sub:"Reflect and release",Icon:Check, color:"#E8A030" },
];

const STAGE_META = [
  { label:"Seed",       emoji:"🌰", title:"A seed is planted.",       body:"Something has been set in motion. The quietest beginnings hold the deepest roots." },
  { label:"Sprout",     emoji:"🌱", title:"Something stirs.",         body:"Beneath the surface, life is finding its way. You are already growing." },
  { label:"Seedling",   emoji:"🌿", title:"It takes hold.",           body:"The habit has a shape now. Keep returning to it, and it will keep growing." },
  { label:"Sapling",    emoji:"🌲", title:"A tree stands here.",      body:"You have passed the point where most give up. Let that quietly mean something." },
  { label:"Young Tree", emoji:"🌳", title:"Roots run deep.",          body:"This is no longer just a habit. It is becoming part of who you are." },
  { label:"Full Bloom", emoji:"🌸", title:"21 days.",                 body:"You grew a tree. Not with force — with patience, repetition, and showing up." },
];

const DAY_MSG = {
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

function StagePopup({ stage, day, userName, onClose }) {
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

  const dayMsg  = DAY_MSG[day] || {};
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

function StagesModal({ stage, onClose }) {
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
function ShieldIcon({ size=14, color, filled=false, broken=false }) {
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

function StreakBadge({ streak, shields, perfectStreak, bestStreak, onUseShield }) {
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
                <div style={{ marginBottom:shields===0&&perfectStreak>=2&&perfectStreak<4?12:0 }}>
                  <p style={{ fontSize:10,fontWeight:600,color:T3,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10 }}>How Shields Work</p>
                  <div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:8 }}>
                    <div style={{ width:24,height:24,borderRadius:8,background:"rgba(91,155,213,0.12)",border:"1px solid rgba(91,155,213,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1 }}>
                      <ShieldIcon size={12} color="#5B9BD5" filled={true}/>
                    </div>
                    <div>
                      <p style={{ fontSize:12,fontWeight:600,color:T1,lineHeight:1.2,marginBottom:2 }}>Earn a shield</p>
                      <p style={{ fontSize:11,color:T3,lineHeight:1.4 }}>Log all 4 habits for 4 days in a row</p>
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

                {shields===0&&perfectStreak>=2&&perfectStreak<4&&(
                  <div style={{ marginTop:12,padding:"7px 9px",background:"rgba(91,155,213,0.08)",borderRadius:8,border:"1px solid rgba(91,155,213,0.18)" }}>
                    <p style={{ fontSize:10,fontWeight:600,color:"#5B9BD5",lineHeight:1.4 }}>{4-perfectStreak} more perfect day{(4-perfectStreak)!==1?"s":""} — shield incoming</p>
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

function HabitRow({ habit, checked, onToggle, dimmed }) {
  const { Icon, color, label, sub } = habit;
  return (
    <motion.button whileTap={{ scale:0.982 }} onClick={onToggle} transition={springT}
      style={{ display:"flex",alignItems:"center",gap:14,padding:"15px 16px",background:checked?`${color}0E`:S1,borderRadius:14,border:`1px solid ${checked?color+"28":SEP}`,width:"100%",textAlign:"left",cursor:"pointer",opacity:dimmed&&!checked?0.45:1,transition:"background 0.3s,border-color 0.3s,opacity 0.3s" }}>
      <motion.div animate={{ background:checked?color:S2 }} transition={{ duration:0.35 }}
        style={{ width:40,height:40,borderRadius:11,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
        <AnimatePresence mode="wait">
          {checked
            ? <motion.div key="c" initial={{ scale:0,rotate:-10 }} animate={{ scale:1,rotate:0 }} transition={springT}><Check size={17} color="#fff" strokeWidth={2.2}/></motion.div>
            : <motion.div key="i" initial={{ scale:0 }} animate={{ scale:1 }} transition={springT}><Icon size={17} color={color} strokeWidth={1.8}/></motion.div>}
        </AnimatePresence>
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
function CycleAISummary({ cycle, accent }) {
  const isCurrent = cycle.dates.includes("now");
  const cycleHabits = (cycle.habits||["water","move","read","sleep"])
    .map(id => ALL_HABITS_DEF?.find(h=>h.id===id) || HABITS_DEF.find(h=>h.id===id))
    .filter(Boolean);

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

  const habitName = (h) => h?.label.split(' ').slice(0,2).join(' ') || "";
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
function ForestHistory({ cycles, onClose, accent }) {
  const [selected, setSelected] = useState(null);
  const [shaking, setShaking] = useState(null);
  const [forestH, setForestH] = useState(220);
  const scrollRef = useRef(null);

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
                {(cycle.habits||[]).map(hid=>{
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


// ─── Leaderboard ─────────────────────────────────────────────────────────────
const TEAM = [
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

function Leaderboard({ accent, userName, onBack }) {
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

export default function HabitTree() {
  const [selDay,    setSelDay]    = useState(18);
  const [days,      setDays]      = useState(() => { const d = {}; for (let i=1;i<=TOTAL_DAYS;i++) d[i]={}; return d; });
  const [popup,     setPopup]     = useState(null);
  const [dayReward, setDayReward] = useState(null);
  const [tapped,    setTapped]    = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const mainScrollRef = useRef(null);
  const [userName,  setUserName]  = useState("Sumeet");
  const [stagesOpen,setStagesOpen]= useState(false);
  const [shields,   setShields]   = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("home"); // home | forest | leaderboard

  const totalDone = Object.values(days).reduce((a,d)=>a+HABITS.filter(h=>d[h.id]).length,0);
  const pct       = totalDone/TOTAL_POSSIBLE;
  const stage     = getTreeStage(pct);
  const accent    = SA[stage];
  const meta      = STAGE_META[stage];
  const dayDone      = (d) => HABITS.filter(h=>days[d]&&days[d][h.id]).length;
  const dayAny       = (d) => dayDone(d) > 0;  // any habit logged = streak counts
  const todayN       = dayDone(selDay);
  // Streak: consecutive days where at least 1 habit was logged
  const streak       = (()=>{ let s=0; for(let i=selDay;i>=1;i--){ if(dayAny(i))s++; else break; } return s; })();
  // Perfect streak: consecutive days where ALL habits logged (for shield earning)
  const perfectStreak= (()=>{ let s=0; for(let i=selDay;i>=1;i--){ if(dayDone(i)===HABITS.length)s++; else break; } return s; })();

  const THRESHOLDS = [0,0,0.2,0.4,0.6,0.8,1.0];
  const stagePct   = stage<5 ? Math.min(Math.max((pct-THRESHOLDS[stage])/(THRESHOLDS[stage+1]-THRESHOLDS[stage]),0),1) : 1;
  // Missed: no habits logged AND no shield available
  const currentDay  = 18;
  const allDone     = selDay===currentDay && todayN===HABITS.length;
  const isToday     = selDay === currentDay;
  // Past day with nothing logged = missed
  const rawMissed   = !isToday && dayDone(selDay) === 0;
  // On today's view: show dried effect only if yesterday was missed (not yet today)
  const yesterdayMissed = isToday && selDay > 1 && dayDone(selDay - 1) === 0;
  const isMissed    = (rawMissed || yesterdayMissed) && shields === 0;

  const genDays = (streakDays, seed, habitIds) => {
    const d = {};
    let s = seed;
    const rnd = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
    for (let day=1; day<=21; day++) {
      d[day] = {};
      habitIds.forEach(id => { d[day][id] = rnd() < (day<=streakDays ? 0.88 : 0.18); });
    }
    return d;
  };

  const PAST_CYCLES = [
    { id:1, label:"Cycle 1", dates:"Jan 1 – Jan 21",  stage:5, streak:18, highlight:"First full bloom.", habits:["water","move","read","sleep"],           days:genDays(18,101,["water","move","read","sleep"]) },
    { id:2, label:"Cycle 2", dates:"Feb 1 – Feb 21",  stage:4, streak:14, highlight:"Strong second week carried this one.", habits:["water","move","sleep","meditate"], days:genDays(14,202,["water","move","sleep","meditate"]) },
    { id:3, label:"Cycle 3", dates:"Feb 22 – Mar 14", stage:2, streak:6,  highlight:"Toughest cycle. Life got in the way.", habits:["water","read"],        days:genDays(6,303,["water","read"]) },
    { id:4, label:"Cycle 4", dates:"Mar 15 – Apr 4",  stage:5, streak:21, highlight:"Perfect streak.", habits:["water","move","read","sleep","meditate","journal"], days:genDays(21,404,["water","move","read","sleep","meditate","journal"]) },
    { id:5, label:"Cycle 5", dates:"Apr 5 – Apr 25",  stage:3, streak:9,  highlight:"Lost momentum late.", habits:["water","move","journal"],              days:genDays(9,505,["water","move","journal"]) },
    { id:6, label:"Cycle 6", dates:"Apr 26 – May 16", stage:4, streak:13, highlight:"Back on track.", habits:["water","move","read","sleep","journal"],    days:genDays(13,606,["water","move","read","sleep","journal"]) },
    { id:7, label:"Cycle 7", dates:"Mar 22 – now",    stage:stage, streak:streak, highlight:"In progress.", habits:HABITS_DEF.map(h=>h.id),               days:days },
  ].map(c => ({ ...c, habitsTotal: Object.values(c.days).reduce((a,d)=>a+Object.values(d).filter(Boolean).length,0) }));

  const toggle = (hid) => {
    const cur    = stage;
    const wasChk = !!(days[selDay]&&days[selDay][hid]);
    haptic.light();
    setTapped(hid); setTimeout(()=>setTapped(null),500);
    setDays(prev=>{
      const next = {...prev,[selDay]:{...prev[selDay],[hid]:!(prev[selDay]&&prev[selDay][hid])}};
      const nt   = Object.values(next).reduce((a,d)=>a+HABITS.filter(h=>d[h.id]).length,0);
      const ns   = getTreeStage(nt/TOTAL_POSSIBLE);
      if(ns>cur) setTimeout(()=>{ haptic.unlock(); setPopup(ns); },200);
      const td = HABITS.filter(h=>next[selDay]&&next[selDay][h.id]).length;
      if(td===HABITS.length&&!wasChk){
        haptic.success();
        if(mainScrollRef.current) {
          mainScrollRef.current.scrollTo({ top:0, behavior:"smooth" });
        }
        setCelebrating(true);
        setTimeout(()=>setCelebrating(false), 1800);
        setTimeout(()=>setDayReward(selDay), 300);
        const last4 = [selDay-3,selDay-2,selDay-1,selDay];
        const perfect4 = selDay>=4 && last4.every(d=>HABITS.every(h=>next[d]&&next[d][h.id]));
        if(perfect4){ haptic.medium(); setShields(s=>Math.min(s+1,2)); }
      }
      return next;
    });
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
      `}</style>

      {popup!==null && <StagePopup stage={popup} onClose={()=>setPopup(null)}/>}
      {dayReward!==null && popup===null && <StagePopup stage={stage} day={dayReward} userName={userName} onClose={()=>setDayReward(null)}/>}

      <AnimatePresence>
        {showHistory && <ForestHistory cycles={PAST_CYCLES} accent={accent} onClose={()=>{ setShowHistory(false); setActiveTab("home"); }}/>}
      </AnimatePresence>

      <AnimatePresence>
        {activeTab==="leaderboard" && <Leaderboard accent={accent} userName={userName} onBack={()=>setActiveTab("home")}/>}
      </AnimatePresence>

      {/* Bottom nav */}
      <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:480,zIndex:100,
        background:"rgba(10,10,10,0.92)",backdropFilter:"blur(16px)",
        WebkitBackdropFilter:"blur(16px)",
        borderTop:"1px solid rgba(255,255,255,0.06)",
        display:"flex",alignItems:"center",justifyContent:"space-around",
        padding:"10px 0 24px" }}>
        {[
          { id:"forest", label:"Forest", icon:(color)=>(
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L8 8H10L6 14H9L5 20H19L15 14H18L14 8H16L12 2Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
              <line x1="12" y1="20" x2="12" y2="23" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )},
          { id:"leaderboard", label:"Team", icon:(color)=>(
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="8" width="6" height="13" rx="1" stroke={color} strokeWidth="1.5"/>
              <rect x="2" y="13" width="6" height="8" rx="1" stroke={color} strokeWidth="1.5"/>
              <rect x="16" y="11" width="6" height="10" rx="1" stroke={color} strokeWidth="1.5"/>
            </svg>
          )},
        ].map(tab=>(
          <motion.button key={tab.id} whileTap={{ scale:0.9 }}
            onClick={()=>{
              haptic.light();
              setActiveTab(tab.id);
              if(tab.id==="forest"){ setShowHistory(true); }
              else { setShowHistory(false); }
            }}
            style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,
              background:"none",border:"none",cursor:"pointer",padding:"4px 32px" }}>
            {tab.icon(activeTab===tab.id ? accent : "rgba(240,237,232,0.3)")}
            <span style={{ fontSize:10,fontWeight:600,
              color:activeTab===tab.id?accent:"rgba(240,237,232,0.3)",
              letterSpacing:"0.04em" }}>{tab.id==="leaderboard"?"Ranking":tab.label}</span>
          </motion.button>
        ))}
      </div>

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
        {<StreakBadge streak={streak} shields={shields} perfectStreak={perfectStreak} bestStreak={18} onUseShield={()=>setShields(s=>Math.max(s-1,0))}/>}

        {/* Tree */}
        <div
          onClick={()=>{ haptic.light(); setStagesOpen(true); }}
          style={{ position:"absolute",top:0,left:0,right:0,bottom:72,display:"flex",alignItems:"flex-end",justifyContent:"center",cursor:"pointer" }}>

          {/* Water system — converging drops + soil ripples + accumulating glow */}
          {stage>=1&&!isMissed&&(()=>{
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
                  const stageSize = THRESHOLDS[stage+1] - THRESHOLDS[stage];
                  const left = Math.ceil((1 - stagePct) * stageSize * TOTAL_POSSIBLE);
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

      {/* Daily message — between hero and habits, first thing read after scene */}
      <AnimatePresence mode="wait">
        {!allDone && (
          <motion.div
            key={`msg-${currentDay}-${isMissed}`}
            initial={{ opacity:0, y:8 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0 }}
            transition={easeT}
            style={{ padding:"24px 20px 4px" }}>
            <p style={{
              fontSize: isMissed ? 15 : 18,
              fontWeight: isMissed ? 400 : 500,
              color: isMissed ? "rgba(196,154,90,0.65)" : T2,
              lineHeight:1.55,
              letterSpacing:"-0.1px",
            }}>
              {isMissed
                ? (DAY_MSG[currentDay]||{missed:()=>""}).missed(userName)
                : (DAY_MSG[currentDay]||{today:()=>""}).today(userName)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BODY */}
      <div style={{ padding:"20px 16px 140px",display:"flex",flexDirection:"column",gap:28 }}>

        {/* TODAY */}
        <section style={{ animation:"fadeUp .5s ease both" }}>
          <div style={{ display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:14 }}>
            <div>
              <h2 style={{ fontSize:22,fontWeight:600,
                color:selDay===currentDay?T1:"rgba(240,237,232,0.5)",
                letterSpacing:"-0.4px",lineHeight:1,display:"flex",alignItems:"center",gap:8,margin:0 }}>
                {selDay===currentDay ? "Today" : `Day ${selDay}`}
                {isMissed&&<span style={{ fontSize:14,opacity:0.6 }}>🍂</span>}
              </h2>
            </div>
            <span style={{ fontSize:13,color:T3 }}>
              {todayN < HABITS.length ? `${todayN}/${HABITS.length}` : ""}
            </span>
          </div>



          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {HABITS_DEF.map(habit=>(
              <HabitRow key={habit.id} habit={habit}
                checked={!!(days[selDay]&&days[selDay][habit.id])}
                onToggle={()=>toggle(habit.id)}
                dimmed={false}/>
            ))}
          </div>
        </section>

        {/* 21 DAYS — heat map */}
        <section style={{ animation:"fadeUp .5s .08s ease both" }}>

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
                  const done    = dayDone(day);
                  const sel     = day===selDay;
                  const today   = day===currentDay;
                  const comp    = done===HABITS.length;
                  const future  = day > currentDay && done === 0;
                  const missed  = done===0 && day<currentDay;

                  const heat = [
                    "rgba(255,255,255,0.04)",
                    `${accent}30`,
                    `${accent}55`,
                    `${accent}80`,
                    accent,
                  ][done];

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

                      {/* Day number — today always, selected always, past empty */}
                      {(sel || today || (done===0 && !future)) && (
                        <span style={{
                          fontSize:9, fontWeight:sel||today?700:400,
                          color: today&&!sel ? accent : sel ? T1 : missed ? "rgba(139,99,64,0.3)" : "rgba(255,255,255,0.08)",
                          lineHeight:1,
                        }}>{day}</span>
                      )}

                      {/* Checkmark on complete */}
                      {comp&&!sel&&(
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4.2 7.2L8 3" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
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
          const possible      = 7 * HABITS.length;
          let completed       = 0;
          for(let d = prevWeekStart; d <= prevWeekEnd; d++){
            HABITS.forEach(h => { if(days[d]?.[h.id]) completed++; });
          }
          const pct = Math.round(completed/possible*100);

          const habitTotals = HABITS.map(h => ({
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
    </div>
  );
}