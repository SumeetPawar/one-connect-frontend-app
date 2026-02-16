"use client";

import router, { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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