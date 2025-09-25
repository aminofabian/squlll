import { useState, useEffect } from 'react'
import { graphqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'

// Define staff query
const GET_ALL_STAFF = gql`
  query GetAllStaff {
    getAllStaff {
      id
      fullName
      firstName
      lastName
      email
      phoneNumber
      gender
      role
      status
      employeeId
      nationalId
      dateOfBirth
      dateOfJoining
      address
      emergencyContact
      emergencyContactPhone
      salary
      bankAccount
      bankName
      department
      supervisor
      jobDescription
      qualifications
      workExperience
      isActive
      hasCompletedProfile
      userId
      createdAt
      updatedAt
    }
  }
`

// Response type for the GraphQL query
interface GetAllStaffResponse {
  getAllStaff: Staff[];
}

// Define the Staff type based on the GraphQL response
export interface Staff {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  gender: string | null;
  role: string | null;
  status: string | null;
  employeeId: string | null;
  nationalId: string | null;
  dateOfBirth: string | null;
  dateOfJoining: string | null;
  address: string | null;
  emergencyContact: string | null;
  emergencyContactPhone: string | null;
  salary: number | null;
  bankAccount: string | null;
  bankName: string | null;
  department: string | null;
  supervisor: string | null;
  jobDescription: string | null;
  qualifications: string | null;
  workExperience: string | null;
  isActive: boolean;
  hasCompletedProfile: boolean;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Transform function (if needed in future)
const transformStaffData = (staff: Staff): Staff => {
  // For now we're just returning the staff data as is
  // But this function can be expanded to transform the data if needed
  
  // Filter out 'amino' as lastName which is likely coming from the subdomain
  if (staff.lastName && (
    staff.lastName === 'amino' || 
    staff.lastName.toLowerCase() === 'amino'
  )) {
    return {
      ...staff,
      lastName: '',
      fullName: staff.firstName // Update fullName to exclude 'amino'
    }
  }
  
  return staff;
}

export const useStaff = () => {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStaff = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching staff data...')
      
      // Try to get tenant ID if available
      let tenantId: string | undefined;
      try {
        const configStore = await import('@/lib/stores/useSchoolConfigStore');
        tenantId = configStore.useSchoolConfigStore.getState().config?.tenant?.id;
      } catch (err) {
        console.log('Could not get tenant ID, proceeding without it');
      }
      
      // Make GraphQL request with optional tenant headers
      const response = await graphqlClient.request<GetAllStaffResponse>(
        GET_ALL_STAFF,
        {}, // No variables needed
        tenantId ? {
          'X-Tenant-ID': tenantId,
          'hasTenantId': 'true'
        } : {}
      )
      
      if (response.getAllStaff) {
        // Transform the data if needed
        const transformedStaff = response.getAllStaff.map(transformStaffData)
        console.log(`Successfully fetched ${transformedStaff.length} staff members`)
        setStaff(transformedStaff)
      } else {
        console.log('Query succeeded but returned no staff data')
        setStaff([])
      }
    } catch (err: any) {
      console.error('Error fetching staff:', err)
      
      // Handle GraphQL specific errors
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
          setError(`The GraphQL API doesn't have the 'getAllStaff' query available. Error: ${graphQLErrors[0].message}`);
        } else if (graphQLErrors.some((e: GraphQLError) => e.extensions?.code === 'UNAUTHENTICATED')) {
          setError('Authentication required to access staff data');
        } else {
          setError(`GraphQL Error: ${graphQLErrors[0].message}`);
        }
      } else {
        setError(`Failed to fetch staff: ${err?.message || 'Unknown error'}`);
      }
      
      setStaff([])
    } finally {
      setLoading(false)
    }
  }

  // Try direct fetch with fetch API
  const tryDirectFetch = async () => {
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
            query GetAllStaff {
              getAllStaff {
                id
                fullName
                firstName
                lastName
                email
                phoneNumber
                gender
                role
                status
                employeeId
                nationalId
                dateOfBirth
                dateOfJoining
                address
                emergencyContact
                emergencyContactPhone
                salary
                bankAccount
                bankName
                department
                supervisor
                jobDescription
                qualifications
                workExperience
                isActive
                hasCompletedProfile
                userId
                createdAt
                updatedAt
              }
            }
          `,
          operationName: 'GetAllStaff',
          hasTenantId: true
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.data?.getAllStaff) {
        const transformedStaff = result.data.getAllStaff.map(transformStaffData);
        console.log(`Direct fetch succeeded! Retrieved ${transformedStaff.length} staff members`);
        setStaff(transformedStaff);
        setError(null);
        setLoading(false);
        return true;
      } else if (result.errors) {
        console.error('Direct fetch returned errors:', result.errors);
        // Keep existing error message
      } else {
        console.error('Direct fetch failed with no specific error');
      }
    } catch (e: any) {
      console.error('Error during direct fetch:', e);
    }
    
    return false;
  };

  useEffect(() => {
    fetchStaff()
  }, [])

  return {
    staff,
    loading,
    error,
    refetchStaff: fetchStaff,
    tryDirectFetch
  }
}

// Add helper functions for the staff UI
export const getRoleBadgeColor = (role: string | null): string => {
  if (!role) return 'bg-gray-100 text-gray-800 border-gray-200';
  
  switch (role.toUpperCase()) {
    case 'TEACHER':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'PRINCIPAL':
    case 'HEADTEACHER':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'ACCOUNTANT':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'SECRETARY':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'ADMIN':
    case 'SCHOOL_ADMIN':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'LIBRARIAN':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'COUNSELOR':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'IT_SUPPORT':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'NURSE':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusBadgeColor = (status: string | null): string => {
  if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
  
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'ON_LEAVE':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'SUSPENDED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'PROBATION':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getDepartmentBadgeColor = (department: string | null): string => {
  if (!department) return 'bg-gray-100 text-gray-800 border-gray-200';
  
  switch (department.toLowerCase()) {
    case 'finance':
    case 'accounting':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'administration':
    case 'admin':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'teaching':
    case 'academic':
    case 'education':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'it':
    case 'technology':
    case 'ict':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'library':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'health':
    case 'medical':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'counseling':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'maintenance':
      return 'bg-slate-100 text-slate-800 border-slate-200';
    case 'security':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
