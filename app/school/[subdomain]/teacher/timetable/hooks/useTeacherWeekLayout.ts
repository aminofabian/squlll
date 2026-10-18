"use client";

import { useMemo } from "react";
import type { CompleteTimetable, TimetableSlot } from "@/lib/timetable/types";
import { getWeekStartDate } from "@/lib/timetable/week";
import { buildTeacherWeekRows } from "../lib/buildTeacherWeekRows";
import { getWeekDayDates } from "../lib/getWeekDayDates";
import { formatWeekRangeLabel } from "../lib/formatWeekRangeLabel";
import { summarizeTeachingWeek } from "../lib/summarizeTeachingWeek";
import { countLessonsPerDay } from "../lib/countLessonsPerDay";

const TEACHING_WEEKDAYS = [1, 2, 3, 4, 5] as const;

/** Derived, display-ready structure of the teacher's week. */
export function useTeacherWeekLayout(
  timetable: CompleteTimetable | null,
  timeSlots: TimetableSlot[],
) {
  return useMemo(() => {
    const dayDates = getWeekDayDates(getWeekStartDate(), TEACHING_WEEKDAYS);
    const weekRangeLabel = formatWeekRangeLabel(dayDates);

    const rows = timetable
      ? buildTeacherWeekRows({
          days: timetable.days,
          timeSlots,
          breaks: timetable.breaks,
          dayNumbers: TEACHING_WEEKDAYS,
        })
      : [];
    const lessonCounts = countLessonsPerDay(rows, TEACHING_WEEKDAYS);
    const summary = timetable
      ? summarizeTeachingWeek(timetable.days, timeSlots)
      : null;

    return { rows, dayDates, weekRangeLabel, lessonCounts, summary };
  }, [timetable, timeSlots]);
}
