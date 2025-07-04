import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../graphql-client';
import { useSchoolConfigStore } from '../stores/useSchoolConfigStore';
import { SchoolConfiguration } from '../types/school-config';
import { gql } from 'graphql-request';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
  const { setConfig, setLoading, setError } = useSchoolConfigStore();
  const router = useRouter();

  const query = useQuery({
    queryKey: ['schoolConfig'],
    queryFn: async () => {
      console.log('useSchoolConfig - Starting GraphQL request...')
      try {
        setLoading(true);
        
        // Ensure we're in a client environment
        if (typeof window === 'undefined') {
          throw new Error('This hook can only be used in client-side components');
        }
        
        const response = await graphqlClient.request<GetSchoolConfigResponse>(GET_SCHOOL_CONFIG);
        const config = response.getSchoolConfiguration;
        
        // Debug: Log the response to see if we're getting gradeLevels
        console.log('School config response:', {
          id: config.id,
          levels: config.selectedLevels.map(l => ({
            name: l.name,
            subjects: l.subjects.length,
            grades: l.gradeLevels?.map(g => ({
              id: g.id,
              name: g.name,
              age: g.age
            }))
          }))
        });
        
        setConfig(config);
        return config;
      } catch (error) {
        console.error('School config error:', error);
        
        // Handle different types of errors
        let errorMessage = 'Failed to fetch school configuration';
        let shouldRedirectToLogin = false;
        
        if (error && typeof error === 'object' && 'response' in error) {
          const graphQLError = error as any;
          
          // Check for 401 (unauthorized) errors
          if (graphQLError.response?.status === 401) {
            errorMessage = 'Authentication required. Please log in.';
            shouldRedirectToLogin = true;
            console.log('401 error detected - user needs to authenticate');
          } else if (graphQLError.response?.errors) {
            // Handle GraphQL errors
            const graphQLErrors = graphQLError.response.errors;
            const firstError = graphQLErrors[0];
            
            // Check for "School (tenant) not found" error
            if (firstError?.message?.includes('School (tenant) not found') || 
                firstError?.extensions?.code === 'NOTFOUNDEXCEPTION') {
              errorMessage = 'School not found or access denied. Please check your credentials.';
              shouldRedirectToLogin = true;
              console.log('School not found error - likely authentication issue');
            } else {
              errorMessage = firstError?.message || errorMessage;
            }
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        
        // Redirect to login if authentication is required
        if (shouldRedirectToLogin && typeof window !== 'undefined') {
          // Check if this is a new registration (has URL parameters)
          const urlParams = new URLSearchParams(window.location.search)
          const isNewRegistration = urlParams.get('newRegistration') === 'true' || urlParams.get('accessToken')
          
          if (!isNewRegistration) {
            // Only redirect to login if this is not a new registration
            // Use window.location for full page redirect to login
            window.location.href = '/login';
          } else {
            console.log('New registration detected - not redirecting to login, waiting for authentication to complete')
          }
        }
        
        throw error;
      } finally {
        setLoading(false);
      }
    },
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry 401 errors or "School not found" errors (authentication issues)
      if (error && typeof error === 'object' && 'response' in error) {
        const graphQLError = error as any;
        if (graphQLError.response?.status === 401) {
          return false;
        }
        
        // Don't retry "School not found" errors
        if (graphQLError.response?.errors) {
          const firstError = graphQLError.response.errors[0];
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