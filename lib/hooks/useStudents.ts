import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStudentsStore } from '../stores/useStudentsStore';
import { StudentsResponse } from '../../types/student';
import { graphqlClient } from '../graphql-client';
import { gql } from 'graphql-request';

const GET_STUDENTS = gql`
  query GetStudents {
    allStudents {
      id
      admission_number
      user_id
      feesOwed
      gender
      totalFeesPaid
      createdAt
      isActive
      updatedAt
      stream {
        id
        name
      }
      phone
      grade {
        id
        gradeLevel {
          id
          name
        }
      }
      user {
        id
        email
        name
      }
    }
  }
`;

interface GetStudentsResponse {
  allStudents: any[];
}

const fetchStudents = async (): Promise<StudentsResponse> => {
  const response = await graphqlClient.request<GetStudentsResponse>(GET_STUDENTS);
  return { students: response.allStudents };
};

export const useStudents = () => {
  const { setStudents, setLoading, setError } = useStudentsStore();

  const query = useQuery({
    queryKey: ['students'],
    queryFn: fetchStudents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Update store when query state changes
  React.useEffect(() => {
    if (query.isSuccess && query.data) {
      setStudents(query.data.students);
      setError(null);
    }
  }, [query.isSuccess, query.data, setStudents, setError]);

  React.useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage = query.error instanceof Error ? query.error.message : 'An error occurred';
      setError(errorMessage);
    }
  }, [query.isError, query.error, setError]);

  React.useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  return query;
};

// Hook to get students from the store
export const useStudentsFromStore = () => {
  const { students, isLoading, error } = useStudentsStore();
  return { students, isLoading, error };
};

// Hook to get a specific student by ID
export const useStudentById = (studentId: string) => {
  const { getStudentById } = useStudentsStore();
  return getStudentById(studentId);
};

// Hook to get students by tenant ID
export const useStudentsByTenantId = (tenantId: string) => {
  const { getStudentsByTenantId } = useStudentsStore();
  return getStudentsByTenantId(tenantId);
}; 