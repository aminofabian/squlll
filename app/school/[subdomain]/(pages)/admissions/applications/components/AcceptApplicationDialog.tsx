'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  Loader2,
  Mail,
  PartyPopper,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGradeLevelsForSchoolType } from '@/lib/hooks/useGradeLevelsForSchoolType'
import { cn } from '@/lib/utils'
import {
  PROGRAMME_LABELS,
  studentName,
  type AdmissionApplication,
} from './applications-types'
import { appsPrimaryButton } from './applications-ui'

export type AcceptResult = {
  studentId: string
  admissionNumber: string
  studentName: string
  gradeName: string
  parentInvited: boolean
  emailSent: boolean
  message: string
}

type AcceptApplicationDialogProps = {
  open: boolean
  app: AdmissionApplication | null
  submitting: boolean
  result: AcceptResult | null
  onOpenChange: (open: boolean) => void
  onConfirm: (input: {
    tenantGradeLevelId: string
    streamId?: string
    admissionNumber?: string
  }) => void
}

export function AcceptApplicationDialog({
  open,
  app,
  submitting,
  result,
  onOpenChange,
  onConfirm,
}: AcceptApplicationDialogProps) {
  const { data: grades = [], isLoading: gradesLoading } =
    useGradeLevelsForSchoolType(open)
  const [gradeId, setGradeId] = useState('')
  const [streamId, setStreamId] = useState('')
  const [admissionNumber, setAdmissionNumber] = useState('')

  useEffect(() => {
    if (!open) {
      setGradeId('')
      setStreamId('')
      setAdmissionNumber('')
    }
  }, [open])

  const selectedGrade = useMemo(
    () => grades.find((g) => g.id === gradeId),
    [grades, gradeId],
  )

  const streams = useMemo(
    () =>
      selectedGrade?.tenantStreams
        ?.map((ts) => ts.stream)
        .filter((s): s is { id: string; name: string } => Boolean(s)) ?? [],
    [selectedGrade],
  )

  const requiresStream = streams.length > 0

  useEffect(() => {
    if (!gradeId) {
      setStreamId('')
      return
    }
    if (streams.length === 1) {
      setStreamId(streams[0].id)
      return
    }
    setStreamId('')
  }, [gradeId, streams])

  if (!app) return null

  const name = studentName(app)
  const canSubmit =
    Boolean(gradeId) && (!requiresStream || Boolean(streamId)) && !submitting

  if (result) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md rounded-none border-[#1a4d42]/15 p-0 shadow-[6px_6px_0_0_rgba(10,31,26,0.12)] sm:rounded-none">
          <div className="bg-[#0a1f1a] px-5 py-6 text-white">
            <div className="flex items-center gap-2 text-amber-300">
              <PartyPopper className="h-4 w-4" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Offer sent
              </p>
            </div>
            <DialogHeader className="mt-2 space-y-1 text-left">
              <DialogTitle className="font-display text-2xl text-white">
                {result.studentName} is in
              </DialogTitle>
              <DialogDescription className="text-white/65">
                {result.message}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-3 bg-white p-5 dark:bg-[#0c1a17]">
            <div className="border border-[#1a4d42]/12 bg-[#f3f7f5] p-3 dark:border-white/10 dark:bg-[#071411]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
                Admission number
              </p>
              <p className="mt-1 font-mono text-lg font-bold text-[#246a59]">
                {result.admissionNumber}
              </p>
              <p className="mt-1 text-xs text-[#1a4d42]/55">
                Class · {result.gradeName}
              </p>
            </div>

            <ul className="space-y-2 text-sm text-[#0a1f1a] dark:text-white/85">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#246a59]" />
                Student record created
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0',
                    result.parentInvited
                      ? 'text-[#246a59]'
                      : 'text-amber-500',
                  )}
                />
                {result.parentInvited
                  ? 'Parent portal invitation ready'
                  : 'Parent invite needs a manual follow-up'}
              </li>
              <li className="flex items-start gap-2">
                <Mail
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0',
                    result.emailSent ? 'text-[#246a59]' : 'text-amber-500',
                  )}
                />
                {result.emailSent
                  ? `Offer email sent to ${app.guardianEmail}`
                  : `Email not sent — check ${app.guardianEmail}`}
              </li>
            </ul>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild className={appsPrimaryButton}>
                <Link href={`/students?studentId=${result.studentId}`}>
                  Open student
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-none border-[#1a4d42]/20"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-none border-[#1a4d42]/15 p-0 shadow-[6px_6px_0_0_rgba(10,31,26,0.12)] sm:rounded-none">
        <div className="border-b border-[#1a4d42]/10 bg-gradient-to-br from-[#246a59]/[0.08] via-white to-[#f3f7f5] px-5 py-5 dark:border-white/10 dark:from-[#246a59]/15 dark:via-[#0c1a17] dark:to-[#0c1a17]">
          <div className="flex items-center gap-2 text-[#246a59]">
            <Sparkles className="h-4 w-4" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
              Accept & enroll
            </p>
          </div>
          <DialogHeader className="mt-2 space-y-1 text-left">
            <DialogTitle className="font-display text-xl text-[#0a1f1a] dark:text-white">
              Offer {name} a place
            </DialogTitle>
            <DialogDescription className="text-[#1a4d42]/60">
              Creates their student record, invites {app.guardianName}, and
              emails a welcome offer to {app.guardianEmail}.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 p-5">
          <div className="border border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2.5 text-xs text-[#1a4d42]/70 dark:border-white/10 dark:bg-[#071411] dark:text-white/60">
            Pathway:{' '}
            <span className="font-medium text-[#0a1f1a] dark:text-white">
              {PROGRAMME_LABELS[app.programme] || app.programme}
            </span>
            {' · '}
            Ref {app.reference}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accept-grade">Class / grade</Label>
            {gradesLoading ? (
              <div className="flex h-9 items-center gap-2 border border-[#1a4d42]/15 px-3 text-xs text-[#1a4d42]/50">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading classes…
              </div>
            ) : (
              <Select value={gradeId} onValueChange={setGradeId}>
                <SelectTrigger
                  id="accept-grade"
                  className="rounded-none border-[#1a4d42]/15"
                >
                  <SelectValue placeholder="Choose grade" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  {grades
                    .filter((g) => g.isActive)
                    .map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.gradeLevel?.name || g.shortName || g.id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {requiresStream ? (
            <div className="space-y-2">
              <Label htmlFor="accept-stream">Stream</Label>
              <Select value={streamId} onValueChange={setStreamId}>
                <SelectTrigger
                  id="accept-stream"
                  className="rounded-none border-[#1a4d42]/15"
                >
                  <SelectValue placeholder="Choose stream" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  {streams.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="accept-admission">
              Admission number{' '}
              <span className="font-normal text-[#1a4d42]/45">(optional)</span>
            </Label>
            <Input
              id="accept-admission"
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
              placeholder="Auto-generated if blank"
              className="rounded-none border-[#1a4d42]/15"
            />
            <p className="text-[11px] text-[#1a4d42]/45">
              Also used as the learner&apos;s first login password.
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="rounded-none border-[#1a4d42]/20"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!canSubmit}
              className={appsPrimaryButton}
              onClick={() =>
                onConfirm({
                  tenantGradeLevelId: gradeId,
                  streamId: streamId || undefined,
                  admissionNumber: admissionNumber.trim() || undefined,
                })
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Enrolling…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Accept & email family
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
