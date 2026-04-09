import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  devIndicators: false,
  images: {
    domains: [
      "https://kiqggnochamawnyxpjxi.storage.supabase.co",
      "https://kiqggnochamawnyxpjxi.supabase.co",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kiqggnochamawnyxpjxi.supabase.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kiqggnochamawnyxpjxi.storage.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
