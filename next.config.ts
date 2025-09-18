import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  devIndicators: false,
  images: {
    domains: ["https://kiqggnochamawnyxpjxi.storage.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kiqggnochamawnyxpjxi.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
