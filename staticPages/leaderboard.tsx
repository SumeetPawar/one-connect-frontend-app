'use client';

import { useState } from 'react';

interface User {
  id: number;
  name: string;
  steps: number;
  avatar: string;
  streak: number;
  rank: number;
}

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('week');

  // Mock leaderboard data
  const users: User[] = [
    { id: 1, name: 'Sarah Chen', steps: 45230, avatar: 'SC', streak: 12, rank: 1 },
    { id: 2, name: 'Sumeet Kumar', steps: 38450, avatar: 'SK', streak: 8, rank: 2 },
    { id: 3, name: 'Alex Johnson', steps: 35780, avatar: 'AJ', streak: 15, rank: 3 },
    { id: 4, name: 'Maria Garcia', steps: 32100, avatar: 'MG', streak: 6, rank: 4 },
    { id: 5, name: 'David Lee', steps: 29850, avatar: 'DL', streak: 10, rank: 5 },
    { id: 6, name: 'Emma Wilson', steps: 28340, avatar: 'EW', streak: 4, rank: 6 },
    { id: 7, name: 'James Brown', steps: 26790, avatar: 'JB', streak: 9, rank: 7 },
    { id: 8, name: 'Lisa Wang', steps: 24560, avatar: 'LW', streak: 7, rank: 8 },
    { id: 9, name: 'Tom Anderson', steps: 22340, avatar: 'TA', streak: 5, rank: 9 },
    { id: 10, name: 'Nina Patel', steps: 20180, avatar: 'NP', streak: 3, rank: 10 },
  ];

  const currentUserId = 2; // Sumeet Kumar

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'; // Gold
    if (rank === 2) return 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'; // Silver
    if (rank === 3) return 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'; // Bronze
    return 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'; // Purple
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafbfc',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 58, 237, 0.04), transparent)',
      padding: '16px'
    }}>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '4px'
          }}>
            Leaderboard
          </h1>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>
            Compete with your team
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

        {/* Top 3 Podium */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '8px',
          marginBottom: '24px',
          alignItems: 'flex-end'
        }}>
          {/* 2nd Place */}
          <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 8px',
              borderRadius: '50%',
              background: getRankColor(2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '700',
              color: '#ffffff',
              border: '3px solid #ffffff',
              boxShadow: '0 4px 12px rgba(148, 163, 184, 0.3)'
            }}>
              {users[1].avatar}
            </div>
            <div style={{
              background: 'rgba(148, 163, 184, 0.1)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '12px 12px 0 0',
              padding: '12px 8px',
              minHeight: '80px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>🥈</div>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#0f172a', marginBottom: '2px' }}>
                {users[1].name.split(' ')[0]}
              </p>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>
                {(users[1].steps / 1000).toFixed(1)}k
              </p>
            </div>
          </div>

          {/* 1st Place */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>👑</div>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 8px',
              borderRadius: '50%',
              background: getRankColor(1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '700',
              color: '#ffffff',
              border: '3px solid #ffffff',
              boxShadow: '0 6px 16px rgba(251, 191, 36, 0.4)'
            }}>
              {users[0].avatar}
            </div>
            <div style={{
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '12px 12px 0 0',
              padding: '12px 8px',
              minHeight: '100px'
            }}>
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>🥇</div>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#0f172a', marginBottom: '2px' }}>
                {users[0].name.split(' ')[0]}
              </p>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b' }}>
                {(users[0].steps / 1000).toFixed(1)}k
              </p>
            </div>
          </div>

          {/* 3rd Place */}
          <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 8px',
              borderRadius: '50%',
              background: getRankColor(3),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '700',
              color: '#ffffff',
              border: '3px solid #ffffff',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
            }}>
              {users[2].avatar}
            </div>
            <div style={{
              background: 'rgba(217, 119, 6, 0.1)',
              border: '1px solid rgba(217, 119, 6, 0.2)',
              borderRadius: '12px 12px 0 0',
              padding: '12px 8px',
              minHeight: '80px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>🥉</div>
              <p style={{ fontSize: '11px', fontWeight: '600', color: '#0f172a', marginBottom: '2px' }}>
                {users[2].name.split(' ')[0]}
              </p>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#d97706' }}>
                {(users[2].steps / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
        </div>

        {/* Rest of Rankings */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#64748b',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            All Rankings
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;

              return (
                <div
                  key={user.id}
                  style={{
                    background: isCurrentUser 
                      ? 'rgba(124, 58, 237, 0.08)' 
                      : '#ffffff',
                    border: isCurrentUser 
                      ? '1px solid rgba(124, 58, 237, 0.2)' 
                      : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Rank Badge */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: user.rank <= 3 ? getRankColor(user.rank) : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: user.rank <= 3 ? '16px' : '12px',
                    fontWeight: '700',
                    color: user.rank <= 3 ? '#ffffff' : '#64748b',
                    flexShrink: 0
                  }}>
                    {getRankIcon(user.rank)}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ffffff',
                    flexShrink: 0
                  }}>
                    {user.avatar}
                  </div>

                  {/* User Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#0f172a',
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.name}
                      {isCurrentUser && (
                        <span style={{
                          marginLeft: '6px',
                          fontSize: '11px',
                          color: '#7c3aed',
                          fontWeight: '600'
                        }}>
                          (You)
                        </span>
                      )}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        🔥 {user.streak} day streak
                      </span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#0f172a',
                      lineHeight: '1'
                    }}>
                      {(user.steps / 1000).toFixed(1)}k
                    </p>
                    <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                      steps
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Your Stats Card */}
        <div style={{
          background: 'rgba(124, 58, 237, 0.06)',
          border: '1px solid rgba(124, 58, 237, 0.15)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#7c3aed',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Your Stats
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                #2
              </p>
              <p style={{ fontSize: '10px', color: '#94a3b8' }}>Rank</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                38.5k
              </p>
              <p style={{ fontSize: '10px', color: '#94a3b8' }}>Steps</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                8
              </p>
              <p style={{ fontSize: '10px', color: '#94a3b8' }}>Day Streak</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}