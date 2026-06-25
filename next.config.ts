import type { NextConfig } from "next";

// Allow next/image to load uploaded files served by the backend (Section 3a).
// Derived from NEXT_PUBLIC_API_FILE_BASE_URL so it tracks the env config.
const fileBaseUrl = new URL(
  process.env.NEXT_PUBLIC_API_FILE_BASE_URL ?? "http://localhost:5000",
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: fileBaseUrl.protocol.replace(":", "") as "http" | "https",
        hostname: fileBaseUrl.hostname,
        port: fileBaseUrl.port || undefined,
        pathname: "/Uploads/**",
      },
    ],
  },
};

export default nextConfig;
