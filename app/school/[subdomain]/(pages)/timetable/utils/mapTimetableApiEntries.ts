import type { Grade, TimetableEntry, TimeSlot } from "@/lib/types/timetable";
import {
  entryMatchesGradeScope,
  resolveCanonicalGradeId,
} from "./resolveGradeForSchoolConfig";

type ApiTimetableEntryRow = {
  id: string;
  subjectId: string;
  teacherId: string;
  streamId?: string | null;
  dayTemplatePeriodId: string;
  isDoublePeriod?: boolean;
  gradeLevel?: {
    id: string;
    name?: string | null;
    gradeLevel?: { name?: string | null };
  };
  period?: {
    id?: string;
    periodNumber?: number;
  };
  room?: { name?: string | null } | null;
};

export function mapApiTimetableEntries(
  rows: ApiTimetableEntryRow[],
  grades: Grade[],
  timeSlots: TimeSlot[],
  masterGradeId?: string,
  streamId?: string | null,
): TimetableEntry[] {
  const mapped: TimetableEntry[] = [];

  for (const row of rows) {
    const periodId = row.dayTemplatePeriodId || row.period?.id;
    if (!periodId) continue;

    const slot = timeSlots.find((ts) => ts.id === periodId);
    const entryGradeLevelId = row.gradeLevel?.id;
    if (!entryGradeLevelId) continue;

    const canonicalGradeId = resolveCanonicalGradeId(entryGradeLevelId, grades);
    const entryStreamId = row.streamId ?? null;

    const entry: TimetableEntry = {
      id: row.id,
      subjectId: row.subjectId,
      teacherId: row.teacherId,
      timeSlotId: periodId,
      periodNumber: row.period?.periodNumber ?? slot?.periodNumber,
      gradeId: canonicalGradeId,
      streamId: entryStreamId,
      gradeName:
        row.gradeLevel?.gradeLevel?.name ||
        row.gradeLevel?.name ||
        undefined,
      dayOfWeek: slot?.dayOfWeek ?? 1,
      roomNumber: row.room?.name || undefined,
      isDoublePeriod: row.isDoublePeriod ?? false,
    };

    if (
      masterGradeId &&
      !entryMatchesGradeScope(entry, masterGradeId, streamId, grades)
    ) {
      continue;
    }

    mapped.push(entry);
  }

  return mapped;
}

export const GET_TIMETABLE_ENTRIES_QUERY = `
  query GetTimetableEntries($input: GetTimetableEntriesInput!) {
    getTimetableEntries(input: $input) {
      id
      subjectId
      teacherId
      streamId
      dayTemplatePeriodId
      isDoublePeriod
      gradeLevel {
        id
        name
        gradeLevel {
          name
        }
      }
      period {
        id
        periodNumber
      }
      room {
        name
      }
    }
  }
`;
