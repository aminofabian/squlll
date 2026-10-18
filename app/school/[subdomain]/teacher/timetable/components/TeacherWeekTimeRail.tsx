"use client";

import { cn } from "@/lib/utils";

const PERIOD_DIGITS = 2;

function trimLeadingZero(time: string): string {
  return time.replace(/^0(\d)/, "$1");
}

type TeacherWeekTimeRailProps = {
  /** Period number, or null for break rows. */
  periodNumber: number | null;
  startTime?: string;
  endTime?: string;
  isCurrent?: boolean;
};

export function TeacherWeekTimeRail({
  periodNumber,
  startTime,
  endTime,
  isCurrent = false,
}: TeacherWeekTimeRailProps) {
  const range =
    startTime && endTime
      ? `${trimLeadingZero(startTime)} – ${trimLeadingZero(endTime)}`
      : null;

  if (periodNumber == null) {
    return (
      <div className="flex h-full items-center whitespace-nowrap pl-5 pr-1 text-[9.5px] font-medium tabular-nums tracking-[-0.01em] text-[#1a4d42]/35 dark:text-white/30">
        {range ?? ""}
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col justify-center pl-5 pr-2">
      {isCurrent ? (
        <span
          aria-hidden
          className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#c49a52] ring-4 ring-[#c49a52]/20"
        />
      ) : null}
      <span
        className={cn(
          "font-display text-[24px] leading-none tracking-[-0.03em]",
          isCurrent ? "text-[#8a6427] dark:text-[#e5cf9f]" : "text-[#0a1f1a]/80 dark:text-white/80",
        )}
      >
        {String(periodNumber).padStart(PERIOD_DIGITS, "0")}
      </span>
      {range ? (
        <span className="mt-1 whitespace-nowrap text-[10px] font-medium tabular-nums text-[#1a4d42]/45 dark:text-white/35">
          {range}
        </span>
      ) : null}
    </div>
  );
}
