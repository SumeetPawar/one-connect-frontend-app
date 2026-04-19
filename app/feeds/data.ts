// Shared feeds data — types, constants, mock posts
// Imported by both /feeds and /feeds/[id]

export type PostType = 'event' | 'announcement' | 'celebration' | 'tip' | 'update' | 'poll' | 'rsvp';
export type SemanticReaction = 'heart' | 'in' | 'excited' | 'proud' | 'wow' | 'insight';
export type CommentReactionKey = 'love' | 'haha' | 'wow' | 'clap' | 'fire';
export type RsvpAnswers = Record<string, string[]>;

export const REACTIONS: Record<SemanticReaction, { label: string; color: string; glow: string }> = {
  heart:    { label: 'Love this',   color: '#FF5C87', glow: 'rgba(255,92,135,0.55)'  },
  in:       { label: "I'm in",      color: '#9D82FF', glow: 'rgba(157,130,255,0.55)' },
  excited:  { label: 'Lit',         color: '#FF8C55', glow: 'rgba(255,140,85,0.55)'  },
  proud:    { label: 'Proud',       color: '#FFD07A', glow: 'rgba(255,208,122,0.55)' },
  wow:      { label: 'Amazing',     color: '#5DCFFF', glow: 'rgba(93,207,255,0.55)'  },
  insight:  { label: 'Insightful',  color: '#FFD860', glow: 'rgba(255,216,96,0.55)'  },
};

export const TYPE_META: Record<PostType, { label: string; icon: string; accent: string; tint: string }> = {
  event:        { label: 'EVENT',        icon: '📅', accent: '#9D82FF', tint: 'rgba(124,92,255,0.18)' },
  rsvp:         { label: 'RSVP',         icon: '✅', accent: '#5DCFFF', tint: 'rgba(93,207,255,0.14)' },
  announcement: { label: 'ANNOUNCEMENT', icon: '📣', accent: '#AEAEB2', tint: 'rgba(255,255,255,0.08)' },
  celebration:  { label: 'CELEBRATION',  icon: '🎉', accent: '#FF9070', tint: 'rgba(255,120,80,0.18)' },
  tip:          { label: 'WELLNESS',     icon: '✨', accent: '#6DD8FF', tint: 'rgba(92,203,255,0.16)' },
  update:       { label: 'UPDATE',       icon: '📋', accent: '#C39FFF', tint: 'rgba(165,124,255,0.18)' },
  poll:         { label: 'POLL',         icon: '🗳️', accent: '#4CD97B', tint: 'rgba(52,199,89,0.16)' },
};

export const COMMENT_REACTIONS: Record<CommentReactionKey, { label: string; color: string; glow: string }> = {
  love:  { label: 'Love',  color: '#FF5C87', glow: 'rgba(255,92,135,0.5)'  },
  haha:  { label: 'Haha',  color: '#FFD07A', glow: 'rgba(255,208,122,0.5)' },
  wow:   { label: 'Wow',   color: '#5DCFFF', glow: 'rgba(93,207,255,0.5)'  },
  clap:  { label: 'Clap',  color: '#C39FFF', glow: 'rgba(195,159,255,0.5)' },
  fire:  { label: 'Fire',  color: '#FF8C55', glow: 'rgba(255,140,85,0.5)'  },
};

export const COMMENT_REACTION_KEYS: CommentReactionKey[] = ['love', 'haha', 'wow', 'clap', 'fire'];

export type RsvpOption = { id: string; label: string; icon?: string };
export type RsvpSection = {
  id: string;
  question: string;
  hint?: string;
  multi?: boolean;
  required?: boolean;
  options: RsvpOption[];
};

export type PollOption = { id: string; label: string; votes: number };

export type MediaItem =
  | { type: 'image'; url: string }
  | { type: 'video'; poster: string; duration: string; videoUrl: string };

export type Comment = {
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

export type Post = {
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

export const MOCK_POSTS: Post[] = [
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
      { type: 'video', poster: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=900&q=80&fit=crop', duration: '0:42', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
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
        id: 'rs1', question: 'Will you be attending?', required: true, multi: false,
        options: [
          { id: 'rs1-a', label: 'Yes, attending in-person', icon: '🏃' },
          { id: 'rs1-b', label: 'Yes, joining virtually',   icon: '💻' },
          { id: 'rs1-c', label: 'Not this time',            icon: '😔' },
        ],
      },
      {
        id: 'rs2', question: 'Which sessions are you interested in?', hint: 'Select all that apply', required: true, multi: true,
        options: [
          { id: 'rs2-a', label: 'Morning 5K Fun Run',         icon: '🏅' },
          { id: 'rs2-b', label: 'Nutrition Masterclass',      icon: '🥗' },
          { id: 'rs2-c', label: 'Mental Health & Resilience', icon: '🧘' },
          { id: 'rs2-d', label: 'Team HIIT Circuit',          icon: '⚡' },
          { id: 'rs2-e', label: 'Sleep Science Talk',         icon: '😴' },
        ],
      },
      {
        id: 'rs3', question: 'T-shirt size', required: true, multi: false,
        options: [
          { id: 'rs3-xs', label: 'XS' }, { id: 'rs3-s', label: 'S' },
          { id: 'rs3-m',  label: 'M'  }, { id: 'rs3-l', label: 'L' },
          { id: 'rs3-xl', label: 'XL' }, { id: 'rs3-xxl', label: 'XXL' },
        ],
      },
      {
        id: 'rs4', question: 'Dietary preference', hint: 'For catering — choose one', required: false, multi: false,
        options: [
          { id: 'rs4-a', label: 'No restriction', icon: '🍽️' },
          { id: 'rs4-b', label: 'Vegetarian',     icon: '🥦' },
          { id: 'rs4-c', label: 'Vegan',          icon: '🌱' },
          { id: 'rs4-d', label: 'Gluten-free',    icon: '🌾' },
          { id: 'rs4-e', label: 'Dairy-free',     icon: '🥛' },
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
