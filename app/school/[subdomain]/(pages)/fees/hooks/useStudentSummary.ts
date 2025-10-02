import { useState, useEffect } from 'react'
import { graphqlClient } from '@/lib/graphql-client'
import { StudentSummaryDetail, FeeItem } from '../types'

const GET_STUDENT_SUMMARY = `
  query GetStudentSummary($studentId: ID!) {
    studentSummary(studentId: $studentId) {
      id
      admissionNumber
      studentName
      email
      phone
      gender
      schoolType
      gradeLevelName
      curriculumName
      streamName
      feeSummary {
        totalOwed
        totalPaid
        balance
        numberOfFeeItems
        feeItems {
          id
          feeBucketName
          amount
          isMandatory
          feeStructureName
          academicYearName
        }
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

interface GetStudentSummaryResponse {
  studentSummary: StudentSummaryDetail
}

export const useStudentSummary = (studentId: string | null) => {
  const [studentData, setStudentData] = useState<StudentSummaryDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) {
      setStudentData(null)
      return
    }

    const fetchStudentSummary = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await graphqlClient.request<GetStudentSummaryResponse>(
          GET_STUDENT_SUMMARY,
          { studentId }
        )

        console.log('GraphQL Response:', response)
        console.log('Student Summary:', response.studentSummary)

        if (response.studentSummary) {
          setStudentData(response.studentSummary)
        } else {
          console.log('No studentSummary found in response')
          setError('No student data found')
        }
      } catch (err: any) {
        console.error('Error fetching student summary:', err)
        
        // Handle different types of errors
        if (err.response?.errors) {
          const error = err.response.errors[0]
          const errorMessage = error?.message || 'GraphQL error occurred'
          
          // Handle specific error types
          if (error?.extensions?.code === 'UNAUTHORIZEDEXCEPTION') {
            setError('Authentication required. Please log in again.')
          } else if (error?.extensions?.code === 'FORBIDDENEXCEPTION') {
            setError('Access denied. You do not have permission to view this student.')
          } else if (errorMessage.includes('Student not found')) {
            setError('Student not found. Please check the student ID.')
          } else {
            setError(errorMessage)
          }
        } else if (err.message) {
          setError(err.message)
        } else {
          setError('Failed to fetch student data. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStudentSummary()
  }, [studentId])

  return {
    studentData,
    loading,
    error,
    refetch: () => {
      if (studentId) {
        const fetchStudentSummary = async () => {
          setLoading(true)
          setError(null)

          try {
            const response = await graphqlClient.request<GetStudentSummaryResponse>(
              GET_STUDENT_SUMMARY,
              { studentId }
            )

            if (response.studentSummary) {
              setStudentData(response.studentSummary)
            } else {
              setError('No student data found')
            }
          } catch (err: any) {
            console.error('Error fetching student summary:', err)
            
            // Handle different types of errors
            if (err.response?.errors) {
              const error = err.response.errors[0]
              const errorMessage = error?.message || 'GraphQL error occurred'
              
              // Handle specific error types
              if (error?.extensions?.code === 'UNAUTHORIZEDEXCEPTION') {
                setError('Authentication required. Please log in again.')
              } else if (error?.extensions?.code === 'FORBIDDENEXCEPTION') {
                setError('Access denied. You do not have permission to view this student.')
              } else if (errorMessage.includes('Student not found')) {
                setError('Student not found. Please check the student ID.')
              } else {
                setError(errorMessage)
              }
            } else if (err.message) {
              setError(err.message)
            } else {
              setError('Failed to fetch student data. Please try again.')
            }
          } finally {
            setLoading(false)
          }
        }

        fetchStudentSummary()
      }
    }
  }
}
