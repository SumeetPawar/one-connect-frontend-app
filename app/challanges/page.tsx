
"use client";

import { env } from "process";
import { useEffect, useState } from "react";

export default function Dashboard() {

    type ApiChallenge = {
        id: string;
        title: string;
        start_date: string;   // "2026-02-01"
        end_date: string;     // "2026-02-28"
        status: "active" | "completed" | "draft" | "archived";
        period?: "week" | "month";
        scope?: "individual" | "team" | "department";
        participant_count: number;
        user_joined: boolean;
        user_daily_target?: number | null;
        days_remaining: number;
        description?: string; // optional description property
    };

    const [challenges, setChallenges] = useState<ApiChallenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentWord, setCurrentWord] = useState<string>('Fitness');
    const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
    const [selectedChallenge, setSelectedChallenge] = useState<ApiChallenge | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                const API_BASE =
                    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "https://social-webapi-b7ebhgakb6engxbh.eastus-01.azurewebsites.net";
                const url = API_BASE;
                const token = localStorage.getItem("access_token");
                const res = await fetch(
                    `${url}/api/challenges/available`,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                    }
                );

                if (res.status === 401) {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = "/login";
                    return;
                }

                if (!res.ok) throw new Error(await res.text());

                const data: ApiChallenge[] = await res.json();

                // ✅ ensure active first, then earliest start_date
                const sorted = [...data].sort((a, b) => {
                    if (a.status !== b.status) return a.status === "active" ? -1 : 1;
                    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
                });

                setChallenges(sorted);
            } catch (e: any) {
                setError("Could not load challenges");
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    // Animated word loop
    useEffect(() => {
        const words = ['Fitness', 'Connect', 'Social', 'Insights'];
        let index = 0;

        const interval = setInterval(() => {
            index = (index + 1) % words.length;
            setCurrentWord(words[index]);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Close user menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showUserMenu && !target.closest('.user-menu-container')) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu]);

    const handleLogout = () => {
        alert('Logging out...');
        // Add your logout logic here
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            backgroundColor: '#0f172a',
            padding: '0',
            paddingBottom: '24px'
        }}>

            {/* Sticky Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '16px 20px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{
                        fontSize: '26px',
                        fontWeight: '700',
                        color: '#ffffff',
                        marginBottom: '0',
                        letterSpacing: '-0.02em'
                    }}>
                        GES <span
                            key={currentWord}
                            style={{
                                background: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                animation: 'fadeIn 0.5s ease-in-out',
                                display: 'inline-block'
                            }}
                        >
                            {currentWord}
                        </span>
                    </h1>

                    {/* User Profile Circle */}
                    <div style={{ position: 'relative' }} className="user-menu-container">
                        <div
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                border: '2px solid rgba(255, 255, 255, 0.15)',
                                fontSize: '15px',
                                fontWeight: '600',
                                color: '#ffffff',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            JD
                        </div>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '50px',
                                    right: '0',
                                    background: 'rgba(30, 41, 59, 0.95)',
                                    backdropFilter: 'blur(12px)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    padding: '8px',
                                    minWidth: '180px',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                                    zIndex: 1000,
                                    animation: 'slideDown 0.2s ease-out'
                                }}
                            >
                                {/* User Info */}
                                <div style={{
                                    padding: '12px',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#ffffff',
                                        marginBottom: '2px'
                                    }}>
                                        John Doe
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: 'rgba(255, 255, 255, 0.6)'
                                    }}>
                                        john.doe@company.com
                                    </div>
                                </div>

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: '#ef4444',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                    <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(-8px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-8px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
                </div>
            </div>
            {/* End Sticky Header */}

            {/* Content Section */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(124, 58, 237, 0.12) 0%, rgba(15, 23, 42, 1) 100%)',
                padding: '24px 20px 28px 20px'
            }}>

                {challenges.map((ch, idx) => {
                    const isFeatured = idx === 0; // ✅ first challenge featured by default

                    return (
                        <div
                            key={ch.id}
                            onClick={() => setSelectedChallenge(ch)}
                            style={{
                                // keep your card styling,
                                // you can vary gradient by idx if you want
                                borderRadius: "18px",
                                padding: "28px 22px",
                                marginBottom: "12px",
                                position: "relative",
                                overflow: "hidden",
                                cursor: "pointer",
                                background:
                                    idx % 2 === 0
                                        ? "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
                                        : "linear-gradient(135deg, rgba(59, 130, 246, 0.85) 0%, rgba(37, 99, 235, 0.85) 100%)",
                            }}
                        >
                            {/* Featured badge only for first */}
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
                                    Featured
                                </div>
                            )}

                            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
                                {ch.title}
                            </h2>

                            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", marginBottom: "16px" }}>
                                {ch.period === "month" ? "Monthly challenge" : "Weekly challenge"} • {ch.scope ?? "team"}
                            </p>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
                                    <span>🔥 {ch.participant_count} active</span>
                                    <span>⏱️ {ch.days_remaining} days left</span>
                                </div>

                                {ch.user_joined ? (
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
                                    <div style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        background: "rgba(255,255,255,0.15)",
                                        padding: "5px 13px",
                                        borderRadius: "12px",
                                        border: "1px solid rgba(255,255,255,0.25)"
                                    }}>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>Join</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Featured Card - Hero */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                        borderRadius: '18px',
                        padding: '28px 22px',
                        marginBottom: '12px',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.15)'
                    }}
                    onClick={() => setSelectedChallenge({
                        id: '047db050-627a-47a9-9eac-adde7fe3a64b',
                        title: 'February Steps Challenge',
                        description: "Walk, compete with colleagues, and boost your health. Every step counts—let's make this month active and fun!",
                        period: 'month',
                        scope: 'department',
                        start_date: '2026-02-01',
                        end_date: '2026-02-28',
                        status: 'active',
                        participant_count: 0,
                        user_joined: false,
                        days_remaining: 26
                    })}
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

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{
                            display: 'inline-block',
                            background: 'rgba(255, 255, 255, 0.18)',
                            padding: '5px 13px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#ffffff',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '14px'
                        }}>
                            Featured
                        </div>

                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: '#ffffff',
                            marginBottom: '8px',
                            letterSpacing: '-0.02em',
                            lineHeight: '1.2'
                        }}>
                            February Steps Challenge
                        </h2>

                        <p style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)',
                            marginBottom: '16px',
                            lineHeight: '1.5'
                        }}>
                            Walk, compete with colleagues, and boost your health. Every step counts—let's make this month active and fun!
                        </p>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                fontSize: '12px',
                                color: 'rgba(255, 255, 255, 0.75)'
                            }}>
                                <span>🔥 0 active</span>
                                <span>⏱️ 26 days left</span>
                            </div>

                            {/* Not joined badge (default) */}
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: 'rgba(255,255,255,0.15)',
                                padding: '5px 13px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.25)'
                            }}>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#fff',
                                    letterSpacing: '0.3px'
                                }}>
                                    Join
                                </span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Active Challenge Card */}


                {/* Coming Soon Card - Faded */}
                <div
                    style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '18px',
                        padding: '28px 22px',
                        marginBottom: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        opacity: '0.55',
                        cursor: 'pointer',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                    onClick={() => console.log('Coming Soon clicked')}
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
                            Team Wellness Goals
                        </h2>

                        <p style={{
                            fontSize: '13px',
                            color: 'rgba(255, 255, 255, 0.55)',
                            marginBottom: '0',
                            lineHeight: '1.5'
                        }}>
                            Set and track collective wellness objectives
                        </p>
                    </div>
                </div>

                {/* Quick Actions - Apple/Samsung Style */}
                <div>
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '12px',
                        letterSpacing: '-0.02em'
                    }}>
                        Quick Actions
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '10px'
                    }}>
                        {/* Log Steps */}
                        <div
                            onClick={() => alert('Log Steps')}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '16px',
                                padding: '18px 16px',
                                cursor: 'pointer',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                minHeight: '68px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)';
                                e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '11px',
                                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.18) 0%, rgba(168, 85, 247, 0.18) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '21px',
                                flexShrink: 0,
                                fontWeight: '600',
                                color: 'rgba(168, 85, 247, 0.9)',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif'
                            }}>
                                S
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#ffffff',
                                    letterSpacing: '-0.01em',
                                    lineHeight: '1.2',
                                    marginBottom: '4px'
                                }}>
                                    Log Steps
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '400',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    lineHeight: '1.3'
                                }}>
                                    Track your daily activity
                                </div>
                            </div>
                        </div>

                        {/* Track Habit - Coming Soon */}
                        <div
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '16px',
                                padding: '18px 16px',
                                cursor: 'not-allowed',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                minHeight: '68px',
                                opacity: '0.5'
                            }}
                        >
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '11px',
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '21px',
                                flexShrink: 0,
                                fontWeight: '600',
                                color: 'rgba(16, 185, 129, 0.6)',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif'
                            }}>
                                H
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    letterSpacing: '-0.01em',
                                    lineHeight: '1.2',
                                    marginBottom: '4px'
                                }}>
                                    Track Habit
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    letterSpacing: '0.3px'
                                }}>
                                    Coming Soon
                                </div>
                            </div>
                        </div>

                        {/* Body Stats - Coming Soon */}
                        <div
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '16px',
                                padding: '18px 16px',
                                cursor: 'not-allowed',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                minHeight: '68px',
                                opacity: '0.5'
                            }}
                        >
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '11px',
                                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '21px',
                                flexShrink: 0,
                                fontWeight: '600',
                                color: 'rgba(6, 182, 212, 0.6)',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif'
                            }}>
                                B
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    letterSpacing: '-0.01em',
                                    lineHeight: '1.2',
                                    marginBottom: '4px'
                                }}>
                                    Body Stats
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    letterSpacing: '0.3px'
                                }}>
                                    Coming Soon
                                </div>
                            </div>
                        </div>

                        {/* Log Water */}
                        <div
                            onClick={() => alert('Log Water')}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '16px',
                                padding: '18px 16px',
                                cursor: 'pointer',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                minHeight: '68px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)';
                                e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '11px',
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(37, 99, 235, 0.18) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '21px',
                                flexShrink: 0,
                                fontWeight: '600',
                                color: 'rgba(59, 130, 246, 0.9)',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif'
                            }}>
                                W
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#ffffff',
                                    letterSpacing: '-0.01em',
                                    lineHeight: '1.2',
                                    marginBottom: '4px'
                                }}>
                                    Log Water
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '400',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    lineHeight: '1.3'
                                }}>
                                    Stay hydrated daily
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Sheet Modal */}
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

                        {/* Fitness Challenge Content */}
                        {/* {selectedChallenge === 'fitness' && (
                         */}
                         {false && (
                            <>
                                {/* Challenge Hero */}
                                <div
                                    style={{
                                        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                                        borderRadius: '16px',
                                        padding: '18px',
                                        marginBottom: '14px',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute',
                                        top: '-30px',
                                        right: '-30px',
                                        fontSize: '100px',
                                        opacity: '0.12'
                                    }}>💪</div>

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{
                                            display: 'inline-block',
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            padding: '5px 12px',
                                            borderRadius: '12px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            color: '#ffffff',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            marginBottom: '12px'
                                        }}>
                                            Featured
                                        </div>

                                        <h2 style={{
                                            fontSize: '24px',
                                            fontWeight: '700',
                                            color: '#ffffff',
                                            marginBottom: '8px',
                                            letterSpacing: '-0.02em',
                                            lineHeight: '1.2'
                                        }}>
                                            30-Day Fitness Challenge
                                        </h2>

                                        <p style={{
                                            fontSize: '14px',
                                            color: 'rgba(255, 255, 255, 0.85)',
                                            marginBottom: '0',
                                            lineHeight: '1.5'
                                        }}>
                                            Join your team in the ultimate fitness journey
                                        </p>
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
                                                }}>8,500 steps daily</div>
                                            </div>
                                        </div>

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
                                                }}>30 days • 12 days left</div>
                                            </div>
                                        </div>

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
                                            }}>👥</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: 'rgba(255, 255, 255, 0.6)',
                                                    marginBottom: '4px'
                                                }}>Participants</div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    {/* Stacked Profile Circles */}
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            color: '#ffffff',
                                                            border: '2px solid #1e293b',
                                                            marginRight: '-8px',
                                                            zIndex: 4
                                                        }}>JD</div>
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            color: '#ffffff',
                                                            border: '2px solid #1e293b',
                                                            marginRight: '-8px',
                                                            zIndex: 3
                                                        }}>AS</div>
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            color: '#ffffff',
                                                            border: '2px solid #1e293b',
                                                            marginRight: '-8px',
                                                            zIndex: 2
                                                        }}>MK</div>
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            color: '#ffffff',
                                                            border: '2px solid #1e293b',
                                                            zIndex: 1
                                                        }}>RP</div>
                                                    </div>
                                                    <div style={{
                                                        fontSize: '15px',
                                                        fontWeight: '600',
                                                        color: '#ffffff'
                                                    }}>+234</div>
                                                </div>
                                            </div>
                                        </div>

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

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button
                                        onClick={() => {
                                            alert('Already joined this challenge!');
                                            setSelectedChallenge(null);
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
                            </>
                        )}

                        {/* Hydration Challenge Content */}
                        {/* {selectedChallenge === 'hydration' && ( */}
                        {false && (
                            <>
                                {/* Challenge Hero */}
                                <div
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)',
                                        borderRadius: '18px',
                                        padding: '20px',
                                        marginBottom: '20px',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute',
                                        top: '-30px',
                                        right: '-30px',
                                        fontSize: '100px',
                                        opacity: '0.12'
                                    }}>💧</div>

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <h2 style={{
                                            fontSize: '24px',
                                            fontWeight: '700',
                                            color: '#ffffff',
                                            marginBottom: '8px',
                                            letterSpacing: '-0.02em',
                                            lineHeight: '1.2'
                                        }}>
                                            Hydration Challenge
                                        </h2>

                                        <p style={{
                                            fontSize: '14px',
                                            color: 'rgba(255, 255, 255, 0.85)',
                                            marginBottom: '0',
                                            lineHeight: '1.5'
                                        }}>
                                            Stay hydrated and boost your energy levels
                                        </p>
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
                                    <h3 style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#ffffff',
                                        marginBottom: '14px',
                                        letterSpacing: '-0.01em'
                                    }}>
                                        Challenge Details
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                background: 'rgba(59, 130, 246, 0.15)',
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
                                                }}>Your Daily Goal</div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#ffffff'
                                                }}>6 glasses of water per day</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                background: 'rgba(59, 130, 246, 0.15)',
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
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#ffffff'
                                                }}>7 days remaining</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                background: 'rgba(59, 130, 246, 0.15)',
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
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    {/* Stacked Profile Circles */}
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            color: '#ffffff',
                                                            border: '2px solid #1e293b',
                                                            marginRight: '-8px',
                                                            zIndex: 4
                                                        }}>LM</div>
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            color: '#ffffff',
                                                            border: '2px solid #1e293b',
                                                            marginRight: '-8px',
                                                            zIndex: 3
                                                        }}>SK</div>
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            color: '#ffffff',
                                                            border: '2px solid #1e293b',
                                                            marginRight: '-8px',
                                                            zIndex: 2
                                                        }}>TW</div>
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            color: '#ffffff',
                                                            border: '2px solid #1e293b',
                                                            zIndex: 1
                                                        }}>NC</div>
                                                    </div>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: '#ffffff'
                                                    }}>+156</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                background: 'rgba(59, 130, 246, 0.15)',
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
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#ffffff'
                                                }}>Hydration Badges</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* What You'll Get - Simplified */}
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '14px',
                                    padding: '12px 14px',
                                    marginBottom: '16px',
                                    border: '1px solid rgba(255, 255, 255, 0.08)'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {[
                                            'Water intake tracking',
                                            'Health insights',
                                            'Team comparison'
                                        ].map((benefit, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{
                                                    fontSize: '14px',
                                                    color: '#10b981',
                                                    flexShrink: 0
                                                }}>✓</span>
                                                <span style={{
                                                    fontSize: '13px',
                                                    color: 'rgba(255, 255, 255, 0.75)',
                                                    lineHeight: '1.4'
                                                }}>
                                                    {benefit}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button
                                        onClick={() => {
                                            alert('Already joined this challenge!');
                                            setSelectedChallenge(null);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)',
                                            border: 'none',
                                            borderRadius: '14px',
                                            color: '#ffffff',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            letterSpacing: '-0.01em',
                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                            WebkitTapHighlightColor: 'transparent'
                                        }}
                                    >
                                        View Progress
                                    </button>

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
                            </>
                        )}

                        {/* Wellness Challenge Content - NOT JOINED EXAMPLE */}
                        {/* {selectedChallenge === 'wellness' && ( */}
                        
                        {false && (
                            
                            <>
                                {/* Challenge Hero */}
                                <div
                                    style={{
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        borderRadius: '18px',
                                        padding: '20px',
                                        marginBottom: '20px',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute',
                                        top: '-30px',
                                        right: '-30px',
                                        fontSize: '100px',
                                        opacity: '0.12'
                                    }}>🎯</div>

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <h2 style={{
                                            fontSize: '24px',
                                            fontWeight: '700',
                                            color: '#ffffff',
                                            marginBottom: '8px',
                                            letterSpacing: '-0.02em',
                                            lineHeight: '1.2'
                                        }}>
                                            Team Wellness Goals
                                        </h2>

                                        <p style={{
                                            fontSize: '14px',
                                            color: 'rgba(255, 255, 255, 0.85)',
                                            marginBottom: '0',
                                            lineHeight: '1.5'
                                        }}>
                                            Set and track collective wellness objectives with your team
                                        </p>
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
                                    <h3 style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#ffffff',
                                        marginBottom: '14px',
                                        letterSpacing: '-0.01em'
                                    }}>
                                        Challenge Details
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                background: 'rgba(245, 158, 11, 0.15)',
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
                                                }}>Recommended Goal</div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#ffffff'
                                                }}>3 team activities per week</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                background: 'rgba(245, 158, 11, 0.15)',
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
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#ffffff'
                                                }}>4 weeks (Mar 1 - Mar 28)</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                background: 'rgba(245, 158, 11, 0.15)',
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
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    {/* Stacked Profile Circles */}
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            color: '#ffffff',
                                                            border: '2px solid #1e293b',
                                                            marginRight: '-8px',
                                                            zIndex: 4
                                                        }}>BN</div>
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            color: '#ffffff',
                                                            border: '2px solid #1e293b',
                                                            marginRight: '-8px',
                                                            zIndex: 3
                                                        }}>JC</div>
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            color: '#ffffff',
                                                            border: '2px solid #1e293b',
                                                            marginRight: '-8px',
                                                            zIndex: 2
                                                        }}>DL</div>
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            color: '#ffffff',
                                                            border: '2px solid #1e293b',
                                                            zIndex: 1
                                                        }}>KP</div>
                                                    </div>
                                                    <div style={{
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: '#ffffff'
                                                    }}>+89</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                background: 'rgba(245, 158, 11, 0.15)',
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
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#ffffff'
                                                }}>Team Champion Badge</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* What You'll Get - Simplified */}
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '14px',
                                    padding: '12px 14px',
                                    marginBottom: '16px',
                                    border: '1px solid rgba(255, 255, 255, 0.08)'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {[
                                            'Team goal tracking',
                                            'Group achievements',
                                            'Wellness challenges'
                                        ].map((benefit, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{
                                                    fontSize: '14px',
                                                    color: '#10b981',
                                                    flexShrink: 0
                                                }}>✓</span>
                                                <span style={{
                                                    fontSize: '13px',
                                                    color: 'rgba(255, 255, 255, 0.75)',
                                                    lineHeight: '1.4'
                                                }}>
                                                    {benefit}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <button
                                        onClick={() => {
                                            alert('Joining Team Wellness Goals challenge...');
                                            setSelectedChallenge(null);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                            border: 'none',
                                            borderRadius: '14px',
                                            color: '#ffffff',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            letterSpacing: '-0.01em',
                                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                                            WebkitTapHighlightColor: 'transparent'
                                        }}
                                    >
                                        Join Challenge
                                    </button>

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
                                        Maybe Later
                                    </button>
                                </div>
                            </>
                        )}
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
        </div>
    );
}