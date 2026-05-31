import { useState, useEffect, useCallback } from 'react';
import { useDomainRealtime } from '@/lib/realtime/useDomainRealtime';
import {
  minimalGradeTimetableToGraphQL,
  pickGradeTimetable,
  schoolBlocksToMinimalTimetables,
  hasTimetableTemplate,
  type MinimalGradeTimetable,
  type SchoolTimetableByGrade,
  type StudentTimetableGraphQL,
} from '@/lib/timetable/minimalTimetableAdapter';

export type { StudentTimetableGraphQL as CompleteTimetable };

const MINIMAL_TIMETABLE_QUERY = `
  query GetMinimalTimetable($input: GetMinimalTimetableInput!) {
    getMinimalTimetable(input: $input) {
      termId
      termName
      timetables {
        gradeLevelId
        gradeLevelName
        streamId
        streamName
        days {
          dayOfWeek
          startTime
          periods {
            id
            periodNumber
            startTime
            endTime
          }
          breaks {
            id
            name
            type
            afterPeriod
            durationMinutes
            icon
          }
          entries {
            id
            periodNumber
            roomName
            subjectName
            teacherName
          }
        }
      }
    }
  }
`;

const SCHOOL_TIMETABLE_QUERY = `
  query GetSchoolTimetable($input: GetSchoolTimetableInput!) {
    getSchoolTimetable(input: $input) {
      timetableByGrade {
        gradeLevel {
          id
          name
          shortName
        }
        stream {
          id
          name
        }
        days {
          dayTemplate {
            dayOfWeek
          }
          slots {
            type
            id
            periodNumber
            startTime
            endTime
            name
            breakType
            afterPeriod
            durationMinutes
            icon
            entry {
              id
              subject {
                name
              }
              teacher {
                name
              }
              room {
                name
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchMinimalTimetable(
  termId: string,
  gradeId: string,
  tenantStreamId?: string | null,
): Promise<MinimalGradeTimetable[]> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      query: MINIMAL_TIMETABLE_QUERY,
      variables: {
        input: {
          termId,
          gradeLevelId: gradeId,
          ...(tenantStreamId ? { streamId: tenantStreamId } : {}),
        },
      },
    }),
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(data.errors[0]?.message || 'GraphQL error');
  }

  return data.data?.getMinimalTimetable?.timetables ?? [];
}

async function fetchSchoolTimetableBlocks(
  termId: string,
  gradeId: string,
  tenantStreamId?: string | null,
): Promise<SchoolTimetableByGrade[]> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      query: SCHOOL_TIMETABLE_QUERY,
      variables: {
        input: {
          termId,
          gradeLevelId: gradeId,
          ...(tenantStreamId ? { streamId: tenantStreamId } : {}),
        },
      },
    }),
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(data.errors[0]?.message || 'GraphQL error');
  }

  return data.data?.getSchoolTimetable?.timetableByGrade ?? [];
}

async function resolveStudentGradeTimetable(
  termId: string,
  gradeId: string,
  tenantStreamId: string | null,
  streamName: string | null,
): Promise<MinimalGradeTimetable | null> {
  const streamOpts = { tenantStreamId, streamName };
  const withGradeFallback = { ...streamOpts, fallbackToGradeWide: true };

  const attempts: Array<() => Promise<MinimalGradeTimetable | null>> = [
    async () => {
      const timetables = await fetchMinimalTimetable(
        termId,
        gradeId,
        tenantStreamId,
      );
      return pickGradeTimetable(timetables, gradeId, streamOpts);
    },
    async () => {
      const timetables = await fetchMinimalTimetable(termId, gradeId);
      return pickGradeTimetable(timetables, gradeId, streamOpts);
    },
    async () => {
      const timetables = await fetchMinimalTimetable(termId, gradeId);
      return pickGradeTimetable(timetables, gradeId, withGradeFallback);
    },
    async () => {
      const blocks = await fetchSchoolTimetableBlocks(
        termId,
        gradeId,
        tenantStreamId,
      );
      const timetables = schoolBlocksToMinimalTimetables(blocks);
      return pickGradeTimetable(timetables, gradeId, streamOpts);
    },
    async () => {
      const blocks = await fetchSchoolTimetableBlocks(termId, gradeId);
      const timetables = schoolBlocksToMinimalTimetables(blocks);
      return pickGradeTimetable(timetables, gradeId, streamOpts);
    },
    async () => {
      const blocks = await fetchSchoolTimetableBlocks(termId, gradeId);
      const timetables = schoolBlocksToMinimalTimetables(blocks);
      return pickGradeTimetable(timetables, gradeId, withGradeFallback);
    },
  ];

  for (const attempt of attempts) {
    const picked = await attempt();
    if (hasTimetableTemplate(picked)) {
      return picked;
    }
  }

  return null;
}

interface UseStudentTimetableResult {
  timetable: StudentTimetableGraphQL | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetch the published timetable or school-day template for a student's grade/stream.
 */
export function useStudentTimetable(
  termId: string | null,
  gradeId: string | null,
  tenantStreamId?: string | null,
  streamName?: string | null,
): UseStudentTimetableResult {
  const [timetable, setTimetable] = useState<StudentTimetableGraphQL | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimetable = useCallback(async () => {
    if (!termId || !gradeId) {
      setTimetable(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const gradeTimetable = await resolveStudentGradeTimetable(
        termId,
        gradeId,
        tenantStreamId ?? null,
        streamName ?? null,
      );

      if (!hasTimetableTemplate(gradeTimetable)) {
        setTimetable(null);
        return;
      }

      setTimetable(minimalGradeTimetableToGraphQL(gradeTimetable!));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch timetable';
      setError(errorMessage);
      console.error('Error fetching student timetable:', err);
      setTimetable(null);
    } finally {
      setLoading(false);
    }
  }, [termId, gradeId, tenantStreamId, streamName]);

  useEffect(() => {
    void fetchTimetable();
  }, [fetchTimetable]);

  useDomainRealtime({
    onTimetablePublished: (payload) => {
      if (termId && payload.termId === termId) void fetchTimetable();
    },
    onTimetableUnpublished: (payload) => {
      if (termId && payload.termId === termId) void fetchTimetable();
    },
    onTimetableEntryChanged: (payload) => {
      if (!termId || payload.termId !== termId) return;
      if (gradeId && payload.gradeLevelId !== gradeId) return;
      void fetchTimetable();
    },
  });

  return {
    timetable,
    loading,
    error,
    refetch: fetchTimetable,
  };
}
