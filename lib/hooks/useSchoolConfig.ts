import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../graphql-client';
import { useSchoolConfigStore } from '../stores/useSchoolConfigStore';
import { SchoolConfiguration } from '../types/school-config';
import { gql } from 'graphql-request';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
            capacity
            isActive
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
        // Debug: Check cookies before making the request
        console.log('=== useSchoolConfig Debug ===');
        console.log('Current URL:', window.location.href);
        console.log('Current pathname:', window.location.pathname);
        
        // Check if we have the required cookies
        const cookieValue = `; ${document.cookie}`;
        const getCookie = (name: string) => {
          const parts = cookieValue.split(`; ${name}=`);
          if (parts.length === 2) {
            return parts.pop()?.split(';').shift() || null;
          }
          return null;
        };
        
        const accessToken = getCookie('accessToken');
        const userId = getCookie('userId');
        const tenantId = getCookie('tenantId');
        const userRole = getCookie('userRole');
        
        console.log('Cookie check:', {
          hasAccessToken: !!accessToken,
          accessTokenLength: accessToken?.length || 0,
          hasUserId: !!userId,
          hasTenantId: !!tenantId,
          userRole: userRole,
          allCookies: document.cookie.split(';').map(c => c.trim().split('=')[0])
        });
        
        if (!accessToken) {
          console.log('No accessToken found in cookies - this will cause a 401');
        }
        
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
                    gradeLevels {
                      id
                      name
                      code
                      order
                    }
                  }
                  tenant {
                    id
                    schoolName
                  }
                  createdAt
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
        setConfig(config);
        return config;
      } catch (error) {
        console.error('School config error:', error);
        
        // Handle different types of errors
        let errorMessage = 'Failed to fetch school configuration';
        
        if (error && typeof error === 'object' && 'response' in error) {
          const graphQLError = error as any;
          
          console.log('Processing error response:', {
            status: graphQLError.response?.status,
            errors: graphQLError.response?.errors
          });
          
          if (graphQLError.response?.errors) {
            // Handle GraphQL errors
            const graphQLErrors = graphQLError.response.errors;
            const firstError = graphQLErrors[0];
            
            console.log('Processing GraphQL error:', firstError);
            errorMessage = firstError?.message || errorMessage;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        
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