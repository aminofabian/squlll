/** The single day with the most periods, or null when there's a tie or nothing scheduled. */
export function findBusiestDay(periodCounts: Record<number, number>): number | null {
  const entries = Object.entries(periodCounts).map(([day, count]) => [Number(day), count] as const);
  const max = Math.max(0, ...entries.map(([, count]) => count));
  const leaders = entries.filter(([, count]) => count === max);
  return max > 0 && leaders.length === 1 ? leaders[0][0] : null;
}
