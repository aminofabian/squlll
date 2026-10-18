"use client";

import { cn } from "@/lib/utils";
import type { LessonGroup, LessonGroupMode } from "@/lib/timetable/weekView/buildLessonGroups";
import { formatDuration } from "@/lib/timetable/weekView/formatDuration";
import { WeekGroupBadge } from "./WeekGroupBadge";
import { WEEK_CARD_CLASS } from "./weekCardClass";

const COPY: Record<LessonGroupMode, { title: string; noun: string }> = {
  class: { title: "Your classes", noun: "class" },
  subject: { title: "Your subjects", noun: "subject" },
};

function periodsLabel(periods: number): string {
  return periods === 1 ? "1 period" : `${periods} periods`;
}

type WeekGroupsCardProps = {
  mode: LessonGroupMode;
  groups: LessonGroup[];
  focusedKey: string | null;
  onToggle: (key: string) => void;
  onClear: () => void;
};

export function WeekGroupsCard({ mode, groups, focusedKey, onToggle, onClear }: WeekGroupsCardProps) {
  const copy = COPY[mode];
  const focused = groups.find((group) => group.key === focusedKey);

  return (
    <section className={`${WEEK_CARD_CLASS} p-4`}>
      <h3 className="text-[14px] font-bold text-[#111a16] dark:text-white">{copy.title}</h3>
      <div aria-hidden className="mt-2.5 flex h-1.5 gap-1">
        {groups.map((group) => (
          <span key={group.key} className="rounded-full" style={{ flexGrow: group.periods, backgroundColor: group.accent }} />
        ))}
      </div>
      <ul className="mt-3 space-y-1.5">
        {groups.map((group) => (
          <li key={group.key}>
            <GroupButton group={group} isFocused={group.key === focusedKey} isMuted={Boolean(focused) && group.key !== focusedKey} onToggle={onToggle} />
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11.5px] text-[#5b6862] dark:text-white/60">
        {focused ? (
          <>
            Showing {focused.label} only ·{" "}
            <button type="button" onClick={onClear} className="font-semibold text-[#111a16] underline underline-offset-2 dark:text-white">
              Show all
            </button>
          </>
        ) : (
          `Select a ${copy.noun} to focus it on the timetable.`
        )}
      </p>
    </section>
  );
}

type GroupButtonProps = {
  group: LessonGroup;
  isFocused: boolean;
  isMuted: boolean;
  onToggle: (key: string) => void;
};

function GroupButton({ group, isFocused, isMuted, onToggle }: GroupButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isFocused}
      onClick={() => onToggle(group.key)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111a17]",
        isFocused
          ? "border-[#111a17] bg-white ring-1 ring-[#111a17] dark:border-white dark:bg-white/10 dark:ring-white"
          : "border-[#e6e9e4] bg-[#f6f7f4] hover:bg-[#eef1ec] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]",
        isMuted && "opacity-60",
      )}
    >
      <WeekGroupBadge letter={group.badge} accent={group.accent} size="md" />
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-bold text-[#111a16] dark:text-white">{group.label}</span>
        <span className="block text-[11.5px] text-[#5b6862] dark:text-white/60">
          {periodsLabel(group.periods)} · {formatDuration(group.minutes)}
        </span>
      </span>
    </button>
  );
}
