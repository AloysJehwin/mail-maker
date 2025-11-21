import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration for Next.js 16
  turbopack: {},

  // Output standalone for Docker
  output: 'standalone',
};

export default nextConfig;
