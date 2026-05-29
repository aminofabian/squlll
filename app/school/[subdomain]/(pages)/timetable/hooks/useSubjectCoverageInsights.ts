import { useMemo } from "react";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { buildSubjectCoverageInsights } from "../utils/subjectCoverageInsights";

export function useSubjectCoverageInsights(
  gradeId: string | null,
  subjectDistribution: Record<string, number>,
  daysPerWeek: number,
  periodCount: number,
  filledSlots: number,
  totalSlots: number,
) {
  const { getGradeById, getSubjectsByLevelId } = useSchoolConfigStore();

  return useMemo(() => {
    const gradeInfo = gradeId ? getGradeById(gradeId) : null;
    const expectedSubjectNames = gradeInfo
      ? getSubjectsByLevelId(gradeInfo.levelId).map((s) => s.name)
      : [];

    return buildSubjectCoverageInsights({
      subjectDistribution,
      expectedSubjectNames,
      daysPerWeek,
      periodCount,
      filledSlots,
      totalSlots,
    });
  }, [
    gradeId,
    subjectDistribution,
    daysPerWeek,
    periodCount,
    filledSlots,
    totalSlots,
    getGradeById,
    getSubjectsByLevelId,
  ]);
}
