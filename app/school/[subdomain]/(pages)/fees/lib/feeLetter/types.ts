import type { FeeStructureForm } from '../../types'

export const FEE_LETTER_TEMPLATE_IDS = [
  'classic',
  'modern',
  'formal',
  'compact',
  'banner',
  'kenya',
] as const

export type FeeLetterTemplateId = (typeof FEE_LETTER_TEMPLATE_IDS)[number]

export type VoteHeadLine = { name: string; amount: number; optional: boolean }

export type FeeLetterTermBlock = {
  term: string
  lines: VoteHeadLine[]
  subtotal: number
}

export type FeeLetterBankAccount = {
  bankName: string
  branch?: string
  accountNumber?: string
}

export type FeeLetterModel = {
  displaySchool: string
  displayAddress: string
  displayContact: string
  displayEmail: string
  principalName: string
  principalTitle: string
  titleText: string
  termScopeLine?: string
  termlyHeading: string
  resolvedTotalLabel: string
  dateStr: string
  terms: FeeLetterTermBlock[]
  grandTotal: number
  hasAnyLines: boolean
  bankAccounts: FeeLetterBankAccount[]
  paymentNotes: string[]
  postalAddress?: string
  includePostalMoneyOrder?: boolean
  logoUrl: string | null
  /** Subdomain or school name — used for generated logo when logoUrl is empty */
  schoolLogoKey: string
  schoolMotto: string
  schoolWebsiteUrl: string
}

export type BuildFeeLetterModelInput = {
  formData: FeeStructureForm
  schoolName?: string
  schoolAddress?: string
  schoolContact?: string
  schoolEmail?: string
  logoUrl?: string | null
  schoolLogoKey?: string
  schoolMotto?: string
  schoolWebsiteUrl?: string
  feeBuckets?: Array<{ id: string; name: string; description?: string }>
  gradeLevels?: Array<{ id: string; name?: string; gradeLevel?: { name: string } }>
  termScopeLine?: string
  totalRowLabel?: string
}
