/**
 * Why GooseNet Section
 * Differentiation points — shiny cards aligned with FAQ
 */

import MarketingShinyCard from "./MarketingShinyCard";

export default function WhyGooseNet() {
  const points = [
    "Running-only focus",
    "Built around real coaching workflows",
    "Garmin-native data",
    "Designed for performance, not general fitness",
    "Clean, shareable workout insights",
  ];

  return (
    <section className="relative overflow-hidden bg-gray-50 dark:bg-gray-800 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 right-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-500/12" />
        <div className="absolute -bottom-20 -left-16 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl dark:bg-purple-500/12" />
        <div className="absolute top-1/3 left-1/2 h-[380px] w-[min(88vw,480px)] -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500/12 via-blue-500/12 to-purple-500/12 blur-3xl dark:from-purple-500/8 dark:via-blue-500/8 dark:to-purple-500/8" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            Why GooseNet
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-700 dark:text-gray-300">
            A platform built specifically for runners and coaches who take training seriously.
          </p>
        </div>

        <ul
          role="list"
          className="mx-auto mt-14 grid max-w-2xl grid-cols-1 gap-4 sm:gap-5 lg:max-w-none lg:grid-cols-2"
        >
          {points.map((point, index) => (
            <li key={index}>
              <MarketingShinyCard>
                <div className="flex gap-4 p-5 sm:p-6">
                  <div
                    className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-purple-500/30 dark:from-blue-500 dark:to-purple-500 dark:shadow-purple-500/25"
                    aria-hidden
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </div>
                  <p className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                    {point}
                  </p>
                </div>
              </MarketingShinyCard>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
