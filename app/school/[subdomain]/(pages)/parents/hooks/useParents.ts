import { useState, useEffect } from 'react'
import { graphqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'
import { Parent } from '../types'
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
      
      return {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        grade: gradeName,
        class: '',
        stream: '',
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
          return
        }
      } catch (err) {
        console.log('First query failed, trying alternative query...')
      }
      
      // Try the second query - getParentsBySchool
      try {
        const response = await graphqlClient.request<GetParentsBySchoolResponse>(GET_PARENTS_BY_SCHOOL, {
          schoolId: config.tenant.id
        })
        
        if (response.getParentsBySchool) {
          const transformedParents = response.getParentsBySchool.map(transformGraphQLParent)
          setParents(transformedParents)
          return
        }
      } catch (err) {
        console.log('Second query failed, trying final alternative...')
      }
      
      // Try the third query - getGuardians
      const response = await graphqlClient.request<GetGuardiansResponse>(GET_GUARDIANS, {
        tenantId: config.tenant.id
      })
      
      if (response.getGuardians) {
        const transformedParents = response.getGuardians.map(transformGraphQLParent)
        setParents(transformedParents)
      } else {
        setParents([])
      }
      
      setError(null)
    } catch (err) {
      console.error('Error fetching parents:', err)
      setError('Failed to fetch parents data')
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
