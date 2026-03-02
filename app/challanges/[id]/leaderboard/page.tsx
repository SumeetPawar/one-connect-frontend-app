// app/challanges/[id]/leaderboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Flame } from 'lucide-react';
import { api } from '@/lib/api';
import { span } from 'framer-motion/m';

interface LeaderboardUser {
    rank: number;
    user_id: string;
    name: string;
    initials: string;
    total_steps: number;
    streak: number;
    days_met_goal: number;       // NEW
    days_logged: number;          // NEW
    completion_pct: number;       // NEW
    is_me: boolean;
    is_top: boolean;
    consistency_rank?: number; // Calculated in frontend for consistency tab
    previous_consistency_rank?: number; // Previous value for badge logic
        previous_rank?: number; // Previous steps rank for badge logic
}

interface LeaderboardResponse {
    challenge_id: string;
    challenge_title: string;
    challenge_goal: number;
    start_date: string;
    end_date: string;
    days_left: number;
    total_participants: number;
    completion_pct: number;
    total_challenge_days: number;  // NEW
    my_rank: number | null;
    my_total_steps: number;
    my_streak: number;
    my_longest_streak: number; // NEW
    my_daily_avg: number;
    my_badge: string | null;
    my_days_met_goal: number;     // NEW
    my_completion_pct: number;    // NEW
    leaderboard: LeaderboardUser[];
}

type LeaderboardType = 'steps' | 'consistency';

