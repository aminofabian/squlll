import { useState, useEffect, useCallback } from 'react';

interface StudentGrade {
  id: string;
  name: string;
  gradeLevel?: {
    id: string;
    name: string;
  };
  tenantStreams?: Array<{
    id: string;
    stream?: {
      id: string;
      name: string;
    } | null;
  }>;
}

interface CurrentStudent {
  id: string;
  name: string;
  email: string;
  admissionNumber: string;
  grade: StudentGrade | string;
  gradeId: string | null;
  tenantStreamId: string | null;
  streamName: string | null;
}

export type { CurrentStudent };

interface UseCurrentStudentResult {
  student: CurrentStudent | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function resolveTenantStreamId(
  grade: StudentGrade | undefined,
  streamId: string | null | undefined,
): string | null {
  if (!streamId || !grade?.tenantStreams?.length) return null;

  return (
    grade.tenantStreams.find((ts) => ts.stream?.id === streamId)?.id ?? null
  );
}

/**
 * Hook to get the current logged-in student's information including gradeId
 */
export function useCurrentStudent(): UseCurrentStudentResult {
  const [student, setStudent] = useState<CurrentStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            query MyStudentProfile {
              myStudentProfile {
                id
                admission_number
                grade {
                  id
                  name
                  shortName
                  gradeLevel {
                    id
                    name
                  }
                  tenantStreams {
                    id
                    stream {
                      id
                      name
                    }
                  }
                }
                stream {
                  id
                  name
                }
                user {
                  name
                  email
                }
              }
            }
          `,
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      const profile = data.data?.myStudentProfile;
      if (!profile) {
        throw new Error('Student profile not found');
      }

      const grade = profile.grade as StudentGrade | undefined;
      const gradeName = grade?.gradeLevel?.name || grade?.name || '';
      const streamId = profile.stream?.id ?? null;
      const streamName = profile.stream?.name ?? null;
      const tenantStreamId = resolveTenantStreamId(grade, streamId);

      setStudent({
        id: profile.id,
        name: profile.user?.name || '',
        email: profile.user?.email || '',
        admissionNumber: profile.admission_number,
        grade: gradeName,
        gradeId: grade?.id || null,
        tenantStreamId,
        streamName,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch student information';
      setError(errorMessage);
      console.error('Error fetching current student:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  return {
    student,
    loading,
    error,
    refetch: fetchStudent,
  };
}
