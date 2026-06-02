import {
  DEFAULT_FEE_LETTER_TEMPLATE,
  isFeeLetterTemplateId,
} from './templates'
import type { FeeLetterTemplateId } from './types'

const PREFIX = 'squl:fee-letter-template:'

export function feeLetterTemplateStorageKey(scope: string): string {
  return `${PREFIX}${scope}`
}

export function readFeeLetterTemplate(scope: string): FeeLetterTemplateId {
  if (typeof window === 'undefined') return DEFAULT_FEE_LETTER_TEMPLATE
  try {
    const raw = window.localStorage.getItem(feeLetterTemplateStorageKey(scope))
    if (raw && isFeeLetterTemplateId(raw)) return raw
  } catch {
    /* ignore */
  }
  return DEFAULT_FEE_LETTER_TEMPLATE
}

export function writeFeeLetterTemplate(
  scope: string,
  templateId: FeeLetterTemplateId,
): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      feeLetterTemplateStorageKey(scope),
      templateId,
    )
  } catch {
    /* ignore quota */
  }
}
