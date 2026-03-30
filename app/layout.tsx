
import type { Metadata } from "next";
import "./globals.css";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import TokenRefreshHandler from "./TokenRefreshHandler";
import IOSInstallPrompt from "./components/IOSInstallPrompt";
import AndroidInstallPrompt from "./components/AndroidInstallPrompt";

// export const metadata: Metadata = {
//   title: "GES Connect",

// };
 
export const metadata: Metadata = {
  title: "GES Connect",
  description: "One place to track all your fitness goals and connect with friends. Join challenges, share your progress, and stay motivated on your fitness journey."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 


  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/socialapp/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />

        {/* ── iOS PWA / Push Notification requirements ── */}
        {/* Tells iOS Safari this page can be launched as a standalone app */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* Status-bar style when launched from Home Screen */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Name shown under the icon on the Home Screen */}
        <meta name="apple-mobile-web-app-title" content="GES Connect" />
        {/* Home-screen icon (use your largest icon; iOS will scale it) */}
        <link rel="apple-touch-icon" href="/socialapp/web-app-manifest-192x192.png" />
        {/* Optional: 512 px version for iPad / newer iPhones */}
        <link rel="apple-touch-icon" sizes="512x512" href="/socialapp/web-app-manifest-512x512.png" />

        <style>{`
          :root {
            --font-geist-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            --font-geist-mono: ui-monospace, "SF Mono", "Cascadia Code", "Consolas", monospace;
          }
        `}</style>
      </head>
      <body className="antialiased">
        <ServiceWorkerRegister />
        <TokenRefreshHandler />
        <IOSInstallPrompt />
        <AndroidInstallPrompt />
        <div
          style={{
            maxWidth: 430,
            margin: '0 auto',
            minHeight: '100vh',
            boxShadow: '0 0 24px rgba(124,58,237,0.08)',
            background: '#fafbfc',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
