import { useState, useEffect } from 'react';
import { useAuthErrorHandler } from './useAuthErrorHandler';

interface TeacherSubject {
  id: string;
  subject?: {
    id: string;
    name: string;
  };
  customSubject?: {
    id: string;
    name: string;
  };
  subjectType: string;
}

interface TeacherGradeLevel {
  id: string;
  gradeLevel: {
    id: string;
    name: string;
  };
  shortName?: string;
}

interface TeacherStream {
  id: string;
  stream: {
    id: string;
    name: string;
  };
  isActive: boolean;
}

interface ClassTeacherAssignment {
  id: string;
  active: boolean;
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

interface Teacher {
  id: string;
  fullName: string;
  email: string;
  tenantSubjects: TeacherSubject[];
  tenantGradeLevels: TeacherGradeLevel[];
  tenantStreams: TeacherStream[];
  classTeacherAssignments: ClassTeacherAssignment[];
}

interface GetTeacherResponse {
  getTeacher: Teacher;
}

const GET_TEACHER_QUERY = `
  query {
    getTeacher {
      id
      fullName
      email
      tenantSubjects {
        id
        subject { id name }
        customSubject { id name }
        subjectType
      }
      tenantGradeLevels {
        id
        gradeLevel { id name }
        shortName
      }
      tenantStreams {
        id
        stream { id name }
        isActive
      }
      classTeacherAssignments {
        id
        active
        stream {
          id
          stream { id name }
        }
        gradeLevel {
          id
          gradeLevel { id name }
        }
      }
    }
  }
`;

export function useTeacherData() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useAuthErrorHandler();

  useEffect(() => {
    const fetchTeacher = async () => {
      // Only run on client side
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('=== useTeacherData: Fetching teacher data ===');

        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: GET_TEACHER_QUERY,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          
          // Check if the error is about missing grade levels
          const gradeNotFoundError = result.errors.find((error: any) => 
            error.message?.includes('Grade levels not found')
          );
          
          if (gradeNotFoundError) {
            console.warn('Teacher has assignments to non-existent grade levels. This may indicate data inconsistency.');
            // Set a partial teacher object with empty grade levels to allow the app to continue
            const partialTeacher = {
              id: 'unknown',
              fullName: 'Teacher',
              email: 'unknown@example.com',
              tenantSubjects: [],
              tenantGradeLevels: [],
              tenantStreams: [],
              classTeacherAssignments: []
            };
            setTeacher(partialTeacher);
            setError('Some grade level assignments could not be loaded. Please contact your administrator to update your assignments.');
            return;
          }
          
          throw new Error(result.errors.map((e: any) => e.message).join(', '));
        }

        const teacherData = result.data as GetTeacherResponse;
        console.log('=== useTeacherData: Teacher data received successfully ===');
        console.log('Teacher data:', teacherData);
        setTeacher(teacherData.getTeacher);
      } catch (err) {
        console.error('Error fetching teacher data:', err);
        
        // Handle authentication errors with redirect
        const wasHandled = handleError(err);
        if (wasHandled) {
          return; // Don't set error state, let the redirect happen
        }
        
        const errorMessage = err instanceof Error 
          ? err.message 
          : typeof err === 'object' && err !== null 
            ? JSON.stringify(err)
            : 'Failed to fetch teacher data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, []);

  return {
    teacher,
    loading,
    error,
    // Helper methods to get formatted data for the CreateTestSection
    getFormattedSubjects: () => {
      if (!teacher) return [];
      return teacher.tenantSubjects.map(ts => ({
        id: ts.id, // Use tenant subject ID instead of base subject ID
        name: ts.subject?.name || ts.customSubject?.name || 'Unknown Subject',
        subjectType: ts.subjectType,
        baseSubjectId: ts.subject?.id || ts.customSubject?.id // Keep base ID for reference if needed
      }));
    },
    getFormattedGradeLevels: () => {
      if (!teacher) return [];
      return teacher.tenantGradeLevels.map(tgl => ({
        id: tgl.id, // Use tenant grade level ID instead of base grade level ID
        name: tgl.gradeLevel.name,
        shortName: tgl.shortName,
        baseLevelId: tgl.gradeLevel.id // Keep base ID for reference if needed
      }));
    },
    refetch: () => {
      setLoading(true);
      setError(null);
      // Trigger a re-fetch by updating the state
      setTimeout(() => {
        const fetchTeacher = async () => {
          try {
            const response = await fetch('/api/graphql', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query: GET_TEACHER_QUERY,
              }),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.errors) {
              // Check if the error is about missing grade levels
              const gradeNotFoundError = result.errors.find((error: any) => 
                error.message?.includes('Grade levels not found')
              );
              
              if (gradeNotFoundError) {
                console.warn('Teacher has assignments to non-existent grade levels. This may indicate data inconsistency.');
                // Set a partial teacher object with empty grade levels to allow the app to continue
                const partialTeacher = {
                  id: 'unknown',
                  fullName: 'Teacher',
                  email: 'unknown@example.com',
                  tenantSubjects: [],
                  tenantGradeLevels: [],
                  tenantStreams: [],
                  classTeacherAssignments: []
                };
                setTeacher(partialTeacher);
                setError('Some grade level assignments could not be loaded. Please contact your administrator to update your assignments.');
                return;
              }
              
              throw new Error(result.errors.map((e: any) => e.message).join(', '));
            }

            const teacherData = result.data as GetTeacherResponse;
            setTeacher(teacherData.getTeacher);
          } catch (err) {
            // Handle authentication errors with redirect
            const wasHandled = handleError(err);
            if (wasHandled) {
              return; // Don't set error state, let the redirect happen
            }
            
            const errorMessage = err instanceof Error 
              ? err.message 
              : typeof err === 'object' && err !== null 
                ? JSON.stringify(err)
                : 'Failed to fetch teacher data';
            setError(errorMessage);
          } finally {
            setLoading(false);
          }
        };
        fetchTeacher();
      }, 100);
    }
  };
}

export type { Teacher, TeacherSubject, TeacherGradeLevel, TeacherStream, ClassTeacherAssignment };
