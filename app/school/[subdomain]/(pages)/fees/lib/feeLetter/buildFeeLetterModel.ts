import { DEFAULT_SCHOOL_MOTTO } from '@/lib/schoolLogo'
import { sortTermNamesForLetter } from '../sortTermsForLetter'
import type { FeeStructureForm } from '../../types'
import type {
  BuildFeeLetterModelInput,
  FeeLetterBankAccount,
  FeeLetterModel,
  VoteHeadLine,
} from './types'

export function formatKes(amount: number): string {
  return amount.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatAcademicYearTitle(year: string): string {
  const range = year.match(/(\d{4})[-/](\d{4})/)
  if (range) return `${range[1]}-${range[2]}`
  const single = year.match(/\d{4}/)
  if (single) {
    const y = parseInt(single[0], 10)
    return `${y}-${y + 1}`
  }
  return year
}

function voteHeadsFromTerm(
  termStruct: FeeStructureForm['termStructures'][0],
  feeBuckets: BuildFeeLetterModelInput['feeBuckets'],
): VoteHeadLine[] {
  const lines: VoteHeadLine[] = []

  termStruct.buckets?.forEach((bucket) => {
    bucket.components?.forEach((comp) => {
      const amt = parseFloat(String(comp.amount ?? '0'))
      if (!comp.name?.trim() || amt <= 0) return
      lines.push({
        name: comp.name.toUpperCase(),
        amount: amt,
        optional: Boolean(bucket.isOptional),
      })
    })
  })

  if (termStruct.existingBucketAmounts && feeBuckets && feeBuckets.length > 0) {
    feeBuckets.forEach((bucket) => {
      const raw = termStruct.existingBucketAmounts?.[bucket.id]
      const amt = parseFloat(String(raw ?? '0'))
      if (!raw || amt <= 0) return
      if (lines.some((l) => l.name === bucket.name.toUpperCase())) return
      lines.push({ name: bucket.name.toUpperCase(), amount: amt, optional: false })
    })
  }

  return lines.sort((a, b) => b.amount - a.amount)
}

function termTotal(
  termStruct: FeeStructureForm['termStructures'][0],
  feeBuckets: BuildFeeLetterModelInput['feeBuckets'],
): number {
  return voteHeadsFromTerm(termStruct, feeBuckets).reduce((s, l) => s + l.amount, 0)
}

const DEFAULT_BANKS: FeeLetterBankAccount[] = [
  {
    bankName: 'Kenya Commercial Bank',
    branch: '………… Branch',
    accountNumber: '……………………',
  },
  {
    bankName: 'Co-operative Bank of Kenya',
    branch: '………… Branch',
    accountNumber: '……………………',
  },
]

export function buildFeeLetterModel(
  input: BuildFeeLetterModelInput,
): FeeLetterModel {
  const {
    formData,
    schoolName = 'SCHOOL NAME',
    schoolAddress = 'P.O. Box — Kenya',
    schoolContact = '',
    schoolEmail = '',
    logoUrl = null,
    schoolLogoKey = '',
    schoolMotto,
    schoolWebsiteUrl = '',
    feeBuckets = [],
    gradeLevels = [],
    termScopeLine,
    totalRowLabel,
  } = input

  const details = formData.schoolDetails
  const displaySchool = (details?.name || schoolName).toUpperCase()
  const displayAddress = details?.address || schoolAddress
  const displayContact = details?.contact || schoolContact
  const displayEmail = details?.email || schoolEmail
  const principalName = details?.principalName || '………………………………'
  const principalTitle = details?.principalTitle || 'PRINCIPAL / SEC BOM'

  const order = sortTermNamesForLetter(
    formData.termStructures.map((t) => t.term),
  )
  const rank = new Map(order.map((name, i) => [name, i]))
  const sortedTerms = [...formData.termStructures].sort(
    (a, b) => (rank.get(a.term) ?? 999) - (rank.get(b.term) ?? 999),
  )

  const terms = sortedTerms.map((termStruct) => ({
    term: termStruct.term,
    lines: voteHeadsFromTerm(termStruct, feeBuckets),
    subtotal: termTotal(termStruct, feeBuckets),
  }))

  const grandTotal = terms.reduce((s, t) => s + t.subtotal, 0)
  const hasAnyLines = terms.some((t) => t.lines.length > 0)

  const resolvedTotalLabel =
    totalRowLabel ??
    (sortedTerms.length === 1 ? 'TOTAL' : 'TOTAL (ANNUAL)')

  const termlyHeading =
    sortedTerms.length === 1
      ? `PAYMENT FOR ${sortedTerms[0].term.toUpperCase()}`
      : `TERMLY PAYMENT FOR THE YEAR ${formData.academicYear.toUpperCase()}`

  let gradeSuffix = ''
  if (gradeLevels.length > 0) {
    const names = gradeLevels
      .map((g) => (g.gradeLevel?.name || g.name || '').trim())
      .filter(Boolean)
    if (names.length === 1) gradeSuffix = ` - ${names[0].toUpperCase()}`
    else if (names.length <= 4)
      gradeSuffix = ` - ${names.map((n) => n.toUpperCase()).join(', ')}`
    else gradeSuffix = ` - ${names.length} GRADES`
  } else if (formData.grade?.trim()) {
    gradeSuffix = ` - ${formData.grade.toUpperCase()}`
  }

  const academicYearFormatted = formatAcademicYearTitle(formData.academicYear)
  const titleText = `FEES STRUCTURE ${academicYearFormatted}${gradeSuffix}`

  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const bankAccounts = formData.paymentModes?.bankAccounts?.length
    ? formData.paymentModes.bankAccounts
    : DEFAULT_BANKS

  const paymentNotes = formData.paymentModes?.notes ?? [
    'The school official receipts shall be issued upon presentation of original pay-in slips or money order copies.',
    'Fees may be deposited at any branch of the listed banks countrywide.',
    "Fees can be paid by banker's cheque; personal cheques will not be accepted unless otherwise stated.",
  ]

  return {
    displaySchool,
    displayAddress,
    displayContact,
    displayEmail,
    principalName,
    principalTitle,
    titleText,
    termScopeLine,
    termlyHeading,
    resolvedTotalLabel,
    dateStr,
    terms,
    grandTotal,
    hasAnyLines,
    bankAccounts,
    paymentNotes,
    postalAddress:
      formData.paymentModes?.includePostalMoneyOrder &&
      formData.paymentModes?.postalAddress?.trim()
        ? formData.paymentModes.postalAddress
        : undefined,
    includePostalMoneyOrder: Boolean(
      formData.paymentModes?.includePostalMoneyOrder,
    ),
    logoUrl,
    schoolLogoKey: schoolLogoKey.trim() || displaySchool,
    schoolMotto: schoolMotto?.trim() || DEFAULT_SCHOOL_MOTTO,
    schoolWebsiteUrl: schoolWebsiteUrl.trim(),
  }
}
