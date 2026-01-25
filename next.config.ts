import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize images
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
