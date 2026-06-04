import type { FeeAssignmentGroup } from "../types";
import type { ProcessedFeeStructure } from "../components/FeeStructureManager/types";

export function structureIdsForPlan(
  plan: Pick<ProcessedFeeStructure, "structureId" | "allStructures">,
): Set<string> {
  const ids = new Set<string>([plan.structureId]);
  for (const s of plan.allStructures ?? []) {
    if (s?.id) ids.add(s.id);
  }
  return ids;
}

export function matchingAssignmentGroups(
  plan: Pick<ProcessedFeeStructure, "structureId" | "allStructures">,
  assignments: FeeAssignmentGroup[] | undefined,
): FeeAssignmentGroup[] {
  if (!assignments?.length) return [];
  const ids = structureIdsForPlan(plan);
  return assignments.filter(
    (g) =>
      g.feeAssignment?.isActive !== false &&
      ids.has(g.feeAssignment.feeStructureId),
  );
}

export type LinkedClassEntry = {
  id: string;
  name: string;
};

function labelForTenantGradeLevel(
  tenantGradeLevelId: string,
  group: FeeAssignmentGroup,
  labelById?: Map<string, string>,
): string {
  const fromMap = labelById?.get(tenantGradeLevelId);
  if (fromMap) return fromMap;

  for (const gl of group.feeAssignment?.gradeLevels ?? []) {
    if (gl.tenantGradeLevelId !== tenantGradeLevelId) continue;
    const tgl = gl.tenantGradeLevel;
    const name =
      tgl?.shortName?.trim() ||
      tgl?.name?.trim() ||
      tgl?.gradeLevel?.name?.trim();
    if (name) return name;
  }

  for (const sa of group.studentAssignments ?? []) {
    if (sa.isActive === false) continue;
    const grade = sa.student?.grade;
    if (grade?.id === tenantGradeLevelId || grade?.gradeLevel?.id === tenantGradeLevelId) {
      return grade.gradeLevel?.name?.trim() || "Class";
    }
  }

  return "Class";
}

function linkedClassKeysFromGroup(group: FeeAssignmentGroup): string[] {
  const ids = group.feeAssignment?.tenantGradeLevelIds;
  if (ids?.length) return ids.filter(Boolean);

  const fromStudents = new Set<string>();
  for (const sa of group.studentAssignments ?? []) {
    if (sa.isActive === false) continue;
    const grade = sa.student?.grade;
    const key = grade?.id || grade?.gradeLevel?.id;
    if (key) fromStudents.add(key);
  }
  return [...fromStudents];
}

/** Linked classes with display names for plan detail */
export function getLinkedClassesForPlan(
  plan: Pick<ProcessedFeeStructure, "structureId" | "allStructures">,
  assignments: FeeAssignmentGroup[] | undefined,
  labelById?: Map<string, string>,
): LinkedClassEntry[] {
  const matching = matchingAssignmentGroups(plan, assignments);
  const byId = new Map<string, LinkedClassEntry>();

  for (const group of matching) {
    for (const gl of group.feeAssignment?.gradeLevels ?? []) {
      const id = gl.tenantGradeLevelId;
      if (!id || byId.has(id)) continue;
      byId.set(id, {
        id,
        name: labelForTenantGradeLevel(id, group, labelById),
      });
    }

    for (const id of linkedClassKeysFromGroup(group)) {
      if (byId.has(id)) continue;
      byId.set(id, {
        id,
        name: labelForTenantGradeLevel(id, group, labelById),
      });
    }
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Distinct classes (tenant grade levels) linked to a fee structure via assignments */
export function countLinkedClassesForPlan(
  plan: Pick<ProcessedFeeStructure, "structureId" | "allStructures">,
  assignments: FeeAssignmentGroup[] | undefined,
  labelById?: Map<string, string>,
): number {
  return getLinkedClassesForPlan(plan, assignments, labelById).length;
}

export function countStudentsForPlan(
  plan: Pick<ProcessedFeeStructure, "structureId" | "allStructures">,
  assignments: FeeAssignmentGroup[] | undefined,
): number {
  const matching = matchingAssignmentGroups(plan, assignments);
  return matching.reduce(
    (sum, g) =>
      sum +
      (g.totalStudents ??
        g.feeAssignment?.studentsAssignedCount ??
        g.studentAssignments?.length ??
        0),
    0,
  );
}

export function buildLinkedClassCountByPlanId(
  structures: ProcessedFeeStructure[],
  assignments: FeeAssignmentGroup[] | undefined,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const plan of structures) {
    map.set(
      plan.structureId,
      countLinkedClassesForPlan(plan, assignments),
    );
  }
  return map;
}

export function findPlanForStructureId(
  structures: ProcessedFeeStructure[],
  feeStructureId: string,
): ProcessedFeeStructure | undefined {
  return structures.find(
    (p) =>
      p.structureId === feeStructureId ||
      p.allStructures?.some((s: { id: string }) => s.id === feeStructureId),
  );
}
