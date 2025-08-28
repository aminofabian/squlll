import { useState, useEffect } from 'react';

interface StudentLoginInfo {
  id: string;
  email: string;
  name: string;
  admission_number: string;
  grade: string;
}

interface UseStudentLoginInfoResult {
  loginInfo: StudentLoginInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStudentLoginInfo(studentId: string): UseStudentLoginInfoResult {
  const [loginInfo, setLoginInfo] = useState<StudentLoginInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLoginInfo = async () => {
    if (!studentId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetStudents {
              studentsForTenant {
                id
                email
                name
                admission_number
                grade
              }
            }
          `,
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      // Find the specific student by ID
      const student = data.data?.studentsForTenant?.find((s: StudentLoginInfo) => s.id === studentId);
      
      if (student) {
        setLoginInfo(student);
      } else {
        setError('Student not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student login info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoginInfo();
  }, [studentId]);

  return {
    loginInfo,
    loading,
    error,
    refetch: fetchLoginInfo,
  };
}
