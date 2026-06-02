import type { ProcessedFeeStructure } from "../components/FeeStructureManager/types";
import type { FeeAssignmentGroup } from "../types";
import { formatAcademicYearDisplay } from "./feePlanStats";
import { matchingAssignmentGroups } from "./feePlanLinkage";

export type SchoolGradeRef = {
  id: string;
  name: string;
};

export type GradeTermConflict = {
  gradeId: string;
  gradeName: string;
  termId: string;
  termName: string;
  planNames: string[];
};

export type AcademicYearPlanGroup = {
  academicYear: string;
  academicYearId: string;
  yearLabel: string;
  plans: ProcessedFeeStructure[];
  /** Distinct school grades with at least one term linked this year */
  linkedGradeCount: number;
  totalSchoolGrades: number;
  unlinkedGrades: SchoolGradeRef[];
  /** Grades linked for some terms but not all in this year */
  partialGrades: Array<{
    id: string;
    name: string;
    linkedTermCount: number;
    totalTermCount: number;
  }>;
  conflicts: GradeTermConflict[];
  termCount: number;
  terms: Array<{ id: string; name: string }>;
};

function normalizeYearKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function resolveStructureTerms(
  feeStructureId: string,
  plan: ProcessedFeeStructure,
): string[] {
  if (plan.structureId === feeStructureId) {
    return plan.terms.map((t) => t.id);
  }
  const match = plan.allStructures?.find(
    (s: { id: string }) => s.id === feeStructureId,
  );
  if (match?.terms?.length) {
    return match.terms.map((t: { id: string }) => t.id);
  }
  return plan.terms.map((t) => t.id);
}

function distinctSchoolGrades(
  schoolGrades: SchoolGradeRef[],
): SchoolGradeRef[] {
  const map = new Map<string, string>();
  for (const g of schoolGrades) {
    if (!g.id || map.has(g.id)) continue;
    map.set(g.id, g.name);
  }
  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Group plans by academic year and compute school-wide grade linkage */
export function buildAcademicYearPlanGroups(
  plans: ProcessedFeeStructure[],
  assignments: FeeAssignmentGroup[] | undefined,
  schoolGrades: SchoolGradeRef[],
): AcademicYearPlanGroup[] {
  const grades = distinctSchoolGrades(schoolGrades);
  const byYear = new Map<string, ProcessedFeeStructure[]>();

  for (const plan of plans) {
    const key = plan.academicYearId || normalizeYearKey(plan.academicYear);
    const list = byYear.get(key) ?? [];
    list.push(plan);
    byYear.set(key, list);
  }

  const groups: AcademicYearPlanGroup[] = [];

  for (const [, yearPlans] of byYear) {
    const sortedPlans = [...yearPlans].sort((a, b) =>
      a.structureName.localeCompare(b.structureName),
    );
    const first = sortedPlans[0];
    const termMap = new Map<string, string>();
    for (const plan of sortedPlans) {
      for (const t of plan.terms) {
        termMap.set(t.id, t.name);
      }
    }
    const terms = [...termMap.entries()].map(([id, name]) => ({ id, name }));

    /** gradeId:termId -> plan names */
    const slotToPlans = new Map<string, Set<string>>();

    for (const plan of sortedPlans) {
      const matching = matchingAssignmentGroups(plan, assignments);
      for (const group of matching) {
        const structureId = group.feeAssignment.feeStructureId;
        const termIds = resolveStructureTerms(structureId, plan);
        const gradeIds = new Set<string>();

        for (const gl of group.feeAssignment?.gradeLevels ?? []) {
          if (gl.tenantGradeLevelId) gradeIds.add(gl.tenantGradeLevelId);
        }
        for (const id of group.feeAssignment?.tenantGradeLevelIds ?? []) {
          if (id) gradeIds.add(id);
        }
        for (const sa of group.studentAssignments ?? []) {
          if (sa.isActive === false) continue;
          const gid =
            sa.student?.grade?.id || sa.student?.grade?.gradeLevel?.id;
          if (gid) gradeIds.add(gid);
        }

        for (const gradeId of gradeIds) {
          for (const termId of termIds) {
            const slot = `${gradeId}:${termId}`;
            if (!slotToPlans.has(slot)) slotToPlans.set(slot, new Set());
            slotToPlans.get(slot)!.add(plan.structureName);
          }
        }
      }
    }

    const conflicts: GradeTermConflict[] = [];
    for (const [slot, planNames] of slotToPlans) {
      if (planNames.size <= 1) continue;
      const [gradeId, termId] = slot.split(":");
      conflicts.push({
        gradeId,
        gradeName: grades.find((g) => g.id === gradeId)?.name ?? "Grade",
        termId,
        termName: termMap.get(termId) ?? "Term",
        planNames: [...planNames],
      });
    }

    const linkedGradeIds = new Set<string>();
    const linkedTermsByGrade = new Map<string, Set<string>>();

    for (const slot of slotToPlans.keys()) {
      const [gradeId, termId] = slot.split(":");
      linkedGradeIds.add(gradeId);
      if (!linkedTermsByGrade.has(gradeId)) {
        linkedTermsByGrade.set(gradeId, new Set());
      }
      linkedTermsByGrade.get(gradeId)!.add(termId);
    }

    const unlinkedGrades = grades.filter((g) => !linkedGradeIds.has(g.id));
    const partialGrades: AcademicYearPlanGroup["partialGrades"] = [];

    if (terms.length > 0) {
      for (const grade of grades) {
        if (!linkedGradeIds.has(grade.id)) continue;
        const linkedTermCount = linkedTermsByGrade.get(grade.id)?.size ?? 0;
        if (linkedTermCount > 0 && linkedTermCount < terms.length) {
          partialGrades.push({
            id: grade.id,
            name: grade.name,
            linkedTermCount,
            totalTermCount: terms.length,
          });
        }
      }
    }

    groups.push({
      academicYear: first.academicYear,
      academicYearId: first.academicYearId,
      yearLabel: formatAcademicYearDisplay(first.academicYear),
      plans: sortedPlans,
      linkedGradeCount: linkedGradeIds.size,
      totalSchoolGrades: grades.length,
      unlinkedGrades,
      partialGrades,
      conflicts,
      termCount: terms.length,
      terms,
    });
  }

  return groups.sort((a, b) =>
    b.academicYear.localeCompare(a.academicYear),
  );
}

/** Grades linked to a specific plan (any term) */
export function getPlanLinkedGradeCount(
  plan: ProcessedFeeStructure,
  assignments: FeeAssignmentGroup[] | undefined,
): number {
  const matching = matchingAssignmentGroups(plan, assignments);
  const ids = new Set<string>();
  for (const group of matching) {
    for (const gl of group.feeAssignment?.gradeLevels ?? []) {
      if (gl.tenantGradeLevelId) ids.add(gl.tenantGradeLevelId);
    }
    for (const id of group.feeAssignment?.tenantGradeLevelIds ?? []) {
      if (id) ids.add(id);
    }
    for (const sa of group.studentAssignments ?? []) {
      if (sa.isActive === false) continue;
      const gid =
        sa.student?.grade?.id || sa.student?.grade?.gradeLevel?.id;
      if (gid) ids.add(gid);
    }
  }
  return ids.size;
}
