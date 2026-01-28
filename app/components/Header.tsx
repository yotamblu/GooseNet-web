/**
 * Header/Navigation Component
 * Top navigation bar with logo and menu items
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { getProfilePicSrc } from "../../lib/profile-pic-utils";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8" aria-label="Global">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo/goosenet_logo.png"
            alt="GooseNet"
            width={32}
            height={32}
            className="h-8 w-auto"
            priority
          />
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">GooseNet</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:ml-12 lg:gap-x-12">
          <a href="#how-it-works" className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            How It Works
          </a>
        </div>

        {/* Desktop CTA Buttons */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-4">
          <ThemeToggle />
          {!loading && user ? (
            <>
              {user.profilePicString && (
                <Link href="/dashboard" className="hidden lg:flex items-center">
                  <img
                    src={getProfilePicSrc(user.profilePicString)}
                    alt={user.userName}
                    referrerPolicy="no-referrer"
                    className="h-10 w-10 rounded-full border-2 border-gray-300 dark:border-gray-700 object-cover hover:border-blue-600 dark:hover:border-blue-400 transition-colors"
                    onError={(e) => {
                      // Fallback: hide image if it fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </Link>
              )}
              <Link
                href="/dashboard"
                className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                Login
              </a>
              <a
                href="/signup"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                Join GooseNet
              </a>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="space-y-1 px-6 pb-4 pt-2">
            <a
              href="#how-it-works"
              className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            {!loading && user ? (
              <Link
                href="/dashboard"
                className="block rounded-lg border-2 border-gray-300 dark:border-gray-700 px-3 py-2 text-base font-semibold leading-7 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 mt-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <a
                  href="/login"
                  className="block rounded-lg border-2 border-gray-300 dark:border-gray-700 px-3 py-2 text-base font-semibold leading-7 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 mt-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="block rounded-lg bg-blue-600 px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-blue-700 mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Join GooseNet
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

