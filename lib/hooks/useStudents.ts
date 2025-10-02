import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStudentsStore } from '../stores/useStudentsStore';
import { StudentsResponse } from '../../types/student';
import { graphqlClient } from '../graphql-client';
import { gql } from 'graphql-request';

const GET_STUDENTS = gql`
  query GetAllStudentsSummary {
    allStudentsSummary {
      id
      admissionNumber
      studentName
      gradeLevelName
      feeSummary {
        totalOwed
        totalPaid
        balance
        numberOfFeeItems
      }
    }
  }
`;

interface FeeSummary {
  totalOwed: number;
  totalPaid: number;
  balance: number;
  numberOfFeeItems: number;
}

interface StudentSummaryData {
  id: string;
  admissionNumber: string;
  studentName: string;
  gradeLevelName: string;
  feeSummary: FeeSummary;
}

interface GetStudentsResponse {
  allStudentsSummary: StudentSummaryData[];
}

const fetchStudents = async (): Promise<StudentsResponse> => {
  const response = await graphqlClient.request<GetStudentsResponse>(GET_STUDENTS);
  
  // Transform the new API response to match the existing GraphQLStudent interface
  const students = response.allStudentsSummary.map((student) => ({
    id: student.id,
    admission_number: student.admissionNumber,
    user_id: '', // Not provided in new API
    feesOwed: student.feeSummary.balance,
    gender: '', // Not provided in new API
    totalFeesPaid: student.feeSummary.totalPaid,
    createdAt: '',
    isActive: true,
    updatedAt: '',
    streamId: null,
    phone: '',
    grade: {
      id: '',
      gradeLevel: {
        id: '',
        name: student.gradeLevelName,
      },
    },
    user: {
      id: '',
      email: '',
      name: student.studentName,
    },
  }));
  
  return { students };
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