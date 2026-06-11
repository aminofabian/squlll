'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ExamTimetableDraft } from './exam-timetable.utils'

interface ExamScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: ExamTimetableDraft | null
  clashMessages: string[]
  saving?: boolean
  onSave: (paperId: string, patch: Partial<ExamTimetableDraft>) => void
  onDone?: () => Promise<boolean>
  onClear?: (paperId: string) => Promise<boolean>
}

export function ExamScheduleDialog({
  open,
  onOpenChange,
  draft,
  clashMessages,
  saving = false,
  onSave,
  onDone,
  onClear,
}: ExamScheduleDialogProps) {
  if (!draft) return null

  const hasClash = clashMessages.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule exam paper</DialogTitle>
          <DialogDescription>
            {draft.subject} · {draft.grade}
          </DialogDescription>
        </DialogHeader>

        {hasClash ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            <div className="mb-1 flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Time overlap
            </div>
            <ul className="list-disc space-y-0.5 pl-4">
              {clashMessages.map((msg, index) => (
                <li key={`${index}-${msg}`}>{msg}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={draft.date}
                onChange={(e) => onSave(draft.paperId, { date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Start time</Label>
              <Input
                type="time"
                value={draft.startTime}
                onChange={(e) => onSave(draft.paperId, { startTime: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Duration (minutes)</Label>
              <Input
                type="number"
                min={15}
                step={5}
                value={draft.durationMinutes}
                onChange={(e) =>
                  onSave(draft.paperId, { durationMinutes: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Room / hall</Label>
              <Input
                placeholder="e.g. Hall A"
                value={draft.roomName}
                onChange={(e) => onSave(draft.paperId, { roomName: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {onClear ? (
            <Button
              type="button"
              variant="ghost"
              className="text-red-600"
              disabled={saving}
              onClick={async () => {
                const ok = (await onClear?.(draft.paperId)) ?? true
                if (ok) onOpenChange(false)
              }}
            >
              Remove from timetable
            </Button>
          ) : (
            <span />
          )}
          <Button
            type="button"
            disabled={hasClash || saving}
            onClick={async () => {
              const ok = (await onDone?.()) ?? true
              if (ok) onOpenChange(false)
            }}
          >
            {saving ? 'Saving…' : 'Save & close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
