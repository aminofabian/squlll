"use client";

import { cn } from "@/lib/utils";
import type { LessonGroup } from "@/lib/timetable/weekView/buildLessonGroups";
import { WeekGroupBadge } from "./WeekGroupBadge";

type WeekGroupChipsProps = {
  groups: LessonGroup[];
  focusedKey: string | null;
  onToggle: (key: string) => void;
};

export function WeekGroupChips({ groups, focusedKey, onToggle }: WeekGroupChipsProps) {
  return (
    <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none]">
      {groups.map((group) => {
        const isFocused = group.key === focusedKey;
        return (
          <button
            key={group.key}
            type="button"
            aria-pressed={isFocused}
            onClick={() => onToggle(group.key)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-[12px] font-semibold transition",
              isFocused
                ? "border-[#111a17] bg-white text-[#111a16] ring-1 ring-[#111a17] dark:border-white dark:bg-white/10 dark:text-white dark:ring-white"
                : "border-[#e3e7e1] bg-white text-[#111a16] dark:border-white/10 dark:bg-white/[0.04] dark:text-white",
              focusedKey != null && !isFocused && "opacity-55",
            )}
          >
            <WeekGroupBadge letter={group.badge} accent={group.accent} />
            <span className="max-w-[140px] truncate">{group.shortLabel}</span>
            <span className="font-normal text-[#5b6862] dark:text-white/60">{group.periods}</span>
          </button>
        );
      })}
    </div>
  );
}
