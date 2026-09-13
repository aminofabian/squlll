"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Layers,
  Printer,
  Share2,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";
import { TimetableLastUpdated } from "./TimetableLastUpdated";
import {
  getTimetableReadiness,
  type TimetableReadinessVerdict,
} from "../utils/getTimetableReadiness";

interface TimetableHealthPanelProps {
  scopeLabel: string;
  streamName?: string | null;
  lastUpdatedIso?: string | null;
  filledSlots: number;
  totalSlots: number;
  totalLessons: number;
  periodCount: number;
  teacherCount?: number;
  clashCount: number;
  advisoryCount?: number;
  hasScheduleStructure: boolean;
  hasAnyLessons: boolean;
  publishState?: "unpublished" | "published" | "stale";
  onReviewIssues?: () => void;
  onAutoGenerate?: () => void;
  onAddLesson?: () => void;
  onPublish?: () => void;
  onPrint?: () => void;
  variant?: "card" | "rail";
  hideActions?: boolean;
  /** On phones, start as a one-line summary that expands on tap. */
  collapsible?: boolean;
}

const VERDICT_STYLE: Record<
  TimetableReadinessVerdict,
  { tone: keyof typeof tt.pill; icon: LucideIcon }
> = {
  "no-structure": { tone: "neutral", icon: Circle },
  "not-started": { tone: "neutral", icon: Circle },
  clashes: { tone: "danger", icon: AlertTriangle },
  "in-progress": { tone: "info", icon: Clock },
  almost: { tone: "info", icon: Clock },
  ready: { tone: "success", icon: CheckCircle2 },
};

function Metric({
  icon: Icon,
  label,
  value,
  tone,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: "default" | "danger" | "success";
  onClick?: () => void;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={cn(
        "flex min-w-0 items-center gap-2.5 rounded-none border border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2.5 text-left dark:border-white/10 dark:bg-white/[0.02]",
        onClick &&
          "transition-colors hover:border-[#1a4d42]/20 hover:bg-white dark:hover:border-white/20 dark:hover:bg-white/[0.04]",
        onClick && tt.focus,
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-none ring-1 ring-inset",
          tone === "danger"
            ? "bg-red-100 text-red-600 ring-red-200/70 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-900/50"
            : tone === "success"
              ? "bg-emerald-100 text-emerald-600 ring-emerald-200/70 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-900/50"
              : "bg-white text-[#1a4d42]/55 ring-[#1a4d42]/8 dark:bg-white/5 dark:text-white/45 dark:ring-white/10",
        )}
        aria-hidden
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block truncate font-medium",
            tt.text.caption,
            tt.ink.muted,
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            tt.text.title,
            tt.numeral,
            "block",
            tone === "danger"
              ? "text-red-600 dark:text-red-400"
              : tone === "success"
                ? "text-emerald-600 dark:text-emerald-400"
                : tt.ink.strong,
          )}
        >
          {value}
        </span>
      </span>
    </Wrapper>
  );
}

