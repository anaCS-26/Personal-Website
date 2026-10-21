import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// No nonces: the site loads nothing third-party, and the inline theme script in
// app/layout.tsx needs 'unsafe-inline'.
const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp.replace(/\s*\n\s*/g, " ").trim() },
          // Vercel's default HSTS omits includeSubDomains/preload on custom domains
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Microphone stays enabled for the chat's voice input
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=(self), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
