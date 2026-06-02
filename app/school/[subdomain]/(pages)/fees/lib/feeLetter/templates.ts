import type { FeeLetterTemplateId } from './types'

export type FeeLetterTemplateMeta = {
  id: FeeLetterTemplateId
  label: string
  description: string
  /** Mini preview swatch for the picker */
  swatch: string
}

export const FEE_LETTER_TEMPLATES: FeeLetterTemplateMeta[] = [
  {
    id: 'classic',
    label: 'Classic official',
    description: 'Traditional circular with bordered tables',
    swatch: 'linear-gradient(180deg,#f3f4f6 0%,#fff 40%,#e5e7eb 100%)',
  },
  {
    id: 'modern',
    label: 'Modern clean',
    description: 'Sans-serif, soft borders, blue accents',
    swatch: 'linear-gradient(135deg,#2563eb 0%,#eff6ff 55%,#fff 100%)',
  },
  {
    id: 'formal',
    label: 'Formal ministry',
    description: 'Parchment manuscript, Schedule A ledger, BoM seal',
    swatch: 'linear-gradient(180deg,#5c1a2e 0%,#faf7f2 40%,#9a7b4f 100%)',
  },
  {
    id: 'compact',
    label: 'Compact',
    description: 'One-page docket: matrix, payment & sign side-by-side',
    swatch: 'linear-gradient(180deg,#1e293b 0%,#f1f5f9 55%,#fff 100%)',
  },
  {
    id: 'banner',
    label: 'Brand banner',
    description: 'Diagonal hero, term spotlight cards, brand pay rail',
    swatch: 'linear-gradient(135deg,#246a59 0%,#fff 45%,#1a4d41 100%)',
  },
  {
    id: 'kenya',
    label: 'Kenya circular',
    description: 'Flag tricolor, crest seal, circular ref, Schedule A matrix',
    swatch: 'linear-gradient(90deg,#1a1a1a 0%,#bb0000 33%,#006600 66%,#b8860b 100%)',
  },
]

export function isFeeLetterTemplateId(value: string): value is FeeLetterTemplateId {
  return FEE_LETTER_TEMPLATES.some((t) => t.id === value)
}

export const DEFAULT_FEE_LETTER_TEMPLATE: FeeLetterTemplateId = 'classic'
