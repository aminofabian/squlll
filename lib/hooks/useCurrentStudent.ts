import { useState, useEffect } from 'react';
import { getCookie } from '../utils';

interface StudentGrade {
  id: string;
  name: string;
  gradeLevel?: {
    id: string;
    name: string;
  };
}

interface CurrentStudent {
  id: string;
  name: string;
  email: string;
  admissionNumber: string;
  grade: StudentGrade | string;
  gradeId: string | null;
}

interface UseCurrentStudentResult {
  student: CurrentStudent | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
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

      // Get userName from cookies (set during login)
      const userName = getCookie('userName');
      const tenantId = getCookie('tenantId');
      
      if (!userName) {
        throw new Error('User name not found in cookies. Please log in again.');
      }

      if (!tenantId) {
        throw new Error('Tenant ID not found in cookies. Please log in again.');
      }

      // Use searchStudentsByName - this is a search query that students can use
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            query SearchCurrentStudent($name: String!, $tenantId: String!) {
              searchStudentsByName(name: $name, tenantId: $tenantId) {
                id
                name
                admissionNumber
                grade
                phone
                streamId
              }
            }
          `,
          variables: {
            name: userName,
            tenantId,
          },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      // searchStudentsByName returns an array - find exact match by name
      const students = data.data?.searchStudentsByName || [];
      const currentStudent = students.find((s: any) => 
        s.name?.toLowerCase() === userName.toLowerCase()
      );

      if (!currentStudent) {
        throw new Error(`Student not found for name: ${userName}`);
      }

      // The grade field might be a name or ID - check if it's a UUID
      const gradeString = currentStudent.grade || '';
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(gradeString);
      let gradeId: string | null = isUUID ? gradeString : null;

      // If grade is not a UUID, resolve it by querying grades
      if (!isUUID && gradeString) {
        try {
          const gradesResponse = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              query: `
                query GetGradeLevels {
                  gradeLevelsForSchoolType {
                    id
                    shortName
                    gradeLevel {
                      id
                      name
                    }
                  }
                }
              `,
            }),
          });

          const gradesData = await gradesResponse.json();
          if (!gradesData.errors && gradesData.data?.gradeLevelsForSchoolType) {
            const matchedGrade = gradesData.data.gradeLevelsForSchoolType.find((gl: any) =>
              gl.gradeLevel?.name === gradeString || 
              gl.shortName === gradeString ||
              gl.gradeLevel?.name?.toLowerCase() === gradeString?.toLowerCase()
            );
            
            if (matchedGrade) {
              gradeId = matchedGrade.id;
            } else {
              console.warn('Could not resolve grade name to ID:', gradeString);
            }
          }
        } catch (gradeError) {
          console.warn('Failed to resolve grade ID:', gradeError);
        }
      }

      setStudent({
        id: currentStudent.id,
        name: currentStudent.name || '',
        email: '', // Not available in searchStudentsByName
        admissionNumber: currentStudent.admissionNumber,
        grade: gradeString,
        gradeId,
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

