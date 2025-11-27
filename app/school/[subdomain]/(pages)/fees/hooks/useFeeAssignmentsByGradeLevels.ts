"use client"

import { useState } from 'react'
import { FeeAssignmentGroup } from '../types'

interface GetFeeAssignmentsByGradeLevelsInput {
  tenantGradeLevelIds: string[]
  feeStructureId: string
}

interface UseFeeAssignmentsByGradeLevelsResult {
  data: FeeAssignmentGroup[] | null
  loading: boolean
  error: string | null
  fetchAssignments: (input: GetFeeAssignmentsByGradeLevelsInput) => Promise<void>
}

export const useFeeAssignmentsByGradeLevels = (): UseFeeAssignmentsByGradeLevelsResult => {
  const [data, setData] = useState<FeeAssignmentGroup[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAssignments = async (input: GetFeeAssignmentsByGradeLevelsInput) => {
    setLoading(true)
    setError(null)
    console.log('Fetching fee assignments by grade levels:', input)

    try {
      const query = `
        query GetFeeAssignmentsByGradeLevels($input: GetFeeAssignmentsByGradeLevelsInput!) {
          getFeeAssignmentsByGradeLevels(input: $input) {
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
      `

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            input: {
              tenantGradeLevelIds: input.tenantGradeLevelIds,
              feeStructureId: input.feeStructureId,
            },
          },
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

      if (!result.data.getFeeAssignmentsByGradeLevels) {
        console.warn('GraphQL response missing getFeeAssignmentsByGradeLevels field')
        setData([])
        return
      }

      console.log(`Received fee assignments data:`, result.data.getFeeAssignmentsByGradeLevels)
      setData(result.data.getFeeAssignmentsByGradeLevels)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      console.error('Error fetching fee assignments by grade levels:', err)
      setError(errorMessage)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    loading,
    error,
    fetchAssignments,
  }
}

