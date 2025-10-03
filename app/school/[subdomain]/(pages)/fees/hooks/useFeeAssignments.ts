"use client"

import { useState, useEffect } from 'react'
import { useQuery, gql } from '@apollo/client'
import { FeeAssignmentData } from '../types'

const GET_ALL_TENANT_FEE_ASSIGNMENTS = gql`
  query GetAllTenantFeeAssignments {
    getAllTenantFeeAssignments {
      tenantId
      totalFeeAssignments
      totalStudentsWithFees
      feeAssignments {
        feeAssignment {
          id
          feeStructureId
          description
          studentsAssignedCount
          isActive
          createdAt
          updatedAt
          feeStructure {
            id
            name
          }
          assignedByUser {
            id
            name
          }
        }
        studentAssignments {
          id
          studentId
          isActive
          createdAt
          student {
            id
            user {
              name
            }
            grade {
              id
              gradeLevel {
                id
                name
              }
            }
          }
          feeItems {
            id
            amount
            isMandatory
            isActive
            feeStructureItem {
              id
              amount
            }
          }
        }
        totalStudents
      }
    }
  }
`

interface UseFeeAssignmentsResult {
  data: FeeAssignmentData | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

export const useFeeAssignments = (): UseFeeAssignmentsResult => {
  const { data, loading, error, refetch } = useQuery(
    GET_ALL_TENANT_FEE_ASSIGNMENTS,
    {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    }
  )

  const [processedData, setProcessedData] = useState<FeeAssignmentData | null>(null)

  useEffect(() => {
    if (error) {
      console.error('GraphQL Error fetching fee assignments:', error)
    }
    
    if (data?.getAllTenantFeeAssignments) {
      console.log('Fee assignments data received:', data.getAllTenantFeeAssignments)
      setProcessedData(data.getAllTenantFeeAssignments)
    } else if (data) {
      console.warn('Data received but getAllTenantFeeAssignments is null/undefined:', data)
    }
  }, [data, error])

  return {
    data: processedData,
    loading,
    error: error as Error | null,
    refetch: () => {
      refetch()
    },
  }
}

