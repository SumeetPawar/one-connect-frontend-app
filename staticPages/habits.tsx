import { useState } from 'react';

interface DayData {
  date: string;
  habits: {
    water: number;
    yoga: boolean;
    meditation: boolean;
    stretching: boolean;
    no_junk: boolean;
    deep_work: number;
  };
  completed: number;
  total: number;
}

export default function CompactHabitsTracker() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [habits, setHabits] = useState({
    water: 0,
    yoga: false,
    meditation: false,
    sleep: false,
    deep_work: 0,
  });
  const [showDescription, setShowDescription] = useState<string | null>(null);

  const weekData: DayData[] = [
    { date: '2026-01-24', habits: { water: 0, yoga: false, meditation: false, stretching: false, no_junk: false, deep_work: 0 }, completed: 0, total: 5 },
    { date: '2026-01-23', habits: { water: 6, yoga: true, meditation: true, stretching: false, no_junk: true, deep_work: 3 }, completed: 4, total: 5 },
    { date: '2026-01-22', habits: { water: 8, yoga: true, meditation: true, stretching: true, no_junk: true, deep_work: 4 }, completed: 5, total: 5 },
    { date: '2026-01-21', habits: { water: 5, yoga: false, meditation: true, stretching: true, no_junk: false, deep_work: 2 }, completed: 3, total: 5 },
    { date: '2026-01-20', habits: { water: 7, yoga: true, meditation: false, stretching: true, no_junk: true, deep_work: 3 }, completed: 4, total: 5 },
    { date: '2026-01-19', habits: { water: 4, yoga: false, meditation: false, stretching: false, no_junk: true, deep_work: 1 }, completed: 1, total: 5 },
    { date: '2026-01-18', habits: { water: 8, yoga: true, meditation: true, stretching: true, no_junk: true, deep_work: 4 }, completed: 5, total: 5 },
  ];

  const goals = [
    { key: 'water', icon: '💧', label: 'Water', type: 'number', target: 8, unit: 'bottles', description: 'Stay hydrated - drink 8 bottles throughout the day' },
    { key: 'yoga', icon: '🏃', label: 'Exercise', type: 'boolean', description: 'Any physical activity for 15+ mins - yoga, stretching, walking, cycling, jogging, or gym workout' },
    { key: 'meditation', icon: '🧘', label: 'Mindfulness', type: 'boolean', description: 'Mindful activities - meditation, breathing exercises, journaling, or quiet reflection' },
    { key: 'sleep', icon: '🌙', label: 'Sleep', type: 'boolean', description: 'Got 7+ hours of quality sleep - essential for recovery, focus, and overall health' },
    { key: 'deep_work', icon: '🎯', label: 'Deep Focus', type: 'number', target: 4, unit: 'hours', description: 'Complete focused work sessions without distractions' },
  ];

  const updateHabit = (key: string, value: number | boolean) => {
    setHabits(prev => ({ ...prev, [key]: value }));
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const currentDayData = weekData[selectedDay];
  
  // Calculate streak (4+ out of 5 habits = 80%+ completion)
  let currentStreak = 0;
  for (let i = weekData.length - 1; i >= 0; i--) {
    if (weekData[i].completed >= 4) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate today's progress
  const todayCompleted = selectedDay === 0 
    ? goals.filter(g => {
        const value = habits[g.key as keyof typeof habits];
        return g.type === 'boolean' ? value === true : (g.target ? typeof value === 'number' && value >= g.target : false);
      }).length
    : currentDayData.completed;
  
  const progressPercentage = Math.round((todayCompleted / goals.length) * 100);
  
  // Motivational messages
  const getMotivation = (percentage: number) => {
    if (percentage === 100) return "Perfect day! 🎉";
    if (percentage >= 80) return "Almost there!";
    if (percentage >= 50) return "Great progress";
    if (percentage > 0) return "Keep it going";
    return "Let's start strong";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-6 font-['SF_Pro_Display','system-ui','-apple-system','BlinkMacSystemFont','Segoe_UI','Roboto','sans-serif']">
      <div className="max-w-2xl mx-auto">
        {/* Progress Header - Dynamic based on selected day */}
        <div className="mb-4">
          {/* Today Anchor - Only show when viewing today */}
          {selectedDay === 0 && todayCompleted < goals.length && (
            <div className="bg-slate-800/20 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-slate-700/20 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[13px]">🎯</span>
                  <div>
                    <span className="text-[13px] font-medium text-white/90 tracking-[-0.01em]">Today</span>
                    <span className="text-[13px] text-slate-400 font-normal mx-1.5">·</span>
                    <span className="text-[13px] text-slate-400 font-normal">
                      {goals.length - todayCompleted} {goals.length - todayCompleted === 1 ? 'habit' : 'habits'} away from perfect
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal">
                  <span>⏳</span>
                  <span>Best: 7–9 PM</span>
                </div>
              </div>
            </div>
          )}

          {/* Success Message when perfect day achieved */}
          {selectedDay === 0 && todayCompleted === goals.length && (
            <div className="bg-green-500/10 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-green-500/20 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[13px]">🎉</span>
                <div>
                  <span className="text-[13px] font-medium text-green-400 tracking-[-0.01em]">Perfect day!</span>
                  <span className="text-[13px] text-green-400/70 font-normal mx-1.5">·</span>
                  <span className="text-[13px] text-green-400/70 font-normal">Keep the streak going tomorrow</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] font-semibold text-white tracking-[-0.02em] leading-snug">
                  {selectedDay === 0 
                    ? "Today's Habits" 
                    : `${getDayName(currentDayData.date)}, ${new Date(currentDayData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  }
                </h1>
                {/* Goal Complete Badge - 3+ habits */}
                {((selectedDay === 0 && todayCompleted >= 3) || (selectedDay !== 0 && currentDayData.completed >= 3)) && (
                  <div className="flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/30">
                    <span className="text-[11px] text-green-400 font-semibold tracking-[0.01em]">GOAL MET</span>
                    <span className="text-green-400 text-[10px]">✓</span>
                  </div>
                )}
              </div>
              <p className="text-[13px] text-slate-500 font-normal mt-0.5 tracking-[-0.01em]">
                {selectedDay === 0 
                  ? getMotivation(progressPercentage)
                  : `${currentDayData.completed} of ${goals.length} habits completed`
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-[28px] font-semibold text-white tracking-[-0.03em] leading-none">
                {selectedDay === 0 ? todayCompleted : currentDayData.completed}
                <span className="text-slate-500 text-[17px] font-normal">/{goals.length}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1 tracking-[0.06em] uppercase">
                {selectedDay === 0 
                  ? `${progressPercentage}% DONE`
                  : `${Math.round((currentDayData.completed / goals.length) * 100)}% DONE`
                }
              </div>
            </div>
          </div>
          
          {/* Progress Bar - Changes color when goal met */}
          <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out ${
                ((selectedDay === 0 && todayCompleted >= 3) || (selectedDay !== 0 && currentDayData.completed >= 3))
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600'
              }`}
              style={{ width: selectedDay === 0 ? `${progressPercentage}%` : `${Math.round((currentDayData.completed / goals.length) * 100)}%` }}
            />
          </div>
        </div>

        {/* Streak Badge */}
        {currentStreak > 0 && (
          <div className="mb-4 flex items-center justify-between bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-xl p-3 border border-orange-500/20">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🔥</span>
              <div>
                <div className="text-[15px] font-semibold text-orange-400 tracking-[-0.01em]">{currentStreak} Day Streak</div>
                <div className="text-[13px] text-orange-400/70 font-normal tracking-[-0.01em]">Keep the momentum!</div>
              </div>
            </div>
          </div>
        )}

        {/* Week Calendar - Apple Typography */}
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl rounded-2xl p-3 border border-slate-700/20 mb-4">
          <div className="grid grid-cols-7 gap-2">
            {weekData.map((day, index) => {
              const isToday = index === 0;
              const isSelected = index === selectedDay;
              const isComplete = day.completed >= 4;
              
              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDay(index)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className={`text-[11px] font-medium uppercase tracking-[0.06em] transition-colors ${
                    isSelected ? 'text-purple-300' : 'text-slate-500 group-hover:text-slate-400'
                  }`}>
                    {getDayName(day.date).charAt(0)}
                  </div>
                  
                  <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30 scale-110' 
                      : isComplete
                        ? 'bg-purple-500/20 border border-purple-500/30 group-hover:border-purple-500/50 group-hover:scale-105'
                        : 'bg-slate-800/60 border border-slate-700/30 group-hover:border-slate-600/50'
                  }`}>
                    {isComplete && (
                      <span className={`text-[15px] font-semibold ${isSelected ? 'text-white' : 'text-purple-400'}`}>✓</span>
                    )}
                    {!isComplete && (
                      <span className={`text-[15px] font-normal ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                        {new Date(day.date).getDate()}
                      </span>
                    )}
                    
                    {isToday && !isSelected && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-500 rounded-full border border-slate-900 animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Habits List - Apple Typography */}
        <div className="space-y-1.5 mb-4">
          {goals.map((goal, index) => {
            const value = selectedDay === 0 ? habits[goal.key as keyof typeof habits] : currentDayData.habits[goal.key as keyof typeof currentDayData.habits];
            const isComplete = goal.type === 'boolean' ? value === true : (goal.target ? typeof value === 'number' && value >= goal.target : false);
            const isReadOnly = selectedDay !== 0;
            const isExpanded = showDescription === goal.key;

            return (
              <button
                key={goal.key}
                onClick={() => !isReadOnly && setShowDescription(isExpanded ? null : goal.key)}
                className={`w-full bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl rounded-lg p-2.5 border transition-all ${
                  isComplete 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : 'border-slate-700/20 hover:border-slate-600/30'
                } ${isReadOnly ? 'opacity-50 cursor-default' : 'cursor-pointer hover:border-purple-500/30'}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex items-start gap-2 flex-1 min-w-0 text-left">
                    <span className="text-lg flex-shrink-0 opacity-90 mt-0.5">{goal.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[15px] font-medium text-white/90 tracking-[-0.01em]">{goal.label}</span>
                        {goal.type === 'number' && (
                          <span className="text-[11px] text-slate-500 font-normal tracking-[0.01em]">{goal.target} {goal.unit}</span>
                        )}
                        {isComplete && <span className="text-green-400 text-base flex-shrink-0 font-semibold">✓</span>}
                      </div>
                      <p className={`text-[11px] font-normal leading-relaxed tracking-[-0.01em] transition-all ${
                        isExpanded ? 'text-slate-400' : 'text-slate-500 line-clamp-1'
                      }`}>
                        {goal.description}
                      </p>
                      {!isReadOnly && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] text-slate-600 font-medium tracking-[0.02em]">
                            {isExpanded ? 'TAP TO COLLAPSE' : 'TAP FOR DETAILS'}
                          </span>
                          <span className={`text-[10px] text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedDay === 0 && (
                    <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {goal.type === 'boolean' ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => updateHabit(goal.key, true)}
                            className={`px-2.5 py-1 rounded-md text-[13px] font-medium tracking-[-0.01em] transition-all ${
                              value ? 'bg-green-500/90 text-white shadow-sm' : 'bg-slate-700/30 text-slate-500 hover:bg-slate-700/50'
                            }`}
                          >
                            Done
                          </button>
                          <button
                            onClick={() => updateHabit(goal.key, false)}
                            className={`px-2.5 py-1 rounded-md text-[13px] font-medium tracking-[-0.01em] transition-all ${
                              !value ? 'bg-slate-600/50 text-white' : 'bg-slate-700/20 text-slate-500 hover:bg-slate-700/40'
                            }`}
                          >
                            Skip
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1 items-center">
                          <button
                            onClick={() => updateHabit(goal.key, Math.max(0, (value as number) - 1))}
                            className="w-6 h-6 bg-slate-700/40 rounded-md text-white/80 hover:bg-slate-700/60 text-[17px] font-light active:scale-95 transition-all leading-none"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={value as number}
                            onChange={(e) => updateHabit(goal.key, Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-10 bg-slate-700/20 text-white/90 text-center text-[15px] font-normal py-0.5 rounded-md border border-slate-600/30 focus:border-purple-500/50 focus:outline-none transition-colors tracking-[-0.01em]"
                          />
                          <button
                            onClick={() => updateHabit(goal.key, (value as number) + 1)}
                            className="w-6 h-6 bg-slate-700/40 rounded-md text-white/80 hover:bg-slate-700/60 text-[17px] font-light active:scale-95 transition-all leading-none"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {selectedDay !== 0 && (
                    <div className="flex-shrink-0 text-center min-w-[50px]">
                      <div className="text-[17px] font-normal text-white/70 tracking-[-0.01em]">
                        {goal.type === 'boolean' ? (value ? '✓' : '−') : value}
                      </div>
                      {goal.type === 'number' && (
                        <div className="text-[11px] text-slate-500 font-normal tracking-[0.01em]">{goal.unit}</div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit Button - Apple Typography */}
        {selectedDay === 0 && (
          <button
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl text-[15px] font-semibold tracking-[-0.01em] hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] transition-all"
          >
            Save Progress
          </button>
        )}
      </div>
    </div>
  );
}