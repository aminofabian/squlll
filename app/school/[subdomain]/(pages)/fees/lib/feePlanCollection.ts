import type { ProcessedFeeStructure } from "../components/FeeStructureManager/types";
import type { FeeAssignmentGroup, StudentSummaryFromAPI } from "../types";
import { matchingAssignmentGroups } from "./feePlanLinkage";

export type FeePlanCollectionStats = {
  assignedStudents: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  hasBilling: boolean;
};

export function buildFeePlanCollectionByPlanId(
  structures: ProcessedFeeStructure[],
  assignments: FeeAssignmentGroup[] | undefined,
  students: StudentSummaryFromAPI[],
): Map<string, FeePlanCollectionStats> {
  const studentById = new Map(students.map((s) => [s.id, s]));
  const map = new Map<string, FeePlanCollectionStats>();

  for (const plan of structures) {
    const studentIds = new Set<string>();
    for (const group of matchingAssignmentGroups(plan, assignments)) {
      for (const sa of group.studentAssignments ?? []) {
        if (sa.isActive !== false && sa.studentId) {
          studentIds.add(sa.studentId);
        }
      }
    }

    let totalCollected = 0;
    let totalOutstanding = 0;

    for (const id of studentIds) {
      const summary = studentById.get(id)?.feeSummary;
      if (!summary) continue;
      totalCollected += summary.totalPaid;
      totalOutstanding += summary.balance;
    }

    const gross = totalCollected + totalOutstanding;
    const collectionRate = gross > 0 ? (totalCollected / gross) * 100 : 0;

    map.set(plan.structureId, {
      assignedStudents: studentIds.size,
      totalCollected,
      totalOutstanding,
      collectionRate,
      hasBilling: gross > 0,
    });
  }

  return map;
}
