/**
 * Why GooseNet Section
 * Differentiation points
 */

export default function WhyGooseNet() {
  const points = [
    "Running-only focus",
    "Built around real coaching workflows",
    "Garmin-native data",
    "Designed for performance, not general fitness",
    "Clean, shareable workout insights",
  ];

  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            Why GooseNet
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-700 dark:text-gray-300">
            A platform built specifically for runners and coaches who take training seriously.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-12">
            {points.map((point, index) => (
              <div key={index} className="relative flex gap-x-4">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-blue-600">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </div>
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                  {point}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

