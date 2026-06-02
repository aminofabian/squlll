import type { FeeWizardFormData } from './feesWizardPdfForm'
import { roundToNearestTen } from './feesAmounts'
import { stripTermSuffixFromPlanName } from './feePlanGrouping'
import type { FeeStructureItemInput } from '../hooks/useGraphQLFeeStructures'

export { stripTermSuffixFromPlanName } from './feePlanGrouping'

export type StructureItem = {
  id: string
  amount: number
  isMandatory: boolean
  feeBucket?: { id: string; name?: string }
}

export type StructureWithItems = {
  id?: string
  name?: string
  terms?: Array<{ id: string; name?: string }>
  items?: StructureItem[]
}

export type FeeStructureItemUpdatePayload = {
  itemId: string
  amount: number
  isMandatory: boolean
}

function parsePositiveAmount(value: unknown): number | null {
  const amount = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return amount
}

export function readAmountForTermBucket(
  formData: FeeWizardFormData,
  termId: string,
  bucketId: string,
): { amount: number; isMandatory: boolean } | null {
  if (termId) {
    const fromTerm = formData.termBucketAmounts?.[termId]?.[bucketId]
    const termAmount = parsePositiveAmount(fromTerm?.amount)
    if (termAmount !== null) {
      return {
        amount: termAmount,
        isMandatory: fromTerm?.isMandatory ?? true,
      }
    }
  }
  const global = formData.bucketAmounts[bucketId]
  const globalAmount = parsePositiveAmount(global?.amount)
  if (globalAmount !== null) {
    return {
      amount: globalAmount,
      isMandatory: global?.isMandatory ?? true,
    }
  }
  return null
}

/** True when any bucket has different positive amounts across selected terms. */
export function hasDifferentAmountsPerTerm(
  formData: FeeWizardFormData,
  bucketIds: string[],
): boolean {
  if (!formData.terms || formData.terms.length < 2) return false

  for (const bucketId of bucketIds) {
    const amounts = formData.terms.map((term) => {
      const parsed = readAmountForTermBucket(formData, term.id, bucketId)
      return parsed ? roundToNearestTen(parsed.amount) : 0
    })
    const positive = amounts.filter((a) => a > 0)
    if (positive.length < 2) continue
    const first = positive[0]
    if (positive.some((a) => a !== first)) return true
  }
  return false
}

export function isCombinedMultiTermStructure(struct: StructureWithItems): boolean {
  return (struct.terms?.length ?? 0) > 1
}

export function buildItemsForTerm(
  formData: FeeWizardFormData,
  termId: string,
  bucketIds: string[],
): FeeStructureItemInput[] {
  const items: FeeStructureItemInput[] = []
  const used = new Set<string>()

  for (const bucketId of bucketIds) {
    if (used.has(bucketId)) continue
    const bucket = readAmountForTermBucket(formData, termId, bucketId)
    if (!bucket) continue
    items.push({
      feeBucketId: bucketId,
      amount: roundToNearestTen(bucket.amount),
      isMandatory: bucket.isMandatory,
      termIds: [termId],
    })
    used.add(bucketId)
  }
  return items
}

function itemPayloadIfChanged(
  item: StructureItem,
  parsed: { amount: number; isMandatory: boolean },
): FeeStructureItemUpdatePayload | null {
  const amount = roundToNearestTen(parsed.amount)
  const currentAmount = parsePositiveAmount(item.amount)
  if (
    currentAmount !== null &&
    roundToNearestTen(currentAmount) === amount &&
    item.isMandatory === parsed.isMandatory
  ) {
    return null
  }
  return {
    itemId: item.id,
    amount,
    isMandatory: parsed.isMandatory,
  }
}

/**
 * Build line-item updates for one fee structure row (must match that row's term scope).
 */
export function buildItemUpdatesForStructure(
  formData: FeeWizardFormData,
  struct: StructureWithItems,
): FeeStructureItemUpdatePayload[] {
  const updates: FeeStructureItemUpdatePayload[] = []
  const structTerms = struct.terms ?? []

  for (const item of struct.items ?? []) {
    const bucketId = item.feeBucket?.id
    if (!bucketId || !item.id) continue

    let parsed: { amount: number; isMandatory: boolean } | null = null

    if (structTerms.length === 1) {
      parsed = readAmountForTermBucket(formData, structTerms[0].id, bucketId)
    } else if (structTerms.length > 1) {
      for (const term of formData.terms ?? []) {
        parsed = readAmountForTermBucket(formData, term.id, bucketId)
        if (parsed) break
      }
    } else {
      for (const term of formData.terms ?? []) {
        parsed = readAmountForTermBucket(formData, term.id, bucketId)
        if (parsed) break
      }
    }

    if (!parsed) continue
    const payload = itemPayloadIfChanged(item, parsed)
    if (payload) updates.push(payload)
  }

  return updates
}

/**
 * Map edited wizard amounts to fee_structure_items across one or more structures.
 */
export function buildFeeStructureItemUpdates(
  formData: FeeWizardFormData,
  options: {
    allStructures?: StructureWithItems[]
    structureData?: StructureWithItems | null
  },
): FeeStructureItemUpdatePayload[] {
  const byId = new Map<string, FeeStructureItemUpdatePayload>()
  const structures =
    options.allStructures && options.allStructures.length > 0
      ? options.allStructures
      : options.structureData
        ? [options.structureData]
        : []

  for (const struct of structures) {
    if (isCombinedMultiTermStructure(struct)) continue
    for (const update of buildItemUpdatesForStructure(formData, struct)) {
      byId.set(update.itemId, update)
    }
  }

  return Array.from(byId.values())
}
