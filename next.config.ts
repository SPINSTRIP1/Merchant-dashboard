import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Public, customer-facing pages live on the public site; old dashboard /preview links (and
  // Paystack callbacks to /preview/events/success) are forwarded there with their query strings.
  async redirects() {
    const publicSite = (process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || "https://places.spinstrip.com").replace(/\/+$/, "");
    return [
      // The old table-QR menu link (no dish id) has no equivalent page; send it to the public home.
      { source: "/preview/menu", missing: [{ type: "query", key: "id" }], destination: `${publicSite}/`, permanent: false },
      { source: "/preview/:path*", destination: `${publicSite}/preview/:path*`, permanent: false },
    ];
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
