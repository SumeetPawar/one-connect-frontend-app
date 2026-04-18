'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

type PostType = 'event' | 'announcement' | 'celebration' | 'tip' | 'update' | 'poll';
type SemanticReaction = 'in' | 'excited' | 'proud' | 'bringing' | 'heart' | 'insight';

const REACTIONS: Record<SemanticReaction, { emoji: string; label: string; color: string }> = {
  in:       { emoji: '✋', label: "I'm in",          color: '#9D82FF' },
  excited:  { emoji: '🔥', label: "Can't wait",      color: '#FF9070' },
  proud:    { emoji: '💪', label: 'Proud',            color: '#FFD07A' },
  bringing: { emoji: '👥', label: 'Bringing friends', color: '#6DD8FF' },
  heart:    { emoji: '❤️', label: 'Love this',        color: '#FF6B8A' },
  insight:  { emoji: '💡', label: 'Insightful',       color: '#FFD860' },
};

// Dark tints — subtle but readable on #1C1C1E
const TYPE_META: Record<PostType, { label: string; icon: string; accent: string; tint: string }> = {
  event:        { label: 'EVENT',        icon: '📅', accent: '#9D82FF', tint: 'rgba(124,92,255,0.18)' },
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
  reactions: Partial<Record<SemanticReaction, number>>;
  myReaction?: SemanticReaction | null;
  comments: number;
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
      'The engineering squad crushed 1.2M steps this week 👏 Closing the challenge with a sunrise walk, coffee and a ceremony for the top three.',
    startsAt: new Date(Date.now() + 1000 * 60 * 60 * 62),
    location: 'Riverside Park · Main entrance',
    totalAttendees: 38,
    joinedInLastHour: 3,
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=900&q=80&fit=crop' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=900&q=80&fit=crop' },
    ],
    reactions: { in: 34, excited: 18, proud: 12 },
    myReaction: null,
    comments: 23,
    saved: false,
    postedBy: 'Aanya Kapoor',
    postedByRole: 'People Ops',
    postedAt: '2h',
    postedByColor: '#9D82FF',
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
    description: 'From everyone on the team — incredible dedication. 47 marathons worth of walking this year alone.',
    media: [
      {
        type: 'video',
        poster: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=900&q=80&fit=crop',
        duration: '0:42',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      },
    ],
    reactions: { heart: 87, proud: 34, excited: 12 },
    myReaction: 'heart',
    comments: 18,
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
    description: 'Starting May 1, all full-time staff receive 4 dedicated mental health days per year, separate from PTO. No justification required.',
    reactions: { heart: 156, insight: 34 },
    myReaction: null,
    comments: 41,
    saved: false,
    postedBy: 'Amp',
    postedByRole: 'CEO',
    postedAt: '2d',
    postedByColor: '#C39FFF',
  },
];

const TYPE_FILTERS: Array<{ key: 'all' | PostType; label: string }> = [
  { key: 'all',          label: 'All' },
  { key: 'event',        label: 'Events' },
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
   Media grid
   ───────────────────────────────────────────── */
const MediaGrid = ({ media, onVideoClick }: { media: MediaItem[]; onVideoClick?: (url: string) => void }) => {
  const count = media.length;

  const tile = (item: MediaItem, idx: number, extra?: number) => (
    <div key={idx} className="relative overflow-hidden w-full h-full" style={{ background: '#2C2C2E' }}>
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
          <button
            onClick={() => onVideoClick?.(item.videoUrl)}
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'transparent', border: 'none' }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 52,
                height: 52,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <PlayIcon size={20} />
            </div>
          </button>
          <div
            className="absolute bottom-2 right-2 rounded-md text-white"
            style={{ padding: '2px 7px', background: 'rgba(0,0,0,0.7)', fontSize: 10, fontWeight: 600 }}
          >
            {item.duration}
          </div>
        </>
      )}
      {extra && extra > 0 ? (
        <div
          className="absolute inset-0 flex items-center justify-center text-white"
          style={{
            background: 'rgba(0,0,0,0.62)',
            fontFamily: 'Syne, -apple-system, sans-serif',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          +{extra}
        </div>
      ) : null}
    </div>
  );

  if (count === 0) return null;
  if (count === 1)
    return <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden' }}>{tile(media[0], 0)}</div>;
  if (count === 2)
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, aspectRatio: '16/9' }}>
        {tile(media[0], 0)}
        {tile(media[1], 1)}
      </div>
    );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, aspectRatio: '16/9' }}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>{tile(media[0], 0)}</div>
      <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 2 }}>
        <div style={{ position: 'relative', overflow: 'hidden' }}>{tile(media[1], 1)}</div>
        <div style={{ position: 'relative', overflow: 'hidden' }}>{tile(media[2], 2, count > 3 ? count - 3 : undefined)}</div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Poll body
   ───────────────────────────────────────────── */
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
   Video modal
   ───────────────────────────────────────────── */
