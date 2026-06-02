"use client";

import { useCallback, useEffect, useState } from "react";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";

export interface TeacherTimetableEntry {
  id: string;
  subjectName: string;
  subjectColor: string;
  gradeLevelName: string;
  streamName?: string | null;
  roomName?: string | null;
  dayOfWeek: number;
  dayName: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  isDoublePeriod: boolean;
}

export interface TeacherTimetableDay {
  dayOfWeek: number;
  dayName: string;
  entries: TeacherTimetableEntry[];
}

export interface AdminTeacherTimetable {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  termId: string;
  termName: string;
  totalClasses: number;
  timetablePublishedAt: string | null;
  generatedAt: string;
  schedule: TeacherTimetableDay[];
}

const GET_TEACHER_TIMETABLE = `
  query GetTeacherTimetable($input: GetTeacherTimetableInput!) {
    getTeacherTimetable(input: $input) {
      teacherId
      teacherName
      teacherEmail
      termId
      termName
      totalClasses
      timetablePublishedAt
      generatedAt
      schedule {
        dayOfWeek
        dayName
        entries {
          id
          subjectName
          subjectColor
          gradeLevelName
          streamName
          roomName
          dayOfWeek
          dayName
          periodNumber
          startTime
          endTime
          isDoublePeriod
        }
      }
    }
  }
`;

export function useAdminTeacherTimetable(teacherId: string | null) {
  const { selectedTerm, termsLoading } = useSelectedTerm();
  const [data, setData] = useState<AdminTeacherTimetable | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimetable = useCallback(async () => {
    if (!teacherId || !selectedTerm?.id) {
      setData(null);
      setError(selectedTerm?.id ? null : "No term selected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        credentials: "include",
        body: JSON.stringify({
          query: GET_TEACHER_TIMETABLE,
          variables: {
            input: {
              teacherId,
              termId: selectedTerm.id,
            },
          },
        }),
      });

      const result = await response.json();

      if (result.errors?.length) {
        throw new Error(result.errors[0]?.message || "Failed to load timetable");
      }

      setData(result.data?.getTeacherTimetable ?? null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load timetable",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [teacherId, selectedTerm?.id]);

  useEffect(() => {
    if (termsLoading) return;
    void fetchTimetable();
  }, [fetchTimetable, termsLoading]);

  return {
    data,
    loading: loading || termsLoading,
    error: termsLoading ? null : error,
    termName: selectedTerm?.name,
    refetch: fetchTimetable,
  };
}
