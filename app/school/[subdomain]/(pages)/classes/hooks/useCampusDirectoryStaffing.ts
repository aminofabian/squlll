"use client";

import { useMemo } from "react";
import type { SchoolConfiguration } from "@/lib/types/school-config";
import { useTenantSubjects } from "@/lib/hooks/useTenantSubjects";
import { useSubjectTeacherMap } from "../utils/useSubjectTeacherMap";
import {
  computeGradeSubjectStaffing,
  type SubjectStaffing,
} from "../utils/campusClassStaffing";

export function useCampusDirectoryStaffing(config: SchoolConfiguration | null) {
  const { data: tenantSubjects = [], isLoading: subjectsLoading } =
    useTenantSubjects();
  const { getTeacherForSubject, isLoading: teachersLoading } =
    useSubjectTeacherMap();

  const staffingByGradeId = useMemo(() => {
    const map = new Map<string, SubjectStaffing>();
    if (!config?.selectedLevels) return map;

    for (const level of config.selectedLevels) {
      for (const grade of level.gradeLevels ?? []) {
        map.set(
          grade.id,
          computeGradeSubjectStaffing(
            level,
            grade.id,
            tenantSubjects,
            getTeacherForSubject,
          ),
        );
      }
    }
    return map;
  }, [config?.selectedLevels, tenantSubjects, getTeacherForSubject]);

  const getStaffing = (gradeId: string) =>
    staffingByGradeId.get(gradeId) ?? { assigned: 0, total: 0 };

  return {
    getStaffing,
    isLoading: subjectsLoading || teachersLoading,
  };
}
