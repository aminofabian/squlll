import type { ProcessedFeeStructure } from "../components/FeeStructureManager/types";
import type { FeeAssignmentGroup, FeeItem, StudentSummaryFromAPI } from "../types";
import { matchingAssignmentGroups } from "./feePlanLinkage";

export type FeePlanCollectionStats = {
  assignedStudents: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  hasBilling: boolean;
};

function normalizePlanName(value: string): string {
  return value.trim().toLowerCase();
}

/** Names used on student fee line items for this plan (including grouped structures). */
export function feePlanStructureNames(
  plan: Pick<ProcessedFeeStructure, "structureName" | "allStructures">,
): Set<string> {
  const names = new Set<string>();
  const primary = plan.structureName?.trim();
  if (primary) names.add(normalizePlanName(primary));

  for (const s of plan.allStructures ?? []) {
    const n =
      (typeof s?.name === "string" && s.name.trim()) ||
      (typeof s?.structureName === "string" && s.structureName.trim());
    if (n) names.add(normalizePlanName(n));
  }

  return names;
}

function feeItemsForPlan(
  summary: StudentSummaryFromAPI["feeSummary"] | undefined,
  planNames: Set<string>,
): FeeItem[] {
  if (!summary?.feeItems?.length || planNames.size === 0) return [];
  return summary.feeItems.filter((item) =>
    planNames.has(normalizePlanName(item.feeStructureName ?? "")),
  );
}

function sumPlanScopedFees(items: FeeItem[]): {
  collected: number;
  outstanding: number;
} {
  let collected = 0;
  let outstanding = 0;

  for (const item of items) {
    const paid =
      item.amountPaid ??
      Math.max(0, item.amount - (item.balance ?? item.amount));
    collected += paid;
    outstanding += item.balance ?? Math.max(0, item.amount - paid);
  }

  return { collected, outstanding };
}

export function buildFeePlanCollectionByPlanId(
  structures: ProcessedFeeStructure[],
  assignments: FeeAssignmentGroup[] | undefined,
  students: StudentSummaryFromAPI[],
): Map<string, FeePlanCollectionStats> {
  const studentById = new Map(students.map((s) => [s.id, s]));
  const map = new Map<string, FeePlanCollectionStats>();

  for (const plan of structures) {
    const planNames = feePlanStructureNames(plan);
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
    let hasPlanScopedItems = false;

    for (const id of studentIds) {
      const summary = studentById.get(id)?.feeSummary;
      const items = feeItemsForPlan(summary, planNames);
      if (items.length > 0) {
        hasPlanScopedItems = true;
        const { collected, outstanding } = sumPlanScopedFees(items);
        totalCollected += collected;
        totalOutstanding += outstanding;
      }
    }

    const gross = totalCollected + totalOutstanding;
    const collectionRate = gross > 0 ? (totalCollected / gross) * 100 : 0;

    map.set(plan.structureId, {
      assignedStudents: studentIds.size,
      totalCollected,
      totalOutstanding,
      collectionRate,
      hasBilling: hasPlanScopedItems && gross > 0,
    });
  }

  return map;
}
