"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Copy,
  Download,
  Info,
  Mail,
  Printer,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { GradeTimetableOverview } from "../hooks/useTimetableTermOverview";
import { cn } from "@/lib/utils";

interface TimetableShareDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  termName?: string;
  academicYearName?: string;
  hasScheduleStructure: boolean;
  conflictCount: number;
  overview: {
    byGrade: GradeTimetableOverview[];
    overallPercentage: number;
    gradesWithLessons: number;
    gradeCount: number;
  };
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
    <li className="flex items-start gap-2.5 text-sm">
      {ok ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
      ) : (
        <Circle className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
      )}
      <div>
        <span
          className={cn(
            "font-medium",
            ok ? "text-slate-900 dark:text-slate-100" : "text-slate-600",
          )}
        >
          {label}
        </span>
        {detail && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {detail}
          </p>
        )}
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
  const termReady = Boolean(termName);
  const noClashes = conflictCount === 0;
  const hasLessons = overview.gradesWithLessons > 0;
  const mostlyFilled = overview.overallPercentage >= 50;
  const canMarkReady =
    termReady && hasScheduleStructure && noClashes && hasLessons;

  const incompleteGrades = overview.byGrade.filter(
    (g) => g.totalSlots > 0 && g.completionPercentage < 50 && g.lessonCount > 0,
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <Share2 className="h-4 w-4 text-zinc-600" />
            Publish timetable
          </DrawerTitle>
          <DrawerDescription>
            Review this term, then publish when ready. Until you publish, teachers
            will not see their schedules for this term.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-2 space-y-4 overflow-y-auto">
          <div className="flex gap-2 rounded-lg border border-zinc-200/90 bg-zinc-50/80 px-3 py-2.5 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
            <p>
              Publishing unlocks the timetable for teachers. You can still edit
              after publishing — use &quot;Share again&quot; if you make major
              changes so staff know to check back.
            </p>
          </div>

          {sharedAt && (
            <div
              className={cn(
                "rounded-lg px-3 py-2 text-xs border",
                hasChangesSinceShare
                  ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100",
              )}
            >
              {hasChangesSinceShare ? (
                <>
                  <strong>Updated since last share</strong> — you saved changes
                  after {formatSharedDate(sharedAt)}. Consider telling staff
                  again.
                </>
              ) : (
                <>
                  <strong>Marked ready</strong> on {formatSharedDate(sharedAt)}
                  {termName ? ` · ${termName}` : ""}
                </>
              )}
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Readiness checklist
            </p>
            <ul className="space-y-2.5">
              <CheckRow
                ok={termReady}
                label="Term selected"
                detail={
                  termReady
                    ? [termName, academicYearName].filter(Boolean).join(" · ")
                    : "Choose a term in the toolbar"
                }
              />
              <CheckRow
                ok={hasScheduleStructure}
                label="School day times set"
                detail="Lesson periods and breaks are configured"
              />
              <CheckRow
                ok={hasLessons}
                label="Lessons added"
                detail={`${overview.gradesWithLessons} of ${overview.gradeCount} classes have at least one lesson`}
              />
              <CheckRow
                ok={noClashes}
                label="No scheduling clashes"
                detail={
                  conflictCount > 0
                    ? `${conflictCount} clash${conflictCount !== 1 ? "es" : ""} — fix before sharing`
                    : "Teachers and rooms are not double-booked"
                }
              />
              <CheckRow
                ok={mostlyFilled}
                label="Most slots filled (50%+ overall)"
                detail={`${overview.overallPercentage}% of slots filled across classes`}
              />
            </ul>
          </div>

          {incompleteGrades.length > 0 && (
            <div className="rounded-lg border border-amber-200/90 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-800 px-3 py-2.5">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Classes still sparse
              </p>
              <ul className="mt-1.5 text-xs text-amber-800/90 dark:text-amber-200/90 space-y-0.5">
                {incompleteGrades.slice(0, 6).map((g) => (
                  <li key={g.gradeId}>
                    {g.label}: {g.completionPercentage}% filled
                  </li>
                ))}
                {incompleteGrades.length > 6 && (
                  <li>+{incompleteGrades.length - 6} more</li>
                )}
              </ul>
            </div>
          )}

          {classLabel && (
            <p className="text-xs text-slate-500">
              Currently viewing <strong className="text-slate-700 dark:text-slate-300">{classLabel}</strong> — print or copy applies to this class.
            </p>
          )}
        </div>

        <DrawerFooter className="flex-col sm:flex-row gap-2 border-t pt-3">
          <Button
            type="button"
            className="w-full sm:flex-1"
            disabled={!canMarkReady}
            onClick={async () => {
              await onMarkShared();
              onOpenChange(false);
            }}
          >
            Publish timetable for teachers
          </Button>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {onCopyTermSummary && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none h-8 text-xs"
                onClick={onCopyTermSummary}
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy term summary
              </Button>
            )}
            {onEmailStaff && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none h-8 text-xs"
                onClick={onEmailStaff}
              >
                <Mail className="h-3.5 w-3.5 mr-1" />
                Email staff
              </Button>
            )}
            {onExportTermCsv && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none h-8 text-xs"
                onClick={onExportTermCsv}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Term CSV
              </Button>
            )}
            {onExportClassCsv && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none h-8 text-xs"
                onClick={onExportClassCsv}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Class CSV
              </Button>
            )}
            {onPrint && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onPrint}
              >
                <Printer className="h-3.5 w-3.5 mr-1" />
                Print class
              </Button>
            )}
            {onCopySummary && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onCopySummary}
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy summary
              </Button>
            )}
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
