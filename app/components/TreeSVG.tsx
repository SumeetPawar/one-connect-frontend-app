'use client';
import React from "react";

export function TreeSVG({ stage, pct }: { stage: number; pct: number }) {
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
