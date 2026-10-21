'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useTeacherData } from '@/lib/hooks/useTeacherData'
import { createAssignment } from '@/lib/teacher/teacherAssignments'

function todayYmd(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function CreateAssignmentDialog({
  open,
  onOpenChange,
  subdomain,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  subdomain: string
  onCreated: (created: { id: string; title: string; classCount: number }) => void
}) {
  const { teacher, loading: teacherLoading, getFormattedGradeLevels } =
    useTeacherData()

  const subjects = useMemo(
    () =>
      (teacher?.tenantSubjects ?? []).map((item) => ({
        id: item.id,
        name:
          item.subject?.name || item.customSubject?.name || 'Learning area',
      })),
    [teacher],
  )

  const grades = useMemo(
    () =>
      getFormattedGradeLevels().map((item) => ({
        id: item.id,
        name: item.name || item.shortName || 'Class',
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teacher],
  )

  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [gradeIds, setGradeIds] = useState<string[]>([])
  const [dueDate, setDueDate] = useState(todayYmd())
  const [startTime, setStartTime] = useState('08:00')
  const [duration, setDuration] = useState('40')
  const [totalMarks, setTotalMarks] = useState('20')
  const [instructions, setInstructions] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle('')
    setInstructions('')
    setDueDate(todayYmd())
    setStartTime('08:00')
    setDuration('40')
    setTotalMarks('20')
    setError(null)
    // Reset form fields when the dialog opens.
  }, [open])

  // Teacher assignments load asynchronously; fill the selection once options
  // arrive (or when the teacher changes) without overwriting a real choice.
  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubjectId((current) => current || subjects[0]?.id || '')
    setGradeIds((current) =>
      current.length > 0 ? current : grades[0] ? [grades[0].id] : [],
    )
  }, [open, subjects, grades])

  const toggleGrade = (id: string) => {
    setGradeIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    )
  }

  const handleCreate = async () => {
    setError(null)
    if (!title.trim()) {
      setError('Give the assignment a title')
      return
    }
    if (!subjectId) {
      setError('Choose a learning area')
      return
    }
    if (gradeIds.length === 0) {
      setError('Select at least one class')
      return
    }
    const durationValue = Number(duration)
    const marksValue = Number(totalMarks)
    if (!Number.isFinite(durationValue) || durationValue <= 0) {
      setError('Duration must be a positive number of minutes')
      return
    }
    if (!Number.isFinite(marksValue) || marksValue <= 0) {
      setError('Total marks must be a positive number')
      return
    }

    setSaving(true)
    try {
      // The API stores a full timestamp; send an unambiguous ISO value built
      // from the local date + start time so the school's clock is preserved.
      const isoDate = new Date(`${dueDate}T${startTime || '08:00'}:00`).toISOString()
      const created = await createAssignment(subdomain, {
        title: title.trim(),
        tenantSubjectId: subjectId,
        tenantGradeLevelIds: gradeIds,
        date: isoDate,
        startTime: startTime || '08:00',
        duration: Math.round(durationValue),
        totalMarks: Math.round(marksValue),
        instructions: instructions.trim() || undefined,
      })
      onCreated({
        id: created.id,
        title: created.title,
        classCount: gradeIds.length,
      })
      onOpenChange(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not create the assignment',
      )
    } finally {
      setSaving(false)
    }
  }

  const noAssignments = !teacherLoading && subjects.length === 0 && grades.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader className="space-y-1.5">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-primary/75">
            Coursework
          </p>
          <DialogTitle className="font-display text-[1.55rem] leading-tight tracking-[-0.01em]">
            New assignment
          </DialogTitle>
          <DialogDescription className="text-[12.5px] leading-relaxed">
            Published to the classes you pick. Learners see it in their portal straight away.
          </DialogDescription>
        </DialogHeader>

        {noAssignments ? (
          <p className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-[12.5px] leading-relaxed text-muted-foreground">
            You have no learning areas or classes assigned yet. Ask an
            administrator to assign them before creating assignments.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="assignment-title" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Title
              </Label>
              <Input
                id="assignment-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Fractions practice — exercise 4"
                className="h-10 rounded-xl border-border/80 text-[13px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Learning area</Label>
              <select
                className="h-10 w-full rounded-xl border border-border/80 bg-card px-3 text-[13px] text-foreground"
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
              >
                {subjects.length === 0 && <option value="">No subjects assigned</option>}
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Classes <span className="normal-case tracking-normal text-muted-foreground/70">({gradeIds.length} selected)</span>
              </Label>
              {grades.length === 0 ? (
                <p className="text-xs text-muted-foreground">No classes assigned.</p>
              ) : (
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                  {grades.map((grade) => {
                    const checked = gradeIds.includes(grade.id)
                    return (
                      <label
                        key={grade.id}
                        className={cn(
                          'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                          checked ? 'bg-primary/5' : 'hover:bg-muted',
                        )}
                      >
                        <span
                          className={cn(
                            'flex size-4 items-center justify-center rounded border',
                            checked
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-input bg-background',
                          )}
                        >
                          {checked && <Check className="size-3" />}
                        </span>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() => toggleGrade(grade.id)}
                        />
                        {grade.name}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="assignment-date" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Due date
                </Label>
                <Input
                  id="assignment-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="h-10 rounded-xl border-border/80 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assignment-time" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Time
                </Label>
                <Input
                  id="assignment-time"
                  type="time"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="h-10 rounded-xl border-border/80 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assignment-duration" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Duration (minutes)
                </Label>
                <Input
                  id="assignment-duration"
                  type="number"
                  min={5}
                  max={480}
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  className="h-10 rounded-xl border-border/80 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assignment-marks" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Total marks
                </Label>
                <Input
                  id="assignment-marks"
                  type="number"
                  min={1}
                  max={1000}
                  value={totalMarks}
                  onChange={(event) => setTotalMarks(event.target.value)}
                  className="h-10 rounded-xl border-border/80 text-[13px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="assignment-instructions" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Instructions
              </Label>
              <Textarea
                id="assignment-instructions"
                rows={3}
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder="What learners should do, page numbers, submission notes…"
                className="rounded-xl border-border/80 text-[13px]"
              />
            </div>

            {error && (
              <p className="flex items-start gap-2 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 border-t border-border/70 pt-4 sm:justify-end">
          <Button
            variant="ghost"
            className="h-10 rounded-full px-4 text-[13px] font-semibold text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={saving || noAssignments || teacherLoading}
            className="h-10 rounded-full px-5 text-[13px] font-semibold shadow-sm shadow-primary/20"
          >
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Create assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
