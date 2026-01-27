import { useState } from 'react';

type TabType = 'individual' | 'teams';

interface WeekData {
  week: string;
  completed: number;
  total: number;
  streak: number;
}

interface Badge {
  icon: string;
  name: string;
  description: string;
  earned: boolean;
  date?: string;
}

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<TabType>('individual');

  // Personal History Data
  const weeklyHistory: WeekData[] = [
    { week: 'This Week', completed: 24, total: 35, streak: 7 },
    { week: 'Jan 13-19', completed: 32, total: 35, streak: 6 },
    { week: 'Jan 6-12', completed: 28, total: 35, streak: 5 },
    { week: 'Dec 30-Jan 5', completed: 30, total: 35, streak: 7 },
  ];

  const personalStats = {
    totalHabits: 156,
    currentStreak: 7,
    longestStreak: 15,
    perfectDays: 12,
    averageCompletion: 82,
  };

  const badges: Badge[] = [
    { icon: '🔥', name: 'Week Warrior', description: '7 day streak', earned: true, date: 'Jan 24' },
    { icon: '💧', name: 'Hydration Hero', description: '30 days water', earned: true, date: 'Jan 20' },
    { icon: '🧘', name: 'Mindful Master', description: '14 days mindfulness', earned: true, date: 'Jan 18' },
    { icon: '⭐', name: 'Perfect Week', description: 'All habits 7 days', earned: false },
    { icon: '🏃', name: 'Fitness Fanatic', description: '30 days exercise', earned: false },
    { icon: '🌙', name: 'Sleep Champion', description: '21 days good sleep', earned: false },
  ];

  // Team Data
  const teamStats = [
    { name: 'Engineering', members: 42, activeMembers: 38, completion: 84, avgStreak: 6.2, change: '+3%', isYourTeam: false },
    { name: 'Marketing', members: 28, activeMembers: 24, completion: 76, avgStreak: 5.1, change: '+2%', isYourTeam: true },
    { name: 'Sales', members: 31, activeMembers: 28, completion: 82, avgStreak: 6.8, change: '-1%', isYourTeam: false },
    { name: 'Design', members: 15, activeMembers: 14, completion: 88, avgStreak: 7.3, change: '+5%', isYourTeam: false },
    { name: 'Product', members: 22, activeMembers: 19, completion: 79, avgStreak: 5.5, change: '+1%', isYourTeam: false },
  ];

  const getTabLabel = (tab: TabType) => {
    return tab === 'individual' ? 'Individual' : 'Teams';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-6 font-['SF_Pro_Display','system-ui','-apple-system','BlinkMacSystemFont','Segoe_UI','Roboto','sans-serif']">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[28px] font-semibold text-white tracking-[-0.03em] leading-tight mb-1">
            Progress
          </h1>
          <p className="text-[13px] text-slate-500 font-normal tracking-[-0.01em]">
            {activeTab === 'individual' ? 'Your wellness journey' : 'Team participation'}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800/40 p-1 rounded-xl mb-6 border border-slate-700/30">
          <div className="grid grid-cols-2 gap-1">
            {(['individual', 'teams'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2.5 px-4 rounded-lg text-[13px] font-medium tracking-[-0.01em] transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {getTabLabel(tab)}
              </button>
            ))}
          </div>
        </div>

        {/* AI Summary Card - Contextual Insights */}
        <div className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/40 to-blue-600/40 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">✨</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-semibold text-purple-300 tracking-[-0.01em]">
                  AI Insights
                </span>
                <div className="h-1 w-1 rounded-full bg-purple-400 animate-pulse" />
              </div>
              <p className="text-[15px] text-white/90 font-normal tracking-[-0.01em] leading-relaxed">
                {activeTab === 'individual' 
                  ? `You're on a ${personalStats.currentStreak}-day streak! 🔥 You've completed ${personalStats.totalHabits} habits and maintained ${personalStats.averageCompletion}% average completion. Your consistency is ${personalStats.averageCompletion >= 80 ? 'excellent' : 'improving'} - ${personalStats.perfectDays >= 10 ? 'keep crushing those perfect days!' : 'try for more perfect days this week!'}`
                  : (() => {
                      const yourTeam = teamStats.find(t => t.isYourTeam);
                      if (!yourTeam) return "Your team data is not available.";
                      return `Your Marketing team has ${yourTeam.activeMembers} of ${yourTeam.members} members participating (${Math.round((yourTeam.activeMembers / yourTeam.members) * 100)}%)! 💪 Team completion is at ${yourTeam.completion}% with an average ${yourTeam.avgStreak.toFixed(1)}-day streak. ${yourTeam.completion >= 80 ? 'Outstanding team performance!' : 'Your contributions are making a real impact - keep it up!'}`;
                    })()
                }
              </p>
            </div>
          </div>
        </div>

        {/* INDIVIDUAL TAB - Personal History */}
        {activeTab === 'individual' && (
          <div className="space-y-6">
            {/* Personal Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30">
                <div className="text-[11px] text-purple-300 font-medium tracking-[0.06em] uppercase mb-2">
                  Current Streak
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-[32px] font-semibold text-white tracking-[-0.03em] leading-none">
                    {personalStats.currentStreak}
                  </div>
                  <div className="text-[15px] text-slate-400 font-normal">days</div>
                </div>
                <div className="text-[11px] text-purple-300/70 font-normal mt-1">
                  🔥 Keep it going!
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl p-4 border border-green-500/30">
                <div className="text-[11px] text-green-300 font-medium tracking-[0.06em] uppercase mb-2">
                  Perfect Days
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-[32px] font-semibold text-white tracking-[-0.03em] leading-none">
                    {personalStats.perfectDays}
                  </div>
                  <div className="text-[15px] text-slate-400 font-normal">total</div>
                </div>
                <div className="text-[11px] text-green-300/70 font-normal mt-1">
                  🎉 Amazing work!
                </div>
              </div>
            </div>

            {/* All Time Stats */}
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/20">
              <h3 className="text-[15px] font-semibold text-white tracking-[-0.01em] mb-4">All-Time Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-[22px] font-semibold text-white tracking-[-0.02em] mb-1">
                    {personalStats.totalHabits}
                  </div>
                  <div className="text-[11px] text-slate-500 font-normal">Total Habits</div>
                </div>
                <div className="text-center border-x border-slate-700/30">
                  <div className="text-[22px] font-semibold text-orange-400 tracking-[-0.02em] mb-1">
                    {personalStats.longestStreak}
                  </div>
                  <div className="text-[11px] text-slate-500 font-normal">Longest Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-[22px] font-semibold text-purple-400 tracking-[-0.02em] mb-1">
                    {personalStats.averageCompletion}%
                  </div>
                  <div className="text-[11px] text-slate-500 font-normal">Avg Completion</div>
                </div>
              </div>
            </div>

            {/* Weekly History */}
            <div>
              <h3 className="text-[15px] font-semibold text-white tracking-[-0.01em] mb-3">
                Weekly History
              </h3>
              <div className="space-y-2">
                {weeklyHistory.map((week, index) => {
                  const percentage = Math.round((week.completed / week.total) * 100);
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl rounded-xl p-4 border border-slate-700/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-[15px] font-medium text-white tracking-[-0.01em]">
                            {week.week}
                          </div>
                          <div className="text-[13px] text-slate-400 font-normal">
                            {week.completed} of {week.total} habits
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[22px] font-semibold text-white tracking-[-0.02em]">
                            {percentage}%
                          </div>
                          {week.streak > 0 && (
                            <div className="text-[11px] text-orange-400 font-normal flex items-center justify-end gap-0.5">
                              🔥 {week.streak} days
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            percentage >= 80 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-gradient-to-r from-purple-600 to-blue-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badges */}
            <div>
              <h3 className="text-[15px] font-semibold text-white tracking-[-0.01em] mb-3">
                Your Badges
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {badges.map((badge, index) => (
                  <div
                    key={index}
                    className={`rounded-xl p-3 border transition-all ${
                      badge.earned
                        ? 'bg-gradient-to-br from-yellow-600/20 to-amber-600/20 border-yellow-500/30'
                        : 'bg-slate-800/20 border-slate-700/20 opacity-50'
                    }`}
                  >
                    <div className="text-3xl mb-2 text-center">{badge.icon}</div>
                    <div className="text-[11px] font-medium text-white text-center mb-0.5">
                      {badge.name}
                    </div>
                    <div className="text-[10px] text-slate-400 text-center">
                      {badge.earned ? badge.date : badge.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TEAMS TAB - Highly Engaging */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            {/* Live Activity Feed */}
            <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 backdrop-blur-xl rounded-2xl p-4 border border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold text-white tracking-[-0.01em]">
                  🔥 Happening Now
                </h3>
                <div className="flex items-center gap-1.5 bg-green-500/20 px-2.5 py-1 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[11px] text-green-400 font-semibold tracking-[0.01em]">
                    {teamStats.reduce((sum, t) => sum + t.activeMembers, 0)} ACTIVE
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {[
                  { name: 'Sarah C.', team: 'Engineering', action: 'completed all habits!', time: '1m', avatar: '⭐', special: true },
                  { name: 'Mike J.', team: 'Sales', action: 'hit 10-day streak', time: '3m', avatar: '🔥', special: true },
                  { name: 'You', team: 'Marketing', action: 'logged morning routine', time: '5m', avatar: '✨', isYou: true },
                  { name: 'Priya S.', team: 'Design', action: 'completed meditation', time: '7m', avatar: '🧘' },
                  { name: 'David L.', team: 'Marketing', action: 'logged 8 bottles water', time: '9m', avatar: '💧' },
                  { name: 'Emma W.', team: 'Product', action: 'finished workout', time: '12m', avatar: '🏃' },
                  { name: 'Carlos M.', team: 'Engineering', action: '4hrs deep focus', time: '15m', avatar: '🎯' },
                  { name: 'Aisha K.', team: 'Sales', action: 'logged 7+ hrs sleep', time: '18m', avatar: '🌙' },
                  { name: 'John D.', team: 'Design', action: 'started new streak!', time: '22m', avatar: '✨', special: true },
                  { name: 'Lisa P.', team: 'Marketing', action: 'completed yoga', time: '25m', avatar: '🧘' },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      activity.isYou 
                        ? 'bg-purple-600/20 border border-purple-500/30'
                        : activity.special
                        ? 'bg-yellow-600/10 border border-yellow-500/20'
                        : 'bg-slate-800/30 border border-slate-700/20'
                    } hover:scale-[1.02]`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activity.isYou
                        ? 'bg-gradient-to-br from-purple-600/40 to-blue-600/40 border border-purple-500/40'
                        : 'bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-slate-600/30'
                    }`}>
                      <span className="text-lg">{activity.avatar}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-[14px] font-semibold tracking-[-0.01em] ${
                          activity.isYou ? 'text-purple-300' : 'text-white'
                        }`}>
                          {activity.name}
                        </span>
                        {activity.isYou && (
                          <span className="text-[9px] font-semibold text-purple-400 bg-purple-500/30 px-1.5 py-0.5 rounded">
                            YOU
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">·</span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          {activity.team}
                        </span>
                      </div>
                      <div className="text-[13px] text-slate-300 font-normal">
                        {activity.action}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium flex-shrink-0">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Week Challenge */}
            <div className="bg-gradient-to-br from-orange-600/10 to-amber-600/10 backdrop-blur-xl rounded-2xl p-4 border border-orange-500/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[15px] font-semibold text-white tracking-[-0.01em] mb-0.5">
                    🏆 This Week's Challenge
                  </h3>
                  <p className="text-[13px] text-slate-400 font-normal">
                    First team to 90% wins!
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-orange-400 font-semibold tracking-[0.06em] uppercase mb-0.5">
                    ENDS IN
                  </div>
                  <div className="text-[17px] font-semibold text-white tracking-[-0.01em]">
                    2d 14h
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {teamStats.sort((a, b) => b.completion - a.completion).slice(0, 3).map((team, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 text-center">
                      <span className="text-[15px]">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[13px] font-medium tracking-[-0.01em] ${
                          team.isYourTeam ? 'text-purple-300' : 'text-white'
                        }`}>
                          {team.name}
                        </span>
                        <span className="text-[15px] font-semibold text-white">
                          {team.completion}%
                        </span>
                      </div>
                      <div className="h-1 bg-slate-800/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                          style={{ width: `${team.completion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Cards */}
            <div>
              <h3 className="text-[15px] font-semibold text-white tracking-[-0.01em] mb-3">
                All Teams
              </h3>
              <div className="space-y-3">
                {teamStats.map((team, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl rounded-2xl p-4 border transition-all ${
                      team.isYourTeam
                        ? 'border-purple-500/50 bg-purple-600/10 ring-2 ring-purple-500/30'
                        : 'border-slate-700/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30 flex items-center justify-center">
                          <span className="text-xl">👥</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[17px] font-semibold text-white tracking-[-0.01em]">
                              {team.name}
                            </span>
                            {team.isYourTeam && (
                              <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded tracking-[0.02em]">
                                YOUR TEAM
                              </span>
                            )}
                          </div>
                          <div className="text-[13px] text-slate-400 font-normal">
                            {team.activeMembers}/{team.members} active · {team.change} this week
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[28px] font-semibold text-white tracking-[-0.03em] leading-none">
                          {team.completion}%
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">completion</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20">
                        <span className="text-sm">🔥</span>
                        <span className="text-[13px] text-orange-400 font-medium">{team.avgStreak.toFixed(1)}</span>
                        <span className="text-[11px] text-orange-400/70 font-normal">avg</span>
                      </div>
                      <div className="text-[13px] text-slate-400 font-normal">
                        {Math.round((team.activeMembers / team.members) * 100)}% participation
                      </div>
                    </div>

                    <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          team.completion >= 80
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600'
                        }`}
                        style={{ width: `${team.completion}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}