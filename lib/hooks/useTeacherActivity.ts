"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { graphqlClient } from "@/lib/graphql-client";

export type NoteVisibility = "PRIVATE" | "GRADE" | "SCHOOL";
export type AssessType = "CA" | "EXAM";
export type AssesStatus = "COMPLETED" | "PENDING" | "UPCOMING";

export interface TeacherActivityNote {
  id: string;
  title: string;
  content: string;
  visibility: NoteVisibility;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
  subject?: { id: string; name: string } | null;
  gradeLevel?: {
    id: string;
    gradeLevel?: { name: string } | null;
  } | null;
}

export interface TeacherActivityAssessment {
  id: string;
  title: string;
  type: AssessType;
  status: AssesStatus;
  term: number;
  academicYear?: string | null;
  maxScore?: number | null;
  cutoff?: number | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  tenantSubject?: {
    id: string;
    subject?: { name: string } | null;
  } | null;
  tenantGradeLevel?: {
    id: string;
    gradeLevel?: { name: string } | null;
  } | null;
}

const GET_TEACHER_NOTES = gql`
  query GetTeacherNotesByUserId($teacherUserId: String!) {
    getTeacherNotesByUserId(teacherUserId: $teacherUserId) {
      id
      title
      content
      visibility
      is_ai_generated
      created_at
      updated_at
      subject {
        id
        name
      }
      gradeLevel {
        id
        gradeLevel {
          name
        }
      }
    }
  }
`;

const GET_ASSESSMENTS = gql`
  query GetAssessmentsForTeacherActivity {
    assessments {
      id
      title
      type
      status
      term
      academicYear
      maxScore
      cutoff
      description
      createdAt
      updatedAt
      tenantSubject {
        id
        subject {
          name
        }
      }
      tenantGradeLevel {
        id
        gradeLevel {
          name
        }
      }
    }
  }
`;

interface UseTeacherActivityOptions {
  teacherUserId?: string | null;
  tenantSubjectIds: string[];
  tenantGradeLevelIds: string[];
  enabled?: boolean;
}

export function useTeacherActivity({
  teacherUserId,
  tenantSubjectIds,
  tenantGradeLevelIds,
  enabled = true,
}: UseTeacherActivityOptions) {
  const subjectIdSet = useMemo(
    () => new Set(tenantSubjectIds),
    [tenantSubjectIds],
  );
  const gradeLevelIdSet = useMemo(
    () => new Set(tenantGradeLevelIds),
    [tenantGradeLevelIds],
  );

  const notesQuery = useQuery({
    queryKey: ["teacherActivityNotes", teacherUserId],
    queryFn: async () => {
      const data = await graphqlClient.request<{
        getTeacherNotesByUserId: TeacherActivityNote[];
      }>(GET_TEACHER_NOTES, { teacherUserId });
      return data.getTeacherNotesByUserId ?? [];
    },
    enabled: enabled && Boolean(teacherUserId),
    staleTime: 30_000,
  });

  const assessmentsQuery = useQuery({
    queryKey: [
      "teacherActivityAssessments",
      tenantSubjectIds,
      tenantGradeLevelIds,
    ],
    queryFn: async () => {
      const data = await graphqlClient.request<{
        assessments: TeacherActivityAssessment[];
      }>(GET_ASSESSMENTS);
      return data.assessments ?? [];
    },
    enabled:
      enabled &&
      tenantSubjectIds.length > 0 &&
      tenantGradeLevelIds.length > 0,
    staleTime: 30_000,
  });

  const assessments = useMemo(() => {
    const all = assessmentsQuery.data ?? [];
    return all.filter((assessment) => {
      const subjectId = assessment.tenantSubject?.id;
      const gradeLevelId = assessment.tenantGradeLevel?.id;
      if (!subjectId || !gradeLevelId) return false;
      return (
        subjectIdSet.has(subjectId) && gradeLevelIdSet.has(gradeLevelId)
      );
    });
  }, [assessmentsQuery.data, subjectIdSet, gradeLevelIdSet]);

  const loading = notesQuery.isLoading || assessmentsQuery.isLoading;
  const error =
    (notesQuery.error as Error | null)?.message ??
    (assessmentsQuery.error as Error | null)?.message ??
    null;

  return {
    notes: notesQuery.data ?? [],
    assessments,
    loading,
    error,
    refetch: () => {
      void notesQuery.refetch();
      void assessmentsQuery.refetch();
    },
    hasTeachingScope:
      tenantSubjectIds.length > 0 && tenantGradeLevelIds.length > 0,
  };
}
