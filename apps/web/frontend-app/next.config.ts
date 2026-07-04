import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['postgres'],
  async rewrites() {
    return [
      {
        source: '/cloud-api/:path*',
        destination: `${process.env.FLUXY_API_INTERNAL_URL ?? 'http://5.189.180.12:3001'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
