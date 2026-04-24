export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif', color: '#f1f5f9', lineHeight: 1.7, background: '#0f172a', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: '#94a3b8', marginBottom: 32 }}>Last updated: April 20, 2026</p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 32 }}>1. What We Collect</h2>
      <p>
        GES Connect collects step count data from Google Fit solely to display your daily and weekly
        fitness progress within the app. We do not collect any other health or fitness data.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 32 }}>2. How We Use Your Data</h2>
      <p>
        Step data fetched from Google Fit is used only to:
      </p>
      <ul>
        <li>Display your personal step count on your dashboard</li>
        <li>Track progress toward your challenge goals</li>
        <li>Show leaderboard rankings within your team</li>
      </ul>
      <p>We do not sell, share, or transfer your fitness data to any third party.</p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 32 }}>3. Google Fit Access</h2>
      <p>
        With your explicit consent, GES Connect requests read-only access to your Google Fit step
        count data via the <code style={{ background: 'rgba(255,255,255,0.1)', color: '#7dd3fc', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>fitness.activity.read</code> scope. You can revoke this access at
        any time from your{' '}
        <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" style={{ color: '#7dd3fc' }}>
          Google Account permissions page
        </a>{' '}
        or from within the app using the Disconnect button.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 32 }}>4. Data Retention</h2>
      <p>
        OAuth tokens are stored in secure HttpOnly cookies and expire automatically. Step logs are
        retained on our servers for the duration of the challenge period and may be deleted upon
        request.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 32 }}>5. Your Rights</h2>
      <p>
        You may request deletion of your data at any time by contacting us. You may also disconnect
        Google Fit at any time from within the app.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginTop: 32 }}>6. Contact</h2>
      <p>
        For privacy-related questions or data deletion requests, contact us at{' '}
        <a href="mailto:sumeet.pawar@honeywell.com" style={{ color: '#7dd3fc' }}>sumeet.pawar@honeywell.com</a>.
      </p>
    </div>
  );
}
