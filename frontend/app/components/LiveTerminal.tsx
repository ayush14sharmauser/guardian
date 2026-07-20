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

const TYPE_SPEED_MS = 32;
const LINE_DELAY_MS = 420;
const HOLD_AFTER_COMPLETE_MS = 3200;
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
    const listener = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      // Show the finished state once, no looping animation.
      setTypedChars(COMMAND.length);
      setVisibleLines(LOG_LINES.length);
      return;
    }

    let cancelled = false;

    const typeCommand = (index: number) => {
      if (cancelled) return;
      if (index <= COMMAND.length) {
        setTypedChars(index);
        timeoutRef.current = setTimeout(() => typeCommand(index + 1), TYPE_SPEED_MS);
      } else {
        timeoutRef.current = setTimeout(() => revealLine(0), LINE_DELAY_MS);
      }
    };

    const revealLine = (index: number) => {
      if (cancelled) return;
      if (index < LOG_LINES.length) {
        setVisibleLines(index + 1);
        timeoutRef.current = setTimeout(() => revealLine(index + 1), LINE_DELAY_MS);
      } else {
        timeoutRef.current = setTimeout(() => {
          setTypedChars(0);
          setVisibleLines(0);
          timeoutRef.current = setTimeout(() => typeCommand(0), RESET_PAUSE_MS);
        }, HOLD_AFTER_COMPLETE_MS);
      }
    };

    typeCommand(0);

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [reducedMotion]);

  const commandText = COMMAND.slice(0, typedChars);
  const isTypingCommand = typedChars < COMMAND.length;
  const isComplete = visibleLines === LOG_LINES.length;

  return (
    <div className="relative mx-auto w-full max-w-[480px]">
      <div aria-hidden="true" className="absolute -inset-10 rounded-full bg-emerald-400/15 blur-[70px]" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.14] bg-[#0c1511]/80 shadow-[0_36px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="flex items-center gap-2 border-b border-white/[0.09] bg-black/20 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" />
          <span className="ml-3 font-mono text-[11px] text-white/40">guardian — terminal</span>
        </div>

        <div
          aria-label="Animated demo of a Guardian repository scan running in a terminal"
          className="min-h-[268px] p-4 font-mono text-[13px] leading-6 sm:p-5"
          role="img"
        >
          <div className="flex flex-wrap items-center gap-1 text-emerald-200">
            <span className="text-white/40">$</span>
            <span>{commandText}</span>
            {isTypingCommand && <span className="terminal-cursor inline-block h-[14px] w-[7px] bg-emerald-200" />}
          </div>

          <div className="mt-3 space-y-1.5">
            {LOG_LINES.slice(0, visibleLines).map((line) => (
              <div className="flex items-center gap-2 text-white/75" key={line}>
                <span className="text-emerald-300">✓</span>
                <span>{line}</span>
              </div>
            ))}
            {isComplete && (
              <div className="mt-2 flex items-center gap-2 text-white/40">
                <span>$</span>
                <span className="terminal-cursor inline-block h-[14px] w-[7px] bg-white/40" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}