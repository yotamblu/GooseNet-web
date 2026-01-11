/**
 * Final CTA Section
 * "Ready to Train With Purpose?"
 */

export default function FinalCTA() {
  return (
    <section id="cta" className="bg-white dark:bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            Ready to Train With Purpose?
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-700 dark:text-gray-300">
            Join runners and coaches who are using GooseNet to elevate their training.
          </p>
          <div className="mt-10 flex items-center justify-center">
            <a
              href="/signup"
              className="rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900 sm:px-10 sm:py-5 sm:text-lg"
            >
              Get Started with GooseNet
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

