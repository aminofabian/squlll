'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  EXCLUSION_REASON_LABELS,
  fetchExamSessionCandidateSummary,
  fetchExamSessionCandidates,
  syncExamSessionCandidates,
  updateExamSessionCandidate,
  type ExclusionReason,
  type ExamSessionCandidateRecord,
} from '@/lib/exams/examSessions'

interface SessionCandidatesPanelProps {
  subdomain: string
  sessionId: string
}

export function SessionCandidatesPanel({
  subdomain,
  sessionId,
}: SessionCandidatesPanelProps) {
  const queryClient = useQueryClient()
  const [syncing, setSyncing] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const summaryQuery = useQuery({
    queryKey: ['examSessionCandidateSummary', subdomain, sessionId],
    queryFn: () => fetchExamSessionCandidateSummary(subdomain, sessionId),
  })

  const candidatesQuery = useQuery({
    queryKey: ['examSessionCandidates', subdomain, sessionId],
    queryFn: () => fetchExamSessionCandidates(subdomain, sessionId),
  })

  const handleSync = async () => {
    setSyncing(true)
    try {
      await syncExamSessionCandidates(subdomain, sessionId)
      toast.success('Candidates refreshed from grade enrolment')
      await queryClient.invalidateQueries({
        queryKey: ['examSessionCandidates', subdomain, sessionId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['examSessionCandidateSummary', subdomain, sessionId],
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to sync candidates')
    } finally {
      setSyncing(false)
    }
  }

  const handleExclude = async (
    candidate: ExamSessionCandidateRecord,
    reason: ExclusionReason,
  ) => {
    setUpdatingId(candidate.id)
    try {
      await updateExamSessionCandidate(subdomain, {
        candidateId: candidate.id,
        status: 'EXCLUDED',
        exclusionReason: reason,
      })
      toast.success('Candidate excluded')
      await queryClient.invalidateQueries({
        queryKey: ['examSessionCandidates', subdomain, sessionId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['examSessionCandidateSummary', subdomain, sessionId],
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update candidate')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleKnecUpdate = async (
    candidate: ExamSessionCandidateRecord,
    knecCandidateNumber: string,
  ) => {
    setUpdatingId(candidate.id)
    try {
      await updateExamSessionCandidate(subdomain, {
        candidateId: candidate.id,
        status: candidate.status,
        knecCandidateNumber: knecCandidateNumber.trim() || undefined,
      })
      await queryClient.invalidateQueries({
        queryKey: ['examSessionCandidates', subdomain, sessionId],
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save KNEC number')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRegister = async (candidate: ExamSessionCandidateRecord) => {
    setUpdatingId(candidate.id)
    try {
      await updateExamSessionCandidate(subdomain, {
        candidateId: candidate.id,
        status: 'REGISTERED',
      })
      toast.success('Candidate re-registered')
      await queryClient.invalidateQueries({
        queryKey: ['examSessionCandidates', subdomain, sessionId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['examSessionCandidateSummary', subdomain, sessionId],
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update candidate')
    } finally {
      setUpdatingId(null)
    }
  }

  const summary = summaryQuery.data ?? []
  const candidates = candidatesQuery.data ?? []
  const totalExpected = summary.reduce((s, r) => s + r.expected, 0)
  const totalRegistered = summary.reduce((s, r) => s + r.registered, 0)
  const totalExcluded = summary.reduce((s, r) => s + r.excluded, 0)

  if (summaryQuery.isLoading || candidatesQuery.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-slate-600">
          <span className="font-medium text-slate-900">{totalRegistered}</span> registered
          {' · '}
          <span className="font-medium text-slate-900">{totalExcluded}</span> excluded
          {' · '}
          <span className="font-medium text-slate-900">{totalExpected}</span> total
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh from enrolment
        </Button>
      </div>

      {summary.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summary.map((row) => (
            <Card key={`${row.tenantGradeLevelId}-${row.streamName ?? 'all'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {row.gradeName}
                  {row.streamName ? ` · ${row.streamName}` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Expected {row.expected} · Registered {row.registered} · Excluded{' '}
                {row.excluded}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All candidates</CardTitle>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              No candidates yet. Click &quot;Refresh from enrolment&quot; to pull students
              from the selected grades.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 px-2">Student</th>
                    <th className="py-2 px-2">Adm. no.</th>
                    <th className="py-2 px-2">KNEC no.</th>
                    <th className="py-2 px-2">Grade</th>
                    <th className="py-2 px-2">Stream</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.id} className="border-b border-slate-100">
                      <td className="py-2 px-2">{c.student.user.name}</td>
                      <td className="py-2 px-2">{c.student.admission_number}</td>
                      <td className="py-2 px-2">
                        <Input
                          className="h-8 w-28 text-xs"
                          defaultValue={c.knecCandidateNumber ?? ''}
                          placeholder="—"
                          disabled={updatingId === c.id}
                          onBlur={(e) => {
                            const next = e.target.value.trim()
                            const prev = c.knecCandidateNumber ?? ''
                            if (next !== prev) {
                              void handleKnecUpdate(c, next)
                            }
                          }}
                        />
                      </td>
                      <td className="py-2 px-2">
                        {c.student.grade?.gradeLevel?.name ?? '—'}
                      </td>
                      <td className="py-2 px-2">{c.student.stream?.name ?? '—'}</td>
                      <td className="py-2 px-2">
                        {c.status === 'REGISTERED' ? (
                          <Badge className="bg-emerald-600">Registered</Badge>
                        ) : (
                          <Badge variant="secondary">
                            {c.exclusionReason
                              ? EXCLUSION_REASON_LABELS[c.exclusionReason]
                              : 'Excluded'}
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {c.status === 'REGISTERED' ? (
                          <Select
                            onValueChange={(v) =>
                              handleExclude(c, v as ExclusionReason)
                            }
                            disabled={updatingId === c.id}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue placeholder="Exclude…" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(EXCLUSION_REASON_LABELS).map(
                                ([key, label]) => (
                                  <SelectItem key={key} value={key}>
                                    {label}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingId === c.id}
                            onClick={() => handleRegister(c)}
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Register
                          </Button>
                        )}
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
