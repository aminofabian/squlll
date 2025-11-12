import { useMemo } from 'react';
import type { CellData, TimeSlot, Break } from '@/lib/stores/useTimetableStore';

export interface LessonStats {
  totalLessons: number;
  totalTeachers: number;
  totalSubjects: number;
  doubleLessons: number;
  totalBreaks: number;
  mostBusyTeacher: string;
  mostBusyDay: string;
  mostBusyTime: string;
  averageLessonsPerDay: number;
  completionPercentage: number;
  teacherWorkload: Record<string, number>;
  subjectDistribution: Record<string, number>;
  dayDistribution: Record<string, number>;
  timeSlotUsage: Record<string, number>;
  breakDistribution: Record<string, number>;
}

interface Day {
  name: string;
  color: string;
}

/**
 * Optimized hook to calculate lesson statistics
 * Uses useMemo to prevent recalculation on every render
 */
export const useTimetableStats = (
  subjects: Record<string, CellData>,
  breaks: Break[],
  timeSlots: TimeSlot[],
  days: Day[],
  selectedGrade: string
): LessonStats => {
  // Memoize break names for quick lookup
  const breakNames = useMemo(
    () => new Set(breaks.map(b => b.name.toLowerCase())),
    [breaks]
  );

  const isBreak = (subject: string): boolean => {
    return breakNames.has(subject.toLowerCase());
  };

  const getCellKey = (grade: string, timeId: number, dayIndex: number): string => {
    return `${grade}-${dayIndex + 1}-${timeId}`;
  };

  // Calculate all statistics in one pass
  const stats = useMemo((): LessonStats => {
    const teacherWorkload: Record<string, number> = {};
    const subjectDistribution: Record<string, number> = {};
    const dayDistribution: Record<string, number> = {};
    const timeSlotUsage: Record<string, number> = {};
    const breakDistribution: Record<string, number> = {};
    
    let totalLessons = 0;
    let doubleLessons = 0;
    let totalBreaks = 0;

    // Single pass through all subjects
    Object.entries(subjects).forEach(([cellKey, cellData]) => {
      if (!cellData?.subject) return;

      const [grade, dayIndex, timeId] = cellKey.split('-');
      const dayName = days[parseInt(dayIndex)]?.name || 'Unknown';
      const timeSlot = timeSlots.find(t => t.id === parseInt(timeId));

      if (isBreak(cellData.subject)) {
        totalBreaks++;
        breakDistribution[cellData.subject] = (breakDistribution[cellData.subject] || 0) + 1;
      } else {
        totalLessons++;

        // Teacher workload
        if (cellData.teacher) {
          teacherWorkload[cellData.teacher] = (teacherWorkload[cellData.teacher] || 0) + 1;
        }

        // Subject distribution
        subjectDistribution[cellData.subject] = (subjectDistribution[cellData.subject] || 0) + 1;

        // Check for double lessons
        const currentTimeId = parseInt(timeId);
        const currentDayIndex = parseInt(dayIndex);
        const nextCellKey = getCellKey(selectedGrade, currentTimeId + 1, currentDayIndex - 1);
        const nextCellData = subjects[nextCellKey];

        if (
          nextCellData &&
          nextCellData.subject === cellData.subject &&
          nextCellData.teacher === cellData.teacher
        ) {
          doubleLessons++;
        }
      }

      // Day distribution
      dayDistribution[dayName] = (dayDistribution[dayName] || 0) + 1;

      // Time slot usage
      if (timeSlot) {
        timeSlotUsage[timeSlot.time] = (timeSlotUsage[timeSlot.time] || 0) + 1;
      }
    });

    // Calculate derived statistics
    const mostBusyTeacher =
      Object.entries(teacherWorkload).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    const mostBusyDay =
      Object.entries(dayDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    const mostBusyTime =
      Object.entries(timeSlotUsage).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    const totalDays = days.length;
    const averageLessonsPerDay =
      totalDays > 0 ? Math.round((totalLessons / totalDays) * 10) / 10 : 0;

    const totalPossibleCells = timeSlots.length * days.length;
    const completionPercentage =
      totalPossibleCells > 0
        ? Math.round(((totalLessons + totalBreaks) / totalPossibleCells) * 100)
        : 0;

    return {
      totalLessons,
      totalTeachers: Object.keys(teacherWorkload).length,
      totalSubjects: Object.keys(subjectDistribution).length,
      doubleLessons,
      totalBreaks,
      mostBusyTeacher,
      mostBusyDay,
      mostBusyTime,
      averageLessonsPerDay,
      completionPercentage,
      teacherWorkload,
      subjectDistribution,
      dayDistribution,
      timeSlotUsage,
      breakDistribution,
    };
  }, [subjects, breaks, timeSlots, days, selectedGrade, breakNames, isBreak]);

  return stats;
};

