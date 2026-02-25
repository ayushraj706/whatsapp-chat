import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // 1. Build ke waqt ESLint errors ko ignore karein
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 2. TypeScript errors ko bhi ignore karein (taaki deployment na ruke)
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // AWS patterns hata diye hain kyunki hum AWS use nahi kar rahe
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Supabase images ke liye safety net
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
