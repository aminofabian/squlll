import { useMemo } from "react";
import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";

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
  const daysPerWeek = useTimetableStore((s) => s.daysPerWeek);

  return useMemo(() => {
    const d = daysPerWeek || 5;
    const periodCount = timeSlots.length;
    const totalSlotsPerGrade = periodCount * d;

    const byGrade: GradeTimetableOverview[] = grades.map((g) => {
      const gradeEntries = entries.filter((e) => e.gradeId === g.id);
      const filledSlots = new Set(
        gradeEntries.map((e) => `${e.dayOfWeek}:${e.timeSlotId}`),
      ).size;
      const completionPercentage =
        totalSlotsPerGrade > 0
          ? Math.round((filledSlots / totalSlotsPerGrade) * 100)
          : 0;

      return {
        gradeId: g.id,
        label: g.displayName || g.name,
        filledSlots,
        totalSlots: totalSlotsPerGrade,
        completionPercentage,
        lessonCount: gradeEntries.length,
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
  }, [grades, entries, timeSlots, daysPerWeek]);
}
