import { useState, useEffect } from 'react'
import { graphqlClient } from '@/lib/graphql-client'
import { StudentSummaryFromAPI } from '../types'

const GET_ALL_STUDENTS_SUMMARY = `
  query GetAllStudentsSummary {
    allStudentsSummary {
      id
      admissionNumber
      studentName
      gradeLevelName
      feeSummary {
        totalOwed
        totalPaid
        balance
        numberOfFeeItems
      }
    }
  }
`

interface UseAllStudentsSummaryReturn {
  students: StudentSummaryFromAPI[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useAllStudentsSummary = (): UseAllStudentsSummaryReturn => {
  const [students, setStudents] = useState<StudentSummaryFromAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await graphqlClient.request<{ allStudentsSummary: StudentSummaryFromAPI[] }>(
        GET_ALL_STUDENTS_SUMMARY
      )

      setStudents(response.allStudentsSummary || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch students summary'
      setError(errorMessage)
      console.error('Error fetching all students summary:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
  }
}

