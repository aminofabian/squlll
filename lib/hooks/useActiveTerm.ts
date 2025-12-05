import { useState, useEffect } from 'react';
import { useCurrentAcademicYear } from './useAcademicYears';

interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  academicYear: {
    name: string;
  };
}

interface UseActiveTermResult {
  activeTerm: Term | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch the active term for the current academic year
 * This doesn't require TermProvider, so it can be used in student/parent pages
 */
export function useActiveTerm(): UseActiveTermResult {
  const [activeTerm, setActiveTerm] = useState<Term | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { academicYears, loading: academicYearLoading, getActiveAcademicYear } = useCurrentAcademicYear();
  const currentAcademicYear = getActiveAcademicYear();

  const fetchActiveTerm = async () => {
    if (!currentAcademicYear?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            query GetTermsForAcademicYear($academicYearId: ID!) {
              termsByAcademicYear(academicYearId: $academicYearId) {
                id
                name
                startDate
                endDate
                isActive
                academicYear {
                  name
                }
              }
            }
          `,
          variables: { academicYearId: currentAcademicYear.id },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      const terms = data.data?.termsByAcademicYear || [];
      
      // Find active term, or fall back to first term
      const term = terms.find((t: Term) => t.isActive) || terms[0] || null;
      
      setActiveTerm(term);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch active term';
      setError(errorMessage);
      console.error('Error fetching active term:', err);
      setActiveTerm(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!academicYearLoading && currentAcademicYear?.id) {
      fetchActiveTerm();
    } else if (!academicYearLoading && !currentAcademicYear) {
      setLoading(false);
    }
  }, [academicYearLoading, currentAcademicYear?.id]);

  return {
    activeTerm,
    loading: loading || academicYearLoading,
    error,
    refetch: fetchActiveTerm,
  };
}

