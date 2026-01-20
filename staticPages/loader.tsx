import { useEffect, useState } from 'react';

// ============================================================================
// MAIN LOADER COMPONENT - Professional & Engaging
// ============================================================================

interface LoaderProps {
    message?: string;
    showProgress?: boolean;
}

export default function Loader({ message = 'Loading...', showProgress = false }: LoaderProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (showProgress) {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) return 0;
                    return prev + 2;
                });
            }, 50);
            return () => clearInterval(interval);
        }
    }, [showProgress]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="text-center">
                {/* Professional Spinner */}
                <div className="relative w-12 h-12 mx-auto mb-6">
                    {/* Spinning ring */}
                    <svg className="w-full h-full animate-spin" style={{ animationDuration: '0.8s' }} viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="url(#spinnerGradient)"
                            strokeWidth="8"
                            strokeDasharray="66 200"
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
                                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Loading Message - Clean and Simple */}
                {message && (
                    <p className="text-white/70 text-base font-medium">
                        {message}
                    </p>
                )}

                {/* Progress Bar - Minimal and Clean */}
                {showProgress && (
                    <div className="mt-6 w-48 mx-auto">
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-white/40 text-xs mt-2 font-medium">{progress}%</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// PAGE LOADER - For navigation and page transitions (like Linear, Slack)
// ============================================================================

export function PageLoader({ message }: { message?: string }) {
    return (
        <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center">
            <div className="text-center">
                {/* Clean spinner */}
                <div className="relative w-10 h-10 mx-auto mb-4">
                    <svg className="w-full h-full animate-spin" style={{ animationDuration: '0.8s' }} viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="url(#pageLoaderGradient)"
                            strokeWidth="8"
                            strokeDasharray="66 200"
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="pageLoaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
                                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                {message && (
                    <p className="text-white/60 text-sm">{message}</p>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// MINIMAL LOADER - For cards and sections
// ============================================================================

export function MinimalLoader() {
    return (
        <div className="flex items-center justify-center p-8">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
                <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '1s' }} viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradientMinimal)"
                        strokeWidth="8"
                        strokeDasharray="70 200"
                        strokeLinecap="round"
                    />
                    <defs>
                        <linearGradient id="gradientMinimal" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
}

// ============================================================================
// INLINE LOADER - For buttons and inline elements
// ============================================================================

export function InlineLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-5 h-5 border-2',
        lg: 'w-6 h-6 border-3'
    };

    return (
        <svg className={`${sizeClasses[size]} animate-spin`} viewBox="0 0 100 100">
            <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray="70 200"
                strokeLinecap="round"
                opacity="0.25"
            />
            <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray="70 200"
                strokeLinecap="round"
            />
        </svg>
    );
}

// ============================================================================
// SKELETON LOADER - Content placeholder
// ============================================================================

export function SkeletonLoader() {
    return (
        <div className="space-y-4 p-4">
            {/* Header Skeleton */}
            <div className="h-10 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-lg w-3/4 animate-pulse" 
                 style={{ animationDuration: '2s' }} />
            
            {/* Card Skeletons */}
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5" 
                         style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-full animate-pulse" 
                                 style={{ animationDuration: '2s', animationDelay: `${i * 0.15}s` }} />
                            <div className="flex-1 space-y-3">
                                <div className="h-5 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded w-1/3 animate-pulse" 
                                     style={{ animationDuration: '2s', animationDelay: `${i * 0.2}s` }} />
                                <div className="h-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded w-2/3 animate-pulse" 
                                     style={{ animationDuration: '2s', animationDelay: `${i * 0.25}s` }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// SUCCESS LOADER - Animated success state
// ============================================================================

export function SuccessLoader({ message = 'Success!' }: { message?: string }) {
    const [showCheck, setShowCheck] = useState(false);
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        setTimeout(() => setShowCheck(true), 300);
        setTimeout(() => setShowMessage(true), 800);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="text-center">
                {/* Success Circle Animation */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                    {/* Ripple Effect */}
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" 
                         style={{ animationDuration: '1.5s' }} />
                    
                    {/* Success Circle */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-2xl shadow-emerald-500/50 transition-all duration-500 ${
                        showCheck ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}>
                        {/* Shine Effect */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
                    </div>
                    
                    {/* Animated Checkmark */}
                    {showCheck && (
                        <svg 
                            className="absolute inset-0 w-full h-full text-white p-8" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            style={{
                                strokeDasharray: 100,
                                strokeDashoffset: 100,
                                animation: 'drawCheck 0.5s ease-out 0.3s forwards'
                            }}
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2.5} 
                                d="M5 13l4 4L19 7" 
                            />
                        </svg>
                    )}
                </div>
                
                {/* Success Message */}
                <div className={`transition-all duration-500 ${
                    showMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                    <h2 className="text-2xl font-semibold text-white mb-2">
                        {message}
                    </h2>
                    <p className="text-white/60">
                        Everything is ready to go
                    </p>
                </div>
            </div>

            {/* CSS for checkmark animation */}
            <style jsx>{`
                @keyframes drawCheck {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>
        </div>
    );
}

// ============================================================================
// SPINNER BUTTON - Button with inline loader
// ============================================================================

interface SpinnerButtonProps {
    loading?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}

export function SpinnerButton({ 
    loading = false, 
    children, 
    onClick, 
    disabled = false,
    className = ''
}: SpinnerButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`relative flex items-center justify-center gap-2 transition-all ${className}`}
        >
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <InlineLoader size="sm" />
                </div>
            )}
            <span className={loading ? 'opacity-0' : 'opacity-100'}>
                {children}
            </span>
        </button>
    );
}