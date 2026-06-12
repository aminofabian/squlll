'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  fetchExamSessionResults,
  type ExamSessionRecord,
} from '@/lib/exams/examSessions'
import { sessionScopeStats } from '@/lib/exams/examSessionOrganize'
import { formatGradeDisplayName } from '@/lib/utils/grade-display'
import {
  SessionClassSection,
  SessionClassTable,
  SessionClassTableCell,
  SessionClassTableRow,
  SessionOrganizerEmpty,
  SessionScopeStrip,
} from './SessionClassOrganizer'

interface SessionResultsPanelProps {
  subdomain: string
  sessionId: string
  session: ExamSessionRecord
  gradeFilter?: string
  onGradeFilterChange?: (gradeId: string) => void
}

export function SessionResultsPanel({
  subdomain,
  sessionId,
  session,
  gradeFilter: gradeFilterProp,
  onGradeFilterChange,
}: SessionResultsPanelProps) {
  const [internalGradeFilter, setInternalGradeFilter] = useState<string>('all')
  const gradeFilter = gradeFilterProp ?? internalGradeFilter
  const setGradeFilter = onGradeFilterChange ?? setInternalGradeFilter
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const grades = useMemo(() => {
    const map = new Map<string, string>()
    for (const paper of session.papers ?? []) {
      const id = paper.tenantGradeLevelId
      const name = paper.tenantGradeLevel?.gradeLevel?.name ?? id
      map.set(id, name)
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [session.papers])

  const gradeNameById = useMemo(
    () => new Map(grades.map((g) => [g.id, formatGradeDisplayName(g.name)])),
    [grades],
  )

  const subjects = useMemo(() => {
    const map = new Map<string, string>()
    for (const paper of session.papers ?? []) {
      const id = paper.tenantSubjectId
      const name = paper.tenantSubject?.subject?.name ?? id
      map.set(id, name)
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [session.papers])

  const filter = useMemo(
    () => ({
      tenantGradeLevelId: gradeFilter === 'all' ? undefined : gradeFilter,
      tenantSubjectId: subjectFilter === 'all' ? undefined : subjectFilter,
    }),
    [gradeFilter, subjectFilter],
  )

  const resultsQuery = useQuery({
    queryKey: ['examSessionResults', subdomain, sessionId, filter],
    queryFn: () => fetchExamSessionResults(subdomain, sessionId, filter),
    enabled: Boolean(subdomain && sessionId),
  })

  const filteredRows = useMemo(() => {
    const rows = resultsQuery.data ?? []
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.admissionNumber.toLowerCase().includes(q),
    )
  }, [resultsQuery.data, search])

  const groupedResults = useMemo(() => {
    const byGrade = new Map<
      string,
      { gradeName: string; subjects: Map<string, typeof filteredRows> }
    >()

    for (const row of filteredRows) {
      const gradeKey = row.gradeName
      if (!byGrade.has(gradeKey)) {
        byGrade.set(gradeKey, { gradeName: gradeKey, subjects: new Map() })
      }
      const grade = byGrade.get(gradeKey)!
      const subjectRows = grade.subjects.get(row.subjectName) ?? []
      subjectRows.push(row)
      grade.subjects.set(row.subjectName, subjectRows)
    }

    return Array.from(byGrade.values())
      .map((grade) => ({
        gradeName: formatGradeDisplayName(grade.gradeName),
        subjects: Array.from(grade.subjects.entries())
          .map(([subjectName, rows]) => ({
            subjectName,
            rows: rows.sort((a, b) => a.studentName.localeCompare(b.studentName)),
          }))
          .sort((a, b) => a.subjectName.localeCompare(b.subjectName)),
        paperCount: Array.from(grade.subjects.values()).reduce(
          (n, rows) => n + rows.length,
          0,
        ),
      }))
      .sort((a, b) => a.gradeName.localeCompare(b.gradeName))
  }, [filteredRows])

  const summary = useMemo(() => {
    const rows = resultsQuery.data ?? []
    if (rows.length === 0) return null
    const scores = rows.map((r) => r.percentage ?? 0)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const passMark = session.defaultPassMark ?? 40
    const passCount = rows.filter((r) => (r.percentage ?? 0) >= passMark).length
    return {
      count: rows.length,
      mean: mean.toFixed(1),
      passRate: Math.round((passCount / rows.length) * 100),
    }
  }, [resultsQuery.data, session.defaultPassMark])

  const scopeStats = useMemo(() => sessionScopeStats(session), [session])

  return (
    <div className="space-y-4">
      {!session.resultsPublished && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="py-3 text-sm text-amber-800 dark:text-amber-200">
            Results are not published — students and parents cannot see these marks
            until you publish this session.
          </CardContent>
        </Card>
      )}

      <SessionScopeStrip
        gradeCount={scopeStats.gradeCount}
        subjectCount={scopeStats.subjectCount}
        paperCount={scopeStats.paperCount}
        extra={
          summary ? (
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div>
                <p className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {summary.count}
                </p>
                <p className="text-slate-500">Records</p>
              </div>
              <div>
                <p className="font-bold tabular-nums text-[#246a59]">{summary.mean}%</p>
                <p className="text-slate-500">Average</p>
              </div>
              <div>
                <p className="font-bold tabular-nums text-emerald-600">
                  {summary.passRate}%
                </p>
                <p className="text-slate-500">Pass rate</p>
              </div>
            </div>
          ) : undefined
        }
      />

      <div className="rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {!gradeFilterProp ? (
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="h-8 sm:w-40 text-xs">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All grades</SelectItem>
                {grades.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {formatGradeDisplayName(g.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : gradeFilter !== 'all' ? (
            <p className="text-xs text-slate-500">
              Class:{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {gradeNameById.get(gradeFilter) ?? gradeFilter}
              </span>
            </p>
          ) : null}
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="h-8 sm:w-40 text-xs">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Search student…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 sm:flex-1 text-sm"
          />
        </div>
      </div>

      {resultsQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : groupedResults.length === 0 ? (
        <SessionOrganizerEmpty
          title="No results yet"
          description="Enter marks on the Marks tab — results will appear here grouped by class and subject."
        />
      ) : (
        <div className="space-y-3">
          {groupedResults.map((group, groupIndex) => (
            <SessionClassSection
              key={group.gradeName}
              gradeName={group.gradeName}
              gradeIndex={groupIndex}
              subjectCount={group.subjects.length}
              paperCount={group.paperCount}
              progressLabel={`${group.paperCount} mark record${group.paperCount === 1 ? '' : 's'}`}
              variant="table"
            >
              <SessionClassTable
                columns={['Student', 'Adm. no.', 'Subject', 'Score', '%']}
              >
                {group.subjects.flatMap((subject) =>
                  subject.rows.map((row, rowIndex) => (
                    <SessionClassTableRow key={`${row.studentId}-${row.paperId}`}>
                      <SessionClassTableCell className="font-medium text-slate-900 dark:text-slate-100">
                        {row.studentName}
                      </SessionClassTableCell>
                      <SessionClassTableCell className="text-slate-500">
                        {row.admissionNumber}
                      </SessionClassTableCell>
                      {rowIndex === 0 ? (
                        <SessionClassTableCell
                          rowSpan={subject.rows.length}
                          className="font-medium text-slate-800 dark:text-slate-200"
                        >
                          {subject.subjectName}
                        </SessionClassTableCell>
                      ) : null}
                      <SessionClassTableCell className="tabular-nums">
                        {row.score ?? '—'}/{row.maxScore}
                      </SessionClassTableCell>
                      <SessionClassTableCell className="tabular-nums font-semibold text-[#246a59]">
                        {row.percentage != null ? `${row.percentage}%` : '—'}
                      </SessionClassTableCell>
                    </SessionClassTableRow>
                  )),
                )}
              </SessionClassTable>
            </SessionClassSection>
          ))}
        </div>
      )}
    </div>
  )
}
