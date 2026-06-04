"use client";

import { useMemo } from "react";
import type { Level } from "@/lib/types/school-config";
import { useTenantSubjects } from "@/lib/hooks/useTenantSubjects";
import { dedupeSubjectsByMaster } from "./dedupeSubjects";
import { useSubjectTeacherMap } from "./useSubjectTeacherMap";

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

  const filteredSubjects = useMemo(() => {
    const transformed = tenantSubjects.map((ts) => ({
      id: ts.id,
      name: ts.subject?.name || ts.customSubject?.name || "Unknown Subject",
      code: ts.subject?.code || ts.customSubject?.code || "",
      subjectType: (ts.subjectType === "core" ? "core" : "elective") as
        | "core"
        | "elective",
      tenantSubjectIds: [ts.id],
      _tenantSubject: ts,
    }));

    if (!level || !selectedGradeId) return [];

    const gradeBelongsToLevel = level.gradeLevels?.some(
      (grade) => grade.id === selectedGradeId,
    );
    if (!gradeBelongsToLevel) return [];

    const levelSubjectNames = new Set(
      level.subjects.map((s) => s.name.toLowerCase().trim()),
    );
    const levelSubjectCodes = new Set(
      level.subjects.map((s) => s.code?.toLowerCase().trim()).filter(Boolean),
    );

    const subjects = transformed.filter((subject) => {
      const subjectName = subject.name.toLowerCase().trim();
      const subjectCode = subject.code?.toLowerCase().trim();
      return (
        levelSubjectNames.has(subjectName) ||
        (subjectCode && levelSubjectCodes.has(subjectCode))
      );
    });

    return dedupeSubjectsByMaster(subjects).sort((a, b) => {
      if (a.subjectType === "core" && b.subjectType !== "core") return -1;
      if (a.subjectType !== "core" && b.subjectType === "core") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [tenantSubjects, level, selectedGradeId]);

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
