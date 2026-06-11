'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Calculator, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  fetchExamSessionProcessedResults,
  processExamSessionResults,
} from '@/lib/exams/examSessions'

interface SessionProcessingPanelProps {
  subdomain: string
  sessionId: string
}

export function SessionProcessingPanel({
  subdomain,
  sessionId,
}: SessionProcessingPanelProps) {
  const queryClient = useQueryClient()
  const [processing, setProcessing] = useState(false)

  const resultsQuery = useQuery({
    queryKey: ['examSessionProcessedResults', subdomain, sessionId],
    queryFn: () => fetchExamSessionProcessedResults(subdomain, sessionId),
    enabled: Boolean(subdomain && sessionId),
  })

  const handleProcess = async () => {
    setProcessing(true)
    try {
      const result = await processExamSessionResults(subdomain, sessionId)
      toast.success(`Processed ${result.processedCount} student results`)
      await queryClient.invalidateQueries({
        queryKey: ['examSessionProcessedResults', subdomain, sessionId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['examSessionRankings', subdomain, sessionId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['examSessionAnalytics', subdomain, sessionId],
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Processing failed')
    } finally {
      setProcessing(false)
    }
  }

  const results = resultsQuery.data ?? []
  const lastProcessed = results[0]?.processedAt

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Results processing
          </CardTitle>
          <Button onClick={handleProcess} disabled={processing}>
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            Run processing
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>
            Converts raw marks into subject grades, overall means, and class positions.
            Re-run after mark changes before publishing.
          </p>
          {lastProcessed && (
            <p>
              Last processed: {new Date(lastProcessed).toLocaleString()} ·{' '}
              <Badge variant="secondary">{results.length} students</Badge>
            </p>
          )}
        </CardContent>
      </Card>

      {resultsQuery.isLoading ? (
        <div className="flex justify-center py-8 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading processed results…
        </div>
      ) : results.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Processed summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 px-2">#</th>
                    <th className="py-2 px-2">Student</th>
                    <th className="py-2 px-2">Mean %</th>
                    <th className="py-2 px-2">Grade</th>
                    <th className="py-2 px-2">Points</th>
                    <th className="py-2 px-2">Position</th>
                    <th className="py-2 px-2">Subjects</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100">
                      <td className="py-2 px-2">{r.gradePosition ?? '—'}</td>
                      <td className="py-2 px-2">
                        {r.student?.user?.name ?? r.studentId}
                      </td>
                      <td className="py-2 px-2">{r.meanPercentage}%</td>
                      <td className="py-2 px-2">
                        <Badge variant="outline">{r.overallGrade}</Badge>
                      </td>
                      <td className="py-2 px-2">{r.totalPoints ?? '—'}</td>
                      <td className="py-2 px-2">
                        {r.gradePosition
                          ? `${r.gradePosition} / ${r.totalStudentsInGrade}`
                          : '—'}
                      </td>
                      <td className="py-2 px-2">{r.subjectScores.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-500">
            No processed results yet. Enter marks, then run processing.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
