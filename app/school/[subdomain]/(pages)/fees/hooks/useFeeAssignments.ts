"use client"

import { useState, useEffect } from 'react'
import { FeeAssignmentData, FeeAssignmentGroup } from '../types'

interface UseFeeAssignmentsResult {
  data: FeeAssignmentData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  lastFetchTime: Date | null
}

export const useFeeAssignments = (): UseFeeAssignmentsResult => {
  const [data, setData] = useState<FeeAssignmentData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null)

  const fetchFeeAssignments = async () => {
    setLoading(true)
    setError(null)
    console.log('Fetching fee assignments from GraphQL API...')

    try {
      const query = `
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

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
        }),
        cache: 'no-store',
      })

      console.log(`GraphQL response status: ${response.status}`)

      if (!response.ok) {
        throw new Error(`GraphQL request failed with status ${response.status}`)
      }

      const result = await response.json()
      console.log('Raw GraphQL response:', result)
      
      if (result.errors) {
        throw new Error(result.errors.map((e: any) => e.message).join(', '))
      }

      if (!result.data) {
        throw new Error('GraphQL response missing data field')
      }

      if (!result.data.getAllTenantFeeAssignments) {
        console.warn('GraphQL response missing getAllTenantFeeAssignments field')
        setData(null)
        return
      }

      console.log(`Received fee assignments data:`, result.data.getAllTenantFeeAssignments)
      setData(result.data.getAllTenantFeeAssignments)
      setLastFetchTime(new Date())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      console.error('Error fetching fee assignments:', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeeAssignments()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchFeeAssignments,
    lastFetchTime,
  }
}

