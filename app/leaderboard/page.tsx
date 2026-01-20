'use client';

import { useState } from 'react';

interface User {
  id: number;
  name: string;
  steps: number;
  avatar: string;
  activeDays: number;
}

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('week');
  const [showAllUsers, setShowAllUsers] = useState(false);

  // Mock data - intentionally unordered (no ranking)
  const users: User[] = [
    { id: 2, name: 'Sumeet Kumar', steps: 38450, avatar: 'SK', activeDays: 4 },
    { id: 6, name: 'Emma Wilson', steps: 28340, avatar: 'EW', activeDays: 5 },
    { id: 1, name: 'Sarah Chen', steps: 45230, avatar: 'SC', activeDays: 7 },
    { id: 9, name: 'Tom Anderson', steps: 22340, avatar: 'TA', activeDays: 4 },
    { id: 4, name: 'Maria Garcia', steps: 32100, avatar: 'MG', activeDays: 5 },
    { id: 7, name: 'James Brown', steps: 26790, avatar: 'JB', activeDays: 6 },
    { id: 3, name: 'Alex Johnson', steps: 35780, avatar: 'AJ', activeDays: 7 },
    { id: 10, name: 'Nina Patel', steps: 20180, avatar: 'NP', activeDays: 4 },
    { id: 5, name: 'David Lee', steps: 29850, avatar: 'DL', activeDays: 6 },
    { id: 8, name: 'Lisa Wang', steps: 24560, avatar: 'LW', activeDays: 5 },
  ];

  const currentUserId = 2;
  const weeklyGoal = 40000;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafbfc',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 58, 237, 0.04), transparent)',
      padding: '16px'
    }}>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>

        {/* Header - iOS Style with Back Button */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}>
            <button
              onClick={() => window.history.back()}
              style={{
                background: 'none',
                border: 'none',
                color: '#7c3aed',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              aria-label="Back"
            >
              ←
            </button>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#0f172a',
              margin: 0
            }}>
              Team Activity
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '28px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>

        {/* Timeframe Selector */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          {(['today', 'week', 'month'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: '600',
                color: timeframe === tf ? '#ffffff' : '#64748b',
                background: timeframe === tf 
                  ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                  : 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize'
              }}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Group Overview */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
            Group Movement Overview
          </h3>

          {/* Team Goal Ring */}
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 12px' }}>
              <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="url(#teamGradient)" strokeWidth="8"
                  strokeLinecap="round" strokeDasharray="313 327" style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
                <defs>
                  <linearGradient id="teamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', lineHeight: '1' }}>96%</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', fontWeight: '400' }}>Weekly Goal</div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '400', marginBottom: '8px' }}>
              289,000 of 300,000 steps
            </p>
            <p style={{ fontSize: '12px', color: '#0f172a', fontWeight: '500', lineHeight: '1.5' }}>
              The group is close to completing the weekly goal.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#7c3aed', marginBottom: '4px' }}>289k</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>Total Steps</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>10</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>Active Members</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>28.9k</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>Avg Steps</p>
            </div>
          </div>

          <div style={{ background: 'rgba(124, 58, 237, 0.06)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '400', lineHeight: '1.5' }}>
              Movement has been consistent across the group.
            </p>
          </div>
        </div>

        {/* Activity This Week */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '12px',
            textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center'
          }}>
            Activity This Week
          </h3>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px'
          }}>
            {(showAllUsers ? users : users.slice(0, 5)).map((user) => {
              const isCurrentUser = user.id === currentUserId;
              const progressPercent = (user.steps / weeklyGoal) * 100;

              return (
                <div
                  key={user.id}
                  style={{
                    background: isCurrentUser ? 'rgba(124, 58, 237, 0.06)' : '#ffffff',
                    border: isCurrentUser ? '1px solid rgba(124, 58, 237, 0.15)' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isCurrentUser ? 'rgba(124, 58, 237, 0.15)' : '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: '600', color: '#ffffff', flexShrink: 0
                    }}>
                      {user.avatar}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '15px', fontWeight: '600', color: '#0f172a', marginBottom: '6px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {isCurrentUser ? 'You' : user.name}
                      </p>
                      
                      <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '10px',
                        fontSize: '11px', color: '#64748b', fontWeight: '500'
                      }}>
                        <span style={{ 
                          display: 'flex', alignItems: 'center', gap: '4px',
                          color: user.activeDays === 7 ? '#10b981' : '#64748b'
                        }}>
                          <span style={{ fontSize: '12px' }}>
                            {user.activeDays === 7 ? '✓' : '•'}
                          </span>
                          {user.activeDays} of 7 days
                        </span>
                        <span style={{ color: '#cbd5e1' }}>•</span>
                        <span>{(user.steps / 1000).toFixed(1)}k steps</span>
                      </div>

                      <div style={{ marginTop: '8px' }}>
                        <div style={{
                          width: '100%', height: '3px', background: '#f1f5f9',
                          borderRadius: '999px', overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%', width: `${Math.min(progressPercent, 100)}%`,
                            background: progressPercent >= 100 
                              ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                              : 'linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)',
                            borderRadius: '999px', transition: 'width 0.5s ease'
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show All / Show Less Button */}
          {users.length > 5 && (
            <button
              onClick={() => setShowAllUsers(!showAllUsers)}
              style={{ 
                marginTop: '12px', 
                padding: '12px 16px',
                background: 'rgba(124, 58, 237, 0.04)',
                borderRadius: '10px',
                border: '1px solid rgba(124, 58, 237, 0.12)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(124, 58, 237, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(124, 58, 237, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.12)';
              }}
            >
              <p style={{ 
                fontSize: '13px', 
                color: '#7c3aed', 
                fontWeight: '600',
                margin: 0
              }}>
                {showAllUsers 
                  ? 'Show Less' 
                  : `Show All ${users.length} People`
                }
              </p>
            </button>
          )}
        </div>

        {/* Your Activity */}
        <div style={{
          background: 'rgba(124, 58, 237, 0.06)',
          border: '1px solid rgba(124, 58, 237, 0.15)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#7c3aed', margin: 0 }}>
              Your Activity
            </h3>
            <span style={{ 
              fontSize: '12px', color: '#10b981', fontWeight: '500',
              display: 'flex', alignItems: 'center', gap: '3px'
            }}>
              ↑ 12% from last week
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '16px', fontWeight: '400' }}>
            Activity is trending upward
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>38,500</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '400' }}>Steps This Week</p>
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>4 of 7</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '400' }}>Active Days</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}