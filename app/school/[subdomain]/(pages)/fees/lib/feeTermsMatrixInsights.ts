export type FeeMatrixRow = {
  name: string
  isOptional?: boolean
  amounts: Record<string, number>
}

export function sumMatrixRowsForTerm(
  rows: FeeMatrixRow[],
  termId: string,
): number {
  return rows.reduce((sum, row) => sum + (row.amounts[termId] ?? 0), 0)
}

/** True when many categories share one positive amount in a term (often placeholder data). */
export function looksLikeUniformCategoryAmounts(
  rows: FeeMatrixRow[],
  termIds: string[],
): boolean {
  if (rows.length < 3 || termIds.length === 0) return false

  for (const termId of termIds) {
    if (termId === '__fallback') continue
    const positive = rows
      .map((r) => r.amounts[termId] ?? 0)
      .filter((a) => a > 0)
    if (positive.length >= 3 && new Set(positive).size === 1) {
      return true
    }
  }
  return false
}

export function termTotalsMatchRowSums(
  rows: FeeMatrixRow[],
  termTotals: Array<{ id: string; total: number }>,
): boolean {
  return termTotals.every((t) => {
    const fromRows = sumMatrixRowsForTerm(rows, t.id)
    return Math.abs(fromRows - t.total) < 1
  })
}
