import type { NextConfig } from "next";

/**
 * Content Security Policy — restricts where scripts/frames/media/etc. can be
 * loaded from. Combined with input sanitization in `src/lib/security.ts`,
 * this is our primary defense against injected gambling/malware content.
 *
 * NOTE: `script-src` includes `'unsafe-inline'` and `'unsafe-eval'` because
 * Next.js emits inline hydration scripts and RSC uses eval'd chunks. Because
 * of this, stored inline XSS is prevented at the *input* layer instead of
 * the CSP layer (see `sanitizeHtml` / `sanitizeHref` in `src/lib/security.ts`).
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://*.supabase.co",
  "media-src 'self' blob: https://*.siar.us:* https://*.siar.us",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.siar.us:* https://*.siar.us",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "frame-ancestors 'none'",
  "form-action 'self' https://wa.me",
  "base-uri 'self'",
  "object-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
