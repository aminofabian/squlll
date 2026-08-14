"use client";

import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
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

type Health = "empty" | "progress" | "attention" | "ready";

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
}

const HEALTH_COPY: Record<
  Health,
  { label: string; tone: keyof typeof tt.pill; icon: LucideIcon }
> = {
  empty: { label: "Not started", tone: "neutral", icon: Circle },
  progress: { label: "In progress", tone: "info", icon: Clock },
  attention: { label: "Needs attention", tone: "danger", icon: AlertTriangle },
  ready: { label: "Ready to publish", tone: "success", icon: CheckCircle2 },
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
        "flex min-w-0 items-center gap-2.5 rounded-none border border-slate-200/70 bg-slate-50/60 px-3 py-2.5 text-left dark:border-slate-800 dark:bg-slate-900/40",
        onClick &&
          "transition-colors hover:border-slate-300 hover:bg-white dark:hover:border-slate-700 dark:hover:bg-slate-900",
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-none",
          tone === "danger"
            ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
            : tone === "success"
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-400",
        )}
        aria-hidden
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span
          className={cn(
            "block text-[14px] font-semibold tabular-nums leading-tight tracking-[-0.01em]",
            tone === "danger"
              ? "text-red-600 dark:text-red-400"
              : tone === "success"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-900 dark:text-slate-100",
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
}: TimetableHealthPanelProps) {
  const fillPct =
    totalSlots > 0
      ? Math.min(100, Math.round((filledSlots / totalSlots) * 100))
      : 0;
  const emptySlots = Math.max(0, totalSlots - filledSlots);
  const issueTotal = clashCount + advisoryCount;

  const health: Health =
    clashCount > 0
      ? "attention"
      : !hasAnyLessons
        ? "empty"
        : fillPct >= 85
          ? "ready"
          : "progress";

  const { label: healthLabel, tone, icon: HealthIcon } = HEALTH_COPY[health];

  const nextStep =
    !hasScheduleStructure
      ? "Set the school day before adding lessons."
      : clashCount > 0
        ? `${clashCount} clash${clashCount === 1 ? "" : "es"} to resolve before publishing.`
        : !hasAnyLessons
          ? "No lessons have been scheduled yet. Generate a timetable automatically or build one manually."
          : emptySlots > 0
            ? `${emptySlots} empty slot${emptySlots === 1 ? "" : "s"} left to fill.`
            : publishState === "published"
              ? "Published. Teachers can see this timetable."
              : publishState === "stale"
                ? "Edited since publishing — publish again so staff see the changes."
                : "Every slot is filled with no clashes. Ready to publish.";

  const barTone =
    health === "attention"
      ? "bg-red-500"
      : health === "ready"
        ? "bg-emerald-500"
        : "bg-[#246a59]";

  const isRail = variant === "rail";

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
                {advisoryCount} to check
              </span>
            )}
          </div>
          {!isRail ? (
            <p className="mt-2 text-[15px] font-semibold leading-tight tracking-[-0.02em] text-slate-900 dark:text-slate-50">
              {scopeLabel}
              {streamName ? (
                <span className="ml-1.5 text-[13px] font-medium text-slate-500 dark:text-slate-400">
                  · {streamName}
                </span>
              ) : null}
            </p>
          ) : null}
          <p className={cn(tt.caption, isRail ? "mt-1.5" : "mt-1")}>{nextStep}</p>
        </div>

        <div className="shrink-0 text-right">
          {totalSlots > 0 ? (
            <p className="text-[24px] font-semibold leading-none tabular-nums tracking-[-0.03em] text-slate-900 dark:text-slate-50">
              {fillPct}
              <span className="text-[14px] font-medium text-slate-400">%</span>
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
            className="h-1.5 w-full overflow-hidden rounded-none bg-slate-100 dark:bg-slate-800"
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
          <p className="mt-1.5 text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
            {filledSlots} of {totalSlots} lesson periods scheduled
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800",
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
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/30 sm:px-5">
        {clashCount > 0 && onReviewIssues ? (
          <Button
            size="sm"
            className="h-8 gap-1.5 bg-red-600 text-xs text-white hover:bg-red-700"
            onClick={onReviewIssues}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Review {clashCount} clash{clashCount === 1 ? "" : "es"}
          </Button>
        ) : null}

        {emptySlots > 0 && onAutoGenerate ? (
          <Button
            size="sm"
            className={cn("h-8 gap-1.5 text-xs", tt.accentBtn)}
            onClick={onAutoGenerate}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {hasAnyLessons ? "Fill remaining slots" : "Auto-generate draft"}
          </Button>
        ) : null}

        {emptySlots > 0 && onAddLesson ? (
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-slate-200 text-xs dark:border-slate-700"
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
              "h-8 gap-1.5 text-xs",
              emptySlots > 0
                ? "border-slate-200 dark:border-slate-700"
                : tt.accentBtn,
            )}
            onClick={onPublish}
          >
            <Share2 className="h-3.5 w-3.5" />
            {publishState === "published"
              ? "Published"
              : publishState === "stale"
                ? "Publish again"
                : "Publish for teachers"}
          </Button>
        ) : null}

        {hasAnyLessons && onPrint ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400"
            onClick={onPrint}
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
        ) : null}
      </div>
      ) : null}
    </section>
  );
}
