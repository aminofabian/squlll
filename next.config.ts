import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Nest it properly
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
