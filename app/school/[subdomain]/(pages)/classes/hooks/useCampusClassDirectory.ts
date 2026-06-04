"use client";

import { useQuery } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";
import type { ClassTeacherAssignment } from "@/lib/hooks/useClassTeacherAssignment";
import { resolveTeacherDisplayName } from "@/lib/utils/teacher-display";

const GET_CAMPUS_CLASS_TEACHERS = gql`
  query GetCampusClassTeachers {
    getTeachers {
      id
      fullName
      firstName
      lastName
      email
      user {
        name
      }
      classTeacherAssignments {
        id
        active
        stream {
          stream {
            id
          }
        }
        gradeLevel {
          gradeLevel {
            id
          }
        }
      }
    }
  }
`;

interface TeacherRow {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  user?: { name?: string };
  classTeacherAssignments: ClassTeacherAssignment[];
}

function teacherKey(gradeLevelId: string, streamId?: string | null) {
  return streamId ? `stream:${streamId}` : `grade:${gradeLevelId}`;
}

function buildTeacherMap(teachers: TeacherRow[]) {
  const map = new Map<string, string>();

  for (const teacher of teachers) {
    const name = resolveTeacherDisplayName(teacher);
    if (!name) continue;

    for (const assignment of teacher.classTeacherAssignments ?? []) {
      if (!assignment.active) continue;
      const streamId = assignment.stream?.stream?.id;
      const gradeId = assignment.gradeLevel?.gradeLevel?.id;
      if (streamId) {
        map.set(teacherKey(gradeId ?? "", streamId), name);
      } else if (gradeId) {
        map.set(teacherKey(gradeId), name);
      }
    }
  }

  return map;
}

export function useCampusClassDirectory() {
  const query = useQuery({
    queryKey: ["campusClassTeachers"],
    queryFn: async () => {
      const data = await graphqlClient.request<{
        getTeachers: TeacherRow[];
      }>(GET_CAMPUS_CLASS_TEACHERS);
      return buildTeacherMap(data.getTeachers ?? []);
    },
    staleTime: 60_000,
  });

  const getClassTeacher = (gradeLevelId: string, streamId?: string | null) => {
    return query.data?.get(teacherKey(gradeLevelId, streamId)) ?? null;
  };

  return {
    teacherMap: query.data ?? new Map<string, string>(),
    getClassTeacher,
    isLoading: query.isLoading,
  };
}
