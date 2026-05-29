// app/school/[subdomain]/(pages)/timetable/hooks/useTimetableData.ts
// NEW: Hooks for working with normalized timetable data

import { useMemo } from "react";
import {
  useTimetableStore,
  useTimetableSelectors,
} from "@/lib/stores/useTimetableStoreNew";
import type {
  TimetableEntry,
  EnrichedTimetableEntry,
} from "@/lib/types/timetable";
import { inferDaysPerWeek } from "../utils/timetableWeekDays";
import { entryMatchesGradeScope } from "../utils/resolveGradeForSchoolConfig";

/**
 * Get all entries for the currently selected grade
 * Returns enriched entries with full subject/teacher/timeslot data
 */
export function useSelectedGradeTimetable() {
  const store = useTimetableStore();
  const selectors = useTimetableSelectors();

  return useMemo(() => {
    if (!store.selectedGradeId) return [];

    const selectedGradeId = store.selectedGradeId;
    const selectedStreamId = store.selectedStreamId;

    const entries = store.entries.filter((entry) =>
      entryMatchesGradeScope(
        entry,
        selectedGradeId,
        selectedStreamId,
        store.grades,
      ),
    );

    // Enrich with full data
    return entries.map((entry) => selectors.enrichEntry(entry));
  }, [
    store.selectedGradeId,
    store.selectedStreamId,
    store.entries,
    store.subjects,
    store.teachers,
    store.timeSlots,
    store.grades,
  ]);
}

/**
 * Get period slots grouped by day with helper functions
 * This supports day-specific periods where different days may have different time slots
 */
export function usePeriodSlots() {
  const store = useTimetableStore();

  return useMemo(() => {
    const daysPerWeek = store.daysPerWeek || 5;

    const slotsByDay: Record<number, typeof store.timeSlots> = {};
    store.timeSlots.forEach((slot) => {
      if (slot.dayOfWeek) {
        if (!slotsByDay[slot.dayOfWeek]) slotsByDay[slot.dayOfWeek] = [];
        slotsByDay[slot.dayOfWeek].push(slot);
      } else {
        for (let day = 1; day <= daysPerWeek; day++) {
          if (!slotsByDay[day]) slotsByDay[day] = [];
          slotsByDay[day].push(slot);
        }
      }
    });

    // Sort slots within each day by period number
    Object.values(slotsByDay).forEach((slots) => {
      slots.sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0));
    });

    const periodNumbersFromSlots = (() => {
      const periodSet = new Set<number>();
      store.timeSlots.forEach((slot) => {
        if (typeof slot.periodNumber === "number" && slot.periodNumber >= 1) {
          periodSet.add(slot.periodNumber);
        }
      });
      return Array.from(periodSet).sort((a, b) => a - b);
    })();

    const periodNumbers = [
      ...new Set([
        ...periodNumbersFromSlots,
        ...(periodNumbersFromSlots.length === 0
          ? store.periodNumbers || []
          : []),
        ...(store.timeSlots.length > 0 &&
        store.lessonPeriodsPerDay &&
        store.lessonPeriodsPerDay > 0
          ? Array.from(
              { length: store.lessonPeriodsPerDay },
              (_, i) => i + 1,
            )
          : []),
      ]),
    ].sort((a, b) => a - b);

    // Helper: get slot for a specific day and period
    const getSlotFor = (dayIndex: number, period: number) => {
      const daySlots = slotsByDay[dayIndex + 1] || [];
      return daySlots.find((s) => s.periodNumber === period);
    };

    // Helper: get first available slot for a period (for time column display)
    const getBaseSlotForPeriod = (period: number) => {
      for (let d = 0; d < daysPerWeek; d++) {
        const slot = getSlotFor(d, period);
        if (slot) return slot;
      }
      return undefined;
    };

    return {
      slotsByDay,
      periodNumbers,
      daysPerWeek,
      getSlotFor,
      getBaseSlotForPeriod,
    };
  }, [
    store.timeSlots,
    store.periodNumbers,
    store.entries,
    store.breaks,
    store.lessonPeriodsPerDay,
    store.daysPerWeek,
  ]);
}

/**
 * Get timetable organized by day and period
 */
export function useTimetableGrid(gradeId: string | null) {
  const store = useTimetableStore();
  const selectors = useTimetableSelectors();

  return useMemo(() => {
    if (!gradeId) return {};

    const grid: Record<
      string,
      Record<string, EnrichedTimetableEntry | null>
    > = {};

    const daysPerWeek = store.daysPerWeek || 5;

    for (let day = 1; day <= daysPerWeek; day++) {
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
      .filter((entry) =>
        entryMatchesGradeScope(
          entry,
          gradeId,
          store.selectedStreamId,
          store.grades,
        ),
      )
      .forEach((entry) => {
        const enriched = selectors.enrichEntry(entry);
        if (!grid[entry.dayOfWeek]) return;

        const daySlot =
          store.timeSlots.find(
            (s) =>
              s.id === entry.timeSlotId &&
              (!s.dayOfWeek || s.dayOfWeek === entry.dayOfWeek),
          ) ??
          (entry.periodNumber
            ? store.timeSlots.find(
                (s) =>
                  s.periodNumber === entry.periodNumber &&
                  (!s.dayOfWeek || s.dayOfWeek === entry.dayOfWeek),
              )
            : undefined);

        const slotKey = daySlot?.id ?? entry.timeSlotId;
        grid[entry.dayOfWeek][slotKey] = enriched;
      });

    return grid;
  }, [gradeId, store.entries, store.timeSlots, store.breaks, store.grades, store.selectedStreamId, selectors]);
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
        filledSlots: 0,
        totalSlots: 0,
      };
    }

    const gradeEntries = store.entries.filter((e) => e.gradeId === gradeId);

    const subjectDistribution: Record<string, number> = {};
    const teacherWorkload: Record<string, number> = {};

    gradeEntries.forEach((entry) => {
      const subject = store.subjects.find((s) => s.id === entry.subjectId);
      const teacher = store.teachers.find((t) => t.id === entry.teacherId);

      if (subject) {
        subjectDistribution[subject.name] =
          (subjectDistribution[subject.name] || 0) + 1;
      }
      if (teacher) {
        teacherWorkload[teacher.name] =
          (teacherWorkload[teacher.name] || 0) + 1;
      }
    });

    const daysPerWeek = store.daysPerWeek || 5;
    const periodCount = store.timeSlots.length;
    const totalSlots = periodCount * daysPerWeek;
    const filledSlots = new Set(
      gradeEntries.map((e) => `${e.dayOfWeek}:${e.timeSlotId}`),
    ).size;
    const completionPercentage =
      totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

    return {
      totalLessons: gradeEntries.length,
      subjectDistribution,
      teacherWorkload,
      completionPercentage,
      filledSlots,
      totalSlots,
    };
  }, [
    gradeId,
    store.entries,
    store.subjects,
    store.teachers,
    store.timeSlots,
    store.breaks,
  ]);
}

/**
 * Get teacher's full schedule across all grades
 */
export function useTeacherSchedule(teacherId: string) {
  const store = useTimetableStore();
  const selectors = useTimetableSelectors();

  return useMemo(() => {
    const teacherEntries = store.entries.filter(
      (e) => e.teacherId === teacherId,
    );
    return teacherEntries.map((e) => selectors.enrichEntry(e));
  }, [teacherId, store.entries, selectors]);
}
