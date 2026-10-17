import { useState } from 'react';

export interface StudentCredentials {
  name: string;
  email: string;
  password: string;
}

interface UseStudentCredentialsResult {
  credentials: StudentCredentials | null;
  loading: boolean;
  error: string | null;
  fetchCredentials: () => Promise<StudentCredentials | null>;
}

export function useStudentCredentials(studentId: string): UseStudentCredentialsResult {
  const [credentials, setCredentials] = useState<StudentCredentials | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCredentials = async (): Promise<StudentCredentials | null> => {
    if (!studentId) return null;
    
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
            query GetStudentCredentialsById($studentId: String!) {
              getStudentCredentialsById(studentId: $studentId) {
                name
                email
                password
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

      const credentialsData = data.data?.getStudentCredentialsById;
      
      if (credentialsData) {
        setCredentials(credentialsData);
        return credentialsData;
      }
      setError('Student credentials not found');
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student credentials');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    credentials,
    loading,
    error,
    fetchCredentials,
  };
}

