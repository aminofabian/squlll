"use client";

import type { CSSProperties } from "react";
import { MapPin, PartyPopper } from "lucide-react";
import type { NextLessonInfo } from "@/lib/timetable/types";
import { useSecondsUntil } from "@/lib/timetable/weekView/useSecondsUntil";
import { describeNextLessonStart } from "@/lib/timetable/weekView/describeNextLessonStart";
import { describeLessonCard } from "@/lib/timetable/weekView/describeLessonCard";
import type { LessonTints } from "@/lib/timetable/weekView/buildLessonTints";
import type { WeekViewerType } from "@/lib/timetable/weekView/weekViewerType";

const CARD_SHELL =
  "relative overflow-hidden rounded-xl border border-[#1a4d42]/10 bg-[#fffdf8] dark:border-white/10 dark:bg-[#0c1a17]";

type WeekUpNextCardProps = {
  nextLesson: NextLessonInfo | null;
  viewType: WeekViewerType;
  tints: LessonTints;
};

export function WeekUpNextCard({ nextLesson, viewType, tints }: WeekUpNextCardProps) {
  if (!nextLesson) {
    return (
      <section className={`${CARD_SHELL} px-4 py-4 text-center`}>
        <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a2620] text-[#d9c49a]">
          <PartyPopper className="h-4 w-4" aria-hidden />
        </span>
        <p className="mt-2 font-display text-[17px] text-[#0a1f1a] dark:text-white">All clear</p>
        <p className="mt-1 text-[12px] text-[#1a4d42]/80 dark:text-white/65">No more lessons this week.</p>
      </section>
    );
  }

  const { lesson } = nextLesson;
  const { title, detail } = describeLessonCard(lesson, viewType, tints.mode, tints.showSubject);

  return (
    <section className={CARD_SHELL} style={{ "--subject": tints.accentFor(lesson) } as CSSProperties}>
      <div aria-hidden className="h-[2px] bg-gradient-to-r from-[var(--subject)] via-[color-mix(in_srgb,var(--subject)_50%,#c49a52)] to-[#c49a52]" />
      <div className="px-4 pb-3.5 pt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7d5a22] dark:text-[#e5cf9f]">
            Up next
          </span>
          <span className="text-[11px] font-semibold text-[#1a4d42] dark:text-white/75">{nextLesson.period}</span>
        </div>
        <h3 className="mt-1.5 truncate font-display text-[20px] leading-tight tracking-[-0.025em] text-[#0a1f1a] dark:text-white">
          {title}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px]">
          {detail ? (
            <span className="rounded-sm bg-[color-mix(in_srgb,var(--subject)_14%,transparent)] px-1.5 py-0.5 font-semibold text-[#0a1f1a] dark:text-white/85">
              {detail}
            </span>
          ) : null}
          {lesson.room ? (
            <span className="inline-flex items-center gap-1 font-medium text-[#1a4d42]/85 dark:text-white/70">
              <MapPin className="h-3 w-3" aria-hidden />
              Room {lesson.room}
            </span>
          ) : null}
        </div>
        <StartsPanel startsAt={nextLesson.startsAt} time={nextLesson.time} dayLabel={nextLesson.dayLabel} />
      </div>
    </section>
  );
}

function StartsPanel({ startsAt, time, dayLabel }: { startsAt: string; time: string; dayLabel?: string | null }) {
  const seconds = useSecondsUntil(startsAt);
  const start = describeNextLessonStart(seconds, time, dayLabel);
  return (
    <div className="relative mt-3 flex items-end justify-between gap-3 overflow-hidden rounded-lg bg-[#0a2620] px-3 py-2 text-white">
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_center,rgba(196,154,82,0.35),transparent_65%)]" />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e5cf9f]">{start.caption}</p>
        <p className="mt-0.5 font-display text-[21px] leading-none tabular-nums tracking-[-0.02em] text-[#fbf8ef]" role={start.isCountdown ? "timer" : undefined} aria-live="off">
          {start.value}
        </p>
      </div>
      {start.isCountdown ? (
        <p className="relative text-[12px] font-semibold tabular-nums text-white/80">{time}</p>
      ) : null}
    </div>
  );
}
