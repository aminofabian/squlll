"use client";

import { useMemo } from "react";
import type { CompleteTimetable, TimetableSlot } from "@/lib/timetable/types";
import { getWeekStartDate } from "@/lib/timetable/week";
import { buildWeekRows } from "./buildWeekRows";
import { getWeekDayDates } from "./getWeekDayDates";
import { formatWeekRangeLabel } from "./formatWeekRangeLabel";
import { summarizeWeekSchedule } from "./summarizeWeekSchedule";
import { countLessonsPerDay } from "./countLessonsPerDay";

const SCHOOL_WEEKDAYS = [1, 2, 3, 4, 5] as const;

/** Derived, display-ready structure of the teacher's week. */
export function useWeekLayout(
  timetable: CompleteTimetable | null,
  timeSlots: TimetableSlot[],
) {
  return useMemo(() => {
    const dayDates = getWeekDayDates(getWeekStartDate(), SCHOOL_WEEKDAYS);
    const weekRangeLabel = formatWeekRangeLabel(dayDates);

    const rows = timetable
      ? buildWeekRows({
          days: timetable.days,
          timeSlots,
          breaks: timetable.breaks,
          dayNumbers: SCHOOL_WEEKDAYS,
        })
      : [];
    const lessonCounts = countLessonsPerDay(rows, SCHOOL_WEEKDAYS);
    const summary = timetable
      ? summarizeWeekSchedule(timetable.days, timeSlots)
      : null;

    return { rows, dayDates, weekRangeLabel, lessonCounts, summary };
  }, [timetable, timeSlots]);
}
