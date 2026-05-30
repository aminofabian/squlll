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
  const gradeStats = useTimetableStore((s) => s.gradeStats);

  return useMemo(() => {
    // Use backend-precomputed gradeStats when available (avoids client-side recomputation)
    if (
      gradeStats &&
      gradeStats.length > 0 &&
      gradeStats.length >= grades.length
    ) {
      const byGrade: GradeTimetableOverview[] = gradeStats.map((gs) => {
        const grade = grades.find((g) => g.id === gs.gradeId);
        return {
          gradeId: gs.gradeId,
          label: grade?.displayName || grade?.name || gs.gradeName,
          filledSlots: gs.filledSlots,
          totalSlots: gs.totalSlots,
          completionPercentage:
            gs.totalSlots > 0
              ? Math.round((gs.filledSlots / gs.totalSlots) * 100)
              : 0,
          lessonCount: gs.totalLessons,
        };
      });

      const totalFilled = byGrade.reduce((sum, g) => sum + g.filledSlots, 0);
      const totalSlots = byGrade.reduce((sum, g) => sum + g.totalSlots, 0);
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
    }

    // Fallback: client-side computation (for entries loaded outside getSchoolTimetable)
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
            totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

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
    gradeStats,
  ]);
}
