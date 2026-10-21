"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/** Student-segment error boundary — keeps the shell and gives a plain next step. */
export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Student portal error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-5">
      <div className="tp-reveal w-full rounded-2xl border border-border/90 bg-card px-6 py-12 text-center shadow-[0_1px_2px_rgba(20,32,28,0.04)]">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertTriangle className="size-5" strokeWidth={1.7} />
        </span>
        <h1 className="mt-4 font-display text-[1.5rem] leading-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
          This part of your portal didn&apos;t load. Try again — if it keeps happening, tell your
          class teacher.
        </p>
        <button
          type="button"
          onClick={reset}
          className="tp-focus mt-5 inline-flex h-9 items-center rounded-full bg-primary px-4 text-[12.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
