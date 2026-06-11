'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Loader2, Lock, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  fetchExamSessionMarkSubmissions,
  lockAllExamSessionMarks,
  lockExamPaperMarks,
  MARK_SUBMISSION_STATUS_LABELS,
  reviewExamPaperMarks,
  submitExamPaperMarks,
  type MarkSubmissionRecord,
  type MarkSubmissionStatus,
} from '@/lib/exams/examSessions'

interface SessionApprovalsPanelProps {
  subdomain: string
  sessionId: string
}

function statusBadgeVariant(
  status: MarkSubmissionStatus,
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'LOCKED':
    case 'APPROVED':
      return 'default'
    case 'SUBMITTED':
      return 'secondary'
    case 'RETURNED':
      return 'destructive'
    default:
      return 'outline'
  }
}

export function SessionApprovalsPanel({
  subdomain,
  sessionId,
}: SessionApprovalsPanelProps) {
  const queryClient = useQueryClient()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [lockingAll, setLockingAll] = useState(false)
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})

  const submissionsQuery = useQuery({
    queryKey: ['examSessionMarkSubmissions', subdomain, sessionId],
    queryFn: () => fetchExamSessionMarkSubmissions(subdomain, sessionId),
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['examSessionMarkSubmissions', subdomain, sessionId],
    })
  }

  const handleSubmit = async (submission: MarkSubmissionRecord) => {
    setBusyId(submission.id)
    try {
      await submitExamPaperMarks(subdomain, submission.id)
      toast.success('Paper marks submitted for review')
      await invalidate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit marks')
    } finally {
      setBusyId(null)
    }
  }

  const handleReview = async (submission: MarkSubmissionRecord, approve: boolean) => {
    setBusyId(submission.id)
    try {
      await reviewExamPaperMarks(subdomain, {
        submissionId: submission.id,
        approve,
        reviewNotes: reviewNotes[submission.id],
      })
      toast.success(approve ? 'Paper approved' : 'Paper returned to teacher')
      await invalidate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to review marks')
    } finally {
      setBusyId(null)
    }
  }

  const handleLock = async (submission: MarkSubmissionRecord) => {
    setBusyId(submission.id)
    try {
      await lockExamPaperMarks(subdomain, submission.id)
      toast.success('Paper marks locked')
      await invalidate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to lock marks')
    } finally {
      setBusyId(null)
    }
  }

  const handleLockAll = async () => {
    setLockingAll(true)
    try {
      await lockAllExamSessionMarks(subdomain, sessionId)
      toast.success('All submitted papers locked')
      await invalidate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to lock all marks')
    } finally {
      setLockingAll(false)
    }
  }

  const submissions = submissionsQuery.data ?? []
  const lockableCount = submissions.filter(
    (s) => s.status === 'SUBMITTED' || s.status === 'APPROVED',
  ).length

  if (submissionsQuery.isLoading) {
    return (
      <div className="flex justify-center py-12 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading mark submissions…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Mark submission workflow</CardTitle>
          {lockableCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              disabled={lockingAll}
              onClick={handleLockAll}
            >
              {lockingAll ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              Lock all ({lockableCount})
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            Teachers submit marks per paper. Administrators review, approve or return,
            then lock papers before results can be published.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 px-2">Subject</th>
                  <th className="py-2 px-2">Grade</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Notes</th>
                  <th className="py-2 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => {
                  const subject =
                    submission.examPaper?.tenantSubject?.subject?.name ?? '—'
                  const grade =
                    submission.examPaper?.tenantGradeLevel?.gradeLevel?.name ?? '—'
                  const busy = busyId === submission.id

                  return (
                    <tr key={submission.id} className="border-b border-slate-100">
                      <td className="py-2 px-2">{subject}</td>
                      <td className="py-2 px-2">{grade}</td>
                      <td className="py-2 px-2">
                        <Badge variant={statusBadgeVariant(submission.status)}>
                          {MARK_SUBMISSION_STATUS_LABELS[submission.status]}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-slate-500 max-w-xs truncate">
                        {submission.reviewNotes ?? '—'}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex flex-col gap-2 items-end">
                          {(submission.status === 'DRAFT' ||
                            submission.status === 'RETURNED') && (
                            <Button
                              size="sm"
                              disabled={busy}
                              onClick={() => handleSubmit(submission)}
                            >
                              {busy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-1" />
                                  Submit
                                </>
                              )}
                            </Button>
                          )}
                          {submission.status === 'SUBMITTED' && (
                            <div className="flex flex-col gap-2 w-full max-w-xs">
                              <Textarea
                                placeholder="Review notes (optional)"
                                rows={2}
                                value={reviewNotes[submission.id] ?? ''}
                                onChange={(e) =>
                                  setReviewNotes((prev) => ({
                                    ...prev,
                                    [submission.id]: e.target.value,
                                  }))
                                }
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={busy}
                                  onClick={() => handleReview(submission, false)}
                                >
                                  Return
                                </Button>
                                <Button
                                  size="sm"
                                  disabled={busy}
                                  onClick={() => handleReview(submission, true)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                          )}
                          {(submission.status === 'SUBMITTED' ||
                            submission.status === 'APPROVED') && (
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={busy}
                              onClick={() => handleLock(submission)}
                            >
                              <Lock className="h-4 w-4 mr-1" />
                              Lock
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No mark submissions yet. Papers appear here once the session is created.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
