import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},

  allowedDevOrigins: [
    "http://localhost:3000",
    "http://10.0.0.1:3000"
  ],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.googleusercontent.com",
              "font-src 'self' data:",
              "connect-src 'self' http://localhost:3000 http://10.0.0.1:3000 ws://localhost:3000 ws://10.0.0.1:3000 https://gooseapi.ddns.net https://accounts.google.com",
              "frame-src 'self' https://accounts.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'"
            ].join("; ")
          }
        ]
      }
    ];
  }
};

export default nextConfig;
