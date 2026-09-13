"use client";

import { AlertTriangle, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { SubjectCoverageInsight } from "../utils/subjectCoverageInsights";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";
import { getSubjectAccent } from "../utils/timetableSubjectColors";

const kindStyles = {
  missing: {
    badge:
      "bg-red-50 text-red-700 ring-1 ring-red-200/80 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/50",
    label: "Missing",
  },
  low: {
    badge:
      "bg-amber-50 text-amber-800 ring-1 ring-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/50",
    label: "Low",
  },
  heavy: {
    badge:
      "bg-[#e8f2ef] text-[#1a4d42]/70 ring-1 ring-[#1a4d42]/15 dark:bg-white/10 dark:text-white/60 dark:ring-white/15",
    label: "Heavy",
  },
} as const;

interface TimetableSubjectInsightsProps {
  insights: SubjectCoverageInsight[];
  className?: string;
  embedded?: boolean;
}

export function TimetableSubjectInsights({
  insights,
  className,
  embedded = false,
}: TimetableSubjectInsightsProps) {
  const [expanded, setExpanded] = useState(insights.length <= 2);

  if (insights.length === 0) {
    if (!embedded) return null;
    return (
      <div className={cn("px-3 py-8 text-center", className)}>
        <p className={cn("font-medium", tt.text.body, tt.ink.strong)}>
          Coverage looks even
        </p>
        <p className={cn("mt-1", tt.text.small, tt.ink.muted)}>
          No missing, thin, or overloaded subjects in this class.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden",
        !embedded &&
          cn(
            tt.panel,
            "shadow-[0_2px_12px_rgba(15,23,42,0.06)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)]",
          ),
        className,
      )}
    >
      {!embedded ? (
      <div className={cn("flex items-start justify-between gap-3 border-b px-4 py-3.5", tt.border.hair)}>
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            aria-hidden
          >
            <AlertTriangle className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <div className="min-w-0">
            <p className={cn("font-semibold uppercase tracking-[0.14em]", tt.text.micro, tt.ink.faint)}>
              Subject coverage
            </p>
            <p className={cn("mt-1", tt.text.title, tt.ink.strong, tt.numeral)}>
              {insights.length} coverage gap{insights.length !== 1 ? "s" : ""} in
              this class
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-none border border-[#1a4d42]/12 bg-[#f8fbfa] px-3 py-1.5",
            "font-semibold transition-colors",
            "active:bg-[#e8f2ef] dark:border-white/10 dark:bg-white/10 dark:active:bg-white/15",
            tt.text.small,
            tt.ink.base,
            tt.focus,
          )}
        >
          {expanded ? "Hide" : "Show"}
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      ) : null}

      {embedded || expanded ? (
        <ul className={cn("space-y-1.5 overscroll-contain p-2", !embedded && "max-h-64 overflow-y-auto")}>
          {insights.map((item) => {
            const accent = getSubjectAccent(item.subject, item.subject);
            const kind = kindStyles[item.kind];

            return (
              <li
                key={`${item.kind}-${item.subject}`}
                className="flex items-start gap-3 rounded-none px-2.5 py-2.5"
                style={{ backgroundColor: accent.background }}
              >
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-none"
                  style={{
                    color: accent.text,
                    boxShadow: `inset 0 0 0 1px ${accent.border}`,
                  }}
                  aria-hidden
                >
                  <BookOpen className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className={cn(tt.text.title, tt.ink.strong)}>
                      {item.subject}
                    </span>
                    <span
                      className={cn(
                        "rounded-none px-2 py-0.5 font-bold uppercase tracking-wide",
                        tt.text.micro,
                        kind.badge,
                      )}
                    >
                      {kind.label}
                    </span>
                  </div>
                  <p className={cn("mt-1", tt.text.small, tt.ink.muted)}>
                    {item.message}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
