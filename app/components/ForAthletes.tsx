/**
 * For Athletes Section
 * Benefits and features for runners
 */

export default function ForAthletes() {
  const features = [
    "Receive structured workouts from your coach",
    "Sync workouts directly with Garmin",
    "View detailed workout breakdowns",
    "Track progress over time",
    "Share results automatically",
  ];

  return (
    <section className="bg-white dark:bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              For Athletes
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-700 dark:text-gray-300">
              Execute your training plan with precision. Get structured workouts, sync to your Garmin, and automatically share results with your coach.
            </p>
            <ul role="list" className="mt-8 space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex gap-x-3">
                  <svg
                    className="h-6 w-5 flex-none text-blue-600 dark:text-blue-400 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-base leading-7 text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual Placeholder - Athlete Dashboard */}
          <div className="lg:pl-8">
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
              <div className="space-y-6">
                {/* Workout Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                
                {/* Workout Segments */}
                <div className="space-y-3">
                  <div className="h-16 bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="h-3 w-24 bg-blue-600 dark:bg-blue-500 rounded mb-2"></div>
                    <div className="h-2 w-32 bg-blue-300 dark:bg-blue-700 rounded"></div>
                  </div>
                  <div className="h-16 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <div className="h-3 w-20 bg-gray-400 dark:bg-gray-500 rounded mb-2"></div>
                    <div className="h-2 w-28 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                  <div className="h-16 bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="h-3 w-28 bg-blue-600 dark:bg-blue-500 rounded mb-2"></div>
                    <div className="h-2 w-36 bg-blue-300 dark:bg-blue-700 rounded"></div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="h-8 w-12 bg-gray-300 dark:bg-gray-600 rounded mx-auto mb-1"></div>
                    <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-8 w-12 bg-gray-300 dark:bg-gray-600 rounded mx-auto mb-1"></div>
                    <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-8 w-12 bg-gray-300 dark:bg-gray-600 rounded mx-auto mb-1"></div>
                    <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

