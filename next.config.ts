import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},

  allowedDevOrigins: [
    "http://localhost:3000",
    "http://10.0.0.1:3000"
  ],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh6.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },

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
              "style-src 'self' 'unsafe-inline' https://unpkg.com https://cdnjs.cloudflare.com",
              "img-src 'self' data: blob: https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://lh5.googleusercontent.com https://lh6.googleusercontent.com https://*.googleusercontent.com https://cdnjs.cloudflare.com https://*.tile.openstreetmap.org",
              "font-src 'self' data:",
              "connect-src 'self' http://localhost:3000 http://10.0.0.1:3000 ws://localhost:3000 ws://10.0.0.1:3000 https://gooseapi.ddns.net https://accounts.google.com https://*.tile.openstreetmap.org",
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
