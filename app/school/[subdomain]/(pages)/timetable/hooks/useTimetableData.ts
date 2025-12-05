// app/school/[subdomain]/(pages)/timetable/hooks/useTimetableData.ts
// NEW: Hooks for working with normalized timetable data

import { useMemo } from 'react';
import { useTimetableStore, useTimetableSelectors } from '@/lib/stores/useTimetableStoreNew';
import type { TimetableEntry, EnrichedTimetableEntry } from '@/lib/types/timetable';

/**
 * Get all entries for the currently selected grade
 * Returns enriched entries with full subject/teacher/timeslot data
 */
export function useSelectedGradeTimetable() {
  const store = useTimetableStore();
  const selectors = useTimetableSelectors();

  return useMemo(() => {
    if (!store.selectedGradeId) return [];

    const entries = store.entries.filter(
      (entry) => entry.gradeId === store.selectedGradeId
    );

    // Enrich with full data
    return entries.map((entry) => selectors.enrichEntry(entry));
  }, [store.selectedGradeId, store.entries, store.subjects, store.teachers, store.timeSlots, store.grades]);
}

/**
 * Get timetable organized by day and period
 */
export function useTimetableGrid(gradeId: string | null) {
  const store = useTimetableStore();
  const selectors = useTimetableSelectors();

  return useMemo(() => {
    if (!gradeId) return {};

    const grid: Record<string, Record<string, EnrichedTimetableEntry | null>> = {};

    // Initialize grid: { "1": { "slot-1": null, "slot-2": null }, "2": {...}, ... }
    for (let day = 1; day <= 5; day++) {
      grid[day] = {};
      store.timeSlots.forEach((slot) => {
        grid[day][slot.id] = null;
      });
    }

    // Fill grid with entries
    store.entries
      .filter((entry) => entry.gradeId === gradeId)
      .forEach((entry) => {
        const enriched = selectors.enrichEntry(entry);
        grid[entry.dayOfWeek][entry.timeSlotId] = enriched;
      });

    return grid;
  }, [gradeId, store.entries, store.timeSlots, selectors]);
}

/**
 * Get all breaks for a specific day
 */
export function useBreaksForDay(dayOfWeek: number) {
  const store = useTimetableStore();

  return useMemo(() => {
    return store.breaks.filter((b) => b.dayOfWeek === dayOfWeek);
  }, [store.breaks, dayOfWeek]);
}

/**
 * Search/filter entries
 */
export function useFilteredEntries(searchTerm: string) {
  const store = useTimetableStore();
  const selectors = useTimetableSelectors();

  return useMemo(() => {
    if (!searchTerm.trim()) {
      return store.entries.map((e) => selectors.enrichEntry(e));
    }

    const term = searchTerm.toLowerCase();

    return store.entries
      .filter((entry) => {
        const subject = store.subjects.find((s) => s.id === entry.subjectId);
        const teacher = store.teachers.find((t) => t.id === entry.teacherId);

        return (
          subject?.name.toLowerCase().includes(term) ||
          teacher?.name.toLowerCase().includes(term) ||
          entry.roomNumber?.toLowerCase().includes(term)
        );
      })
      .map((e) => selectors.enrichEntry(e));
  }, [store.entries, store.subjects, store.teachers, searchTerm, selectors]);
}

/**
 * Get statistics for currently selected grade
 */
export function useGradeStatistics(gradeId: string | null) {
  const store = useTimetableStore();

  return useMemo(() => {
    if (!gradeId) {
      return {
        totalLessons: 0,
        subjectDistribution: {},
        teacherWorkload: {},
        completionPercentage: 0,
      };
    }

    const gradeEntries = store.entries.filter((e) => e.gradeId === gradeId);
    
    const subjectDistribution: Record<string, number> = {};
    const teacherWorkload: Record<string, number> = {};

    gradeEntries.forEach((entry) => {
      const subject = store.subjects.find((s) => s.id === entry.subjectId);
      const teacher = store.teachers.find((t) => t.id === entry.teacherId);

      if (subject) {
        subjectDistribution[subject.name] = (subjectDistribution[subject.name] || 0) + 1;
      }
      if (teacher) {
        teacherWorkload[teacher.name] = (teacherWorkload[teacher.name] || 0) + 1;
      }
    });

    const totalPossibleSlots = store.timeSlots.length * 5; // 5 days
    const completionPercentage = Math.round(
      (gradeEntries.length / totalPossibleSlots) * 100
    );

    return {
      totalLessons: gradeEntries.length,
      subjectDistribution,
      teacherWorkload,
      completionPercentage,
    };
  }, [gradeId, store.entries, store.subjects, store.teachers, store.timeSlots]);
}

/**
 * Get teacher's full schedule across all grades
 */
export function useTeacherSchedule(teacherId: string) {
  const store = useTimetableStore();
  const selectors = useTimetableSelectors();

  return useMemo(() => {
    const teacherEntries = store.entries.filter((e) => e.teacherId === teacherId);
    return teacherEntries.map((e) => selectors.enrichEntry(e));
  }, [teacherId, store.entries, selectors]);
}


