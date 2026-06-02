export type FeeLetterPreviewMetaProps = {
  grade?: string | null
  academicYear?: string | null
  terms?: string | null
  className?: string
}

function formatMetaValue(value: string): string {
  if (value === 'all terms') return 'All terms'
  return value
}

export function feeLetterPreviewMetaLabel(
  meta: FeeLetterPreviewMetaProps,
): string | null {
  const parts: string[] = []
  if (meta.grade) parts.push(meta.grade)
  if (meta.academicYear) parts.push(meta.academicYear)
  if (meta.terms) parts.push(formatMetaValue(meta.terms))
  return parts.length > 0 ? parts.join(' · ') : null
}
