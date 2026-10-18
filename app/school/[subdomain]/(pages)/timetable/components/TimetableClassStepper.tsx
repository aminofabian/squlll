"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClassNeighbours, ClassStop } from "../utils/classSequence";
import { tt } from "../utils/timetableTheme";

type TimetableClassStepperProps = {
  neighbours: ClassNeighbours;
  onGo: (stop: ClassStop) => void;
};

const STEP_BUTTON = cn(
  tt.focus,
  "flex h-8 w-8 items-center justify-center rounded-md border border-[#1a4d42]/15 bg-white text-[#0a1f1a] transition-colors",
  "hover:border-[#246a59]/50 hover:bg-[#246a59] hover:text-white",
  "disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-white disabled:hover:text-[#0a1f1a]",
  "dark:border-white/15 dark:bg-white/5 dark:text-white",
);

export function TimetableClassStepper({ neighbours, onGo }: TimetableClassStepperProps) {
  const { previous, next, position, total } = neighbours;
  if (total <= 1) return null;

  return (
    <div className="flex shrink-0 items-center gap-1.5" aria-label="Switch class">
      <button
        type="button"
        className={STEP_BUTTON}
        disabled={!previous}
        onClick={() => previous && onGo(previous)}
        title={previous ? `Previous: ${previous.label}  ( [ )` : "This is the first class"}
        aria-label={previous ? `Previous class, ${previous.label}` : "No previous class"}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className={cn(tt.text.caption, tt.numeral, "min-w-[3.5rem] text-center text-slate-600 dark:text-slate-300")}>
        {position} of {total}
      </span>
      <button
        type="button"
        className={STEP_BUTTON}
        disabled={!next}
        onClick={() => next && onGo(next)}
        title={next ? `Next: ${next.label}  ( ] )` : "This is the last class"}
        aria-label={next ? `Next class, ${next.label}` : "No next class"}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      {next ? (
        <button
          type="button"
          onClick={() => onGo(next)}
          className={cn(tt.focus, tt.text.small, "hidden max-w-[10rem] truncate font-medium text-[#246a59] hover:underline xl:inline dark:text-[#7eb8a8]")}
        >
          Next: {next.label}
        </button>
      ) : null}
    </div>
  );
}
