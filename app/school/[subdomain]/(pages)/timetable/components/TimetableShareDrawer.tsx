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
}: {
  ok: boolean;
  label: string;
  detail?: string;
}) {
  return (
    <li className="flex items-start gap-2">
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
      ) : (
        <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
      )}
      <div className="min-w-0">
        <p
          className={cn(
            "text-[12px] font-medium leading-snug",
            ok
              ? "text-slate-900 dark:text-slate-100"
              : "text-slate-600 dark:text-slate-300",
          )}
        >
          {label}
        </p>
        {detail ? (
          <p className="mt-0.5 text-[10px] leading-snug text-slate-400">
            {detail}
          </p>
        ) : null}
      </div>
    </li>
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
  const canMarkReady =
    termReady && hasScheduleStructure && noClashes && hasLessons;

  const blockedReason = !termReady
    ? "Choose a term first."
    : !hasScheduleStructure
      ? "Set lesson times first."
      : !hasLessons
        ? "Add lessons before publishing."
        : !noClashes
          ? "Fix clashes before publishing."
          : null;

  const incompleteGrades = overview.byGrade.filter(
    (g) => g.totalSlots > 0 && g.completionPercentage < 50 && g.lessonCount > 0,
  );

  const termLine = [termName, academicYearName].filter(Boolean).join(" · ");

  const close = () => onOpenChange(false);

  const extras = [
    onCopyTermSummary
      ? { key: "copy-term", label: "Term summary", icon: Copy, run: onCopyTermSummary }
      : null,
    onEmailStaff
      ? { key: "email", label: "Email staff", icon: Mail, run: onEmailStaff }
      : null,
    onExportTermCsv
      ? { key: "term-csv", label: "Term CSV", icon: Download, run: onExportTermCsv }
      : null,
    onExportClassCsv
      ? { key: "class-csv", label: "Class CSV", icon: Download, run: onExportClassCsv }
      : null,
    onPrint
      ? { key: "print", label: "Print class", icon: Printer, run: onPrint }
      : null,
    onCopySummary
      ? { key: "copy-class", label: "Class summary", icon: Copy, run: onCopySummary }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    icon: typeof Copy;
    run: () => void;
  }>;

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
            className="flex h-7 w-7 shrink-0 items-center justify-center text-[#1a4d42]/45 hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-2">
        <p className="text-[11px] leading-snug text-slate-500">
          Publish so staff can see the week. You can still edit afterwards —
          publish again if you make big changes.
        </p>

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
          <p className={tt.eyebrow}>Ready?</p>
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
            <CheckRow
              ok={mostlyFilled}
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
            <ul className="mt-1 space-y-0.5 text-[10px] text-amber-800/90 dark:text-amber-200/90">
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
          <p className="text-[10px] text-slate-400">
            Viewing {classLabel} — print and class CSV apply to this class.
          </p>
        ) : null}

        {extras.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {extras.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.run}
                  title={item.label}
                  className="inline-flex h-7 items-center gap-1 border border-slate-200 px-2 text-[10px] font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Icon className="h-3 w-3" />
                  {item.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2 dark:border-white/10 dark:bg-[#0c1a17]">
        <Button
          variant="ghost"
          size="sm"
          onClick={close}
          className="h-8 px-2 text-[11px] text-slate-500"
        >
          Cancel
        </Button>
        {blockedReason ? (
          <p className="min-w-0 truncate text-[11px] text-slate-400">
            {blockedReason}
          </p>
        ) : null}
        <Button
          size="sm"
          disabled={!canMarkReady || busy}
          title={blockedReason ?? undefined}
          className={cn("h-8 shrink-0 px-3 text-[12px] font-medium", tt.accentBtn)}
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
          {busy ? "Publishing…" : "Publish for teachers"}
        </Button>
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
