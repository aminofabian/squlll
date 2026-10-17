const UPDATED_ENTRY_FIELDS = `
  id
  subjectId
  teacherId
  dayTemplatePeriodId
  streamId
  gradeLevelId
  isDoublePeriod
  source
  isLocked
`;

async function graphql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });
  const result = await response.json();
  if (!response.ok || result.errors?.length) {
    throw new Error(
      result.errors?.map((error: { message: string }) => error.message).join(", ") ||
        `Timetable update failed (${response.status})`,
    );
  }
  return result.data as T;
}

export async function moveTimetableEntry(
  entryId: string,
  dayTemplatePeriodId: string,
): Promise<void> {
  await graphql(
    `mutation MoveTimetableEntry($input: UpdateTimetableEntryInput!) {
      updateTimetableEntry(input: $input) {
        ${UPDATED_ENTRY_FIELDS}
      }
    }`,
    { input: { id: entryId, dayTemplatePeriodId } },
  );
}

export async function swapTimetableEntries(
  entryAId: string,
  entryBId: string,
): Promise<void> {
  await graphql(
    `mutation SwapTimetableEntries($entryAId: ID!, $entryBId: ID!) {
      swapTimetableEntries(entryAId: $entryAId, entryBId: $entryBId) {
        ${UPDATED_ENTRY_FIELDS}
      }
    }`,
    { entryAId, entryBId },
  );
}

export interface FixClashesResult {
  fixedCount: number;
  unresolvedCount: number;
  moves: Array<{
    entryId: string;
    subjectName: string;
    teacherName: string;
    dayOfWeek: number;
    fromPeriod: number;
    toPeriod: number;
  }>;
  warnings: string[];
}

export async function fixTimetableClashes(input: {
  termId: string;
  gradeLevelId?: string;
  streamId?: string;
}): Promise<FixClashesResult> {
  const data = await graphql<{ fixTimetableClashes: FixClashesResult }>(
    `mutation FixTimetableClashes($input: FixTimetableClashesInput!) {
      fixTimetableClashes(input: $input) {
        fixedCount
        unresolvedCount
        warnings
        moves {
          entryId
          subjectName
          teacherName
          dayOfWeek
          fromPeriod
          toPeriod
        }
      }
    }`,
    { input },
  );
  return data.fixTimetableClashes;
}
