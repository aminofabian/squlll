import type { ProcessedFeeStructure } from "../components/FeeStructureManager/types";

export const FEE_PLAN_QUERY = "plan";

export function feePlanSlug(
  structure: Pick<ProcessedFeeStructure, "structureId" | "structureName">,
): string {
  const label = (structure.structureName || "fee-plan")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const idPart = structure.structureId
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 8)
    .toLowerCase();
  return idPart ? `${label || "fee-plan"}-${idPart}` : label || "fee-plan";
}

export function findFeePlanBySlug(
  structures: ProcessedFeeStructure[],
  slug: string | null | undefined,
): ProcessedFeeStructure | undefined {
  if (!slug?.trim()) return undefined;
  const decoded = decodeURIComponent(slug.trim());
  return (
    structures.find((s) => feePlanSlug(s) === decoded) ||
    structures.find((s) => s.structureId === decoded)
  );
}

export function feePlanTermProgress(structure: ProcessedFeeStructure): {
  configured: number;
  total: number;
} {
  const terms = structure.terms ?? [];
  if (terms.length === 0) return { configured: 0, total: 0 };
  if (!structure.termFeesMap) {
    return { configured: 0, total: terms.length };
  }
  const configured = terms.filter((t) => {
    const buckets = structure.termFeesMap?.[t.id];
    if (!buckets?.length) return false;
    return buckets.reduce((sum, b) => sum + (b.totalAmount || 0), 0) > 0;
  }).length;
  return { configured, total: terms.length };
}

export function feePlanYearTotalKes(structure: ProcessedFeeStructure): number {
  if (structure.termFeesMap && Object.keys(structure.termFeesMap).length > 0) {
    return Object.values(structure.termFeesMap).reduce((yearSum, termBuckets) => {
      const termSum = termBuckets.reduce(
        (sum, b) => sum + (b.totalAmount || 0),
        0,
      );
      return yearSum + termSum;
    }, 0);
  }
  const termTotal = (structure.buckets || []).reduce(
    (sum, b) => sum + (b.totalAmount || 0),
    0,
  );
  return termTotal * Math.max(structure.terms?.length ?? 1, 1);
}

