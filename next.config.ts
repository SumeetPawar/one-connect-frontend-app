import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Removed output: "export" for Azure App Service deployment
  images: {
    unoptimized: true
  }
};

export default nextConfig;
