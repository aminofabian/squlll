import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../graphql-client';
import { gql } from 'graphql-request';

const GET_STUDENTS_SUMMARY = gql`
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

export interface FeeSummary {
  totalOwed: number;
  totalPaid: number;
  balance: number;
  numberOfFeeItems: number;
}

export interface StudentSummaryData {
  id: string;
  admissionNumber: string;
  studentName: string;
  gradeLevelName: string;
  feeSummary: FeeSummary;
}

interface GetStudentsSummaryResponse {
  allStudentsSummary: StudentSummaryData[];
}

const fetchStudentsSummary = async (): Promise<StudentSummaryData[]> => {
  const response = await graphqlClient.request<GetStudentsSummaryResponse>(
    GET_STUDENTS_SUMMARY
  );
  return response.allStudentsSummary;
};

export const useStudentsSummary = () => {
  const query = useQuery({
    queryKey: ['students-summary'],
    queryFn: fetchStudentsSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    students: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

