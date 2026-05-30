"use client";

import { cn } from "@/lib/utils";

const PREVIEW_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const PREVIEW_PERIODS = [1, 2, 3, 4, 5, 6];

interface TimetableGhostGridProps {
  className?: string;
}

/** Muted preview grid shown during setup so users see what they are building toward. */
export function TimetableGhostGrid({ className }: TimetableGhostGridProps) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-dashed border-zinc-200/90 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-900/30",
        className,
      )}
      aria-hidden
    >
      <table className="w-full min-w-[480px] border-collapse text-[8pt]">
        <thead>
          <tr className="border-b border-zinc-200/70 dark:border-zinc-800">
            <th
              className="sticky left-0 w-[52px] border-r border-zinc-200/70 bg-zinc-100/80 px-1 py-2 text-left dark:border-zinc-800 dark:bg-zinc-900/80"
              scope="col"
            >
              <span className="text-[7pt] font-semibold text-zinc-400">Period</span>
            </th>
            {PREVIEW_DAYS.map((day) => (
              <th
                key={day}
                className="border-r border-zinc-200/60 px-1 py-2 text-center font-semibold text-zinc-400 last:border-r-0 dark:border-zinc-800"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PREVIEW_PERIODS.map((period) => (
            <tr
              key={period}
              className="border-b border-zinc-100 dark:border-zinc-800/80"
            >
              <td className="sticky left-0 border-r border-zinc-200/90 bg-white px-1 py-1 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex h-[10pt] min-h-[10pt] items-center justify-start rounded-[1px] bg-zinc-100/80 px-1 text-[6.5pt] font-medium leading-none text-zinc-400 dark:bg-zinc-800">
                  Period {period}
                </div>
              </td>
              {PREVIEW_DAYS.map((day) => (
                <td key={day} className="p-px">
                  <div className="h-[10pt] min-h-[10pt] rounded-[1px] border border-dashed border-zinc-200/80 bg-white/60 dark:border-zinc-700 dark:bg-zinc-900/40" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
