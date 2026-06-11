import { chatGraphqlFetch } from '@/lib/chat/graphql'

export type SneDisabilityType =
  | 'PHYSICAL'
  | 'VISUAL'
  | 'HEARING'
  | 'LEARNING'
  | 'AUTISM'
  | 'SPEECH'
  | 'OTHER'

export interface StudentSneProfile {
  id: string
  studentId: string
  disabilityType: SneDisabilityType
  iepSummary?: string | null
  extraTimePercent: number
  requiresAdaptedFormat: boolean
  accommodations?: string | null
}

const GET_PROFILE = `
  query StudentSneProfile($studentId: String!) {
    studentSneProfile(studentId: $studentId) {
      id
      studentId
      disabilityType
      iepSummary
      extraTimePercent
      requiresAdaptedFormat
      accommodations
    }
  }
`

const UPSERT_PROFILE = `
  mutation UpsertStudentSneProfile($input: UpsertStudentSneProfileInput!) {
    upsertStudentSneProfile(input: $input) {
      id
      studentId
      disabilityType
      iepSummary
      extraTimePercent
      requiresAdaptedFormat
      accommodations
    }
  }
`

export async function fetchStudentSneProfile(
  subdomain: string,
  studentId: string,
): Promise<StudentSneProfile | null> {
  const data = await chatGraphqlFetch<{
    studentSneProfile: StudentSneProfile | null
  }>(GET_PROFILE, { studentId }, subdomain)
  return data.studentSneProfile
}

export async function upsertStudentSneProfile(
  subdomain: string,
  input: {
    studentId: string
    disabilityType?: SneDisabilityType
    iepSummary?: string
    extraTimePercent?: number
    requiresAdaptedFormat?: boolean
    accommodations?: string
  },
): Promise<StudentSneProfile> {
  const data = await chatGraphqlFetch<{
    upsertStudentSneProfile: StudentSneProfile
  }>(UPSERT_PROFILE, { input }, subdomain)
  return data.upsertStudentSneProfile
}
