/**
 * Static preview of the real Training Summary layout (stats, distance chart,
 * workout row) using shared marketing demo data.
 */

"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  SectionHeading,
  StatTile,
  fadeUp,
  inViewOnce,
  stagger,
} from "./ui";
import {
  DEMO_DAILY_KM,
  DEMO_PRIMARY_ATHLETE,
  DEMO_SESSION,
  DEMO_SUMMARY_TOTALS,
  DEMO_WORKOUT,
} from "../../lib/marketing/landingDemoData";

const SESSION_ROW_LABEL = `${DEMO_SESSION.distanceKm} km · ${DEMO_SESSION.durationLabel} · ${DEMO_WORKOUT.device}`;

export default function LandingDashboardShowcase() {
  const reduce = useReducedMotion();
  const maxKm = Math.max(...DEMO_DAILY_KM.map((d) => d.km), 0.001);
  /** Fixed plot height (px) so bar heights don’t collapse under flex %-height */
  const BAR_CHART_INNER_H = 124;

  return (
    <section
      id="dashboard-preview"
      className="relative w-full max-w-full overflow-hidden scroll-mt-24 bg-white py-24 sm:py-32 lg:py-40 dark:bg-gray-900"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute -bottom-16 left-1/3 h-80 w-80 rounded-full bg-purple-500/12 blur-3xl dark:bg-purple-500/10" />
      </div>

      <div className="relative mx-auto max-w-7xl w-full min-w-0 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
        >
          <motion.div variants={fadeUp}>
            <SectionHeading
              center
              variant="marketing"
              eyebrow="Sample dashboard"
              title="See every athlete’s load — not a screenshot."
              description="This is the same training summary coaches use in GooseNet: volume over time, totals for the range, and each synced Garmin session in one place."
            />
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mx-auto mt-8 max-w-5xl"
          >
            <div className="glass-surface overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
              {/* App-style header strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/40 px-4 py-3 dark:border-white/10 sm:px-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                    Training summary
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Training insights for {DEMO_PRIMARY_ATHLETE.name}
                  </p>
                </div>
                <Badge variant="brand" size="sm" dot>
                  Preview data
                </Badge>
              </div>

              <div className="space-y-6 p-4 sm:p-6">
                {/* Date card — mirrors training-summary */}
                <Card variant="glass" padding="lg" className="!p-4 sm:!p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                      Quick range
                    </span>
                    {["Last 7 days", "Last 30 days"].map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-gray-200/80 bg-white/60 px-2.5 py-0.5 text-[10px] font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Start date
                      </span>
                      <div className="mt-1 h-9 rounded-xl border border-gray-300/80 bg-white/80 px-3 text-sm leading-9 text-gray-800 dark:border-white/10 dark:bg-gray-900/50 dark:text-gray-100">
                        2026-04-21
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        End date
                      </span>
                      <div className="mt-1 h-9 rounded-xl border border-gray-300/80 bg-white/80 px-3 text-sm leading-9 text-gray-800 dark:border-white/10 dark:bg-gray-900/50 dark:text-gray-100">
                        2026-04-27
                      </div>
                    </div>
                    <div className="flex items-end">
                      <div className="h-9 w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-center text-sm font-semibold leading-9 text-white shadow-md shadow-purple-500/20">
                        Get summary
                      </div>
                    </div>
                  </div>
                </Card>

                <motion.div
                  variants={stagger}
                  className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                >
                  <motion.div variants={fadeUp}>
                    <StatTile
                      label="Total distance"
                      value={DEMO_SUMMARY_TOTALS.totalKm}
                      unit="km"
                      accent="brand"
                      decimals={2}
                      compact
                    />
                  </motion.div>
                  <motion.div variants={fadeUp}>
                    <StatTile
                      label="Avg daily distance"
                      value={DEMO_SUMMARY_TOTALS.avgDailyKm}
                      unit="km"
                      accent="teal"
                      decimals={2}
                      compact
                    />
                  </motion.div>
                  <motion.div variants={fadeUp}>
                    <StatTile
                      label="Total time"
                      value={DEMO_SUMMARY_TOTALS.totalTimeLabel}
                      accent="purple"
                      compact
                    />
                  </motion.div>
                  <motion.div variants={fadeUp}>
                    <StatTile
                      label="Avg daily time"
                      value={DEMO_SUMMARY_TOTALS.avgDailyTimeLabel}
                      accent="amber"
                      compact
                    />
                  </motion.div>
                </motion.div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Badge variant="brand" dot>
                    {DEMO_SUMMARY_TOTALS.startLabel} → {DEMO_SUMMARY_TOTALS.endLabel}
                  </Badge>
                  <Badge variant="neutral">
                    {DEMO_SUMMARY_TOTALS.workoutCount} workouts
                  </Badge>
                  <Badge variant="warning" size="sm" className="border-amber-500/40">
                    Easy to spot rest days & peaks
                  </Badge>
                </div>

                <Card variant="glass" padding="lg" className="min-w-0">
                  <CardHeader className="!pb-2">
                    <CardTitle>Distance by day</CardTitle>
                    <CardDescription>
                      Kilometres per day across the selected range (same chart as the live app)
                    </CardDescription>
                  </CardHeader>
                  <div
                    className="mt-2 w-full overflow-hidden rounded-xl border border-gray-200/50 bg-gray-50/30 dark:border-white/10 dark:bg-white/[0.02]"
                    aria-label="Distance by day, sample data"
                  >
                    <div className="flex min-w-0 gap-0">
                      <div className="flex w-10 shrink-0 flex-col border-r border-gray-200/60 dark:border-white/10 sm:w-11">
                        <div
                          className="relative w-full pr-1"
                          style={{ height: BAR_CHART_INNER_H }}
                        >
                          {[0, 0.5, 1].map((t, i) => (
                            <span
                              key={i}
                              className="absolute right-1 -translate-y-1/2 text-[9px] font-medium tabular-nums text-gray-500 dark:text-gray-400"
                              style={{ bottom: `${t * 100}%` }}
                            >
                              {Math.round(maxKm * t) || 0}
                            </span>
                          ))}
                        </div>
                        <div className="pb-1 text-center text-[8px] font-semibold uppercase tracking-wide text-gray-400">
                          km
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 px-2 pb-2 pt-1">
                        <div className="flex justify-between gap-1.5 sm:gap-2">
                          {DEMO_DAILY_KM.map((d, i) => {
                            const ratio = d.km / maxKm;
                            const barPx =
                              d.km <= 0
                                ? 3
                                : Math.round(
                                    Math.max(14, ratio * BAR_CHART_INNER_H)
                                  );
                            return (
                              <div
                                key={d.label}
                                className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                              >
                                <div
                                  className="flex w-full items-end justify-center"
                                  style={{ height: BAR_CHART_INNER_H }}
                                >
                                  <motion.div
                                    initial={reduce ? false : { scaleY: 0 }}
                                    whileInView={
                                      reduce ? undefined : { scaleY: 1 }
                                    }
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{
                                      delay: i * 0.06,
                                      duration: 0.45,
                                      ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className="w-full max-w-[44px] origin-bottom rounded-t-md bg-gradient-to-t from-blue-600 via-blue-500 to-indigo-400 shadow-sm shadow-blue-500/20 dark:from-blue-500 dark:via-blue-400 dark:to-indigo-300 dark:shadow-blue-500/15"
                                    style={{
                                      height: barPx,
                                      minHeight: d.km > 0 ? 14 : 3,
                                    }}
                                  />
                                </div>
                                <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400">
                                  {d.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card variant="glass" padding="md" className="border-teal-500/25">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                        Apr 24 · {DEMO_WORKOUT.name}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {SESSION_ROW_LABEL}
                      </p>
                    </div>
                    <Badge variant="success" size="sm" dot>
                      From Garmin
                    </Badge>
                  </div>
                </Card>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-gray-500 sm:mt-6 sm:text-sm dark:text-gray-400">
              Illustrative numbers only — your team’s real Garmin data appears here after sync.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
