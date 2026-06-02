import { useCallback, useEffect, useState } from "react";
import { graphqlClient } from "@/lib/graphql-client";

export type ArrearsAgingCategory =
  | "CURRENT"
  | "DAYS_30"
  | "DAYS_60"
  | "DAYS_90";

export interface ArrearsAgingBucket {
  category: ArrearsAgingCategory;
  amount: number;
}

export interface GradeArrearsSummary {
  gradeLevelId: string;
  gradeLevelName: string;
  studentCount: number;
  studentsWithArrears: number;
  totalArrears: number;
  totalCredit: number;
}

export interface SchoolArrearsSummary {
  totalBilled: number;
  totalPaid: number;
  totalArrears: number;
  totalCredit: number;
  studentsWithArrears: number;
  aging: ArrearsAgingBucket[];
  byGrade: GradeArrearsSummary[];
}

const GET_SCHOOL_ARREARS_SUMMARY = `
  query SchoolArrearsSummary {
    schoolArrearsSummary {
      totalBilled
      totalPaid
      totalArrears
      totalCredit
      studentsWithArrears
      aging {
        category
        amount
      }
      byGrade {
        gradeLevelId
        gradeLevelName
        studentCount
        studentsWithArrears
        totalArrears
        totalCredit
      }
    }
  }
`;

interface UseSchoolArrearsSummaryReturn {
  summary: SchoolArrearsSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSchoolArrearsSummary = (): UseSchoolArrearsSummaryReturn => {
  const [summary, setSummary] = useState<SchoolArrearsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await graphqlClient.request<{
        schoolArrearsSummary: SchoolArrearsSummary;
      }>(GET_SCHOOL_ARREARS_SUMMARY);

      setSummary(response.schoolArrearsSummary ?? null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load arrears summary";
      setError(message);
      console.error("Error fetching school arrears summary:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
};
