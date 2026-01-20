'use client';

import { useState, useMemo } from 'react';

// Helper functions
function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function formatNumber(n: number): string {
  return Number(n || 0).toLocaleString('en-US');
}

function buildAiSummary(steps: number, goal: number, hasSteps: boolean): string {
  // After adding steps, show creative comparisons
  const stepComparisons = [
    { steps: 2000, text: '🗼 You walked the height of the Eiffel Tower!' },
    { steps: 5000, text: '🏟️ You walked around a football field 10 times!' },
    { steps: 7500, text: '🌉 You walked the length of the Golden Gate Bridge!' },
    { steps: 10000, text: '🏔️ You walked up a small mountain today!' },
    { steps: 12000, text: '✈️ You walked the length of 2 jumbo jets!' },
    { steps: 15000, text: '🏃 You completed a half marathon distance!' },
    { steps: 20000, text: '🌍 You walked 10 miles - amazing achievement!' }
  ];

  if (!hasSteps || steps === 0) {
    return '';
  }

  // Show comparison based on steps
  for (let i = stepComparisons.length - 1; i >= 0; i--) {
    if (steps >= stepComparisons[i].steps) {
      return stepComparisons[i].text;
    }
  }

  return `🚀 You have taken ${steps.toLocaleString()} steps! Keep going!`;
}

function getSwipeablePages(): { title: string; content: string }[] {
  // Get day of week (0-6) for daily rotation
  const dayOfWeek = new Date().getDay();
  
  const funFacts = [
    '💡 Walking 10,000 steps burns about 400-500 calories!',
    '🦴 Walking strengthens your bones and improves balance.',
    '❤️ Just 30 minutes of walking can reduce heart disease risk by 35%.',
    '🧠 Walking boosts creativity by up to 60%!',
    '😊 A 15-minute walk can reduce sugar cravings.',
    '🌙 Regular walking improves sleep quality significantly.',
    '💪 Walking tones your legs, abs, and arms naturally.'
  ];
  
  const healthTips = [
    '🌿 Take the stairs instead of the elevator whenever possible.',
    '⚡ Walk during phone calls to add extra steps effortlessly.',
    '🎯 Park farther away to increase your daily step count.',
    '🔥 Set hourly reminders to stand up and walk for 2 minutes.',
    '🦵 Walk after meals to aid digestion and control blood sugar.',
    '☀️ Morning walks boost your mood and energy all day.',
    '👟 Invest in comfortable shoes - your feet will thank you!'
  ];
  
  const stepsComparisons = [
    '🗼 10,000 steps = Height of 5 Eiffel Towers stacked!',
    '🏟️ 5,000 steps = Around a standard football field 10 times.',
    '🌉 7,500 steps = Length of the Golden Gate Bridge.',
    '🏔️ 10,000 steps = Climbing a small mountain.',
    '✈️ 12,000 steps = Length of 2 Boeing 747 jets.',
    '🌍 15,000 steps = About 7 miles or 11 kilometers.',
    '🚀 20,000 steps = You are a walking champion today!'
  ];
  
  // Rotate content daily
  const dailyFunFact = funFacts[dayOfWeek % funFacts.length];
  const dailyHealthTip = healthTips[dayOfWeek % healthTips.length];
  const dailyComparison = stepsComparisons[dayOfWeek % stepsComparisons.length];
  
  return [
    { title: 'Fun Fact', content: dailyFunFact },
    { title: 'Health Tip', content: dailyHealthTip },
    { title: 'Did You Know', content: dailyComparison }
  ];
}

interface DayData {
  label: string;
  short: string;
  date: number;
  steps: number;
  done: boolean;
  today?: boolean;
}

