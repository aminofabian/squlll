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
  gradeLevelId?: string | null;
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
    dayTemplateId?: string;
    dayTemplate?: { dayOfWeek?: number } | null;
  };
  room?: { name?: string | null } | null;
};

export function mapApiTimetableEntries(
  rows: ApiTimetableEntryRow[],
  grades: Grade[],
  timeSlots: TimeSlot[],
  masterGradeId?: string,
  streamId?: string | null,
  periodDayMap?: Map<string, number>,
): TimetableEntry[] {
  const mapped: TimetableEntry[] = [];

  for (const row of rows) {
    const periodId = row.dayTemplatePeriodId || row.period?.id;
    if (!periodId) continue;

    const entryGradeLevelId = row.gradeLevel?.id ?? row.gradeLevelId;
    if (!entryGradeLevelId) continue;

    const dayOfWeekFromMap = periodDayMap?.get(periodId);
    const periodNumber = row.period?.periodNumber;
    // The entry's own day template is authoritative. This matters for schools
    // with one week template per class: an entry can reference a period id
    // that is not in the currently loaded class/week slot map.
    const dayFromEntry = row.period?.dayTemplate?.dayOfWeek;
    const knownDay = dayFromEntry ?? dayOfWeekFromMap;

    // Shared-bell: entry may reference another grade's period id. Remap onto
    // the slots currently shown for this class via day + period number. Never
    // pick a same-numbered slot from an arbitrary day — that is what sent
    // every unmatched lesson to Monday.
    const exactSlot = timeSlots.find((ts) => ts.id === periodId);
    const slot =
      exactSlot ??
      (periodNumber != null && knownDay != null
        ? timeSlots.find(
            (ts) =>
              ts.periodNumber === periodNumber && ts.dayOfWeek === knownDay,
          )
        : undefined) ??
      (periodNumber != null && knownDay != null
        ? timeSlots.find(
            (ts) =>
              ts.periodNumber === periodNumber &&
              ts.dayTemplateId === row.period?.dayTemplateId,
          )
        : undefined);

    const canonicalGradeId = resolveCanonicalGradeId(entryGradeLevelId, grades);
    const entryStreamId = row.streamId ?? null;
    const dayOfWeek = knownDay ?? exactSlot?.dayOfWeek;

    if (dayOfWeek == null) {
      console.warn(
        "Skipping timetable entry with no known day",
        row.id,
        row.period?.dayTemplateId,
      );
      continue;
    }

    const entry: TimetableEntry = {
      id: row.id,
      subjectId: row.subjectId,
      teacherId: row.teacherId,
      timeSlotId: slot?.id ?? periodId,
      periodNumber: periodNumber ?? slot?.periodNumber,
      gradeId: canonicalGradeId,
      streamId: entryStreamId,
      gradeName:
        row.gradeLevel?.gradeLevel?.name ||
        row.gradeLevel?.name ||
        undefined,
      dayOfWeek,
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
      gradeLevelId
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
        dayTemplateId
        dayTemplate {
          dayOfWeek
        }
      }
      room {
        name
      }
    }
  }
`;
