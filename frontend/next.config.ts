import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.110", "192.168.1.100"],

  images: {
    qualities: [10, 75, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "7000",
        pathname: "/media/**",
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
