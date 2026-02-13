
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import TokenRefreshHandler from "./TokenRefreshHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerRegister />
        <TokenRefreshHandler />
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
