"use client";

import router, { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserProfile = {
    id: string;
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
    const router = useRouter();
    // Fetch user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const API_BASE =
                    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
                    "https://cbiqa.dev.honeywellcloud.com/socialapi";
                const token = localStorage.getItem("access_token");

                if (!token) return;

                const res = await fetch(`${API_BASE}/api/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const userData: UserProfile = await res.json();
                    setUser(userData);
                }
            } catch (e) {
                console.error('User profile fetch error:', e);
            }
        };

        fetchUserProfile();
    }, []);

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
                        onClick={() => router.push("/challanges")}
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
                                        {user?.name|| 'User'}
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
                </div>
            </div>

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