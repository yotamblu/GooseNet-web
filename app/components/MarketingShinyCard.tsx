/**
 * Gradient-border frosted card — matches FAQ / marketing sections
 */

import type { ReactNode } from "react";

type MarketingShinyCardProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
};

export default function MarketingShinyCard({
  children,
  className = "",
  innerClassName = "",
}: MarketingShinyCardProps) {
  return (
    <div
      className={`group relative rounded-2xl p-[1px] shadow-lg shadow-blue-500/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-purple-500/10 dark:shadow-blue-500/10 dark:hover:shadow-purple-500/15 ${className}`}
    >
      <div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/35 via-purple-500/25 to-blue-500/35 opacity-90 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-400/25 dark:via-purple-400/20 dark:to-blue-400/25"
        aria-hidden
      />
      <div
        className={`relative h-full overflow-hidden rounded-2xl border border-white/60 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-gray-950/80 ${innerClassName}`}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-blue-50/40 opacity-80 dark:from-white/5 dark:via-transparent dark:to-purple-950/30"
          aria-hidden
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
