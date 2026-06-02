/** Visual weight for fee category rows (tuition should dominate the breakdown). */
export function isPrimaryFeeCategory(name: string): boolean {
  return /tuition|school\s*fees?/i.test(name.trim());
}

export function sortBucketsByAmount<T extends { totalAmount: number }>(
  buckets: T[],
): T[] {
  return [...buckets].sort((a, b) => b.totalAmount - a.totalAmount);
}

/** Bar width as share of the term total (not relative to largest category). */
export function bucketShareOfTermPercent(
  amount: number,
  termTotal: number,
): number {
  if (termTotal <= 0 || amount <= 0) return 0;
  return Math.min(100, Math.round((amount / termTotal) * 100));
}

/** @deprecated Prefer bucketShareOfTermPercent anchored to term total. */
export function bucketBarPercent(amount: number, maxAmount: number): number {
  if (maxAmount <= 0) return 0;
  return Math.max(4, Math.round((amount / maxAmount) * 100));
}

export function isCoreFeeCategory(name: string): boolean {
  return (
    isPrimaryFeeCategory(name) ||
    /meals?|lunch|boarding|transport|development|activity/i.test(name.trim())
  );
}
