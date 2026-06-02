"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { graphqlClient } from "@/lib/graphql-client";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";

const GET_SCHOOL_TIMETABLE_COVERAGE = gql`
  query GetTeachersTimetableCoverage($input: GetSchoolTimetableInput!) {
    getSchoolTimetable(input: $input) {
      termId
      termName
      timetableByGrade {
        days {
          periods {
            isBreak
            entry {
              teacher {
                id
              }
            }
          }
        }
      }
    }
  }
`;

interface TimetableCoverageResponse {
  getSchoolTimetable: {
    termId: string;
    termName: string;
    timetableByGrade?: Array<{
      days?: Array<{
        periods?: Array<{
          isBreak: boolean;
          entry?: { teacher?: { id: string } | null } | null;
        }>;
      }>;
    }> | null;
  };
}

function buildLessonCounts(data: TimetableCoverageResponse | undefined) {
  const counts = new Map<string, number>();
  const grades = data?.getSchoolTimetable?.timetableByGrade ?? [];

  for (const grade of grades) {
    for (const day of grade.days ?? []) {
      for (const slot of day.periods ?? []) {
        if (slot.isBreak) continue;
        const teacherId = slot.entry?.teacher?.id;
        if (!teacherId) continue;
        counts.set(teacherId, (counts.get(teacherId) ?? 0) + 1);
      }
    }
  }

  return counts;
}

export function useTeachersTimetableCoverage() {
  const { selectedTerm } = useSelectedTerm();
  const termId = selectedTerm?.id;

  const query = useQuery({
    queryKey: ["teachersTimetableCoverage", termId],
    queryFn: async () => {
      const data = await graphqlClient.request<TimetableCoverageResponse>(
        GET_SCHOOL_TIMETABLE_COVERAGE,
        { input: { termId } },
      );
      return data;
    },
    enabled: Boolean(termId),
    staleTime: 60_000,
  });

  const lessonCounts = useMemo(
    () => buildLessonCounts(query.data),
    [query.data],
  );

  return {
    lessonCounts,
    termName: query.data?.getSchoolTimetable?.termName ?? selectedTerm?.name,
    loading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
