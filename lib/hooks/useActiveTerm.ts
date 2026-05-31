import { useState, useEffect } from 'react';
import { useCurrentAcademicYear } from './useAcademicYears';
import { TERM_LIST_SELECTION } from '../graphql/term-fields';

interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
  academicYear: {
    name: string;
  };
}

function pickSchoolCurrentTerm(terms: Term[]): Term | null {
  return (
    terms.find((t) => t.isCurrent) ||
    terms.find((t) => t.isActive) ||
    terms[0] ||
    null
  );
}

interface UseActiveTermResult {
  activeTerm: Term | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch the school's current term for the active academic year.
 * Uses the same selection as admin (isCurrent), then isActive, then first term.
 * Usable on student/parent pages without TermProvider.
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
                ${TERM_LIST_SELECTION}
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

      const terms = (data.data?.termsByAcademicYear || []) as Term[];
      setActiveTerm(pickSchoolCurrentTerm(terms));
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

