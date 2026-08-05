import type { GraphQLFeeStructure } from '../fees/hooks/useGraphQLFeeStructures'
import {
  dedupeTermsById,
  getPlanDisplayName,
  groupFeeStructuresByPlan,
} from '../fees/lib/feePlanGrouping'
import {
  isPlanExpired,
  resolvePlanEndDate,
} from '../fees/lib/feePlanLifecycle'
import type { ProcessedFeeStructure } from '../fees/components/FeeStructureManager/types'
import type { FeeStructureForm } from '../fees/types'
import {
  createDefaultLetterSchoolDetails,
  type LetterSchoolDetailsPayload,
} from '../fees/lib/feeLetter/letterSchoolDetails'

const PUBLIC_FEE_STRUCTURES_QUERY = `
  query PublicFeeStructures($subdomain: String!) {
    publicFeeStructures(subdomain: $subdomain) {
      id
      name
      planLabel
      academicYear { id name endDate }
      terms { id name endDate }
      gradeLevels { id shortName gradeLevel { id name } }
      items {
        id
        feeBucket { id name }
        amount
        isMandatory
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

const PUBLIC_LETTER_SETTINGS_QUERY = `
  query PublicTenantFeeLetterSettings($subdomain: String!) {
    publicTenantFeeLetterSettings(subdomain: $subdomain) {
      schoolDetails {
        name
        address
        contact
        email
        principalName
        principalTitle
      }
      paymentModes {
        bankAccounts {
          bankName
          branch
          accountNumber
        }
        postalAddress
        includePostalMoneyOrder
        notes
      }
      logoUrl
      schoolMotto
    }
  }
`

export type PublicFeePlan = ProcessedFeeStructure & {
  planLabel: string
}

export function processPublicFeeStructures(
  structures: GraphQLFeeStructure[],
): PublicFeePlan[] {
  const groups = groupFeeStructuresByPlan(structures)

  return Array.from(groups.values()).map((group) => {
    const termFeesMap = new Map<
      string,
      NonNullable<ProcessedFeeStructure['buckets']>
    >()
    const gradeLevelMap = new Map<string, PublicFeePlan['gradeLevels'][number]>()
    const allTerms: Array<{ id: string; name: string; endDate?: string }> = []

    group.forEach((structure) => {
      ;(structure.gradeLevels || []).forEach((gl) => {
        gradeLevelMap.set(gl.id, gl)
      })
      ;(structure.terms || []).forEach((term) => {
        allTerms.push(term)
      })

      const structureTerms = structure.terms || []
      const bucketMap = new Map<
        string,
        NonNullable<ProcessedFeeStructure['buckets']>[number]
      >()

      ;(structure.items || []).forEach((item) => {
        const bucketKey = item.feeBucket.id
        const existing = bucketMap.get(bucketKey)
        if (existing) {
          existing.totalAmount += item.amount
          existing.isOptional = existing.isOptional && !item.isMandatory
        } else {
          bucketMap.set(bucketKey, {
            id: item.feeBucket.id,
            name: item.feeBucket.name,
            totalAmount: item.amount,
            isOptional: !item.isMandatory,
            firstItemId: item.id,
            feeBucketId: item.feeBucket.id,
          })
        }
      })

      const buckets = Array.from(bucketMap.values())
      const applyBucketsToTerm = (termId: string) => {
        const existingBuckets = termFeesMap.get(termId) || []
        const merged = new Map(
          existingBuckets.map((b) => [b.feeBucketId, { ...b }]),
        )
        buckets.forEach((bucket) => {
          const existing = merged.get(bucket.feeBucketId)
          if (existing) {
            existing.totalAmount += bucket.totalAmount
            existing.isOptional = existing.isOptional && bucket.isOptional
          } else {
            merged.set(bucket.feeBucketId, { ...bucket })
          }
        })
        termFeesMap.set(termId, Array.from(merged.values()))
      }

      if (structureTerms.length === 1) {
        applyBucketsToTerm(structureTerms[0].id)
      } else {
        structureTerms.forEach((term) => applyBucketsToTerm(term.id))
      }
    })

    const base = group[0]
    const terms = dedupeTermsById(allTerms)
    const planDisplayName = getPlanDisplayName(base)
    const defaultTermId = terms[0]?.id || ''
    const defaultBuckets = termFeesMap.get(defaultTermId) || []
    const validUntilDate = resolvePlanEndDate(base.academicYear, terms)
    const planExpired = isPlanExpired(validUntilDate)
    const planIsActive = group.some((s) => s.isActive) && !planExpired

    return {
      structureId: base.id,
      structureName: planDisplayName,
      planLabel: base.planLabel ?? planDisplayName,
      academicYear: base.academicYear?.name || 'N/A',
      academicYearId: base.academicYear?.id || '',
      termName: terms[0]?.name || 'N/A',
      termId: defaultTermId,
      terms,
      gradeLevels: Array.from(gradeLevelMap.values()),
      buckets: defaultBuckets,
      termFeesMap: Object.fromEntries(termFeesMap),
      allStructures: group,
      isActive: planIsActive,
      isExpired: planExpired,
      validUntil: validUntilDate?.toISOString() ?? null,
      academicYearEndDate: base.academicYear?.endDate ?? null,
      createdAt: base.createdAt,
      updatedAt: group.reduce(
        (latest, s) => (s.updatedAt > latest ? s.updatedAt : latest),
        base.updatedAt,
      ),
    }
  })
}

export function buildFeeFormFromPlan(
  plan: PublicFeePlan,
  letterDetails: LetterSchoolDetailsPayload,
  gradeLabel?: string,
): FeeStructureForm {
  const termsToUse = plan.terms.length > 0 ? plan.terms : []
  const termStructures = termsToUse.map((term) => {
    const termBuckets = plan.termFeesMap?.[term.id] || plan.buckets || []
    return {
      term: term.name as 'Term 1' | 'Term 2' | 'Term 3',
      academicYear: plan.academicYear,
      dueDate: '',
      latePaymentFee: '',
      earlyPaymentDiscount: '',
      earlyPaymentDeadline: '',
      buckets: termBuckets.map((bucket) => ({
        id: bucket.feeBucketId,
        type: 'tuition' as const,
        name: bucket.name,
        description: '',
        isOptional: bucket.isOptional,
        components: [
          {
            name: bucket.name,
            description: '',
            amount: bucket.totalAmount.toString(),
            category: 'fee',
          },
        ],
      })),
      existingBucketAmounts: {},
    }
  })

  const firstGrade =
    gradeLabel ||
    plan.gradeLevels[0]?.gradeLevel?.name ||
    plan.gradeLevels[0]?.shortName ||
    plan.gradeLevels[0]?.name ||
    ''

  return {
    name: plan.structureName,
    grade: firstGrade,
    boardingType: 'both',
    academicYear: plan.academicYear,
    academicYearId: plan.academicYearId,
    schoolDetails: letterDetails.schoolDetails,
    paymentModes: letterDetails.paymentModes,
    termStructures:
      termStructures.length > 0
        ? termStructures
        : [
            {
              term: (plan.termName || 'Term 1') as 'Term 1' | 'Term 2' | 'Term 3',
              academicYear: plan.academicYear,
              dueDate: '',
              latePaymentFee: '',
              earlyPaymentDiscount: '',
              earlyPaymentDeadline: '',
              buckets: (plan.buckets || []).map((bucket) => ({
                id: bucket.feeBucketId,
                type: 'tuition' as const,
                name: bucket.name,
                description: '',
                isOptional: bucket.isOptional,
                components: [
                  {
                    name: bucket.name,
                    description: '',
                    amount: bucket.totalAmount.toString(),
                    category: 'fee',
                  },
                ],
              })),
              existingBucketAmounts: {},
            },
          ],
  }
}

const AUTH_FEE_STRUCTURES_QUERY = `
  query GetFeeStructures {
    feeStructures {
      id
      name
      planLabel
      academicYear { id name endDate }
      terms { id name endDate }
      gradeLevels { id shortName gradeLevel { id name } }
      items {
        id
        feeBucket { id name }
        amount
        isMandatory
      }
      isActive
      createdAt
      updatedAt
    }
  }
