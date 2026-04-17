/**
 * Footer Component
 * Brand block + tagline + product / resources columns + social + copyright.
 * Compact on mobile (single screen), expands to columns on desktop.
 */

import Image from "next/image";
import Link from "next/link";

type FooterLink = { label: string; href: string; external?: boolean };
type FooterColumn = { title: string; links: FooterLink[] };

const COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "How It Works", href: "/#how-it-works" },
      { label: "For Athletes", href: "/#for-athletes" },
      { label: "For Coaches", href: "/#for-coaches" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "/login" },
      { label: "Sign Up", href: "/signup" },
      { label: "Settings", href: "/settings" },
    ],
  },
  {
    title: "Company",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/yotamblu/GooseNet-web",
        external: true,
      },
    ],
  },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  const base =
    "group relative inline-flex items-center text-sm text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white";
  const underline = (
    <span
      aria-hidden
      className="pointer-events-none absolute left-0 right-0 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-400 transition-transform duration-300 ease-out group-hover:scale-x-100"
    />
  );
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={base}>
        <span className="relative">{link.label}</span>
        {underline}
      </a>
    );
  }
  return (
    <Link href={link.href} className={base}>
      <span className="relative">{link.label}</span>
      {underline}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="relative border-t border-gray-200/70 dark:border-white/10 bg-white/60 dark:bg-gray-950/60 backdrop-blur-xl">
      {/* Soft top glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          {/* Brand block */}
          <div className="min-w-0">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/logo/goosenet_logo.png"
                alt="GooseNet"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-50">
                GooseNet
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-gray-600 dark:text-gray-400">
              Train smarter. Run stronger. Together. Structured workouts, real data, seamless Garmin integration.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://github.com/yotamblu/GooseNet-web"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 text-gray-500 transition-all hover:-translate-y-0.5 hover:text-gray-900 hover:shadow-md dark:text-gray-400 dark:hover:text-white"
                aria-label="GitHub repository"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                {col.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLinkItem link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-gray-200/70 dark:border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            &copy; {new Date().getFullYear()} GooseNet. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Built for runners. <span className="text-gradient-brand font-semibold">Powered by data.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
