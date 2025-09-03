import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface TenantStatistics {
  studentCount: number;
  teacherCount: number;
  streamCount: number;
  totalCount: number;
}

interface GetTenantStatisticsResponse {
  getTenantStatistics: string; // JSON string format
}

export function useTenantStatistics(enabled: boolean = true) {
  const [statistics, setStatistics] = useState<TenantStatistics | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const query = useQuery({
    queryKey: ['tenantStatistics'],
    queryFn: async () => {
      // Only run on client side
      if (typeof window === 'undefined') {
        throw new Error('useTenantStatistics can only be used on the client side');
      }

      setError(null);

      try {
        console.log('=== useTenantStatistics Debug ===');
        console.log('Making GraphQL request to /api/graphql');
        console.log('Query: getTenantStatistics');

        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetTenantStatistics {
                getTenantStatistics
              }
            `,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Raw GraphQL response:', result);

        if (result.errors) {
          throw new Error(result.errors.map((e: any) => e.message).join(', '));
        }

        const data = result.data as GetTenantStatisticsResponse;
        
        if (!data?.getTenantStatistics) {
          throw new Error('No statistics data received');
        }

        // Parse the JSON string response
        let parsedStats: TenantStatistics;
        try {
          parsedStats = JSON.parse(data.getTenantStatistics);
          console.log('Parsed statistics:', parsedStats);
        } catch (parseError) {
          console.error('Failed to parse statistics JSON:', data.getTenantStatistics);
          throw new Error('Invalid statistics data format');
        }

        setStatistics(parsedStats);
        return parsedStats;

      } catch (error) {
        console.error('Error fetching tenant statistics:', error);
        const errorObj = error instanceof Error ? error : new Error('Unknown error');
        setError(errorObj);
        throw errorObj;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    data: statistics,
    isLoading: query.isLoading,
    error: error || query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
  };
}
