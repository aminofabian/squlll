"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Copy,
  Download,
  Mail,
  Printer,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { TimetableTermOverview } from "../hooks/useTimetableTermOverview";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";
import {
  getTimetableReadiness,
  type TimetablePublishState,
  type TimetableReadinessVerdict,
} from "../utils/getTimetableReadiness";

interface TimetableShareDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  termName?: string;
  academicYearName?: string;
  hasScheduleStructure: boolean;
  conflictCount: number;
  overview: TimetableTermOverview;
  classLabel?: string;
  sharedAt?: string | null;
  hasChangesSinceShare?: boolean;
  onMarkShared: () => void | Promise<void>;
  onPrint?: () => void;
  onCopySummary?: () => void;
  onCopyTermSummary?: () => void;
  onEmailStaff?: () => void;
  onExportClassCsv?: () => void;
  onExportTermCsv?: () => void;
}

function CheckRow({
  ok,
  label,
  detail,
  optional,
}: {
  ok: boolean;
  label: string;
  detail?: string;
  optional?: boolean;
}) {
  return (
    <li className="flex items-start gap-2">
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
      ) : optional ? (
        <span
          aria-hidden
          className="mt-0.5 h-3.5 w-3.5 shrink-0 border border-dashed border-slate-300 dark:border-slate-600"
        />
      ) : (
        <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
      )}
      <div className="min-w-0">
        <p
          className={cn(
            "flex flex-wrap items-center gap-1.5 text-[12px] font-medium leading-snug",
            ok
              ? "text-slate-900 dark:text-slate-100"
              : "text-slate-600 dark:text-slate-300",
          )}
        >
          <span>{label}</span>
          {optional ? (
            <span className="inline-flex items-center border border-dashed border-slate-300 px-1 py-px text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:border-slate-600 dark:text-slate-500 lg:text-[9px]">
              Optional
            </span>
          ) : null}
        </p>
        {detail ? (
          <p className="mt-0.5 text-[11px] leading-snug text-slate-400 lg:text-[10px]">
            {detail}
          </p>
        ) : null}
      </div>
    </li>
  );
}

type ExtraAction = {
  key: string;
  label: string;
  icon: typeof Copy;
  run: () => void;
};

