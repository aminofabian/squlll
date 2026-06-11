import { chatGraphqlFetch } from '@/lib/chat/graphql'

export interface GradingScaleRecord {
  id: string
  name: string
  isDefault: boolean
}

const GRADING_SCALES_QUERY = `
  query GradingScales {
    gradingScales {
      id
      name
      isDefault
    }
  }
`

const SEED_CURRICULUM_SCALES = `
  mutation SeedCurriculumGradingSchemes {
    seedCurriculumGradingSchemes {
      id
      name
      isDefault
    }
  }
`

export async function fetchGradingScales(
  subdomain: string,
): Promise<GradingScaleRecord[]> {
  const data = await chatGraphqlFetch<{ gradingScales: GradingScaleRecord[] }>(
    GRADING_SCALES_QUERY,
    {},
    subdomain,
  )
  return data.gradingScales ?? []
}

export async function seedCurriculumGradingSchemes(
  subdomain: string,
): Promise<GradingScaleRecord[]> {
  const data = await chatGraphqlFetch<{
    seedCurriculumGradingSchemes: GradingScaleRecord[]
  }>(SEED_CURRICULUM_SCALES, {}, subdomain)
  return data.seedCurriculumGradingSchemes ?? []
}

export const SESSION_TEMPLATE_LABELS: Record<string, string> = {
  END_OF_TERM: 'End of term',
  MID_TERM: 'Mid-term',
  MOCK_EXAM: 'Mock exam',
  KCSE_TRIAL: 'KCSE trial',
}
