import { useState, useEffect } from 'react'

export interface FeeBucket {
  id: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
}

interface UseFeeBucketsReturn {
  feeBuckets: FeeBucket[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useFeeBuckets = (): UseFeeBucketsReturn => {
  const [feeBuckets, setFeeBuckets] = useState<FeeBucket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeeBuckets = async () => {
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
            query GetFeeBuckets {
              feeBuckets {
                id
                name
                description
                isActive
                createdAt
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
        throw new Error(result.errors[0]?.message || 'Failed to fetch fee buckets')
      }

      setFeeBuckets(result.data.feeBuckets || [])
    } catch (err) {
      console.error('Error fetching fee buckets:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeeBuckets()
  }, [])

  return {
    feeBuckets,
    loading,
    error,
    refetch: fetchFeeBuckets
  }
}
