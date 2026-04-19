'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '../components/BottomNav';
import Header from '../commponents/Header';

/* ─────────────────────────────────────────────
   Dark theme tokens
   #111113  page bg
   #1C1C1E  card bg
   #2C2C2E  elevated surface
   #3A3A3C  input / pill bg
   #F2F2F7  primary text
   #AEAEB2  secondary text
   #636366  tertiary / disabled
   rgba(255,255,255,0.08) hairline border
   ───────────────────────────────────────────── */

type PostType = 'event' | 'announcement' | 'celebration' | 'tip' | 'update' | 'poll' | 'rsvp';

type RsvpOption = { id: string; label: string; icon?: string };
type RsvpSection = {
  id: string;
  question: string;
  hint?: string;
  multi?: boolean;          // allow multiple selections
  required?: boolean;
  options: RsvpOption[];
};
type SemanticReaction = 'heart' | 'in' | 'excited' | 'proud' | 'wow' | 'insight';

const REACTIONS: Record<SemanticReaction, { label: string; color: string; glow: string }> = {
  heart:    { label: 'Love this',   color: '#FF5C87', glow: 'rgba(255,92,135,0.55)'  },
  in:       { label: "I'm in",      color: '#9D82FF', glow: 'rgba(157,130,255,0.55)' },
  excited:  { label: 'Lit',         color: '#FF8C55', glow: 'rgba(255,140,85,0.55)'  },
  proud:    { label: 'Proud',       color: '#FFD07A', glow: 'rgba(255,208,122,0.55)' },
  wow:      { label: 'Amazing',     color: '#5DCFFF', glow: 'rgba(93,207,255,0.55)'  },
  insight:  { label: 'Insightful',  color: '#FFD860', glow: 'rgba(255,216,96,0.55)'  },
};

/* ─────────────────────────────────────────────
   Custom reaction SVG icons (gradient-filled)
   ───────────────────────────────────────────── */
const ReactionIcon = ({ type, size = 32 }: { type: SemanticReaction; size?: number }) => {
  const id = `rg-${type}`;
  const icons: Record<SemanticReaction, React.ReactElement> = {
    heart: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <defs>
          <radialGradient id={id} cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FF8FB0" />
            <stop offset="100%" stopColor="#FF2D6B" />
          </radialGradient>
        </defs>
        <path d="M20 34s-14-9.5-14-18.5C6 10.15 10.15 6 15 6c2.5 0 4.9 1.15 6.5 3 .4.5.6.8.5.8s.1-.3.5-.8C24.1 7.15 26.5 6 29 6c4.85 0 9 4.15 9 9.5C38 24.5 24 34 20 34z"
          fill={`url(#${id})`} />
        <path d="M20 34s-14-9.5-14-18.5C6 10.15 10.15 6 15 6c2.5 0 4.9 1.15 6.5 3 .4.5.6.8.5.8s.1-.3.5-.8C24.1 7.15 26.5 6 29 6c4.85 0 9 4.15 9 9.5C38 24.5 24 34 20 34z"
          fill="url(#heart-shine)" opacity="0.35" />
        <defs>
          <linearGradient id="heart-shine" x1="14" y1="6" x2="26" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    ),
    excited: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id={id} x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE04B" />
            <stop offset="55%" stopColor="#FF8C2A" />
            <stop offset="100%" stopColor="#FF4820" />
          </linearGradient>
        </defs>
        {/* Outer flame */}
        <path d="M20 37c-8 0-13-5.5-13-12 0-4 2-7.5 5-10-0.5 3 1 5.5 3 7 0-5 3-9.5 7-12-1 4 1 7 3 9 1-2.5 1-5 0-7 4 3.5 6 8.5 6 13C31 31.5 26 37 20 37z"
          fill={`url(#${id})`} />
        {/* Inner core */}
        <path d="M20 37c-4.5 0-7.5-3.5-7.5-7.5 0-2.5 1.5-5 3.5-6.5 0 2 1 3.5 2.5 4.5.5-3 2-5.5 4-7-.5 2.5 0 4.5 1.5 6 1.5-2 1.5-4.5.5-6.5 2.5 2 4 5.5 4 9C28.5 33.5 25 37 20 37z"
          fill="#FFE566" opacity="0.7" />
      </svg>
    ),
    proud: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id={id} x1="8" y1="8" x2="32" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE880" />
            <stop offset="100%" stopColor="#FFAA20" />
          </linearGradient>
        </defs>
        {/* Upper arm */}
        <rect x="14" y="18" width="14" height="8" rx="4" fill={`url(#${id})`} />
        {/* Forearm */}
        <rect x="18" y="10" width="10" height="14" rx="5" fill={`url(#${id})`} />
        {/* Bicep bump */}
        <ellipse cx="14" cy="20" rx="5" ry="6" fill={`url(#${id})`} />
        {/* Fist */}
        <rect x="20" y="6" width="9" height="8" rx="3.5" fill={`url(#${id})`} />
        {/* Knuckle shine */}
        <ellipse cx="24" cy="8" rx="3.5" ry="1.5" fill="#fff" opacity="0.3" />
      </svg>
    ),
    wow: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <defs>
          <radialGradient id={id} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#AAEEFF" />
            <stop offset="100%" stopColor="#1ABFFF" />
          </radialGradient>
          <radialGradient id={`${id}-inner`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* 5-point star */}
        <path
          d="M20 4l3.9 8.3 9.1 1.2-6.7 6.2 1.7 9-8-4.5-8 4.5 1.7-9L6.9 13.5l9.1-1.2z"
          fill={`url(#${id})`}
        />
        {/* Star shine overlay */}
        <path
          d="M20 4l3.9 8.3 9.1 1.2-6.7 6.2 1.7 9-8-4.5-8 4.5 1.7-9L6.9 13.5l9.1-1.2z"
          fill={`url(#${id}-inner)`}
          opacity="0.4"
        />
        {/* Sparkle rays */}
        <line x1="20" y1="32" x2="20" y2="36" stroke="#5DCFFF" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="28" x2="33" y2="31" stroke="#5DCFFF" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="10" y1="28" x2="7" y2="31" stroke="#5DCFFF" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="35" y1="18" x2="38" y2="17" stroke="#5DCFFF" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="5" y1="18" x2="2" y2="17" stroke="#5DCFFF" strokeWidth="1.5" strokeLinecap="round" />
        {/* Tiny sparkle dots */}
        <circle cx="27" cy="33" r="1.2" fill="#AAEEFF" />
        <circle cx="13" cy="33" r="1.2" fill="#AAEEFF" />
      </svg>
    ),
    in: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id={id} x1="8" y1="4" x2="32" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C4ADFF" />
            <stop offset="100%" stopColor="#7B55F5" />
          </linearGradient>
        </defs>
        {/* Palm */}
        <rect x="14" y="16" width="14" height="18" rx="5" fill={`url(#${id})`} />
        {/* Fingers — index */}
        <rect x="22" y="7" width="5" height="14" rx="2.5" fill={`url(#${id})`} />
        {/* Middle */}
        <rect x="17" y="5" width="5" height="15" rx="2.5" fill={`url(#${id})`} />
        {/* Ring */}
        <rect x="12" y="8" width="5" height="13" rx="2.5" fill={`url(#${id})`} />
        {/* Pinky */}
        <rect x="27" y="11" width="4.5" height="11" rx="2.25" fill={`url(#${id})`} />
        {/* Thumb */}
        <rect x="8" y="18" width="7" height="5" rx="2.5" fill={`url(#${id})`} transform="rotate(-15 8 18)" />
        {/* Shine */}
        <ellipse cx="20" cy="8" rx="4" ry="1.5" fill="#fff" opacity="0.3" />
      </svg>
    ),
    insight: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <defs>
          <radialGradient id={id} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFF176" />
            <stop offset="100%" stopColor="#FFB300" />
          </radialGradient>
        </defs>
        {/* Glow ring */}
        <circle cx="20" cy="18" r="13" fill={`url(#${id})`} opacity="0.18" />
        {/* Bulb body */}
        <path d="M14 22c0-3.3 2.7-6 6-6s6 2.7 6 6c0 2.5-1.5 4.5-3.5 5.5V29h-5v-1.5C15.5 26.5 14 24.5 14 22z"
          fill={`url(#${id})`} />
        {/* Base rings */}
        <rect x="16.5" y="29" width="7" height="2" rx="1" fill="#FFB300" />
        <rect x="17" y="31" width="6" height="2" rx="1" fill="#FF8F00" />
        {/* Filament shine */}
        <path d="M18 22.5c.8-1.5 2.5-2 3.5-1.2" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        {/* Rays */}
        <line x1="20" y1="5" x2="20" y2="8" stroke="#FFE066" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="29.5" y1="9" x2="27.5" y2="11" stroke="#FFE066" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="10.5" y1="9" x2="12.5" y2="11" stroke="#FFE066" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="33" y1="18" x2="30" y2="18" stroke="#FFE066" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="7" y1="18" x2="10" y2="18" stroke="#FFE066" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  };
  return icons[type];
};

// Dark tints — subtle but readable on #1C1C1E
const TYPE_META: Record<PostType, { label: string; icon: string; accent: string; tint: string }> = {
  event:        { label: 'EVENT',        icon: '📅', accent: '#9D82FF', tint: 'rgba(124,92,255,0.18)' },
  rsvp:         { label: 'RSVP',         icon: '✅', accent: '#5DCFFF', tint: 'rgba(93,207,255,0.14)' },
  announcement: { label: 'ANNOUNCEMENT', icon: '📣', accent: '#AEAEB2', tint: 'rgba(255,255,255,0.08)' },
  celebration:  { label: 'CELEBRATION',  icon: '🎉', accent: '#FF9070', tint: 'rgba(255,120,80,0.18)' },
  tip:          { label: 'WELLNESS',     icon: '✨', accent: '#6DD8FF', tint: 'rgba(92,203,255,0.16)' },
  update:       { label: 'UPDATE',       icon: '📋', accent: '#C39FFF', tint: 'rgba(165,124,255,0.18)' },
  poll:         { label: 'POLL',         icon: '🗳️', accent: '#4CD97B', tint: 'rgba(52,199,89,0.16)' },
};

type PollOption = { id: string; label: string; votes: number };

type MediaItem =
  | { type: 'image'; url: string }
  | { type: 'video'; poster: string; duration: string; videoUrl: string };

type CommentReactionKey = 'love' | 'haha' | 'wow' | 'clap' | 'fire';

const COMMENT_REACTIONS: Record<CommentReactionKey, { label: string; color: string; glow: string }> = {
  love:  { label: 'Love',  color: '#FF5C87', glow: 'rgba(255,92,135,0.5)'  },
  haha:  { label: 'Haha',  color: '#FFD07A', glow: 'rgba(255,208,122,0.5)' },
  wow:   { label: 'Wow',   color: '#5DCFFF', glow: 'rgba(93,207,255,0.5)'  },
  clap:  { label: 'Clap',  color: '#C39FFF', glow: 'rgba(195,159,255,0.5)' },
  fire:  { label: 'Fire',  color: '#FF8C55', glow: 'rgba(255,140,85,0.5)'  },
};

