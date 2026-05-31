"use client";

import { AlertTriangle, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { SubjectCoverageInsight } from "../utils/subjectCoverageInsights";
import { cn } from "@/lib/utils";
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
      "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
    label: "Heavy",
  },
} as const;

interface TimetableSubjectInsightsProps {
  insights: SubjectCoverageInsight[];
  className?: string;
}

export function TimetableSubjectInsights({
  insights,
  className,
}: TimetableSubjectInsightsProps) {
  const [expanded, setExpanded] = useState(insights.length <= 2);

  if (insights.length === 0) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)]",
        "dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            aria-hidden
          >
            <AlertTriangle className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              Subject coverage
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
              {insights.length} item{insights.length !== 1 ? "s" : ""} to review
              for this class
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1.5",
            "text-xs font-semibold text-slate-600 transition-colors",
            "active:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:active:bg-slate-700",
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

      {expanded ? (
        <ul className="max-h-64 space-y-1 overflow-y-auto overscroll-contain p-2">
          {insights.map((item) => {
            const accent = getSubjectAccent(item.subject, item.subject);
            const kind = kindStyles[item.kind];

            return (
              <li
                key={`${item.kind}-${item.subject}`}
                className="flex items-start gap-3 rounded-xl px-2.5 py-2.5"
                style={{ backgroundColor: accent.background }}
              >
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
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
                    <span className="text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
                      {item.subject}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        kind.badge,
                      )}
                    >
                      {kind.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
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
