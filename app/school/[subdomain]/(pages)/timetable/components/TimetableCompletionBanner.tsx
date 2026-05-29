"use client";

import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimetableCompletionBannerProps {
  classLabel: string;
  filledSlots: number;
  totalSlots: number;
  conflictCount: number;
  onPrint?: () => void;
  onPublish?: () => void;
}

export function TimetableCompletionBanner({
  classLabel,
  filledSlots,
  totalSlots,
  conflictCount,
  onPrint,
  onPublish,
}: TimetableCompletionBannerProps) {
  const pct = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;
  const isComplete = pct >= 85 && conflictCount === 0 && filledSlots > 0;

  if (!isComplete) return null;

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 dark:bg-emerald-950/30 dark:border-emerald-800 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-start gap-2 flex-1">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {classLabel} timetable looks ready
          </p>
          <p className="text-xs text-emerald-800/90 dark:text-emerald-200/90 mt-0.5">
            {pct}% of slots filled with no clashes. Publish the term when you are
            ready for teachers to view their schedules.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        {onPublish && (
          <Button
            type="button"
            size="sm"
            className="h-8 bg-zinc-900 text-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            onClick={onPublish}
          >
            Publish for teachers
          </Button>
        )}
        {onPrint && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 border-emerald-300 text-xs"
            onClick={onPrint}
          >
            Print class
          </Button>
        )}
      </div>
    </div>
  );
}
