import type { ProcessedFeeStructure } from "../components/FeeStructureManager/types";

export const FEE_TERM_QUERY = "term";

/** Stable query value for a term (uses backend term id). */
export function termToQueryValue(termId: string): string {
  return termId;
}

/**
 * Resolve ?term= to a term id on this structure.
 * Accepts term id or a slugified / plain term name (e.g. "term-ii", "Term II").
 */
export function resolveTermIdForPlan(
  structure: ProcessedFeeStructure,
  termParam: string | null | undefined,
): string {
  const terms = structure.terms ?? [];
  const fallback = structure.termId || terms[0]?.id || "";

  if (!termParam?.trim()) return fallback;

  const decoded = decodeURIComponent(termParam.trim());
  const byId = terms.find((t) => t.id === decoded);
  if (byId) return byId.id;

  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "-");
  const target = norm(decoded);
  const bySlug = terms.find((t) => norm(t.name) === target);
  if (bySlug) return bySlug.id;

  const byPlain = terms.find(
    (t) => t.name.trim().toLowerCase() === decoded.toLowerCase(),
  );
  if (byPlain) return byPlain.id;

  return fallback;
}

/** Fingerprint category lines for comparing terms (amounts may match but lines differ). */
export function bucketFingerprintForTerm(
  structure: ProcessedFeeStructure,
  termId: string,
): string {
  const buckets =
    structure.termFeesMap?.[termId] ?? structure.buckets ?? [];
  return buckets
    .map((b) => `${b.name.trim().toLowerCase()}:${b.totalAmount}`)
    .sort()
    .join("|");
}

export function termsShareSameTotals(
  structure: ProcessedFeeStructure,
  termIds: string[],
): boolean {
  if (termIds.length <= 1) return true;
  const totals = termIds.map((id) => {
    const buckets = structure.termFeesMap?.[id];
    if (!buckets?.length) return 0;
    return buckets.reduce((s, b) => s + (b.totalAmount || 0), 0);
  });
  const first = totals[0] ?? 0;
  return totals.every((t) => t === first);
}

export function termsShareSameCategories(
  structure: ProcessedFeeStructure,
  termIds: string[],
): boolean {
  if (termIds.length <= 1) return true;
  const prints = termIds.map((id) => bucketFingerprintForTerm(structure, id));
  const first = prints[0];
  return prints.every((p) => p === first);
}

export const feeLetterGradeStorageKey = (planSlug: string) =>
  `squl:fee-letter-grade:${planSlug}`;
