import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useCurrentAcademicYear,
  type AcademicYear,
  type Term as AcademicYearTerm,
} from "./useAcademicYears";
import { TERM_LIST_SELECTION } from "../graphql/term-fields";

export type SelectedTerm = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
  timetablePublishedAt?: string | null;
  academicYear: {
    name: string;
  };
};

function pickDefaultTerm(terms: SelectedTerm[]): SelectedTerm {
  return (
    terms.find((t) => t.isCurrent) ||
    terms.find((t) => t.isActive) ||
    terms[0]
  );
}

function resolveAcademicYear(
  academicYears: AcademicYear[],
): AcademicYear | null {
  return academicYears.find((y) => y.isActive) || academicYears[0] || null;
}

function mapNestedTerms(
  terms: AcademicYearTerm[],
  year: AcademicYear,
): SelectedTerm[] {
  return terms.map((t) => ({
    id: t.id,
    name: t.name,
    startDate: t.startDate ?? "",
    endDate: t.endDate ?? "",
    isActive: t.isActive ?? false,
    isCurrent: t.isCurrent ?? false,
    academicYear: { name: year.name },
  }));
}

async function fetchTermsForYear(
  academicYearId: string,
): Promise<SelectedTerm[]> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: `
        query GetAllTermsForAcademicYear($academicYearId: ID!) {
          termsByAcademicYear(academicYearId: $academicYearId) {
            ${TERM_LIST_SELECTION}
          }
        }
      `,
      variables: { academicYearId },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch terms");
  }

  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(
      result.errors.map((e: { message: string }) => e.message).join(", "),
    );
  }

  return (result.data?.termsByAcademicYear ?? []) as SelectedTerm[];
}

/**
 * Picks the admin's current term (isCurrent) when none is selected.
 * Waits for the terms API so nested year stubs do not win over isCurrent.
 */
export function useEnsureSelectedTerm(
  selectedTerm: SelectedTerm | null,
  setSelectedTermState: (term: SelectedTerm | null) => void,
) {
  const userPickedRef = useRef(false);

  const setSelectedTerm = useCallback(
    (term: SelectedTerm | null) => {
      userPickedRef.current = term !== null;
      setSelectedTermState(term);
    },
    [setSelectedTermState],
  );

  const { academicYears, loading: yearsLoading } = useCurrentAcademicYear();

  const activeYear = resolveAcademicYear(academicYears);
  const nestedTerms = useMemo(() => {
    if (!activeYear?.terms?.length) return [];
    return mapNestedTerms(activeYear.terms, activeYear);
  }, [activeYear]);

  const { data: fetchedTerms, isLoading: termsLoading } = useQuery({
    queryKey: ["allTerms", activeYear?.id],
    queryFn: () => fetchTermsForYear(activeYear!.id),
    enabled: !!activeYear?.id,
  });

  const availableTerms = useMemo(() => {
    if (fetchedTerms && fetchedTerms.length > 0) return fetchedTerms;
    return nestedTerms;
  }, [fetchedTerms, nestedTerms]);

  useEffect(() => {
    if (yearsLoading) return;
    if (!activeYear?.id) return;

    const hasFetched = !!(fetchedTerms && fetchedTerms.length > 0);
    if (termsLoading && !hasFetched) return;

    const termsToUse = hasFetched ? fetchedTerms! : nestedTerms;
    if (termsToUse.length === 0) return;

    const defaultTerm = pickDefaultTerm(termsToUse);

    if (userPickedRef.current) {
      if (selectedTerm && !termsToUse.some((t) => t.id === selectedTerm.id)) {
        setSelectedTermState(defaultTerm);
      }
      return;
    }

    if (!selectedTerm || selectedTerm.id !== defaultTerm.id) {
      setSelectedTermState(defaultTerm);
    }
  }, [
    selectedTerm,
    yearsLoading,
    termsLoading,
    fetchedTerms,
    nestedTerms,
    activeYear?.id,
    setSelectedTermState,
  ]);

  return {
    activeYear,
    availableTerms,
    termsLoading: yearsLoading || (!!activeYear?.id && termsLoading),
    hasTerms: availableTerms.length > 0,
    setSelectedTerm,
  };
}
