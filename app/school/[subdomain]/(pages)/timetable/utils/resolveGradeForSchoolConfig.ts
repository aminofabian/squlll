import type { Grade } from "@/lib/types/timetable";
import type { GradeLevel, Subject } from "@/lib/types/school-config";

type GradeConfigLookup = {
  grade: GradeLevel;
  levelId: string;
  levelName: string;
};

type SchoolConfigGetters = {
  getGradeById: (gradeId: string) => GradeConfigLookup | undefined;
  getSubjectsByLevelId: (levelId: string) => Subject[];
};

/** Timetable grades use master gradeLevel.id; school config uses tenantGradeLevel.id. */
export function resolveSchoolConfigGradeId(
  gradeId: string | undefined,
  grades: Grade[],
): string | undefined {
  if (!gradeId) return undefined;
  const timetableGrade = grades.find((g) => g.id === gradeId);
  return timetableGrade?.tenantGradeLevelId ?? gradeId;
}

export function resolveGradeForSchoolConfig(
  gradeId: string | undefined,
  grades: Grade[],
  { getGradeById }: Pick<SchoolConfigGetters, "getGradeById">,
): GradeConfigLookup | undefined {
  const configGradeId = resolveSchoolConfigGradeId(gradeId, grades);
  if (!configGradeId) return undefined;
  return getGradeById(configGradeId) ?? (gradeId ? getGradeById(gradeId) : undefined);
}

export function subjectsForTimetableGrade(
  gradeId: string | undefined,
  grades: Grade[],
  backendSubjects: Array<{
    id: string;
    name: string;
    code?: string;
    color?: string;
  }>,
  getters: SchoolConfigGetters,
): Array<{ id: string; name: string; code?: string; color?: string }> {
  if (!gradeId) return [];

  const gradeInfo = resolveGradeForSchoolConfig(gradeId, grades, getters);
  if (!gradeInfo) {
    return backendSubjects;
  }

  const levelSubjects = getters.getSubjectsByLevelId(gradeInfo.levelId);
  const levelSubjectNames = new Set(
    levelSubjects.map((s) => s.name.toLowerCase().trim()),
  );
  const levelSubjectCodes = new Set(
    levelSubjects.map((s) => s.code?.toLowerCase().trim()).filter(Boolean),
  );

  const filtered = backendSubjects.filter((backendSubject) => {
    const subjectName = backendSubject.name.toLowerCase().trim();
    const subjectCode = backendSubject.code?.toLowerCase().trim();
    return (
      levelSubjectNames.has(subjectName) ||
      (subjectCode && levelSubjectCodes.has(subjectCode))
    );
  });

  return filtered.length > 0 ? filtered : backendSubjects;
}
