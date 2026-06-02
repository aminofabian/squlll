import type { FeeLetterModel } from './types'

export type FeeLetterPivot = {
  terms: FeeLetterModel['terms']
  headOrder: string[]
  headMeta: Map<string, { label: string; optional: boolean }>
  grid: Map<string, Map<string, number>>
}

/** Vote heads as rows, terms as columns (only terms with line items). */
export function buildFeeLetterPivot(model: FeeLetterModel): FeeLetterPivot {
  const terms = model.terms.filter((t) => t.lines.length > 0)
  const headOrder: string[] = []
  const headMeta = new Map<string, { label: string; optional: boolean }>()
  const grid = new Map<string, Map<string, number>>()

  for (const term of terms) {
    for (const line of term.lines) {
      const key = line.name.trim().toUpperCase()
      if (!headMeta.has(key)) {
        headMeta.set(key, { label: line.name, optional: line.optional })
        headOrder.push(key)
      }
      if (!grid.has(key)) grid.set(key, new Map())
      grid.get(key)!.set(term.term, line.amount)
    }
  }

  return { terms, headOrder, headMeta, grid }
}
