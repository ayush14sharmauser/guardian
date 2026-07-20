"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const VIEWPORT_MARGIN = "-120px";
const DEFAULT_DURATION = 0.7;
const DEFAULT_DISTANCE = 28;

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
}

/**
 * Reveals children with a fade-and-slide animation
 * when they enter the viewport.
 */
export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = DEFAULT_DISTANCE,
  duration = DEFAULT_DURATION,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  const directionMap = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  if (prefersReducedMotion) {
    return (
      <motion.div
  className={`${className} will-change-transform`}
        initial={false}
        animate={{ opacity: 1 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directionMap[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: VIEWPORT_MARGIN }}
      transition={{
  duration,
  delay: delay / 1000,
  ease: [0.22, 1, 0.36, 1],
}}
    >
      {children}
    </motion.div>
  );
}