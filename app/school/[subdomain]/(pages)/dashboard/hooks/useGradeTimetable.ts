"use client";

import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { graphqlClient } from "@/lib/graphql-client";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { useCurrentAcademicYear } from "@/lib/hooks/useAcademicYears";

export interface GradeTimetableEntry {
  id: string;
  periodNumber: number;
  roomName?: string | null;
  subjectName: string;
  teacherName: string;
}

export interface GradeTimetablePeriod {
  id: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

export interface GradeTimetableBreak {
  id: string;
  name: string;
  type: string;
  afterPeriod: number;
  durationMinutes: number;
}

export interface GradeTimetableDay {
  dayOfWeek: number;
  startTime?: string;
  periods: GradeTimetablePeriod[];
  breaks: GradeTimetableBreak[];
  entries: GradeTimetableEntry[];
}

export interface GradeTimetable {
  gradeLevelId: string;
  gradeLevelName: string;
  streamId?: string | null;
  streamName?: string | null;
  days: GradeTimetableDay[];
}

const QUERY = gql`
  query DashboardGradeTimetable($input: GetMinimalTimetableInput!) {
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

interface Response {
  getMinimalTimetable?: {
    termId: string;
    termName: string;
    timetables: GradeTimetable[];
  } | null;
}

export function useGradeTimetable(
  gradeId: string | null | undefined,
  streamId?: string | null,
) {
  const { selectedTerm } = useSelectedTerm();
  const { academicYears } = useCurrentAcademicYear();
  const activeYear =
    academicYears.find((year) => year.isActive) ?? academicYears[0];
  const fallbackTerm =
    activeYear?.terms?.find((term) => term.isCurrent) ??
    activeYear?.terms?.find((term) => term.isActive) ??
    activeYear?.terms?.[0];
  const termId = selectedTerm?.id ?? fallbackTerm?.id ?? null;

  const [data, setData] = useState<Response["getMinimalTimetable"] | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!termId || !gradeId) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setData(null);
    setLoading(true);
    setError(null);
    graphqlClient
      .request<Response>(QUERY, {
        input: {
          termId,
          gradeLevelId: gradeId,
          ...(streamId ? { streamId } : {}),
        },
      })
      .then((response) => {
        if (cancelled) return;
        setData(response.getMinimalTimetable ?? null);
      })
      .catch((reason) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason : new Error(String(reason)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [termId, gradeId, streamId]);

  return {
    termId,
    termName: data?.termName ?? selectedTerm?.name ?? null,
    timetables: data?.timetables ?? [],
    loading,
    error,
    refetch: () => undefined,
  };
}
