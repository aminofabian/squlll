import type { FeeAssignmentData, FeeAssignmentGroup } from "../types";

export function gradeNames(group: FeeAssignmentGroup): string[] {
  const names = new Set<string>();
  for (const gl of group.feeAssignment.gradeLevels ?? []) {
    const n =
      gl.tenantGradeLevel?.shortName?.trim() ||
      gl.tenantGradeLevel?.name?.trim() ||
      gl.tenantGradeLevel?.gradeLevel?.name?.trim();
    if (n) names.add(n);
  }
  return [...names].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
  );
}

export function gradeLabels(group: FeeAssignmentGroup): string {
  const names = gradeNames(group);
  if (names.length === 0) return "—";
  return names.join(", ");
}

export function uniquePlanCount(data: FeeAssignmentData): number {
  return new Set(
    data.feeAssignments.map((g) => g.feeAssignment.feeStructureId),
  ).size;
}

export function countFeeLineItems(data: FeeAssignmentData): number {
  return data.feeAssignments.reduce((sum, group) => {
    if (!group.studentAssignments) return sum;
    return (
      sum +
      group.studentAssignments.reduce(
        (n, sa) => n + (sa.feeItems?.length ?? 0),
        0,
      )
    );
  }, 0);
}

export type ClassLinksStats = {
  links: number;
  plans: number;
  activeLinks: number;
  inactiveLinks: number;
  students: number;
  feeItems: number;
  gradesLinked: number;
  readyToBill: number;
  needsStudents: number;
  showInactive: boolean;
};

export function buildClassLinksStats(data: FeeAssignmentData): ClassLinksStats {
  const inactiveLinks = data.feeAssignments.filter(
    (g) => !g.feeAssignment.isActive,
  ).length;
  const readyToBill = data.feeAssignments.filter(
    (g) => g.feeAssignment.isActive && g.totalStudents > 0,
  ).length;
  const needsStudents = data.feeAssignments.filter(
    (g) => g.feeAssignment.isActive && g.totalStudents === 0,
  ).length;
  const gradeSet = new Set<string>();
  for (const g of data.feeAssignments) {
    for (const name of gradeNames(g)) gradeSet.add(name);
  }

  return {
    links: data.totalFeeAssignments,
    plans: uniquePlanCount(data),
    activeLinks: data.feeAssignments.length - inactiveLinks,
    inactiveLinks,
    students: data.totalStudentsWithFees,
    feeItems: countFeeLineItems(data),
    gradesLinked: gradeSet.size,
    readyToBill,
    needsStudents,
    showInactive: inactiveLinks > 0,
  };
}

/** Short assignment label without repeating the full plan name. */
export function assignmentLine(
  description: string,
  structureName: string,
): string {
  const desc = description?.trim() ?? "";
  const name = structureName.trim();
  if (!desc) return "Assignment";
  if (desc === name) return "Assignment";

  const stripped = desc
    .replace(
      /^Q\d+\s+\d{4}\s+Fee Assignment\s*[-–]\s*/i,
      "",
    )
    .replace(/^Fee Assignment\s*[-–]\s*/i, "")
    .trim();

  if (stripped && stripped !== name && !stripped.startsWith(name)) {
    return stripped.length > 48 ? `${stripped.slice(0, 45)}…` : stripped;
  }

  const termMatch = desc.match(/\bTerm\s+[IVX\d]+/i);
  if (termMatch) return termMatch[0];

  return desc.length > 40 ? `${desc.slice(0, 37)}…` : desc;
}
