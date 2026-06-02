import { sortTermsForLetter } from './sortTermsForLetter'
import type { FeeStructureForm } from '../types'
import type { BankAccount } from '../types'

export interface FeeWizardFormData {
  name: string
  planLabel?: string
  grade: string
  boardingType: 'day' | 'boarding' | 'both'
  academicYear: string
  academicYearId?: string
  selectedGrades: string[]
  selectedBuckets: string[]
  terms: Array<{ id: string; name: string }>
  bucketAmounts: Record<
    string,
    { id: string; name: string; amount: number; isMandatory: boolean; itemId?: string }
  >
  termBucketAmounts?: Record<
    string,
    Record<
      string,
      { id: string; name: string; amount: number; isMandatory: boolean; itemId?: string }
    >
  >
  schoolDetails: {
    name: string
    address: string
    contact: string
    email: string
    principalName: string
    principalTitle: string
  }
  paymentModes: {
    bankAccounts: BankAccount[]
    postalAddress: string
    includePostalMoneyOrder?: boolean
    notes: string[]
  }
  logoUrl: string | null
  schoolMotto?: string
  previewGrade: string
  previewTermIds: string[]
}

export function sortWizardTerms(
  terms: Array<{ id: string; name: string }>,
): Array<{ id: string; name: string }> {
  return sortTermsForLetter(terms)
}

export type BuildPdfFormOptions = {
  previewGrade?: string
  previewTermIds?: string[]
}

export function buildPdfFormFromWizard(
  form: FeeWizardFormData,
  options?: string | BuildPdfFormOptions,
): FeeStructureForm {
  const opts: BuildPdfFormOptions =
    typeof options === 'string' ? { previewGrade: options } : options ?? {}

  const gradeForLetter =
    opts.previewGrade?.trim() ||
    form.previewGrade?.trim() ||
    form.selectedGrades?.[0] ||
    form.grade ||
    ''

  const sortedTerms = sortWizardTerms(form.terms || [])
  const selectedTermIds = new Set(
    (opts.previewTermIds?.length
      ? opts.previewTermIds
      : form.previewTermIds?.length
        ? form.previewTermIds
        : sortedTerms.map((t) => t.id)
    ).filter((id) => sortedTerms.some((t) => t.id === id)),
  )
  const termsForLetter = sortedTerms.filter((t) => selectedTermIds.has(t.id))

  const hasTerms = termsForLetter.length > 0
  const hasTermAmounts =
    form.termBucketAmounts && Object.keys(form.termBucketAmounts).length > 0

  const baseMeta = {
    name: form.name,
    grade: gradeForLetter,
    boardingType: form.boardingType,
    academicYear: form.academicYear,
    schoolDetails: form.schoolDetails,
    paymentModes: form.paymentModes,
  }

  if (hasTerms && hasTermAmounts) {
    const termStructures = termsForLetter.map((term) => {
        const buckets = form.selectedBuckets.map((bucketId) => {
          const bucket =
            form.termBucketAmounts?.[term.id]?.[bucketId] ||
            form.bucketAmounts[bucketId]
          return {
            id: bucketId,
            type: 'tuition' as const,
            name: bucket?.name || 'Fee',
            description: '',
            isOptional: !bucket?.isMandatory,
            components: [
              {
                name: bucket?.name || 'Fee',
                description: '',
                amount: String(bucket?.amount ?? 0),
                category: 'fee',
              },
            ],
          }
        })

        return {
          term: term.name,
          academicYear: form.academicYear,
          dueDate: '',
          latePaymentFee: '',
          earlyPaymentDiscount: '',
          earlyPaymentDeadline: '',
          buckets,
          existingBucketAmounts: {},
        }
      }) || []

    return { ...baseMeta, termStructures }
  }

  const buckets = form.selectedBuckets.map((bucketId) => {
    const bucket = form.bucketAmounts[bucketId]
    return {
      id: bucketId,
      type: 'tuition' as const,
      name: bucket?.name || 'Fee',
      description: '',
      isOptional: !bucket?.isMandatory,
      components: [
        {
          name: bucket?.name || 'Fee',
          description: '',
          amount: String(bucket?.amount ?? 0),
          category: 'fee',
        },
      ],
    }
  })

  return {
    ...baseMeta,
    termStructures: [
      {
        term: 'Term 1',
        academicYear: form.academicYear,
        dueDate: '',
        latePaymentFee: '',
        earlyPaymentDiscount: '',
        earlyPaymentDeadline: '',
        buckets,
        existingBucketAmounts: {},
      },
    ],
  }
}
