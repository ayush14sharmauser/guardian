"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastItem[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_TOAST_DURATION = 3200;
const TOAST_ANIMATION_DURATION = 0.32;
const TOAST_EASE = [0.22, 1, 0.36, 1] as const;

const TOAST_BASE_CLASS =
  "flex min-w-[320px] max-w-[420px] items-center gap-3 rounded-2xl border border-white/10 bg-[#0d141b]/95 px-5 py-4 text-sm font-medium text-white/90 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl";

const TOAST_VARIANTS = {
  success: {
    icon: (
      <CheckCircle2
        aria-hidden="true"
        className="h-5 w-5 shrink-0 text-emerald-300"
      />
    ),
    borderColor: "border-emerald-400/20",
  },
  error: {
    icon: (
      <XCircle
        aria-hidden="true"
        className="h-5 w-5 shrink-0 text-rose-300"
      />
    ),
    borderColor: "border-rose-400/20",
  },
  warning: {
    icon: (
      <AlertTriangle
        aria-hidden="true"
        className="h-5 w-5 shrink-0 text-amber-300"
      />
    ),
    borderColor: "border-amber-400/20",
  },
  info: {
    icon: (
      <Info
        aria-hidden="true"
        className="h-5 w-5 shrink-0 text-sky-300"
      />
    ),
    borderColor: "border-sky-400/20",
  },
} as const;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "success",
      duration: number = DEFAULT_TOAST_DURATION,
    ) => {
      const id = crypto.randomUUID();

      setToasts((current) => [...current, { id, message, type }]);

      const timer = setTimeout(() => {
        setToasts((current) =>
          current.filter((toast) => toast.id !== id),
        );

        timersRef.current.delete(id);
      }, duration);

      timersRef.current.set(id, timer);
    },
    [],
  );

  return { toasts, showToast };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ToastContainer({ toasts }: ToastContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  const animationProps = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }

    return {
      initial: {
        opacity: 0,
        x: 24,
        scale: 0.96,
      },
      animate: {
        opacity: 1,
        x: 0,
        scale: 1,
      },
      exit: {
        opacity: 0,
        x: 24,
        scale: 0.96,
      },
      transition: {
        duration: TOAST_ANIMATION_DURATION,
        ease: TOAST_EASE,
      },
    };
  }, [prefersReducedMotion]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed bottom-8 right-8 z-[100] flex flex-col gap-3"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const variant = TOAST_VARIANTS[toast.type];

          return (
            <motion.div
              key={toast.id}
              layout
              {...animationProps}
              className={`${TOAST_BASE_CLASS} ${variant.borderColor}`}
            >
              {variant.icon}

              <span className="flex-1 leading-6">
                {toast.message}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}