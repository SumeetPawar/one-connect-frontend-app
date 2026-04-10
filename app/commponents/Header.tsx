"use client";

import router, { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCachedUserMe } from "@/lib/api";
import NotificationBell from "../components/NotificationBell";

type UserProfile = {
    id: string;
    role?: string | 'user' | 'admin';
    email: string;
    name?: string;
};

type HeaderProps = {
    title?: string;
    subtitle?: string;
    showAnimatedWord?: boolean;
};

export default function Header({
    title = "GES",
    subtitle,
    showAnimatedWord = true
}: HeaderProps) {
    const [currentWord, setCurrentWord] = useState<string>('Fitness');
    const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [resetUserId, setResetUserId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [fbType, setFbType] = useState<'suggestion' | 'bug' | 'other'>('suggestion');
    const [fbTitle, setFbTitle] = useState('');
    const [fbBody, setFbBody] = useState('');
    const [fbRating, setFbRating] = useState(0);
    const [fbSubmitting, setFbSubmitting] = useState(false);
    const [fbDone, setFbDone] = useState(false);
    const [isStandalone, setIsStandalone] = useState(true); // default true to avoid flash
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();
    // Detect standalone mode (PWA installed) and mobile device
    useEffect(() => {
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
        setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    }, []);

    // Fetch user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const userData = await getCachedUserMe();
                setUser(userData as UserProfile);
            } catch (e) {
                console.error('User profile fetch error:', e);
            }
        };

        fetchUserProfile();
    }, []);

    // Add this useEffect
    useEffect(() => {
        if (showAdminPanel && user?.role === 'admin') {
            fetchAllUsers();
        }
    }, [showAdminPanel]);

    const fetchAllUsers = async () => {
        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
                "https://cbiqa.dev.honeywellcloud.com/socialapi";
            const token = localStorage.getItem("access_token");

            const res = await fetch(`${API_BASE}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const users = await res.json();
                setAllUsers(users);
            }
        } catch (e) {
            console.error('Failed to fetch users:', e);
        }
    };

    // Animated word loop
    useEffect(() => {
        if (!showAnimatedWord) return;

        const words = ['Fitness', 'Connect', 'Social', 'Insights'];
        let index = 0;

        const interval = setInterval(() => {
            index = (index + 1) % words.length;
            setCurrentWord(words[index]);
        }, 2000);

        return () => clearInterval(interval);
    }, [showAnimatedWord]);

    // Close user menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showUserMenu && !target.closest('.user-menu-container')) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserMenu]);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/login");
    };

    const handleFeedbackSubmit = async () => {
        if (!fbTitle.trim() || !fbBody.trim()) return;
        setFbSubmitting(true);
        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
            const token = localStorage.getItem("access_token");
            await fetch(`${API_BASE}/api/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    type: fbType,
                    title: fbTitle.trim(),
                    body: fbBody.trim(),
                    rating: fbRating || undefined,
                    meta: { screen: window.location.pathname, app_version: "1.0.0" },
                }),
            });
            setFbDone(true);
            setTimeout(() => { setShowFeedback(false); setFbDone(false); setFbTitle(''); setFbBody(''); setFbRating(0); setFbType('suggestion'); }, 1800);
        } catch {
            // fail silently — still close after delay
            setFbDone(true);
            setTimeout(() => { setShowFeedback(false); setFbDone(false); }, 1800);
        } finally {
            setFbSubmitting(false);
        }
    };

    // Update the isPasswordValid function:
    const isPasswordValid = (password: string) => {
        if (password.length < 7) return false;
        if (!/[A-Z]/.test(password)) return false;
        if (!/[a-z]/.test(password)) return false;
        if (!/[0-9]/.test(password)) return false;
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
        return true;
    };

    return (
        <>
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
                    {/* Title Section */}
                    <div
                        onClick={() => router.push("/home")}
                        style={{
                            cursor: 'pointer',
                            userSelect: 'none',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                    >
                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#ffffff',
                            marginBottom: subtitle ? '4px' : '0',
                            letterSpacing: '-0.02em'
                        }}>
                            {title}{' '}
                            {showAnimatedWord && (
                                <span
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
                            )}
                        </h1>
                        {subtitle && (
                            <p style={{
                                fontSize: '12px',
                                color: 'rgba(255, 255, 255, 0.6)',
                                margin: 0
                            }}>
                                {subtitle}
                            </p>
                        )}
                    </div>


                    {/* Right-side icons: Bell + User Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                    {/* Download / Install icon — only in browser, not in installed PWA */}
                    {!isStandalone && (
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('show-install-prompt'))}
                            title="Install app"
                            style={{
                                width: 38, height: 38, borderRadius: '50%',
                                background: 'rgba(124,58,237,0.15)',
                                border: '1px solid rgba(124,58,237,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: '#a78bfa',
                                flexShrink: 0, padding: 0, outline: 'none',
                                WebkitTapHighlightColor: 'transparent',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.background = 'rgba(124,58,237,0.28)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        </button>
                    )}

                    <NotificationBell />

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
                            {user ? (
                                user.name && user.name.split(' ').length > 1
                                    ? `${user.name[0]}${user.name.split(' ')[1]?.[0] || ''}`.toUpperCase()
                                    : user.email[0].toUpperCase()
                            ) : 'U'}
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
                                    minWidth: '200px',
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
                                        {user?.name || 'User'}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {user?.email || ''}
                                    </div>
                                </div>

                                {/* After User Info, before Logout */}
                                {user?.role === 'admin' && (
                                    <button
                                        onClick={() => {
                                            setShowAdminPanel(true);
                                            setShowUserMenu(false);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            background: 'transparent',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'background 0.2s',
                                            marginBottom: '4px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(167, 139, 250, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        Manage Users
                                    </button>
                                )}

                                {/* Feedback Button */}
                                <button
                                    onClick={() => { setShowFeedback(true); setShowUserMenu(false); }}
                                    style={{
                                        width: '100%', padding: '10px 12px', background: 'transparent',
                                        border: 'none', borderRadius: '6px', color: 'rgba(255,255,255,0.85)',
                                        fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                                        textAlign: 'left', transition: 'background 0.2s', marginBottom: '4px',
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.1)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                    </svg>
                                    Send Feedback
                                </button>

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
                                        textAlign: 'left',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                    </div>{/* end right-side icons wrapper */}
                </div>
            </div>

            {/* Feedback Modal */}
            {showFeedback && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000,
                }} onClick={() => setShowFeedback(false)}>
                    <div style={{
                        background: 'rgba(18,18,28,0.98)', borderRadius: '20px 20px 0 0',
                        border: '1px solid rgba(255,255,255,0.08)', padding: '24px 20px 40px',
                        width: '100%', maxWidth: 480,
                        boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
                    }} onClick={e => e.stopPropagation()}>

                        {fbDone ? (
                            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
                                <p style={{ fontSize: 17, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>Thanks for your feedback!</p>
                                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>We read every submission.</p>
                            </div>
                        ) : (<>
                            {/* Handle bar */}
                            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 20px' }} />

                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 4px', letterSpacing: '-.3px' }}>Send Feedback</h2>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 20px' }}>Suggestions, bugs, or anything on your mind.</p>

                            {/* Type pills */}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                {(['suggestion', 'bug', 'other'] as const).map(t => (
                                    <button key={t} onClick={() => setFbType(t)} style={{
                                        padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                        background: fbType === t ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)',
                                        border: `1px solid ${fbType === t ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                        color: fbType === t ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                                        textTransform: 'capitalize',
                                    }}>{t}</button>
                                ))}
                            </div>

                            {/* Title */}
                            <input
                                value={fbTitle} onChange={e => setFbTitle(e.target.value)}
                                placeholder="Short title"
                                style={{
                                    width: '100%', padding: '11px 14px', borderRadius: 10, marginBottom: 10,
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                                }}
                            />

                            {/* Body */}
                            <textarea
                                value={fbBody} onChange={e => setFbBody(e.target.value)}
                                placeholder="Tell us more..."
                                rows={4}
                                style={{
                                    width: '100%', padding: '11px 14px', borderRadius: 10, marginBottom: 16,
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box',
                                    fontFamily: 'inherit',
                                }}
                            />

                            {/* Star rating */}
                            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                                {[1,2,3,4,5].map(s => (
                                    <button key={s} onClick={() => setFbRating(s === fbRating ? 0 : s)} style={{
                                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                                        fontSize: 24, opacity: s <= fbRating ? 1 : 0.25, transition: 'opacity 0.15s',
                                    }}>★</button>
                                ))}
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', alignSelf: 'center', marginLeft: 4 }}>
                                    {fbRating > 0 ? ['','Poor','Fair','Good','Great','Excellent'][fbRating] : 'Optional rating'}
                                </span>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleFeedbackSubmit}
                                disabled={fbSubmitting || !fbTitle.trim() || !fbBody.trim()}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                                    background: (fbTitle.trim() && fbBody.trim()) ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'rgba(255,255,255,0.08)',
                                    color: '#fff', fontSize: 15, fontWeight: 600, cursor: (fbTitle.trim() && fbBody.trim()) ? 'pointer' : 'not-allowed',
                                    opacity: fbSubmitting ? 0.7 : 1, transition: 'all 0.2s',
                                }}
                            >
                                {fbSubmitting ? 'Sending…' : 'Submit'}
                            </button>
                        </>)}
                    </div>
                </div>
            )}

            {/* Admin Popup */}
            {showAdminPanel && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }} onClick={() => setShowAdminPanel(false)}>
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.98)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '24px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>

                        {/* Header */}
                        <div style={{ marginBottom: '20px' }}>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#ffffff',
                                margin: 0
                            }}>Reset User Password</h2>
                        </div>

                        {/* User Selection */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                fontSize: '13px',
                                fontWeight: '500',
                                color: 'rgba(167, 139, 250, 0.9)',
                                marginBottom: '8px',
                                display: 'block',
                                letterSpacing: '0.3px'
                            }}>Select User</label>
                            <select
                                value={resetUserId}
                                onChange={(e) => setResetUserId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    border: '1.5px solid rgba(167, 139, 250, 0.2)',
                                    borderRadius: '10px',
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            >
                                <option value="">-- Select a user --</option>
                                {allUsers.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.name || u.email} ({u.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* New Password */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                fontSize: '13px',
                                fontWeight: '500',
                                color: 'rgba(167, 139, 250, 0.9)',
                                marginBottom: '8px',
                                display: 'block',
                                letterSpacing: '0.3px'
                            }}>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    border: '1.5px solid rgba(167, 139, 250, 0.2)',
                                    borderRadius: '10px',
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.border = '1.5px solid rgba(167, 139, 250, 0.5)';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.border = '1.5px solid rgba(167, 139, 250, 0.2)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                            {newPassword && !isPasswordValid(newPassword) && (
                                <div style={{ marginTop: '6px' }}>
                                    <p style={{
                                        fontSize: '11px',
                                        color: 'rgba(239, 68, 68, 0.9)',
                                        margin: '2px 0',
                                        fontWeight: '500'
                                    }}>Password must contain:</p>
                                    <ul style={{
                                        fontSize: '11px',
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        margin: '4px 0',
                                        paddingLeft: '20px'
                                    }}>
                                        <li style={{ color: newPassword.length >= 7 ? '#10b981' : '#ef4444' }}>
                                            At least 7 characters
                                        </li>
                                        <li style={{ color: /[A-Z]/.test(newPassword) ? '#10b981' : '#ef4444' }}>
                                            One uppercase letter
                                        </li>
                                        <li style={{ color: /[a-z]/.test(newPassword) ? '#10b981' : '#ef4444' }}>
                                            One lowercase letter
                                        </li>
                                        <li style={{ color: /[0-9]/.test(newPassword) ? '#10b981' : '#ef4444' }}>
                                            One number
                                        </li>
                                        <li style={{ color: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? '#10b981' : '#ef4444' }}>
                                            One special character (!@#$%^&*...)
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                fontSize: '13px',
                                fontWeight: '500',
                                color: 'rgba(167, 139, 250, 0.9)',
                                marginBottom: '8px',
                                display: 'block',
                                letterSpacing: '0.3px'
                            }}>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    border: confirmPassword && newPassword !== confirmPassword
                                        ? '1.5px solid rgba(239, 68, 68, 0.6)'
                                        : '1.5px solid rgba(167, 139, 250, 0.2)',
                                    borderRadius: '10px',
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => {
                                    if (!(confirmPassword && newPassword !== confirmPassword)) {
                                        e.currentTarget.style.border = '1.5px solid rgba(167, 139, 250, 0.5)';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                                    }
                                }}
                                onBlur={(e) => {
                                    if (!(confirmPassword && newPassword !== confirmPassword)) {
                                        e.currentTarget.style.border = '1.5px solid rgba(167, 139, 250, 0.2)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            />
                            {confirmPassword && newPassword !== confirmPassword && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    marginTop: '6px'
                                }}>
                                    <span style={{ fontSize: '14px' }}>⚠️</span>
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#ef4444',
                                        margin: 0,
                                        fontWeight: '500'
                                    }}>Passwords do not match</p>
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={async () => {
                                    if (!resetUserId || !newPassword) {
                                        alert('Please select user and enter password');
                                        return;
                                    }

                                    if (!isPasswordValid(newPassword)) {
                                        alert('Password does not meet security requirements');
                                        return;
                                    }

                                    if (newPassword !== confirmPassword) {
                                        alert('Passwords do not match');
                                        return;
                                    }

                                    try {
                                        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
                                            "https://cbiqa.dev.honeywellcloud.com/socialapi";
                                        const token = localStorage.getItem("access_token");

                                        const res = await fetch(`${API_BASE}/api/admin/users/reset-password`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${token}`
                                            },
                                            body: JSON.stringify({
                                                user_id: resetUserId,
                                                new_password: newPassword
                                            })
                                        });

                                        if (res.ok) {
                                            alert('Password reset successful!');
                                            setResetUserId('');
                                            setNewPassword('');
                                            setConfirmPassword('');
                                            setShowAdminPanel(false);
                                        } else {
                                            const error = await res.json();
                                            alert(error.detail || 'Failed to reset password');
                                        }
                                    } catch (e) {
                                        alert('Error resetting password');
                                    }
                                }}
                                disabled={!resetUserId || !newPassword || !isPasswordValid(newPassword) || newPassword !== confirmPassword}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: (resetUserId && newPassword && isPasswordValid(newPassword) && newPassword === confirmPassword)
                                        ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: (resetUserId && newPassword && isPasswordValid(newPassword) && newPassword === confirmPassword)
                                        ? 'pointer'
                                        : 'not-allowed',
                                    opacity: (resetUserId && newPassword && isPasswordValid(newPassword) && newPassword === confirmPassword)
                                        ? 1
                                        : 0.5
                                }}
                            >
                                Reset Password
                            </button>
                            <button
                                onClick={() => {
                                    setShowAdminPanel(false);
                                    setResetUserId('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                }}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: 'transparent',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animations */}
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
        </>
    );
}