"use client";

import { CalendarX2 } from "lucide-react";
import type { TimetableLesson } from "@/lib/timetable/types";
import type { AgendaItem } from "@/lib/timetable/weekView/buildDayAgenda";
import type { LessonGroups } from "@/lib/timetable/weekView/buildLessonGroups";
import type { WeekViewerType } from "@/lib/timetable/weekView/weekViewerType";
import { resolveLessonState, type LessonStateContext } from "@/lib/timetable/weekView/resolveLessonState";
import { describeLessonCard } from "@/lib/timetable/weekView/describeLessonCard";
import { formatTimeRange } from "@/lib/timetable/weekView/formatTimeRange";
import { WeekLessonCard } from "./WeekLessonCard";
import { WeekBreakBand } from "./WeekBreakBand";
import { WEEK_CARD_CLASS } from "./weekCardClass";

const ROW_GRID = "grid grid-cols-[48px_1fr] items-stretch gap-2";

type AgendaContext = LessonStateContext & {
  viewType: WeekViewerType;
  lessonGroups: LessonGroups;
  focusedGroupKey: string | null;
  progressPercent: number;
  onLessonClick: (lesson: TimetableLesson, dayOfWeek: number, periodNumber: number) => void;
};

type WeekDayAgendaProps = {
  items: AgendaItem[];
  dayName: string;
  context: AgendaContext;
};

function trimLeadingZero(time: string): string {
  return time.replace(/^0(\d)/, "$1");
}

export function WeekDayAgenda({ items, dayName, context }: WeekDayAgendaProps) {
  if (!items.some((item) => item.kind === "lesson")) {
    return (
      <div className={`${WEEK_CARD_CLASS} flex flex-col items-center px-6 py-8 text-center`}>
        <CalendarX2 className="h-6 w-6 text-[#5b6862]" aria-hidden />
        <p className="mt-2 text-[14px] font-bold text-[#111a16] dark:text-white">No lessons on {dayName}</p>
      </div>
    );
  }

  return (
    <ol className="space-y-1.5">
      {items.map((item) => (
        <li key={item.key} className={ROW_GRID}>
          <AgendaRow item={item} context={context} />
        </li>
      ))}
    </ol>
  );
}

function AgendaRow({ item, context }: { item: AgendaItem; context: AgendaContext }) {
  if (item.kind === "break") {
    return (
      <>
        <span className="self-center text-[11px] tabular-nums text-[#5b6862] dark:text-white/60">
          {item.breakItem.startTime ? trimLeadingZero(item.breakItem.startTime) : ""}
        </span>
        <WeekBreakBand breakItem={item.breakItem} />
      </>
    );
  }
  if (item.kind === "free") {
    return (
      <>
        <span aria-hidden />
        <p className="rounded-lg border border-dashed border-[#d9ded8] px-3 py-1.5 text-[12px] text-[#5b6862] dark:border-white/15 dark:text-white/60">
          Free · {formatTimeRange(item.startTime, item.endTime)}
        </p>
      </>
    );
  }
  return <AgendaLesson item={item} context={context} />;
}

function AgendaLesson({ item, context }: { item: Extract<AgendaItem, { kind: "lesson" }>; context: AgendaContext }) {
  const { lesson, dayOfWeek, rowSpan } = item;
  const group = context.lessonGroups.groupFor(lesson);
  const text = describeLessonCard(lesson, context.viewType, context.lessonGroups.mode, group);
  const detail = [text.detail, lesson.room && `Room ${lesson.room}`].filter(Boolean).join(" · ");
  const timeRange = formatTimeRange(item.startTime, item.endTime);

  return (
    <>
      <span className="flex flex-col pt-1.5">
        <span className="text-[15px] font-bold leading-none text-[#111a16] dark:text-white">{item.periodNumber}</span>
        <span className="mt-1 text-[11px] tabular-nums text-[#5b6862] dark:text-white/60">{trimLeadingZero(item.startTime)}</span>
      </span>
      <div className={rowSpan > 1 ? "flex min-h-[84px]" : "flex min-h-[52px]"}>
        <WeekLessonCard
          title={text.title}
          detail={detail}
          room=""
          badge={group.badge}
          accent={group.accent}
          surface={group.surface}
          state={resolveLessonState({ lesson, dayOfWeek, slotIndex: item.slotIndex, rowSpan }, context)}
          doubleLabel={rowSpan > 1 ? `Double period · ${timeRange}` : null}
          progressPercent={context.progressPercent}
          isDimmed={context.focusedGroupKey != null && context.focusedGroupKey !== group.key}
          onSelect={() => context.onLessonClick(lesson, dayOfWeek, item.periodNumber)}
        />
      </div>
    </>
  );
}
