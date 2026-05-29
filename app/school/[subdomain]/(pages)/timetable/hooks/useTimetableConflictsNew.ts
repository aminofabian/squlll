// app/school/[subdomain]/(pages)/timetable/hooks/useTimetableConflictsNew.ts
// Conflict detection from live timetable entries (day + period, cross-grade).

import { useMemo } from "react";
import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";
import { computeTimetableConflicts } from "../utils/computeTimetableConflicts";

function useComputedConflicts() {
  const entries = useTimetableStore((s) => s.entries);
  const timeSlots = useTimetableStore((s) => s.timeSlots);
  const teachers = useTimetableStore((s) => s.teachers);
  const grades = useTimetableStore((s) => s.grades);
  const subjects = useTimetableStore((s) => s.subjects);

  return useMemo(
    () =>
      computeTimetableConflicts(
        entries,
        timeSlots,
        teachers,
        grades,
        subjects,
      ),
    [entries, timeSlots, teachers, grades, subjects],
  );
}

/** Teacher clashes: same teacher booked twice at the same day + period. */
export function useTeacherConflicts() {
  const conflicts = useComputedConflicts();
  return useMemo(
    () => conflicts.filter((c) => c.type === "teacher_conflict"),
    [conflicts],
  );
}

export function useTeacherConflictCount(teacherId: string) {
  const conflicts = useTeacherConflicts();
  return useMemo(
    () => conflicts.filter((c) => c.teacher?.id === teacherId).length,
    [conflicts, teacherId],
  );
}

/** Room clashes: same room booked twice at the same day + period. */
export function useRoomConflicts() {
  const conflicts = useComputedConflicts();
  return useMemo(
    () => conflicts.filter((c) => c.type === "room_conflict"),
    [conflicts],
  );
}

export function useAllConflicts() {
  const conflicts = useComputedConflicts();
  return useMemo(() => {
    const teacher = conflicts.filter((c) => c.type === "teacher_conflict");
    const room = conflicts.filter((c) => c.type === "room_conflict");
    return {
      teacher,
      room,
      total: conflicts.length,
      hasConflicts: conflicts.length > 0,
    };
  }, [conflicts]);
}

export function useSlotConflicts(
  gradeId: string,
  timeSlotId: string,
  dayOfWeek: number,
) {
  const entries = useTimetableStore((s) => s.entries);
  const timeSlots = useTimetableStore((s) => s.timeSlots);
  const conflicts = useComputedConflicts();

  return useMemo(() => {
    const entry = entries.find(
      (e) =>
        e.gradeId === gradeId &&
        e.timeSlotId === timeSlotId &&
        e.dayOfWeek === dayOfWeek,
    );
    if (!entry) return null;

    const conflict = conflicts.find((c) =>
      c.entries.some((e) => e.id === entry.id),
    );
    return conflict || null;
  }, [gradeId, timeSlotId, dayOfWeek, conflicts, entries, timeSlots]);
}
