/**
 * Core Value Section - What GooseNet Does
 * "Built for Real Running Training"
 */

export default function CoreValue() {
  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            Built for Real Running Training
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-700 dark:text-gray-300">
            GooseNet is a focused platform designed specifically for runners and coaches.
            It helps athletes execute structured workouts and allows coaches to plan, review, and analyze performance using real data from Garmin devices.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {/* Create & Share Structured Workouts */}
            <div className="relative">
              <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Create & share structured running workouts
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                Build detailed workout plans with intervals, pace zones, and rest periods. Share instantly with athletes.
              </dd>
            </div>

            {/* Sync with Garmin */}
            <div className="relative">
              <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                </div>
                Sync workouts with Garmin
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                Workouts automatically sync to Garmin devices. Train with structured guidance on your wrist.
              </dd>
            </div>

            {/* Review Performance Data */}
            <div className="relative">
              <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Review pace, heart rate, elevation, and laps
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                Analyze completed workouts with comprehensive metrics. See exactly how the session was executed.
              </dd>
            </div>

            {/* Communicate Through Data */}
            <div className="relative">
              <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                Communicate through shared training data
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-400">
                Coaches and athletes stay aligned with real-time workout data. No screenshots, no guesswork.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

