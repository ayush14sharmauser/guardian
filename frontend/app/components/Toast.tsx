"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

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
const TOAST_ANIMATION_DURATION = 0.3;
const TOAST_EASE = [0.16, 1, 0.3, 1] as const;

const TOAST_BASE_CLASS =
  "flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0e151c]/95 px-4 py-3 text-sm text-white/85 shadow-[0_18px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl";

const TOAST_VARIANTS = {
  success: {
    icon: <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-300" />,
    borderColor: "",
  },
  error: {
    icon: <XCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-rose-300" />,
    borderColor: "border-rose-400/20",
  },
  warning: {
    icon: <AlertTriangle aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-300" />,
    borderColor: "border-amber-400/20",
  },
  info: {
    icon: <Info aria-hidden="true" className="h-4 w-4 shrink-0 text-sky-300" />,
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

  // Clear all pending timers on unmount to prevent state updates on dead components
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
        setToasts((current) => current.filter((toast) => toast.id !== id));
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
    return prefersReducedMotion
      ? {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        }
      : {
          initial: { opacity: 0, y: 12, scale: 0.96 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: 8, scale: 0.96 },
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
      className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const variant = TOAST_VARIANTS[toast.type];

          return (
            <motion.div
              key={toast.id}
              {...animationProps}
              className={`${TOAST_BASE_CLASS} ${variant.borderColor}`}
            >
              {variant.icon}
              {toast.message}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}