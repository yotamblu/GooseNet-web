/**
 * GooseNet Landing Page
 * Running-focused platform connecting athletes and coaches
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Header from "../components/Header";
import Hero from "../components/Hero";
import AnimatedDemoSection from "../components/AnimatedDemoSection";
import ForCoaches from "../components/ForCoaches";
import HowItWorks from "../components/HowItWorks";
import WhyGooseNet from "../components/WhyGooseNet";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";
import { FAQ_ITEMS } from "../../lib/json-ld";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen min-h-[100dvh] bg-white dark:bg-gray-900">
      <Header />
      <Hero />
      <AnimatedDemoSection />
      <ForCoaches />
      <HowItWorks />
      <WhyGooseNet />
      <section id="faq" className="bg-white dark:bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-700 dark:text-gray-300">
              Quick answers about GooseNet and how it works.
            </p>
          </div>
          <dl className="mx-auto mt-16 grid max-w-2xl gap-8 lg:max-w-none lg:grid-cols-1">
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} className="flex flex-col gap-2">
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">
                  {item.question}
                </dt>
                <dd className="text-base leading-7 text-gray-600 dark:text-gray-400">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <FinalCTA />
      <Footer />
    </main>
  );
}
