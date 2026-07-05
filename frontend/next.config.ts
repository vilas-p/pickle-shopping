import type { NextConfig } from "next";

function addOrigin(target: Set<string>, value: string | undefined): void {
  if (!value) return;
  try {
    target.add(new URL(value).origin);
  } catch {
    // Ignore malformed env values and keep the CSP deterministic.
  }
}

function buildContentSecurityPolicy(): string {
  const isDev = process.env.NODE_ENV !== "production";
  const connectSrc = new Set<string>([
    "'self'",
    "https://api.razorpay.com",
    "https://checkout.razorpay.com",
  ]);

  addOrigin(connectSrc, process.env.NEXT_PUBLIC_API_BASE_URL);
  addOrigin(connectSrc, process.env.NEXT_PUBLIC_SITE_URL);

  if (isDev) {
    connectSrc.add("http://localhost:*");
    connectSrc.add("http://127.0.0.1:*");
    connectSrc.add("ws://localhost:*");
    connectSrc.add("ws://127.0.0.1:*");
  }

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}https://checkout.razorpay.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${Array.from(connectSrc).join(" ")}`,
    "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    isDev ? "" : "upgrade-insecure-requests",
  ].filter(Boolean).join("; ");
}

const contentSecurityPolicy = buildContentSecurityPolicy();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
