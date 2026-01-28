import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Removed output: "export" for Azure App Service deployment
  images: {
    unoptimized: true
  },
  // CRITICAL: Use standalone output to reduce deployment size
  output: 'standalone',
  // Production optimizations
  reactStrictMode: true,
  compress: true,  // Enable gzip compression
  poweredByHeader: false,  // Remove X-Powered-By header
};


export default nextConfig;
