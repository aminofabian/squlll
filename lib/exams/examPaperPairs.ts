import type { TenantSubject } from '@/lib/hooks/useTenantSubjects'
import type { Subject } from '@/lib/types/school-config'
import type { PaperComponentSelection } from './examPaperComponents'

export interface ExamPaperPair {
  tenantGradeLevelId: string
  tenantSubjectId: string
  gradeName: string
  subjectName: string
  levelId: string
  levelName: string
}

export interface ExamPaperSpec {
  tenantGradeLevelId: string
  tenantSubjectId: string
  gradeName: string
  subjectName: string
  paperComponent: string
  paperLabel: string
  durationMinutes: number
}

type GradeLookup = (
  gradeId: string,
) =>
  | { grade: { id: string; name: string }; levelId: string; levelName: string }
  | undefined

type SubjectsByLevel = (levelId: string) => Subject[]

function subjectLabel(ts: TenantSubject): string {
  return ts.subject?.name ?? ts.customSubject?.name ?? ts.name ?? 'Subject'
}

function subjectCode(ts: TenantSubject): string {
  return (ts.subject?.code ?? ts.customSubject?.code ?? '').toLowerCase().trim()
}

function isSubjectAllowedForLevel(
  ts: TenantSubject,
  levelId: string,
  levelSubjects: Subject[],
): boolean {
  if (ts.curriculum.id !== levelId) return false

  if (levelSubjects.length === 0) return true

  const name = subjectLabel(ts).toLowerCase().trim()
  const code = subjectCode(ts)
  const allowedNames = new Set(
    levelSubjects.map((s) => s.name.toLowerCase().trim()),
  )
  const allowedCodes = new Set(
    levelSubjects
      .map((s) => s.code?.toLowerCase().trim())
      .filter(Boolean) as string[],
  )

  return (
    allowedNames.has(name) || (code.length > 0 && allowedCodes.has(code))
  )
}

/** Valid exam papers = each selected grade × subjects taught in that grade's level. */
export function buildExamPaperPairs(params: {
  selectedGradeIds: string[]
  selectedSubjectIds: string[]
  tenantSubjects: TenantSubject[]
  getGradeById: GradeLookup
  getSubjectsByLevelId: SubjectsByLevel
}): ExamPaperPair[] {
  const {
    selectedGradeIds,
    selectedSubjectIds,
    tenantSubjects,
    getGradeById,
    getSubjectsByLevelId,
  } = params

  const selectedSubjectSet = new Set(selectedSubjectIds)
  const pairs: ExamPaperPair[] = []
  const seen = new Set<string>()

  for (const gradeId of selectedGradeIds) {
    const gradeInfo = getGradeById(gradeId)
    if (!gradeInfo) continue

    const levelSubjects = getSubjectsByLevelId(gradeInfo.levelId)

    for (const ts of tenantSubjects) {
      if (!selectedSubjectSet.has(ts.id)) continue
      if (!isSubjectAllowedForLevel(ts, gradeInfo.levelId, levelSubjects)) {
        continue
      }

      const key = `${gradeId}:${ts.id}`
      if (seen.has(key)) continue
      seen.add(key)

      pairs.push({
        tenantGradeLevelId: gradeId,
        tenantSubjectId: ts.id,
        gradeName: gradeInfo.grade.name,
        subjectName: subjectLabel(ts),
        levelId: gradeInfo.levelId,
        levelName: gradeInfo.levelName,
      })
    }
  }

  return pairs
}

/** Expand grade × subject pairs into individual exam papers with components. */
export function buildExamPaperSpecs(params: {
  selectedGradeIds: string[]
  selectedSubjectIds: string[]
  subjectPaperConfigs: Record<string, PaperComponentSelection[]>
  tenantSubjects: TenantSubject[]
  getGradeById: GradeLookup
  getSubjectsByLevelId: SubjectsByLevel
}): ExamPaperSpec[] {
  const pairs = buildExamPaperPairs(params)
  const subjectById = new Map(params.tenantSubjects.map((ts) => [ts.id, ts]))
  const specs: ExamPaperSpec[] = []

  for (const pair of pairs) {
    const configs = params.subjectPaperConfigs[pair.tenantSubjectId] ?? []
    const enabled = configs.filter((c) => c.enabled)

    for (const component of enabled) {
      specs.push({
        tenantGradeLevelId: pair.tenantGradeLevelId,
        tenantSubjectId: pair.tenantSubjectId,
        gradeName: pair.gradeName,
        subjectName: pair.subjectName,
        paperComponent: component.id,
        paperLabel: component.label,
        durationMinutes: component.durationMinutes,
      })
    }
  }

  return specs
}

/** Subjects taught in a single grade's curriculum level. */
export function subjectsForGrade(params: {
  gradeId: string
  tenantSubjects: TenantSubject[]
  getGradeById: GradeLookup
  getSubjectsByLevelId: SubjectsByLevel
}): Array<{ id: string; name: string; code?: string }> {
  const gradeInfo = params.getGradeById(params.gradeId)
  if (!gradeInfo) return []

  const levelSubjects = params.getSubjectsByLevelId(gradeInfo.levelId)

  return params.tenantSubjects
    .filter((ts) =>
      isSubjectAllowedForLevel(ts, gradeInfo.levelId, levelSubjects),
    )
    .map((ts) => ({
      id: ts.id,
      name: subjectLabel(ts),
      code: ts.subject?.code ?? ts.customSubject?.code ?? undefined,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Union of tenant subjects taught across the selected grades. */
export function subjectsForGrades(params: {
  gradeIds: string[]
  tenantSubjects: TenantSubject[]
  getGradeById: GradeLookup
  getSubjectsByLevelId: SubjectsByLevel
}): Array<{ id: string; name: string; code?: string; levelName: string }> {
  const seen = new Set<string>()
  const list: Array<{ id: string; name: string; code?: string; levelName: string }> = []

  for (const gradeId of params.gradeIds) {
    const gradeInfo = params.getGradeById(gradeId)
    if (!gradeInfo) continue

    const levelSubjects = params.getSubjectsByLevelId(gradeInfo.levelId)

    for (const ts of params.tenantSubjects) {
      if (seen.has(ts.id)) continue
      if (!isSubjectAllowedForLevel(ts, gradeInfo.levelId, levelSubjects)) {
        continue
      }
      seen.add(ts.id)
      list.push({
        id: ts.id,
        name: subjectLabel(ts),
        code: ts.subject?.code ?? ts.customSubject?.code ?? undefined,
        levelName: gradeInfo.levelName,
      })
    }
  }

  return list.sort((a, b) => a.name.localeCompare(b.name))
}

export function examSessionPaperCount(
  selectedGradeIds: string[],
  selectedSubjectIds: string[],
  subjectPaperConfigs: Record<string, PaperComponentSelection[]>,
  tenantSubjects: TenantSubject[],
  getGradeById: GradeLookup,
  getSubjectsByLevelId: SubjectsByLevel,
): number {
  return buildExamPaperSpecs({
    selectedGradeIds,
    selectedSubjectIds,
    subjectPaperConfigs,
    tenantSubjects,
    getGradeById,
    getSubjectsByLevelId,
  }).length
}
