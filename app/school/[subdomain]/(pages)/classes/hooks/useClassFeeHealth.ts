"use client";

import { useMemo } from "react";
import { useGradeLevelFeeSummary } from "@/lib/hooks/useGradeLevelFeeSummary";
import { computeFeeHealth } from "../utils/classPulse";

/**
 * Fee health for a class. The API returns a grade-wide fee summary, so we
 * narrow it to the class roster (admission numbers) before computing totals.
 */
export function useClassFeeHealth(
  gradeId: string,
  rosterAdmissions: string[],
) {
  const query = useGradeLevelFeeSummary(gradeId || null);
  const admissionsKey = rosterAdmissions.join("|");

  const health = useMemo(() => {
    const admissions = admissionsKey
      ? admissionsKey.split("|").filter(Boolean)
      : [];
    return computeFeeHealth(query.data?.students ?? [], {
      admissions,
      limit: 3,
    });
  }, [query.data, admissionsKey]);

  return {
    health,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
