import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useCurrentAcademicYear,
  type AcademicYear,
  type Term as AcademicYearTerm,
} from "./useAcademicYears";

export type SelectedTerm = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  timetablePublishedAt?: string | null;
  academicYear: {
    name: string;
  };
};

function resolveAcademicYear(academicYears: AcademicYear[]): AcademicYear | null {
  return academicYears.find((y) => y.isActive) || academicYears[0] || null;
}

function mapNestedTerms(
  terms: AcademicYearTerm[],
  year: AcademicYear,
): SelectedTerm[] {
  return terms.map((t) => ({
    id: t.id,
    name: t.name,
    startDate: "",
    endDate: "",
    isActive: false,
    academicYear: { name: year.name },
  }));
}

async function fetchTermsForYear(academicYearId: string): Promise<SelectedTerm[]> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: `
        query GetAllTermsForAcademicYear($academicYearId: ID!) {
          termsByAcademicYear(academicYearId: $academicYearId) {
            id
            name
            startDate
            endDate
            isActive
            timetablePublishedAt
            academicYear {
              name
            }
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
 * Picks the active term (or first) for the current school year when none is selected.
 * Uses nested academic-year terms immediately, then refreshes from the API.
 */
export function useEnsureSelectedTerm(
  selectedTerm: SelectedTerm | null,
  setSelectedTerm: (term: SelectedTerm | null) => void,
) {
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
    if (selectedTerm || yearsLoading) return;

    if (availableTerms.length === 0) return;

    const active = availableTerms.find((t) => t.isActive) || availableTerms[0];
    setSelectedTerm(active);
  }, [
    selectedTerm,
    yearsLoading,
    availableTerms,
    setSelectedTerm,
  ]);

  return {
    activeYear,
    availableTerms,
    termsLoading: yearsLoading || (!!activeYear?.id && termsLoading),
    hasTerms: availableTerms.length > 0,
  };
}
