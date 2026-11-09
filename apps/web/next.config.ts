import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Pages are statically generated, so a per-request nonce CSP is not possible (it would force
// every page to render on demand). Instead: no third-party scripts except Turnstile and, only
// after the visitor accepts cookies, Google Analytics 4 (wave 3, ADR 010, components/site/
// consent.tsx); nothing framed. Inline scripts are Next.js's own hydration data.
const isDev = process.env.NODE_ENV === "development";
const analytics = "https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${
    isDev ? "'unsafe-eval' " : ""
  }https://challenges.cloudflare.com https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: ${analytics}`,
  "font-src 'self'",
  `connect-src 'self' ${analytics}`,
  "media-src 'self'",
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@maarif/contracts", "@maarif/tokens"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

// Gives `next dev` access to the Cloudflare bindings declared in wrangler.jsonc.
initOpenNextCloudflareForDev();
