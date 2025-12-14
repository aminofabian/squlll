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
 * Get period slots grouped by day with helper functions
 * This supports day-specific periods where different days may have different time slots
 */
export function usePeriodSlots() {
  const store = useTimetableStore();

  return useMemo(() => {
    // Group slots by day: { 1: [slot1, slot2], 2: [...], ... }
    const slotsByDay: Record<number, typeof store.timeSlots> = {};
    store.timeSlots.forEach((slot) => {
      const day = slot.dayOfWeek ?? 1; // Default to Monday if no dayOfWeek
      if (!slotsByDay[day]) slotsByDay[day] = [];
      slotsByDay[day].push(slot);
    });

    // Sort slots within each day by period number
    Object.values(slotsByDay).forEach((slots) => {
      slots.sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0));
    });

    // Compute union of all period numbers across all days (including period 0)
    const periodSet = new Set<number>();
    store.timeSlots.forEach((slot) => {
      if (typeof slot.periodNumber === 'number') {
        periodSet.add(slot.periodNumber);
      }
    });
    const periodNumbers = Array.from(periodSet).sort((a, b) => a - b);
    
    // DEBUG: Log what periods we actually have
    console.log('🔍 DEBUG - Period Numbers Found:', periodNumbers);
    console.log('🔍 DEBUG - Total Time Slots:', store.timeSlots.length);
    console.log('🔍 DEBUG - Time Slots Sample:', store.timeSlots.slice(0, 5));

    // Helper: get slot for a specific day and period
    const getSlotFor = (dayIndex: number, period: number) => {
      const daySlots = slotsByDay[dayIndex + 1] || [];
      return daySlots.find((s) => s.periodNumber === period);
    };

    // Helper: get first available slot for a period (for time column display)
    const getBaseSlotForPeriod = (period: number) => {
      for (let d = 0; d < 5; d++) {
        const slot = getSlotFor(d, period);
        if (slot) return slot;
      }
      return undefined;
    };

    return {
      slotsByDay,
      periodNumbers,
      getSlotFor,
      getBaseSlotForPeriod,
    };
  }, [store.timeSlots]);
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
      // Only add slots that apply to this day (or have no dayOfWeek = apply to all)
      store.timeSlots
        .filter((slot) => !slot.dayOfWeek || slot.dayOfWeek === day)
        .forEach((slot) => {
          grid[day][slot.id] = null;
        });
    }

    // Fill grid with entries
    store.entries
      .filter((entry) => entry.gradeId === gradeId)
      .forEach((entry) => {
        const enriched = selectors.enrichEntry(entry);
        if (grid[entry.dayOfWeek]) {
          grid[entry.dayOfWeek][entry.timeSlotId] = enriched;
        }
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


