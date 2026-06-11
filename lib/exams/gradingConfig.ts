import { chatGraphqlFetch } from '@/lib/chat/graphql'

export interface GradingScaleThreshold {
  min: number
  max: number
  grade: string
  points?: number | null
  description?: string | null
}

export interface GradingScale {
  id: string
  name: string
  isDefault: boolean
  thresholds: GradingScaleThreshold[]
  createdAt: string
  updatedAt: string
}

export interface AssessmentWeight {
  id: string
  tenantGradeLevelId: string
  tenantSubjectId?: string | null
  caWeight: number
  examWeight: number
  isDefault: boolean
}

const GRADING_SCALES = `
  query GradingScales {
    gradingScales {
      id
      name
      isDefault
      createdAt
      updatedAt
      thresholds {
        min
        max
        grade
        points
        description
      }
    }
  }
`

const ASSESSMENT_WEIGHTS = `
  query AssessmentWeights {
    assessmentWeights {
      id
      tenantGradeLevelId
      tenantSubjectId
      caWeight
      examWeight
      isDefault
    }
  }
`

const SEED_KENYAN_SCALE = `
  mutation SeedDefaultKenyanGradingScale {
    seedDefaultKenyanGradingScale {
      id
      name
      isDefault
      thresholds {
        grade
        min
        max
        points
      }
    }
  }
`

const CREATE_ASSESSMENT_WEIGHT = `
  mutation CreateAssessmentWeight($input: CreateAssessmentWeightInput!) {
    createAssessmentWeight(input: $input) {
      id
      tenantGradeLevelId
      tenantSubjectId
      caWeight
      examWeight
      isDefault
    }
  }
`

const DELETE_ASSESSMENT_WEIGHT = `
  mutation DeleteAssessmentWeight($id: ID!) {
    deleteAssessmentWeight(id: $id)
  }
`

export async function fetchGradingScales(
  subdomain: string,
): Promise<GradingScale[]> {
  const data = await chatGraphqlFetch<{ gradingScales: GradingScale[] }>(
    GRADING_SCALES,
    {},
    subdomain,
  )
  return data.gradingScales ?? []
}

export async function fetchAssessmentWeights(
  subdomain: string,
): Promise<AssessmentWeight[]> {
  const data = await chatGraphqlFetch<{ assessmentWeights: AssessmentWeight[] }>(
    ASSESSMENT_WEIGHTS,
    {},
    subdomain,
  )
  return data.assessmentWeights ?? []
}

export async function seedKenyanGradingScale(
  subdomain: string,
): Promise<GradingScale> {
  const data = await chatGraphqlFetch<{
    seedDefaultKenyanGradingScale: GradingScale
  }>(SEED_KENYAN_SCALE, {}, subdomain)
  return data.seedDefaultKenyanGradingScale
}

export async function createAssessmentWeight(
  subdomain: string,
  input: {
    tenantGradeLevelId: string
    tenantSubjectId?: string
    caWeight: number
    examWeight: number
    isDefault?: boolean
  },
): Promise<AssessmentWeight> {
  const data = await chatGraphqlFetch<{
    createAssessmentWeight: AssessmentWeight
  }>(CREATE_ASSESSMENT_WEIGHT, { input }, subdomain)
  return data.createAssessmentWeight
}

export async function deleteAssessmentWeight(
  subdomain: string,
  id: string,
): Promise<boolean> {
  const data = await chatGraphqlFetch<{ deleteAssessmentWeight: boolean }>(
    DELETE_ASSESSMENT_WEIGHT,
    { id },
    subdomain,
  )
  return data.deleteAssessmentWeight
}
