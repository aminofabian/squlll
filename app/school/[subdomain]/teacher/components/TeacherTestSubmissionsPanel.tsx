'use client'

import { useState } from 'react'
import {
  Users,
  FileText,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useTeacherTestSubmissions } from '@/lib/teacher/useTeacherTestSubmissions'
import { toast } from 'sonner'

interface TeacherTestSubmissionsPanelProps {
  testId: string
  maxMarks: number
}

export function TeacherTestSubmissionsPanel({
  testId,
  maxMarks,
}: TeacherTestSubmissionsPanelProps) {
  const { submissions, loading, error, gradingId, refetch, grade } =
    useTeacherTestSubmissions(testId, maxMarks)
  const [draftGrades, setDraftGrades] = useState<Record<string, string>>({})
  const [draftFeedback, setDraftFeedback] = useState<Record<string, string>>({})

  const handleGrade = async (submissionId: string) => {
    const raw = draftGrades[submissionId]
    const gradeValue = Number(raw)
    if (Number.isNaN(gradeValue)) {
      toast.error('Enter a valid grade')
      return
    }
    try {
      await grade(submissionId, gradeValue, draftFeedback[submissionId])
      toast.success('Submission graded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to grade submission')
    }
  }

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Student Submissions ({submissions.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="text-center space-y-3 py-6">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : loading && submissions.length === 0 ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No submissions yet. Students will appear here when they submit.
          </p>
        ) : (
          submissions.map((submission) => {
            const studentName = submission.student.user.name
            const isGraded = submission.grade != null
            return (
              <div
                key={submission.id}
                className="rounded-lg border border-primary/10 p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{studentName}</p>
                    <p className="text-xs text-muted-foreground">
                      {submission.student.admission_number} ·{' '}
                      {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  {isGraded ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {submission.grade}/{maxMarks}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Pending review</Badge>
                  )}
                </div>

                {submission.comments ? (
                  <p className="text-sm text-muted-foreground">{submission.comments}</p>
                ) : null}

                {submission.file_url ? (
                  <div className="flex flex-wrap gap-2">
                    {submission.file_url.split(',').map((url, index) => (
                      <a
                        key={`${submission.id}-${index}`}
                        href={url.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        Attachment {index + 1}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-[120px_1fr_auto] items-end">
                  <div>
                    <label className="text-xs text-muted-foreground">Grade / {maxMarks}</label>
                    <Input
                      type="number"
                      min={0}
                      max={maxMarks}
                      value={
                        draftGrades[submission.id] ??
                        (submission.grade != null ? String(submission.grade) : '')
                      }
                      onChange={(e) =>
                        setDraftGrades((prev) => ({
                          ...prev,
                          [submission.id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Feedback</label>
                    <Textarea
                      rows={2}
                      value={draftFeedback[submission.id] ?? submission.feedback ?? ''}
                      onChange={(e) =>
                        setDraftFeedback((prev) => ({
                          ...prev,
                          [submission.id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button
                    size="sm"
                    disabled={gradingId === submission.id}
                    onClick={() => void handleGrade(submission.id)}
                  >
                    {gradingId === submission.id ? 'Saving…' : isGraded ? 'Update' : 'Grade'}
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
