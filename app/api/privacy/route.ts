import { NextResponse } from 'next/server';

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Privacy Policy — GES Connect</title>
  <style>
    body { max-width: 720px; margin: 0 auto; padding: 48px 24px; font-family: system-ui, sans-serif; color: #1e293b; line-height: 1.7; }
    h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    h2 { font-size: 18px; font-weight: 600; margin-top: 32px; }
    p, li { font-size: 15px; }
    a { color: #2563eb; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .meta { color: #64748b; margin-bottom: 32px; }
  </style>
</head>
<body>
  <h1>Privacy Policy</h1>
  <p class="meta">Last updated: April 20, 2026</p>

  <h2>1. What We Collect</h2>
  <p>GES Connect collects step count data from Google Fit solely to display your daily and weekly
  fitness progress within the app. We do not collect any other health or fitness data.</p>

  <h2>2. How We Use Your Data</h2>
  <p>Step data fetched from Google Fit is used only to:</p>
  <ul>
    <li>Display your personal step count on your dashboard</li>
    <li>Track progress toward your challenge goals</li>
    <li>Show leaderboard rankings within your team</li>
  </ul>
  <p>We do not sell, share, or transfer your fitness data to any third party.</p>

  <h2>3. Google Fit Access</h2>
  <p>With your explicit consent, GES Connect requests read-only access to your Google Fit step
  count data via the <code>fitness.activity.read</code> scope. You can revoke this access at
  any time from your
  <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
    Google Account permissions page
  </a> or from within the app using the Disconnect button.</p>

  <h2>4. Data Retention</h2>
  <p>OAuth tokens are stored in secure HttpOnly cookies and expire automatically. Step logs are
  retained on our servers for the duration of the challenge period and may be deleted upon request.</p>

  <h2>5. Your Rights</h2>
  <p>You may request deletion of your data at any time by contacting us. You may also disconnect
  Google Fit at any time from within the app.</p>

  <h2>6. Contact</h2>
  <p>For privacy-related questions, contact the GES Connect team at <a href="mailto:sumeet.pawar@honeywell.com">sumeet.pawar@honeywell.com</a>.</p>
</body>
</html>`;

export async function GET() {
  return new NextResponse(HTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
