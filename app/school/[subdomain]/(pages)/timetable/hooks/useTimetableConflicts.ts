import { useMemo } from 'react';
import type { CellData, Break } from '@/lib/stores/useTimetableStore';

export interface Conflict {
  teacher: string;
  conflictingClasses: Array<{
    grade: string;
    cellKey: string;
    subject: string;
  }>;
}

interface TeacherSchedule {
  [teacher: string]: {
    [scheduleKey: string]: Array<{
      grade: string;
      cellKey: string;
      subject: string;
    }>;
  };
}

/**
 * Optimized hook to detect teacher scheduling conflicts
 * Uses useMemo to only recalculate when subjects change
 */
export const useTimetableConflicts = (
  subjects: Record<string, CellData>,
  breaks: Break[]
): Record<string, Conflict> => {
  // Memoize break names for quick lookup
  const breakNames = useMemo(
    () => new Set(breaks.map(b => b.name.toLowerCase())),
    [breaks]
  );

  const isBreak = (subject: string): boolean => {
    return breakNames.has(subject.toLowerCase());
  };

  // Calculate conflicts
  const conflicts = useMemo((): Record<string, Conflict> => {
    const newConflicts: Record<string, Conflict> = {};
    const teacherSchedule: TeacherSchedule = {};

    // Build teacher schedule map (single pass)
    Object.entries(subjects).forEach(([cellKey, cellData]) => {
      if (!cellData?.teacher || isBreak(cellData.subject)) return;

      const teacher = cellData.teacher;
      const [grade, dayIndex, timeId] = cellKey.split('-');
      const scheduleKey = `${timeId}-${dayIndex}`;

      if (!teacherSchedule[teacher]) {
        teacherSchedule[teacher] = {};
      }

      if (!teacherSchedule[teacher][scheduleKey]) {
        teacherSchedule[teacher][scheduleKey] = [];
      }

      teacherSchedule[teacher][scheduleKey].push({
        grade,
        cellKey,
        subject: cellData.subject,
      });
    });

    // Find conflicts (single pass through teachers)
    Object.entries(teacherSchedule).forEach(([teacher, schedule]) => {
      Object.entries(schedule).forEach(([scheduleKey, classes]) => {
        if (classes.length > 1) {
          classes.forEach((classInfo) => {
            newConflicts[classInfo.cellKey] = {
              teacher,
              conflictingClasses: classes.filter((c) => c.cellKey !== classInfo.cellKey),
            };
          });
        }
      });
    });

    return newConflicts;
  }, [subjects, breakNames, isBreak]);

  return conflicts;
};

/**
 * Get total count of conflicts
 */
export const useConflictCount = (conflicts: Record<string, Conflict>): number => {
  return useMemo(() => Object.keys(conflicts).length, [conflicts]);
};

/**
 * Get conflict count for a specific teacher
 */
export const useTeacherConflictCount = (
  conflicts: Record<string, Conflict>,
  teacher: string
): number => {
  return useMemo(() => {
    return Object.values(conflicts).filter((conflict) => conflict.teacher === teacher).length;
  }, [conflicts, teacher]);
};

