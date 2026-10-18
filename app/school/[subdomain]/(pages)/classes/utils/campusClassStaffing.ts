import type { Level } from "@/lib/types/school-config";
import {
  tenantSubjectCode,
  tenantSubjectDisplayName,
  type TenantSubject,
} from "@/lib/hooks/useTenantSubjects";
import { dedupeSubjectsByMaster } from "./dedupeSubjects";

export type SubjectStaffing = { assigned: number; total: number };

export function computeGradeSubjectStaffing(
  level: Level,
  gradeId: string,
  tenantSubjects: TenantSubject[],
  getTeacherForSubject: (
    ids: string[],
    meta?: { _tenantSubject: TenantSubject; name: string; code: string },
  ) => string | undefined,
): SubjectStaffing {
  const transformed = tenantSubjects.map((ts) => ({
    id: ts.id,
    name: tenantSubjectDisplayName(ts),
    code: tenantSubjectCode(ts),
    subjectType: (ts.subjectType === "core" ? "core" : "elective") as
      | "core"
      | "elective",
    tenantSubjectIds: [ts.id],
    _tenantSubject: ts,
  }));

  const gradeBelongsToLevel = level.gradeLevels?.some(
    (grade) => grade.id === gradeId,
  );
  if (!gradeBelongsToLevel) return { assigned: 0, total: 0 };

  // Match on the tenant subject id first (rename-safe), then fall back to
  // name/code for older configurations.
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

  const filtered = transformed.filter((subject) => {
    if (levelSubjectIds.has(subject.id)) return true;
    const subjectName = subject.name.toLowerCase().trim();
    const subjectCode = subject.code?.toLowerCase().trim();
    return (
      levelSubjectNames.has(subjectName) ||
      (Boolean(subjectCode) && levelSubjectCodes.has(subjectCode as string))
    );
  });

  const subjects = dedupeSubjectsByMaster(filtered);
  let assigned = 0;
  for (const s of subjects) {
    if (
      getTeacherForSubject(s.tenantSubjectIds, {
        _tenantSubject: s._tenantSubject,
        name: s.name,
        code: s.code,
      })
    ) {
      assigned += 1;
    }
  }

  return { assigned, total: subjects.length };
}
