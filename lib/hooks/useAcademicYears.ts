import { useState, useEffect } from 'react'

export interface Term {
  id: string
  name: string
}

export interface AcademicYear {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  terms: Term[]
}

interface UseAcademicYearsReturn {
  academicYears: AcademicYear[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getActiveAcademicYear: () => AcademicYear | null
  getTermsForAcademicYear: (academicYearId: string) => Term[]
}

export const useAcademicYears = (): UseAcademicYearsReturn => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAcademicYears = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetAcademicYears {
              academicYears {
                id
                name
                startDate
                endDate
                isActive
                terms {
                  id
                  name
                }
              }
            }
          `,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to fetch academic years')
      }

      setAcademicYears(result.data.academicYears || [])
    } catch (err) {
      console.error('Error fetching academic years:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getActiveAcademicYear = (): AcademicYear | null => {
    return academicYears.find(year => year.isActive) || null
  }

  const getTermsForAcademicYear = (academicYearId: string): Term[] => {
    const academicYear = academicYears.find(year => year.id === academicYearId)
    return academicYear?.terms || []
  }

  useEffect(() => {
    fetchAcademicYears()
  }, [])

  return {
    academicYears,
    loading,
    error,
    refetch: fetchAcademicYears,
    getActiveAcademicYear,
    getTermsForAcademicYear
  }
}

// Alias for backward compatibility
export const useCurrentAcademicYear = useAcademicYears