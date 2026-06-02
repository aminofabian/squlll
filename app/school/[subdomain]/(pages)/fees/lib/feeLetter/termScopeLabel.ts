/** Human-readable term selection for letter preview header and PDF scope. */
export function buildLetterTermScopeLabel(
  terms: Array<{ id: string; name: string }>,
  selectedIds: string[],
): string | null {
  const names = terms
    .filter((t) => selectedIds.includes(t.id))
    .map((t) => t.name)
  if (names.length === 0) return null
  if (names.length === 1) return names[0]
  if (names.length === terms.length) return 'all terms'
  return names.join(', ')
}
