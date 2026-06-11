'use client'

import { useQuery } from '@tanstack/react-query'
import { BarChart3, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { fetchExamSessionAnalytics } from '@/lib/exams/examSessions'

interface SessionAnalyticsPanelProps {
  subdomain: string
  sessionId: string
}

export function SessionAnalyticsPanel({
  subdomain,
  sessionId,
}: SessionAnalyticsPanelProps) {
  const analyticsQuery = useQuery({
    queryKey: ['examSessionAnalytics', subdomain, sessionId],
    queryFn: () => fetchExamSessionAnalytics(subdomain, sessionId),
    enabled: Boolean(subdomain && sessionId),
  })

  const data = analyticsQuery.data

  if (analyticsQuery.isLoading) {
    return (
      <div className="flex justify-center py-12 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading analytics…
      </div>
    )
  }

  if (!data || data.studentsWithMarks === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-slate-500">
          No analytics yet. Run results processing first.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Session mean</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{data.sessionMean}%</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Pass rate</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{data.passRate}%</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Students</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {data.studentsWithMarks}/{data.totalStudents}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Grades
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {data.gradeMeans.length}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grade means</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.gradeMeans.map((g) => (
            <div key={g.tenantGradeLevelId}>
              <div className="flex justify-between text-sm mb-1">
                <span>{g.gradeName}</span>
                <span className="text-slate-500">
                  {g.meanPercentage}% · {g.studentCount} students
                </span>
              </div>
              <Progress value={g.meanPercentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subject means</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 px-2">Subject</th>
                  <th className="py-2 px-2">Mean %</th>
                  <th className="py-2 px-2">Marked</th>
                </tr>
              </thead>
              <tbody>
                {data.subjectMeans.map((s) => (
                  <tr key={s.paperId} className="border-b border-slate-100">
                    <td className="py-2 px-2">{s.subjectName}</td>
                    <td className="py-2 px-2">{s.meanPercentage}%</td>
                    <td className="py-2 px-2 text-slate-500">
                      {s.studentsWithMarks}/{s.totalStudents}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
