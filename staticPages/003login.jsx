import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
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

  const handleSignupClick = () => {
    alert('Navigate to signup page (In real app, use router)');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      backgroundColor: '#0a0a1a',
      backgroundImage: 'radial-gradient(ellipse 120% 100% at 50% 0%, rgba(124, 58, 237, 0.14), transparent 70%), radial-gradient(ellipse 100% 100% at 100%, rgba(139, 92, 246, 0.11), transparent 60%), radial-gradient(ellipse 100% 100% at 0% 100%, rgba(109, 40, 217, 0.09), transparent 60%), linear-gradient(180deg, #0a0a1a 0%, #0f1419 50%, #0a1114 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 24px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        
        {/* Logo/Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '8px',
            letterSpacing: '-0.025em'
          }}>
            Fitness<span style={{ 
              background: 'linear-gradient(to right, #a78bfa, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Track</span>
          </h1>
          <p style={{ fontSize: '14px', color: '#a1a1aa' }}>Track your fitness journey</p>
        </div>

        {/* Login Card */}
        <div style={{
          backdropFilter: 'blur(16px)',
          background: 'linear-gradient(to bottom right, rgba(124, 58, 237, 0.10), rgba(139, 92, 246, 0.08), rgba(109, 40, 217, 0.10))',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid rgba(167, 139, 250, 0.20)',
          boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.20)'
        }}>
          
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
            Welcome Back
          </h2>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Email Input */}
            <div>
              <label htmlFor="email" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: 'rgba(255,255,255,0.90)', 
                marginBottom: '8px' 
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
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.95)',
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
                fontSize: '14px', 
                fontWeight: '500', 
                color: 'rgba(255,255,255,0.90)', 
                marginBottom: '8px' 
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
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.95)',
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
                fontSize: '14px',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #7c3aed, #9333ea, #6d28d9)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.20)',
                boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.35)',
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
              Login
            </button>

          </form>

          {/* Divider */}
          <div style={{ position: 'relative', margin: '24px 0' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.10)' }}></div>
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: '12px' }}>
              <span style={{ 
                padding: '0 12px', 
                background: 'linear-gradient(to bottom right, rgba(124, 58, 237, 0.10), rgba(139, 92, 246, 0.08), rgba(109, 40, 217, 0.10))',
                color: '#a1a1aa' 
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
              fontSize: '14px',
              fontWeight: '600',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.90)',
              border: '1px solid rgba(255,255,255,0.10)',
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
            Create Account
          </button>

        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#71717a', marginTop: '24px' }}>
          By continuing, you agree to our Terms & Privacy Policy
        </p>

      </div>
    </div>
  );
}