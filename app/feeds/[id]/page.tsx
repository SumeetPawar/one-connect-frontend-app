'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MOCK_POSTS, REACTIONS, TYPE_META, COMMENT_REACTIONS, COMMENT_REACTION_KEYS,
  Post, Comment, CommentReactionKey, SemanticReaction, RsvpAnswers,
} from '../data';
import { BottomNav } from '../../components/BottomNav';

/* ── Icons ── */
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F2F2F7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);
const BookmarkIcon = ({ filled, color = '#636366' }: { filled: boolean; color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const PinIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#AEAEB2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const PlayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="none">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const CheckCircleIcon = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

/* ── Reaction icon ── */
const ReactionIcon = ({ type, size = 22 }: { type: SemanticReaction; size?: number }) => {
  const id = `ri-${type}`;
  const icons: Record<SemanticReaction, React.ReactElement> = {
    heart: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <defs><radialGradient id={id} cx="50%" cy="35%" r="65%"><stop offset="0%" stopColor="#FF8FB0"/><stop offset="100%" stopColor="#FF2D6B"/></radialGradient></defs>
        <path d="M20 34s-14-9.5-14-18.5C6 10.15 10.15 6 15 6c2.5 0 4.9 1.15 6.5 3 .4.5.6.8.5.8s.1-.3.5-.8C24.1 7.15 26.5 6 29 6c4.85 0 9 4.15 9 9.5C38 24.5 24 34 20 34z" fill={`url(#${id})`}/>
      </svg>
    ),
    excited: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <defs><linearGradient id={id} x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#FFE04B"/><stop offset="55%" stopColor="#FF8C2A"/><stop offset="100%" stopColor="#FF4820"/></linearGradient></defs>
        <path d="M20 37c-8 0-13-5.5-13-12 0-4 2-7.5 5-10-0.5 3 1 5.5 3 7 0-5 3-9.5 7-12-1 4 1 7 3 9 1-2.5 1-5 0-7 4 3.5 6 8.5 6 13C31 31.5 26 37 20 37z" fill={`url(#${id})`}/>
      </svg>
    ),
    proud: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <defs><linearGradient id={id} x1="8" y1="8" x2="32" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#FFE880"/><stop offset="100%" stopColor="#FFAA20"/></linearGradient></defs>
        <rect x="14" y="18" width="14" height="8" rx="4" fill={`url(#${id})`}/>
        <rect x="18" y="10" width="10" height="14" rx="5" fill={`url(#${id})`}/>
        <ellipse cx="14" cy="20" rx="5" ry="6" fill={`url(#${id})`}/>
        <rect x="20" y="6" width="9" height="8" rx="3.5" fill={`url(#${id})`}/>
      </svg>
    ),
    wow: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <defs><radialGradient id={id} cx="50%" cy="50%" r="55%"><stop offset="0%" stopColor="#AAEEFF"/><stop offset="100%" stopColor="#1ABFFF"/></radialGradient></defs>
        <path d="M20 4l3.9 8.3 9.1 1.2-6.7 6.2 1.7 9-8-4.5-8 4.5 1.7-9L6.9 13.5l9.1-1.2z" fill={`url(#${id})`}/>
      </svg>
    ),
    in: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <defs><linearGradient id={id} x1="8" y1="4" x2="32" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#C4ADFF"/><stop offset="100%" stopColor="#7B55F5"/></linearGradient></defs>
        <rect x="14" y="16" width="14" height="18" rx="5" fill={`url(#${id})`}/>
        <rect x="22" y="7" width="5" height="14" rx="2.5" fill={`url(#${id})`}/>
        <rect x="17" y="5" width="5" height="15" rx="2.5" fill={`url(#${id})`}/>
        <rect x="12" y="8" width="5" height="13" rx="2.5" fill={`url(#${id})`}/>
        <rect x="27" y="11" width="4.5" height="11" rx="2.25" fill={`url(#${id})`}/>
        <rect x="8" y="18" width="7" height="5" rx="2.5" fill={`url(#${id})`} transform="rotate(-15 8 18)"/>
      </svg>
    ),
    insight: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <defs><radialGradient id={id} cx="50%" cy="40%" r="60%"><stop offset="0%" stopColor="#FFF176"/><stop offset="100%" stopColor="#FFB300"/></radialGradient></defs>
        <circle cx="20" cy="18" r="13" fill={`url(#${id})`} opacity="0.18"/>
        <path d="M14 22c0-3.3 2.7-6 6-6s6 2.7 6 6c0 2.5-1.5 4.5-3.5 5.5V29h-5v-1.5C15.5 26.5 14 24.5 14 22z" fill={`url(#${id})`}/>
        <rect x="16.5" y="29" width="7" height="2" rx="1" fill="#FFB300"/>
        <rect x="17" y="31" width="6" height="2" rx="1" fill="#FF8F00"/>
        <line x1="20" y1="5" x2="20" y2="8" stroke="#FFE066" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="29.5" y1="9" x2="27.5" y2="11" stroke="#FFE066" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="10.5" y1="9" x2="12.5" y2="11" stroke="#FFE066" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  };
  return icons[type];
};