const CommentReactionIcon = ({ type, size = 24 }: { type: CommentReactionKey; size?: number }) => {
  const cid = `crg-${type}`;
  switch (type) {
    case 'love':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <defs>
            <radialGradient id={cid} cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FF8FB0" />
              <stop offset="100%" stopColor="#FF2D6B" />
            </radialGradient>
          </defs>
          <path d="M16 27S4 19 4 11.5C4 8.4 6.7 6 10 6c1.9 0 3.7.9 5 2.4C16.3 6.9 18.1 6 20 6c3.3 0 6 2.4 6 5.5C26 19 14 27 16 27z"
            fill={`url(#${cid})`} />
          <path d="M10 9c-1.2.5-2 1.7-2 3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        </svg>
      );
    case 'haha':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <defs>
            <radialGradient id={cid} cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFE566" />
              <stop offset="100%" stopColor="#FFA500" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="12" fill={`url(#${cid})`} />
          {/* Eyes shut — arcs */}
          <path d="M11 13c.8-1 2-1 2.5 0" stroke="#7A4800" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M18.5 13c.8-1 2-1 2.5 0" stroke="#7A4800" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Big open smile */}
          <path d="M10 17.5c1.2 4.5 10.8 4.5 12 0" fill="#7A4800" />
          <path d="M10 17.5c1.2 4.5 10.8 4.5 12 0" stroke="#7A4800" strokeWidth="0.5" />
          {/* Tongue */}
          <ellipse cx="16" cy="20.5" rx="3" ry="1.8" fill="#FF6B8A" />
          {/* Shine */}
          <ellipse cx="13" cy="12" rx="2.5" ry="1.2" fill="#fff" opacity="0.35" />
          {/* Tear drops */}
          <ellipse cx="9" cy="15" rx="1.2" ry="1.8" fill="#80CCFF" opacity="0.8" />
          <ellipse cx="23" cy="15" rx="1.2" ry="1.8" fill="#80CCFF" opacity="0.8" />
        </svg>
      );
    case 'wow':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <defs>
            <radialGradient id={cid} cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFE566" />
              <stop offset="100%" stopColor="#FFA500" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="12" fill={`url(#${cid})`} />
          {/* Raised brows */}
          <path d="M10.5 11.5c1-.8 2.5-.8 3.5 0" stroke="#7A4800" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          <path d="M18 11.5c1-.8 2.5-.8 3.5 0" stroke="#7A4800" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          {/* Wide eyes */}
          <ellipse cx="13" cy="14" rx="2" ry="2.2" fill="#7A4800" />
          <ellipse cx="19" cy="14" rx="2" ry="2.2" fill="#7A4800" />
          <circle cx="13.6" cy="13.3" r="0.7" fill="#fff" />
          <circle cx="19.6" cy="13.3" r="0.7" fill="#fff" />
          {/* O mouth */}
          <ellipse cx="16" cy="21" rx="3" ry="3.5" fill="#7A4800" />
          <ellipse cx="16" cy="21" rx="2" ry="2.5" fill="#5A3200" />
          {/* Shine */}
          <ellipse cx="13" cy="12" rx="2.5" ry="1.2" fill="#fff" opacity="0.35" />
        </svg>
      );
    case 'clap':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id={cid} x1="4" y1="4" x2="28" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#DFC0FF" />
              <stop offset="100%" stopColor="#9B5CF6" />
            </linearGradient>
          </defs>
          {/* Left hand palm */}
          <path d="M10 18c-1-3 0-8 1.5-10 .8-1.2 2.2-.8 2.5.2L16 14" fill={`url(#${cid})`} />
          {/* Right hand palm */}
          <path d="M22 18c1-3 0-8-1.5-10-.8-1.2-2.2-.8-2.5.2L16 14" fill={`url(#${cid})`} />
          {/* Joined palms */}
          <ellipse cx="16" cy="18" rx="6" ry="8" fill={`url(#${cid})`} />
          {/* Finger lines */}
          <path d="M13 11c0-1.5 1-2.5 2-2" stroke="#fff" strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />
          <path d="M19 11c0-1.5-1-2.5-2-2" stroke="#fff" strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />
          {/* Shine */}
          <ellipse cx="14" cy="15" rx="2" ry="1" fill="#fff" opacity="0.3" transform="rotate(-20 14 15)" />
          {/* Impact lines */}
          <line x1="7" y1="10" x2="5" y2="8" stroke="#C39FFF" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="25" y1="10" x2="27" y2="8" stroke="#C39FFF" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="7" x2="16" y2="5" stroke="#C39FFF" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="10" y1="7" x2="9" y2="5.5" stroke="#C39FFF" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="22" y1="7" x2="23" y2="5.5" stroke="#C39FFF" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'fire':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id={cid} x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFE04B" />
              <stop offset="55%" stopColor="#FF8C2A" />
              <stop offset="100%" stopColor="#FF4820" />
            </linearGradient>
          </defs>
          <path d="M16 29c-6 0-10-4-10-9 0-3 1.5-5.5 4-7.5-.4 2 .8 4 2.5 5 0-4 2-7 5-9-.8 3 .8 5.5 2.5 7 .8-2 .8-4 0-5.5 3 2.5 4.5 6.5 4.5 10C24 25 21 29 16 29z"
            fill={`url(#${cid})`} />
          <path d="M16 29c-3.5 0-5.5-2.5-5.5-5.5 0-2 1.2-3.8 2.8-5 0 1.5.8 2.8 2 3.5.4-2 1.5-4 3-5.2-.4 2 0 3.5 1.2 4.7 1.2-1.5 1.2-3.5.4-5.2 2 1.5 3 4 3 6.2C22.9 26.5 20 29 16 29z"
            fill="#FFE566" opacity="0.75" />
        </svg>
      );
  }
};

type Comment = {
  id: string;
  author: string;
  authorColor: string;
  text: string;
  time: string;
  likes: number;
  myLiked?: boolean;
  emojiReaction?: CommentReactionKey | null;
  emojiCounts?: Partial<Record<CommentReactionKey, number>>;
  replies?: Comment[];
  replyTo?: string;
};

type Post = {
  id: string;
  type: PostType;
  department: string;
  title: string;
  description: string;
  media?: MediaItem[];
  startsAt?: Date;
  location?: string;
  totalAttendees?: number;
  joinedInLastHour?: number;
  pollOptions?: PollOption[];
  pollDeadline?: Date;
  pollTotalVotes?: number;
  myVote?: string | null;
  pollMultiSelect?: boolean;
  rsvpSections?: RsvpSection[];
  rsvpDeadline?: Date;
  rsvpCapacity?: number;
  rsvpCount?: number;
  reactions: Partial<Record<SemanticReaction, number>>;
  myReaction?: SemanticReaction | null;
  comments: number;
  commentsList?: Comment[];
  saved: boolean;
  postedBy: string;
  postedByRole: string;
  postedAt: string;
  postedByColor: string;
};

/* ─────────────────────────────────────────────
   Mock data
   ───────────────────────────────────────────── */
