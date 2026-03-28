/**
 * For Coaches Section
 * Benefits and features (demo lives in hero)
 */

export default function ForCoaches() {
  const features = [
    "Create structured running workouts",
    "Assign workouts to athletes",
    "Review completed sessions with real metrics",
    "Analyze pace consistency, heart rate trends, and laps",
    "Coach using data, not screenshots",
  ];

  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">For Coaches</h2>
          <p className="mt-6 text-lg leading-8 text-gray-700 dark:text-gray-300">
            Plan, assign, and analyze with real performance data. See exactly how workouts were executed and provide targeted
            feedback.
          </p>
          <ul role="list" className="mt-10 space-y-4 text-left sm:mt-12">
            {features.map((feature, index) => (
              <li key={index} className="flex gap-x-3">
                <svg
                  className="mt-0.5 h-6 w-5 flex-none text-blue-600 dark:text-blue-400"
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
      </div>
    </section>
  );
}
