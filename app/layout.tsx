import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import PWARegister from "./components/PWARegister";
import { Analytics } from "@vercel/analytics/react";
import { getMetadataBase } from "../lib/site-config";
import JsonLdOrganizationWebSite from "./components/JsonLdOrganizationWebSite";
import { THEME_STORAGE_KEY } from "../lib/theme-storage";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "GooseNet - Train Smarter. Run Stronger. Together.",
  description:
    "GooseNet connects runners and coaches through structured workouts, real performance data, and seamless Garmin integration. Built for real running training.",
  keywords: [
    "running",
    "running coach",
    "Garmin",
    "structured workouts",
    "running training",
    "athlete coaching",
    "performance analytics",
    "running platform",
  ],
  authors: [{ name: "GooseNet" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GooseNet",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GooseNet - Train Smarter. Run Stronger. Together.",
    description:
      "GooseNet connects runners and coaches through structured workouts, real performance data, and seamless Garmin integration.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 628,
        alt: "GooseNet — Train smarter, run stronger, together",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GooseNet - Train Smarter. Run Stronger. Together.",
    description:
      "GooseNet connects runners and coaches through structured workouts, real performance data, and Garmin integration.",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 628,
        alt: "GooseNet — Train smarter, run stronger, together",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full dark">
      <head>
        {/* Runs before paint: default dark when theme key is missing (must match ThemeProvider storageKey) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='${THEME_STORAGE_KEY}',v=localStorage.getItem(k),d=document.documentElement;d.classList.remove('light','dark');if(v==='light'){d.classList.add('light');d.style.colorScheme='light';}else{d.classList.add('dark');d.style.colorScheme='dark';}}catch(e){var d=document.documentElement;d.classList.remove('light','dark');d.classList.add('dark');d.style.colorScheme='dark';}})();`,
          }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GooseNet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo/goosenet_logo.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased text-gray-900 dark:text-gray-100 h-full selection:bg-blue-500/20`}
      >
        <JsonLdOrganizationWebSite />
        <Providers>
          {children}
          <PWARegister />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
