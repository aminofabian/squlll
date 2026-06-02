'use client'

import { FeesMetaChip, FeesMetaChipGrid } from '../FeesMetaChip'
import type { FeeLetterPreviewMetaProps } from './feeLetterPreviewMetaLabel'

export type { FeeLetterPreviewMetaProps }
export { feeLetterPreviewMetaLabel } from './feeLetterPreviewMetaLabel'

function formatMetaValue(value: string): string {
  if (value === 'all terms') return 'All terms'
  return value
}

const META_ITEMS = [
  { key: 'grade' as const, label: 'Grade' },
  { key: 'academicYear' as const, label: 'Year' },
  { key: 'terms' as const, label: 'Terms' },
]

export function FeeLetterPreviewMeta({
  grade,
  academicYear,
  terms,
  className,
}: FeeLetterPreviewMetaProps) {
  const values = { grade, academicYear, terms }

  const items = META_ITEMS.flatMap(({ key, label }) => {
    const raw = values[key]
    if (!raw?.trim()) return []
    return [{ key, label, value: formatMetaValue(raw.trim()) }]
  })

  if (items.length === 0) return null

  return (
    <FeesMetaChipGrid layout="row" className={className}>
      {items.map((item) => (
        <FeesMetaChip key={item.key} label={item.label} value={item.value} />
      ))}
    </FeesMetaChipGrid>
  )
}
