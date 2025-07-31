import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../graphql-client';
import { useSchoolConfigStore } from '../stores/useSchoolConfigStore';
import { SchoolConfiguration } from '../types/school-config';
import { gql } from 'graphql-request';
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
  const { setConfig: setStoreConfig } = useSchoolConfigStore();

  const query = useQuery({
    queryKey: ['schoolConfig'],
    queryFn: async (): Promise<SchoolConfiguration> => {
      // Only run on client side
      if (typeof window === 'undefined') {
        throw new Error('useSchoolConfig can only be used on the client side');
      }

      console.log('=== useSchoolConfig Debug ===');
      console.log('Current URL:', window.location.href);
      console.log('Current pathname:', window.location.pathname);
      console.log('Making GraphQL request...');

      try {
        // Option 1: Using your existing graphqlClient (recommended)
        const response = await graphqlClient.request<GetSchoolConfigResponse>(
          GET_SCHOOL_CONFIG
        );
        
        const config = response.getSchoolConfiguration;
        console.log('GraphQL success response:', config);
        
        return config;

      } catch (error: any) {
        console.error('GraphQL request failed:', error);
        
        // Handle GraphQL errors
        if (error.response?.errors) {
          const firstError = error.response.errors[0];
          console.error('GraphQL error details:', firstError);
          
          // Throw a more descriptive error
          throw new Error(firstError.message || 'GraphQL request failed');
        }
        
        // Handle network errors
        if (error.response?.status) {
          throw new Error(`HTTP ${error.response.status}: ${error.message}`);
        }
        
        // Re-throw unknown errors
        throw error;
      } finally {
        console.log('=== End useSchoolConfig Debug ===');
      }
    },
    
    // Retry configuration
    retry: (failureCount, error) => {
      console.log(`Retry attempt ${failureCount} for error:`, error);
      
      // Don't retry authentication/authorization errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Don't retry these specific errors
        if (
          errorMessage.includes('permission denied') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('forbidden') ||
          errorMessage.includes('school (tenant) not found') ||
          errorMessage.includes('http 401') ||
          errorMessage.includes('http 403') ||
          errorMessage.includes('http 404')
        ) {
          console.log('Not retrying due to auth/permission error');
          return false;
        }
      }
      
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 30000);
      console.log(`Retrying in ${delay}ms...`);
      return delay;
    },
    
    // Don't throw errors so we can handle them in the component
    throwOnError: false,
    
    // Enable query based on parameter
    enabled: enabled && typeof window !== 'undefined',
    
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    
    // Keep data fresh
    refetchOnWindowFocus: true,
    
    // Success callback to update store
    onSuccess: (data) => {
      console.log('Query successful, updating store with:', data);
      setConfig(data);
      setStoreConfig(data);
    },
    
    // Error callback for additional logging
    onError: (error) => {
      console.error('Query failed with error:', error);
      setConfig(null);
    }
  });

  // Alternative implementation using custom fetch (if graphqlClient doesn't work)
  const queryWithCustomFetch = useQuery({
    queryKey: ['schoolConfig', 'custom-fetch'],
    queryFn: async (): Promise<SchoolConfiguration> => {
      if (typeof window === 'undefined') {
        throw new Error('useSchoolConfig can only be used on the client side');
      }

      console.log('Using custom fetch for GraphQL request...');

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any additional headers your API might need
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: GET_SCHOOL_CONFIG.loc?.source?.body || GET_SCHOOL_CONFIG,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        throw new Error(
          `HTTP ${response.status}: ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();

      if (data.errors && data.errors.length > 0) {
        console.error('GraphQL Errors:', data.errors);
        throw new Error(data.errors[0].message);
      }

      if (!data.data?.getSchoolConfiguration) {
        throw new Error('No school configuration data received');
      }

      return data.data.getSchoolConfiguration;
    },
    enabled: false, // Disabled by default - enable this if the main query fails
    ...query // Inherit the same retry logic and other options
  });

  // Return the primary query, but you can switch to queryWithCustomFetch if needed
  return {
    ...query,
    config, // Local state config
    // Helper methods
    refetch: query.refetch,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    
    // Alternative query method (if you need to switch)
    useCustomFetch: () => queryWithCustomFetch,
  };
}

// Export a version that automatically handles client-side only usage
export function useSchoolConfigClientOnly(enabled: boolean = true) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return useSchoolConfig(enabled && isClient);
}

// import { useQuery } from '@tanstack/react-query';
// import { graphqlClient } from '../graphql-client';
// import { useSchoolConfigStore } from '../stores/useSchoolConfigStore';
// import { SchoolConfiguration } from '../types/school-config';
// import { gql } from 'graphql-request';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';

// interface GetSchoolConfigResponse {
//   getSchoolConfiguration: SchoolConfiguration;
// }

// const GET_SCHOOL_CONFIG = gql`
//   query GetSchoolConfiguration {
//     getSchoolConfiguration {
//       id
//       selectedLevels {
//         id
//         name
//         description
//         subjects {
//           id
//           name
//           code
//           subjectType
//           category
//           department
//           shortName
//           isCompulsory
//           totalMarks
//           passingMarks
//           creditHours
//           curriculum
//         }
//         gradeLevels {
//           id
//           name
//           age
//           streams {
//             id
//             name
//             capacity
//             isActive
//           }
//         }
//       }
//       tenant {
//         id
//         schoolName
//         subdomain
//       }
//     }
//   }
// `;

// export function useSchoolConfig(enabled: boolean = true) {
//   const [config, setConfig] = useState<SchoolConfiguration | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const { setConfig: setStoreConfig } = useSchoolConfigStore();

//   const query = useQuery({
//     queryKey: ['schoolConfig'],
//     queryFn: async () => {
//       // Only run on client side
//       if (typeof window === 'undefined') {
//         throw new Error('useSchoolConfig can only be used on the client side');
//       }

//       setLoading(true);
//       setError(null);

//       try {
//         // Debug: Log the request being made
//         console.log('=== useSchoolConfig Debug ===');
//         console.log('Current URL:', window.location.href);
//         console.log('Current pathname:', window.location.pathname);
//         console.log('Making GraphQL request to /api/graphql');
//         console.log('=== End useSchoolConfig Debug ===');

//         const response = await fetch('/api/graphql', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             query: `
//               query GetSchoolConfiguration {
//                 getSchoolConfiguration {
//                   id
//                   selectedLevels {
//                     id
//                     name
//                     description
//                     subjects {
//                       id
//                       name
//                       code
//                       subjectType
//                       category
//                       department
//                       shortName
//                       isCompulsory
//                       totalMarks
//                       passingMarks
//                       creditHours
//                       curriculum
//                     }
//                     gradeLevels {
//                       id
//                       name
//                       age
//                       streams {
//                         id
//                         name
//                         capacity
//                         isActive
//                       }
//                     }
//                   }
//                   tenant {
//                     id
//                     schoolName
//                     subdomain
//                   }
//                 }
//               }
//             `,
//           }),
//         });

//         if (!response.ok) {
//           console.log('GraphQL response not ok:', {
//             status: response.status,
//             statusText: response.statusText
//           });
          
//           const errorData = await response.json();
//           console.log('Error response data:', errorData);
          
//           throw {
//             response: {
//               status: response.status,
//               errors: errorData.errors || [{ message: errorData.error || 'Unknown error' }]
//             }
//           };
//         }

//         const data = await response.json();
//         console.log('GraphQL success response:', data);

//         if (data.errors) {
//           console.log('GraphQL errors in response:', data.errors);
//           throw {
//             response: {
//               status: 500,
//               errors: data.errors
//             }
//           };
//         }

//         const config = data.data.getSchoolConfiguration;
//         console.log('Full config from API:', config);
        
//         // Update both local state and store
//         setConfig(config);
//         setStoreConfig(config);
        
//         return config;
//       } catch (error) {
//         console.error('useSchoolConfig error:', error);
//         setError(error instanceof Error ? error.message : 'An error occurred');
//         throw error;
//       } finally {
//         setLoading(false);
//       }
//     },
//     // Retry configuration
//     retry: (failureCount, error) => {
//       // Don't retry 401, 403 errors, permission denied errors, or "School not found" errors
//       if (error && typeof error === 'object' && 'response' in error) {
//         const graphQLError = error as any;
        
//         // Don't retry 403 (forbidden) or 401 (unauthorized) errors
//         if (graphQLError.response?.status === 403 || graphQLError.response?.status === 401) {
//           return false;
//         }
        
//         // Don't retry GraphQL errors that indicate authentication/permission issues
//         if (graphQLError.response?.errors) {
//           const firstError = graphQLError.response.errors[0];
          
//           // Don't retry permission denied errors
//           if (firstError?.extensions?.code === 'FORBIDDENEXCEPTION' || 
//               firstError?.message?.includes('Permission denied')) {
//             return false;
//           }
          
//           // Don't retry "School not found" errors
//           if (firstError?.message?.includes('School (tenant) not found') || 
//               firstError?.extensions?.code === 'NOTFOUNDEXCEPTION') {
//             return false;
//           }
//         }
//       }
//       // Retry other errors up to 2 times
//       return failureCount < 2;
//     },
//     retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
//     // Consider the query successful even if it fails with auth errors (so we can redirect)
//     throwOnError: false,
//     // Always enable the query, but it will only run on the client side due to the window check
//     enabled: enabled,
//   });

//   return query;
// } 