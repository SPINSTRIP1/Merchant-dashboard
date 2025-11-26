import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "flagcdn.com",
      "upload.wikimedia.org",
      "spin-strip.sfo3.digitaloceanspaces.com",
    ],
  },
};

export default nextConfig;
