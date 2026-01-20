'use client';

import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentWord, setCurrentWord] = useState<string>('Fitness');

  // Animated word loop
  useEffect(() => {
    const words = ['Fitness', 'Connect', 'Social', 'Insights'];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % words.length;
      setCurrentWord(words[index]);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    // Success - clear error
    setError('');
    alert('Login successful! (In real app, navigate to dashboard)');
  };

  const handleSignupClick = (): void => {
    alert('Navigate to signup page (In real app, use router)');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      backgroundColor: '#fafbfc',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 58, 237, 0.04), transparent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 24px'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        
        {/* Logo/Title */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ 
            fontSize: '40px', 
            fontWeight: '700', 
            color: '#0f172a', 
            marginBottom: '0',
            letterSpacing: '-0.03em',
            lineHeight: '1'
          }}>
            GES <span 
              key={currentWord}
              style={{ 
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'fadeIn 0.5s ease-in-out',
                display: 'inline-block'
              }}
            >
              {currentWord}
            </span>
          </h1>
          
          {/* CSS Animation */}
          <style>{`
            @keyframes fadeIn {
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

        {/* Login Card */}
        <div style={{
          background: '#ffffff',
          padding: '40px',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }}>
          
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#0f172a', 
            marginBottom: '8px',
            letterSpacing: '-0.01em'
          }}>
            Sign in
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Email Input */}
            <div>
              <label htmlFor="email" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#0f172a', 
                marginBottom: '10px' 
              }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="name@company.com"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '14px 16px',
                  fontSize: '15px',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  fontWeight: '400'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7c3aed';
                  e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.08)';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = '#f8fafc';
                }}
              />
            </div>

            {/* Password Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label htmlFor="password" style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#0f172a'
                }}>
                  Password
                </label>
                <a href="#" style={{ fontSize: '13px', color: '#7c3aed', textDecoration: 'none', fontWeight: '500' }}>
                  Forgot?
                </a>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '14px 16px',
                  fontSize: '15px',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  fontWeight: '400'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7c3aed';
                  e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.08)';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = '#f8fafc';
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                fontSize: '14px',
                color: '#f87171',
                background: 'rgba(248, 113, 113, 0.10)',
                border: '1px solid rgba(248, 113, 113, 0.20)',
                borderRadius: '8px',
                padding: '8px 16px'
              }}>
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 4px 12px 0 rgba(124, 58, 237, 0.25)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginTop: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 16px 0 rgba(124, 58, 237, 0.35)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(124, 58, 237, 0.25)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px) scale(1)';
              }}
            >
              Sign in
            </button>

          </form>

          {/* Divider */}
          <div style={{ position: 'relative', margin: '32px 0' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', borderTop: '1px solid #e2e8f0' }}></div>
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: '13px' }}>
              <span style={{ 
                padding: '0 16px', 
                background: '#ffffff',
                color: '#64748b',
                fontWeight: '400'
              }}>
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Signup Button */}
          <button
            type="button"
            onClick={handleSignupClick}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              background: 'transparent',
              color: '#7c3aed',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#faf5ff';
              e.currentTarget.style.borderColor = '#c4b5fd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Create account
          </button>

        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '32px', fontWeight: '400' }}>
          By continuing, you agree to our <a href="#" style={{ color: '#7c3aed', textDecoration: 'none' }}>Terms</a> and <a href="#" style={{ color: '#7c3aed', textDecoration: 'none' }}>Privacy Policy</a>
        </p>

      </div>
    </div>
  );
}