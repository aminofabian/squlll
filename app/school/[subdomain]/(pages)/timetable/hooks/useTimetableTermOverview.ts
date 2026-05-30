import { useMemo } from "react";
import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";
import { resolveCanonicalGradeId } from "../utils/resolveGradeForSchoolConfig";
import {
  countFilledSlots,
  countFilledSlotsForGrade,
  countGradeStreamUnits,
  getPeriodsPerDay,
  slotsPerClassWeek,
} from "../utils/timetableSlotStats";

export interface GradeTimetableOverview {
  gradeId: string;
  label: string;
  filledSlots: number;
  totalSlots: number;
  completionPercentage: number;
  lessonCount: number;
}

export interface TimetableTermOverview {
  byGrade: GradeTimetableOverview[];
  overallPercentage: number;
  totalFilled: number;
  totalSlots: number;
  gradesWithLessons: number;
  gradeCount: number;
}

export function useTimetableTermOverview(): TimetableTermOverview {
  const grades = useTimetableStore((s) => s.grades);
  const entries = useTimetableStore((s) => s.entries);
  const timeSlots = useTimetableStore((s) => s.timeSlots);
  const periodNumbers = useTimetableStore((s) => s.periodNumbers);
  const lessonPeriodsPerDay = useTimetableStore((s) => s.lessonPeriodsPerDay);
  const daysPerWeek = useTimetableStore((s) => s.daysPerWeek);

  return useMemo(() => {
    const days = daysPerWeek || 5;
    const periodsPerDay = getPeriodsPerDay({
      periodNumbers,
      timeSlots,
      lessonPeriodsPerDay,
    });
    const slotsPerWeek = slotsPerClassWeek(periodsPerDay, days);
    const classUnits = countGradeStreamUnits(grades);

    const byGrade: GradeTimetableOverview[] = grades.flatMap((g) => {
      const gradeEntries = entries.filter(
        (e) => resolveCanonicalGradeId(e.gradeId, grades) === g.id,
      );

      if (g.streams?.length) {
        return g.streams.map((stream) => {
          const streamEntries = gradeEntries.filter(
            (e) => e.streamId === stream.tenantStreamId,
          );
          const filledSlots = countFilledSlotsForGrade(
            entries,
            g.id,
            stream.tenantStreamId,
            grades,
            timeSlots,
          );
          const totalSlots = slotsPerWeek;
          const completionPercentage =
            totalSlots > 0
              ? Math.round((filledSlots / totalSlots) * 100)
              : 0;

          return {
            gradeId: g.id,
            label: `${g.displayName || g.name} · ${stream.name}`,
            filledSlots,
            totalSlots,
            completionPercentage,
            lessonCount: streamEntries.length,
          };
        });
      }

      const filledSlots = countFilledSlotsForGrade(
        entries,
        g.id,
        null,
        grades,
        timeSlots,
      );
      const totalSlots = slotsPerWeek;
      const completionPercentage =
        totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

      return [
        {
          gradeId: g.id,
          label: g.displayName || g.name,
          filledSlots,
          totalSlots,
          completionPercentage,
          lessonCount: gradeEntries.filter((e) => !e.streamId).length,
        },
      ];
    });

    const totalFilled = countFilledSlots(entries, grades, timeSlots);
    const totalSlots = classUnits * slotsPerWeek;
    const overallPercentage =
      totalSlots > 0 ? Math.round((totalFilled / totalSlots) * 100) : 0;
    const gradesWithLessons = byGrade.filter((g) => g.lessonCount > 0).length;

    return {
      byGrade,
      overallPercentage,
      totalFilled,
      totalSlots,
      gradesWithLessons,
      gradeCount: byGrade.length,
    };
  }, [
    grades,
    entries,
    timeSlots,
    periodNumbers,
    lessonPeriodsPerDay,
    daysPerWeek,
  ]);
}
