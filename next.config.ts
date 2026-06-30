import type { NextConfig } from "next";

// Allow next/image to load uploaded files served by the backend (Section 3a).
// Derived from NEXT_PUBLIC_API_FILE_BASE_URL so it tracks the env config.
const fileBaseUrl = new URL(
  process.env.NEXT_PUBLIC_API_FILE_BASE_URL ?? "http://localhost:5000",
);

const nextConfig: NextConfig = {
  images: {
    // The image optimizer rejects backend-served uploads (it needs the host in
    // remotePatterns AND a dev-server restart, and was unreliable in practice —
    // uploaded images rendered blank on every next/image surface). Image
    // optimization (resize/WebP) isn't important for this internal CMS + modest
    // public site, so optimization is turned off globally: next/image renders
    // the src directly (still lazy-loads), so uploads always display. The
    // remotePatterns below are kept in case optimization is ever re-enabled.
    unoptimized: true,
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