/* ── Comment reaction icon ── */
const CommentReactionIcon = ({ type, size = 18 }: { type: CommentReactionKey; size?: number }) => {
  const cid = `cri-${type}`;
  switch (type) {
    case 'love': return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <defs><radialGradient id={cid} cx="50%" cy="35%" r="65%"><stop offset="0%" stopColor="#FF8FB0"/><stop offset="100%" stopColor="#FF2D6B"/></radialGradient></defs>
        <path d="M16 27S4 19 4 11.5C4 8.4 6.7 6 10 6c1.9 0 3.7.9 5 2.4C16.3 6.9 18.1 6 20 6c3.3 0 6 2.4 6 5.5C26 19 14 27 16 27z" fill={`url(#${cid})`}/>
      </svg>
    );
    case 'haha': return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <defs><radialGradient id={cid} cx="50%" cy="40%" r="60%"><stop offset="0%" stopColor="#FFE566"/><stop offset="100%" stopColor="#FFA500"/></radialGradient></defs>
        <circle cx="16" cy="16" r="12" fill={`url(#${cid})`}/>
        <path d="M11 13c.8-1 2-1 2.5 0" stroke="#7A4800" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M18.5 13c.8-1 2-1 2.5 0" stroke="#7A4800" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <path d="M10 17.5c1.2 4.5 10.8 4.5 12 0" fill="#7A4800"/>
        <ellipse cx="16" cy="20.5" rx="3" ry="1.8" fill="#FF6B8A"/>
      </svg>
    );
    case 'wow': return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <defs><radialGradient id={cid} cx="50%" cy="40%" r="60%"><stop offset="0%" stopColor="#FFE566"/><stop offset="100%" stopColor="#FFA500"/></radialGradient></defs>
        <circle cx="16" cy="16" r="12" fill={`url(#${cid})`}/>
        <ellipse cx="13" cy="14" rx="2" ry="2.2" fill="#7A4800"/>
        <ellipse cx="19" cy="14" rx="2" ry="2.2" fill="#7A4800"/>
        <ellipse cx="16" cy="21" rx="3" ry="3.5" fill="#7A4800"/>
        <ellipse cx="16" cy="21" rx="2" ry="2.5" fill="#5A3200"/>
      </svg>
    );
    case 'clap': return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <defs><linearGradient id={cid} x1="4" y1="4" x2="28" y2="30" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#DFC0FF"/><stop offset="100%" stopColor="#9B5CF6"/></linearGradient></defs>
        <ellipse cx="16" cy="18" rx="6" ry="8" fill={`url(#${cid})`}/>
        <path d="M10 18c-1-3 0-8 1.5-10 .8-1.2 2.2-.8 2.5.2L16 14" fill={`url(#${cid})`}/>
        <path d="M22 18c1-3 0-8-1.5-10-.8-1.2-2.2-.8-2.5.2L16 14" fill={`url(#${cid})`}/>
      </svg>
    );
    case 'fire': return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <defs><linearGradient id={cid} x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#FFE04B"/><stop offset="55%" stopColor="#FF8C2A"/><stop offset="100%" stopColor="#FF4820"/></linearGradient></defs>
        <path d="M16 29c-6 0-10-4-10-9 0-3 1.5-5.5 4-7.5-.4 2 .8 4 2.5 5 0-4 2-7 5-9-.8 3 .8 5.5 2.5 7 .8-2 .8-4 0-5.5 3 2.5 4.5 6.5 4.5 10C24 25 21 29 16 29z" fill={`url(#${cid})`}/>
      </svg>
    );
  }
};

