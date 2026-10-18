"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  fetchExamSessionRankings,
  type ExamSessionRankingRow,
} from "@/lib/exams/examSessions";
import { useExamSessions } from "@/lib/hooks/useExamSessions";
import {
  computeClassPerformance,
  type ClassPerformance,
} from "../utils/classPulse";

export interface ClassPerformanceResult extends ClassPerformance {
  sessionId: string | null;
  sessionName: string | null;
  isLoading: boolean;
  isError: boolean;
  hasAnySession: boolean;
}

/**
 * Latest merit list for a class. We prefer a published session (what parents
 * see); otherwise fall back to the most recent session with processed marks.
 */
export function useClassPerformance(
  gradeId: string,
  streamId?: string | null,
  streamName?: string | null,
): ClassPerformanceResult {
  const params = useParams<{ subdomain?: string }>();
  const subdomain = (params?.subdomain as string) || "";

  const sessionsQuery = useExamSessions(
    gradeId ? { tenantGradeLevelId: gradeId } : undefined,
    { enabled: Boolean(gradeId && subdomain) },
  );

  const session = useMemo(() => {
    const list = sessionsQuery.data ?? [];
    if (list.length === 0) return null;
    const sorted = [...list].sort((a, b) => {
      const at = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
      const bt = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
      return bt - at;
    });
    return sorted.find((s) => s.resultsPublished) ?? sorted[0] ?? null;
  }, [sessionsQuery.data]);

  const rankingsQuery = useQuery<ExamSessionRankingRow[]>({
    queryKey: [
      "class-merit-list",
      subdomain,
      session?.id ?? null,
      gradeId,
      streamId ?? null,
    ],
    queryFn: () =>
      fetchExamSessionRankings(subdomain, session!.id, {
        tenantGradeLevelId: gradeId,
        streamId: streamId || undefined,
      }),
    enabled: Boolean(subdomain && session?.id),
    staleTime: 60_000,
  });

  const performance = useMemo(
    () =>
      computeClassPerformance(rankingsQuery.data ?? [], {
        streamName: streamName ?? null,
        limit: 6,
      }),
    [rankingsQuery.data, streamName],
  );

  return {
    ...performance,
    sessionId: session?.id ?? null,
    sessionName: session?.name ?? null,
    isLoading: sessionsQuery.isLoading || rankingsQuery.isLoading,
    isError: sessionsQuery.isError || rankingsQuery.isError,
    hasAnySession: (sessionsQuery.data?.length ?? 0) > 0,
  };
}
