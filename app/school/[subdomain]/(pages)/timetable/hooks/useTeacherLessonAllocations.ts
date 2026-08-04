"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  TeacherLessonAllocation,
  TeacherWorkloadRules,
  GenerateTimetableResult,
  TimetablePreflightResult,
} from "@/lib/types/timetable-allocation";

function clientAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const headers: Record<string, string> = {};
  try {
    const token = window.localStorage.getItem("accessToken");
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {
    /* ignore */
  }
  const cookie = typeof document !== "undefined" ? document.cookie : "";
  const tenantId = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("tenantId="))
    ?.slice("tenantId=".length);
  if (tenantId) headers["x-tenant-id"] = decodeURIComponent(tenantId);
  return headers;
}

async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...clientAuthHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });
  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(result.errors.map((e: { message: string }) => e.message).join("\n"));
  }
  return result.data as T;
}

const ALLOCATION_FIELDS = `
  id termId teacherId subjectId gradeLevelId streamId lessonsPerWeek preferredDoubleLessons
`;

const RULES_FIELDS = `
  id termId teacherId totalLessonsPerWeek maxLessonsPerDay minLessonsPerDay
  doubleLessonsPerWeek maxConsecutiveLessons minFreePeriodsPerDay
  preferredDays avoidDays preferredPeriodNumbers avoidPeriodNumbers
  preferredTimeOfDay
  unavailableSlots { dayOfWeek periodNumber }
`;

export function useTeacherLessonAllocations(termId: string | null | undefined) {
  const [allocations, setAllocations] = useState<TeacherLessonAllocation[]>([]);
  const [rules, setRules] = useState<TeacherWorkloadRules[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!termId) {
      setAllocations([]);
      setRules([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await gql<{
        teacherLessonAllocations: TeacherLessonAllocation[];
        teacherWorkloadRules: TeacherWorkloadRules[];
      }>(
        `query AllocationsAndRules($termId: ID!) {
          teacherLessonAllocations(termId: $termId) { ${ALLOCATION_FIELDS} }
          teacherWorkloadRules(termId: $termId) { ${RULES_FIELDS} }
        }`,
        { termId },
      );
      setAllocations(data.teacherLessonAllocations ?? []);
      setRules(data.teacherWorkloadRules ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load allocations");
    } finally {
      setLoading(false);
    }
  }, [termId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createAllocation = useCallback(
    async (input: {
      termId: string;
      teacherId: string;
      subjectId: string;
      gradeLevelId: string;
      streamId?: string;
      lessonsPerWeek: number;
      preferredDoubleLessons?: number;
    }) => {
      await gql(
        `mutation CreateAlloc($input: CreateTeacherLessonAllocationInput!) {
          createTeacherLessonAllocation(input: $input) { id }
        }`,
        { input },
      );
      await reload();
    },
    [reload],
  );

  const updateAllocation = useCallback(
    async (input: {
      id: string;
      lessonsPerWeek?: number;
      preferredDoubleLessons?: number;
      streamId?: string | null;
    }) => {
      await gql(
        `mutation UpdateAlloc($input: UpdateTeacherLessonAllocationInput!) {
          updateTeacherLessonAllocation(input: $input) { id }
        }`,
        { input },
      );
      await reload();
    },
    [reload],
  );

  const deleteAllocation = useCallback(
    async (id: string) => {
      await gql(
        `mutation DeleteAlloc($id: ID!) { deleteTeacherLessonAllocation(id: $id) }`,
        { id },
      );
      await reload();
    },
    [reload],
  );

  const upsertRules = useCallback(
    async (input: Partial<TeacherWorkloadRules> & { termId: string; teacherId: string }) => {
      const {
        termId: tId,
        teacherId,
        totalLessonsPerWeek,
        maxLessonsPerDay,
        minLessonsPerDay,
        doubleLessonsPerWeek,
        maxConsecutiveLessons,
        minFreePeriodsPerDay,
        preferredDays,
        avoidDays,
        preferredPeriodNumbers,
        avoidPeriodNumbers,
        preferredTimeOfDay,
        unavailableSlots,
      } = input;
      await gql(
        `mutation UpsertRules($input: UpsertTeacherWorkloadRulesInput!) {
          upsertTeacherWorkloadRules(input: $input) { id }
        }`,
        {
          input: {
            termId: tId,
            teacherId,
            totalLessonsPerWeek,
            maxLessonsPerDay,
            minLessonsPerDay,
            doubleLessonsPerWeek,
            maxConsecutiveLessons,
            minFreePeriodsPerDay,
            preferredDays,
            avoidDays,
            preferredPeriodNumbers,
            avoidPeriodNumbers,
            preferredTimeOfDay,
            unavailableSlots,
          },
        },
      );
      await reload();
    },
    [reload],
  );

  const runPreflight = useCallback(async (): Promise<TimetablePreflightResult | null> => {
    if (!termId) return null;
    const data = await gql<{ timetableGenerationPreflight: TimetablePreflightResult }>(
      `query Preflight($termId: String!) {
        timetableGenerationPreflight(termId: $termId) {
          ok totalAllocatedLessons totalAvailableSlots
          issues { code severity message teacherId gradeLevelId }
        }
      }`,
      { termId },
    );
    return data.timetableGenerationPreflight;
  }, [termId]);

  const generate = useCallback(
    async (replaceExisting = true): Promise<GenerateTimetableResult> => {
      if (!termId) throw new Error("Select a term first");
      const data = await gql<{ generateTimetable: GenerateTimetableResult }>(
        `mutation Generate($input: GenerateTimetableInput!) {
          generateTimetable(input: $input) {
            createdCount unresolvedCount warnings
            entries {
              id
              subjectId
              teacherId
              dayTemplatePeriodId
              streamId
              gradeLevelId
              isDoublePeriod
              termId
              tenantId
            }
          }
        }`,
        { input: { termId, replaceExisting } },
      );
      return data.generateTimetable;
    },
    [termId],
  );

  return {
    allocations,
    rules,
    loading,
    error,
    reload,
    createAllocation,
    updateAllocation,
    deleteAllocation,
    upsertRules,
    runPreflight,
    generate,
  };
}
