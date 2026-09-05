import type { NextConfig } from "next";
const STATIC_ASSET_CACHE =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";
const ADMIN_NO_STORE = "private, no-store, max-age=0, must-revalidate";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  images: {
    minimumCacheTTL: 86400,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: STATIC_ASSET_CACHE }],
      },
      {
        source: "/sweet-pea-logo.png",
        headers: [{ key: "Cache-Control", value: STATIC_ASSET_CACHE }],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "Cache-Control", value: ADMIN_NO_STORE },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
