"use client";

import { PartyPopper } from "lucide-react";
import type { NextLessonInfo, TimetableSlot } from "@/lib/timetable/types";
import type { LessonGroups } from "@/lib/timetable/weekView/buildLessonGroups";
import type { WeekViewerType } from "@/lib/timetable/weekView/weekViewerType";
import { useSecondsUntil } from "@/lib/timetable/weekView/useSecondsUntil";
import { describeNextLessonStart } from "@/lib/timetable/weekView/describeNextLessonStart";
import { describeUpNext } from "@/lib/timetable/weekView/describeUpNext";
import { getClassIdentity } from "@/lib/timetable/weekView/getClassIdentity";
import { WeekGroupBadge } from "./WeekGroupBadge";

const LATER_TODAY = "Later today";
const CARD = "rounded-xl bg-[#111a17] p-4 text-white";

type WeekUpNextCardProps = {
  nextLesson: NextLessonInfo | null;
  viewType: WeekViewerType;
  lessonGroups: LessonGroups;
  timeSlots: TimetableSlot[];
};

function describeCounterpart(next: NextLessonInfo, viewType: WeekViewerType) {
  const { lesson } = next;
  if (viewType === "student") {
    return { label: lesson.teacher.name, badge: lesson.teacher.name.charAt(0).toUpperCase() };
  }
  const identity = getClassIdentity(lesson);
  return { label: identity.fullLabel, badge: identity.badge };
}

export function WeekUpNextCard({ nextLesson, viewType, lessonGroups, timeSlots }: WeekUpNextCardProps) {
  if (!nextLesson) {
    return (
      <section className={`${CARD} text-center`}>
        <PartyPopper className="mx-auto h-5 w-5 text-[#8fb6ff]" aria-hidden />
        <p className="mt-2 text-[18px] font-bold">All clear</p>
        <p className="mt-0.5 text-[12px] text-white/70">No more lessons this week.</p>
      </section>
    );
  }

  const counterpart = describeCounterpart(nextLesson, viewType);
  const { timeRange, detail } = describeUpNext(nextLesson, timeSlots);
  const accent = lessonGroups.groupFor(nextLesson.lesson).accent;

  return (
    <section className={CARD}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8fb6ff]">Up next</span>
        <StartsPill startsAt={nextLesson.startsAt} time={nextLesson.time} dayLabel={nextLesson.dayLabel} />
      </div>
      <h3 className="mt-2 truncate text-[22px] font-bold leading-tight tracking-[-0.01em]">{nextLesson.lesson.subject.name}</h3>
      <p className="mt-2 flex items-center gap-2 text-[13px] font-semibold">
        <WeekGroupBadge letter={counterpart.badge} accent={accent} />
        <span className="truncate">{counterpart.label}</span>
      </p>
      <div className="mt-3 border-t border-white/15 pt-3">
        <p className="text-[30px] font-bold leading-none tabular-nums tracking-[-0.02em]">{timeRange}</p>
        <p className="mt-1.5 text-[12px] text-white/70">{detail}</p>
      </div>
    </section>
  );
}

function StartsPill({ startsAt, time, dayLabel }: { startsAt: string; time: string; dayLabel?: string | null }) {
  const seconds = useSecondsUntil(startsAt);
  const start = describeNextLessonStart(seconds, time, dayLabel);
  const label = start.isCountdown ? `In ${start.value}` : (dayLabel ?? LATER_TODAY);
  return (
    <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-semibold tabular-nums" role={start.isCountdown ? "timer" : undefined}>
      {label}
    </span>
  );
}
