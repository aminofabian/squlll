import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../graphql-client';
import { gql } from 'graphql-request';

export interface ClassTeacherAssignment {
  id: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
  teacher: {
    id: string;
    fullName: string;
    email: string;
  };
  stream?: {
    id: string;
    stream: {
      id: string;
      name: string;
    };
  };
  gradeLevel?: {
    id: string;
    gradeLevel: {
      id: string;
      name: string;
    };
  };
}

const CLASS_TEACHER_FIELDS = `
  id
  active
  startDate
  endDate
  teacher {
    id
    fullName
    email
  }
  stream {
    id
    stream {
      id
      name
    }
  }
  gradeLevel {
    id
    gradeLevel {
      id
      name
    }
  }
`;

const GET_STREAM_CLASS_TEACHER = gql`
  query GetStreamClassTeacher($streamId: String!) {
    getStreamClassTeacher(streamId: $streamId) {
      ${CLASS_TEACHER_FIELDS}
    }
  }
`;

const GET_GRADE_LEVEL_CLASS_TEACHER = gql`
  query GetGradeLevelClassTeacher($gradeLevelId: String!) {
    getGradeLevelClassTeacher(gradeLevelId: $gradeLevelId) {
      ${CLASS_TEACHER_FIELDS}
    }
  }
`;

export function classTeacherQueryKey(
  gradeLevelId?: string | null,
  streamId?: string | null,
) {
  return ['classTeacherAssignment', gradeLevelId ?? null, streamId ?? null] as const;
}

function normalizeAssignment(
  raw: ClassTeacherAssignment | null | undefined,
): ClassTeacherAssignment | null {
  if (!raw?.id || !raw.teacher?.id) {
    return null;
  }

  return {
    ...raw,
    teacher: {
      id: raw.teacher.id,
      fullName: raw.teacher.fullName || 'Teacher',
      email: raw.teacher.email || '',
    },
  };
}

export function useClassTeacherAssignment(
  gradeLevelId?: string | null,
  streamId?: string | null,
) {
  return useQuery<ClassTeacherAssignment | null>({
    queryKey: classTeacherQueryKey(gradeLevelId, streamId),
    queryFn: async () => {
      if (streamId) {
        const data = await graphqlClient.request<{
          getStreamClassTeacher: ClassTeacherAssignment | null;
        }>(GET_STREAM_CLASS_TEACHER, { streamId });
        return normalizeAssignment(data.getStreamClassTeacher);
      }

      if (gradeLevelId) {
        const data = await graphqlClient.request<{
          getGradeLevelClassTeacher: ClassTeacherAssignment | null;
        }>(GET_GRADE_LEVEL_CLASS_TEACHER, { gradeLevelId });
        return normalizeAssignment(data.getGradeLevelClassTeacher);
      }

      return null;
    },
    enabled: !!(gradeLevelId || streamId),
    staleTime: 0,
    retry: 2,
  });
}