export function TimetableHealthPanel({
  scopeLabel,
  streamName,
  lastUpdatedIso,
  filledSlots,
  totalSlots,
  totalLessons,
  periodCount,
  teacherCount = 0,
  clashCount,
  advisoryCount = 0,
  hasScheduleStructure,
  hasAnyLessons,
  publishState = "unpublished",
  onReviewIssues,
  onAutoGenerate,
  onAddLesson,
  onPublish,
  onPrint,
  variant = "card",
  hideActions = false,
  collapsible = false,
}: TimetableHealthPanelProps) {
  const readiness = getTimetableReadiness({
    hasScheduleStructure,
    hasAnyLessons,
    filledSlots,
    totalSlots,
    clashCount,
    advisoryCount,
    publishState,
  });
  const { fillPct, emptySlots, nextStep } = readiness;
  const issueTotal = clashCount + advisoryCount;
  const { tone, icon: HealthIcon } = VERDICT_STYLE[readiness.verdict];
  const healthLabel = readiness.label;

  const barTone =
    readiness.verdict === "clashes"
      ? "bg-red-500"
      : readiness.verdict === "ready"
        ? "bg-emerald-500"
        : "bg-[#246a59]";

  const isRail = variant === "rail";
  const [detailsOpen, setDetailsOpen] = useState(!collapsible);

  if (collapsible && !detailsOpen) {
    return (
      <section
        className={cn(tt.panel, "overflow-hidden")}
        aria-label="Timetable health"
      >
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className={cn(
            "flex w-full items-center gap-2.5 px-3.5 py-3 text-left",
            tt.focus,
          )}
          aria-expanded={false}
        >
          <span className={cn(tt.pill.base, tt.pill[tone])}>
            <HealthIcon className="h-3 w-3" strokeWidth={2.5} />
            {healthLabel}
          </span>
          <p className={cn(tt.caption, "min-w-0 flex-1 truncate")}>{nextStep}</p>
          <span
            className={cn(
              tt.text.body,
              tt.numeral,
              tt.ink.strong,
              "shrink-0 font-semibold",
            )}
          >
            {fillPct}%
          </span>
          <ChevronDown className={cn("h-4 w-4 shrink-0", tt.ink.faint)} />
        </button>
      </section>
    );
  }

  return (
    <section
      className={cn(!isRail && tt.panel, "overflow-hidden")}
      aria-label="Timetable health"
    >
      <div
        className={cn(
          "flex flex-wrap items-start justify-between gap-3",
          isRail ? "px-3 py-3" : "px-4 py-3.5 sm:px-5",
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(tt.pill.base, tt.pill[tone])}>
              <HealthIcon className="h-3 w-3" strokeWidth={2.5} />
              {healthLabel}
            </span>
            {issueTotal > 0 && advisoryCount > 0 && (
              <span className={cn(tt.pill.base, tt.pill.warn)}>
                {advisoryCount} to review
              </span>
            )}
          </div>
          {!isRail ? (
            <p className={cn(tt.text.title, tt.ink.strong, "mt-2")}>
              {scopeLabel}
              {streamName ? (
                <span className={cn(tt.text.body, tt.ink.muted, "ml-1.5 font-medium")}>
                  · {streamName}
                </span>
              ) : null}
            </p>
          ) : null}
          <p className={cn(tt.caption, isRail ? "mt-1.5" : "mt-1")}>{nextStep}</p>
        </div>

        <div className="shrink-0 text-right">
          {totalSlots > 0 ? (
            <p className={cn(tt.text.metric, tt.numeral, tt.ink.strong)}>
              {fillPct}
              <span className={cn(tt.ink.faint, "text-[13px] font-medium")}>%</span>
            </p>
          ) : null}
          <div className="mt-1.5 flex justify-end">
            <TimetableLastUpdated isoTimestamp={lastUpdatedIso} />
          </div>
        </div>
      </div>

      {totalSlots > 0 ? (
        <div className={cn(isRail ? "px-3 pb-3" : "px-4 pb-4 sm:px-5")}>
          <div
            className="h-1.5 w-full overflow-hidden rounded-none bg-[#1a4d42]/8 dark:bg-white/10"
            role="progressbar"
            aria-valuenow={fillPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${filledSlots} of ${totalSlots} slots filled`}
          >
            <div
              className={cn("h-full rounded-none transition-[width]", barTone)}
              style={{ width: `${Math.max(fillPct, filledSlots > 0 ? 2 : 0)}%` }}
            />
          </div>
          <p className={cn(tt.text.caption, tt.numeral, tt.ink.faint, "mt-1.5")}>
            {filledSlots} of {totalSlots} lesson periods scheduled
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "grid grid-cols-2 gap-2 border-t",
          tt.border.hair,
          isRail ? "px-3 py-3" : "px-4 py-3.5 sm:grid-cols-4 sm:px-5",
        )}
      >
        <Metric icon={BookOpen} label="Lessons" value={totalLessons} />
        <Metric icon={Clock} label="Periods / day" value={periodCount} />
        <Metric
          icon={Users}
          label="Teachers"
          value={teacherCount || "—"}
        />
        <Metric
          icon={clashCount > 0 ? AlertTriangle : Layers}
          label="Clashes"
          value={clashCount > 0 ? clashCount : "None"}
          tone={clashCount > 0 ? "danger" : "success"}
          onClick={clashCount > 0 ? onReviewIssues : undefined}
        />
      </div>

      {!hideActions && !isRail ? (
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 border-t bg-[#f8fbfa] px-4 py-3 dark:bg-white/[0.02] sm:px-5",
          tt.border.hair,
        )}
      >
        {clashCount > 0 && onReviewIssues ? (
          <Button
            size="sm"
            className={cn(
              "h-8 gap-1.5 bg-red-600 text-white hover:bg-red-700",
              tt.text.small,
            )}
            onClick={onReviewIssues}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Review {clashCount} clash{clashCount === 1 ? "" : "es"}
          </Button>
        ) : null}

        {emptySlots > 0 && onAutoGenerate ? (
          <Button
            size="sm"
            className={cn("h-8 gap-1.5", tt.text.small, tt.accentBtn)}
            onClick={onAutoGenerate}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Auto-fill timetable
          </Button>
        ) : null}

        {emptySlots > 0 && onAddLesson ? (
          <Button
            size="sm"
            variant="outline"
            className={cn(
              "h-8 gap-1.5 border-[#1a4d42]/15 dark:border-white/15",
              tt.text.small,
            )}
            onClick={onAddLesson}
          >
            Add lessons manually
          </Button>
        ) : null}

        {clashCount === 0 && hasAnyLessons && onPublish ? (
          <Button
            size="sm"
            variant={emptySlots > 0 ? "outline" : "default"}
            className={cn(
              "h-8 gap-1.5",
              tt.text.small,
              emptySlots > 0
                ? "border-[#1a4d42]/15 dark:border-white/15"
                : tt.accentBtn,
            )}
            onClick={onPublish}
          >
            <Share2 className="h-3.5 w-3.5" />
            {publishState === "published"
              ? "Shared with teachers"
              : publishState === "stale"
                ? "Share again"
                : "Share with teachers"}
          </Button>
        ) : null}

        {hasAnyLessons && onPrint ? (
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-8 gap-1.5 hover:text-[#0a1f1a] dark:hover:text-white",
              tt.text.small,
              tt.ink.muted,
            )}
            onClick={onPrint}
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
        ) : null}
      </div>
      ) : null}

      {collapsible ? (
        <div className={cn("border-t px-4 py-2 sm:px-5", tt.border.hair)}>
          <button
            type="button"
            onClick={() => setDetailsOpen(false)}
            className={cn(
              "inline-flex items-center gap-1 font-medium hover:text-[#0a1f1a] dark:hover:text-white",
              tt.text.caption,
              tt.ink.muted,
              tt.focus,
            )}
          >
            <ChevronUp className="h-3 w-3" />
            Hide details
          </button>
        </div>
      ) : null}
    </section>
  );
}