export default function LeaderboardPage() {
    const params = useParams();
    const router = useRouter();
    const challengeId = params.id as string;

    const [activeTab, setActiveTab] = useState<LeaderboardType>('consistency');
    const [data, setData] = useState<LeaderboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [tabSwitching, setTabSwitching] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        fetchLeaderboard();

        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [challengeId]);

    const fetchLeaderboard = async () => {
        try {
            const response = await api<LeaderboardResponse>(
                `/api/challenges/${challengeId}/leaderboard`,
                {
                    method: "GET",
                    auth: true,
                }
            );
            setData(response);
        } catch (error) {
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const switchTab = (tab: LeaderboardType) => {
        if (tab === activeTab) return;

        setTabSwitching(true);
        setTimeout(() => {
            setActiveTab(tab);
            setTimeout(() => setTabSwitching(false), 100);
        }, 200);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getRankTier = (rank: number | null) => {
        if (!rank) return { label: 'Competitor', color: 'from-gray-500 to-gray-600', emoji: '💪' };
        if (rank <= 3) return { label: 'Elite', color: 'from-purple-500 to-purple-600', emoji: '💎' };
        if (rank <= 10) return { label: 'Pro', color: 'from-blue-500 to-cyan-500', emoji: '⭐' };
        if (rank <= 25) return { label: 'Rising', color: 'from-green-500 to-emerald-600', emoji: '🔥' };
        return { label: 'Competitor', color: 'from-gray-500 to-gray-600', emoji: '💪' };
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString();
    };

    const getProgressPercentage = () => {
        if (!data) return 0;
        return Math.min(data.completion_pct, 100);
    };

    const getMilestones = () => {
        if (!data) return [];
        const goal = data.challenge_goal;
        return [
            { value: goal * 0.25, label: `${(goal * 0.25 / 1000).toFixed(0)}K`, completed: data.my_total_steps >= goal * 0.25 },
            { value: goal * 0.5, label: `${(goal * 0.5 / 1000).toFixed(0)}K`, completed: data.my_total_steps >= goal * 0.5 },
            { value: data.my_total_steps, label: `${(data.my_total_steps / 1000).toFixed(0)}K`, isCurrent: true },
            { value: goal * 0.75, label: `${(goal * 0.75 / 1000).toFixed(0)}K`, completed: data.my_total_steps >= goal * 0.75 },
            { value: goal, label: `${(goal / 1000).toFixed(0)}K`, completed: data.my_total_steps >= goal },
        ];
    };

    // Sort leaderboard based on active tab
    const getSortedLeaderboard = () => {
        if (!data) return [];

        if (activeTab === 'consistency') {
            // Use consistency_rank from backend, remap rank field for display
            return [...data.leaderboard]
                .filter(u => u.consistency_rank !== undefined)
                .sort((a, b) => (a.consistency_rank! - b.consistency_rank!))
                .map(u => ({ ...u, rank: u.consistency_rank! }));
        } else {
            // Sort by steps (descending)
            const sorted = [...data.leaderboard].sort((a, b) => b.total_steps - a.total_steps);
            // Re-assign ranks based on current sort
            return sorted.map((user, index) => ({
                ...user,
                rank: index + 1
            }));
        }
    };

    const getMyRankInTab = () => {
        if (!data) return null;
        const sorted = getSortedLeaderboard();
        const myEntry = sorted.find(u => u.is_me);
        return myEntry ? myEntry.rank : null;
    };

    if (loading || tabSwitching) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white pb-6">
                <div className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800">
                    <div className="px-5 py-4 flex items-center gap-4">
                        <div className="w-9 h-9 bg-zinc-800 rounded-lg animate-pulse"></div>
                        <div className="h-6 bg-zinc-800 rounded w-32 animate-pulse"></div>
                    </div>
                </div>

                <div className="px-5 mb-6 pt-4">
                    <div className="bg-zinc-900 rounded-xl p-1 flex gap-1">
                        <div className="flex-1 h-12 bg-zinc-800 rounded-lg animate-pulse"></div>
                        <div className="flex-1 h-12 bg-zinc-800 rounded-lg animate-pulse"></div>
                    </div>
                </div>

                <div className="px-5 space-y-4">
                    <div className="h-64 bg-zinc-800 rounded-2xl animate-pulse"></div>
                    <div className="h-4 bg-zinc-800 rounded w-24 animate-pulse"></div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-20 bg-zinc-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <p className="text-gray-400">Failed to load leaderboard</p>
            </div>
        );
    }

    const sortedLeaderboard = getSortedLeaderboard();
    const topThree = sortedLeaderboard.slice(0, 3);
    const restOfLeaders = sortedLeaderboard.slice(3);
    const myRankInCurrentTab = getMyRankInTab();
    const tier = getRankTier(myRankInCurrentTab);

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-6">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800">
                <div className="px-5 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-white">Rankings</h1>
                </div>
            </div>

            {/* Rankings Title */}
            <div className="px-5 mt-5">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    {'Top Performers'}
                </h2>
            </div>

            {/* Tab Switcher */}
            <div className="px-5 mb-6 pt-2">
                <div className="bg-zinc-900 rounded-xl p-1 flex gap-1">
                    <button
                        onClick={() => switchTab('consistency')}
                        className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'consistency'
                            ? 'bg-purple-600 text-white font-semibold'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <Flame className="w-4 h-4" />
                        <span className="text-sm">Consistent</span>
                    </button>
                    <button
                        onClick={() => switchTab('steps')}
                        className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'steps'
                            ? 'bg-purple-600 text-white font-semibold'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">Steps</span>
                    </button>
                </div>
            </div>

            {/* Top 3 */}
            <div className="px-5 mb-3" style={{ marginBottom: '32px' }}>
                <div className="space-y-2">
                    <AnimatePresence mode="wait">
                        {topThree.map((user, index) => (
                            <motion.div
                                key={`${activeTab}-${user.user_id}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.1 }}
                                className={`border rounded-xl p-3 ${index === 0
                                    ? 'bg-gradient-to-r from-yellow-500/20 via-yellow-600/10 to-yellow-500/20 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                                    : index === 1
                                        ? 'bg-zinc-800/50 border-zinc-600/50'
                                        : 'bg-zinc-900/50 border-amber-700/50'
                                    } ${user.is_me ? 'ring-2 ring-purple-500' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 text-center px-3 py-1 rounded-lg ${index === 0 ? 'bg-yellow-400/20' : index === 1 ? 'bg-zinc-600/20' : 'bg-amber-600/20'
                                        }`}>
                                        <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-zinc-400' : 'text-amber-600'
                                            }`}>
                                            {user.rank}
                                        </span>
                                    </div>

                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base ${index === 0 ? 'ring-2 ring-yellow-400' : index === 1 ? 'ring-2 ring-zinc-400' : 'ring-2 ring-amber-600'
                                        } bg-purple-600`}>
                                        {user.initials}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`font-bold text-base truncate ${index === 0 ? 'text-yellow-100' : 'text-white'
                                                }`}>
                                                {user.name}
                                            </p>
                                            {index === 0 && <span className="text-xs">👑</span>}
                                            {user.is_me && (
                                                <span className="text-[9px] font-bold bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded uppercase">Me</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                            {activeTab === 'steps' ? (
                                                <span className={index === 0 ? 'text-yellow-200' : ''}>
                                                    {formatNumber(user.total_steps)} steps
                                                </span>
                                            ) : (
                                                <>
                                                    <span className={index === 0 ? 'text-yellow-200' : ''}>
                                                        {user.completion_pct}%
                                                    </span>
                                                    <span className="text-gray-700">•</span>
                                                    <span>{user.days_met_goal} / {data.total_challenge_days} days</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {/* Badge logic for steps and consistency tabs - extreme right */}
                                    {activeTab === 'steps' ? (
                                        user.previous_rank !== undefined ? (
                                            user.previous_rank !== user.rank ? (
                                                (() => {
                                                    const diff = user.previous_rank - user.rank;
                                                    const improved = diff > 0;
                                                    const worsened = diff < 0;
                                                    return (
                                                        <div className={`px-2 py-1 rounded-md border ml-2 flex items-center gap-1
                                                            ${improved ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'}`}
                                                        >
                                                            <span className={`text-xs font-bold ${improved ? 'text-green-400' : 'text-red-400'}`}>{improved ? '▲' : '▼'}</span>
                                                            <span className={`text-xs font-bold ${improved ? 'text-green-400' : 'text-red-400'}`}>{Math.abs(diff)}</span>
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <span className="text-xs text-gray-400 ml-2">↔</span>
                                            )
                                        ) : null
                                    ) : (
                                        user.previous_consistency_rank !== undefined && user.consistency_rank !== undefined ? (
                                            user.previous_consistency_rank !== user.consistency_rank ? (
                                                (() => {
                                                    const diff = user.previous_consistency_rank - user.consistency_rank;
                                                    const improved = diff > 0;
                                                    const worsened = diff < 0;
                                                    return (
                                                        <div className={`px-2 py-1 rounded-md border ml-2 flex items-center gap-1
                                                            ${improved ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'}`}
                                                        >
                                                            <span className={`text-xs font-bold 
                                                                ${improved ? 'text-green-400' : 'text-red-400'}`}
                                                            >
                                                                {improved ? '▲' : '▼'}
                                                            </span>
                                                            <span className={`text-xs font-bold ${improved ? 'text-green-400' : 'text-red-400'}`}>
                                                                {Math.abs(diff)}
                                                            </span>
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <span className="text-xs text-gray-400 ml-2">↔</span>
                                            )
                                        ) : null
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Rest of Rankings */}
            <div className="px-5">
                <div className="space-y-1.5">
                    <AnimatePresence mode="wait">
                        {restOfLeaders.map((user, index) => (
                            <motion.div
                                key={`${activeTab}-${user.user_id}-${index}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ delay: index * 0.03 }}
                                className={`border rounded-xl p-3.5 ${user.is_me
                                    ? 'bg-purple-600/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                                    : 'bg-zinc-900 border-zinc-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user.is_me ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-zinc-800 border border-zinc-700'
                                        }`}>
                                        <span className={`text-sm font-bold ${user.is_me ? 'text-purple-300' : 'text-gray-400'
                                            }`}>
                                            {user.rank}
                                        </span>
                                    </div>

                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm bg-purple-600 ${user.is_me ? 'ring-2 ring-purple-400' : ''
                                        }`}>
                                        {user.initials}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className={`font-semibold text-sm truncate ${user.is_me ? 'text-purple-200' : 'text-white'
                                                }`}>
                                                {user.name}
                                            </p>
                                            {user.is_me && (
                                                <span className="text-[9px] font-bold bg-purple-500/30 text-purple-200 px-1.5 py-0.5 rounded uppercase">Me</span>
                                            )}
                                        </div>

                                        <div className="flex items-baseline gap-2">
                                            {activeTab === 'steps' ? (
                                                <>
                                                    <span className={`text-base font-bold ${user.is_me ? 'text-purple-100' : 'text-white'
                                                        }`}>
                                                        {formatNumber(user.total_steps)}
                                                    </span>
                                                    <span className="text-xs text-gray-500 ml-1">steps</span>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-base font-bold ${user.is_me ? 'text-purple-100' : 'text-white'
                                                        }`}>
                                                        {user.completion_pct}%
                                                    </span>
                                                    <span className="text-gray-600">•</span>
                                                    <span className="text-xs text-gray-500">
                                                        {user.days_met_goal} days
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress bar for consistency tab removed as requested */}

                                    {/* Badge logic for steps and consistency tabs */}
                                    {activeTab === 'steps' ? (
                                        user.previous_rank !== undefined ? (
                                            user.previous_rank !== user.rank ? (
                                                (() => {
                                                    const diff = user.previous_rank - user.rank;
                                                    const improved = diff > 0;
                                                    const worsened = diff < 0;
                                                    return (
                                                        <div className={`px-2 py-1 rounded-md border ml-2 flex items-center gap-1
                                                            ${improved ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'}`}
                                                        >
                                                            <span className={`text-xs font-bold 
                                                                ${improved ? 'text-green-400' : 'text-red-400'}`}
                                                            >
                                                                {improved ? '▲' : '▼'}
                                                            </span>
                                                            <span className={`text-xs font-bold ${improved ? 'text-green-400' : 'text-red-400'}`}>
                                                                {Math.abs(diff)}
                                                            </span>
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <span className="text-xs text-gray-400 ml-2">↔</span>
                                            )
                                        ) : null
                                    ) : (
                                        user.previous_consistency_rank !== undefined && user.consistency_rank !== undefined ? (
                                            user.previous_consistency_rank !== user.consistency_rank ? (
                                                (() => {
                                                    const diff = user.previous_consistency_rank - user.consistency_rank;
                                                    const improved = diff > 0;
                                                    const worsened = diff < 0;
                                                    return (
                                                        <div className={`px-2 py-1 rounded-md border ml-2 flex items-center gap-1
                                                            ${improved ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'}`}
                                                        >
                                                            <span className={`text-xs font-bold 
                                                                ${improved ? 'text-green-400' : 'text-red-400'}`}
                                                            >
                                                                {improved ? '▲' : '▼'}
                                                            </span>
                                                            <span className={`text-xs font-bold ${improved ? 'text-green-400' : 'text-red-400'}`}>
                                                                {Math.abs(diff)}
                                                            </span>
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <span className="text-xs text-gray-400 ml-2">↔</span>
                                            )
                                        ) : null
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Scroll to Top */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={scrollToTop}
                        className="fixed bottom-6 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg z-50"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}