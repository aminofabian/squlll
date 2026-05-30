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
  Grade,
} from "@/lib/types/timetable";
import {
  entryMatchesGradeScope,
  resolveCanonicalGradeId,
} from "../utils/resolveGradeForSchoolConfig";
import {
  formatCombinedLessonShortcode,
  formatCombinedGradeLabel,
  getSubjectShortCode,
} from "../utils/lessonShortcodes";
import {
  countFilledSlotsForGrade,
  getPeriodsPerDay,
  slotsPerClassWeek,
} from "../utils/timetableSlotStats";

type GradeStreamSlot = {
  gradeId: string;
  streamId: string | null;
  gradeLevel: number;
  gradeLabel: string;
  gradeFullLabel: string;
  streamLabel: string | null;
  gradeShortLabel: string;
};

function gradeStreamKey(gradeId: string, streamId: string | null): string {
  return `${gradeId}:${streamId ?? ""}`;
}

function entryGradeStreamKey(entry: TimetableEntry, grades: Grade[]): string {
  const gradeId = resolveCanonicalGradeId(entry.gradeId, grades);
  return gradeStreamKey(gradeId, entry.streamId ?? null);
}

function buildGradeStreamCatalog(grades: Grade[]): GradeStreamSlot[] {
  const slots: GradeStreamSlot[] = [];

  for (const grade of [...grades].sort((a, b) => a.level - b.level)) {
    const gradeName = grade.name;
    const gradeDisplay = grade.displayName || gradeName;

    if (grade.streams?.length) {
      for (const stream of [...grade.streams].sort((a, b) =>
        a.name.localeCompare(b.name),
      )) {
        slots.push({
          gradeId: grade.id,
          streamId: stream.tenantStreamId,
          gradeLevel: grade.level,
          gradeLabel: gradeDisplay,
          gradeFullLabel: `${gradeName} · ${stream.name}`,
          streamLabel: stream.name,
          gradeShortLabel: formatCombinedGradeLabel(
            { name: gradeName, displayName: gradeDisplay },
            stream.name,
          ),
        });
      }
    } else {
      slots.push({
        gradeId: grade.id,
        streamId: null,
        gradeLevel: grade.level,
        gradeLabel: gradeDisplay,
        gradeFullLabel: gradeName,
        streamLabel: null,
        gradeShortLabel: formatCombinedGradeLabel(
          { name: gradeName, displayName: gradeDisplay },
          null,
        ),
      });
    }
  }

  return slots;
}

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
 * All lessons grouped by day and period for the whole-school combined view.
 */
