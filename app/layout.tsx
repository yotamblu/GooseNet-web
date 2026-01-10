import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
  openGraph: {
    title: "GooseNet - Train Smarter. Run Stronger. Together.",
    description:
      "GooseNet connects runners and coaches through structured workouts, real performance data, and seamless Garmin integration.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GooseNet - Train Smarter. Run Stronger. Together.",
    description:
      "GooseNet connects runners and coaches through structured workouts, real performance data, and Garmin integration.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#111827" media="(prefers-color-scheme: dark)" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-full`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
