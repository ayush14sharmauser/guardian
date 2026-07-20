"use client";

import { useEffect, useRef, useState } from "react";

type UseInViewOptions = {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
};

/**
 * Lightweight scroll-reveal primitive. Deliberately built on the native
 * IntersectionObserver instead of a motion library so it adds zero new
 * dependencies to the project. Returns a ref to attach to the observed
 * element and a boolean that flips to `true` once it enters the viewport.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.2,
  rootMargin = "0px 0px -10% 0px",
  triggerOnce = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Environments without IntersectionObserver just show content immediately.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) observer.unobserve(node);
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, inView };
}