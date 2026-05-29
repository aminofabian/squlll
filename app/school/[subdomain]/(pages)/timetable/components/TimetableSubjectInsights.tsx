"use client";

import { AlertTriangle, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { SubjectCoverageInsight } from "../utils/subjectCoverageInsights";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";
import { getSubjectAccent } from "../utils/timetableSubjectColors";

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
    <div className={cn(tt.panelMuted, "px-4 py-3", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
          <div>
            <p className="text-[13px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Subject coverage
            </p>
            <p className={cn(tt.caption, "mt-0.5")}>
              {insights.length} item{insights.length !== 1 ? "s" : ""} to review
              for this class
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-zinc-600"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? (
            <>
              Hide <ChevronUp className="h-3.5 w-3.5 ml-0.5" />
            </>
          ) : (
            <>
              Show <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
            </>
          )}
        </Button>
      </div>

      {expanded && (
        <ul className="mt-3 space-y-2">
          {insights.map((item) => {
            const accent = getSubjectAccent(item.subject, item.subject);
            return (
            <li
              key={`${item.kind}-${item.subject}`}
              className="flex items-start gap-2 rounded-lg border border-zinc-200/80 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900/60"
              style={{ borderLeftWidth: 3, borderLeftColor: accent.accent }}
            >
              <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <div>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {item.subject}
                </span>
                <span
                  className={cn(
                    "ml-2 text-[10px] uppercase font-semibold tracking-wide",
                    item.kind === "missing"
                      ? "text-red-600"
                      : item.kind === "low"
                        ? "text-amber-700"
                        : "text-slate-500",
                  )}
                >
                  {item.kind === "missing"
                    ? "Missing"
                    : item.kind === "low"
                      ? "Low"
                      : "Heavy"}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {item.message}
                </p>
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
