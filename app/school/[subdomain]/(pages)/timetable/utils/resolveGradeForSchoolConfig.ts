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

/** Tenant stream id required by timetable GraphQL mutations. */
export function resolveTenantStreamIdForApi(
  streamId: string | null | undefined,
  gradeId: string | null | undefined,
  grades: Grade[],
): string | null {
  if (!streamId) return null;

  const grade = grades.find(
    (g) => g.id === gradeId || g.tenantGradeLevelId === gradeId,
  );
  if (!grade?.streams?.length) return streamId;

  const match = grade.streams.find(
    (s) => s.tenantStreamId === streamId || s.streamId === streamId,
  );
  return match?.tenantStreamId ?? streamId;
}

/** Map tenant stream id → school-config Stream.id for sidebar highlighting. */
export function resolveStreamEntityIdForSidebar(
  streamId: string | null | undefined,
  gradeId: string | null | undefined,
  grades: Grade[],
): string {
  if (!streamId) return "";

  const grade = grades.find(
    (g) => g.id === gradeId || g.tenantGradeLevelId === gradeId,
  );
  if (!grade?.streams?.length) return streamId;

  const match = grade.streams.find(
    (s) => s.tenantStreamId === streamId || s.streamId === streamId,
  );
  return match?.streamId ?? streamId;
}

/** Tenant grade level id required by timetable GraphQL mutations. */
export const resolveTenantGradeLevelIdForApi = resolveSchoolConfigGradeId;

/** Map API tenant grade id → master grade id used in the timetable UI. */
export function resolveCanonicalGradeId(
  gradeIdFromApi: string,
  grades: Grade[],
): string {
  const match = grades.find(
    (g) => g.id === gradeIdFromApi || g.tenantGradeLevelId === gradeIdFromApi,
  );
  return match?.id ?? gradeIdFromApi;
}

/** Whether a stored entry belongs to the selected grade (and stream, if any). */
export function entryMatchesGradeScope(
  entry: { gradeId: string; streamId?: string | null },
  selectedGradeId: string,
  selectedStreamId: string | null | undefined,
  grades: Grade[],
): boolean {
  const tenantGradeLevelId = resolveTenantGradeLevelIdForApi(
    selectedGradeId,
    grades,
  );
  const gradeMatch =
    entry.gradeId === selectedGradeId ||
    (!!tenantGradeLevelId && entry.gradeId === tenantGradeLevelId);
  if (!gradeMatch) return false;
  if (selectedStreamId) return entry.streamId === selectedStreamId;
  return !entry.streamId;
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
