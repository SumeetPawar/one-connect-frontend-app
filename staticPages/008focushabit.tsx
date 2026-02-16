'use client';

import React, { useState, useEffect, useRef } from 'react';

type SessionType = 'work' | 'break' | 'longBreak';

interface PomodoroSession {
  id: string;
  type: SessionType;
  duration: number;
  completedAt: Date;
}

interface TimerState {
  minutes: number;
  seconds: number;
  isActive: boolean;
  sessionType: SessionType;
  sessionsCompleted: number;
}

const PomodoroHabit: React.FC = () => {
  const [timerState, setTimerState] = useState<TimerState>({
    minutes: 25,
    seconds: 0,
    isActive: false,
    sessionType: 'work',
    sessionsCompleted: 0,
  });

  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [settings, setSettings] = useState({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoAdvance: true,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('pomodoroSessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed.map((s: any) => ({ ...s, completedAt: new Date(s.completedAt) })));
    }

    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }, [settings]);

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerState.isActive) {
      interval = setInterval(() => {
        setTimerState((prev) => {
          if (prev.seconds === 0) {
            if (prev.minutes === 0) {
              // Timer completed
              handleSessionComplete();
              return prev;
            }
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          }
          return { ...prev, seconds: prev.seconds - 1 };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isActive]);

  const handleSessionComplete = () => {
    // Play completion sound
    if (audioRef.current) {
      audioRef.current.play();
    }

    // Vibrate on completion (200ms, pause 100ms, 200ms pattern)
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // Show celebration
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);

    const newSession: PomodoroSession = {
      id: Date.now().toString(),
      type: timerState.sessionType,
      duration: timerState.sessionType === 'work' ? settings.workDuration : 
                timerState.sessionType === 'break' ? settings.breakDuration : 
                settings.longBreakDuration,
      completedAt: new Date(),
    };

    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    localStorage.setItem('pomodoroSessions', JSON.stringify(updatedSessions));

    // Move to next session type
    if (timerState.sessionType === 'work') {
      const newSessionsCompleted = timerState.sessionsCompleted + 1;
      const isLongBreak = newSessionsCompleted % settings.sessionsUntilLongBreak === 0;
      
      setTimerState({
        minutes: isLongBreak ? settings.longBreakDuration : settings.breakDuration,
        seconds: 0,
        isActive: settings.autoAdvance,
        sessionType: isLongBreak ? 'longBreak' : 'break',
        sessionsCompleted: newSessionsCompleted,
      });
    } else {
      setTimerState({
        minutes: settings.workDuration,
        seconds: 0,
        isActive: settings.autoAdvance,
        sessionType: 'work',
        sessionsCompleted: timerState.sessionsCompleted,
      });
    }
  };

  const toggleTimer = () => {
    // Light vibration feedback for button press (50ms)
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    setTimerState((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const resetTimer = () => {
    const duration = timerState.sessionType === 'work' ? settings.workDuration :
                     timerState.sessionType === 'break' ? settings.breakDuration :
                     settings.longBreakDuration;
    
    setTimerState((prev) => ({
      ...prev,
      minutes: duration,
      seconds: 0,
      isActive: false,
    }));
    setShowResetConfirm(false);
  };

  const handleResetClick = () => {
    const initialDuration = timerState.sessionType === 'work' ? settings.workDuration :
                           timerState.sessionType === 'break' ? settings.breakDuration :
                           settings.longBreakDuration;
    
    if (timerState.isActive || timerState.minutes !== initialDuration || timerState.seconds !== 0) {
      setShowResetConfirm(true);
    } else {
      resetTimer();
    }
  };

  const exportData = () => {
    const exportObj = {
      sessions: sessions,
      settings: settings,
      exportDate: new Date().toISOString(),
      totalSessions: sessions.length,
      totalMinutes: sessions.filter(s => s.type === 'work').reduce((acc, s) => acc + s.duration, 0),
    };

    const dataStr = JSON.stringify(exportObj, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pomodoro-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const skipSession = () => {
    setTimerState((prev) => ({ ...prev, isActive: false }));
    handleSessionComplete();
  };

  const changeSessionType = (type: SessionType) => {
    const duration = type === 'work' ? settings.workDuration :
                     type === 'break' ? settings.breakDuration :
                     settings.longBreakDuration;
    
    setTimerState({
      minutes: duration,
      seconds: 0,
      isActive: false,
      sessionType: type,
      sessionsCompleted: timerState.sessionsCompleted,
    });
  };

  // Statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaySessions = sessions.filter(s => {
    const sessionDate = new Date(s.completedAt);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime() && s.type === 'work';
  });

  const thisWeekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.completedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo && s.type === 'work';
  });

  const lastWeekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.completedAt);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= twoWeeksAgo && sessionDate < weekAgo && s.type === 'work';
  });

  const weeklyComparison = lastWeekSessions.length > 0 
    ? Math.round(((thisWeekSessions.length - lastWeekSessions.length) / lastWeekSessions.length) * 100)
    : 0;

  const totalMinutes = sessions
    .filter(s => s.type === 'work')
    .reduce((acc, s) => acc + s.duration, 0);

  const getCurrentStreak = () => {
    if (sessions.length === 0) return 0;
    
    let streak = 0;
    const sortedSessions = [...sessions]
      .filter(s => s.type === 'work')
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const hasSession = sortedSessions.some(s => {
        const sessionDate = new Date(s.completedAt);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === currentDate.getTime();
      });
      
      if (hasSession) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionColor = (type: SessionType) => {
    switch (type) {
      case 'work': return 'from-purple-500/20 to-violet-500/20 border-purple-500/30';
      case 'break': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'longBreak': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
    }
  };

  const getProgressPercentage = () => {
    const totalSeconds = timerState.sessionType === 'work' ? settings.workDuration * 60 :
                         timerState.sessionType === 'break' ? settings.breakDuration * 60 :
                         settings.longBreakDuration * 60;
    const currentSeconds = timerState.minutes * 60 + timerState.seconds;
    return ((totalSeconds - currentSeconds) / totalSeconds) * 100;
  };

  return (
    <div className="min-h-screen text-white overflow-hidden" style={{ backgroundColor: '#141414' }}>
      {/* Confetti Animation Styles */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
      
      {/* Audio element */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZQAEYN6Hn9a9iFhBCnOH2tmYdBDSN1PLUdjQHImm+7+iZQAwVX7Tp76lWFApFnuH1vmwhBDOG0fPSgjMGHm7A7uOZQAMYNqHm9K9iFw9BnOD1tmUdAzOL1PHUdjQHIme97+eZPwwVXrTp76hWEwlGnuH1vWshBDKG0fPSgjIGHmy/7eKZQAMXNZ/m86xiFA9BnN/0tWQdAzOK0/DUdTMHIme97+WZPgsVXbPo7qdXEglFnd/0vGohAzCFz/LRgTIFHmu/7eGYPwMXNJ7l8qtgFA5Am970tWQcAzKK0u/TdTMGIWW87uSYPQoUW7Ln7aZWEQdFnN7zu2kgAzCFzu/QgDEFHWq+7N+XPgIWM57k8aleFQw/m9zzs2IdAjGJz+7QczEFIGS56+OWPAkSWLDm6qVUEAZEmNzxumceAjCEze7QfjAFGmm96d2VOwEUMpzj8KdcFgo+mtvxtl8cAS+Gzu3PcTAEHmO36+GUOQgPVKzkp5JTEA==" />

      {showHistory ? (
        /* ========== HISTORY PAGE ========== */
        <div className="min-h-screen">
          {/* History Header with Back Button */}
          <div className="px-5 py-4 flex items-center gap-3 border-b border-zinc-800/50">
            <button
              onClick={() => setShowHistory(false)}
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-95 transition-transform"
            >
              <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold">History</h1>
              <p className="text-sm text-zinc-400">Your focus journey</p>
            </div>
          </div>

          {/* History Content */}
          <div className="px-5 pb-20">
            {/* Overall Stats */}
            <div className="mt-6 mb-6">
              <h2 className="text-xs text-zinc-400 uppercase tracking-wider mb-3 font-semibold">Overview</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-900 border border-zinc-700/30 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{sessions.length}</div>
                  <div className="text-xs text-zinc-400 uppercase tracking-wider">Total Sessions</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-700/30 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{Math.round(totalMinutes / 60)}</div>
                  <div className="text-xs text-zinc-400 uppercase tracking-wider">Total Hours</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-700/30 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{getCurrentStreak()}</div>
                  <div className="text-xs text-zinc-400 uppercase tracking-wider">Day Streak</div>
                </div>
              </div>
            </div>

            {/* Weekly Breakdown */}
            <div className="mb-6">
              <h2 className="text-xs text-zinc-400 uppercase tracking-wider mb-3 font-semibold">Last 7 Days</h2>
              <div className="bg-zinc-900 border border-zinc-700/30 rounded-2xl p-4">
                <div className="space-y-3">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);
                    
                    const daySessions = sessions.filter(s => {
                      const sessionDate = new Date(s.completedAt);
                      sessionDate.setHours(0, 0, 0, 0);
                      return sessionDate.getTime() === date.getTime() && s.type === 'work';
                    });

                    const maxSessions = 12;
                    const percentage = Math.min((daySessions.length / maxSessions) * 100, 100);

                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-16 text-xs text-zinc-400 font-medium">
                          {i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-600 to-purple-500 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-20 text-right">
                          <span className="text-sm font-semibold">{daySessions.length}</span>
                          <span className="text-xs text-zinc-400 ml-1">sessions</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* All Sessions List */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">All Sessions ({sessions.length})</h2>
                {sessions.length > 0 && (
                  <button 
                    onClick={() => setShowExportMenu(true)}
                    className="text-xs text-purple-400 font-medium"
                  >
                    Export
                  </button>
                )}
              </div>
              
              {sessions.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-700/30 rounded-2xl p-8 text-center">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-zinc-400 text-sm">No sessions yet</p>
                  <p className="text-zinc-400 text-xs mt-1">Start a focus session to see your history</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions
                    .slice()
                    .reverse()
                    .map((session) => {
                      const sessionDate = new Date(session.completedAt);
                      const isToday = sessionDate.toDateString() === new Date().toDateString();
                      const isYesterday = sessionDate.toDateString() === new Date(Date.now() - 86400000).toDateString();
                      
                      return (
                        <div
                          key={session.id}
                          className="bg-zinc-900 border border-zinc-700/20 rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                session.type === 'work' ? 'bg-purple-500/10' :
                                session.type === 'break' ? 'bg-blue-500/10' :
                                'bg-emerald-500/10'
                              }`}>
                                {session.type === 'work' ? '🎯' : session.type === 'break' ? '☕' : '🧘'}
                              </div>
                              <div>
                                <div className="text-sm font-semibold">
                                  {session.type === 'work' ? 'Focus Session' :
                                   session.type === 'break' ? 'Short Break' :
                                   'Long Break'}
                                </div>
                                <div className="text-xs text-zinc-400">
                                  {session.duration} minutes
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-zinc-400">
                                {isToday ? 'Today' : isYesterday ? 'Yesterday' : sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                              <div className="text-xs text-zinc-400 tabular-nums">
                                {sessionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ========== FOCUS PAGE (MAIN) ========== */
        <div>
      {/* Compact Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Focus</h1>
          <p className="text-sm text-zinc-400 mt-1">Pomodoro Timer</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="w-9 h-9 rounded-full bg-zinc-900 backdrop-blur-xl border border-zinc-700/30 flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => setShowInfo(true)}
            className="w-9 h-9 rounded-full bg-zinc-900 backdrop-blur-xl border border-zinc-700/30 flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-9 h-9 rounded-full bg-zinc-900 backdrop-blur-xl border border-zinc-700/30 flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-950 backdrop-blur-2xl border border-zinc-700/30 rounded-3xl w-full max-w-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-700/30">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Timer Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm text-zinc-300 mb-2 block">Focus Duration (minutes)</label>
                <input
                  type="number"
                  value={settings.workDuration}
                  onChange={(e) => setSettings({ ...settings, workDuration: parseInt(e.target.value) || 25 })}
                  className="w-full bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300 mb-2 block">Short Break (minutes)</label>
                <input
                  type="number"
                  value={settings.breakDuration}
                  onChange={(e) => setSettings({ ...settings, breakDuration: parseInt(e.target.value) || 5 })}
                  className="w-full bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                  min="1"
                  max="30"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300 mb-2 block">Long Break (minutes)</label>
                <input
                  type="number"
                  value={settings.longBreakDuration}
                  onChange={(e) => setSettings({ ...settings, longBreakDuration: parseInt(e.target.value) || 15 })}
                  className="w-full bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-300 mb-2 block">Sessions until long break</label>
                <input
                  type="number"
                  value={settings.sessionsUntilLongBreak}
                  onChange={(e) => setSettings({ ...settings, sessionsUntilLongBreak: parseInt(e.target.value) || 4 })}
                  className="w-full bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                  min="2"
                  max="10"
                />
              </div>
              <div>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-sm text-white font-medium">Auto-advance sessions</div>
                    <div className="text-xs text-zinc-300 mt-0.5">Automatically start next session</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, autoAdvance: !settings.autoAdvance })}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      settings.autoAdvance ? 'bg-purple-500' : 'bg-zinc-700'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.autoAdvance ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </label>
              </div>
              <div className="pt-2 border-t border-zinc-700/30">
                <button
                  type="button"
                  onClick={() => setShowExportMenu(true)}
                  className="w-full bg-zinc-800 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 backdrop-blur-2xl border border-zinc-700/30 rounded-3xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">Reset Timer?</h3>
              <p className="text-sm text-zinc-300 mb-6">
                Reset timer to {formatTime(
                  timerState.sessionType === 'work' ? settings.workDuration :
                  timerState.sessionType === 'break' ? settings.breakDuration :
                  settings.longBreakDuration, 0
                )}? Current progress will be lost.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-800 rounded-xl py-3 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={resetTimer}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 rounded-xl py-3 text-sm font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Menu */}
      {showExportMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 backdrop-blur-2xl border border-zinc-700/30 rounded-3xl w-full max-w-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-700/30">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Export Data</h2>
                <button
                  onClick={() => setShowExportMenu(false)}
                  className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-4 p-4 bg-zinc-800 rounded-xl border border-zinc-700/30">
                <div className="text-sm text-zinc-300 mb-2">Export includes:</div>
                <ul className="text-xs text-zinc-300 space-y-1">
                  <li>• {sessions.length} total sessions</li>
                  <li>• {Math.round(totalMinutes / 60)} hours of focus time</li>
                  <li>• All settings and preferences</li>
                  <li>• Complete session history</li>
                </ul>
              </div>
              <button
                onClick={exportData}
                className="w-full bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-xl py-3 font-semibold text-sm shadow-lg shadow-purple-500/20 active:scale-98 transition-transform flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Bottom Sheet - slides from bottom */}
      {showInfo && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setShowInfo(false)}
          />
          
          {/* Bottom Sheet */}
          <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-zinc-950 border-t border-zinc-800/50 rounded-t-[32px] shadow-2xl max-h-[85vh] flex flex-col">
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
                <div className="w-10 h-1 bg-zinc-700 rounded-full"></div>
              </div>

              {/* Header - compact */}
              <div className="px-5 pb-3 flex items-center gap-3 flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold tracking-tight">Pomodoro Focus</h2>
                  <p className="text-[13px] text-zinc-400">How it works</p>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center active:scale-95 transition-transform flex-shrink-0"
                >
                  <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="px-5 pb-6 space-y-4 overflow-y-auto flex-1">
                {/* How It Works */}
                <div>
                  <div className="space-y-2.5">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-500 font-semibold text-[13px]">1</span>
                      </div>
                      <p className="text-[14px] text-white leading-relaxed pt-1">Choose a task and focus for 25 minutes</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-500 font-semibold text-[13px]">2</span>
                      </div>
                      <p className="text-[14px] text-white leading-relaxed pt-1">Take a 5-minute break to recharge</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-500 font-semibold text-[13px]">3</span>
                      </div>
                      <p className="text-[14px] text-white leading-relaxed pt-1">After 4 sessions, enjoy a 15-minute rest</p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>

                {/* Benefits - compact 2x2 grid */}
                <div>
                  <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Benefits</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <h4 className="text-[13px] font-semibold">Better Focus</h4>
                      </div>
                      <p className="text-[11px] text-zinc-400">No distractions</p>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <h4 className="text-[13px] font-semibold">More Energy</h4>
                      </div>
                      <p className="text-[11px] text-zinc-400">Prevent burnout</p>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="text-[13px] font-semibold">Track Progress</h4>
                      </div>
                      <p className="text-[11px] text-zinc-400">See results</p>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <h4 className="text-[13px] font-semibold">Build Habits</h4>
                      </div>
                      <p className="text-[11px] text-zinc-400">Stay consistent</p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>

                {/* Quick Tips - ultra compact */}
                <div>
                  <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">Tips</h3>
                  <div className="space-y-1.5">
                    <div className="flex gap-2 items-start">
                      <div className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                      <p className="text-[13px] text-zinc-300">Silence notifications first</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                      <p className="text-[13px] text-zinc-300">Stretch during breaks</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                      <p className="text-[13px] text-zinc-300">Customize to your rhythm</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => setShowInfo(false)}
                  className="w-full bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-xl py-3 font-semibold text-[14px] shadow-lg shadow-purple-500/20 active:scale-98 transition-transform mt-2"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="px-5 pb-20">
        {/* Timer Status Indicator */}
        {timerState.isActive && (
          <div className="mb-4 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
            <span className="text-[13px] text-purple-400 font-medium">Timer Running</span>
          </div>
        )}

        {/* Session Type Selector */}
        <div className="mb-6">
          <div className="bg-zinc-900 backdrop-blur-xl border border-zinc-700/30 rounded-2xl p-1.5 flex gap-1">
            <button
              onClick={() => changeSessionType('work')}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                timerState.sessionType === 'work'
                  ? 'bg-gradient-to-br from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/20'
                  : 'text-zinc-300 active:bg-zinc-800'
              }`}
            >
              Focus
            </button>
            <button
              onClick={() => changeSessionType('break')}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                timerState.sessionType === 'break'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'text-zinc-300 active:bg-zinc-800'
              }`}
            >
              Break
            </button>
            <button
              onClick={() => changeSessionType('longBreak')}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                timerState.sessionType === 'longBreak'
                  ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-zinc-300 active:bg-zinc-800'
              }`}
            >
              Long Break
            </button>
          </div>
        </div>

        {/* Main Timer Display */}
        <div className={`relative mb-6 rounded-3xl overflow-hidden ${
          timerState.sessionType === 'work' ? 'bg-gradient-to-br from-purple-950/30 via-neutral-900 to-neutral-950' :
          timerState.sessionType === 'break' ? 'bg-gradient-to-br from-blue-950/30 via-neutral-900 to-neutral-950' :
          'bg-gradient-to-br from-emerald-950/30 via-neutral-900 to-neutral-950'
        } backdrop-blur-xl border border-zinc-800/20`}>
          <div className="p-8">
            {/* Progress Ring */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              <svg className="w-full h-full -rotate-90">
                {/* Background circle */}
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-zinc-800/30"
                />
                {/* Progress circle */}
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ${
                    timerState.sessionType === 'work' ? 'text-purple-500' :
                    timerState.sessionType === 'break' ? 'text-blue-500' :
                    'text-emerald-500'
                  }`}
                  style={{
                    strokeDasharray: `${2 * Math.PI * 120}`,
                    strokeDashoffset: `${2 * Math.PI * 120 * (1 - getProgressPercentage() / 100)}`,
                  }}
                />
              </svg>
              {/* Timer text in center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-7xl font-semibold tracking-tight tabular-nums">
                  {formatTime(timerState.minutes, timerState.seconds)}
                </div>
                <div className="text-sm text-zinc-400 mt-3 tracking-wider uppercase font-medium">
                  {timerState.sessionType === 'work' ? 'Focus Time' :
                   timerState.sessionType === 'break' ? 'Short Break' :
                   'Long Break'}
                </div>
                {/* Dynamic Motivation */}
                {timerState.isActive && (
                  <div className="mt-2 text-base font-medium text-zinc-300">
                    {timerState.minutes >= 20 ? "💪 Stay focused" :
                     timerState.minutes >= 15 ? "🔥 Great progress" :
                     timerState.minutes >= 10 ? "⚡ Halfway there" :
                     timerState.minutes >= 5 ? "🎯 Final push" :
                     timerState.minutes >= 1 ? "💫 Almost done" :
                     "🌟 Seconds left!"}
                  </div>
                )}
              </div>
            </div>

            {/* Session Progress */}
            <div className="mb-6">
              <div className="text-xs text-zinc-400 uppercase tracking-wider text-center mb-2 font-medium">
                Session {(timerState.sessionsCompleted % settings.sessionsUntilLongBreak) + 1} of {settings.sessionsUntilLongBreak}
              </div>
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: settings.sessionsUntilLongBreak }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i < (timerState.sessionsCompleted % settings.sessionsUntilLongBreak)
                        ? 'bg-purple-500 scale-110'
                        : 'bg-zinc-700/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={toggleTimer}
                className={`flex-1 py-4 rounded-2xl font-semibold text-base transition-all active:scale-98 ${
                  timerState.sessionType === 'work' 
                    ? 'bg-gradient-to-br from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/25' 
                    : timerState.sessionType === 'break'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                }`}
              >
                {timerState.isActive ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={handleResetClick}
                className="w-16 h-16 rounded-2xl bg-zinc-800 backdrop-blur-xl border border-zinc-700/50 flex items-center justify-center active:scale-95 transition-all"
                aria-label="Reset timer"
              >
                <svg className="w-6 h-6 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Next Up Preview */}
            {!timerState.isActive && (
              <div className="text-center py-3 bg-zinc-900/30 rounded-xl border border-zinc-800/30">
                <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1 font-medium">Next Up</div>
                <div className="text-sm font-semibold">
                  {timerState.sessionType === 'work' ? (
                    (timerState.sessionsCompleted + 1) % settings.sessionsUntilLongBreak === 0 
                      ? `🧘 ${settings.longBreakDuration} min Long Break`
                      : `☕ ${settings.breakDuration} min Break`
                  ) : (
                    `🎯 ${settings.workDuration} min Focus Session`
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid - Simplified */}
        <div className="mb-6">
          {/* Primary Stat - Today */}
          <div className="bg-zinc-900 backdrop-blur-xl border border-zinc-700/30 rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold tabular-nums mb-1">{todaySessions.length}</div>
                <div className="text-sm text-zinc-400 font-medium">Sessions Today</div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900 backdrop-blur-xl border border-zinc-700/30 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-xl">
                  {getCurrentStreak() >= 30 ? '🔥🔥🔥' :
                   getCurrentStreak() >= 14 ? '🔥🔥' :
                   getCurrentStreak() >= 7 ? '🔥' :
                   getCurrentStreak() >= 3 ? '⭐' : '💪'}
                </div>
                <div className="text-2xl font-bold tabular-nums">{getCurrentStreak()}</div>
              </div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                {getCurrentStreak() >= 30 ? 'ON FIRE!' :
                 getCurrentStreak() >= 14 ? 'Hot Streak' :
                 getCurrentStreak() >= 7 ? 'Week Streak' :
                 'Day Streak'}
              </div>
            </div>

            <div className="bg-zinc-900 backdrop-blur-xl border border-zinc-700/30 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-2xl font-bold tabular-nums">{Math.round(totalMinutes / 60)}h</div>
              </div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Total Time</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {sessions.length > 0 ? (
          <div>
            <h2 className="text-xs text-zinc-400 uppercase tracking-wider mb-3 px-1 font-semibold">Recent Activity</h2>
            <div className="space-y-2">
              {sessions
                .slice(-8)
                .reverse()
                .map((session, index) => (
                  <div
                    key={session.id}
                    className="bg-zinc-900 backdrop-blur-xl border border-zinc-700/20 rounded-xl p-3 flex items-center justify-between"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-8 rounded-full ${
                        session.type === 'work' ? 'bg-purple-500' :
                        session.type === 'break' ? 'bg-blue-500' :
                        'bg-emerald-500'
                      }`} />
                      <div>
                        <div className="text-[13px] font-medium">
                          {session.type === 'work' ? 'Focus Session' :
                           session.type === 'break' ? 'Short Break' :
                           'Long Break'}
                        </div>
                        <div className="text-[11px] text-zinc-400 tabular-nums">
                          {session.duration} min
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-zinc-400 tabular-nums">
                      {new Date(session.completedAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Ready to Focus?</h3>
            <p className="text-[14px] text-zinc-400 mb-4 max-w-xs mx-auto">
              Start your first Pomodoro session and build a consistent focus habit
            </p>
            <button
              onClick={toggleTimer}
              className="bg-gradient-to-br from-purple-600 to-purple-500 text-white px-6 py-2.5 rounded-xl font-medium text-[14px] shadow-lg shadow-purple-500/20 active:scale-98 transition-transform"
            >
              Start First Session
            </button>
          </div>
        )}
      </div>
      </div>
      )}

      {/* Celebration Overlay with Confetti */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          {/* Confetti particles */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10%',
                  backgroundColor: ['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'][Math.floor(Math.random() * 5)],
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 1}s`,
                }}
              />
            ))}
          </div>
          
          {/* Success Message */}
          <div className="text-center animate-in fade-in zoom-in duration-300 relative z-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-purple-500/50">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Session Complete!
            </div>
            <div className="text-lg text-zinc-300">
              {timerState.sessionType === 'work' ? 'Great focus! Time to recharge ✨' : 'Ready for another session? 🚀'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroHabit;