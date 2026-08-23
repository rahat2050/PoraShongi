import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self' https://rahatahmed.site https://*.e2b.app http://localhost:*",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  // Keep dynamic metadata in the initial <head>. This also ensures a missing
  // profile can return its real 404 status before response headers are sent.
  htmlLimitedBots: /.*/,
  async redirects() {
    return [
      { source: "/admin/blog/new", destination: "/blog/new", permanent: false },
      { source: "/tutors", destination: "/teachers", permanent: true },
      { source: "/tutors/:path*", destination: "/teachers/:path*", permanent: true },
      { source: "/tuition", destination: "/tuitions", permanent: true },
      { source: "/tuition/:path*", destination: "/tuitions/:path*", permanent: true },
      { source: "/find-tutors", destination: "/teachers", permanent: true },
      { source: "/find-tuition", destination: "/tuitions", permanent: true },
      { source: "/online-tutors", destination: "/teachers/online", permanent: true },
      { source: "/online-tutor", destination: "/teachers/online", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/demo",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
