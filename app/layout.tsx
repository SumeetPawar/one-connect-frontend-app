
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

const isProduction = process.env.NODE_ENV === 'production';

export const metadata: Metadata = {
  title: "GES Connect",
  description: "One place to track all your fitness goals and connect with friends. Join challenges, share your progress, and stay motivated on your fitness journey.",
  manifest: isProduction ? "/socialapp/manifest.json" : "/socialapp/manifest-local.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isProduction = process.env.NODE_ENV === 'production';


  return (
    <html lang="en">
      <head>
        <link rel="manifest" href={metadata.manifest?.toString()} />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerRegister />
        <TokenRefreshHandler />
        {children}
      </body>
    </html>
  );
}
