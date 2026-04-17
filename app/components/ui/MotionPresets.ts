/**
 * MotionPresets — shared framer-motion variants and tuned transitions.
 *
 * Import these everywhere so the platform shares one motion vocabulary.
 * All consumers should still gate animations on `useReducedMotion()` when appropriate;
 * the CSS side already collapses durations under `prefers-reduced-motion: reduce`.
 *
 * Usage:
 *   import { fadeUp, stagger, scaleIn, slideInRight, fadeIn, springSoft, transitionQuick } from "@/app/components/ui/MotionPresets";
 *   <motion.div variants={fadeUp} initial="hidden" animate="show" />
 */

import type { Transition, Variants } from "framer-motion";

export const springSoft: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.9,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 0.7,
};

export const transitionQuick: Transition = {
  duration: 0.25,
  ease: [0.22, 1, 0.36, 1],
};

export const transitionSmooth: Transition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1],
};

/** Fade in with a gentle upward slide. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: transitionSmooth,
  },
};

/** Pure fade. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: transitionSmooth },
};

/** Scale + fade — nice for modals, dialogs, popovers. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: springSoft,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: transitionQuick,
  },
};

/** Slide in from the right — drawers, sheets, side panels. */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  show: {
    opacity: 1,
    x: 0,
    transition: transitionSmooth,
  },
  exit: {
    opacity: 0,
    x: 32,
    transition: transitionQuick,
  },
};

/** Slide in from the bottom — toasts, mobile sheets. */
export const slideInUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: springSoft,
  },
  exit: {
    opacity: 0,
    y: 24,
    transition: transitionQuick,
  },
};

/**
 * Stagger container — pair with `fadeUp` (or similar) on each child:
 *   <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
 *     <motion.div variants={fadeUp} />
 *     <motion.div variants={fadeUp} />
 *   </motion.div>
 */
export const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

/** Tighter stagger for dense grids / lists. */
export const staggerTight: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.035,
    },
  },
};

/** Hover lift — use as `whileHover={hoverLift}` on cards/buttons. */
export const hoverLift = {
  y: -2,
  transition: springSnappy,
} as const;

/** Button-style scale interactions. */
export const hoverScale = {
  scale: 1.02,
  transition: springSnappy,
} as const;

export const tapScale = {
  scale: 0.98,
  transition: { duration: 0.08 },
} as const;

/** Default viewport config for scroll-triggered animations. */
export const inViewOnce = {
  once: true,
  amount: 0.25 as const,
};
