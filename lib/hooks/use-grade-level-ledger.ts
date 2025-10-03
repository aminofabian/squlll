import { useState, useEffect } from 'react';
import { useHandleGraphQLError } from './useGraphQLErrorHandler';

export interface GradeLevelLedgerEntry {
  date: string;
  description: string;
  balance: number;
}

export interface GradeLevelLedgerStudent {
  studentId: string;
  student: {
    admission_number: string;
    user: {
      name: string;
    };
  };
  summary: {
    totalInvoiced: number;
    totalPaid: number;
    totalBalance: number;
  };
  entries: GradeLevelLedgerEntry[];
}

export interface GradeLevelLedgerData {
  ledgersByGradeLevel: GradeLevelLedgerStudent[];
}

interface UseGradeLevelLedgerProps {
  gradeLevelId: string | null;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  skip?: boolean;
}

interface UseGradeLevelLedgerResult {
  ledgerData: GradeLevelLedgerData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGradeLevelLedger({ 
  gradeLevelId, 
  dateRange, 
  skip = false 
}: UseGradeLevelLedgerProps): UseGradeLevelLedgerResult {
  const [ledgerData, setLedgerData] = useState<GradeLevelLedgerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useHandleGraphQLError();

  const fetchGradeLevelLedger = async () => {
    if (skip || !gradeLevelId) return;
    
    setLoading(true);
    setError(null);

    try {
      console.log('=== useGradeLevelLedger Debug ===');
      console.log('Grade Level ID:', gradeLevelId);
      console.log('Date Range:', dateRange);
      console.log('Making GraphQL request to /api/graphql');

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetGradeLevelLedgers($gradeLevelId: ID!, $dateRange: DateRangeInput!) {
              ledgersByGradeLevel(
                gradeLevelId: $gradeLevelId
                dateRange: $dateRange
              ) {
                studentId
                student {
                  admission_number
                  user {
                    name
                  }
                }
                summary {
                  totalInvoiced
                  totalPaid
                  totalBalance
                }
                entries {
                  date
                  description
                  balance
                }
              }
            }
          `,
          variables: {
            gradeLevelId,
            dateRange
          },
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Raw GraphQL response:', data);

      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        
        // Check if it's an authentication error first
        if (handleError(data)) {
          return; // Error was handled by redirecting to login
        }
        
        throw new Error(data.errors.map((e: any) => e.message).join(', '));
      }

      const ledger = data.data?.ledgersByGradeLevel;
      
      if (ledger) {
        setLedgerData({ ledgersByGradeLevel: ledger });
        console.log('Grade level ledger data set:', ledger);
      } else {
        throw new Error('No ledger data received');
      }
    } catch (err) {
      console.error('Error fetching grade level ledger:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch grade level ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradeLevelLedger();
  }, [gradeLevelId, dateRange.startDate, dateRange.endDate]);

  return {
    ledgerData,
    loading,
    error,
    refetch: fetchGradeLevelLedger
  };
}
