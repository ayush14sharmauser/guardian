"use client";

import { useEffect, useRef, useState } from "react";

const COMMAND = "guardian scan https://github.com/vercel/next.js";

const LOG_LINES = [
  "Fetching repository",
  "Downloading repository tree",
  "Detecting secrets",
  "AI Investigation",
  "Risk Score Generated",
  "MITRE ATT&CK Mapping",
  "OWASP Mapping",
  "Security Report Generated",
  "Analysis Complete",
];

const TYPE_SPEED_MS = 30;
const LINE_DELAY_MS = 380;
const HOLD_AFTER_COMPLETE_MS = 3400;
const RESET_PAUSE_MS = 500;

// Purely presentational — demonstrates what a real `guardian scan` run looks
// like without calling the API. The actual analyzer below still does the work.
export default function LiveTerminal() {
  const [typedChars, setTypedChars] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    setReducedMotion(query.matches);

    const listener = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);

    query.addEventListener("change", listener);

    return () => query.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setTypedChars(COMMAND.length);
      setVisibleLines(LOG_LINES.length);
      return;
    }

    let cancelled = false;

    const typeCommand = (index: number) => {
      if (cancelled) return;

      if (index <= COMMAND.length) {
        setTypedChars(index);

        timeoutRef.current = setTimeout(
          () => typeCommand(index + 1),
          TYPE_SPEED_MS
        );
      } else {
        timeoutRef.current = setTimeout(
          () => revealLine(0),
          LINE_DELAY_MS
        );
      }
    };

    const revealLine = (index: number) => {
      if (cancelled) return;

      if (index < LOG_LINES.length) {
        setVisibleLines(index + 1);

        timeoutRef.current = setTimeout(
          () => revealLine(index + 1),
          LINE_DELAY_MS
        );
      } else {
        timeoutRef.current = setTimeout(() => {
          setTypedChars(0);
          setVisibleLines(0);

          timeoutRef.current = setTimeout(
            () => typeCommand(0),
            RESET_PAUSE_MS
          );
        }, HOLD_AFTER_COMPLETE_MS);
      }
    };

    typeCommand(0);

    return () => {
      cancelled = true;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [reducedMotion]);

  const commandText = COMMAND.slice(0, typedChars);
  const isTypingCommand = typedChars < COMMAND.length;
  const isComplete = visibleLines === LOG_LINES.length;

  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div
        aria-hidden="true"
        className="absolute -inset-12 rounded-full bg-emerald-400/20 blur-[100px]"
      />

      <div className="relative overflow-hidden rounded-[30px] border border-white/15 bg-[#0b1411]/85 shadow-[0_40px_120px_rgba(0,0,0,0.65)] backdrop-blur-3xl">

        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-5 py-4">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/80" />

          <span className="ml-3 font-mono text-xs tracking-wide text-white/45">
            guardian — terminal
          </span>
        </div>

        <div
          role="img"
          aria-label="Animated demo of a Guardian repository scan running in a terminal"
          className="min-h-[340px] p-7 font-mono text-[14px] leading-8 sm:min-h-[380px] sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-1 text-emerald-200">
            <span className="text-white/40">$</span>

            <span>{commandText}</span>

            {isTypingCommand && (
              <span className="terminal-cursor inline-block h-4 w-2 bg-emerald-200" />
            )}
          </div>

          <div className="mt-5 space-y-2">
            {LOG_LINES.slice(0, visibleLines).map((line) => (
              <div
                key={line}
                className="flex items-center gap-3 text-white/80"
              >
                <span className="text-emerald-300">✓</span>

                <span>{line}</span>
              </div>
            ))}

            {isComplete && (
              <div className="mt-4 flex items-center gap-2 text-white/40">
                <span>$</span>

                <span className="terminal-cursor inline-block h-4 w-2 bg-white/40" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}