const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    type: 'event',
    department: 'Engineering',
    title: 'Sunrise Step Challenge — Week 3 Closing Walk',
    description:
      'The engineering squad crushed 1.2M steps this week 👏 Closing the challenge with a sunrise walk, coffee and a ceremony for the top three. Come join us at Riverside Park — we\'ll have coffee, medals, and the ceremony for the Top 3 step champions. Bring a friend, bring your walking shoes, and let\'s close out Week 3 strong together.',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 62),
    location: 'Riverside Park · Main entrance',
    totalAttendees: 38,
    joinedInLastHour: 3,
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1544216717-3bbf52512659?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1530143584546-02191bc84eb5?w=900&q=80&fit=crop' },
    ],
    reactions: { in: 34, excited: 18, proud: 12 },
    myReaction: null,
    comments: 23,
    commentsList: [
      { id: 'c1', author: 'Rahul M', authorColor: '#6DD8FF', text: 'Can\'t wait! Setting my alarm for 5:45am 🌅', time: '1h', likes: 4, emojiCounts: { fire: 2, clap: 1 } as Partial<Record<CommentReactionKey,number>>, replies: [
        { id: 'c1r1', author: 'Sneha P', authorColor: '#FF9070', text: 'Same!! Let\'s walk together 👟', time: '55m', likes: 2, replyTo: 'Rahul M' },
      ]},
      { id: 'c2', author: 'Sneha P', authorColor: '#FF9070', text: 'I\'m bringing my whole team from Design. We\'re ready 💪', time: '45m', likes: 7, myLiked: true, emojiCounts: { love: 4, fire: 3 } as Partial<Record<CommentReactionKey,number>> },
      { id: 'c3', author: 'Dev T', authorColor: '#FFD07A', text: 'Will there be parking near the main entrance?', time: '30m', likes: 1 },
      { id: 'c4', author: 'Aanya K', authorColor: '#9D82FF', text: '@Dev T yes, the East lot opens at 5:30am 🙌', time: '28m', likes: 3, replyTo: 'Dev T', emojiCounts: { clap: 1 } as Partial<Record<CommentReactionKey,number>> },
      { id: 'c5', author: 'Priya S', authorColor: '#4CD97B', text: 'Already at 12,400 steps today warming up haha', time: '10m', likes: 12, emojiCounts: { haha: 5, fire: 7 } as Partial<Record<CommentReactionKey,number>> },
    ],
    saved: false,
    postedBy: 'Aanya Kapoor',
    postedByRole: 'People Ops',
    postedAt: '2h',
    postedByColor: '#9D82FF',
  },
  {
    id: 'p-gallery',
    type: 'celebration',
    department: 'All Teams',
    title: 'Earth Run 2026 — photo dump 📸',
    description: 'Over 200 colleagues across 6 cities joined the Earth Run this year. Here\'s a glimpse of all the smiles, sweat, and team spirit. Thank you to everyone who laced up — you made this special.',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1538397708861-87a60a2a8fe6?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1504025468847-0e438279542c?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=900&q=80&fit=crop' },
    ],
    reactions: { proud: 112, heart: 88, excited: 45 },
    myReaction: null,
    comments: 34,
    commentsList: [
      { id: 'c1', author: 'Marcus K', authorColor: '#6DD8FF', text: 'The Mumbai crew killed it this year 🔥', time: '3h', likes: 11, emojiCounts: { fire: 6, clap: 5 } as Partial<Record<CommentReactionKey,number>>, replies: [
        { id: 'c1r1', author: 'Priya S', authorColor: '#4CD97B', text: 'Representing!! 🏆', time: '2h', likes: 4, replyTo: 'Marcus K' },
        { id: 'c1r2', author: 'Rahul M', authorColor: '#6DD8FF', text: 'Next year Delhi is taking the crown 👀', time: '2h', likes: 2, replyTo: 'Marcus K', emojiCounts: { haha: 3 } as Partial<Record<CommentReactionKey,number>> },
      ]},
      { id: 'c2', author: 'Lisa T', authorColor: '#FF6B8A', text: 'Photo 4 is literally me crying at the finish line 😭❤️', time: '2h', likes: 22, myLiked: true, emojiCounts: { love: 14, wow: 8 } as Partial<Record<CommentReactionKey,number>> },
      { id: 'c3', author: 'Kiran B', authorColor: '#FFD07A', text: 'Next year we need matching jerseys!', time: '1h', likes: 8, emojiCounts: { clap: 6, haha: 2 } as Partial<Record<CommentReactionKey,number>> },
    ],
    saved: false,
    postedBy: 'StepConnect',
    postedByRole: 'Highlights',
    postedAt: '5h',
    postedByColor: '#FF9070',
  },
  {
    id: 'p-poll-1',
    type: 'poll',
    department: 'People',
    title: 'Which time works best for the Q2 team offsite?',
    description: 'We have three shortlisted dates. Vote below — results will confirm the booking by Friday.',
    pollOptions: [
      { id: 'o1', label: 'May 14–15 (Wed–Thu)', votes: 18 },
      { id: 'o2', label: 'May 21–22 (Wed–Thu)', votes: 11 },
      { id: 'o3', label: 'June 4–5 (Wed–Thu)',  votes: 7  },
    ],
    pollDeadline: new Date(Date.now() + 1000 * 60 * 60 * 48),
    pollTotalVotes: 36,
    myVote: null,
    pollMultiSelect: false,
    reactions: { heart: 14, insight: 6 },
    myReaction: null,
    comments: 8,
    saved: false,
    postedBy: 'Aanya Kapoor',
    postedByRole: 'People Ops',
    postedAt: '3h',
    postedByColor: '#9D82FF',
  },
  {
    id: 'p2',
    type: 'celebration',
    department: 'Engineering',
    title: 'Priya just hit 100,000 lifetime steps 🏆',
    description: 'From everyone on the team — incredible dedication. 47 marathons worth of walking this year alone. Priya started the challenge in January with zero streak and never missed a single day. This is what consistency looks like.',
    media: [
      {
        type: 'video',
        poster: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=900&q=80&fit=crop',
        duration: '0:42',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      },
      { type: 'image', url: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80&fit=crop' },
    ],
    reactions: { heart: 87, proud: 34, excited: 12 },
    myReaction: 'heart',
    comments: 18,
    commentsList: [
      { id: 'c1', author: 'Aanya K', authorColor: '#9D82FF', text: 'Priya you are an absolute legend!! 👑', time: '3h', likes: 18, emojiCounts: { love: 9, wow: 9 } as Partial<Record<CommentReactionKey,number>> },
      { id: 'c2', author: 'Priya S', authorColor: '#4CD97B', text: 'Honestly can\'t believe it. Thank you all so much 🙏', time: '3h', likes: 31, myLiked: true, emojiCounts: { love: 18, wow: 7, clap: 6 } as Partial<Record<CommentReactionKey,number>>, replies: [
        { id: 'c2r1', author: 'Dev T', authorColor: '#FFD07A', text: 'You earned every single one of those steps 🙌', time: '2h', likes: 5, replyTo: 'Priya S' },
      ]},
      { id: 'c3', author: 'Dev T', authorColor: '#FFD07A', text: 'Bro that\'s 47 marathons. Let that sink in.', time: '2h', likes: 14, emojiCounts: { fire: 8, wow: 6 } as Partial<Record<CommentReactionKey,number>> },
    ],
    saved: false,
    postedBy: 'StepConnect',
    postedByRole: 'Milestones',
    postedAt: '4h',
    postedByColor: '#FF9070',
  },
  {
    id: 'p3',
    type: 'announcement',
    department: 'People',
    title: 'Office closed Monday · Earth Day',
    description: 'Monday 22 April offices are closed. Global Steps Challenge runs all day — check the app for virtual meetups and the team leaderboard.',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1444492417251-9c84a5fa18e0?w=900&q=80&fit=crop' },
    ],
    reactions: { heart: 24, insight: 8 },
    myReaction: null,
    comments: 5,
    saved: true,
    postedBy: 'HR',
    postedByRole: 'People Team',
    postedAt: '1d',
    postedByColor: '#AEAEB2',
  },
  {
    id: 'p-poll-2',
    type: 'poll',
    department: 'Engineering',
    title: 'Should we make walking 1:1s a permanent team ritual?',
    description: 'We piloted walking 1:1s this month — average +3,400 steps/day per participant. Worth making it official?',
    pollOptions: [
      { id: 'o1', label: 'Yes — make it the default',  votes: 29 },
      { id: 'o2', label: 'Yes — but keep it optional', votes: 14 },
      { id: 'o3', label: 'No — prefer desk meetings',  votes: 3  },
    ],
    pollDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    pollTotalVotes: 46,
    myVote: 'o1',
    pollMultiSelect: false,
    reactions: { insight: 22, heart: 9 },
    myReaction: 'insight',
    comments: 15,
    saved: false,
    postedBy: 'Marcus King',
    postedByRole: 'Engineering Lead',
    postedAt: '5h',
    postedByColor: '#6DD8FF',
  },
  {
    id: 'p4',
    type: 'tip',
    department: 'People',
    title: 'Two minutes of breathing before 3pm meetings',
    description: 'A short guided breath reduces cortisol and sharpens focus. New in the Meditation tab — "Pre-meeting Reset".',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=80&fit=crop' },
    ],
    reactions: { heart: 42, insight: 19 },
    myReaction: null,
    comments: 6,
    saved: false,
    postedBy: 'Wellness Team',
    postedByRole: 'Daily tip',
    postedAt: '6h',
    postedByColor: '#6DD8FF',
  },
  {
    id: 'p5',
    type: 'update',
    department: 'People',
    title: 'New benefit · 4 mental health days per year',
    description: 'Starting May 1, all full-time staff receive 4 dedicated mental health days per year, separate from PTO. No justification required. We believe rest is part of performance — these days are yours to use however helps you most.',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1484627147104-f5197bcd6651?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&q=80&fit=crop' },
    ],
    reactions: { heart: 156, insight: 34 },
    myReaction: null,
    comments: 41,
    commentsList: [
      { id: 'c1', author: 'Neha R', authorColor: '#FF6B8A', text: 'This is huge. Thank you for listening to us 💜', time: '1d', likes: 41, myLiked: true, emojiCounts: { love: 22, wow: 12, clap: 7 } as Partial<Record<CommentReactionKey,number>> },
      { id: 'c2', author: 'Vikram S', authorColor: '#6DD8FF', text: 'Industry-leading move. Really proud to work here.', time: '1d', likes: 27, emojiCounts: { clap: 14, love: 13 } as Partial<Record<CommentReactionKey,number>>, replies: [
        { id: 'c2r1', author: 'Tanvi M', authorColor: '#4CD97B', text: 'Completely agree 🙌', time: '22h', likes: 4, replyTo: 'Vikram S' },
      ]},
      { id: 'c3', author: 'Tanvi M', authorColor: '#4CD97B', text: 'Does it roll over to the next year if unused?', time: '22h', likes: 5 },
      { id: 'c4', author: 'Amp', authorColor: '#C39FFF', text: '@Tanvi yes — unused days roll over once, max 2 carry-forward.', time: '20h', likes: 19, replyTo: 'Tanvi M', emojiCounts: { clap: 11, love: 8 } as Partial<Record<CommentReactionKey,number>> },
    ],
    saved: false,
    postedBy: 'Amp',
    postedByRole: 'CEO',
    postedAt: '2d',
    postedByColor: '#C39FFF',
  },
  /* ── RSVP post ── */
  {
    id: 'p-rsvp',
    type: 'rsvp',
    department: 'People',
    title: 'Annual Wellness Summit 2026 — Registration',
    description: 'Join us for one full day of health talks, team workouts, and a 5K fun run. Fill in your preferences below so we can prep the right resources. Deadline: April 25.',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=80&fit=crop' },
    ],
    rsvpDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    rsvpCapacity: 200,
    rsvpCount: 134,
    rsvpSections: [
      {
        id: 'rs1',
        question: 'Will you be attending?',
        required: true,
        multi: false,
        options: [
          { id: 'rs1-a', label: 'Yes, attending in-person', icon: '🏃' },
          { id: 'rs1-b', label: 'Yes, joining virtually',   icon: '💻' },
          { id: 'rs1-c', label: 'Not this time',            icon: '😔' },
        ],
      },
      {
        id: 'rs2',
        question: 'Which sessions are you interested in?',
        hint: 'Select all that apply',
        required: true,
        multi: true,
        options: [
          { id: 'rs2-a', label: 'Morning 5K Fun Run',           icon: '🏅' },
          { id: 'rs2-b', label: 'Nutrition Masterclass',        icon: '🥗' },
          { id: 'rs2-c', label: 'Mental Health & Resilience',   icon: '🧘' },
          { id: 'rs2-d', label: 'Team HIIT Circuit',            icon: '⚡' },
          { id: 'rs2-e', label: 'Sleep Science Talk',           icon: '😴' },
        ],
      },
      {
        id: 'rs3',
        question: 'T-shirt size',
        required: true,
        multi: false,
        options: [
          { id: 'rs3-xs', label: 'XS' },
          { id: 'rs3-s',  label: 'S'  },
          { id: 'rs3-m',  label: 'M'  },
          { id: 'rs3-l',  label: 'L'  },
          { id: 'rs3-xl', label: 'XL' },
          { id: 'rs3-xxl',label: 'XXL'},
        ],
      },
      {
        id: 'rs4',
        question: 'Dietary preference',
        hint: 'For catering — choose one',
        required: false,
        multi: false,
        options: [
          { id: 'rs4-a', label: 'No restriction',      icon: '🍽️' },
          { id: 'rs4-b', label: 'Vegetarian',          icon: '🥦' },
          { id: 'rs4-c', label: 'Vegan',               icon: '🌱' },
          { id: 'rs4-d', label: 'Gluten-free',         icon: '🌾' },
          { id: 'rs4-e', label: 'Dairy-free',          icon: '🥛' },
        ],
      },
    ],
    reactions: { heart: 48, excited: 27, proud: 11 },
    myReaction: null,
    comments: 12,
    commentsList: [
      { id: 'rc1', author: 'Sneha P', authorColor: '#FF9070', text: 'Already signed up! The 5K is going to be 🔥', time: '2h', likes: 9, emojiCounts: { fire: 5, clap: 4 } as Partial<Record<CommentReactionKey,number>> },
      { id: 'rc2', author: 'Dev T',   authorColor: '#FFD07A', text: 'Is there a plus-one option for spouses?', time: '1h', likes: 3 },
      { id: 'rc3', author: 'People',  authorColor: '#5DCFFF', text: '@Dev T yes! Reply to your confirmation email to add a guest.', time: '55m', likes: 8, replyTo: 'Dev T', emojiCounts: { clap: 5, love: 3 } as Partial<Record<CommentReactionKey,number>> },
    ],
    saved: false,
    postedBy: 'People Team',
    postedByRole: 'Wellness Ops',
    postedAt: '5h',
    postedByColor: '#5DCFFF',
  },
];

const TYPE_FILTERS: Array<{ key: 'all' | PostType; label: string }> = [
  { key: 'all',          label: 'All' },
  { key: 'event',        label: 'Events' },
  { key: 'rsvp',         label: 'RSVP' },
  { key: 'poll',         label: 'Polls' },
  { key: 'celebration',  label: 'Wins' },
  { key: 'announcement', label: 'News' },
];

