import { sortTermsForLetter } from './sortTermsForLetter'

/** Strip trailing " - Term 1" / " - Term II" style suffixes for plan grouping. */
export function stripTermSuffixFromPlanName(name: string): string {
  return name
    .replace(/\s*[-–—]\s*Term\s+[\dIVXLC]+\s*$/i, '')
    .trim()
}

export type FeeStructureGroupSource = {
  name: string
  planLabel?: string | null
  academicYear?: { id: string } | null
}

/** Display title for a grouped fee plan card. */
export function getPlanDisplayName(structure: FeeStructureGroupSource): string {
  const label = structure.planLabel?.trim()
  if (label) return label
  return stripTermSuffixFromPlanName(structure.name)
}

export function getFeePlanGroupKey(structure: FeeStructureGroupSource): string {
  const display = getPlanDisplayName(structure)
  return `${display}__${structure.academicYear?.id ?? ''}`
}

export function dedupeTermsById<T extends { id: string; name: string }>(
  terms: T[],
): T[] {
  const map = new Map<string, T>()
  for (const term of terms) {
    map.set(term.id, term)
  }
  return sortTermsForLetter(Array.from(map.values()))
}

export function groupFeeStructuresByPlan<T extends FeeStructureGroupSource>(
  structures: T[],
): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const structure of structures) {
    const key = getFeePlanGroupKey(structure)
    const list = groups.get(key) ?? []
    list.push(structure)
    groups.set(key, list)
  }
  return groups
}

/** Resolve planLabel for create/update (explicit wins, else base name). */
export function resolvePlanLabel(
  explicit: string | null | undefined,
  structureName: string,
): string {
  const trimmed = explicit?.trim()
  if (trimmed) return trimmed
  return stripTermSuffixFromPlanName(structureName)
}
