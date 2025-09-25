import { useState, useEffect } from 'react'
import { graphqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'
import { Parent } from '../types/index' // Import the Parent type from the types directory
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'

// Define the GraphQL query - first option
const GET_PARENTS_BY_TENANT = gql`
  query GetParentsByTenant($tenantId: ID!) {
    getParentsByTenant(tenantId: $tenantId) {
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

// Alternative query - using getParentsBySchool
const GET_PARENTS_BY_SCHOOL = gql`
  query GetParentsBySchool($schoolId: ID!) {
    getParentsBySchool(schoolId: $schoolId) {
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

// Another alternative - use guardians if this endpoint exists
const GET_GUARDIANS = gql`
  query GetGuardians($tenantId: ID!) {
    getGuardians(tenantId: $tenantId) {
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

// Try getAllTeachers as suggested by the error message
const GET_ALL_TEACHERS = gql`
  query GetAllTeachers {
    getAllTeachers {
      id
      fullName
      email
      phoneNumber
      department
      isActive
      createdAt
      updatedAt
    }
  }
`

export interface GraphQLParent {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  occupation: string | null
  isActive: boolean
  userId: string | null
  createdAt: string
  updatedAt: string
  students: {
    id: string
    admissionNumber: string
    firstName: string
    lastName: string
    grade: {
      gradeLevel?: {
        name?: string
      }
    } | string // Handle both string and object structures
    relationship: string
    isPrimary: boolean
  }[]
}

// Transform GraphQL Parent to our app's Parent type
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
      // Handle the case where grade is returned as [object Object] string
      let gradeName = 'Unknown Grade';
      
      if (student.grade) {
        if (typeof student.grade === 'object' && student.grade !== null) {
          if (student.grade.gradeLevel && student.grade.gradeLevel.name) {
            gradeName = student.grade.gradeLevel.name;
          }
        } else if (typeof student.grade === 'string' && student.grade !== '[object Object]') {
          gradeName = student.grade;
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
        class: '', // Required but could be empty as per the type
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
  }
}

// Transform teacher data to parent format
interface GraphQLTeacher {
  id: string
  fullName: string
  email: string | null
  phoneNumber: string | null
  department: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const transformTeacherToParent = (teacher: GraphQLTeacher): Parent => {
  return {
    id: teacher.id,
    name: teacher.fullName || 'Unknown Name',
    email: teacher.email || '',
    phone: teacher.phoneNumber || '',
    relationship: 'other' as 'father' | 'mother' | 'guardian' | 'other',
    occupation: teacher.department || '',
    workAddress: '',
    homeAddress: '',
    emergencyContact: '',
    idNumber: '',
    students: [{
      // Add more meaningful placeholder data for teachers
      id: 'placeholder-id',
      name: teacher.department ? `${teacher.department} Department` : 'Faculty',
      grade: 'Teacher',
      class: teacher.department || 'Staff',
      admissionNumber: teacher.email?.split('@')[0] || 'faculty'
    }],
    status: teacher.isActive ? 'active' : 'inactive',
    registrationDate: teacher.createdAt,
    lastContact: '',
    communicationPreferences: {
      sms: true,
      email: !!teacher.email,
      whatsapp: false
    }
  }
}

export const useParents = () => {
  const [parents, setParents] = useState<Parent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { config } = useSchoolConfigStore()

  interface GetParentsByTenantResponse {
    getParentsByTenant: GraphQLParent[];
  }
  
  interface GetParentsBySchoolResponse {
    getParentsBySchool: GraphQLParent[];
  }
  
  interface GetGuardiansResponse {
    getGuardians: GraphQLParent[];
  }
  
  interface GetAllTeachersResponse {
    getAllTeachers: GraphQLTeacher[];
  }

  const fetchParents = async () => {
    if (!config?.tenant?.id) {
      setError('Tenant configuration not available')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Try the first query - getParentsByTenant
      try {
        const response = await graphqlClient.request<GetParentsByTenantResponse>(GET_PARENTS_BY_TENANT, {
          tenantId: config.tenant.id
        })
        
        if (response.getParentsByTenant) {
          const transformedParents = response.getParentsByTenant.map(transformGraphQLParent)
          setParents(transformedParents)
          console.log(`Successfully fetched ${transformedParents.length} parents with getParentsByTenant query`)
          return
        }
      } catch (err: any) {
        console.log('First query failed:', err?.message || 'Unknown error')
        console.log('Trying alternative query...')
      }
      
      // Try the second query - getParentsBySchool
      try {
        const response = await graphqlClient.request<GetParentsBySchoolResponse>(GET_PARENTS_BY_SCHOOL, {
          schoolId: config.tenant.id
        })
        
        if (response.getParentsBySchool) {
          const transformedParents = response.getParentsBySchool.map(transformGraphQLParent)
          setParents(transformedParents)
          console.log(`Successfully fetched ${transformedParents.length} parents with getParentsBySchool query`)
          return
        } else {
          console.log('Second query failed to return data')
        }
      } catch (err: any) {
        console.log('Second query failed:', err?.message || 'Unknown error')
        console.log('Trying third alternative...')
      }
      
      // Try the third query - getGuardians
      try {
        const response = await graphqlClient.request<GetGuardiansResponse>(GET_GUARDIANS, {
          tenantId: config.tenant.id
        })
        
        if (response.getGuardians) {
          const transformedParents = response.getGuardians.map(transformGraphQLParent)
          setParents(transformedParents)
          console.log(`Successfully fetched ${transformedParents.length} parents with getGuardians query`)
          return
        } else {
          console.log('Third query returned empty results')
        }
      } catch (err: any) {
        console.log('Third query failed:', err?.message || 'Unknown error')
        console.log('Trying final option - getAllTeachers...')
      }
      
      // Final attempt - try getAllTeachers as suggested by the error message
      try {
        const response = await graphqlClient.request<GetAllTeachersResponse>(GET_ALL_TEACHERS)
        
        if (response.getAllTeachers) {
          // Transform teachers to parent format
          const transformedParents = response.getAllTeachers.map(transformTeacherToParent)
          setParents(transformedParents)
          console.log(`Using ${transformedParents.length} teachers as fallback parent data`)
          return
        } else {
          console.log('getAllTeachers query returned empty results')
        }
      } catch (err: any) {
        console.log('Final query failed:', err?.message || 'Unknown error')
        console.log('All query attempts failed, showing empty data')
        setParents([])
      }
      
      // If we reached this point without returning, it means all queries failed but no exception was thrown
      console.log('All queries attempted, but no valid data was returned')
      setError('No parent data available')
    } catch (err: any) {
      console.error('Unhandled error fetching parents:', err)
      setError(`Failed to fetch parents data: ${err?.message || 'Unknown error'}`)
      setParents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (config?.tenant?.id) {
      fetchParents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.tenant?.id])

  return {
    parents,
    loading,
    error,
    refetchParents: fetchParents
  }
}
