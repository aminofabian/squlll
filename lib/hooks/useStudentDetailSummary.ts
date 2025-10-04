import { useState, useEffect } from 'react';
import { StudentDetailSummary } from '@/types/student';

interface UseStudentDetailSummaryResult {
  studentDetail: StudentDetailSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStudentDetailSummary(studentId: string): UseStudentDetailSummaryResult {
  const [studentDetail, setStudentDetail] = useState<StudentDetailSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentDetail = async () => {
    if (!studentId) return;
    
    setLoading(true);
    setError(null);

    try {
      // Add cache-busting timestamp to force fresh data
      const cacheBuster = Date.now()
      console.log(`🔄 FORCE REFETCH: Student detail with cache buster: ${cacheBuster}`)
      
      // Clear any existing data to force UI refresh
      setStudentDetail(null)
      
      // Add extra delay to ensure server-side data is fully committed
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify({
          query: `
            query GetStudentSummary($studentId: ID!) {
              studentSummary(studentId: $studentId) {
                id
                admissionNumber
                studentName
                email
                phone
                gender
                schoolType
                gradeLevelName
                curriculumName
                streamName
                feeSummary {
                  totalOwed
                  totalPaid
                  balance
                  numberOfFeeItems
                  feeItems {
                    id
                    feeBucketName
                    amount
                    isMandatory
                    feeStructureName
                    academicYearName
                  }
                }
                isActive
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            studentId,
          },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      const student = data.data?.studentSummary;
      
      if (student) {
        setStudentDetail(student);
      } else {
        setError('Student not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDetail();
  }, [studentId]);

  return {
    studentDetail,
    loading,
    error,
    refetch: fetchStudentDetail,
  };
}

