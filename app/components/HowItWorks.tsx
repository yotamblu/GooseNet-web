/**
 * How It Works Section Component
 * Simple 3-step workflow — shiny cards aligned with FAQ
 */

import MarketingShinyCard from "./MarketingShinyCard";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    number: "1",
    title: "Connect Garmin",
    description:
      "Link your Garmin account to sync workouts and performance data automatically.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
        />
      </svg>
    ),
  },
  {
    number: "2",
    title: "Create or receive structured workouts",
    description:
      "Coaches build detailed workout plans. Athletes receive them instantly, ready to sync.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    number: "3",
    title: "Train, sync, and analyze performance",
    description:
      "Execute workouts on your Garmin, then review detailed metrics and share insights with your coach.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-white dark:bg-gray-900 py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-purple-500/25 blur-3xl dark:bg-purple-500/15" />
        <div className="absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl dark:bg-blue-500/15" />
        <div className="absolute top-1/2 left-1/2 h-[420px] w-[min(90vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-blue-500/15 blur-3xl dark:from-blue-500/10 dark:via-purple-500/10 dark:to-blue-500/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-700 dark:text-gray-300">
            A straightforward workflow designed for real training.
          </p>
        </div>

        <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-1 gap-4 sm:gap-5 lg:max-w-none lg:grid-cols-3">
          {steps.map((step) => (
            <MarketingShinyCard key={step.number} className="h-full">
              <div className="flex h-full flex-col items-center px-5 pb-6 pt-7 text-center sm:px-6 sm:pb-7 sm:pt-8">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-xl font-bold text-white shadow-md shadow-purple-500/30 dark:from-blue-500 dark:to-purple-500 dark:shadow-purple-500/25"
                  aria-hidden
                >
                  {step.number}
                </div>

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/25 text-blue-600 dark:from-blue-500/15 dark:to-purple-500/20 dark:text-blue-400">
                  {step.icon}
                </div>

                <dt className="text-lg font-semibold leading-7 text-gray-900 dark:text-gray-100">
                  {step.title}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                  {step.description}
                </dd>
              </div>
            </MarketingShinyCard>
          ))}
        </dl>
      </div>
    </section>
  );
}
