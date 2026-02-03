import { useState } from 'react';

export default function WeeklyChallenge() {
    const [selectedGoal, setSelectedGoal] = useState<string | null>('easy');
    const [showSteps, setShowSteps] = useState(false);

    const goals = [
        {
            id: 'easy',
            icon: '🚶',
            title: 'Easy',
            description: 'Perfect for beginners',
            daily: '3,000 steps per day',
            level: 'Beginner Friendly',
            color: 'from-emerald-400 to-green-500'
        },
        {
            id: 'medium',
            icon: '🏃',
            title: 'Medium',
            description: 'Balanced weekly activity',
            daily: '6,000 steps per day',
            level: 'Moderate Challenge',
            color: 'from-blue-400 to-blue-500'
        },
        {
            id: 'hard',
            icon: '⚡',
            title: 'Hard',
            description: 'Push your limits',
            daily: '9,000 steps per day',
            level: 'High Intensity',
            color: 'from-amber-400 to-orange-500'
        },
        {
            id: 'expert',
            icon: '🔥',
            title: 'Expert',
            description: 'For fitness enthusiasts',
            daily: '12,000 steps per day',
            level: 'Maximum Challenge',
            color: 'from-red-400 to-pink-500'
        }
    ];

    const handleGoalSelect = (goalId: string) => {
        setSelectedGoal(goalId);
    };

    const handleContinue = () => {
        if (!selectedGoal) return;
        const goal = goals.find(g => g.id === selectedGoal);
        if (goal) {
            localStorage.setItem('weeklyChallenge', JSON.stringify(goal));
            setShowSteps(true);
        }
    };

    if (showSteps) {
        const goal = goals.find(g => g.id === selectedGoal);
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md w-full">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                        Challenge Accepted!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Your daily target: {goal?.daily}
                    </p>
                    <p className="text-sm text-gray-500">
                        Redirecting to Steps Tracker...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 bg-gradient-to-b from-violet-950/15 to-slate-950 p-4">
            <div className="max-w-md mx-auto pt-8 pb-20">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-semibold text-white mb-3 tracking-tight" style={{ letterSpacing: '-0.022em' }}>
                        Weekly Challenge
                    </h1>
                    <p className="text-lg text-white/60 font-normal">
                        Choose your challenge level
                    </p>
                </div>

                {/* Goal Cards */}
                <div className="space-y-3 mb-5">
                    {goals.map((goal : any) => {
                        const isSelected = selectedGoal === goal.id;
                        
                        // Color mapping for clean accent colors
                        const accentColors : any = {
                            'from-emerald-400 to-green-500': { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-400', gradient: 'from-emerald-500 to-green-500' },
                            'from-blue-400 to-blue-500': { border: 'border-blue-500/30', bg: 'bg-blue-500/5', text: 'text-blue-400', gradient: 'from-blue-500 to-blue-600' },
                            'from-amber-400 to-orange-500': { border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-400', gradient: 'from-amber-500 to-orange-500' },
                            'from-red-400 to-pink-500': { border: 'border-red-500/30', bg: 'bg-red-500/5', text: 'text-red-400', gradient: 'from-red-500 to-pink-500' }
                        };
                        
                        const colors = accentColors[goal.color];
                        
                        return (
                            <button
                                key={goal.id}
                                onClick={() => handleGoalSelect(goal.id)}
                                className={`w-full border rounded-2xl p-5 transition-all duration-200 text-left relative overflow-hidden ${
                                    isSelected
                                        ? `${colors.bg} ${colors.border} shadow-xl`
                                        : 'bg-white/5 border-white/10 hover:bg-white/8'
                                }`}
                            >
                                {/* Colored Top Bar */}
                                {isSelected && (
                                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />
                                )}
                                
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-3xl">{goal.icon}</span>
                                            <h3 className="text-xl font-semibold text-white">
                                                {goal.title}
                                            </h3>
                                        </div>
                                        
                                        <p className="text-white/50 text-sm mb-3 leading-relaxed">
                                            {goal.description}
                                        </p>
                                        
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-2xl font-semibold ${isSelected ? colors.text : 'text-white/90'}`}>
                                                {goal.daily.split(' ')[0]}
                                            </span>
                                            <span className="text-white/50 text-sm">
                                                {goal.daily.split(' ').slice(1).join(' ')}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {isSelected && (
                                        <div className="flex-shrink-0">
                                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-md`}>
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Info Card */}
                <div className="bg-violet-500/8 border border-violet-500/20 rounded-xl p-3 mb-4">
                    <p className="text-xs text-white/70 text-center">
                        💡 New challenges start every Monday
                    </p>
                </div>

                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    disabled={!selectedGoal}
                    className={`w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
                        selectedGoal
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/40 hover:shadow-xl hover:shadow-violet-500/50 hover:-translate-y-0.5'
                            : 'bg-white/10 cursor-not-allowed opacity-50'
                    }`}
                >
                    Continue to Steps Tracker
                </button>

                {/* Skip Option */}
                <button
                    onClick={() => setShowSteps(true)}
                    className="w-full py-2.5 text-sm font-semibold text-white/50 hover:text-white/80 transition-colors mt-2"
                >
                    Skip for now
                </button>

            </div>
        </div>
    );
}