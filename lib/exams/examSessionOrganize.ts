import type { ExamPaperRecord, ExamSessionRecord } from './examSessions'
import { getSessionGrades } from './examSessions'
import { formatGradeDisplayName } from '@/lib/utils/grade-display'

export function paperSubjectName(paper: ExamPaperRecord): string {
  return (
    paper.tenantSubject?.subject?.name ??
    paper.tenantSubject?.customSubject?.name ??
    'Subject'
  )
}

export function paperSubjectCode(paper: ExamPaperRecord): string | undefined {
  return (
    paper.tenantSubject?.subject?.code ??
    paper.tenantSubject?.customSubject?.code ??
    undefined
  )
}

export interface SubjectCluster<T = ExamPaperRecord> {
  subjectId: string
  subjectName: string
  subjectCode?: string
  papers: T[]
}

export interface ClassOrganizerGroup<T = ExamPaperRecord> {
  gradeId: string
  gradeName: string
  subjects: SubjectCluster<T>[]
  paperCount: number
  subjectCount: number
}

export function buildGradeOrderMap(
  session: ExamSessionRecord,
): Map<string, number> {
  return new Map(getSessionGrades(session).map((grade, index) => [grade.id, index]))
}

export function organizeByClassAndSubject<T>({
  items,
  gradeFilter = 'all',
  gradeOrder,
  getGradeId,
  getSubjectId,
  getSubjectName,
  getSubjectCode,
  getGradeName,
  sortPapers,
}: {
  items: T[]
  gradeFilter?: string
  gradeOrder?: Map<string, number>
  getGradeId: (item: T) => string
  getSubjectId: (item: T) => string
  getSubjectName: (item: T) => string
  getSubjectCode?: (item: T) => string | undefined
  getGradeName: (item: T, gradeId: string) => string
  sortPapers?: (a: T, b: T) => number
}): ClassOrganizerGroup<T>[] {
  const visible =
    gradeFilter === 'all'
      ? items
      : items.filter((item) => getGradeId(item) === gradeFilter)

  const byGrade = new Map<string, T[]>()
  for (const item of visible) {
    const gradeId = getGradeId(item)
    const list = byGrade.get(gradeId) ?? []
    list.push(item)
    byGrade.set(gradeId, list)
  }

  const paperSort =
    sortPapers ??
    ((a: T, b: T) => String(a).localeCompare(String(b)))

  return Array.from(byGrade.entries())
    .map(([gradeId, gradeItems]) => {
      const bySubject = new Map<string, T[]>()
      for (const item of gradeItems) {
        const subjectId = getSubjectId(item)
        const list = bySubject.get(subjectId) ?? []
        list.push(item)
        bySubject.set(subjectId, list)
      }

      const subjects: SubjectCluster<T>[] = Array.from(bySubject.entries())
        .map(([subjectId, subjectItems]) => ({
          subjectId,
          subjectName: getSubjectName(subjectItems[0]),
          subjectCode: getSubjectCode?.(subjectItems[0]),
          papers: [...subjectItems].sort(paperSort),
        }))
        .sort((a, b) => a.subjectName.localeCompare(b.subjectName))

      return {
        gradeId,
        gradeName: getGradeName(gradeItems[0], gradeId),
        subjects,
        paperCount: gradeItems.length,
        subjectCount: subjects.length,
      }
    })
    .sort(
      (a, b) =>
        (gradeOrder?.get(a.gradeId) ?? 999) -
        (gradeOrder?.get(b.gradeId) ?? 999),
    )
}

export function organizeSessionPapers(
  papers: ExamPaperRecord[],
  options: {
    gradeFilter?: string
    gradeOrder?: Map<string, number>
  } = {},
): ClassOrganizerGroup<ExamPaperRecord>[] {
  return organizeByClassAndSubject({
    items: papers,
    gradeFilter: options.gradeFilter,
    gradeOrder: options.gradeOrder,
    getGradeId: (paper) => paper.tenantGradeLevelId,
    getSubjectId: (paper) => paper.tenantSubjectId,
    getSubjectName: paperSubjectName,
    getSubjectCode: paperSubjectCode,
    getGradeName: (paper, gradeId) =>
      formatGradeDisplayName(
        paper.tenantGradeLevel?.gradeLevel?.name ?? gradeId,
      ),
    sortPapers: (a, b) =>
      (a.paperLabel ?? a.paperComponent ?? '').localeCompare(
        b.paperLabel ?? b.paperComponent ?? '',
      ),
  })
}

export function sessionScopeStats(session: ExamSessionRecord) {
  const papers = session.papers ?? []
  const grades = getSessionGrades(session)
  const subjectIds = new Set(papers.map((p) => p.tenantSubjectId))
  const scheduled = papers.filter((p) => (p.timetableSlots?.length ?? 0) > 0).length

  return {
    gradeCount: grades.length,
    subjectCount: subjectIds.size,
    paperCount: papers.length,
    scheduledCount: scheduled,
  }
}
