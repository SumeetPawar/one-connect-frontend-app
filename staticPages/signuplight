'use client';

import { useState, useEffect } from 'react';

export default function SignupPage() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
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

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Success - clear error
    setError('');
    alert('Signup successful! (In real app, navigate to dashboard)');
  };

  const handleLoginClick = (): void => {
    alert('Navigate to login page (In real app, use router)');
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
      padding: '24px'
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

        {/* Signup Card */}
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
            marginBottom: '10px',
            letterSpacing: '-0.01em'
          }}>
            Create account
          </h2>
          <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '32px' }}>
            Get started with your fitness journey
          </p>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Name Input */}
            <div>
              <label htmlFor="name" style={{ 
                display: 'block', 
                fontSize: '15px', 
                fontWeight: '400', 
                color: '#0f172a', 
                marginBottom: '10px' 
              }}>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="John Doe"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  backdropFilter: 'blur(16px)',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '14px 16px',
                  fontSize: '15px',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(167, 139, 250, 0.60)';
                  e.target.style.boxShadow = '0 0 0 2px rgba(167, 139, 250, 0.60)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.10)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" style={{ 
                display: 'block', 
                fontSize: '15px', 
                fontWeight: '400', 
                color: '#0f172a', 
                marginBottom: '10px' 
              }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  backdropFilter: 'blur(16px)',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '14px 16px',
                  fontSize: '15px',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(167, 139, 250, 0.60)';
                  e.target.style.boxShadow = '0 0 0 2px rgba(167, 139, 250, 0.60)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.10)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" style={{ 
                display: 'block', 
                fontSize: '15px', 
                fontWeight: '400', 
                color: '#0f172a', 
                marginBottom: '10px' 
              }}>
                Password
              </label>
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
                  backdropFilter: 'blur(16px)',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '14px 16px',
                  fontSize: '15px',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(167, 139, 250, 0.60)';
                  e.target.style.boxShadow = '0 0 0 2px rgba(167, 139, 250, 0.60)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.10)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" style={{ 
                display: 'block', 
                fontSize: '15px', 
                fontWeight: '400', 
                color: '#0f172a', 
                marginBottom: '10px' 
              }}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  backdropFilter: 'blur(16px)',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '14px 16px',
                  fontSize: '15px',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(167, 139, 250, 0.60)';
                  e.target.style.boxShadow = '0 0 0 2px rgba(167, 139, 250, 0.60)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.10)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                fontSize: '15px',
                color: '#f87171',
                background: 'rgba(248, 113, 113, 0.10)',
                border: '1px solid rgba(248, 113, 113, 0.20)',
                borderRadius: '8px',
                padding: '8px 16px'
              }}>
                {error}
              </div>
            )}

            {/* Signup Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.20)',
                boxShadow: '0 4px 12px 0 rgba(124, 58, 237, 0.25)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(139, 92, 246, 0.50)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(139, 92, 246, 0.35)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Create Account
            </button>

          </form>

          {/* Divider */}
          <div style={{ position: 'relative', margin: '32px 0' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', borderTop: '1px solid #e5e7eb' }}></div>
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: '13px' }}>
              <span style={{ 
                padding: '0 16px', 
                background: 'rgba(255, 255, 255, 0.98)',
                color: '#64748b' 
              }}>
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="button"
            onClick={handleLoginClick}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              background: '#f8fafc',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
              e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.30)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Login
          </button>

        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '32px' }}>
          By creating an account, you agree to our Terms & Privacy Policy
        </p>

      </div>
    </div>
  );
}