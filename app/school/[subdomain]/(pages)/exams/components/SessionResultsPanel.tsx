'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  const summary = useMemo(() => {
    const rows = resultsQuery.data ?? []
    if (rows.length === 0) return null
    const scores = rows.map((r) => r.percentage ?? 0)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const passMark = session.defaultPassMark ?? 40
    const passCount = rows.filter(
      (r) => (r.percentage ?? 0) >= passMark,
    ).length
    return {
      count: rows.length,
      mean: mean.toFixed(1),
      passRate: Math.round((passCount / rows.length) * 100),
    }
  }, [resultsQuery.data, session.defaultPassMark])

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
      {summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold">{summary.count}</p>
              <p className="text-xs text-slate-500">Mark records</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold">{summary.mean}%</p>
              <p className="text-xs text-slate-500">Average</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold">{summary.passRate}%</p>
              <p className="text-xs text-slate-500">At or above pass mark</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {!gradeFilterProp ? (
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All grades</SelectItem>
                  {grades.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="sm:w-40">
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
              className="sm:flex-1"
            />
          </div>

          {resultsQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : filteredRows.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              No marks recorded yet. Enter marks on the Marks tab.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 px-2">Student</th>
                    <th className="py-2 px-2">Adm. no.</th>
                    <th className="py-2 px-2">Grade</th>
                    <th className="py-2 px-2">Subject</th>
                    <th className="py-2 px-2">Score</th>
                    <th className="py-2 px-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr
                      key={`${row.studentId}-${row.paperId}`}
                      className="border-b border-slate-100"
                    >
                      <td className="py-2 px-2">{row.studentName}</td>
                      <td className="py-2 px-2">{row.admissionNumber}</td>
                      <td className="py-2 px-2">{row.gradeName}</td>
                      <td className="py-2 px-2">{row.subjectName}</td>
                      <td className="py-2 px-2">
                        {row.score ?? '—'}/{row.maxScore}
                      </td>
                      <td className="py-2 px-2">
                        {row.percentage != null ? `${row.percentage}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