export function useSchoolCombinedEntries() {
  const store = useTimetableStore();
  const selectors = useTimetableSelectors();

  return useMemo(() => {
    const periodNumbers = (() => {
      const periodSet = new Set<number>();
      store.timeSlots.forEach((slot) => {
        if (typeof slot.periodNumber === "number" && slot.periodNumber >= 1) {
          periodSet.add(slot.periodNumber);
        }
      });
      return Array.from(periodSet).sort((a, b) => a - b);
    })();

    const resolvePeriod = (entry: TimetableEntry): number | null => {
      if (entry.periodNumber) return entry.periodNumber;
      const slot = store.timeSlots.find((ts) => ts.id === entry.timeSlotId);
      if (slot?.periodNumber) return slot.periodNumber;
      return null;
    };

    const breakBlocksDoubleSpan = (
      dayOfWeek: number,
      afterPeriod: number,
    ): boolean =>
      store.breaks.some(
        (b) =>
          b.afterPeriod === afterPeriod &&
          (b.applyToAllDays || b.dayOfWeek === dayOfWeek),
      );

    const toCombinedEntry = (
      entry: TimetableEntry,
      options?: { isDoubleContinuation?: boolean },
    ) => {
      const enriched = selectors.enrichEntry(entry);
      const grade =
        store.grades.find((g) => g.id === entry.gradeId) ??
        store.grades.find((g) => g.tenantGradeLevelId === entry.gradeId);
      const gradeName = grade?.name || entry.gradeName || "Class";
      const gradeDisplay = grade?.displayName || gradeName;
      const stream =
        entry.streamId && grade?.streams?.length
          ? grade.streams.find((s) => s.tenantStreamId === entry.streamId)
          : undefined;
      const streamLabel = stream?.name ?? null;

      return {
        id: entry.id,
        isEmpty: false as const,
        gradeId: grade?.id ?? resolveCanonicalGradeId(entry.gradeId, store.grades),
        streamId: entry.streamId ?? null,
        gradeLevel: grade?.level ?? 0,
        gradeLabel: gradeDisplay,
        gradeFullLabel: streamLabel ? `${gradeName} · ${streamLabel}` : gradeName,
        streamLabel,
        gradeShortLabel: formatCombinedGradeLabel(
          { name: gradeName, displayName: gradeDisplay },
          streamLabel,
        ),
        shortLabel: formatCombinedLessonShortcode(enriched.subject, {
          name: gradeName,
          displayName: gradeDisplay,
        }),
        subject: enriched.subject,
        subjectCode: getSubjectShortCode(
          enriched.subject.name,
          enriched.subject.code,
        ),
        teacher: enriched.teacher,
        roomNumber: enriched.roomNumber,
        timeSlotId: entry.timeSlotId,
        isDoublePeriod: entry.isDoublePeriod,
        isDoubleContinuation: options?.isDoubleContinuation ?? false,
      };
    };

    type CombinedSlotEntry = ReturnType<typeof toCombinedEntry>;

    const createEmptyCombinedEntry = (slot: GradeStreamSlot): CombinedSlotEntry => ({
      id: `empty-${slot.gradeId}-${slot.streamId ?? "all"}`,
      isEmpty: true as const,
      gradeId: slot.gradeId,
      streamId: slot.streamId,
      gradeLevel: slot.gradeLevel,
      gradeLabel: slot.gradeLabel,
      gradeFullLabel: slot.gradeFullLabel,
      streamLabel: slot.streamLabel,
      gradeShortLabel: slot.gradeShortLabel,
      shortLabel: slot.gradeShortLabel,
      subject: { id: "", name: "" },
      subjectCode: undefined,
      teacher: { id: "", name: "" },
      roomNumber: undefined,
      timeSlotId: undefined,
      isDoublePeriod: false,
      isDoubleContinuation: false,
    });

    const gradeStreamCatalog = buildGradeStreamCatalog(store.grades);

    const getCombinedEntriesFor = (dayOfWeek: number, period: number) => {
      if (gradeStreamCatalog.length === 0) return [];

      const lessonsBySlot = new Map<string, CombinedSlotEntry>();

      for (const entry of store.entries) {
        if (entry.dayOfWeek !== dayOfWeek) continue;
        if (resolvePeriod(entry) !== period) continue;
        lessonsBySlot.set(
          entryGradeStreamKey(entry, store.grades),
          toCombinedEntry(entry),
        );
      }

      const periodIndex = periodNumbers.indexOf(period);
      const prevPeriod =
        periodIndex > 0 ? periodNumbers[periodIndex - 1] : null;

      if (
        prevPeriod != null &&
        !breakBlocksDoubleSpan(dayOfWeek, prevPeriod)
      ) {
        for (const entry of store.entries) {
          if (entry.dayOfWeek !== dayOfWeek) continue;
          if (!entry.isDoublePeriod) continue;
          if (resolvePeriod(entry) !== prevPeriod) continue;

          const key = entryGradeStreamKey(entry, store.grades);
          if (!lessonsBySlot.has(key)) {
            lessonsBySlot.set(
              key,
              toCombinedEntry(entry, { isDoubleContinuation: true }),
            );
          }
        }
      }

      return gradeStreamCatalog.map((slot) => {
        const key = gradeStreamKey(slot.gradeId, slot.streamId);
        return lessonsBySlot.get(key) ?? createEmptyCombinedEntry(slot);
      });
    };

    return { getCombinedEntriesFor };
  }, [
    store.entries,
    store.grades,
    store.timeSlots,
    store.breaks,
    selectors,
  ]);
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

    const gradeEntries = store.entries.filter((entry) =>
      entryMatchesGradeScope(
        entry,
        gradeId,
        store.selectedStreamId,
        store.grades,
      ),
    );

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
    const periodsPerDay = getPeriodsPerDay({
      periodNumbers: store.periodNumbers,
      timeSlots: store.timeSlots,
      lessonPeriodsPerDay: store.lessonPeriodsPerDay,
    });
    const totalSlots = slotsPerClassWeek(periodsPerDay, daysPerWeek);
    const filledSlots = countFilledSlotsForGrade(
      gradeEntries,
      gradeId,
      store.selectedStreamId,
      store.grades,
      store.timeSlots,
    );
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
    store.periodNumbers,
    store.lessonPeriodsPerDay,
    store.daysPerWeek,
    store.selectedStreamId,
    store.grades,
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
