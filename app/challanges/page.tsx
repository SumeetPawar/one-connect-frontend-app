"use client";

import { useEffect, useState } from "react";
import Header from "../commponents/Header";
import { BottomNav } from "../components/BottomNav";
import { api, isApiError, getCachedUserMe } from "@/lib/api";
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useRouter } from "next/navigation";

export default function Dashboard() {
    // Use same user/admin detection logic as Header
    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
        getCachedUserMe()
            .then(userData => { setIsAdmin((userData as any).role === "admin"); })
            .catch(() => { setIsAdmin(false); });
    }, []);
    type ApiChallenge = {
        id: string;
        title: string;
        start_date: string;
        end_date: string;
        status: "active" | "completed" | "draft" | "archived";
        period?: "week" | "month";
        scope?: "individual" | "team" | "department";
        participant_count: number;
        user_joined: boolean;
        user_daily_target?: number | null;
        days_remaining: number;
        description?: string;
    };

    // REPLACE the UserProfile type with this:
    type UserProfile = {
        id: string;
        email: string;
        name: string;
    };

    // Centralized login/API check
    useAuthRedirect({ apiCheck: true });

    const [challenges, setChallenges] = useState<ApiChallenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedChallenge, setSelectedChallenge] = useState<ApiChallenge | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState<number>(5000);
    const [showTargetSelector, setShowTargetSelector] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [joinedChallengeName, setJoinedChallengeName] = useState<string>("");
    const [navigating, setNavigating] = useState(false);

    const router = useRouter();


    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                // Artificial delay to show loader
                await new Promise((resolve) => setTimeout(resolve, 1500));

                const data = await api<ApiChallenge[]>("/api/challenges/available", {
                    method: "GET",
                });

                // Sort by start date descending (latest first)
                const sorted = [...data].sort((a, b) => {
                    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
                });

                setChallenges(sorted);
            } catch (e: any) {
                setError(e.message || "Could not load challenges");
                console.error('Challenge loading error:', e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    useEffect(() => {
        if (selectedChallenge && !selectedChallenge.user_joined) {
            setSelectedTarget(5000); // Reset to default when opening modal
        }
    }, [selectedChallenge]);

    const handleJoinChallenge = async (challengeId: string, dailyTarget: number) => {
        try {
            setIsJoining(true);
            setError(null);

            const res = await api(`/api/challenges/${challengeId}/join`, {
                method: 'POST',
                body: JSON.stringify({
                    selected_daily_target: dailyTarget,
                }),
            });

            // Success
            setJoinedChallengeName(selectedChallenge?.title || "Challenge");
            setSelectedChallenge(null);
            setShowSuccessModal(true);

            // Redirect to steps page after delay
            setTimeout(() => {
                router.push(`/challanges/${challengeId}/steps`);
            }, 2700);

        } catch (e: any) {
            if (isApiError(e) && e.status === 401) {
                return;
            }
            setError(`Failed to join: ${e.message || 'Unknown error'}`);
            setTimeout(() => setError(null), 5000);
            console.error('Join challenge error:', e);
        } finally {
            setIsJoining(false);
        }
    };

    // Loading state — skeleton
    if (loading) {
        const SkeletonBlock = ({ w = '100%', h = '14px', radius = '8px', mb = '0px' }: { w?: string; h?: string; radius?: string; mb?: string }) => (
            <div style={{
                width: w, height: h, borderRadius: radius, marginBottom: mb,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.05) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s infinite',
            }} />
        );
        return (
            <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#0f172a' }}>
                <style>{`
                    @keyframes shimmer {
                        0%   { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                    }
                `}</style>

                {/* Skeleton Header */}
                <div style={{
                    padding: '20px 20px 18px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <SkeletonBlock w="80px" h="22px" radius="8px" />
                    <SkeletonBlock w="36px" h="36px" radius="50%" />
                </div>

                {/* Skeleton Content */}
                <div style={{
                    background: 'linear-gradient(180deg, rgba(124,58,237,0.08) 0%, rgba(15,23,42,1) 100%)',
                    padding: '24px 20px 28px',
                }}>
                    {/* Two challenge card skeletons */}
                    {[1, 2].map(i => (
                        <div key={i} style={{
                            borderRadius: '18px',
                            padding: '28px 22px',
                            marginBottom: '12px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.07)',
                        }}>
                            {/* Badge */}
                            <SkeletonBlock w="80px" h="22px" radius="11px" mb="16px" />
                            {/* Title */}
                            <SkeletonBlock w="70%" h="24px" radius="8px" mb="10px" />
                            {/* Description */}
                            <SkeletonBlock w="90%" h="14px" radius="6px" mb="6px" />
                            <SkeletonBlock w="60%" h="14px" radius="6px" mb="20px" />
                            {/* Join pill */}
                            <SkeletonBlock w="90px" h="30px" radius="12px" />
                        </div>
                    ))}

                    {/* Quick Actions skeleton */}
                    <div style={{ marginTop: '24px' }}>
                        <SkeletonBlock w="110px" h="16px" radius="6px" mb="14px" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} style={{
                                    borderRadius: '16px',
                                    padding: '18px 16px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    display: 'flex', alignItems: 'center', gap: '12px', minHeight: '68px'
                                }}>
                                    <SkeletonBlock w="38px" h="38px" radius="10px" />
                                    <div style={{ flex: 1 }}>
                                        <SkeletonBlock w="70%" h="13px" radius="5px" mb="8px" />
                                        <SkeletonBlock w="50%" h="11px" radius="5px" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state (show Retry button only on error, not during loading)
    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                width: '100%',
                backgroundColor: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
            }}>
                <div style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    textAlign: 'center',
                    marginBottom: '18px'
                }}>
                    <div style={{ color: '#f87171', fontWeight: 600, marginBottom: 8 }}>Error</div>
                    <div>{error}</div>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '10px 20px',
                        background: '#7c3aed',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    // Find the challenge with the latest start date
    let latestIdx = -1;
    let latestDate = 0;
    challenges.forEach((ch, idx) => {
        const start = new Date(ch.start_date).getTime();
        if (start > latestDate) {
            latestDate = start;
            latestIdx = idx;
        }
    });

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            backgroundColor: '#0f172a',
            padding: '0',
            paddingBottom: '90px'
        }}>

            {/* USE HEADER COMPONENT */}
            <Header
                title="GES"
                showAnimatedWord={true}
            />

            {/* Content Section */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.12) 0%, rgba(15, 23, 42, 1) 100%)',
                padding: '24px 20px 28px 20px'
            }}>

                {/* DYNAMIC CHALLENGES FROM API */}
                {challenges.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: 'rgba(255, 255, 255, 0.6)'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                            No Active Challenges
                        </div>
                        <div style={{ fontSize: '14px' }}>
                            Check back soon for new challenges!
                        </div>
                    </div>
                ) : (
                    challenges.filter(ch => {
                        const end = new Date(ch.end_date).getTime();
                        const now = Date.now();
                        const daysPast = end < now ? (now - end) / (1000 * 60 * 60 * 24) : 0;
                        return daysPast < 4; // show active + ended within last 4 days
                    }).map((ch, idx) => {
                        const isFeatured = idx === 0;
                        const bgGradient = idx % 2 === 0
                            ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
                            : "linear-gradient(135deg, rgba(59, 130, 246, 0.85) 0%, rgba(37, 99, 235, 0.85) 100%)";

                        const endTime = new Date(ch.end_date).getTime();
                        const now = Date.now();
                        const isExpired = endTime < now;
                        const daysPastEnd = isExpired ? (now - endTime) / (1000 * 60 * 60 * 24) : 0;
                        const isEnded = daysPastEnd >= 4;
                        const isJoined = ch.user_joined;
                        return (
                            <div
                                key={ch.id}
                                onClick={() => {
                                    if (isEnded) {
                                        router.push(`/challanges/${ch.id}/leaderboard`);
                                    } else if (isExpired || ch.status === "completed" || isJoined) {
                                        router.push(`/challanges/${ch.id}/steps`);
                                    } else {
                                        setSelectedChallenge(ch);
                                    }
                                }}
                                style={{
                                    borderRadius: "18px",
                                    padding: "36px 28px",
                                    marginBottom: "12px",
                                    width: "100%",
                                    boxSizing: "border-box",
                                    position: "relative",
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    background: bgGradient,
                                    // opacity: isEnded ? 0.45 : 1,
                                    opacity: 1,
                                    transition: "opacity 0.2s ease",
                                    filter: isEnded ? "grayscale(0.35)" : "none",
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '-50px',
                                    right: '-50px',
                                    fontSize: '120px',
                                    opacity: '0.12'
                                }}>
                                    💪
                                </div>

                                {isFeatured && (
                                    <div style={{
                                        display: "inline-block",
                                        background: "rgba(255,255,255,0.18)",
                                        padding: "5px 13px",
                                        borderRadius: "12px",
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color: "#fff",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                        marginBottom: "14px"
                                    }}>
                                        🔥 Featured
                                    </div>
                                )}

                                <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                                    {ch.title}
                                </h2>
                                {ch.description && (
                                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "8px", fontWeight: 500 }}>
                                        {ch.description}
                                    </div>
                                )}

                                {/* <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '12px',
                                    fontSize: '12px',
                                    color: 'rgba(255,255,255,0.75)',
                                    marginBottom: '12px'
                                }}>
                                    <span>🔥 {ch.participant_count} active</span>
                                    <span>⏱️ {ch.days_remaining} days left</span>
                                </div> */}

                                {ch.user_daily_target && (
                                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "12px" }}>
                                        <strong>Your daily target:</strong> {ch.user_daily_target} steps
                                    </div>
                                )}

                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                                    {isEnded ? (
                                        <div style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 6,
                                            background: "rgba(255,255,255,0.12)",
                                            padding: "5px 13px",
                                            borderRadius: "12px",
                                            border: "1px solid rgba(255,255,255,0.20)"
                                        }}>
                                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>✓</span>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>Completed</span>
                                        </div>
                                    ) : ch.user_joined ? (
                                        <div style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 6,
                                            background: "rgba(16,185,129,0.22)",
                                            padding: "5px 13px",
                                            borderRadius: "12px",
                                            border: "1px solid rgba(16,185,129,0.35)"
                                        }}>
                                            <span style={{ fontSize: 10, color: "rgba(16,185,129,1)", fontWeight: 700 }}>✓</span>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>Joined</span>
                                        </div>
                                    ) : (
                                        (() => {
                                            const nowD = new Date();
                                            const start = new Date(ch.start_date);
                                            const end = new Date(ch.end_date);
                                            return nowD >= start && nowD <= end;
                                        })() && (
                                            <div style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 6,
                                                background: "rgba(255,255,255,0.15)",
                                                padding: "5px 13px",
                                                borderRadius: "12px",
                                                border: "1px solid rgba(255,255,255,0.25)"
                                            }}>
                                                <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>Join Now</span>
                                            </div>
                                        )
                                    )}
                                    {isEnded && (
                                        <div style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 5,
                                            background: "rgba(255,255,255,0.08)",
                                            padding: "5px 11px",
                                            borderRadius: "12px",
                                            border: "1px solid rgba(255,255,255,0.14)"
                                        }}>
                                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                                <path d="M2 6l2.5 2.5L10 3.5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M6 1v1M6 10v1M1 6H2M10 6h1" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeLinecap="round"/>
                                            </svg>
                                            <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.55)", letterSpacing: "-0.01em" }}>View Results</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}

                {/* STATIC COMING SOON CARD */}
                {/* <div
                    style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '18px',
                        padding: '28px 22px',
                        marginBottom: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        opacity: '0.55',
                        cursor: 'default',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        fontSize: '120px',
                        opacity: '0.06'
                    }}>
                        🎯
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                            display: 'inline-block',
                            background: 'rgba(255, 255, 255, 0.08)',
                            padding: '5px 13px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: '600',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '14px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Coming Soon
                        </div>

                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: 'rgba(255, 255, 255, 0.75)',
                            marginBottom: '8px',
                            letterSpacing: '-0.02em',
                            lineHeight: '1.2'
                        }}>
                            Team Challenges
                        </h2>

                        <p style={{
                            fontSize: '13px',
                            color: 'rgba(255, 255, 255, 0.55)',
                            marginBottom: '0',
                            lineHeight: '1.5'
                        }}>
                            Compete together, motivate each other, and unlock achievements as a team!<br />
                            <span role="img" aria-label="surprise">🎁</span> A little surprise awaits teams who finish strong!
                        </p>
                    </div>
                </div> */}

            </div>

            {/* Quick Actions */}
            <div style={{ padding: '0 20px 28px 20px' }}>
                <h3 style={{
                    fontWeight: '600',
                    color: 'rgba(255,255,255,0.5)',
                    marginBottom: '10px',
                    letterSpacing: '0.04em',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                }}>
                    Quick Actions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                    {/* Log Steps */}
                    {challenges.some(ch => ch.user_joined) ? (
                        <div
                            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.opacity = '0.8'; }}
                            onMouseUp={e => { if (!navigating) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; } }}
                            onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.opacity = '0.8'; }}
                            onTouchEnd={e => { if (!navigating) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; } }}
                            onClick={() => {
                                if (navigating) return;
                                const joinedChallenge = challenges.find(ch => ch.user_joined);
                                if (joinedChallenge) { setNavigating(true); router.push(`/challanges/${joinedChallenge.id}/steps`); }
                            }}
                            onMouseEnter={e => { if (!navigating) e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
                            onMouseLeave={e => { if (!navigating) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; } }}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '16px',
                                padding: '16px 18px',
                                cursor: navigating ? 'default' : 'pointer',
                                border: '1px solid rgba(255,255,255,0.08)',
                                transition: 'transform 0.1s ease, opacity 0.1s ease, background 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                            }}
                        >
                            <style>{`@keyframes qa-spin { to { transform: rotate(360deg); } }`}</style>
                            <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(168,85,247,0.18) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {navigating ? (
                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(168,85,247,0.25)', borderTopColor: 'rgba(168,85,247,0.9)', animation: 'qa-spin 0.7s linear infinite' }} />
                                ) : (
                                    <span style={{ fontSize: '18px', fontWeight: '600', color: 'rgba(168,85,247,0.9)' }}>S</span>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>Log Steps</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>{navigating ? 'Opening...' : 'Track your activity'}</div>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                    ) : (
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px 18px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '14px', opacity: 0.5, cursor: 'not-allowed' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(168,85,247,0.18) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: '18px', fontWeight: '600', color: 'rgba(168,85,247,0.5)' }}>S</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>Log Steps</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>Join a challenge first</div>
                            </div>
                        </div>
                    )}

                    {/* Body Stats */}
                    <div
                        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.opacity = '0.8'; }}
                        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                        onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.opacity = '0.8'; }}
                        onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                        onClick={() => router.push('/bgmi')}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.06)'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                        style={{
                            background: 'rgba(6,182,212,0.06)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '16px',
                            padding: '16px 18px',
                            cursor: 'pointer',
                            border: '1px solid rgba(6,182,212,0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            position: 'relative',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            transition: 'transform 0.1s ease, opacity 0.1s ease, background 0.2s',
                        }}
                    >
                        {/* <div style={{ position: 'absolute', top: '8px', right: '12px', background: 'rgba(6,182,212,0.18)', border: '1px solid rgba(6,182,212,0.35)', borderRadius: '6px', padding: '2px 6px', fontSize: '9px', fontWeight: '700', color: 'rgba(6,182,212,0.9)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>New</div> */}
                        <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(8,145,178,0.15) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '18px', fontWeight: '600', color: 'rgba(6,182,212,0.85)' }}>B</span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>Body Stats</div>
                            <div style={{ fontSize: '12px', color: 'rgba(6,182,212,0.7)' }}>View metrics</div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>

                    {/* Mindfulness */}
                    <div
                        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.opacity = '0.8'; }}
                        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                        onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.opacity = '0.8'; }}
                        onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                        onClick={() => router.push('/mindfullness')}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.13)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.07)'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                        style={{
                            background: 'rgba(16,185,129,0.07)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '16px',
                            padding: '16px 18px',
                            cursor: 'pointer',
                            border: '1px solid rgba(16,185,129,0.22)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            position: 'relative',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            transition: 'transform 0.1s ease, opacity 0.1s ease, background 0.2s',
                        }}
                    >
                        {/* <div style={{ position: 'absolute', top: '8px', right: '12px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', padding: '2px 6px', fontSize: '9px', fontWeight: '700', color: 'rgba(16,185,129,0.9)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>New</div> */}
                        <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.15) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '22px' }}>🧘</span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>Mindfulness</div>
                            <div style={{ fontSize: '12px', color: 'rgba(16,185,129,0.75)' }}>Calm & focus</div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>

                    {/* Track Habit */}
                    <div
                        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.opacity = '0.8'; }}
                        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                        onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.98)'; e.currentTarget.style.opacity = '0.8'; }}
                        onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                        onClick={() => router.push('/habits')}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.13)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.07)'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
                        style={{
                            background: 'rgba(16,185,129,0.07)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '16px',
                            padding: '16px 18px',
                            cursor: 'pointer',
                            border: '1px solid rgba(16,185,129,0.22)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            transition: 'transform 0.1s ease, opacity 0.1s ease, background 0.2s',
                        }}
                    >
                        <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.15) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '18px', fontWeight: '600', color: 'rgba(16,185,129,0.9)' }}>H</span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>Track Habit</div>
                            <div style={{ fontSize: '12px', color: 'rgba(16,185,129,0.75)' }}>Habits to help you grow</div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>

                </div>
            </div>

            {/* Bottom Sheet Modal - DYNAMIC DATA */}
            {selectedChallenge && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setSelectedChallenge(null)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.6)',
                            zIndex: 999,
                            animation: 'fadeIn 0.2s ease-out'
                        }}
                    />

                    {/* Bottom Sheet */}
                    <div
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                            borderTopLeftRadius: '24px',
                            borderTopRightRadius: '24px',
                            padding: '20px 20px 28px 20px',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.4)',
                            animation: 'slideUp 0.3s ease-out'
                        }}
                    >
                        {/* Handle Bar */}
                        <div style={{
                            width: '40px',
                            height: '4px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '2px',
                            margin: '0 auto 16px auto'
                        }} />

                        {/* Challenge Hero */}
                        <div style={{ marginBottom: '20px' }}>


                            <div style={{ position: 'relative', zIndex: 1 }}>
                                {selectedChallenge.user_joined && (
                                    <div style={{
                                        display: 'inline-block',
                                        background: 'rgba(16, 185, 129, 0.25)',
                                        padding: '5px 12px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        color: '#10b981',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '12px',
                                        border: '1px solid rgba(16, 185, 129, 0.4)'
                                    }}>
                                        ✓ Joined
                                    </div>
                                )}

                                {/* Title removed as requested */}

                                {/* Subtitle removed from modal */}
                            </div>
                        </div>

                        {/* Challenge Details */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '16px',
                            padding: '16px',
                            marginBottom: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {selectedChallenge.user_daily_target && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            background: 'rgba(124, 58, 237, 0.15)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '18px',
                                            flexShrink: 0
                                        }}>🎯</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: '13px',
                                                color: 'rgba(255, 255, 255, 0.6)',
                                                marginBottom: '2px'
                                            }}>Your Goal</div>
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                color: '#ffffff'
                                            }}>{selectedChallenge.user_daily_target} steps daily</div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        background: 'rgba(124, 58, 237, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        flexShrink: 0
                                    }}>📅</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '13px',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            marginBottom: '2px'
                                        }}>Duration</div>
                                        <div style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            color: '#ffffff'
                                        }}>
                                            {new Date(selectedChallenge.start_date).toLocaleDateString()} - {new Date(selectedChallenge.end_date).toLocaleDateString()} • {selectedChallenge.days_remaining} days left
                                        </div>
                                    </div>
                                </div>

                                {/* <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        background: 'rgba(124, 58, 237, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        flexShrink: 0
                                    }}>👥</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '13px',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            marginBottom: '4px'
                                        }}>Participants</div>
                                        <div style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            color: '#ffffff'
                                        }}>{selectedChallenge.participant_count} active</div>
                                    </div>
                                </div> */}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        background: 'rgba(124, 58, 237, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        flexShrink: 0
                                    }}>🏆</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '13px',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            marginBottom: '2px'
                                        }}>Rewards</div>
                                        <div style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            color: '#ffffff'
                                        }}>Badges & recognition</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Daily Target Selection - ADD THIS */}
                        {!selectedChallenge.user_joined && (
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '14px',
                                padding: '16px',
                                marginBottom: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#ffffff',
                                    marginBottom: '12px'
                                }}>
                                    Select Your Daily Target
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '6px',
                                    marginTop: '4px',
                                    justifyContent: 'center',
                                }}>
                                    {[
                                        // { value: 3000, label: '3,000', desc: 'Starter' },
                                        { value: 5000, label: '5,000', desc: 'Challenger' },
                                        { value: 8000, label: '8,000', desc: 'Achiever' },
                                        // { value: 10000, label: '10,000', desc: 'Champion' }
                                    ].map((target) => (
                                        <button
                                            key={target.value}
                                            onClick={() => setSelectedTarget(target.value)}
                                            style={{
                                                padding: '6px 0',
                                                minHeight: '36px',
                                                background: selectedTarget === target.value
                                                    ? 'linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)'
                                                    : '#f3f4f6',
                                                border: selectedTarget === target.value
                                                    ? '2px solid #a855f7'
                                                    : '1px solid #e2e8f0',
                                                borderRadius: '999px',
                                                color: selectedTarget === target.value ? '#fff' : '#7c3aed',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                fontFamily: 'inherit',
                                                fontWeight: 600,
                                                fontSize: '11px',
                                                boxShadow: selectedTarget === target.value ? '0 1px 4px rgba(124,58,237,0.10)' : 'none',
                                                outline: selectedTarget === target.value ? '2px solid #a855f7' : 'none',
                                            }}
                                            tabIndex={0}
                                            aria-label={`Select ${target.label} steps (${target.desc})`}
                                        >
                                            {/* Emoji removed */}
                                            <span style={{ fontWeight: '700', letterSpacing: '-0.01em' }}>{target.label}</span>
                                            <span style={{
                                                fontSize: '9px',
                                                color: selectedTarget === target.value ? '#fff' : '#a855f7',
                                                fontWeight: '500',
                                                opacity: 0.85,
                                                marginTop: '1px',
                                            }}>
                                                {target.desc}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {selectedChallenge.user_joined ? (
                                <button
                                    onClick={() => {
                                        setSelectedChallenge(null);
                                        router.push(`/challanges/${selectedChallenge.id}/steps`);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                                        border: 'none',
                                        borderRadius: '14px',
                                        color: '#ffffff',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        letterSpacing: '-0.01em',
                                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                                        WebkitTapHighlightColor: 'transparent'
                                    }}
                                >
                                    View Progress
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleJoinChallenge(selectedChallenge.id, selectedTarget)}
                                    disabled={isJoining}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: isJoining
                                            ? 'rgba(124, 58, 237, 0.5)'
                                            : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                                        border: 'none',
                                        borderRadius: '14px',
                                        color: '#ffffff',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: isJoining ? 'not-allowed' : 'pointer',
                                        letterSpacing: '-0.01em',
                                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                                        WebkitTapHighlightColor: 'transparent',
                                        opacity: isJoining ? 0.7 : 1
                                    }}
                                >
                                    {isJoining ? 'Joining...' : `Join with ${selectedTarget.toLocaleString()} steps/day`}
                                </button>
                            )}

                            <button
                                onClick={() => setSelectedChallenge(null)}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    background: 'transparent',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '14px',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    letterSpacing: '-0.01em',
                                    WebkitTapHighlightColor: 'transparent'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes slideUp {
                            from {
                                transform: translateY(100%);
                                opacity: 0;
                            }
                            to {
                                transform: translateY(0);
                                opacity: 1;
                            }
                        }
                    `}</style>
                </>
            )}

            {showSuccessModal && (
                <>
                    {/* Backdrop */}
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            zIndex: 1001,
                            animation: 'fadeIn 0.3s ease-out'
                        }}
                    />

                    {/* Success Card */}
                    <div
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1002,
                            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                            borderRadius: '24px',
                            padding: '40px 32px',
                            maxWidth: '340px',
                            width: '90%',
                            textAlign: 'center',
                            boxShadow: '0 20px 60px rgba(124, 58, 237, 0.4)',
                            animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                    >
                        {/* Success Icon */}
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            animation: 'bounce 0.6s ease-out'
                        }}>
                            <span style={{ fontSize: '40px' }}>🎉</span>
                        </div>

                        {/* Success Message */}
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#ffffff',
                            marginBottom: '12px',
                            letterSpacing: '-0.02em'
                        }}>
                            Challenge Accepted!
                        </h2>

                        <p style={{
                            fontSize: '15px',
                            color: 'rgba(255, 255, 255, 0.9)',
                            marginBottom: '8px',
                            lineHeight: '1.5'
                        }}>
                            You've joined <strong>{joinedChallengeName}</strong>
                        </p>

                        <p style={{
                            fontSize: '13px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '0'
                        }}>
                            Daily target: {selectedTarget.toLocaleString()} steps
                        </p>

                        {/* Progress Indicator */}
                        <div style={{
                            marginTop: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.6)',
                                animation: 'pulse 1.5s ease-in-out infinite'
                            }}></div>
                            <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.6)',
                                animation: 'pulse 1.5s ease-in-out infinite 0.2s'
                            }}></div>
                            <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.6)',
                                animation: 'pulse 1.5s ease-in-out infinite 0.4s'
                            }}></div>
                        </div>
                    </div>

                    <style>{`
            @keyframes scaleIn {
                from {
                    transform: translate(-50%, -50%) scale(0.8);
                    opacity: 0;
                }
                to {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
            }
            @keyframes bounce {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.1);
                }
            }
            @keyframes pulse {
                0%, 100% {
                    opacity: 0.4;
                    transform: scale(0.8);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.2);
                }
            }
        `}</style>
                </>
            )}

            <BottomNav active="steps" />
        </div>
    );
}