/* ─────────────────────────────────────────────
   Icons
   ───────────────────────────────────────────── */
const HeartIcon = ({ filled, size = 18, color }: { filled: boolean; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? (color || '#FF6B8A') : 'none'} stroke={filled ? (color || '#FF6B8A') : '#636366'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const BookmarkIcon = ({ filled = false, size = 18, color = '#636366' }: { filled?: boolean; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const PinIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PlayIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="6 4 20 12 6 20 6 4" />
  </svg>
);

const PlusIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CheckCircleIcon = ({ size = 14, color }: { size?: number; color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
  </svg>
);

const ClockIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

/* ─────────────────────────────────────────────
   Avatar
   ───────────────────────────────────────────── */
const Avatar = ({ initials, color, size = 34 }: { initials: string; color: string; size?: number }) => (
  <div
    className="flex items-center justify-center rounded-full text-white flex-shrink-0"
    style={{
      width: size,
      height: size,
      background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
      fontSize: size * 0.36,
      fontWeight: 700,
      letterSpacing: '0.02em',
    }}
  >
    {initials}
  </div>
);

/* ─────────────────────────────────────────────
   Media grid  (1 / 2 / 3 / 4 / 5+ images)
   ───────────────────────────────────────────── */
const MediaGrid = ({
  media,
  onMediaClick,
}: {
  media: MediaItem[];
  onMediaClick?: (idx: number) => void;
}) => {
  const count = media.length;
  // We always show at most 4 tiles; 5th+ are hidden behind the +N badge
  const SHOW = 4;
  const hiddenCount = count > SHOW ? count - SHOW : 0;

  const tile = (item: MediaItem, idx: number, overlay?: number) => (
    <div
      key={idx}
      className="relative overflow-hidden w-full h-full"
      style={{ background: '#2C2C2E', cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation();
        onMediaClick?.(idx);
      }}
    >
      <img
        src={item.type === 'image' ? item.url : item.poster}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ display: 'block' }}
      />
      {item.type === 'video' && (
        <>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 52, height: 52,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <PlayIcon size={20} />
            </div>
          </div>
          <div
            className="absolute bottom-2 right-2 rounded-md text-white pointer-events-none"
            style={{ padding: '2px 7px', background: 'rgba(0,0,0,0.7)', fontSize: 10, fontWeight: 600 }}
          >
            {item.duration}
          </div>
        </>
      )}
      {overlay !== undefined && overlay > 0 && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.58)' }}
        >
          <span style={{ fontFamily: 'Syne, -apple-system, sans-serif', fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>
            +{overlay}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2, letterSpacing: '-0.01em' }}>more</span>
        </div>
      )}
    </div>
  );

  if (count === 0) return null;

  // 1 image — wide hero
  if (count === 1)
    return (
      <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden' }}>
        {tile(media[0], 0)}
      </div>
    );

  // 2 images — side by side
  if (count === 2)
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, aspectRatio: '16/9' }}>
        {tile(media[0], 0)}
        {tile(media[1], 1)}
      </div>
    );

  // 3 images — large left + 2 stacked right
  if (count === 3)
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, aspectRatio: '4/3' }}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>{tile(media[0], 0)}</div>
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 2 }}>
          <div style={{ position: 'relative', overflow: 'hidden' }}>{tile(media[1], 1)}</div>
          <div style={{ position: 'relative', overflow: 'hidden' }}>{tile(media[2], 2)}</div>
        </div>
      </div>
    );

  // 4+ images — 2×2 grid; last tile gets +N badge for hidden photos
  const showTiles = media.slice(0, SHOW);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 2, aspectRatio: '1/1' }}>
      {showTiles.map((item, idx) => (
        <div key={idx} style={{ position: 'relative', overflow: 'hidden' }}>
          {tile(item, idx, idx === SHOW - 1 && hiddenCount > 0 ? hiddenCount : undefined)}
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Poll body
   ───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   RsvpBody
   ───────────────────────────────────────────── */
type RsvpAnswers = Record<string, string[]>;

const RsvpBody = ({ post }: { post: Post }) => {
  const sections = post.rsvpSections || [];
  const [answers, setAnswers] = useState<RsvpAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const toggle = (sectionId: string, optId: string, multi: boolean) => {
    setAnswers((prev) => {
      const cur = prev[sectionId] || [];
      if (multi) {
        return { ...prev, [sectionId]: cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId] };
      }
      return { ...prev, [sectionId]: cur[0] === optId ? [] : [optId] };
    });
    setErrors((e) => ({ ...e, [sectionId]: false }));
  };

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    let valid = true;
    for (const s of sections) {
      if (s.required && !(answers[s.id] || []).length) {
        newErrors[s.id] = true;
        valid = false;
      }
    }
    setErrors(newErrors);
    if (valid) setSubmitted(true);
  };

  const filled = sections.filter((s) => (answers[s.id] || []).length > 0).length;
  const required = sections.filter((s) => s.required).length;

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 320 }}
        className="rounded-2xl flex flex-col items-center"
        style={{
          background: 'linear-gradient(145deg,rgba(93,207,255,0.1) 0%,rgba(93,207,255,0.04) 100%)',
          border: '1.5px solid rgba(93,207,255,0.25)',
          padding: '28px 20px',
          gap: 10,
          marginBottom: 12,
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ scale: 0.3, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 300, delay: 0.1 }}
          style={{ fontSize: 40, lineHeight: 1, marginBottom: 4 }}
        >✅</motion.div>
        <p style={{ fontSize: 16, fontWeight: 800, color: '#5DCFFF', lineHeight: 1.2,fontFamily:'Syne,sans-serif' }}>You&apos;re registered!</p>
        <p style={{ fontSize: 12, color: '#AEAEB2', marginTop: 2 }}>Check your email for a confirmation. See you at the summit 🎉</p>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => { setSubmitted(false); setAnswers({}); }}
          style={{
            marginTop: 10, padding: '6px 18px', borderRadius: 20,
            background: 'rgba(93,207,255,0.1)', border: '1px solid rgba(93,207,255,0.25)',
            color: '#5DCFFF', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}
        >Edit response</motion.button>
      </motion.div>
    );
  }

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-3">
        <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${required ? (filled / sections.length) * 100 : 0}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#5DCFFF,#9D82FF)' }}
          />
        </div>
        <span style={{ fontSize: 10, color: '#636366', whiteSpace: 'nowrap' }}>{filled}/{sections.length} filled</span>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-4">
        {sections.map((sec) => {
          const sel = answers[sec.id] || [];
          const hasError = errors[sec.id];
          const isShirt = sec.id === 'rs3'; // compact grid for size options
          return (
            <div key={sec.id}>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span style={{ fontSize: 13, fontWeight: 700, color: hasError ? '#FF5C87' : '#F2F2F7', lineHeight: 1.3 }}>
                  {sec.question}
                  {sec.required && <span style={{ color: '#FF5C87', marginLeft: 2 }}>*</span>}
                </span>
                {sec.hint && <span style={{ fontSize: 10, color: '#636366' }}>· {sec.hint}</span>}
              </div>
              {hasError && (
                <p style={{ fontSize: 10, color: '#FF5C87', marginBottom: 6, marginTop: -4 }}>Please make a selection</p>
              )}
              <div className={isShirt ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2'}>
                {sec.options.map((opt, i) => {
                  const isSelected = sel.includes(opt.id);
                  return (
                    <motion.button
                      key={opt.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.18 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggle(sec.id, opt.id, sec.multi || false)}
                      className="flex items-center text-left"
                      style={{
                        borderRadius: isShirt ? 10 : 12,
                        padding: isShirt ? '7px 14px' : '10px 14px',
                        gap: 10,
                        background: isSelected
                          ? 'linear-gradient(135deg,rgba(93,207,255,0.18) 0%,rgba(157,130,255,0.14) 100%)'
                          : 'rgba(255,255,255,0.04)',
                        border: isSelected
                          ? '1.5px solid rgba(93,207,255,0.5)'
                          : `1px solid ${hasError ? 'rgba(255,92,135,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 12px rgba(93,207,255,0.15)' : 'none',
                      }}
                    >
                      {/* Checkbox / radio indicator */}
                      <div style={{
                        width: 18, height: 18, borderRadius: sec.multi ? 5 : 9,
                        flexShrink: 0,
                        background: isSelected ? 'linear-gradient(135deg,#5DCFFF,#9D82FF)' : 'transparent',
                        border: isSelected ? 'none' : '1.5px solid #3A3A3C',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 0 8px rgba(93,207,255,0.4)' : 'none',
                      }}>
                        {isSelected && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            width="10" height="10" viewBox="0 0 10 10" fill="none"
                          >
                            {sec.multi
                              ? <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                              : <circle cx="5" cy="5" r="2.5" fill="#fff" />
                            }
                          </motion.svg>
                        )}
                      </div>
                      {opt.icon && !isShirt && (
                        <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{opt.icon}</span>
                      )}
                      <span style={{
                        fontSize: isShirt ? 12 : 13,
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#E8F8FF' : '#AEAEB2',
                        transition: 'color 0.15s',
                      }}>{opt.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Capacity meter */}
      {post.rsvpCapacity && (
        <div className="flex items-center gap-2 mt-4 mb-1">
          <div style={{ flex: 1, height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${Math.min(100, ((post.rsvpCount || 0) / post.rsvpCapacity) * 100)}%`,
              background: (post.rsvpCount || 0) / post.rsvpCapacity > 0.85
                ? 'linear-gradient(90deg,#FF8C55,#FF5C87)'
                : 'linear-gradient(90deg,#4CD97B,#5DCFFF)',
            }} />
          </div>
          <span style={{ fontSize: 10, color: '#636366', whiteSpace: 'nowrap' }}>
            {post.rsvpCount}/{post.rsvpCapacity} spots
          </span>
        </div>
      )}

      {/* Deadline */}
      {post.rsvpDeadline && (
        <p style={{ fontSize: 10, color: '#636366', marginTop: 4, marginBottom: 12 }}>
          Closes {post.rsvpDeadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </p>
      )}

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleSubmit}
        className="w-full"
        style={{
          marginTop: 4,
          padding: '13px',
          borderRadius: 14,
          border: 'none',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 800,
          fontFamily: 'Syne, sans-serif',
          letterSpacing: 0.3,
          background: 'linear-gradient(135deg,#5DCFFF 0%,#9D82FF 100%)',
          color: '#0A0A0C',
          boxShadow: '0 4px 20px rgba(93,207,255,0.35)',
          transition: 'opacity 0.15s',
        }}
      >
        Submit Registration ✓
      </motion.button>
    </div>
  );
};

const PollBody = ({ post, onVote }: { post: Post; onVote: (postId: string, optId: string) => void }) => {
  const opts = post.pollOptions || [];
  const total = post.pollTotalVotes || opts.reduce((s, o) => s + o.votes, 0) || 1;
  const voted = !!post.myVote;
  const accent = TYPE_META.poll.accent;

  const deadlineMs = post.pollDeadline ? post.pollDeadline.getTime() - Date.now() : 0;
  const deadlineDays = Math.floor(deadlineMs / (1000 * 60 * 60 * 24));
  const deadlineHours = Math.floor(deadlineMs / (1000 * 60 * 60));
  const deadlineLabel =
    deadlineMs < 0 ? 'Closed'
    : deadlineDays > 0 ? `${deadlineDays}d left`
    : `${deadlineHours}h left`;

  return (
    <div className="px-4 pb-3">
      <div className="space-y-2">
        {opts.map((opt) => {
          const pct = voted ? Math.round((opt.votes / total) * 100) : 0;
          const isMyVote = post.myVote === opt.id;
          const isWinning = voted && opt.votes === Math.max(...opts.map((o) => o.votes));

          return (
            <button
              key={opt.id}
              onClick={(e) => {
                e.stopPropagation();
                if (!voted) onVote(post.id, opt.id);
              }}
              className="relative w-full overflow-hidden rounded-xl text-left"
              style={{
                padding: '10px 14px',
                background: isMyVote ? `${accent}20` : 'rgba(255,255,255,0.06)',
                border: isMyVote ? `1.5px solid ${accent}50` : '1.5px solid rgba(255,255,255,0.06)',
                cursor: voted ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {/* progress fill */}
              {voted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 top-0 bottom-0 rounded-xl"
                  style={{ background: isMyVote ? `${accent}28` : 'rgba(255,255,255,0.04)', zIndex: 0 }}
                />
              )}
              <div className="relative flex items-center justify-between" style={{ zIndex: 1 }}>
                <div className="flex items-center gap-2">
                  {isMyVote && <CheckCircleIcon size={14} color={accent} />}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isMyVote ? 600 : 400,
                      color: isMyVote ? '#F2F2F7' : '#AEAEB2',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {opt.label}
                  </span>
                  {isWinning && voted && (
                    <span
                      className="rounded-full"
                      style={{
                        padding: '1px 6px',
                        background: accent,
                        color: '#0A0A0C',
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                      }}
                    >
                      LEADING
                    </span>
                  )}
                </div>
                {voted && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isMyVote ? accent : '#636366',
                      letterSpacing: '-0.01em',
                      flexShrink: 0,
                    }}
                  >
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <div
        className="flex items-center gap-2 mt-2.5"
        style={{ fontSize: 11, color: '#636366', letterSpacing: '-0.01em' }}
      >
        <ClockIcon size={11} />
        <span
          style={{
            color: deadlineMs < 0 ? '#636366' : deadlineHours < 24 ? '#FF9070' : '#636366',
            fontWeight: deadlineHours < 24 && deadlineMs > 0 ? 600 : 400,
          }}
        >
          {deadlineLabel}
        </span>
        <span>·</span>
        <span>{total} votes</span>
        {!voted && <span>· Tap to vote</span>}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Image lightbox
   ───────────────────────────────────────────── */
const ImageLightbox = ({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) => {
  const [idx, setIdx] = useState(startIndex);
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.97)' }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 flex items-center justify-center rounded-full"
        style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#F2F2F7', fontSize: 18, zIndex: 10 }}
      >
        ✕
      </button>

      {/* Counter */}
      <div
        className="absolute top-5 left-1/2"
        style={{ transform: 'translateX(-50%)', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.01em' }}
      >
        {idx + 1} / {images.length}
      </div>

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={images[idx]}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '100%', maxHeight: '82vh', objectFit: 'contain', borderRadius: 12, display: 'block' }}
        />
      </AnimatePresence>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 flex items-center justify-center rounded-full"
            style={{ top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, background: 'rgba(255,255,255,0.13)', border: 'none', color: '#F2F2F7', fontSize: 18 }}
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-3 flex items-center justify-center rounded-full"
            style={{ top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, background: 'rgba(255,255,255,0.13)', border: 'none', color: '#F2F2F7', fontSize: 18 }}
          >
            ›
          </button>
        </>
      )}

      {/* Dot strip */}
      {images.length > 1 && (
        <div className="absolute bottom-8 flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              style={{
                width: i === idx ? 18 : 6,
                height: 6,
                borderRadius: 999,
                background: i === idx ? '#F2F2F7' : 'rgba(255,255,255,0.3)',
                border: 'none',
                transition: 'all 0.25s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   Notifications panel
   ───────────────────────────────────────────── */
type NotifItem = { id: string; emoji: string; title: string; body: string; time: string; read: boolean; accent: string };
const MOCK_NOTIFS: NotifItem[] = [
  { id: 'n1', emoji: '🔥', title: 'New Event', body: 'Sunrise Step Challenge kick-off is tomorrow at 6am — 42 people going.', time: '10m', read: false, accent: '#FF9070' },
  { id: 'n2', emoji: '💪', title: 'Milestone', body: 'Priya hit 100,000 lifetime steps. Drop a reaction!', time: '1h', read: false, accent: '#FFD07A' },
  { id: 'n3', emoji: '🗳️', title: 'Poll closing soon', body: 'Q2 offsite poll closes in 2 hours — only 36 votes so far.', time: '2h', read: false, accent: '#4CD97B' },
  { id: 'n4', emoji: '📣', title: 'Office Closed', body: 'Reminder: Monday 22 April is a company wellness day.', time: '1d', read: true, accent: '#AEAEB2' },
  { id: 'n5', emoji: '❤️', title: '87 people reacted', body: 'Your celebration post is getting lots of love.', time: '2d', read: true, accent: '#FF6B8A' },
];

const NotificationsPanel = ({ onClose, onMarkAllRead }: { onClose: () => void; onMarkAllRead: () => void }) => {
  const [notifs, setNotifs] = useState<NotifItem[]>(MOCK_NOTIFS);
  const unread = notifs.filter((n) => !n.read).length;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[105]"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-0 bottom-0 flex flex-col"
        style={{
          width: 'min(360px, 100vw)',
          background: '#1C1C1E',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-5"
          style={{ paddingTop: 'max(20px, env(safe-area-inset-top))', paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <h2 style={{ fontFamily: 'Syne, -apple-system, sans-serif', fontSize: 22, fontWeight: 700, color: '#F2F2F7', letterSpacing: '-0.03em', lineHeight: 1 }}>Notifications</h2>
            {unread > 0 && (
              <p style={{ fontSize: 12, color: '#636366', marginTop: 3 }}>{unread} unread</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <button
                onClick={() => { setNotifs((n) => n.map((x) => ({ ...x, read: true }))); onMarkAllRead(); }}
                style={{ fontSize: 12, fontWeight: 600, color: '#9D82FF', background: 'none', border: 'none', letterSpacing: '-0.01em' }}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-full"
              style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#AEAEB2', fontSize: 16 }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifs.map((n) => (
            <motion.button
              key={n.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
              className="w-full flex items-start gap-3 text-left"
              style={{
                padding: '14px 20px',
                background: n.read ? 'transparent' : 'rgba(157,130,255,0.06)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                border: 'none',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.04)',
                borderBottomStyle: 'solid',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{ width: 38, height: 38, background: `${n.accent}20`, fontSize: 18, marginTop: 1 }}
              >
                {n.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: '#F2F2F7', letterSpacing: '-0.01em' }}>{n.title}</span>
                  <span style={{ fontSize: 11, color: '#636366', flexShrink: 0 }}>{n.time}</span>
                </div>
                <p style={{ fontSize: 12, color: '#AEAEB2', marginTop: 2, lineHeight: 1.45, letterSpacing: '-0.005em' }}>{n.body}</p>
              </div>
              {!n.read && (
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#9D82FF', flexShrink: 0, marginTop: 5 }} />
              )}
            </motion.button>
          ))}
          {notifs.length === 0 && (
            <div className="flex flex-col items-center justify-center" style={{ paddingTop: 80 }}>
              <span style={{ fontSize: 40 }}>🔔</span>
              <p style={{ fontSize: 14, color: '#636366', marginTop: 12, textAlign: 'center' }}>You're all caught up!</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   Post Detail Bottom Sheet
   ───────────────────────────────────────────── */
const SendIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

/* ─────────────────────────────────────────────
   Premium Comment Row
   ───────────────────────────────────────────── */
const COMMENT_REACTION_KEYS: CommentReactionKey[] = ['love', 'haha', 'wow', 'clap', 'fire'];

const CommentRow = ({
  comment,
  depth = 0,
  onReply,
}: {
  comment: Comment;
  depth?: number;
  onReply: (author: string) => void;
}) => {
  const [liked, setLiked] = useState(comment.myLiked || false);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [showPicker, setShowPicker] = useState(false);
  const [myReaction, setMyReaction] = useState<CommentReactionKey | null>(comment.emojiReaction || null);
  const [reactionCounts, setReactionCounts] = useState<Partial<Record<CommentReactionKey, number>>>(comment.emojiCounts || {});
  const [showReplies, setShowReplies] = useState(false);

  const handleLike = () => {
    setLiked((v) => !v);
    setLikeCount((n) => liked ? n - 1 : n + 1);
  };

  const handleReaction = (key: CommentReactionKey) => {
    setReactionCounts((prev) => {
      const next = { ...prev };
      if (myReaction === key) {
        next[key] = Math.max(0, (next[key] || 1) - 1);
        if (!next[key]) delete next[key];
        setMyReaction(null);
      } else {
        if (myReaction) {
          next[myReaction] = Math.max(0, (next[myReaction] || 1) - 1);
          if (!next[myReaction]) delete next[myReaction];
        }
        next[key] = (next[key] || 0) + 1;
        setMyReaction(key);
      }
      return next;
    });
    setShowPicker(false);
  };

  const topReactions = (Object.entries(reactionCounts) as [CommentReactionKey, number][])
    .filter(([, n]) => n > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div style={{ marginLeft: depth > 0 ? 44 : 0, position: 'relative' }}>
      {/* Thread connector line */}
      {depth > 0 && (
        <div style={{
          position: 'absolute', left: -22, top: 0, bottom: 16, width: 1.5,
          background: 'rgba(255,255,255,0.07)', borderRadius: 1,
        }} />
      )}

      <div className="flex items-start gap-3">
        <Avatar
          initials={comment.author.split(' ').map((s) => s[0]).slice(0, 2).join('')}
          color={comment.authorColor}
          size={depth > 0 ? 26 : 32}
        />

        <div className="flex-1 min-w-0" style={{ paddingBottom: 18 }}>
          {/* Name + time */}
          <div className="flex items-baseline gap-2 mb-0.5">
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F2F2F7', letterSpacing: '-0.01em' }}>
              {comment.author}
            </span>
            <span style={{ fontSize: 11, color: '#636366' }}>{comment.time}</span>
          </div>

          {/* Text */}
          <p style={{ fontSize: 14, color: '#AEAEB2', lineHeight: 1.5, letterSpacing: '-0.005em', wordBreak: 'break-word' }}>
            {comment.replyTo && (
              <span style={{ color: '#9D82FF', fontWeight: 600, marginRight: 4 }}>@{comment.replyTo}</span>
            )}
            {comment.text}
          </p>

          {/* Reaction bubbles */}
          {topReactions.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {topReactions.map(([key, count]) => {
                const r = COMMENT_REACTIONS[key];
                const isMine = myReaction === key;
                return (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => handleReaction(key)}
                    className="flex items-center gap-1.5 rounded-full"
                    style={{
                      padding: '3px 10px 3px 4px',
                      background: isMine ? `${r.color}18` : 'rgba(255,255,255,0.07)',
                      border: isMine ? `1px solid ${r.color}45` : '1px solid rgba(255,255,255,0.08)',
                      color: isMine ? r.color : '#AEAEB2',
                      fontWeight: isMine ? 700 : 400,
                      fontSize: 11,
                      filter: isMine ? `drop-shadow(0 1px 5px ${r.glow})` : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ filter: isMine ? `drop-shadow(0 0 3px ${r.glow})` : 'none' }}>
                      <CommentReactionIcon type={key} size={18} />
                    </div>
                    <span>{count}</span>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-4 mt-2.5" style={{ position: 'relative' }}>
            {/* Heart like */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleLike}
              className="flex items-center gap-1.5"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <motion.div
                key={liked ? 'liked' : 'un'}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 400 }}
                style={{ filter: liked ? 'drop-shadow(0 0 4px rgba(255,92,135,0.7))' : 'none' }}
              >
                <CommentReactionIcon type="love" size={18} />
              </motion.div>
              {likeCount > 0 && (
                <span style={{ fontSize: 11, color: liked ? '#FF5C87' : '#636366', fontWeight: liked ? 700 : 400 }}>
                  {likeCount}
                </span>
              )}
            </motion.button>

            {/* Reaction picker trigger */}
            <div style={{ position: 'relative' }}>
              {showPicker && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 29 }} onClick={() => setShowPicker(false)} />
              )}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setShowPicker((v) => !v)}
                style={{
                  background: myReaction ? `${COMMENT_REACTIONS[myReaction].color}18` : 'none',
                  border: myReaction ? `1px solid ${COMMENT_REACTIONS[myReaction].color}40` : 'none',
                  borderRadius: 999, padding: myReaction ? '2px 7px 2px 4px' : 0,
                  lineHeight: 1, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                  filter: myReaction ? `drop-shadow(0 0 4px ${COMMENT_REACTIONS[myReaction].glow})` : 'none',
                }}
              >
                {myReaction ? (
                  <>
                    <CommentReactionIcon type={myReaction} size={16} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: COMMENT_REACTIONS[myReaction].color }}>{COMMENT_REACTIONS[myReaction].label}</span>
                  </>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                )}
              </motion.button>
              <AnimatePresence>
                {showPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 6 }}
                    transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      position: 'absolute', bottom: 28, left: -8, zIndex: 30,
                      display: 'flex', alignItems: 'flex-end', gap: 2,
                      padding: '8px 10px',
                      background: 'linear-gradient(160deg,#28282C 0%,#1C1C1E 100%)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 999,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
                    }}
                  >
                    {COMMENT_REACTION_KEYS.map((key, i) => {
                      const r = COMMENT_REACTIONS[key];
                      const isSelected = myReaction === key;
                      return (
                        <motion.button
                          key={key}
                          initial={{ opacity: 0, y: 8, scale: 0.5 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: i * 0.035, type: 'spring', damping: 14, stiffness: 400 }}
                          whileHover={{ y: -6, scale: 1.28 }}
                          whileTap={{ scale: 0.82 }}
                          onClick={() => handleReaction(key)}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                            background: isSelected ? `${r.color}20` : 'none',
                            border: isSelected ? `1.5px solid ${r.color}55` : '1.5px solid transparent',
                            borderRadius: 10, padding: '3px 5px 4px', cursor: 'pointer',
                            filter: isSelected ? `drop-shadow(0 0 6px ${r.glow})` : 'none',
                          }}
                        >
                          <CommentReactionIcon type={key} size={26} />
                          <span style={{ fontSize: 9, fontWeight: isSelected ? 800 : 500, color: isSelected ? r.color : '#636366', whiteSpace: 'nowrap' }}>
                            {r.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reply — only on top-level */}
            {depth === 0 && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { onReply(comment.author); setShowPicker(false); }}
                style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 600, color: '#636366', letterSpacing: '-0.01em' }}
              >
                Reply
              </motion.button>
            )}
          </div>

          {/* View replies toggle */}
          {depth === 0 && comment.replies && comment.replies.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowReplies((v) => !v)}
              className="flex items-center gap-2 mt-3"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <div style={{ width: 28, height: 1.5, background: 'rgba(255,255,255,0.16)', borderRadius: 1 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#AEAEB2', letterSpacing: '-0.01em' }}>
                {showReplies
                  ? 'Hide replies'
                  : `View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Replies */}
      {depth === 0 && showReplies && comment.replies && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {comment.replies.map((reply) => (
              <CommentRow key={reply.id} comment={reply} depth={1} onReply={onReply} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

const PostDetailSheet = ({
  post,
  onClose,
  onReact,
  onSave,
  onVote,
  onVideoPlay,
  onImageOpen,
}: {
  post: Post;
  onClose: () => void;
  onReact: (id: string, r: SemanticReaction | null) => void;
  onSave: (id: string) => void;
  onVote: (postId: string, optId: string) => void;
  onVideoPlay: (url: string) => void;
  onImageOpen: (images: string[], idx: number) => void;
}) => {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<Comment[]>(post.commentsList || []);
  const meta = TYPE_META[post.type];
  const myReactionData = post.myReaction ? REACTIONS[post.myReaction] : null;

  const handleSendComment = () => {
    const text = commentText.trim();
    if (!text) return;
    setLocalComments((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, author: 'You', authorColor: '#9D82FF', text, time: 'now', likes: 0, replyTo: replyingTo || undefined },
    ]);
    setCommentText('');
    setReplyingTo(null);
  };

  const handleReply = (author: string) => setReplyingTo(author);

  const allImages = (post.media || []).filter((m): m is { type: 'image'; url: string } => m.type === 'image').map((m) => m.url);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col rounded-t-[28px] overflow-hidden"
        style={{
          background: '#111113',
          maxHeight: '94vh',
          paddingBottom: 'env(safe-area-inset-bottom)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)' }} />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-2 pb-3">
            <div className="flex items-center gap-2.5">
              <Avatar
                initials={post.postedBy.split(' ').map((s) => s[0]).slice(0, 2).join('')}
                color={post.postedByColor}
                size={38}
              />
              <div className="leading-tight">
                <div style={{ fontSize: 14, fontWeight: 700, color: '#F2F2F7', letterSpacing: '-0.01em' }}>{post.postedBy}</div>
                <div style={{ fontSize: 11, color: '#636366' }}>{post.postedByRole} · {post.postedAt}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="flex items-center gap-1 rounded-full"
                style={{ padding: '3px 8px 3px 5px', background: meta.tint, fontSize: 10, fontWeight: 700, color: meta.accent, letterSpacing: '0.05em' }}
              >
                <span style={{ fontSize: 11 }}>{meta.icon}</span>{meta.label}
              </span>
              <button
                onClick={onClose}
                className="flex items-center justify-center rounded-full"
                style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#AEAEB2', fontSize: 15 }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Title + full description */}
          <div className="px-4 pb-4">
            <h2
              style={{
                fontFamily: 'Syne, -apple-system, sans-serif',
                fontSize: 22,
                fontWeight: 700,
                color: '#F2F2F7',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
                marginBottom: 8,
              }}
            >
              {post.title}
            </h2>
            <p style={{ fontSize: 14, color: '#AEAEB2', lineHeight: 1.6, letterSpacing: '-0.005em' }}>
              {post.description}
            </p>
          </div>

          {/* Event strip */}
          {post.type === 'event' && post.startsAt && (
            <div
              className="mx-4 mb-4 flex items-center gap-2.5 rounded-xl px-3 py-2.5"
              style={{ background: meta.tint, border: `1px solid ${meta.accent}30` }}
            >
              <div
                className="flex flex-col items-center justify-center rounded-lg flex-shrink-0"
                style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.3)', border: `1px solid ${meta.accent}35` }}
              >
                <div style={{ fontSize: 9, fontWeight: 700, color: meta.accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {post.startsAt.toLocaleDateString([], { month: 'short' })}
                </div>
                <div style={{ fontFamily: 'Syne, -apple-system, sans-serif', fontSize: 17, fontWeight: 700, color: '#F2F2F7', lineHeight: 1 }}>
                  {post.startsAt.getDate()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F2F2F7' }}>
                  {post.startsAt.toLocaleDateString([], { weekday: 'long', hour: 'numeric', minute: '2-digit' })}
                </div>
                {post.location && (
                  <div className="flex items-center gap-1 mt-0.5" style={{ fontSize: 12, color: '#AEAEB2' }}>
                    <PinIcon size={10} />
                    <span>{post.location}</span>
                  </div>
                )}
                {post.totalAttendees && (
                  <div style={{ fontSize: 12, color: '#AEAEB2', marginTop: 2 }}>
                    {post.totalAttendees} attending
                    {(post.joinedInLastHour || 0) > 0 && (
                      <motion.span animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.8, repeat: Infinity }}
                        style={{ color: meta.accent, fontWeight: 600, marginLeft: 4 }}
                      >
                        · {post.joinedInLastHour} just joined
                      </motion.span>
                    )}
                  </div>
                )}
              </div>
              <button
                style={{ padding: '8px 16px', background: meta.accent, color: '#0A0A0C', fontSize: 12, fontWeight: 700, borderRadius: 999, border: 'none', boxShadow: `0 4px 14px ${meta.accent}50` }}
              >
                Join
              </button>
            </div>
          )}

          {/* RSVP form */}
          {post.type === 'rsvp' && post.rsvpSections && (
            <RsvpBody post={post} />
          )}

          {/* Poll */}
          {post.type === 'poll' && post.pollOptions && (
            <PollBody post={post} onVote={onVote} />
          )}

          {/* Image gallery strip — ALL images visible */}
          {allImages.length > 0 && (
            <div className="mb-4">
              {allImages.length === 1 ? (
                <div
                  style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => onImageOpen(allImages, 0)}
                >
                  <img src={allImages[0]} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ) : (
                <>
                  {/* Main big preview */}
                  <div
                    style={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden', cursor: 'pointer', marginBottom: 2 }}
                    onClick={() => onImageOpen(allImages, 0)}
                  >
                    <img src={allImages[0]} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    <div
                      className="absolute bottom-3 right-3 rounded-full"
                      style={{ padding: '3px 10px', background: 'rgba(0,0,0,0.65)', fontSize: 11, fontWeight: 600, color: '#F2F2F7' }}
                    >
                      1 / {allImages.length}
                    </div>
                  </div>
                  {/* Thumbnail row — all images */}
                  <div
                    className="flex gap-1 overflow-x-auto px-4"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {allImages.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => onImageOpen(allImages, i)}
                        style={{
                          flexShrink: 0,
                          width: 64,
                          height: 64,
                          borderRadius: 10,
                          overflow: 'hidden',
                          position: 'relative',
                          border: i === 0 ? '2px solid #9D82FF' : '2px solid transparent',
                          padding: 0,
                          background: 'none',
                        }}
                      >
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Video items */}
          {(post.media || []).filter((m) => m.type === 'video').map((m, i) => {
            const v = m as { type: 'video'; poster: string; duration: string; videoUrl: string };
            return (
              <div key={i} style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden', marginBottom: 2, cursor: 'pointer' }}
                onClick={() => onVideoPlay(v.videoUrl)}
              >
                <img src={v.poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center justify-center rounded-full" style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)' }}>
                    <PlayIcon size={22} />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 rounded-md" style={{ padding: '2px 7px', background: 'rgba(0,0,0,0.7)', fontSize: 10, fontWeight: 600, color: '#fff' }}>{v.duration}</div>
              </div>
            );
          })}

          {/* Reactions summary */}
          <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {(Object.entries(REACTIONS) as [SemanticReaction, typeof REACTIONS[SemanticReaction]][]).map(([key, r]) => {
                  const count = post.reactions[key] || 0;
                  const isSelected = post.myReaction === key;
                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.88 }}
                      whileHover={{ y: -2 }}
                      onClick={() => onReact(post.id, isSelected ? null : key)}
                      className="flex items-center gap-2 rounded-full"
                      style={{
                        padding: '5px 12px 5px 6px',
                        background: isSelected ? `${r.color}18` : 'rgba(255,255,255,0.06)',
                        border: isSelected ? `1.5px solid ${r.color}50` : '1.5px solid rgba(255,255,255,0.07)',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? r.color : '#AEAEB2',
                        fontSize: 12,
                        transition: 'all 0.18s ease',
                        filter: isSelected ? `drop-shadow(0 2px 8px ${r.glow})` : 'none',
                      }}
                    >
                      <div style={{ filter: isSelected ? `drop-shadow(0 0 4px ${r.glow})` : 'none' }}>
                        <ReactionIcon type={key} size={22} />
                      </div>
                      <span>{count > 0 ? count : r.label}</span>
                    </motion.button>
                  );
                })}
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onSave(post.id)}
                style={{ background: 'none', border: 'none', color: post.saved ? meta.accent : '#636366' }}
              >
                <BookmarkIcon filled={post.saved} size={18} color={post.saved ? meta.accent : '#636366'} />
              </motion.button>
            </div>
          </div>

          {/* Comments */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between px-4" style={{ paddingTop: 16, paddingBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#F2F2F7', letterSpacing: '-0.02em' }}>
                {localComments.length > 0 ? `${localComments.length} comments` : 'Comments'}
              </span>
            </div>
            {localComments.length === 0 && (
              <div className="flex flex-col items-center" style={{ paddingBottom: 28, paddingTop: 4 }}>
                <span style={{ fontSize: 32 }}>💬</span>
                <p style={{ fontSize: 13, color: '#636366', marginTop: 8 }}>No comments yet. Be the first.</p>
              </div>
            )}
            <div className="px-4" style={{ paddingBottom: 12 }}>
              {localComments.map((c) => (
                <CommentRow key={c.id} comment={c} depth={0} onReply={handleReply} />
              ))}
            </div>
          </div>
        </div>

        {/* Sticky comment input */}
        <div
          className="flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: '#111113' }}
        >
          {/* Replying-to banner */}
          <AnimatePresence>
            {replyingTo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-center justify-between px-4 py-2"
                style={{ background: 'rgba(157,130,255,0.08)', borderBottom: '1px solid rgba(157,130,255,0.12)' }}
              >
                <span style={{ fontSize: 12, color: '#9D82FF', fontWeight: 600, letterSpacing: '-0.01em' }}>
                  Replying to <span style={{ color: '#C39FFF' }}>@{replyingTo}</span>
                </span>
                <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', fontSize: 16, color: '#636366', lineHeight: 1, padding: 0 }}>✕</button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2.5 px-4 py-3">
            <Avatar initials="Yo" color="#9D82FF" size={32} />
            <div
              className="flex-1 flex items-center rounded-2xl"
              style={{
                background: '#1C1C1E',
                border: '1px solid rgba(255,255,255,0.09)',
                paddingLeft: 14, paddingRight: 6, minHeight: 42, gap: 8,
              }}
            >
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                placeholder={replyingTo ? `Reply to @${replyingTo}…` : 'Add a comment…'}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 14, color: '#F2F2F7', letterSpacing: '-0.01em',
                  paddingTop: 10, paddingBottom: 10,
                }}
              />
              <AnimatePresence>
                {commentText.trim() && (
                  <motion.button
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    whileTap={{ scale: 0.88 }}
                    onClick={handleSendComment}
                    className="flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#9D82FF,#C39FFF)', border: 'none', color: '#fff' }}
                  >
                    <SendIcon size={13} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   Feed Media Viewer — fullscreen swipeable overlay
   ───────────────────────────────────────────── */
const FeedMediaViewer = ({
  post,
  startIdx,
  onClose,
}: {
  post: Post;
  startIdx: number;
  onClose: () => void;
}) => {
  const allMedia = post.media || [];
  const [idx, setIdx] = useState(startIdx);
  const swipeDir = useRef<1 | -1>(1);
  const current = allMedia[idx];
  const hasPrev = idx > 0;
  const hasNext = idx < allMedia.length - 1;

  const goPrev = () => { swipeDir.current = -1; setIdx((i) => Math.max(0, i - 1)); };
  const goNext = () => { swipeDir.current = 1; setIdx((i) => Math.min(allMedia.length - 1, i + 1)); };

  return (
    <motion.div
      key="feed-media-viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.97)', display: 'flex', flexDirection: 'column' }}
    >
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        background: 'linear-gradient(180deg,rgba(0,0,0,0.7) 0%,transparent 100%)',
      }}>
        <button
          onClick={onClose}
          style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        {allMedia.length > 1 && (
          <div style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#F2F2F7', letterSpacing: '-0.01em' }}>{idx + 1} / {allMedia.length}</span>
          </div>
        )}
        {current?.type === 'video' ? (
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>
        ) : (
          <div style={{ width: 36 }} />
        )}
      </div>

      {/* Swipeable content */}
      <motion.div
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '60px 0', touchAction: 'pan-y' }}
        drag={allMedia.length > 1 ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60 && hasNext) { swipeDir.current = 1; goNext(); }
          else if (info.offset.x > 60 && hasPrev) { swipeDir.current = -1; goPrev(); }
        }}
      >
        <AnimatePresence mode="wait" custom={swipeDir.current}>
          <motion.div
            key={idx}
            custom={swipeDir.current}
            variants={{
              enter: (dir: number) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (dir: number) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {current?.type === 'image' ? (
              <img
                src={current.url} alt=""
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', userSelect: 'none', pointerEvents: 'none' }}
                draggable={false}
              />
            ) : current?.type === 'video' ? (
              <video
                src={current.videoUrl}
                controls autoPlay playsInline
                style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, outline: 'none' }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Side nav arrows */}
      {hasPrev && (
        <button
          onClick={goPrev}
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      )}
      {hasNext && (
        <button
          onClick={goNext}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      )}

      {/* Bottom thumbnail strip */}
      {allMedia.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(0deg,rgba(0,0,0,0.8) 0%,transparent 100%)',
          padding: '20px 16px 32px',
          display: 'flex', justifyContent: 'center', gap: 6,
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {allMedia.map((m, i) => (
            <button key={i} onClick={() => { swipeDir.current = i > idx ? 1 : -1; setIdx(i); }}
              style={{
                flexShrink: 0, width: i === idx ? 52 : 44, height: i === idx ? 52 : 44,
                borderRadius: 10, overflow: 'hidden', padding: 0, background: '#2C2C2E', cursor: 'pointer',
                border: `2px solid ${i === idx ? '#fff' : 'rgba(255,255,255,0.2)'}`,
                position: 'relative', transition: 'all 0.18s ease',
                opacity: i === idx ? 1 : 0.55,
              }}>
              <img src={m.type === 'image' ? m.url : m.poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {m.type === 'video' && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   Post Card
   ───────────────────────────────────────────── */
const PostCard = ({
  post,
  onOpen,
  onReact,
  onSave,
  onVote,
  onMediaOpen,
}: {
  post: Post;
  onOpen: (id: string) => void;
  onReact: (id: string, r: SemanticReaction | null) => void;
  onSave: (id: string) => void;
  onVote: (postId: string, optId: string) => void;
  onMediaOpen: (post: Post, mediaIdx: number) => void;
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const meta = TYPE_META[post.type];
  const totalReactions = Object.values(post.reactions).reduce<number>((a, b) => a + (b || 0), 0);
  const topReactions = (Object.entries(post.reactions) as [SemanticReaction, number][])
    .filter(([, n]) => (n || 0) > 0)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0))
    .slice(0, 3)
    .map(([t]) => t);

  const myReactionData = post.myReaction ? REACTIONS[post.myReaction] : null;

  const handleReactTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReactionPicker((v) => !v);
  };

  const handlePickReaction = (e: React.MouseEvent, r: SemanticReaction) => {
    e.stopPropagation();
    if (post.myReaction === r) {
      onReact(post.id, null);
    } else {
      onReact(post.id, r);
    }
    setShowReactionPicker(false);
  };

  const formatEventDate = (d: Date) => {
    const diffHr = (d.getTime() - Date.now()) / (1000 * 60 * 60);
    if (diffHr < 0) return 'Past';
    if (diffHr < 24) return `Today · ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    if (diffHr < 48) return `Tomorrow · ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onOpen(post.id)}
      className="overflow-hidden rounded-[20px] cursor-pointer"
      style={{
        background: '#1C1C1E',
        boxShadow: '0 2px 12px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      {/* Type accent strip — ultra thin top border per type */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${meta.accent} 0%, ${meta.accent}00 100%)` }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar
            initials={post.postedBy.split(' ').map((s) => s[0]).slice(0, 2).join('')}
            color={post.postedByColor}
            size={34}
          />
          <div className="min-w-0 leading-tight">
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#F2F2F7',
                letterSpacing: '-0.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {post.postedBy}
            </div>
            <div style={{ fontSize: 11, color: '#636366', marginTop: 1 }}>
              {post.postedByRole} · {post.postedAt}
            </div>
          </div>
        </div>

        <span
          className="flex items-center gap-1 rounded-full flex-shrink-0"
          style={{
            padding: '3px 8px 3px 5px',
            background: meta.tint,
            fontSize: 10,
            fontWeight: 700,
            color: meta.accent,
            letterSpacing: '0.05em',
          }}
        >
          <span style={{ fontSize: 11 }}>{meta.icon}</span>
          {meta.label}
        </span>
      </div>

      {/* Title + description */}
      <div className="px-4 pb-3">
        <h3
          style={{
            fontFamily: 'Syne, -apple-system, sans-serif',
            fontSize: 18,
            fontWeight: 700,
            color: '#F2F2F7',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            marginBottom: 5,
          }}
        >
          {post.title}
        </h3>
        <p
          style={{
            fontSize: 14,
            color: '#AEAEB2',
            lineHeight: 1.5,
            letterSpacing: '-0.005em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          {post.description}
        </p>
      </div>

      {/* Event strip */}
      {post.type === 'event' && post.startsAt && (
        <div
          className="mx-4 mb-3 flex items-center gap-2.5 rounded-xl px-3 py-2.5"
          style={{
            background: meta.tint,
            border: `1px solid ${meta.accent}30`,
          }}
        >
          <div
            className="flex flex-col items-center justify-center rounded-lg flex-shrink-0"
            style={{
              width: 36,
              height: 36,
              background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${meta.accent}35`,
            }}
          >
            <div
              style={{
                fontSize: 8,
                fontWeight: 700,
                color: meta.accent,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              {post.startsAt.toLocaleDateString([], { month: 'short' })}
            </div>
            <div
              style={{
                fontFamily: 'Syne, -apple-system, sans-serif',
                fontSize: 15,
                fontWeight: 700,
                color: '#F2F2F7',
                lineHeight: 1.1,
              }}
            >
              {post.startsAt.getDate()}
            </div>
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <div style={{ fontSize: 12, fontWeight: 600, color: '#F2F2F7', letterSpacing: '-0.01em' }}>
              {formatEventDate(post.startsAt)}
            </div>
            {post.location && (
              <div className="flex items-center gap-1 mt-0.5" style={{ fontSize: 11, color: '#AEAEB2' }}>
                <PinIcon size={10} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.location}
                </span>
                {post.totalAttendees ? (
                  <><span>·</span><span>{post.totalAttendees} going</span></>
                ) : null}
              </div>
            )}
          </div>
          <button
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '6px 12px',
              background: meta.accent,
              color: '#0A0A0C',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              borderRadius: 999,
              border: 'none',
              boxShadow: `0 3px 12px ${meta.accent}50`,
              flexShrink: 0,
            }}
          >
            Join
          </button>
        </div>
      )}

      {/* Poll */}
      {post.type === 'poll' && post.pollOptions && (
        <PollBody post={post} onVote={onVote} />
      )}

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div onClick={(e) => e.stopPropagation()}>
          <MediaGrid
            media={post.media}
            onMediaClick={(idx) => onMediaOpen(post, idx)}
          />
        </div>
      )}

      {/* Footer */}
      <div style={{ position: 'relative' }}>
        {/* Reaction summary */}
        {(totalReactions > 0 || post.comments > 0) && (
          <div className="flex items-center justify-between px-4 pt-2.5 pb-1" style={{ fontSize: 12, color: '#636366' }}>
            <div className="flex items-center gap-1.5">
              {topReactions.length > 0 && (
                <div className="flex">
                  {topReactions.map((t, i) => (
                    <div key={t} style={{ width: 18, height: 18, background: '#2C2C2E', marginLeft: i === 0 ? 0 : -5, boxShadow: '0 0 0 1.5px #1C1C1E', zIndex: 3 - i, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ReactionIcon type={t} size={13} />
                    </div>
                  ))}
                </div>
              )}
              {totalReactions > 0 && (
                <span style={{ fontWeight: 500, color: '#636366' }}>{totalReactions}</span>
              )}
            </div>
            {post.comments > 0 && <span>{post.comments} comments</span>}
          </div>
        )}

        {/* Floating reaction picker — above action bar */}
        {showReactionPicker && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 49 }}
            onClick={(e) => { e.stopPropagation(); setShowReactionPicker(false); }}
          />
        )}
        <AnimatePresence>
          {showReactionPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 6 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', bottom: 'calc(100% + 6px)', left: 12, zIndex: 50,
                display: 'flex', alignItems: 'flex-end', gap: 2,
                padding: '10px 12px',
                background: 'linear-gradient(160deg,#28282C 0%,#1C1C1E 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 999,
                boxShadow: '0 16px 48px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04) inset',
              }}
            >
              {(Object.entries(REACTIONS) as [SemanticReaction, typeof REACTIONS[SemanticReaction]][]).map(([key, r], i) => {
                const isSelected = post.myReaction === key;
                return (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, y: 10, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.035, type: 'spring', damping: 14, stiffness: 380 }}
                    whileHover={{ y: -7, scale: 1.3 }}
                    whileTap={{ scale: 0.82 }}
                    onClick={(e) => handlePickReaction(e, key)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                      padding: '4px 6px',
                      background: isSelected ? `${r.color}22` : 'none',
                      border: isSelected ? `1.5px solid ${r.color}55` : '1.5px solid transparent',
                      borderRadius: 12,
                      cursor: 'pointer',
                      filter: isSelected ? `drop-shadow(0 0 8px ${r.glow})` : 'none',
                    }}
                  >
                    <div style={{ filter: isSelected ? `drop-shadow(0 0 5px ${r.glow})` : 'none' }}>
                      <ReactionIcon type={key} size={32} />
                    </div>
                    <span style={{ fontSize: 9, fontWeight: isSelected ? 800 : 500, color: isSelected ? r.color : '#636366', whiteSpace: 'nowrap' }}>
                      {r.label}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action bar */}
        <div className="flex items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 0 0 0' }}>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleReactTap}
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5"
            style={{
              color: myReactionData ? myReactionData.color : '#636366',
              fontSize: 12, fontWeight: 600,
              background: 'transparent', border: 'none', letterSpacing: '-0.01em',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              filter: myReactionData ? `drop-shadow(0 0 6px ${myReactionData.glow})` : 'none',
            }}
          >
            {myReactionData ? (
              <motion.div key={post.myReaction} initial={{ scale: 0.5, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 10, stiffness: 320 }}
                style={{ filter: `drop-shadow(0 0 4px ${myReactionData.glow})` }}>
                <ReactionIcon type={post.myReaction!} size={18} />
              </motion.div>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
              </svg>
            )}
            <span>{myReactionData ? myReactionData.label : 'React'}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={(e) => { e.stopPropagation(); onOpen(post.id); }}
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5"
            style={{ color: '#636366', fontSize: 12, fontWeight: 600, background: 'transparent', border: 'none', letterSpacing: '-0.01em', borderRight: '1px solid rgba(255,255,255,0.06)' }}
          >
            <CommentIcon size={15} />
            {post.comments > 0 ? post.comments : 'Comment'}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={(e) => { e.stopPropagation(); onSave(post.id); }}
            className="flex flex-1 items-center justify-center gap-1.5 py-2.5"
            style={{ color: post.saved ? meta.accent : '#636366', fontSize: 12, fontWeight: 600, background: 'transparent', border: 'none', letterSpacing: '-0.01em', filter: post.saved ? `drop-shadow(0 0 5px ${meta.accent}80)` : 'none' }}
          >
            <BookmarkIcon filled={post.saved} size={15} color={post.saved ? meta.accent : '#636366'} />
            {post.saved ? 'Saved' : 'Save'}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
};

/* ─────────────────────────────────────────────
   Main Page
   ───────────────────────────────────────────── */
export default function FeedPage({
  isAdmin = true,
  onOpenPost,
  onCompose,
}: {
  isAdmin?: boolean;
  onOpenPost?: (id: string) => void;
  onCompose?: () => void;
} = {}) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [typeFilter, setTypeFilter] = useState<'all' | PostType>('all');
  const [mediaViewer, setMediaViewer] = useState<{ post: Post; idx: number } | null>(null);

  const handleReact = (id: string, r: SemanticReaction | null) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, reactions: { ...p.reactions }, myReaction: r };
        if (p.myReaction) next.reactions[p.myReaction] = Math.max(0, (next.reactions[p.myReaction] || 0) - 1);
        if (r) next.reactions[r] = (next.reactions[r] || 0) + 1;
        return next;
      }),
    );
  };

  const handleSave = (id: string) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)));

  const handleVote = (postId: string, optionId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId || !p.pollOptions) return p;
        return {
          ...p,
          myVote: optionId,
          pollTotalVotes: (p.pollTotalVotes || 0) + 1,
          pollOptions: p.pollOptions.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt,
          ),
        };
      }),
    );
  };

  const typeCounts: Partial<Record<'all' | PostType, number>> = { all: posts.length };
  posts.forEach((p) => { typeCounts[p.type] = (typeCounts[p.type] || 0) + 1; });

  const filtered = posts.filter((p) => typeFilter === 'all' || p.type === typeFilter);


  return (
    <div style={{ minHeight: '100vh', background: '#111113', paddingBottom: 120 }}>
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        div::-webkit-scrollbar { display: none; }
      `}</style>

      <Header title="Feed" showAnimatedWord={false} />

      {/* Sticky filter bar */}
      <div
        className="sticky top-0 z-20"
        style={{
          background: 'rgba(17,17,19,0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          className="flex gap-1.5 overflow-x-auto px-4 py-2.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {TYPE_FILTERS.map((it) => {
            const isActive = typeFilter === it.key;
            return (
              <motion.button
                key={it.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTypeFilter(it.key)}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full"
                style={{
                  padding: '7px 13px',
                  background: isActive ? '#F2F2F7' : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#111113' : '#AEAEB2',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  border: 'none',
                  boxShadow: isActive ? '0 2px 10px rgba(0,0,0,0.4)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {it.label}
                {typeCounts[it.key] !== undefined && typeCounts[it.key]! > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      color: isActive ? '#3A3A3C' : '#636366',
                      fontWeight: isActive ? 700 : 500,
                    }}
                  >
                    {typeCounts[it.key]}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Feed */}
      <div className="px-4 pt-3 space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpen={(id) => {
                router.push(`/feeds/${id}`);
                onOpenPost?.(id);
              }}
              onReact={handleReact}
              onSave={handleSave}
              onVote={handleVote}
              onMediaOpen={(p, idx) => setMediaViewer({ post: p, idx })}
            />
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div
            className="rounded-[20px] p-10 text-center"
            style={{
              background: '#1C1C1E',
              border: '1px dashed rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                fontFamily: 'Syne, -apple-system, sans-serif',
                fontSize: 16,
                fontWeight: 600,
                color: '#F2F2F7',
                letterSpacing: '-0.02em',
                marginBottom: 4,
              }}
            >
              Nothing here yet
            </div>
            <p style={{ fontSize: 13, color: '#636366' }}>Posts show up as teams share them.</p>
          </div>
        )}
      </div>

      {/* Admin FAB */}
      {isAdmin && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', damping: 20, stiffness: 300 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => onCompose?.()}
          className="fixed z-30 flex items-center gap-2 rounded-full"
          style={{
            right: 16,
            bottom: 100,
            padding: '13px 18px 13px 13px',
            background: 'linear-gradient(135deg, #2C2C2E 0%, #3A3A3C 100%)',
            boxShadow: '0 12px 28px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08) inset',
            border: 'none',
          }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 26,
              height: 26,
              background: 'linear-gradient(135deg, #9D82FF 0%, #C39FFF 100%)',
            }}
          >
            <PlusIcon size={13} />
          </div>
          <span style={{ color: '#F2F2F7', fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
            New post
          </span>
        </motion.button>
      )}

      {/* Video modal */}
      <AnimatePresence>
        {mediaViewer && (
          <FeedMediaViewer
            post={mediaViewer.post}
            startIdx={mediaViewer.idx}
            onClose={() => setMediaViewer(null)}
          />
        )}
      </AnimatePresence>

      <BottomNav active="feed" />
    </div>
  );
}