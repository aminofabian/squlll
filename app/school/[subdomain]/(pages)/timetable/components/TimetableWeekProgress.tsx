"use client";

import { AlertTriangle, PanelRightOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";

type TimetableWeekProgressProps = {
  lessonsPlaced: number;
  lessonsTarget: number;
  slotsFree: number;
  headsUpCount: number;
  onReviewHeadsUps: () => void;
  /** Shown while the week panel is hidden, to bring it back. */
  onShowPanel?: () => void;
};

const FULL_PERCENT = 100;

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function TimetableWeekProgress({
  lessonsPlaced,
  lessonsTarget,
  slotsFree,
  headsUpCount,
  onReviewHeadsUps,
  onShowPanel,
}: TimetableWeekProgressProps) {
  const percent =
    lessonsTarget > 0 ? Math.min(FULL_PERCENT, Math.round((lessonsPlaced / lessonsTarget) * FULL_PERCENT)) : 0;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div
        className="h-1.5 w-40 overflow-hidden rounded-full bg-[#1a4d42]/10 dark:bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={FULL_PERCENT}
        aria-valuenow={percent}
        aria-label="Lessons placed this week"
      >
        <div className="h-full rounded-full bg-[#0a1f1a] transition-[width] dark:bg-[#7eb8a8]" style={{ width: `${percent}%` }} />
      </div>
      <p className={cn(tt.text.small, tt.numeral, tt.ink.strong, "font-semibold")}>
        {lessonsPlaced} of {lessonsTarget} lessons placed
        <span className={cn("font-normal", tt.ink.muted)}> · {plural(slotsFree, "slot")} free</span>
      </p>
      {headsUpCount > 0 ? (
        <button
          type="button"
          onClick={onReviewHeadsUps}
          className={cn(tt.focus, tt.text.caption, "inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-900 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-200")}
        >
          <AlertTriangle className="h-3 w-3" />
          {plural(headsUpCount, "heads-up")} to review
        </button>
      ) : null}
      <p className={cn(tt.text.caption, tt.ink.faint, "hidden xl:block")}>
        Drag a lesson to move · drop on another to swap
      </p>
      {onShowPanel ? (
        <button
          type="button"
          onClick={onShowPanel}
          className={cn(tt.focus, tt.text.caption, "ml-auto inline-flex items-center gap-1 font-medium text-[#246a59] hover:underline dark:text-[#7eb8a8]")}
        >
          <PanelRightOpen className="h-3.5 w-3.5" />
          Show week summary
        </button>
      ) : null}
    </div>
  );
}
