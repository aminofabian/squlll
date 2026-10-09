'use client'

import {
  X,
  Calendar,
  Clock,
  User,
  FileText,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StateMessage, StatusPill, type PillTone } from '../_ui'
import { useStudentTestDetail } from '@/lib/student/useStudentTestDetail'

interface StudentTestDetailModalProps {
  subdomain: string
  testId: string | null
  isOpen: boolean
  onClose: () => void
  onSubmit?: () => void
  showSubmit?: boolean
}

function statusTone(status: string): PillTone {
  const s = status.toLowerCase()
  if (s.includes('cancel')) return 'danger'
  if (s.includes('complet') || s.includes('done') || s.includes('graded')) return 'success'
  if (s.includes('ongoing') || s.includes('active') || s.includes('progress')) return 'warning'
  return 'info'
}

export function StudentTestDetailModal({
  subdomain,
  testId,
  isOpen,
  onClose,
  onSubmit,
  showSubmit = false,
}: StudentTestDetailModalProps) {
  const { test, loading, error } = useStudentTestDetail(
    subdomain,
    isOpen ? testId : null,
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-background shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Test details</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-5 p-6">
          {loading ? (
            <StateMessage variant="loading" title="Loading test…" />
          ) : error ? (
            <StateMessage
              variant="error"
              title="Couldn't load test"
              description={error}
            />
          ) : test ? (
            <>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {test.title}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  {test.subject.name}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={statusTone(test.status)}>{test.status}</StatusPill>
                <Badge variant="outline">{test.totalMarks} marks</Badge>
                <Badge variant="outline">{test.questions.length} questions</Badge>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(test.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {test.startTime} · {test.duration} min
                </div>
                <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                  <User className="h-4 w-4" />
                  {test.teacher.fullName}
                </div>
              </div>

              {test.instructions ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Instructions</p>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {test.instructions}
                  </p>
                </div>
              ) : null}

              {(test.resourceUrl || test.referenceMaterials.length > 0) && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Resources</p>
                  <div className="space-y-2">
                    {test.resourceUrl ? (
                      <a
                        href={test.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Main resource
                      </a>
                    ) : null}
                    {test.referenceMaterials.map((material) => (
                      <a
                        key={material.id}
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        {material.fileType} file
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {showSubmit && onSubmit ? (
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <Button onClick={onSubmit}>Continue to submit</Button>
                </div>
              ) : (
                <div className="flex justify-end pt-2">
                  <Button onClick={onClose}>Close</Button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
