import type { Level } from "@/lib/types/school-config";
import type { TenantSubject } from "@/lib/hooks/useTenantSubjects";
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
    name: ts.subject?.name || ts.customSubject?.name || "Unknown Subject",
    code: ts.subject?.code || ts.customSubject?.code || "",
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

  const levelSubjectNames = new Set(
    level.subjects.map((s) => s.name.toLowerCase().trim()),
  );
  const levelSubjectCodes = new Set(
    level.subjects.map((s) => s.code?.toLowerCase().trim()).filter(Boolean),
  );

  const filtered = transformed.filter((subject) => {
    const subjectName = subject.name.toLowerCase().trim();
    const subjectCode = subject.code?.toLowerCase().trim();
    return (
      levelSubjectNames.has(subjectName) ||
      (subjectCode && levelSubjectCodes.has(subjectCode))
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
