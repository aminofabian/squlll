'use client'

import {
  X,
  Calendar,
  Clock,
  User,
  FileText,
  Loader2,
  AlertCircle,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStudentTestDetail } from '@/lib/student/useStudentTestDetail'

interface StudentTestDetailModalProps {
  subdomain: string
  testId: string | null
  isOpen: boolean
  onClose: () => void
  onSubmit?: () => void
  showSubmit?: boolean
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
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-background shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-6 py-4">
          <h2 className="text-lg font-semibold">Test details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center space-y-3 py-8">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : test ? (
            <>
              <div>
                <h3 className="text-xl font-bold">{test.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <BookOpen className="w-4 h-4" />
                  {test.subject.name}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{test.status}</Badge>
                <Badge variant="outline">{test.totalMarks} marks</Badge>
                <Badge variant="outline">{test.questions.length} questions</Badge>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(test.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {test.startTime} · {test.duration} min
                </div>
                <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                  <User className="w-4 h-4" />
                  {test.teacher.name}
                </div>
              </div>

              {test.instructions ? (
                <div>
                  <p className="text-sm font-medium mb-1">Instructions</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {test.instructions}
                  </p>
                </div>
              ) : null}

              {(test.resourceUrl || test.referenceMaterials.length > 0) && (
                <div>
                  <p className="text-sm font-medium mb-2">Resources</p>
                  <div className="space-y-2">
                    {test.resourceUrl ? (
                      <a
                        href={test.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <FileText className="w-4 h-4" />
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
                        <FileText className="w-4 h-4" />
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
