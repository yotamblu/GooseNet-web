/**
 * Header / Navigation (marketing)
 * Glassy top bar with animated logo, animated underline nav links,
 * gradient-border CTA, and spring-slide mobile menu.
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { getProfilePicSrc } from "../../lib/profile-pic-utils";

type NavLinkProps = {
  href: string;
  label: string;
  onClick?: () => void;
};

function NavLink({ href, label, onClick }: NavLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="group relative px-1 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors hover:text-gray-900 dark:hover:text-white"
    >
      <span className="relative z-[1]">{label}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-teal-400 transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
    </a>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const reduce = useReducedMotion();

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full max-w-full border-b border-gray-200/60 dark:border-white/10 bg-white/70 dark:bg-gray-950/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/50">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5"
        aria-label="Global"
      >
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
          <motion.span
            whileHover={reduce ? undefined : { rotate: -10, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="relative inline-flex h-9 w-9 items-center justify-center"
          >
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/50 via-purple-500/40 to-teal-400/40 blur-md opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <Image
              src="/logo/goosenet_logo.png"
              alt="GooseNet"
              width={36}
              height={36}
              className="relative h-8 w-8 sm:h-9 sm:w-9 object-contain"
              priority
            />
          </motion.span>
          <span className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-gray-50">
            GooseNet
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:ml-8 lg:gap-x-8">
          <NavLink href="#how-it-works" label="How It Works" />
        </div>

        {/* Desktop CTA Buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-3">
          <ThemeToggle />
          {!loading && user ? (
            <>
              {user.profilePicString && (
                <Link
                  href="/dashboard"
                  className="group relative inline-flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label={`${user.userName} — dashboard`}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-teal-400 opacity-70 blur-sm scale-105 transition-opacity group-hover:opacity-100"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getProfilePicSrc(user.profilePicString)}
                    alt={user.userName}
                    referrerPolicy="no-referrer"
                    className="relative h-10 w-10 rounded-full border-2 border-white dark:border-gray-900 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </Link>
              )}
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 px-4 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-white dark:hover:bg-gray-900"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="inline-flex h-10 items-center rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 px-4 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-white dark:hover:bg-gray-900"
              >
                Login
              </a>
              <motion.a
                href="/signup"
                whileHover={reduce ? undefined : { scale: 1.02 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="relative inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-white shadow-glow-brand bg-[linear-gradient(120deg,#3b82f6_0%,#6366f1_35%,#a855f7_70%,#3b82f6_100%)] bg-[length:200%_100%] animate-gradient hover:brightness-110"
              >
                Join GooseNet
              </motion.a>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 text-gray-700 dark:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <motion.span
              animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="inline-flex"
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </motion.span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence initial={false}>
        {mobileMenuOpen && (
          <motion.div
            key="mobile"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, height: 0 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 28 }}
            className="lg:hidden overflow-hidden border-t border-gray-200/60 dark:border-white/10 bg-white/90 dark:bg-gray-950/80 backdrop-blur-xl"
          >
            <div className="space-y-1 px-6 pb-5 pt-3">
              <a
                href="#how-it-works"
                onClick={closeMobile}
                className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                How It Works
              </a>
              {!loading && user ? (
                <Link
                  href="/dashboard"
                  onClick={closeMobile}
                  className="mt-3 block rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 px-3 py-2 text-base font-semibold text-gray-800 dark:text-gray-100"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <a
                    href="/login"
                    onClick={closeMobile}
                    className="mt-3 block rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 px-3 py-2 text-base font-semibold text-gray-800 dark:text-gray-100"
                  >
                    Login
                  </a>
                  <a
                    href="/signup"
                    onClick={closeMobile}
                    className="mt-2 block rounded-xl px-3 py-2 text-center text-base font-semibold text-white shadow-glow-brand bg-[linear-gradient(120deg,#3b82f6_0%,#6366f1_35%,#a855f7_70%,#3b82f6_100%)] bg-[length:200%_100%] animate-gradient"
                  >
                    Join GooseNet
                  </a>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
