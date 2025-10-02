import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../graphql-client';
import { gql } from 'graphql-request';

export interface FeeItem {
  feeBucketName: string;
  amount: number;
  isMandatory: boolean;
}

export interface StudentFeeSummary {
  totalOwed: number;
  totalPaid: number;
  balance: number;
  feeItems: FeeItem[];
}

export interface StudentInGrade {
  admissionNumber: string;
  studentName: string;
  feeSummary: StudentFeeSummary;
}

export interface GradeLevelFeeSummary {
  gradeLevelName: string;
  totalStudents: number;
  totalFeesOwed: number;
  totalFeesPaid: number;
  totalBalance: number;
  students: StudentInGrade[];
}

interface GetStudentsForGradeResponse {
  studentsSummaryForGradeLevel: GradeLevelFeeSummary;
}

const GET_STUDENTS_FOR_GRADE = gql`
  query GetStudentsForGrade($gradeLevelId: ID!) {
    studentsSummaryForGradeLevel(gradeLevelId: $gradeLevelId) {
      gradeLevelName
      totalStudents
      totalFeesOwed
      totalFeesPaid
      totalBalance
      students {
        admissionNumber
        studentName
        feeSummary {
          totalOwed
          totalPaid
          balance
          feeItems {
            feeBucketName
            amount
            isMandatory
          }
        }
      }
    }
  }
`;

export function useGradeLevelFeeSummary(gradeLevelId: string | null) {
  return useQuery<GradeLevelFeeSummary>({
    queryKey: ['gradeLevelFeeSummary', gradeLevelId],
    queryFn: async () => {
      if (!gradeLevelId) {
        throw new Error('Grade level ID is required');
      }

      const data = await graphqlClient.request<GetStudentsForGradeResponse>(
        GET_STUDENTS_FOR_GRADE,
        { gradeLevelId }
      );

      return data.studentsSummaryForGradeLevel;
    },
    enabled: !!gradeLevelId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 2,
  });
}

