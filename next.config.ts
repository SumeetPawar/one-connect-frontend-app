import type { NextConfig } from "next";

// Use basePath only in production (Azure App Gateway routing)
const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Remove basePath - Application Gateway handles the /socialapp routing
  // basePath: '', // No basePath needed
  
  // Removed output: "export" for Azure App Service deployment
  images: {
    unoptimized: true
  },
  // Production optimizations
  reactStrictMode: true,
  compress: true,  // Enable gzip compression
  poweredByHeader: false,  // Remove X-Powered-By header
};

export default nextConfig;
