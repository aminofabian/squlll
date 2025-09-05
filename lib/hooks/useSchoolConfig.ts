import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../graphql-client';
import { useSchoolConfigStore } from '../stores/useSchoolConfigStore';
import { SchoolConfiguration } from '../types/school-config';
import { gql } from 'graphql-request';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthErrorHandler } from './useAuthErrorHandler';

interface GetSchoolConfigResponse {
  getSchoolConfiguration: SchoolConfiguration;
}

const GET_SCHOOL_CONFIG = gql`
  query GetSchoolConfiguration {
    getSchoolConfiguration {
      id
      selectedLevels {
        id
        name
        description
        subjects {
          id
          name
          code
          subjectType
          category
          department
          shortName
          isCompulsory
          totalMarks
          passingMarks
          creditHours
          curriculum
        }
        gradeLevels {
          id
          name
          age
          streams {
            id
            name
          }
        }
      }
      tenant {
        id
        schoolName
        subdomain
      }
    }
  }
`;

export function useSchoolConfig(enabled: boolean = true) {
  const [config, setConfig] = useState<SchoolConfiguration | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setConfig: setStoreConfig } = useSchoolConfigStore();
  const { handleError } = useAuthErrorHandler();

  const query = useQuery({
    queryKey: ['schoolConfig'],
    queryFn: async () => {
      // Only run on client side
      if (typeof window === 'undefined') {
        throw new Error('useSchoolConfig can only be used on the client side');
      }

      setLoading(true);
      setError(null);

      try {
        // Debug: Log the request being made
        console.log('=== useSchoolConfig Debug ===');
        console.log('Current URL:', window.location.href);
        console.log('Current pathname:', window.location.pathname);
        console.log('Making GraphQL request to /api/graphql');
        console.log('=== End useSchoolConfig Debug ===');

        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetSchoolConfiguration {
                getSchoolConfiguration {
                  id
                  selectedLevels {
                    id
                    name
                    description
                    subjects {
                      id
                      name
                      code
                      subjectType
                      category
                      department
                      shortName
                      isCompulsory
                      totalMarks
                      passingMarks
                      creditHours
                      curriculum
                    }
                    gradeLevels {
                      id
                      name
                      age
                      streams {
                        id
                        name
                      }
                    }
                  }
                  tenant {
                    id
                    schoolName
                    subdomain
                  }
                }
              }
            `,
          }),
        });

        if (!response.ok) {
          console.log('GraphQL response not ok:', {
            status: response.status,
            statusText: response.statusText
          });
          
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          
          throw {
            response: {
              status: response.status,
              errors: errorData.errors || [{ message: errorData.error || 'Unknown error' }]
            }
          };
        }

        const data = await response.json();
        console.log('GraphQL success response:', data);

        if (data.errors) {
          console.log('GraphQL errors in response:', data.errors);
          throw {
            response: {
              status: 500,
              errors: data.errors
            }
          };
        }

        const config = data.data.getSchoolConfiguration;
        console.log('Full config from API:', config);
        
        // Update both local state and store
        setConfig(config);
        setStoreConfig(config);
        
        return config;
      } catch (error) {
        console.error('useSchoolConfig error:', error);
        
        // Handle authentication errors with redirect
        const wasHandled = handleError(error);
        if (wasHandled) {
          return null; // Don't throw, let the redirect happen
        }
        
        setError(error instanceof Error ? error.message : 'An error occurred');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry 401, 403 errors, permission denied errors, or "School not found" errors
      if (error && typeof error === 'object' && 'response' in error) {
        const graphQLError = error as any;
        
        // Don't retry 403 (forbidden) or 401 (unauthorized) errors
        if (graphQLError.response?.status === 403 || graphQLError.response?.status === 401) {
          return false;
        }
        
        // Don't retry GraphQL errors that indicate authentication/permission issues
        if (graphQLError.response?.errors) {
          const firstError = graphQLError.response.errors[0];
          
          // Don't retry permission denied errors
          if (firstError?.extensions?.code === 'FORBIDDENEXCEPTION' || 
              firstError?.message?.includes('Permission denied')) {
            return false;
          }
          
          // Don't retry "School not found" errors
          if (firstError?.message?.includes('School (tenant) not found') || 
              firstError?.extensions?.code === 'NOTFOUNDEXCEPTION') {
            return false;
          }
        }
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Consider the query successful even if it fails with auth errors (so we can redirect)
    throwOnError: false,
    // Always enable the query, but it will only run on the client side due to the window check
    enabled: enabled,
  });

  return query;
} 