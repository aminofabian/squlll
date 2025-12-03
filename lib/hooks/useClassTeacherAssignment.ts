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

interface GetClassTeacherForGradeResponse {
  getAllTeachers: Array<{
    id: string;
    fullName: string;
    email: string;
    classTeacherAssignments: ClassTeacherAssignment[];
  }>;
}

const GET_CLASS_TEACHER_QUERY = gql`
  query GetAllTeachers {
    getAllTeachers {
      id
      fullName
      email
      classTeacherAssignments {
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
      }
    }
  }
`;

export function useClassTeacherAssignment(gradeLevelId?: string | null, streamId?: string | null) {
  return useQuery<ClassTeacherAssignment | null>({
    queryKey: ['classTeacherAssignment', gradeLevelId, streamId],
    queryFn: async () => {
      if (!gradeLevelId && !streamId) {
        return null;
      }

      const data = await graphqlClient.request<GetClassTeacherForGradeResponse>(
        GET_CLASS_TEACHER_QUERY
      );

      // Find the active class teacher assignment for the specified grade or stream
      for (const teacher of data.getAllTeachers) {
        const activeAssignment = teacher.classTeacherAssignments.find(
          (assignment) => {
            if (!assignment.active) return false;
            
            if (streamId) {
              return assignment.stream?.stream?.id === streamId;
            }
            
            if (gradeLevelId) {
              return assignment.gradeLevel?.gradeLevel?.id === gradeLevelId;
            }
            
            return false;
          }
        );

        if (activeAssignment) {
          return {
            ...activeAssignment,
            teacher: {
              id: teacher.id,
              fullName: teacher.fullName,
              email: teacher.email,
            },
          };
        }
      }

      return null;
    },
    enabled: !!(gradeLevelId || streamId),
    staleTime: 30000,
    retry: 2,
  });
}

