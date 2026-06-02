/** Round KES amounts to the nearest 10 (e.g. 45,247 → 45,250) */
export function roundToNearestTen(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  if (amount === 0) return 0;
  return Math.round(amount / 10) * 10;
}
