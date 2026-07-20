"use client";

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  FolderGit2,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const TERMINAL_LINES = [
  "✓ Repository Loaded",
  "✓ Detecting Secrets...",
  "✓ AWS Key Found",
  "✓ AI Investigation Complete",
  "✓ Risk Score Calculated",
  "✓ Security Report Ready",
] as const;

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const FEATURES: Feature[] = [
  {
    title: "AI-Powered Analysis",
    description: "Automated security investigations.",
    icon: Sparkles,
  },
  {
    title: "Public GitHub Repositories",
    description: "Scan repositories for exposed secrets.",
    icon: FolderGit2,
  },
  {
    title: "Markdown • JSON • PDF",
    description: "Generate downloadable reports.",
    icon: FileText,
  },
  {
    title: "Security-First Workflow",
    description: "CI/CD ready workflow.",
    icon: ShieldCheck,
  },
];

const CHAR_MS = 28;
const LINE_PAUSE_MS = 420;

function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function Caret({ reduceMotion }: { reduceMotion: boolean }) {
  if (reduceMotion) {
    return (
      <span
        className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-emerald-400 align-middle"
        aria-hidden="true"
      />
    );
  }

  return (
    <motion.span
      className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-emerald-400 align-middle"
      aria-hidden="true"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
}

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = prefersReducedMotion === true;

  const [visibleCount, setVisibleCount] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    if (reduceMotion) {
      setVisibleCount(TERMINAL_LINES.length);
      setTypedText(TERMINAL_LINES[TERMINAL_LINES.length - 1] ?? "");
      setIsComplete(true);
      return;
    }

    let cancelled = false;
    let charTimer: ReturnType<typeof setTimeout> | undefined;
    let lineTimer: ReturnType<typeof setTimeout> | undefined;

    const typeLine = (lineIndex: number) => {
      if (cancelled || lineIndex >= TERMINAL_LINES.length) {
        if (!cancelled) setIsComplete(true);
        return;
      }

      const full = TERMINAL_LINES[lineIndex] ?? "";
      setVisibleCount(lineIndex);
      setTypedText("");

      let charIndex = 0;

      const typeChar = () => {
        if (cancelled) return;
        charIndex += 1;
        setTypedText(full.slice(0, charIndex));

        if (charIndex < full.length) {
          charTimer = setTimeout(typeChar, CHAR_MS);
        } else {
          setVisibleCount(lineIndex + 1);
          if (lineIndex + 1 < TERMINAL_LINES.length) {
            lineTimer = setTimeout(
              () => typeLine(lineIndex + 1),
              LINE_PAUSE_MS
            );
          } else {
            setIsComplete(true);
          }
        }
      };

      charTimer = setTimeout(typeChar, CHAR_MS);
    };

    lineTimer = setTimeout(() => typeLine(0), 600);

    return () => {
      cancelled = true;
      if (charTimer) clearTimeout(charTimer);
      if (lineTimer) clearTimeout(lineTimer);
    };
  }, [hasMounted, reduceMotion]);

  const handlePrimary = useCallback(() => {
    scrollToId("analysis");
  }, []);

  const handleSecondary = useCallback(() => {
    scrollToId("features");
  }, []);

  const onKeyActivate = useCallback(
    (fn: () => void) => (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fn();
      }
    },
    []
  );

  const fadeInitial = reduceMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 24 };
  const fadeAnimate = { opacity: 1, y: 0 };

  const gridStyle: CSSProperties = {
    backgroundImage: `
      linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
    `,
    backgroundSize: "64px 64px",
    maskImage:
      "radial-gradient(ellipse 80% 70% at 50% 0%, black 20%, transparent 75%)",
    WebkitMaskImage:
      "radial-gradient(ellipse 80% 70% at 50% 0%, black 20%, transparent 75%)",
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate min-h-screen overflow-hidden bg-zinc-950 text-zinc-100"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.18),transparent_55%),linear-gradient(to_bottom,#09090b_0%,#09090b_40%,#0a0a0f_100%)]" />
        <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-emerald-500/25 blur-[120px]" />
        <div className="absolute -right-24 top-40 h-[380px] w-[380px] rounded-full bg-emerald-400/15 blur-[110px]" />
        <div className="absolute bottom-0 left-1/2 h-[320px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-600/10 blur-[100px]" />
        <div className="absolute inset-0 opacity-60" style={gridStyle} />
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] flex-col px-6 pb-40 pt-44 sm:px-8 lg:px-12 lg:pb-44 lg:pt-52">
        <div className="grid gap-24 lg:grid-cols-2 lg:gap-36">
          <div className="flex flex-col items-start">
            <motion.div
              initial={fadeInitial}
              animate={fadeAnimate}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-400 backdrop-blur-md">
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"
                  aria-hidden="true"
                />
                Autonomous AI Security Engineer
              </span>
            </motion.div>

            <motion.h1
              id="hero-heading"
              initial={fadeInitial}
              animate={fadeAnimate}
              transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
              className="mt-12 max-w-2xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-[4.1rem] lg:leading-[1.05]"
            >
              AI Security Engineer for{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                GitHub Repositories
              </span>
            </motion.h1>

            <motion.p
              initial={fadeInitial}
              animate={fadeAnimate}
              transition={{ duration: 0.55, delay: 0.16, ease: "easeOut" }}
              className="mt-10 max-w-xl text-lg leading-8 text-zinc-400"
            >
              Guardian scans public repositories, detects secrets, analyzes
              vulnerabilities, and generates AI-powered security reports — so
              your team ships faster without compromising security.
            </motion.p>

            <motion.div
              initial={fadeInitial}
              animate={fadeAnimate}
              transition={{ duration: 0.55, delay: 0.24, ease: "easeOut" }}
              className="mt-14 flex flex-wrap items-center gap-5"
            >
              <button
                type="button"
                onClick={handlePrimary}
                onKeyDown={onKeyActivate(handlePrimary)}
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-7 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_0_0_1px_rgba(16,185,129,0.4),0_8px_24px_-6px_rgba(16,185,129,0.55)] transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_0_0_1px_rgba(52,211,153,0.5),0_12px_28px_-6px_rgba(16,185,129,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.98]"
              >
                Start Analysis
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                onClick={handleSecondary}
                onKeyDown={onKeyActivate(handleSecondary)}
                className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-zinc-100 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 active:scale-[0.98]"
              >
                View Features
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={fadeInitial}
            animate={fadeAnimate}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="relative w-full"
          >
            <div
              className="absolute -inset-2 rounded-[28px] bg-gradient-to-b from-emerald-500/40 via-white/10 to-transparent opacity-90 blur-sm"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 shadow-2xl shadow-emerald-950/40 backdrop-blur-xl">
              <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.03] px-4 py-3">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <p className="ml-2 flex-1 truncate font-mono text-xs text-zinc-500">
                  guardian@security — ai-scan
                </p>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                  live
                </span>
              </div>

              <div
                className="min-h-[460px] p-8 font-mono text-[15px] leading-9 sm:min-h-[500px] sm:p-10"
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                aria-label="Guardian security scan terminal output"
              >
                <p className="mb-3 text-zinc-500">
                  <span className="text-emerald-500">$</span> guardian scan
                  --repo org/app --ai
                </p>

                <ul className="space-y-1">
                  {TERMINAL_LINES.map((line, index) => {
                    const isDone = index < visibleCount;
                    const isTyping =
                      index === visibleCount && !isComplete && !reduceMotion;
                    const show =
                      isDone ||
                      isTyping ||
                      (reduceMotion && index < TERMINAL_LINES.length);

                    if (!show && !reduceMotion) return null;

                    const content =
                      isDone || reduceMotion ? line : typedText;
                    const isAlert = line.includes("AWS Key");

                    return (
                      <li
                        key={line}
                        className={
                          isAlert
                            ? "text-amber-300"
                            : line.includes("Ready")
                              ? "text-emerald-400"
                              : "text-zinc-300"
                        }
                      >
                        <span>{content}</span>
                        {isTyping ? (
                          <Caret reduceMotion={reduceMotion} />
                        ) : null}
                      </li>
                    );
                  })}

                  {isComplete ? (
                    <li className="text-zinc-300">
                      <span className="text-emerald-500">$</span>
                      <Caret reduceMotion={reduceMotion} />
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

       

        <div id="analysis" className="sr-only" aria-hidden="true" />
      </div>
    </section>
  );
}