export default function StepsTracker() {
  const goalToday = 10000;
  const goalWeek = goalToday * 7;

  const [stepsToday, setStepsToday] = useState(7890);
  const [stepsWeek, setStepsWeek] = useState(38450);
  const [hasAddedSteps, setHasAddedSteps] = useState(false); // Start false to show swipeable pages
  
  const [viewSteps, setViewSteps] = useState(7890);
  const [viewLabel, setViewLabel] = useState('Today');
  const [selectedLabel, setSelectedLabel] = useState('Thu');

  const [aiSummary, setAiSummary] = useState(buildAiSummary(7890, goalToday, false));
  const [logOpen, setLogOpen] = useState(false);
  const [inputSteps, setInputSteps] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Swipe functionality for health facts (3 pages)
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const swipeablePages = getSwipeablePages();

  const date = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const weekDays: DayData[] = useMemo(() => {
    return [
      { label: 'Mon', short: 'Mon', date: 13, steps: 8234, done: false },
      { label: 'Tue', short: 'Tue', date: 14, steps: 9876, done: false },
      { label: 'Wed', short: 'Wed', date: 15, steps: 12450, done: true },
      { label: 'Thu', short: 'Thu', date: 16, steps: stepsToday, done: stepsToday >= goalToday, today: true },
      { label: 'Fri', short: 'Fri', date: 17, steps: 0, done: false },
      { label: 'Sat', short: 'Sat', date: 18, steps: 0, done: false },
      { label: 'Sun', short: 'Sun', date: 19, steps: 0, done: false },
    ];
  }, [stepsToday, goalToday]);

  const streak = useMemo(() => {
    const idx = weekDays.findIndex(d => d.today);
    if (idx < 0 || !weekDays[idx].done) return 0;
    let s = 0;
    for (let i = idx; i >= 0; i--) {
      if (weekDays[i].done) s += 1;
      else break;
    }
    return s;
  }, [weekDays]);

  const remainingToday = Math.max(goalToday - viewSteps, 0);

  const onSelectDay = (day: DayData) => {
    setSelectedLabel(day.label);
    setViewSteps(day.steps);
    setViewLabel(day.today ? 'Today' : day.label);
    setAiSummary(buildAiSummary(day.steps, goalToday, day.steps > 0));
    setCurrentPageIndex(0); // Reset to first page when changing days
  };

  const onAddSteps = () => {
    const n = Number(inputSteps);
    if (!Number.isFinite(n) || n <= 0) return;

    const add = Math.floor(n);
    const nextToday = stepsToday + add;
    const nextWeek = stepsWeek + add;

    setStepsToday(nextToday);
    setStepsWeek(nextWeek);
    setHasAddedSteps(true);

    if (viewLabel === 'Today') {
      setViewSteps(nextToday);
      setAiSummary(buildAiSummary(nextToday, goalToday, true));
    }

    setInputSteps('');
    setLogOpen(false);
  };

  const weekProgress = (stepsWeek / goalWeek) * 100;
  const dayProgress = (viewSteps / goalToday) * 100;

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 30;
    const isRightSwipe = distance < -30;

    if (isLeftSwipe && currentPageIndex < allPages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
    if (isRightSwipe && currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const currentPage = swipeablePages[currentPageIndex];
  
  // Create pages array - add achievement as FIRST page if viewing day with steps
  const hasSteps = viewSteps > 0;
  const allPages = hasSteps 
    ? [{ title: 'Your Achievement', content: buildAiSummary(viewSteps, goalToday, true) }, ...swipeablePages]
    : swipeablePages;
  
  const displayedTitle = allPages[currentPageIndex]?.title || currentPage.title;
  const displayedContent = allPages[currentPageIndex]?.content || currentPage.content;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafbfc',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 58, 237, 0.04), transparent)',
      padding: '16px'
    }}>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative'
        }}>
          <div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '4px'
            }}>
              Steps
            </h1>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '600',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              S
            </div>

            {/* Dropdown Menu */}
            {profileOpen && (
              <>
                {/* Backdrop */}
                <div
                  onClick={() => setProfileOpen(false)}
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 999
                  }}
                />
                
                {/* Dropdown */}
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  right: '0',
                  width: '280px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                  zIndex: 1000,
                  animation: 'dropdownIn 0.2s ease',
                  overflow: 'hidden'
                }}>
                  {/* Profile Header */}
                  <div style={{
                    padding: '16px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      S
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0f172a',
                        margin: 0,
                        marginBottom: '2px'
                      }}>
                        Sumeet
                      </h3>
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#94a3b8', 
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        sumeet@email.com
                      </p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div style={{ padding: '4px 0' }}>
                    {[
                      { icon: '📊', label: 'My Stats' },
                      { icon: '🎯', label: 'Set Goals' },
                      { icon: '⚙️', label: 'Settings' },
                      { icon: '🔔', label: 'Notifications' },
                      { icon: '🎨', label: 'Appearance' },
                      { icon: '❓', label: 'Help & Support' }
                    ].map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          console.log(item.label);
                          setProfileOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                          fontSize: '14px',
                          color: '#0f172a',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: '16px' }}>{item.icon}</span>
                        <span style={{ fontWeight: '500' }}>{item.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Log Out */}
                  <div style={{
                    padding: '4px 0',
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    <button
                      onClick={() => {
                        console.log('Log Out');
                        setProfileOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        fontSize: '14px',
                        color: '#ef4444',
                        fontWeight: '600',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ fontSize: '16px' }}>🚪</span>
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Week Ticks */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingLeft: '4px', paddingRight: '4px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>This Week</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>🔥 {streak} day streak</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {weekDays.map((day) => {
              const isSelected = selectedLabel === day.label;
              const isToday = day.today === true;

              return (
                <div key={day.label} style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => onSelectDay(day)}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: day.done
                        ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                        : '#ffffff',
                      border: isSelected ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                      color: day.done ? '#ffffff' : '#94a3b8',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: day.done ? '0 4px 12px rgba(124, 58, 237, 0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
                      position: 'relative',
                      margin: '0 auto'
                    }}
                  >
                    {day.done ? '✓' : day.date}
                    {isToday && (
                      <div style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#10b981',
                        border: '2px solid #fafbfc'
                      }} />
                    )}
                  </button>
                  <p style={{
                    fontSize: '9px',
                    color: isToday ? '#7c3aed' : '#94a3b8',
                    marginTop: '6px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {day.short}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Ring */}
        <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 20px' }}>
          <svg viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="64"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="11"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="64"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={`${(dayProgress / 100) * 402} 402`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>

          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#0f172a',
              lineHeight: '1'
            }}>
              {formatNumber(viewSteps)}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
              {viewLabel}
            </div>
            <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>
              {Math.round(dayProgress)}% of goal
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
          Goal: {formatNumber(goalToday)} • {formatNumber(remainingToday)} left
        </div>

        {/* Weekly Progress */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Weekly Progress</span>
            <span style={{ fontSize: '12px', color: '#a855f7', fontWeight: '600' }}>
              {Math.round(weekProgress)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e2e8f0',
            borderRadius: '999px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${weekProgress}%`,
              background: 'linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)',
              borderRadius: '999px',
              transition: 'width 0.5s ease'
            }} />
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
            {formatNumber(stepsWeek)} / {formatNumber(goalWeek)} steps
          </div>
        </div>

        {/* Health Tips - Swipeable (3-4 Pages) */}
        <div 
          style={{
            background: 'rgba(124, 58, 237, 0.06)',
            border: '1px solid rgba(124, 58, 237, 0.15)',
            borderRadius: '16px',
            padding: '16px 16px 20px 16px',
            marginBottom: '24px',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div style={{ 
            fontSize: '11px', 
            color: '#94a3b8', 
            marginBottom: '10px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textAlign: 'center'
          }}>
            {displayedTitle}
          </div>
          <p style={{ 
            fontSize: '14px', 
            color: '#6d28d9', 
            lineHeight: '1.6', 
            fontWeight: '500', 
            margin: '0 0 14px 0', 
            textAlign: 'center',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {displayedContent}
          </p>
          
          {/* Pagination dots - 3 or 4 dots depending on if there are steps */}
          <div style={{ 
            display: 'flex', 
            gap: '6px', 
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {allPages.map((page, index) => (
              <button
                key={index}
                onClick={() => setCurrentPageIndex(index)}
                style={{
                  width: index === currentPageIndex ? '24px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: index === currentPageIndex ? '#7c3aed' : '#d1d5db',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
                aria-label={`Go to ${page.title}`}
              />
            ))}
          </div>
        </div>

        {/* Add Steps Button */}
        <button
          onClick={() => setLogOpen(true)}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '15px',
            fontWeight: '600',
            color: '#0f172a',
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
            transition: 'all 0.2s ease',
            marginBottom: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.4)';
          }}
        >
          Add Steps
        </button>

        {/* Team Activity Button */}
        <button
          onClick={() => {
            // Navigate to team activity page
            window.location.href = '/team-activity'; // or use Next.js router
          }}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '15px',
            fontWeight: '600',
            color: '#7c3aed',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#7c3aed';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
          }}
        >
          <span>👥</span>
          View Team Activity
        </button>

        {/* Bottom Sheet Modal */}
        {logOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            padding: '20px'
          }}
          onClick={() => setLogOpen(false)}
          >
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '360px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              animation: 'fadeIn 0.2s ease'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '8px'
              }}>
                Add Steps
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
                Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </p>

              <input
                type="number"
                value={inputSteps}
                onChange={(e) => setInputSteps(e.target.value)}
                placeholder="Enter steps"
                inputMode="numeric"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0f172a'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7c3aed';
                  e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={onAddSteps}
                  disabled={!inputSteps.trim()}
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#0f172a',
                    background: inputSteps.trim()
                      ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: inputSteps.trim() ? 'pointer' : 'not-allowed',
                    opacity: inputSteps.trim() ? 1 : 0.5
                  }}
                >
                  Add
                </button>
                <button
                  onClick={() => setLogOpen(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#94a3b8',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Dropdown Menu */}
        {profileOpen && (
          <>
            {/* Backdrop */}
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 999
              }}
              onClick={() => setProfileOpen(false)}
            />
            
            {/* Dropdown */}
            <div style={{
              position: 'absolute',
              top: '70px',
              right: '16px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              width: '280px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              animation: 'dropdownSlide 0.2s ease',
              overflow: 'hidden'
            }}>
              {/* Profile Header */}
              <div style={{
                padding: '16px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  flexShrink: 0
                }}>
                  S
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#0f172a',
                    margin: 0,
                    marginBottom: '2px'
                  }}>
                    Sumeet
                  </h3>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#94a3b8', 
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    sumeet@email.com
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <div style={{ padding: '6px 0' }}>
                {[
                  { icon: '📊', label: 'My Stats' },
                  { icon: '🎯', label: 'Set Goals' },
                  { icon: '⚙️', label: 'Settings' },
                  { icon: '🔔', label: 'Notifications' },
                  { icon: '🎨', label: 'Appearance' },
                  { icon: '❓', label: 'Help & Support' }
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      console.log(item.label);
                      setProfileOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                      fontSize: '14px',
                      color: '#0f172a',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                    <span style={{ fontWeight: '500' }}>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Log Out */}
              <div style={{
                padding: '6px 0',
                borderTop: '1px solid #f1f5f9'
              }}>
                <button
                  onClick={() => {
                    console.log('Log Out');
                    setProfileOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    fontSize: '14px',
                    color: '#ef4444',
                    fontWeight: '600',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '16px' }}>🚪</span>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </>
        )}

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          @keyframes dropdownSlide {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

      </div>
    </div>
  );
}
