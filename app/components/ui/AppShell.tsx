"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { getProfilePicSrc } from "../../../lib/profile-pic-utils";
import ThemeToggle from "../ThemeToggle";
import Footer from "../Footer";
import PageContainer, { type PageContainerWidth } from "./PageContainer";
import PageHeader from "./PageHeader";
import { cn } from "./cn";

export interface AppShellNavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

export interface AppShellProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  /** Override default nav items shown in the top bar when authed. */
  nav?: AppShellNavItem[];
  /** Hide the built-in nav entirely. */
  hideNav?: boolean;
  /** Hide the aurora gradient backdrop. */
  plainBackground?: boolean;
  /** Do not render the built-in Footer. */
  hideFooter?: boolean;
  /** Hide the built-in PageHeader even if `title` is provided (useful if the page renders its own). */
  hidePageHeader?: boolean;
  /** Max width of the `<PageContainer>` wrapping children. */
  maxWidth?: PageContainerWidth;
  /** Apply gradient text to the PageHeader title. */
  gradientTitle?: boolean;
  className?: string;
  children: React.ReactNode;
}

const COACH_NAV: AppShellNavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/athletes", label: "Athletes" },
  { href: "/flocks", label: "Flocks" },
  { href: "/settings", label: "Settings" },
];

const ATHLETE_NAV: AppShellNavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/activities", label: "Activities" },
  { href: "/planned-workouts", label: "Planned" },
  { href: "/sleep", label: "Sleep" },
  { href: "/settings", label: "Settings" },
];

const FALLBACK_NAV: AppShellNavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
];

function getDefaultNavForRole(role: string | undefined): AppShellNavItem[] {
  const normalized = role?.toLowerCase();
  if (normalized === "coach") return COACH_NAV;
  if (normalized === "athlete") return ATHLETE_NAV;
  return FALLBACK_NAV;
}

export default function AppShell({
  title,
  subtitle,
  eyebrow,
  actions,
  nav,
  hideNav = false,
  plainBackground = false,
  hideFooter = false,
  hidePageHeader = false,
  maxWidth = "xl",
  gradientTitle = false,
  className,
  children,
}: AppShellProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname() ?? "";
  const reduce = useReducedMotion();
  const navItems = nav ?? getDefaultNavForRole(user?.role);
  const authed = !loading && !!user;

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col",
        !plainBackground && "bg-aurora-subtle",
        "bg-white dark:bg-[#0b0f17]",
        className
      )}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-200/60 dark:border-white/10 bg-white/70 dark:bg-gray-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-16">
          <Link href={authed ? "/dashboard" : "/"} className="group flex items-center gap-2 shrink-0">
            <motion.span
              whileHover={reduce ? undefined : { rotate: -8, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="relative inline-flex h-8 w-8 items-center justify-center"
            >
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/40 via-purple-500/30 to-teal-400/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <Image
                src="/logo/goosenet_logo.png"
                alt=""
                width={32}
                height={32}
                className="relative h-8 w-8 object-contain"
                priority
              />
            </motion.span>
            <span className="text-base font-semibold tracking-tight text-gray-900 dark:text-gray-50">
              GooseNet
            </span>
          </Link>

          {!hideNav && authed && (
            <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
              {navItems.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                      active
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="appshell-active-nav"
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 380, damping: 30 }
                        }
                        aria-hidden
                        className="absolute inset-0 rounded-lg bg-gray-900/5 dark:bg-white/5"
                      />
                    )}
                    <span className="relative z-[1] inline-flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {authed && user?.profilePicString ? (
              <Link
                href="/dashboard"
                aria-label={`${user.userName ?? "Profile"} — dashboard`}
                className="group relative inline-flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-teal-400 opacity-70 blur-sm scale-105 transition-opacity group-hover:opacity-100"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getProfilePicSrc(user.profilePicString)}
                  alt={user.userName ?? "Profile"}
                  referrerPolicy="no-referrer"
                  className="relative h-9 w-9 rounded-full border-2 border-white dark:border-gray-900 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </Link>
            ) : (
              !loading && (
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Sign in
                </Link>
              )
            )}
          </div>
        </div>

        {/* Mobile nav (scrollable row) */}
        {!hideNav && authed && (
          <div className="md:hidden border-t border-gray-200/60 dark:border-white/10">
            <div className="mx-auto max-w-7xl overflow-x-auto px-2">
              <nav
                className="flex items-center gap-1 py-2 whitespace-nowrap"
                aria-label="Primary (mobile)"
              >
                {navItems.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium",
                        active
                          ? "bg-gray-900/5 dark:bg-white/10 text-gray-900 dark:text-white"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="relative flex-1">
        <PageContainer width={maxWidth}>
          {title && !hidePageHeader && (
            <PageHeader
              title={title}
              subtitle={subtitle}
              eyebrow={eyebrow}
              actions={actions}
              gradient={gradientTitle}
            />
          )}
          {children}
        </PageContainer>
      </main>

      {!hideFooter && <Footer />}
    </div>
  );
}