function ExtraChips({ items }: { items: ExtraAction[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            onClick={item.run}
            title={item.label}
            className="inline-flex h-9 items-center gap-1.5 border border-slate-200 px-2.5 text-[12px] font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:h-7 lg:gap-1 lg:px-2 lg:text-[10px]"
          >
            <Icon className="h-4 w-4 lg:h-3 lg:w-3" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function formatSharedDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function TimetableShareDrawer({
  open,
  onOpenChange,
  termName,
  academicYearName,
  hasScheduleStructure,
  conflictCount,
  overview,
  classLabel,
  sharedAt,
  hasChangesSinceShare,
  onMarkShared,
  onPrint,
  onCopySummary,
  onCopyTermSummary,
  onEmailStaff,
  onExportClassCsv,
  onExportTermCsv,
}: TimetableShareDrawerProps) {
  const [isDesktopDock, setIsDesktopDock] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktopDock(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  const termReady = Boolean(termName);
  const noClashes = conflictCount === 0;
  const hasLessons = overview.gradesWithLessons > 0;
  const mostlyFilled = overview.overallPercentage >= 50;
  const publishState: TimetablePublishState = sharedAt
    ? hasChangesSinceShare
      ? "stale"
      : "published"
    : "unpublished";
  const readiness = getTimetableReadiness({
    hasTerm: termReady,
    hasScheduleStructure,
    hasAnyLessons: hasLessons,
    filledSlots: overview.totalFilled,
    totalSlots: overview.totalSlots,
    clashCount: conflictCount,
    publishState,
  });
  const canMarkReady = readiness.canPublish;

  const verdictTone: Record<TimetableReadinessVerdict, keyof typeof tt.pill> = {
    "no-structure": "neutral",
    "not-started": "neutral",
    clashes: "danger",
    "in-progress": "info",
    almost: "info",
    ready: "success",
  };

  const blockedReason = !termReady
    ? "Choose a term first."
    : !hasScheduleStructure
      ? "Set lesson times first."
      : !hasLessons
        ? "Add lessons before sharing."
        : !noClashes
          ? "Fix clashes before sharing."
          : null;

  const incompleteGrades = overview.byGrade.filter(
    (g) => g.totalSlots > 0 && g.completionPercentage < 50 && g.lessonCount > 0,
  );

  const termLine = [termName, academicYearName].filter(Boolean).join(" · ");

  const close = () => onOpenChange(false);

  const classExtras: ExtraAction[] = [];
  if (onPrint) {
    classExtras.push({ key: "print", label: "Print class", icon: Printer, run: onPrint });
  }
  if (onExportClassCsv) {
    classExtras.push({
      key: "class-csv",
      label: "Class CSV",
      icon: Download,
      run: onExportClassCsv,
    });
  }
  if (onCopySummary) {
    classExtras.push({
      key: "copy-class",
      label: "Class summary",
      icon: Copy,
      run: onCopySummary,
    });
  }

  const termExtras: ExtraAction[] = [];
  if (onExportTermCsv) {
    termExtras.push({
      key: "term-csv",
      label: "Term CSV",
      icon: Download,
      run: onExportTermCsv,
    });
  }
  if (onCopyTermSummary) {
    termExtras.push({
      key: "copy-term",
      label: "Term summary",
      icon: Copy,
      run: onCopyTermSummary,
    });
  }
  if (onEmailStaff) {
    termExtras.push({ key: "email", label: "Email staff", icon: Mail, run: onEmailStaff });
  }

  const panel = (
    <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-[#0c1a17]">
      <div className="shrink-0 border-b border-[#1a4d42]/12 px-3 py-2 dark:border-white/10">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            {isDesktopDock ? (
              <h2 className="truncate text-[13px] font-semibold tracking-[-0.02em] text-[#0a1f1a] dark:text-white">
                Share with teachers
              </h2>
            ) : (
              <DrawerTitle className="truncate text-[13px] font-semibold tracking-[-0.02em] text-[#0a1f1a] dark:text-white">
                Share with teachers
              </DrawerTitle>
            )}
            <p className="truncate text-[11px] text-[#1a4d42]/55 dark:text-white/45">
              {termLine || "Teachers cannot see this term until you publish"}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex h-9 w-9 shrink-0 items-center justify-center text-[#1a4d42]/45 hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:hover:bg-white/5 dark:hover:text-white lg:h-7 lg:w-7"
            aria-label="Close"
          >
            <X className="h-4 w-4 lg:h-3.5 lg:w-3.5" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-2">
        <p className="text-[11px] leading-snug text-slate-500">
          Share so staff can see the week. You can still edit afterwards —
          share again if you make big changes.
        </p>

        <div className="flex flex-wrap items-center gap-2 border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 dark:border-slate-800 dark:bg-slate-900/40">
          <span className={cn(tt.pill.base, tt.pill[verdictTone[readiness.verdict]])}>
            {readiness.label}
          </span>
          <p className="min-w-0 flex-1 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
            {readiness.nextStep}
          </p>
        </div>

        {sharedAt ? (
          <div
            className={cn(
              "border px-2.5 py-1.5 text-[11px] leading-snug",
              hasChangesSinceShare
                ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                : "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100",
            )}
          >
            {hasChangesSinceShare
              ? `Edited since ${formatSharedDate(sharedAt)} — publish again so staff refresh.`
              : `Published ${formatSharedDate(sharedAt)}`}
          </div>
        ) : null}

        <section className="space-y-1.5">
          <p className={tt.eyebrow}>Before you share</p>
          <ul className="space-y-1.5">
            <CheckRow
              ok={termReady}
              label="Term selected"
              detail={
                termReady ? termLine : "Choose a term in the toolbar"
              }
            />
            <CheckRow
              ok={hasScheduleStructure}
              label="Lesson times set"
              detail="Periods and breaks are configured"
            />
            <CheckRow
              ok={hasLessons}
              label="Lessons on the grid"
              detail={`${overview.gradesWithLessons} of ${overview.gradeCount} classes have at least one lesson`}
            />
            <CheckRow
              ok={noClashes}
              label="No clashes"
              detail={
                conflictCount > 0
                  ? `${conflictCount} clash${conflictCount !== 1 ? "es" : ""} to fix`
                  : "No teacher or room is double-booked"
              }
            />
          </ul>
        </section>

        <section className="space-y-1.5 border border-dashed border-slate-200 px-2.5 py-2 dark:border-slate-700">
          <p className={tt.eyebrow}>Recommended</p>
          <ul className="space-y-1.5">
            <CheckRow
              ok={mostlyFilled}
              optional
              label="Mostly filled (50%+)"
              detail={`${overview.overallPercentage}% of slots filled across classes`}
            />
          </ul>
        </section>

        {incompleteGrades.length > 0 ? (
          <div className="border border-amber-200/90 bg-amber-50/80 px-2.5 py-2 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900 dark:text-amber-100">
              <AlertTriangle className="h-3.5 w-3.5" />
              Sparse classes
            </p>
            <ul className="mt-1 space-y-0.5 text-[11px] text-amber-800/90 dark:text-amber-200/90 lg:text-[10px]">
              {incompleteGrades.slice(0, 5).map((g) => (
                <li key={g.gradeId}>
                  {g.label}: {g.completionPercentage}%
                </li>
              ))}
              {incompleteGrades.length > 5 ? (
                <li>+{incompleteGrades.length - 5} more</li>
              ) : null}
            </ul>
          </div>
        ) : null}

        {classLabel ? (
          <p className="text-[11px] text-slate-400 lg:text-[10px]">
            Viewing {classLabel} — print and class CSV apply to this class.
          </p>
        ) : null}

        {classExtras.length > 0 || termExtras.length > 0 ? (
          <div className="space-y-2.5">
            {classExtras.length > 0 ? (
              <div className="space-y-1.5">
                <p className={tt.eyebrow}>This class</p>
                <ExtraChips items={classExtras} />
              </div>
            ) : null}
            {termExtras.length > 0 ? (
              <div className="space-y-1.5">
                <p className={tt.eyebrow}>Whole term</p>
                <ExtraChips items={termExtras} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2 dark:border-white/10 dark:bg-[#0c1a17]">
        {blockedReason ? (
          <p className="mb-2 flex items-start gap-1.5 border border-amber-200 bg-amber-50 px-2 py-1.5 text-[12px] leading-snug text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100 lg:text-[11px]">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0">{blockedReason}</span>
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={close}
            className="h-9 px-3 text-[12px] text-slate-500 lg:h-8 lg:px-2 lg:text-[11px]"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!canMarkReady || busy}
            title={blockedReason ?? undefined}
            className={cn(
              "h-9 shrink-0 px-3 text-[12px] font-medium lg:h-8",
              tt.accentBtn,
            )}
            onClick={async () => {
              setBusy(true);
              try {
                await onMarkShared();
                close();
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Sharing…" : "Share with teachers"}
          </Button>
        </div>
      </div>
    </div>
  );

  if (!open) return null;

  if (isDesktopDock) {
    return (
      <aside
        data-timetable-no-print
        className="hidden min-h-0 w-[22rem] shrink-0 flex-col border-l border-[#1a4d42]/12 bg-white dark:border-white/10 dark:bg-[#0c1a17] lg:flex"
      >
        {panel}
      </aside>
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="bottom"
    >
      <DrawerContent
        className="flex max-h-[min(92dvh,720px)] flex-col rounded-none border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950"
        data-vaul-drawer-direction="bottom"
      >
        {panel}
      </DrawerContent>
    </Drawer>
  );
}
