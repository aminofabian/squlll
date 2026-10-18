"use client";

import { useMemo } from "react";
import type { CompleteTimetable, TimetableSlot } from "@/lib/timetable/types";
import { formatYmdInTimezone } from "@/lib/timetable/week";
import { buildWeekRows } from "./buildWeekRows";
import { getWeekDayDates } from "./getWeekDayDates";
import { formatWeekRangeLabel } from "./formatWeekRangeLabel";
import { summarizeWeekSchedule } from "./summarizeWeekSchedule";
import { countPeriodsPerDay } from "./countPeriodsPerDay";
import { countLessonsPerDay } from "./countLessonsPerDay";
import { buildLessonTints } from "./buildLessonTints";
import { findBusiestDay } from "./findBusiestDay";
import { buildLessonGroups } from "./buildLessonGroups";
import { getDisplayWeek } from "./getDisplayWeek";
import type { WeekViewerType } from "./weekViewerType";

const SCHOOL_WEEKDAYS = [1, 2, 3, 4, 5] as const;

/** Derived, display-ready structure of the week being shown. */
export function useWeekLayout(
  timetable: CompleteTimetable | null,
  timeSlots: TimetableSlot[],
  viewType: WeekViewerType,
  now: Date,
) {
  const todayYmd = formatYmdInTimezone(now);
  const displayWeek = useMemo(() => getDisplayWeek(todayYmd), [todayYmd]);

  return useMemo(() => {
    const days = timetable?.days ?? [];
    const dayDates = getWeekDayDates(displayWeek.weekStartYmd, SCHOOL_WEEKDAYS);
    const rows = timetable
      ? buildWeekRows({ days, timeSlots, breaks: timetable.breaks, dayNumbers: SCHOOL_WEEKDAYS })
      : [];
    const periodCounts = countPeriodsPerDay(rows, SCHOOL_WEEKDAYS);
    const lessonCounts = countLessonsPerDay(rows, SCHOOL_WEEKDAYS);
    const lessonGroups = buildLessonGroups(days, timeSlots, viewType);

    return {
      rows,
      dayDates,
      displayWeek,
      weekRangeLabel: formatWeekRangeLabel(dayDates),
      periodCounts,
      lessonCounts,
      busiestDay: findBusiestDay(periodCounts),
      summary: timetable ? summarizeWeekSchedule(days, timeSlots) : null,
      lessonGroups,
      tints: buildLessonTints(lessonGroups, viewType),
    };
  }, [timetable, timeSlots, viewType, displayWeek]);
}
