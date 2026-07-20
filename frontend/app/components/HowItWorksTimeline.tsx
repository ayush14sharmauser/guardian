"use client";

import { memo } from "react";
import { motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type TimelineStep = {
  title: string;
  description: string;
};

interface HowItWorksTimelineProps {
  steps: readonly TimelineStep[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ANIMATION_DURATION = 0.5;
const STAGGER_DELAY = 0.08;
const VIEWPORT_MARGIN = "-60px";
const EASING = [0.16, 1, 0.3, 1] as const;

const formatStepNumber = (index: number) =>
  String(index + 1).padStart(2, "0");

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Displays the workflow explaining how Guardian
 * analyzes a repository from scan to report generation.
 */
export default memo(function HowItWorksTimeline({
  steps,
}: HowItWorksTimelineProps) {
  return (
    <section
      aria-label="Guardian workflow"
      className="relative grid gap-8 lg:grid-cols-4"
    >
      {steps.map((step, index) => (
        <motion.div
          key={`${index}-${step.title}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: VIEWPORT_MARGIN }}
          transition={{
            duration: ANIMATION_DURATION,
            delay: index * STAGGER_DELAY,
            ease: EASING,
          }}
          className="group relative flex min-h-[220px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/25 hover:bg-white/[0.05]"
        >
          <span className="font-mono text-xs text-emerald-300/70">
            {formatStepNumber(index)}
          </span>

          <p className="mt-5 text-[15px] font-semibold text-white">
            {step.title}
          </p>

          <p className="mt-4 text-sm leading-7 text-white/50">
            {step.description}
          </p>

          {index < steps.length - 1 && (
            <span className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-3 -translate-y-1/2 translate-x-full bg-white/10 lg:block" />
          )}
        </motion.div>
      ))}
    </section>
  );
});