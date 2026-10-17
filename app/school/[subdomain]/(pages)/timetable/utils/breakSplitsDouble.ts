type BreakPlacement = {
  afterPeriod: number;
  dayOfWeek?: number;
  applyToAllDays?: boolean;
};

/** True when a break comes straight after this period, so a double starting here would be split. */
export function breakSplitsDouble(
  breaks: BreakPlacement[],
  dayOfWeek: number,
  periodNumber: number,
): boolean {
  return breaks.some(
    (b) =>
      b.afterPeriod === periodNumber &&
      (b.applyToAllDays || b.dayOfWeek === dayOfWeek),
  );
}
