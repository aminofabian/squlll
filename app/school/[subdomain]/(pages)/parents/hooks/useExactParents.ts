import { useState, useEffect } from 'react'
import { graphqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'
import { Parent } from '../types/index'

// Exact GraphQL query as specified
const GET_ALL_PARENTS = gql`
  query GetAllParents {
    getAllParents {
      id
      name
      email
      phone
      address
      occupation
      isActive
      userId
      createdAt
      updatedAt
      students {
        id
        admissionNumber
        firstName
        lastName
        grade
        relationship
        isPrimary
      }
    }
  }
`

// Response type for the GraphQL query
interface GetAllParentsResponse {
  getAllParents: GraphQLParent[];
}

// GraphQL Parent structure exactly as returned by the API
export interface GraphQLParent {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  occupation: string | null;
  isActive: boolean;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  students: {
    id: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
    grade: any; // Could be an object or string based on your example
    relationship: string;
    isPrimary: boolean;
  }[];
}

// Transform GraphQL parent to match our app's Parent type
const transformGraphQLParent = (graphqlParent: GraphQLParent): Parent => {
  return {
    id: graphqlParent.id,
    name: graphqlParent.name,
    email: graphqlParent.email || '',
    phone: graphqlParent.phone || '',
    relationship: (graphqlParent.students[0]?.relationship || 'other') as 'father' | 'mother' | 'guardian' | 'other',
    occupation: graphqlParent.occupation || '',
    workAddress: '',
    homeAddress: graphqlParent.address || '',
    emergencyContact: '',
    idNumber: '',
    students: graphqlParent.students.map(student => {
      // Handle the case where grade is returned as [object Object]
      let gradeName = 'Unknown Grade';
      
      if (student.grade) {
        if (typeof student.grade === 'object' && student.grade !== null) {
          // Handle object format - check if it has gradeLevel.name
          if (student.grade.gradeLevel && student.grade.gradeLevel.name) {
            gradeName = student.grade.gradeLevel.name;
          }
        } else if (typeof student.grade === 'string') {
          if (student.grade !== '[object Object]') {
            gradeName = student.grade;
          }
        }
      }
      
      // Filter out 'amino' as lastName which is likely coming from the subdomain
      const lastName = student.lastName && 
                     (student.lastName === 'amino' || 
                      student.lastName.toLowerCase() === 'amino') ? 
                      '' : student.lastName;
      
      return {
        id: student.id,
        name: `${student.firstName}${lastName ? ' ' + lastName : ''}`,
        grade: gradeName,
        class: '', // Required by the type
        admissionNumber: student.admissionNumber
      };
    }),
    status: graphqlParent.isActive ? 'active' : 'inactive',
    registrationDate: graphqlParent.createdAt,
    lastContact: '',
    communicationPreferences: {
      sms: true,
      email: !!graphqlParent.email,
      whatsapp: false
    }
  };
}

export const useExactParents = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [directFetchAttempted, setDirectFetchAttempted] = useState(false);
  
  // This function tries to call the API directly using fetch instead of graphql-request
  const tryDirectFetch = async () => {
    if (directFetchAttempted) return; // Prevent loops
    setDirectFetchAttempted(true);
    
    try {
      console.log('Attempting direct fetch to GraphQL API...');
      
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetAllParents {
              getAllParents {
                id
                name
                email
                phone
                address
                occupation
                isActive
                userId
                createdAt
                updatedAt
                students {
                  id
                  admissionNumber
                  firstName
                  lastName
                  grade
                  relationship
                  isPrimary
                }
              }
            }
          `,
          operationName: 'GetAllParents',
          hasTenantId: true
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.data?.getAllParents) {
        const transformedParents = result.data.getAllParents.map(transformGraphQLParent);
        console.log(`Direct fetch succeeded! Retrieved ${transformedParents.length} parents`);
        setParents(transformedParents);
        setError(null);
        setLoading(false);
        return true;
      } else if (result.errors) {
        console.error('Direct fetch returned errors:', result.errors);
        // Keep the existing error message
      } else {
        console.error('Direct fetch failed with no specific error');
      }
    } catch (e: any) {
      console.error('Error during direct fetch:', e);
    }
    
    return false;
  };

  const fetchParents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching parents with the exact GetAllParents query...');
      
      // Get tenant ID if available (might be needed for authorization)
      let tenantId: string | undefined;
      try {
        const configStore = await import('@/lib/stores/useSchoolConfigStore');
        tenantId = configStore.useSchoolConfigStore.getState().config?.tenant?.id;
      } catch (err) {
        console.log('Could not get tenant ID, proceeding without it');
      }
      
      // Log the full query for debugging
      console.log('GraphQL Query:', GET_ALL_PARENTS.toString());
      
      // Make the request with additional headers if needed
      const response = await graphqlClient.request<GetAllParentsResponse>(
        GET_ALL_PARENTS,
        {}, // No variables needed for this query
        tenantId ? {
          'X-Tenant-ID': tenantId,
          'hasTenantId': 'true'
        } : {}
      );
      
      if (response.getAllParents) {
        const transformedParents = response.getAllParents.map(transformGraphQLParent);
        console.log(`Successfully fetched ${transformedParents.length} parents`);
        setParents(transformedParents);
      } else {
        console.log('Query succeeded but returned no parents data');
        setParents([]);
      }
    } catch (err: any) {
      console.error('Error fetching parents:', err);
      
      // Check for GraphQL errors specifically
      if (err.response?.errors) {
        const graphQLErrors = err.response.errors;
        console.error('GraphQL Errors:', JSON.stringify(graphQLErrors, null, 2));
        
        // Interface for GraphQL errors
        interface GraphQLError {
          message: string;
          locations?: { line: number; column: number }[];
          extensions?: { code: string; [key: string]: any };
        }
        
        // Handle specific error types
        if (graphQLErrors.some((e: GraphQLError) => e.message.includes('Cannot query field'))) {
          setError(`The GraphQL API doesn't have the 'getAllParents' query available. Error: ${graphQLErrors[0].message}`);
          
          // Try making a direct fetch to see if this helps
          tryDirectFetch();
        } else if (graphQLErrors.some((e: GraphQLError) => e.extensions?.code === 'UNAUTHENTICATED')) {
          setError('Authentication required to access parent data');
        } else {
          setError(`GraphQL Error: ${graphQLErrors[0].message}`);
        }
      } else {
        setError(`Failed to fetch parents: ${err?.message || 'Unknown error'}`);
      }
      
      setParents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  return {
    parents,
    loading,
    error,
    refetchParents: fetchParents,
    tryDirectFetch // Expose this for manual retry if needed
  };
};