/* ── Avatar ── */
const Avatar = ({ initials, color, size = 34 }: { initials: string; color: string; size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    background: `linear-gradient(135deg,${color} 0%,${color}99 100%)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.36, fontWeight: 700, color: '#fff', letterSpacing: '0.02em',
  }}>
    {initials}
  </div>
);

/* ── Poll body ── */
const PollBody = ({ post, onVote }: { post: Post; onVote: (postId: string, optId: string) => void }) => {
  const opts = post.pollOptions || [];
  const total = post.pollTotalVotes || opts.reduce((s, o) => s + o.votes, 0) || 1;
  const voted = !!post.myVote;
  const accent = TYPE_META.poll.accent;
  const deadlineMs = post.pollDeadline ? post.pollDeadline.getTime() - Date.now() : 0;
  const deadlineDays = Math.floor(deadlineMs / (1000 * 60 * 60 * 24));
  const deadlineHours = Math.floor(deadlineMs / (1000 * 60 * 60));
  const deadlineLabel = deadlineMs < 0 ? 'Closed' : deadlineDays > 0 ? `${deadlineDays}d left` : `${deadlineHours}h left`;

  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {opts.map((opt) => {
          const pct = voted ? Math.round((opt.votes / total) * 100) : 0;
          const isMyVote = post.myVote === opt.id;
          const isWinning = voted && opt.votes === Math.max(...opts.map((o) => o.votes));
          return (
            <button
              key={opt.id}
              onClick={() => { if (!voted) onVote(post.id, opt.id); }}
              style={{
                position: 'relative', overflow: 'hidden', borderRadius: 12, padding: '10px 14px',
                background: isMyVote ? `${accent}20` : 'rgba(255,255,255,0.06)',
                border: isMyVote ? `1.5px solid ${accent}50` : '1.5px solid rgba(255,255,255,0.06)',
                cursor: voted ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
              }}
            >
              {voted && (
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  style={{ position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 12, background: isMyVote ? `${accent}28` : 'rgba(255,255,255,0.04)', zIndex: 0 }}
                />
              )}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isMyVote && <CheckCircleIcon color={accent} />}
                  <span style={{ fontSize: 13, fontWeight: isMyVote ? 600 : 400, color: isMyVote ? '#F2F2F7' : '#AEAEB2' }}>{opt.label}</span>
                  {isWinning && voted && (
                    <span style={{ padding: '1px 6px', background: accent, color: '#0A0A0C', fontSize: 9, fontWeight: 700, borderRadius: 999 }}>LEADING</span>
                  )}
                </div>
                {voted && <span style={{ fontSize: 12, fontWeight: 700, color: isMyVote ? accent : '#636366' }}>{pct}%</span>}
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 11, color: '#636366' }}>
        <span>{total} votes</span>
        <span>·</span>
        <span style={{ color: deadlineMs < 0 ? '#FF5C87' : '#636366' }}>{deadlineLabel}</span>
      </div>
    </div>
  );
};

/* ── RSVP body ── */
const RsvpBody = ({ post }: { post: Post }) => {
  const sections = post.rsvpSections || [];
  const [answers, setAnswers] = useState<RsvpAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const toggle = (sectionId: string, optId: string, multi: boolean) => {
    setAnswers((prev) => {
      const cur = prev[sectionId] || [];
      if (multi) return { ...prev, [sectionId]: cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId] };
      return { ...prev, [sectionId]: cur[0] === optId ? [] : [optId] };
    });
    setErrors((e) => ({ ...e, [sectionId]: false }));
  };

  const handleSubmit = () => {
    const errs: Record<string, boolean> = {};
    let valid = true;
    for (const s of sections) {
      if (s.required && !(answers[s.id] || []).length) { errs[s.id] = true; valid = false; }
    }
    setErrors(errs);
    if (valid) setSubmitted(true);
  };

  const filled = sections.filter((s) => (answers[s.id] || []).length > 0).length;

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: 'linear-gradient(145deg,rgba(93,207,255,0.1),rgba(93,207,255,0.04))', border: '1.5px solid rgba(93,207,255,0.25)', borderRadius: 16, padding: '28px 20px', textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
        <p style={{ fontSize: 16, fontWeight: 800, color: '#5DCFFF', fontFamily: 'Syne,sans-serif' }}>You&apos;re registered!</p>
        <p style={{ fontSize: 12, color: '#AEAEB2', marginTop: 4 }}>Check your email for a confirmation. See you at the summit 🎉</p>
        <button onClick={() => { setSubmitted(false); setAnswers({}); }}
          style={{ marginTop: 12, padding: '6px 18px', borderRadius: 20, background: 'rgba(93,207,255,0.1)', border: '1px solid rgba(93,207,255,0.25)', color: '#5DCFFF', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
          Edit response
        </button>
      </motion.div>
    );
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <motion.div animate={{ width: `${(filled / sections.length) * 100}%` }} transition={{ duration: 0.4 }}
            style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#5DCFFF,#9D82FF)' }} />
        </div>
        <span style={{ fontSize: 10, color: '#636366', whiteSpace: 'nowrap' }}>{filled}/{sections.length} filled</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sections.map((sec) => {
          const sel = answers[sec.id] || [];
          const hasError = errors[sec.id];
          const isShirt = sec.id === 'rs3';
          return (
            <div key={sec.id}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: hasError ? '#FF5C87' : '#F2F2F7' }}>
                  {sec.question}{sec.required && <span style={{ color: '#FF5C87', marginLeft: 2 }}>*</span>}
                </span>
                {sec.hint && <span style={{ fontSize: 10, color: '#636366' }}>· {sec.hint}</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: isShirt ? 'wrap' as const : 'nowrap' as const, flexDirection: isShirt ? undefined : 'column', gap: 8 }}>
                {sec.options.map((opt) => {
                  const isSelected = sel.includes(opt.id);
                  return (
                    <motion.button key={opt.id} whileTap={{ scale: 0.96 }}
                      onClick={() => toggle(sec.id, opt.id, sec.multi || false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                        borderRadius: isShirt ? 10 : 12, padding: isShirt ? '7px 14px' : '10px 14px',
                        background: isSelected ? 'linear-gradient(135deg,rgba(93,207,255,0.18),rgba(157,130,255,0.14))' : 'rgba(255,255,255,0.04)',
                        border: isSelected ? '1.5px solid rgba(93,207,255,0.5)' : `1px solid ${hasError ? 'rgba(255,92,135,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        cursor: 'pointer', transition: 'all 0.15s ease',
                      }}>
                      <div style={{ width: 18, height: 18, borderRadius: sec.multi ? 5 : 9, flexShrink: 0, background: isSelected ? 'linear-gradient(135deg,#5DCFFF,#9D82FF)' : 'transparent', border: isSelected ? 'none' : '1.5px solid #3A3A3C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isSelected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      {opt.icon && !isShirt && <span style={{ fontSize: 18 }}>{opt.icon}</span>}
                      <span style={{ fontSize: isShirt ? 12 : 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#E8F8FF' : '#AEAEB2' }}>{opt.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {post.rsvpCapacity && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
          <div style={{ flex: 1, height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 3, width: `${Math.min(100, ((post.rsvpCount || 0) / post.rsvpCapacity) * 100)}%`, background: (post.rsvpCount || 0) / post.rsvpCapacity > 0.85 ? 'linear-gradient(90deg,#FF8C55,#FF5C87)' : 'linear-gradient(90deg,#4CD97B,#5DCFFF)' }} />
          </div>
          <span style={{ fontSize: 10, color: '#636366', whiteSpace: 'nowrap' }}>{post.rsvpCount}/{post.rsvpCapacity} spots</span>
        </div>
      )}
      {post.rsvpDeadline && (
        <p style={{ fontSize: 10, color: '#636366', marginTop: 4, marginBottom: 12 }}>Closes {post.rsvpDeadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
      )}
      <motion.button whileTap={{ scale: 0.96 }} onClick={handleSubmit}
        style={{ width: '100%', marginTop: 4, padding: 13, borderRadius: 14, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800, fontFamily: 'Syne,sans-serif', background: 'linear-gradient(135deg,#5DCFFF,#9D82FF)', color: '#0A0A0C', boxShadow: '0 4px 20px rgba(93,207,255,0.35)' }}>
        Submit Registration ✓
      </motion.button>
    </div>
  );
};

/* ── Comment row ── */
const CommentRow = ({ comment, depth = 0, onReply }: { comment: Comment; depth?: number; onReply: (a: string) => void }) => {
  const [liked, setLiked] = useState(comment.myLiked || false);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [showPicker, setShowPicker] = useState(false);
  const [myReaction, setMyReaction] = useState<CommentReactionKey | null>(comment.emojiReaction || null);
  const [reactionCounts, setReactionCounts] = useState<Partial<Record<CommentReactionKey, number>>>(comment.emojiCounts || {});
  const [showReplies, setShowReplies] = useState(false);

  const handleLike = () => { setLiked((v) => !v); setLikeCount((n) => liked ? n - 1 : n + 1); };
  const handleReaction = (key: CommentReactionKey) => {
    setReactionCounts((prev) => {
      const next = { ...prev };
      if (myReaction === key) { next[key] = Math.max(0, (next[key] || 1) - 1); if (!next[key]) delete next[key]; setMyReaction(null); }
      else { if (myReaction) { next[myReaction] = Math.max(0, (next[myReaction] || 1) - 1); if (!next[myReaction]) delete next[myReaction]; } next[key] = (next[key] || 0) + 1; setMyReaction(key); }
      return next;
    });
    setShowPicker(false);
  };

  const topReactions = (Object.entries(reactionCounts) as [CommentReactionKey, number][]).filter(([, n]) => n > 0).sort(([, a], [, b]) => b - a).slice(0, 3);

  return (
    <div style={{ marginLeft: depth > 0 ? 44 : 0, position: 'relative' }}>
      {depth > 0 && <div style={{ position: 'absolute', left: -22, top: 0, bottom: 16, width: 1.5, background: 'rgba(255,255,255,0.07)', borderRadius: 1 }} />}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Avatar initials={comment.author.split(' ').map((s) => s[0]).slice(0, 2).join('')} color={comment.authorColor} size={depth > 0 ? 26 : 32} />
        <div style={{ flex: 1, minWidth: 0, paddingBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F2F2F7' }}>{comment.author}</span>
            <span style={{ fontSize: 11, color: '#636366' }}>{comment.time}</span>
          </div>
          <p style={{ fontSize: 14, color: '#AEAEB2', lineHeight: 1.5, wordBreak: 'break-word' }}>
            {comment.replyTo && <span style={{ color: '#9D82FF', fontWeight: 600, marginRight: 4 }}>@{comment.replyTo}</span>}
            {comment.text}
          </p>
          {topReactions.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {topReactions.map(([key, count]) => {
                const r = COMMENT_REACTIONS[key];
                const isMine = myReaction === key;
                return (
                  <motion.button key={key} whileTap={{ scale: 0.88 }} onClick={() => handleReaction(key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px 3px 4px', borderRadius: 999, background: isMine ? `${r.color}18` : 'rgba(255,255,255,0.07)', border: isMine ? `1px solid ${r.color}45` : '1px solid rgba(255,255,255,0.08)', color: isMine ? r.color : '#AEAEB2', fontSize: 11, fontWeight: isMine ? 700 : 400 }}>
                    <CommentReactionIcon type={key} size={18} />
                    <span>{count}</span>
                  </motion.button>
                );
              })}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10, position: 'relative' }}>
            <motion.button whileTap={{ scale: 0.85 }} onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0 }}>
              <CommentReactionIcon type="love" size={18} />
              {likeCount > 0 && <span style={{ fontSize: 11, color: liked ? '#FF5C87' : '#636366', fontWeight: liked ? 700 : 400 }}>{likeCount}</span>}
            </motion.button>
            <div style={{ position: 'relative' }}>
              {showPicker && <div style={{ position: 'fixed', inset: 0, zIndex: 29 }} onClick={() => setShowPicker(false)} />}
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowPicker((v) => !v)}
                style={{
                  background: myReaction ? `${COMMENT_REACTIONS[myReaction].color}18` : 'none',
                  border: myReaction ? `1px solid ${COMMENT_REACTIONS[myReaction].color}40` : 'none',
                  borderRadius: 999, padding: myReaction ? '2px 7px 2px 4px' : 0,
                  display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer',
                  filter: myReaction ? `drop-shadow(0 0 4px ${COMMENT_REACTIONS[myReaction].glow})` : 'none',
                }}>
                {myReaction ? (
                  <>
                    <CommentReactionIcon type={myReaction} size={16} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: COMMENT_REACTIONS[myReaction].color }}>{COMMENT_REACTIONS[myReaction].label}</span>
                  </>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                )}
              </motion.button>
              <AnimatePresence>
                {showPicker && (
                  <motion.div initial={{ opacity: 0, scale: 0.85, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 6 }} transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                    style={{ position: 'absolute', bottom: 28, left: -8, zIndex: 30, display: 'flex', alignItems: 'flex-end', gap: 2, padding: '8px 10px', borderRadius: 999, background: 'linear-gradient(160deg,#28282C,#1C1C1E)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)' }}>
                    {COMMENT_REACTION_KEYS.map((key, i) => {
                      const r = COMMENT_REACTIONS[key];
                      const isSelected = myReaction === key;
                      return (
                        <motion.button key={key} initial={{ opacity: 0, y: 8, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.035, type: 'spring', damping: 14, stiffness: 400 }} whileHover={{ y: -6, scale: 1.28 }} whileTap={{ scale: 0.82 }} onClick={() => handleReaction(key)}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: isSelected ? `${r.color}20` : 'none', border: isSelected ? `1.5px solid ${r.color}55` : '1.5px solid transparent', borderRadius: 10, padding: '3px 5px 4px', cursor: 'pointer', filter: isSelected ? `drop-shadow(0 0 6px ${r.glow})` : 'none' }}>
                          <CommentReactionIcon type={key} size={26} />
                          <span style={{ fontSize: 9, fontWeight: isSelected ? 800 : 500, color: isSelected ? r.color : '#636366', whiteSpace: 'nowrap' }}>{r.label}</span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {depth === 0 && (
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => { onReply(comment.author); setShowPicker(false); }}
                style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 600, color: '#636366' }}>Reply</motion.button>
            )}
          </div>
          {depth === 0 && comment.replies && comment.replies.length > 0 && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowReplies((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, background: 'none', border: 'none', padding: 0 }}>
              <div style={{ width: 28, height: 1.5, background: 'rgba(255,255,255,0.16)', borderRadius: 1 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#AEAEB2' }}>{showReplies ? 'Hide replies' : `View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}</span>
            </motion.button>
          )}
        </div>
      </div>
      {depth === 0 && showReplies && comment.replies && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}>
            {comment.replies.map((reply) => <CommentRow key={reply.id} comment={reply} depth={1} onReply={onReply} />)}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

/* ── Main page ── */
export default function FeedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(() => MOCK_POSTS.find((p) => p.id === id) ?? null);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<Comment[]>(post?.commentsList || []);
  const [mediaViewerIdx, setMediaViewerIdx] = useState<number | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const swipeDir = useRef<1 | -1>(1); // 1 = forward (left swipe), -1 = back (right swipe)

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', background: '#111113', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#636366', fontSize: 14 }}>Post not found.</p>
      </div>
    );
  }

  const meta = TYPE_META[post.type];
  const allMedia = post.media || [];
  const allImages = allMedia.filter((m): m is { type: 'image'; url: string } => m.type === 'image').map((m) => m.url);

  const handleReact = (r: SemanticReaction | null) => {
    setPost((p) => {
      if (!p) return p;
      const next = { ...p, reactions: { ...p.reactions }, myReaction: r };
      if (p.myReaction) next.reactions[p.myReaction] = Math.max(0, (next.reactions[p.myReaction] || 0) - 1);
      if (r) next.reactions[r] = (next.reactions[r] || 0) + 1;
      return next;
    });
  };

  const handleSave = () => setPost((p) => p ? { ...p, saved: !p.saved } : p);

  const handleVote = (postId: string, optId: string) => {
    setPost((p) => {
      if (!p) return p;
      const newTotal = (p.pollTotalVotes || 0) + 1;
      return {
        ...p, myVote: optId, pollTotalVotes: newTotal,
        pollOptions: (p.pollOptions || []).map((o) => o.id === optId ? { ...o, votes: o.votes + 1 } : o),
      };
    });
  };

  const handleSendComment = () => {
    const text = commentText.trim();
    if (!text) return;
    setLocalComments((prev) => [...prev, { id: `new-${Date.now()}`, author: 'You', authorColor: '#9D82FF', text, time: 'now', likes: 0, replyTo: replyingTo || undefined }]);
    setCommentText('');
    setReplyingTo(null);
  };

  const handleViewerPrev = () => setMediaViewerIdx((i) => i !== null && i > 0 ? i - 1 : i);
  const handleViewerNext = () => setMediaViewerIdx((i) => i !== null && i < allMedia.length - 1 ? i + 1 : i);

  return (
    <div style={{ minHeight: '100vh', background: '#111113', overflowY: 'auto', paddingBottom: 80 }}>
      <style>{`* { -webkit-tap-highlight-color: transparent; } ::-webkit-scrollbar { display: none; }`}</style>

      {/* Sticky nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(17,17,19,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
      }}>
        <button
          onClick={() => router.back()}
          style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <BackIcon />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#636366', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
            {meta.icon} {meta.label}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#F2F2F7', letterSpacing: '-0.02em', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.department}
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.88 }} onClick={handleSave} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}>
          <BookmarkIcon filled={post.saved} color={post.saved ? meta.accent : '#636366'} />
        </motion.button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 16px 0' }}>

        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Avatar initials={post.postedBy.split(' ').map((w) => w[0]).join('').slice(0, 2)} color={post.postedByColor} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F2F2F7' }}>{post.postedBy}</div>
            <div style={{ fontSize: 11, color: '#636366' }}>{post.postedByRole} · {post.postedAt}</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px 3px 5px', borderRadius: 999, background: meta.tint, fontSize: 10, fontWeight: 700, color: meta.accent, letterSpacing: '0.05em', flexShrink: 0 }}>
            <span style={{ fontSize: 12 }}>{meta.icon}</span>{meta.label}
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: 'Syne,-apple-system,sans-serif', fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.2, color: '#F2F2F7', margin: '0 0 10px' }}>
          {post.title}
        </h1>

        {/* Description */}
        <p style={{ fontSize: 15, color: '#AEAEB2', lineHeight: 1.65, letterSpacing: '-0.01em', marginBottom: 18 }}>
          {post.description}
        </p>

        {/* Media */}
        {allMedia.length > 0 && (() => {
          const first = allMedia[0];
          return (
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: allMedia.length > 1 ? 8 : 18, cursor: 'pointer' }}
              onClick={() => setMediaViewerIdx(0)}>
              {first.type === 'image' ? (
                <img src={first.url} alt="" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                  <img src={first.poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PlayIcon />
                    </div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 8, right: 8, padding: '2px 7px', background: 'rgba(0,0,0,0.7)', borderRadius: 6, fontSize: 10, fontWeight: 600, color: '#fff' }}>{first.duration}</div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Thumbnail strip — all media */}
        {allMedia.length > 1 && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 18, scrollbarWidth: 'none' }}>
            {allMedia.map((m, i) => (
              <button key={i} onClick={() => setMediaViewerIdx(i)}
                style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 10, overflow: 'hidden', border: `2px solid ${i === (mediaViewerIdx ?? 0) ? meta.accent : 'transparent'}`, padding: 0, background: '#2C2C2E', cursor: 'pointer', position: 'relative' }}>
                <img src={m.type === 'image' ? m.url : m.poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {m.type === 'video' && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Event strip */}
        {post.type === 'event' && post.startsAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 14, padding: '12px 14px', background: meta.tint, border: `1px solid ${meta.accent}30`, marginBottom: 18 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: `1px solid ${meta.accent}35`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: meta.accent, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{post.startsAt.toLocaleDateString([], { month: 'short' })}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, color: '#F2F2F7', lineHeight: 1 }}>{post.startsAt.getDate()}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#F2F2F7' }}>{post.startsAt.toLocaleDateString([], { weekday: 'long', hour: 'numeric', minute: '2-digit' })}</div>
              {post.location && <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, fontSize: 12, color: '#AEAEB2' }}><PinIcon />{post.location}</div>}
              {post.totalAttendees && <div style={{ fontSize: 12, color: '#AEAEB2', marginTop: 2 }}>{post.totalAttendees} attending
                {(post.joinedInLastHour || 0) > 0 && <motion.span animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.8, repeat: Infinity }} style={{ color: meta.accent, fontWeight: 600, marginLeft: 4 }}>· {post.joinedInLastHour} just joined</motion.span>}
              </div>}
            </div>
            <button style={{ padding: '8px 18px', background: meta.accent, color: '#0A0A0C', fontSize: 13, fontWeight: 700, borderRadius: 999, border: 'none', cursor: 'pointer', boxShadow: `0 4px 14px ${meta.accent}50` }}>Join</button>
          </div>
        )}

        {/* Poll */}
        {post.type === 'poll' && post.pollOptions && (
          <div style={{ marginBottom: 18 }}>
            <PollBody post={post} onVote={handleVote} />
          </div>
        )}

        {/* RSVP */}
        {post.type === 'rsvp' && post.rsvpSections && (
          <div style={{ marginBottom: 18 }}>
            <RsvpBody post={post} />
          </div>
        )}
      </div>

      {/* Reaction summary + action bar */}
      {(() => {
        const activeReactions = (Object.entries(post.reactions) as [SemanticReaction, number][]).filter(([, n]) => (n || 0) > 0).sort(([, a], [, b]) => b - a);
        const totalCount = activeReactions.reduce((s, [, n]) => s + n, 0);
        const myR = post.myReaction ? REACTIONS[post.myReaction] : null;

        return (
          <>
            {/* Reaction summary line */}
            {totalCount > 0 && (
              <div style={{ padding: '10px 16px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {activeReactions.slice(0, 3).map(([key], i) => (
                    <div key={key} style={{ marginLeft: i > 0 ? -5 : 0, zIndex: 3 - i, position: 'relative', width: 20, height: 20, borderRadius: '50%', background: '#111113', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ReactionIcon type={key} size={16} />
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: 12, color: '#636366' }}>{totalCount.toLocaleString()}</span>
              </div>
            )}

            {/* Action bar */}
            <div style={{ position: 'relative', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: totalCount > 0 ? 10 : 0, display: 'flex' }}>

              {/* Reaction picker popup */}
              {showReactionPicker && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowReactionPicker(false)} />
              )}
              <AnimatePresence>
                {showReactionPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.88, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.88, y: 8 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      position: 'absolute', bottom: 'calc(100% + 8px)', left: 8,
                      display: 'flex', alignItems: 'flex-end', gap: 2,
                      padding: '10px 12px',
                      background: 'linear-gradient(160deg,#27272A 0%,#1C1C1E 100%)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 999,
                      boxShadow: '0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
                      zIndex: 50,
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
                          whileHover={{ y: -6, scale: 1.28 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => { handleReact(isSelected ? null : key); setShowReactionPicker(false); }}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                            background: isSelected ? `${r.color}20` : 'none',
                            border: isSelected ? `1.5px solid ${r.color}55` : '1.5px solid transparent',
                            borderRadius: 12, padding: '4px 6px',
                            cursor: 'pointer',
                            filter: isSelected ? `drop-shadow(0 0 8px ${r.glow})` : 'none',
                          }}
                        >
                          <div style={{ filter: isSelected ? `drop-shadow(0 0 5px ${r.glow})` : 'none' }}>
                            <ReactionIcon type={key} size={30} />
                          </div>
                          <span style={{ fontSize: 9, fontWeight: isSelected ? 800 : 500, color: isSelected ? r.color : '#636366', whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>
                            {r.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* React button */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowReactionPicker((v) => !v)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '13px 0',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                  color: myR ? myR.color : '#636366',
                  filter: myR ? `drop-shadow(0 0 6px ${myR.glow})` : 'none',
                }}
              >
                {myR ? (
                  <div style={{ filter: `drop-shadow(0 0 4px ${myR.glow})` }}>
                    <ReactionIcon type={post.myReaction!} size={20} />
                  </div>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                  </svg>
                )}
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
                  {myR ? myR.label : 'React'}
                </span>
              </motion.button>

              {/* Comment button */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => { commentInputRef.current?.focus(); setShowReactionPicker(false); }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '13px 0',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                  color: '#636366',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#636366', letterSpacing: '-0.01em' }}>
                  {localComments.length > 0 ? localComments.length : 'Comment'}
                </span>
              </motion.button>

              {/* Save button */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => { handleSave(); setShowReactionPicker(false); }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '13px 0',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: post.saved ? meta.accent : '#636366',
                  filter: post.saved ? `drop-shadow(0 0 6px ${meta.accent}80)` : 'none',
                }}
              >
                <BookmarkIcon filled={post.saved} color={post.saved ? meta.accent : '#636366'} />
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>
                  {post.saved ? 'Saved' : 'Save'}
                </span>
              </motion.button>
            </div>
          </>
        );
      })()}

      {/* Comments */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ padding: '16px 16px 12px' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#F2F2F7', letterSpacing: '-0.02em' }}>
            {localComments.length > 0 ? `${localComments.length} comments` : 'Comments'}
          </span>
        </div>
        {localComments.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 16px 28px' }}>
            <span style={{ fontSize: 32 }}>💬</span>
            <p style={{ fontSize: 13, color: '#636366', marginTop: 8 }}>No comments yet. Be the first.</p>
          </div>
        )}
        <div style={{ padding: '0 16px 12px' }}>
          {localComments.map((c) => <CommentRow key={c.id} comment={c} depth={0} onReply={setReplyingTo} />)}
        </div>
      </div>

      {/* Comment input — sticky bottom */}
      <div style={{ position: 'fixed', bottom: 64, left: 0, right: 0, zIndex: 20, background: '#111113', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <AnimatePresence>
          {replyingTo && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: 'rgba(157,130,255,0.08)', borderBottom: '1px solid rgba(157,130,255,0.12)' }}>
              <span style={{ fontSize: 12, color: '#9D82FF', fontWeight: 600 }}>Replying to <span style={{ color: '#C39FFF' }}>@{replyingTo}</span></span>
              <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', fontSize: 16, color: '#636366', lineHeight: 1, padding: 0, cursor: 'pointer' }}>✕</button>
            </motion.div>
          )}
        </AnimatePresence>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px' }}>
          <Avatar initials="Yo" color="#9D82FF" size={32} />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, paddingLeft: 14, paddingRight: 6, minHeight: 42, gap: 8 }}>
            <input
              value={commentText}
              ref={commentInputRef}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
              placeholder={replyingTo ? `Reply to @${replyingTo}…` : 'Add a comment…'}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: '#F2F2F7', paddingTop: 10, paddingBottom: 10 }}
            />
            <AnimatePresence>
              {commentText.trim() && (
                <motion.button initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} whileTap={{ scale: 0.88 }} onClick={handleSendComment}
                  style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#9D82FF,#C39FFF)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                  <SendIcon />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Unified media viewer */}
      <AnimatePresence>
        {mediaViewerIdx !== null && allMedia.length > 0 && (() => {
          const current = allMedia[mediaViewerIdx];
          const hasPrev = mediaViewerIdx > 0;
          const hasNext = mediaViewerIdx < allMedia.length - 1;
          return (
            <motion.div
              key="media-viewer"
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
                  onClick={() => setMediaViewerIdx(null)}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
                {allMedia.length > 1 && (
                  <div style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#F2F2F7', letterSpacing: '-0.01em' }}>{mediaViewerIdx + 1} / {allMedia.length}</span>
                  </div>
                )}
                {current.type === 'video' ? (
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                  </div>
                ) : (
                  <div style={{ width: 36 }} />
                )}
              </div>

              {/* Media content — swipeable */}
              <motion.div
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '60px 0', touchAction: 'pan-y' }}
                drag={allMedia.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={(_, info) => {
                  const threshold = 60;
                  if (info.offset.x < -threshold && hasNext) {
                    swipeDir.current = 1;
                    handleViewerNext();
                  } else if (info.offset.x > threshold && hasPrev) {
                    swipeDir.current = -1;
                    handleViewerPrev();
                  }
                }}
              >
                <AnimatePresence mode="wait" custom={swipeDir.current}>
                  <motion.div
                    key={mediaViewerIdx}
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
                    {current.type === 'image' ? (
                      <img
                        src={current.url} alt=""
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', userSelect: 'none', pointerEvents: 'none' }}
                        draggable={false}
                      />
                    ) : (
                      <video
                        src={current.videoUrl}
                        controls autoPlay playsInline
                        style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, outline: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Side nav arrows */}
              {hasPrev && (
                <button
                  onClick={handleViewerPrev}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
              )}
              {hasNext && (
                <button
                  onClick={handleViewerNext}
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
                  padding: '20px 16px 24px',
                  display: 'flex', justifyContent: 'center', gap: 6,
                  overflowX: 'auto', scrollbarWidth: 'none',
                }}>
                  {allMedia.map((m, i) => (
                    <button key={i} onClick={() => setMediaViewerIdx(i)}
                      style={{
                        flexShrink: 0, width: i === mediaViewerIdx ? 52 : 44, height: i === mediaViewerIdx ? 52 : 44,
                        borderRadius: 10, overflow: 'hidden', padding: 0, background: '#2C2C2E', cursor: 'pointer',
                        border: `2px solid ${i === mediaViewerIdx ? '#fff' : 'rgba(255,255,255,0.2)'}`,
                        position: 'relative', transition: 'all 0.18s ease',
                        opacity: i === mediaViewerIdx ? 1 : 0.55,
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
        })()}
      </AnimatePresence>

      <BottomNav active="feed" />
    </div>
  );
}
