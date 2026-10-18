'use client'

import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  saveLessonRecord,
  type LessonDeliveryStatus,
  type LessonPlan,
  type LessonPlanPeriod,
  type LessonRecord,
} from '@/lib/lesson-planning/api'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS: Array<{
  value: LessonDeliveryStatus
  label: string
  hint: string
}> = [
  { value: 'TAUGHT', label: 'Taught', hint: 'Planned content was covered' },
  { value: 'PARTIAL', label: 'Partly taught', hint: 'Some content still to cover' },
  { value: 'NOT_TAUGHT', label: 'Not taught', hint: 'Missed — record the reason' },
]

export function RecordLessonDialog({
  open,
  onOpenChange,
  subdomain,
  termId,
  target,
  existing,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  subdomain: string
  termId: string
  target:
    | { kind: 'period'; period: LessonPlanPeriod }
    | { kind: 'plan'; plan: LessonPlan }
  existing?: LessonRecord | null
  onSaved: (record: LessonRecord) => void
}) {
  const plan = target.kind === 'plan' ? target.plan : target.period.plan ?? null
  const period = target.kind === 'period' ? target.period : null
  const lessonDate =
    plan?.lessonDate ?? period?.date ?? new Date().toISOString().slice(0, 10)
  const className = plan?.className ?? period?.className ?? ''
  const subjectName = plan?.subjectName ?? period?.subjectName ?? ''

  const [status, setStatus] = useState<LessonDeliveryStatus>(
    existing?.status ?? 'TAUGHT',
  )
  const [whatWasCovered, setWhatWasCovered] = useState(
    existing?.whatWasCovered ?? '',
  )
  const [learnersPresent, setLearnersPresent] = useState(
    existing?.learnersPresent?.toString() ?? '',
  )
  const [learnersAchieved, setLearnersAchieved] = useState(
    existing?.learnersAchieved?.toString() ?? '',
  )
  const [challenges, setChallenges] = useState(existing?.challenges ?? '')
  const [followUp, setFollowUp] = useState(existing?.followUp ?? '')
  const [carryForward, setCarryForward] = useState(
    existing?.carryForward ?? false,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const record = await saveLessonRecord(subdomain, {
        id: existing?.id,
        lessonPlanId: plan?.id,
        timetableEntryId: period?.timetableEntryId ?? plan?.timetableEntryId ?? undefined,
        termId,
        lessonDate,
        status,
        whatWasCovered: whatWasCovered.trim() || undefined,
        learnersPresent: learnersPresent ? Number(learnersPresent) : undefined,
        learnersAchieved: learnersAchieved ? Number(learnersAchieved) : undefined,
        challenges: challenges.trim() || undefined,
        followUp: followUp.trim() || undefined,
        carryForward,
        coveragePercent:
          status === 'TAUGHT' ? 100 : status === 'PARTIAL' ? 60 : 0,
      })
      onSaved(record)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the record')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record lesson</DialogTitle>
          <DialogDescription>
            {subjectName} · {className} · {lessonDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>What happened?</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-left transition-colors',
                    status === option.value
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                      : 'border-border hover:border-primary/40',
                  )}
                >
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {option.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="covered">What was actually covered?</Label>
            <Textarea
              id="covered"
              rows={3}
              value={whatWasCovered}
              onChange={(event) => setWhatWasCovered(event.target.value)}
              placeholder="Content covered, activities completed, where you stopped…"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="present">Learners present</Label>
              <Input
                id="present"
                type="number"
                min={0}
                value={learnersPresent}
                onChange={(event) => setLearnersPresent(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="achieved">Achieved the outcomes</Label>
              <Input
                id="achieved"
                type="number"
                min={0}
                value={learnersAchieved}
                onChange={(event) => setLearnersAchieved(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenges">Challenges</Label>
            <Textarea
              id="challenges"
              rows={2}
              value={challenges}
              onChange={(event) => setChallenges(event.target.value)}
              placeholder="Time, resources, learner understanding…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow-up">Follow-up / reteaching</Label>
            <Textarea
              id="follow-up"
              rows={2}
              value={followUp}
              onChange={(event) => setFollowUp(event.target.value)}
              placeholder="What needs to happen next lesson?"
            />
          </div>

          <label className="flex items-start gap-2 rounded-lg border border-border p-3">
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-[var(--primary)]"
              checked={carryForward}
              onChange={(event) => setCarryForward(event.target.checked)}
            />
            <span className="text-sm">
              <span className="font-medium">Carry unfinished content forward</span>
              <span className="block text-xs text-muted-foreground">
                The next lesson will pick this up instead of marking the topic complete.
              </span>
            </span>
          </label>

          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
