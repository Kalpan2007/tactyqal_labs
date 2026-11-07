import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Cover images still live on the WordPress media library during the migration.
    remotePatterns: [
      { protocol: "https", hostname: "tactyqal.com", pathname: "/blog/wp-content/uploads/**" },
      { protocol: "https", hostname: "www.tactyqal.com", pathname: "/blog/wp-content/uploads/**" },
      { protocol: "https", hostname: "secure.gravatar.com", pathname: "/avatar/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
