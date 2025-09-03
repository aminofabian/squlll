import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';

// Define the GraphQL query for tenant subjects
const GET_TENANT_SUBJECTS = gql`
  query GetTenantSubjects {
    tenantSubjects {
      id
      subjectType
      isCompulsory
      totalMarks
      passingMarks
      creditHours
      isActive
      curriculum {
        id
        name
      }
      subject {
        id
        name
        code
        category
        department
        shortName
      }
      customSubject {
        id
        name
        code
        category
        department
        shortName
      }
    }
  }
`;

// TypeScript interfaces for the response
export interface TenantSubject {
  id: string;
  subjectType: 'core' | 'elective';
  isCompulsory: boolean;
  totalMarks: number;
  passingMarks: number;
  creditHours: number;
  isActive: boolean;
  curriculum: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
    code: string;
    category: string | null;
    department: string | null;
    shortName: string | null;
  } | null;
  customSubject: {
    id: string;
    name: string;
    code: string;
    category: string | null;
    department: string | null;
    shortName: string | null;
  } | null;
}

interface GetTenantSubjectsResponse {
  tenantSubjects: TenantSubject[];
}

export function useTenantSubjects(enabled: boolean = true) {
  return useQuery({
    queryKey: ['tenantSubjects'],
    queryFn: async (): Promise<TenantSubject[]> => {
      // Only run on client side
      if (typeof window === 'undefined') {
        throw new Error('useTenantSubjects can only be used on the client side');
      }

      console.log('Fetching tenant subjects...');

      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query {
                tenantSubjects {
                  id
                  subjectType
                  isCompulsory
                  totalMarks
                  passingMarks
                  creditHours
                  isActive
                  curriculum {
                    id
                    name
                  }
                  subject {
                    id
                    name
                    code
                    category
                    department
                    shortName
                  }
                  customSubject {
                    id
                    name
                    code
                    category
                    department
                    shortName
                  }
                }
              }
            `,
          }),
        });

        if (!response.ok) {
          console.error('Failed to fetch tenant subjects:', {
            status: response.status,
            statusText: response.statusText
          });
          
          const errorData = await response.json();
          console.error('Error response data:', errorData);
          
          throw new Error(`Failed to fetch tenant subjects: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Tenant subjects response:', data);

        if (data.errors) {
          console.error('GraphQL errors in tenant subjects response:', data.errors);
          throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`);
        }

        const subjects = data.data.tenantSubjects;
        console.log('Fetched tenant subjects:', subjects.length, 'subjects');
        
        return subjects;
      } catch (error) {
        console.error('Error fetching tenant subjects:', error);
        throw error;
      }
    },
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry authentication/permission issues
      if (error && error instanceof Error && error.message.includes('403')) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: enabled,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  });
}
