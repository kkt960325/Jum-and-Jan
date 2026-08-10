import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.whiskybase.com',
        pathname: '/storage/whiskies/**',
      },
    ],
  },
};

export default nextConfig;
