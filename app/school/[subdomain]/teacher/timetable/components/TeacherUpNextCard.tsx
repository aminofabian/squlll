"use client";

import type { CSSProperties } from "react";
import { MapPin, PartyPopper } from "lucide-react";
import type { NextLessonInfo } from "@/lib/timetable/types";
import { getLessonSubjectPalette } from "@/lib/timetable/constants";
import { useSecondsUntil } from "../hooks/useSecondsUntil";
import { formatStartsIn } from "../lib/formatStartsIn";

const CARD_SHELL =
  "relative overflow-hidden rounded-[24px] bg-[#fffdf8] shadow-[0_24px_50px_-40px_rgba(10,38,32,0.6)] ring-1 ring-[#1a4d42]/10 dark:bg-[#0c1a17] dark:ring-white/10";

export function TeacherUpNextCard({ nextLesson }: { nextLesson: NextLessonInfo | null }) {
  if (!nextLesson) {
    return (
      <section className={`${CARD_SHELL} px-5 py-6 text-center`}>
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0a2620] text-[#d9c49a]">
          <PartyPopper className="h-4 w-4" aria-hidden />
        </span>
        <p className="mt-3 font-display text-[20px] text-[#0a1f1a] dark:text-white">All clear</p>
        <p className="mt-1 text-[11.5px] text-[#1a4d42]/50 dark:text-white/40">No more lessons this week.</p>
      </section>
    );
  }

  const { lesson } = nextLesson;
  const palette = getLessonSubjectPalette(lesson.subject);
  const classLabel = [lesson.grade.displayName || lesson.grade.name, lesson.stream].filter(Boolean).join(" · ");

  return (
    <section className={CARD_SHELL} style={{ "--subject": palette.accent } as CSSProperties}>
      <div aria-hidden className="h-1 bg-gradient-to-r from-[var(--subject)] via-[color-mix(in_srgb,var(--subject)_50%,#c49a52)] to-[#c49a52]" />
      <div className="px-5 pb-5 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.26em] text-[#a07a3a] dark:text-[#d9c49a]/70">
            Up next
          </span>
          <span className="rounded-full bg-[#0a2620]/[0.06] px-2.5 py-1 text-[10px] font-semibold text-[#1a4d42]/75 dark:bg-white/[0.06] dark:text-white/65">
            {nextLesson.dayLabel ?? "Later today"}
          </span>
        </div>
        <h3 className="mt-2.5 font-display text-[26px] leading-[1.05] tracking-[-0.025em] text-[#0a1f1a] dark:text-white">
          {lesson.subject.name}
        </h3>
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded-md bg-[color-mix(in_srgb,var(--subject)_12%,transparent)] px-2 py-1 font-semibold text-[#1a4d42] dark:text-white/80">
            {classLabel}
          </span>
          {lesson.room ? (
            <span className="inline-flex items-center gap-1 font-medium text-[#1a4d42]/55 dark:text-white/45">
              <MapPin className="h-3 w-3" aria-hidden />
              Room {lesson.room}
            </span>
          ) : null}
        </div>
        <CountdownPanel startsAt={nextLesson.startsAt} period={nextLesson.period} time={nextLesson.time} />
      </div>
    </section>
  );
}

function CountdownPanel({ startsAt, period, time }: { startsAt: string; period: string; time: string }) {
  const seconds = useSecondsUntil(startsAt);
  return (
    <div className="relative mt-4 flex items-end justify-between gap-3 overflow-hidden rounded-[18px] bg-[#0a2620] px-4 py-3.5 text-white">
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_center,rgba(196,154,82,0.35),transparent_65%)]" />
      <div className="relative">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#d9c49a]/80">Starts in</p>
        <p className="mt-1 font-display text-[28px] leading-none tabular-nums tracking-[-0.02em] text-[#fbf8ef]" role="timer" aria-live="off">
          {formatStartsIn(seconds)}
        </p>
      </div>
      <div className="relative text-right">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/40">{period}</p>
        <p className="mt-1 text-[12px] font-semibold tabular-nums text-white/80">{time}</p>
      </div>
    </div>
  );
}
