'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  fetchExamSessionRankings,
  type ExamSessionRecord,
} from '@/lib/exams/examSessions'

interface SessionRankingsPanelProps {
  subdomain: string
  sessionId: string
  session: ExamSessionRecord
}

export function SessionRankingsPanel({
  subdomain,
  sessionId,
  session,
}: SessionRankingsPanelProps) {
  const [gradeFilter, setGradeFilter] = useState<string>('all')

  const grades = useMemo(() => {
    const map = new Map<string, string>()
    for (const paper of session.papers ?? []) {
      map.set(
        paper.tenantGradeLevelId,
        paper.tenantGradeLevel?.gradeLevel?.name ?? paper.tenantGradeLevelId,
      )
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [session.papers])

  const filter = useMemo(
    () => ({
      tenantGradeLevelId: gradeFilter === 'all' ? undefined : gradeFilter,
    }),
    [gradeFilter],
  )

  const rankingsQuery = useQuery({
    queryKey: ['examSessionRankings', subdomain, sessionId, filter],
    queryFn: () => fetchExamSessionRankings(subdomain, sessionId, filter),
    enabled: Boolean(subdomain && sessionId),
  })

  const rows = rankingsQuery.data ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Merit list
        </CardTitle>
        {grades.length > 1 && (
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All grades" />
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
        )}
      </CardHeader>
      <CardContent>
        {rankingsQuery.isLoading ? (
          <div className="flex justify-center py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading rankings…
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">
            No rankings yet. Run results processing on the Processing tab first.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 px-2">Pos</th>
                  <th className="py-2 px-2">Student</th>
                  <th className="py-2 px-2">Admission</th>
                  <th className="py-2 px-2">Grade</th>
                  <th className="py-2 px-2">Stream</th>
                  <th className="py-2 px-2">Mean %</th>
                  <th className="py-2 px-2">Points</th>
                  <th className="py-2 px-2">Grade</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.studentId} className="border-b border-slate-100">
                    <td className="py-2 px-2 font-medium">
                      {row.gradePosition ?? '—'}
                    </td>
                    <td className="py-2 px-2">{row.studentName}</td>
                    <td className="py-2 px-2 text-slate-500">
                      {row.admissionNumber}
                    </td>
                    <td className="py-2 px-2">{row.gradeName}</td>
                    <td className="py-2 px-2">{row.streamName ?? '—'}</td>
                    <td className="py-2 px-2">{row.meanPercentage}%</td>
                    <td className="py-2 px-2">
                      {row.totalPoints != null ? row.totalPoints : '—'}
                    </td>
                    <td className="py-2 px-2">
                      <Badge variant="outline">{row.overallGrade}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
