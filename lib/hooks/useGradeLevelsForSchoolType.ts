import { useQuery } from '@tanstack/react-query';
import { gql } from 'graphql-request';

// Define the GraphQL query for grade levels for school type
const GET_GRADE_LEVELS_FOR_SCHOOL_TYPE = gql`
  query GradeLevelsForSchoolType {
    gradeLevelsForSchoolType {
      id
      isActive
      createdAt
      updatedAt
      shortName
      sortOrder
      tenantStreams {
        id
        stream {
          id
          name
        }
      }
      gradeLevel {
        id
        name
      }
      curriculum {
        id
        name
        schoolType {
          id
          name
        }
      }
    }
  }
`;

// TypeScript interfaces for the response
export interface GradeLevelForSchoolType {
  id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  shortName: string | null;
  sortOrder: number;
  tenantStreams: Array<{
    id: string;
    stream: {
      id: string;
      name: string;
    };
  }>;
  gradeLevel: {
    id: string;
    name: string;
  };
  curriculum: {
    id: string;
    name: string;
    schoolType: {
      id: string;
      name: string;
    };
  };
}

interface GetGradeLevelsForSchoolTypeResponse {
  gradeLevelsForSchoolType: GradeLevelForSchoolType[];
}

export function useGradeLevelsForSchoolType(enabled: boolean = true) {
  return useQuery({
    queryKey: ['gradeLevelsForSchoolType'],
    queryFn: async (): Promise<GradeLevelForSchoolType[]> => {
      // Only run on client side
      if (typeof window === 'undefined') {
        throw new Error('useGradeLevelsForSchoolType can only be used on the client side');
      }

      console.log('Fetching grade levels for school type...');

      try {
        console.log('Fetching grade levels with tenantStreams structure...');
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GradeLevelsForSchoolType {
                gradeLevelsForSchoolType {
                  id
                  isActive
                  createdAt
                  updatedAt
                  shortName
                  sortOrder
                  tenantStreams {
                    id
                    stream {
                      id
                      name
                    }
                  }
                  gradeLevel {
                    id
                    name
                  }
                  curriculum {
                    id
                    name
                    schoolType {
                      id
                      name
                    }
                  }
                }
              }
            `,
          }),
        });

        if (!response.ok) {
          console.error('Failed to fetch grade levels for school type:', {
            status: response.status,
            statusText: response.statusText
          });
          
          const errorData = await response.json();
          console.error('Error response data:', errorData);
          
          throw new Error(`Failed to fetch grade levels: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Grade levels for school type response:', data);

        if (data.errors) {
          console.error('GraphQL errors in grade levels response:', data.errors);
          throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`);
        }

        const gradeLevels = data.data.gradeLevelsForSchoolType;
        console.log('✅ Fetched', gradeLevels.length, 'grade levels with tenantStreams');
        
        return gradeLevels;
      } catch (error) {
        console.error('Error fetching grade levels for school type:', error);
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