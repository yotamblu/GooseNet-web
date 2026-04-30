/**
 * Shared data for JSON-LD and FAQ section.
 * Single source of truth so visible content and schema match.
 */

import { SITE_URL } from "./site-config";

export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GooseNet",
  url: SITE_URL,
  logo: `${SITE_URL}/logo/goosenet_logo.png`,
  sameAs: ["https://github.com/yotamblu/GooseNet-web"],
  description:
    "Free dashboard for track and XC coaches: see every athlete's Garmin load automatically — no logins for athletes, no screenshots, no nagging.",
} as const;

export const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GooseNet",
  url: SITE_URL,
  description:
    "Stop chasing athletes for Garmin screenshots. GooseNet shows coaches every athlete's training load automatically. Free for coaches forever.",
} as const;

export const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "What is GooseNet?",
    answer:
      "GooseNet is a free dashboard for high school and club running coaches. After athletes link Garmin once, you see their real distance, pace, heart rate, and laps — the same file they ran — without texting for screenshots.",
  },
  {
    question: "How does Garmin integration work?",
    answer:
      "Athletes authenticate with Google, then connect their Garmin account through the same OAuth flow you’d use on garmin.com. Completed activities sync into GooseNet so coaches can review training summaries and individual sessions.",
  },
  {
    question: "Who is GooseNet for?",
    answer:
      "Cross country and track coaches who assign structured workouts and need honest mileage data. Athletes keep training on their watches; coaches keep everyone accountable from one dashboard.",
  },
  {
    question: "How do I connect with my coach?",
    answer:
      "Sign up as an athlete with Google, enter the invite code your coach shares, then link Garmin from the dashboard. Coaches invite athletes from their own GooseNet account.",
  },
  {
    question: "What kind of workouts can coaches create?",
    answer:
      "Structured running sessions with warm-ups, tempo blocks, repeats, and cool-downs. Plans can sync to Garmin so athletes execute exactly what you wrote, then you review the completed file automatically.",
  },
  {
    question: "Is GooseNet free?",
    answer:
      "Yes — free for coaches, forever. No credit card, no trial, and no paywall for the coaching dashboard. Athletes link their own Garmin accounts at no cost.",
  },
];

export const HOWTO_STEPS = [
  {
    name: "Athletes link Garmin once",
    text: "Connect a Garmin account through OAuth so every completed run flows into GooseNet without manual uploads.",
  },
  {
    name: "Coach writes the structured workout",
    text: "Author intervals, pacing targets, and recovery, then assign the session to the athletes who need it.",
  },
  {
    name: "Review the honest training file together",
    text: "After the workout, pace, heart rate, and lap splits appear automatically — no screenshot threads.",
  },
] as const;

export function getFAQPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function getHowToJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How coaches use GooseNet with Garmin",
    description:
      "Link Garmin once, assign structured workouts, then review every athlete's completed session without chasing screenshots.",
    step: HOWTO_STEPS.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}
