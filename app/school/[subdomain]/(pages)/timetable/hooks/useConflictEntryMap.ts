import { useMemo } from "react";
import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";
import { computeTimetableConflicts } from "../utils/computeTimetableConflicts";
import type { Conflict, Grade, Subject, TimetableEntry } from "@/lib/types/timetable";

function formatClassLessonLabel(
  entryId: string,
  entries: TimetableEntry[],
  grades: Grade[],
  subjects: Subject[],
): string {
  const entry = entries.find((e) => e.id === entryId);
  if (!entry) return "another class";

  const grade =
    grades.find((g) => g.id === entry.gradeId) ??
    grades.find((g) => g.tenantGradeLevelId === entry.gradeId);
  const gradeLabel =
    grade?.displayName?.trim() ||
    grade?.name ||
    entry.gradeName ||
    "Class";
  const streamLabel =
    entry.streamId && grade?.streams?.length
      ? grade.streams.find((s) => s.tenantStreamId === entry.streamId)?.name
      : null;
  const subject =
    subjects.find((s) => s.id === entry.subjectId)?.name ?? "Unknown";

  const parts = [gradeLabel];
  if (streamLabel) parts.push(streamLabel);
  parts.push(subject);
  return parts.join(" · ");
}

/**
 * Build a map from entry ID → human-readable conflict description.
 *
 * Example: "Sarah also has G7 · A · Math in this period"
 *          "Room 201 also used by G8 · B · Science in this period"
 */
function buildConflictTooltipMap(
  conflicts: Conflict[],
  entries: TimetableEntry[],
  grades: Grade[],
  subjects: Subject[],
): Map<string, string> {
  const map = new Map<string, string>();

  for (const conflict of conflicts) {
    if (conflict.type === "teacher_conflict" && conflict.teacher) {
      const teacherName = conflict.teacher.name?.trim() || "Unknown teacher";
      for (const entry of conflict.entries) {
        const otherLabels = conflict.entries
          .filter((e) => e.id !== entry.id)
          .map((other) =>
            formatClassLessonLabel(other.id, entries, grades, subjects),
          );
        if (otherLabels.length === 0) continue;

        const msg = `${teacherName} also has ${otherLabels.join("; ")} in this period`;
        map.set(entry.id, msg);
      }
      continue;
    }

    if (conflict.type === "room_conflict" && conflict.room) {
      const roomName = conflict.room.trim() || "Room";
      for (const entry of conflict.entries) {
        if (map.has(entry.id)) continue;

        const otherLabels = conflict.entries
          .filter((e) => e.id !== entry.id)
          .map((other) =>
            formatClassLessonLabel(other.id, entries, grades, subjects),
          );
        if (otherLabels.length === 0) continue;

        map.set(
          entry.id,
          `Room ${roomName} also used by ${otherLabels.join("; ")} in this period`,
        );
      }
    }
  }

  return map;
}

/**
 * Returns a map of entry ID → conflict description for tooltip display.
 * Used in the combined view to show cross-class clashes on hover.
 */
export function useConflictEntryMap(): Map<string, string> {
  const entries = useTimetableStore((s) => s.entries);
  const timeSlots = useTimetableStore((s) => s.timeSlots);
  const teachers = useTimetableStore((s) => s.teachers);
  const grades = useTimetableStore((s) => s.grades);
  const subjects = useTimetableStore((s) => s.subjects);

  return useMemo(() => {
    const conflicts = computeTimetableConflicts(
      entries,
      timeSlots,
      teachers,
      grades,
      subjects,
    );
    return buildConflictTooltipMap(conflicts, entries, grades, subjects);
  }, [entries, timeSlots, teachers, grades, subjects]);
}