const VideoModal = ({ url, onClose }: { url: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center"
    style={{ background: 'rgba(0,0,0,0.96)' }}
    onClick={onClose}
  >
    <div className="relative w-full max-w-lg px-4" onClick={(e) => e.stopPropagation()}>
      <video
        src={url}
        controls
        autoPlay
        className="w-full rounded-2xl"
        style={{ maxHeight: '80vh', background: '#000' }}
      />
      <button
        onClick={onClose}
        className="absolute -top-10 right-4"
        style={{ fontSize: 13, fontWeight: 600, color: '#AEAEB2', background: 'transparent', border: 'none', letterSpacing: '-0.01em' }}
      >
        Close ✕
      </button>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────
   Post Card
   ───────────────────────────────────────────── */
const PostCard = ({
  post,
  onOpen,
  onReact,
  onSave,
  onVote,
  onVideoPlay,
}: {
  post: Post;
  onOpen: (id: string) => void;
  onReact: (id: string, r: SemanticReaction | null) => void;
  onSave: (id: string) => void;
  onVote: (postId: string, optId: string) => void;
  onVideoPlay: (url: string) => void;
}) => {
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
    if (post.myReaction) {
      onReact(post.id, null);
    } else {
      const defaults: Record<PostType, SemanticReaction> = {
        event: 'in', celebration: 'heart', announcement: 'heart',
        tip: 'heart', update: 'heart', poll: 'insight',
      };
      onReact(post.id, defaults[post.type]);
    }
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
          <MediaGrid media={post.media} onVideoClick={(url) => onVideoPlay(url)} />
        </div>
      )}

      {/* Footer */}
      <div className="px-4 pt-3 pb-2">
        {(totalReactions > 0 || post.comments > 0) && (
          <div
            className="flex items-center justify-between mb-2"
            style={{ fontSize: 12, color: '#636366' }}
          >
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {topReactions.map((t, i) => (
                  <div
                    key={t}
                    style={{
                      width: 18,
                      height: 18,
                      background: '#2C2C2E',
                      fontSize: 11,
                      marginLeft: i === 0 ? 0 : -5,
                      boxShadow: '0 0 0 1.5px #1C1C1E',
                      zIndex: 3 - i,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {REACTIONS[t].emoji}
                  </div>
                ))}
              </div>
              <span>
                <span style={{ fontWeight: 600, color: '#AEAEB2' }}>{totalReactions}</span>
                {post.type === 'event' && (post.joinedInLastHour || 0) > 0 && (
                  <>
                    {' · '}
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      style={{ color: meta.accent, fontWeight: 600 }}
                    >
                      {post.joinedInLastHour} just joined
                    </motion.span>
                  </>
                )}
              </span>
            </div>
            {post.comments > 0 && <span>{post.comments} comments</span>}
          </div>
        )}

        {/* Action bar */}
        <div
          className="flex items-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 6 }}
        >
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleReactTap}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2"
            style={{
              color: myReactionData ? myReactionData.color : '#636366',
              fontSize: 12,
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            {myReactionData ? (
              <motion.span
                key={post.myReaction}
                initial={{ scale: 0.5, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, stiffness: 320 }}
                style={{ fontSize: 14 }}
              >
                {myReactionData.emoji}
              </motion.span>
            ) : (
              <HeartIcon filled={false} size={16} />
            )}
            <span>{myReactionData ? myReactionData.label : 'React'}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2"
            style={{ color: '#636366', fontSize: 12, fontWeight: 600, background: 'transparent', border: 'none', letterSpacing: '-0.01em' }}
          >
            <CommentIcon size={16} />
            Comment
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={(e) => { e.stopPropagation(); onSave(post.id); }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2"
            style={{
              color: post.saved ? meta.accent : '#636366',
              fontSize: 12,
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            <BookmarkIcon filled={post.saved} size={15} color={post.saved ? meta.accent : '#636366'} />
            Save
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
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [typeFilter, setTypeFilter] = useState<'all' | PostType>('all');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

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

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: '#111113', paddingBottom: 120 }}>
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        div::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <header className="px-4 pt-7 pb-2">
        <div style={{ fontSize: 11, fontWeight: 500, color: '#636366', letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 2 }}>
          {today}
        </div>
        <h1
          style={{
            fontFamily: 'Syne, -apple-system, sans-serif',
            fontSize: 34,
            fontWeight: 700,
            color: '#F2F2F7',
            letterSpacing: '-0.035em',
            lineHeight: 1,
          }}
        >
          Feed
        </h1>
      </header>

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
                      color: isActive ? '#636366' : '#636366',
                      fontWeight: 500,
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
              onOpen={(id) => onOpenPost?.(id)}
              onReact={handleReact}
              onSave={handleSave}
              onVote={handleVote}
              onVideoPlay={setPlayingVideo}
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
        {playingVideo && (
          <VideoModal url={playingVideo} onClose={() => setPlayingVideo(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}