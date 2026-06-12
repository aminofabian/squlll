import { chatGraphqlFetch } from '@/lib/chat/graphql'

export interface GradingScaleThresholdRecord {
  grade: string
  min: number
  max: number
  description?: string | null
}

export interface GradingScaleRecord {
  id: string
  name: string
  isDefault: boolean
  thresholds?: GradingScaleThresholdRecord[]
}

const GRADING_SCALES_QUERY = `
  query GradingScales {
    gradingScales {
      id
      name
      isDefault
      thresholds {
        grade
        min
        max
        description
      }
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

export function formatGradingScaleSummary(scale: GradingScaleRecord): string {
  const thresholds = scale.thresholds ?? []
  if (thresholds.length === 0) return scale.name

  const sorted = [...thresholds].sort((a, b) => b.min - a.min)
  const top = sorted[0]?.grade
  const bottom = sorted[sorted.length - 1]?.grade
  const letterRange =
    top && bottom && top !== bottom ? `${top}–${bottom}` : top ?? bottom

  if (letterRange) {
    return `${scale.name} (${letterRange} letter scale)`
  }
  return scale.name
}

export function getDefaultGradingScale(
  scales: GradingScaleRecord[] | undefined,
): GradingScaleRecord | null {
  if (!scales?.length) return null
  return scales.find((scale) => scale.isDefault) ?? scales[0]
}
