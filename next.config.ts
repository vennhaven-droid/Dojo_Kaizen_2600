import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "api.dojokaizen2600.com" },
      { protocol: "https", hostname: "scontent-sin11-1.xx.fbcdn.net" },
      { protocol: "https", hostname: "*.fbcdn.net" },
    ],
  },
  async redirects() {
    return [
      { source: "/success", destination: "/", permanent: true },
      { source: "/events", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
