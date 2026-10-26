/** Minimal shape needed to place a term on the calendar. */
export type DatedTerm = {
  startDate: string;
  endDate: string;
};

export type TermWindow<T extends DatedTerm> = {
  /** Term whose start/end dates contain today, if any. */
  current: T | null;
  /** First term that starts after today — the real "next term". */
  next: T | null;
};

function dayValue(value: string | Date): number | null {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

/**
 * Resolve the term we are in and the next term from actual dates.
 *
 * This deliberately ignores the "selected" term: a school that has not marked
 * a current term can still have terms scheduled for next year. If today is
 * before Term 1 2027, the next term is Term 1 2027 — not Term 2 just because
 * Term 1 happened to be selected in the picker.
 */
export function resolveTermWindow<T extends DatedTerm>(
  terms: T[],
  now: Date = new Date(),
): TermWindow<T> {
  const today = dayValue(now);
  if (today == null) return { current: null, next: null };

  const dated = terms
    .map((term) => ({
      term,
      start: dayValue(term.startDate),
      end: dayValue(term.endDate),
    }))
    .filter(
      (item): item is { term: T; start: number; end: number } =>
        item.start != null && item.end != null,
    )
    .sort((a, b) => a.start - b.start);

  // If overlapping terms exist, prefer the one that started most recently.
  const current =
    [...dated]
      .reverse()
      .find((item) => item.start <= today && today <= item.end)?.term ?? null;

  const next = dated.find((item) => item.start > today)?.term ?? null;

  return { current, next };
}