`

async function graphqlRequest(
  query: string,
  variables?: Record<string, unknown>,
  subdomain?: string,
) {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(subdomain ? { 'x-tenant-subdomain': subdomain } : {}),
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })
  return response.json()
}

export async function fetchPublicFeePlans(subdomain: string): Promise<{
  plans: PublicFeePlan[]
  letterDetails: LetterSchoolDetailsPayload
}> {
  const [structuresJson, letterJson] = await Promise.all([
    graphqlRequest(PUBLIC_FEE_STRUCTURES_QUERY, { subdomain }, subdomain),
    graphqlRequest(PUBLIC_LETTER_SETTINGS_QUERY, { subdomain }, subdomain),
  ])

  let structures = (structuresJson.data?.publicFeeStructures ||
    []) as GraphQLFeeStructure[]

  // Fallback for signed-in staff on local/dev when public tenant lookup is empty.
  if (!structures.length) {
    const authJson = await graphqlRequest(AUTH_FEE_STRUCTURES_QUERY, undefined, subdomain)
    if (authJson.data?.feeStructures?.length) {
      structures = authJson.data.feeStructures as GraphQLFeeStructure[]
    }
  }

  const plans = processPublicFeeStructures(structures).filter((p) => p.isActive)

  const letter = letterJson.data?.publicTenantFeeLetterSettings
  const defaults = createDefaultLetterSchoolDetails(subdomain)

  const letterDetails: LetterSchoolDetailsPayload = letter
    ? {
        schoolDetails: {
          ...defaults.schoolDetails,
          ...letter.schoolDetails,
        },
        paymentModes: {
          ...defaults.paymentModes,
          ...letter.paymentModes,
          bankAccounts:
            letter.paymentModes?.bankAccounts?.length > 0
              ? letter.paymentModes.bankAccounts
              : defaults.paymentModes.bankAccounts,
          notes:
            letter.paymentModes?.notes?.length > 0
              ? letter.paymentModes.notes
              : defaults.paymentModes.notes,
        },
        logoUrl: letter.logoUrl ?? null,
        schoolMotto: letter.schoolMotto || defaults.schoolMotto,
      }
    : defaults

  return { plans, letterDetails }
}

export function formatPlanGradeLabel(plan: PublicFeePlan): string {
  const labels = plan.gradeLevels
    .map((g) => g.gradeLevel?.name || g.shortName || g.name)
    .filter(Boolean) as string[]
  if (labels.length === 0) return 'All grades'
  if (labels.length <= 3) return labels.join(', ')
  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2} more`
}

export function planTermTotal(plan: PublicFeePlan): number {
  return (plan.buckets || []).reduce((sum, b) => sum + (b.totalAmount || 0), 0)
}
