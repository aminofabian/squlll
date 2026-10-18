"use client";

import { useMemo } from "react";
import type { Level } from "@/lib/types/school-config";
import {
  useTenantSubjects,
  tenantSubjectCode,
  tenantSubjectDisplayName,
  type TenantSubject,
} from "@/lib/hooks/useTenantSubjects";
import { dedupeSubjectsByMaster } from "./dedupeSubjects";
import { useSubjectTeacherMap } from "./useSubjectTeacherMap";

/**
 * Subjects that belong to a class (via its curriculum level).
 *
 * Matching rules, most reliable first:
 *  1. `TenantSubject.id === level.subjects[].id` — the API maps the tenant
 *     subject id as the level subject id, so this survives renames.
 *  2. Name/code fallback for older configurations where the level stored the
 *     global subject id instead of the tenant subject id.
 */
export function subjectsForLevel(
  level: Level | null,
  gradeId: string | null | undefined,
  tenantSubjects: TenantSubject[],
) {
  if (!level || !gradeId) return [];

  const gradeBelongsToLevel = level.gradeLevels?.some(
    (grade) => grade.id === gradeId,
  );
  if (!gradeBelongsToLevel) return [];

  const levelSubjectIds = new Set(
    (level.subjects ?? []).map((s) => s.id).filter(Boolean),
  );
  const levelSubjectNames = new Set(
    (level.subjects ?? []).map((s) => s.name.toLowerCase().trim()),
  );
  const levelSubjectCodes = new Set(
    (level.subjects ?? [])
      .map((s) => s.code?.toLowerCase().trim())
      .filter(Boolean) as string[],
  );

  const transformed = tenantSubjects.map((ts) => {
    const name = tenantSubjectDisplayName(ts);
    const code = tenantSubjectCode(ts);
    return {
      id: ts.id,
      name,
      code,
      subjectType: (ts.subjectType === "core" ? "core" : "elective") as
        | "core"
        | "elective",
      tenantSubjectIds: [ts.id],
      _tenantSubject: ts,
    };
  });

  const filtered = transformed.filter((subject) => {
    if (levelSubjectIds.has(subject.id)) return true;
    const subjectName = subject.name.toLowerCase().trim();
    const subjectCode = subject.code?.toLowerCase().trim();
    return (
      levelSubjectNames.has(subjectName) ||
      (Boolean(subjectCode) && levelSubjectCodes.has(subjectCode as string))
    );
  });

  return dedupeSubjectsByMaster(filtered).sort((a, b) => {
    if (a.subjectType === "core" && b.subjectType !== "core") return -1;
    if (a.subjectType !== "core" && b.subjectType === "core") return 1;
    return a.name.localeCompare(b.name);
  });
}

export function useClassSubjectsForLevel(
  level: Level | null,
  selectedGradeId: string,
) {
  const { data: tenantSubjects = [], isLoading: subjectsLoading } =
    useTenantSubjects();
  const {
    getTeacherForSubject,
    isLoading: teachersLoading,
    refetch: refetchTeachers,
  } = useSubjectTeacherMap();

  const filteredSubjects = useMemo(
    () => subjectsForLevel(level, selectedGradeId, tenantSubjects),
    [tenantSubjects, level, selectedGradeId],
  );

  const assignedCount = useMemo(
    () =>
      filteredSubjects.filter((s) =>
        Boolean(
          getTeacherForSubject(s.tenantSubjectIds, {
            _tenantSubject: s._tenantSubject,
            name: s.name,
            code: s.code,
          }),
        ),
      ).length,
    [filteredSubjects, getTeacherForSubject],
  );

  return {
    subjects: filteredSubjects,
    assignedCount,
    totalCount: filteredSubjects.length,
    getTeacherForSubject,
    isLoading: subjectsLoading || teachersLoading,
    refetch: refetchTeachers,
  };
}
