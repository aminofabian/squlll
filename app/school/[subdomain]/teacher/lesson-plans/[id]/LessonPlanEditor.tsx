'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  ClipboardCheck,
  Loader2,
  Plus,
  Printer,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  deleteLessonPlan,
  saveLessonPlan,
  submitLessonPlan,
  type LessonActivity,
  type LessonPlan,
  type LessonRecord,
  type SaveLessonPlanInput,
} from '@/lib/lesson-planning/api'
import {
  LessonDeliveryStatusPill,
  LessonPlanStatusPill,
} from '@/components/lesson-planning/StatusPill'
import { RecordLessonDialog } from '@/app/school/[subdomain]/teacher/lesson-plans/components/RecordLessonDialog'

type FormState = {
  durationMinutes: number
  strand: string
  subStrand: string
  topic: string
  subTopic: string
  specificLearningOutcomes: string
  keyInquiryQuestion: string
  activities: LessonActivity[]
  resources: string
  assessment: string
  differentiation: string
  homework: string
}

function toForm(plan: LessonPlan): FormState {
  return {
    durationMinutes: plan.durationMinutes ?? 40,
    strand: plan.strand ?? '',
    subStrand: plan.subStrand ?? '',
    topic: plan.topic ?? '',
    subTopic: plan.subTopic ?? '',
    specificLearningOutcomes: plan.specificLearningOutcomes ?? '',
    keyInquiryQuestion: plan.keyInquiryQuestion ?? '',
    activities: (plan.activities ?? []).map((activity) => ({
      minutes: activity.minutes,
      title: activity.title,
      description: activity.description ?? '',
    })),
    resources: plan.resources ?? '',
    assessment: plan.assessment ?? '',
    differentiation: plan.differentiation ?? '',
    homework: plan.homework ?? '',
  }
}

function snapshot(form: FormState) {
  return JSON.stringify(form)
}

function Section({
  letter,
  title,
  description,
  children,
  action,
}: {
  letter: string
  title: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
            {letter}
          </span>
          <div>
            <h2 className="text-sm font-semibold">{title}</h2>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </header>
      <div className="space-y-4 px-4 py-4">{children}</div>
    </section>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function LessonPlanEditor({
  subdomain,
  termId,
  initialPlan,
}: {
  subdomain: string
  termId: string
  initialPlan: LessonPlan
}) {
  const router = useRouter()
  const [plan, setPlan] = useState(initialPlan)
  const [form, setForm] = useState<FormState>(() => toForm(initialPlan))
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    snapshot(toForm(initialPlan)),
  )
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [recordOpen, setRecordOpen] = useState(false)
  const [reflectionOpen, setReflectionOpen] = useState(true)
  const [actionError, setActionError] = useState<string | null>(null)
  const inFlight = useRef(false)
  const pendingSave = useRef<FormState | null>(null)

  const isDirty = snapshot(form) !== savedSnapshot
  const totalMinutes = form.activities.reduce(
    (total, activity) => total + (Number(activity.minutes) || 0),
    0,
  )

  const buildInput = useCallback(
    (state: FormState): SaveLessonPlanInput => ({
      id: plan.id,
      termId,
      timetableEntryId: plan.timetableEntryId ?? undefined,
      schemeOfWorkId: plan.schemeOfWorkId ?? undefined,
      schemeEntryId: plan.schemeEntryId ?? undefined,
      gradeLevelId: plan.gradeLevelId,
      streamId: plan.streamId ?? undefined,
      subjectId: plan.subjectId,
      lessonDate: plan.lessonDate,
      weekNumber: plan.weekNumber,
      lessonNumber: plan.lessonNumber,
      durationMinutes: state.durationMinutes,
      strand: state.strand,
      subStrand: state.subStrand,
      topic: state.topic,
      subTopic: state.subTopic,
      specificLearningOutcomes: state.specificLearningOutcomes,
      keyInquiryQuestion: state.keyInquiryQuestion,
      activities: state.activities.map((activity) => ({
        minutes: Number(activity.minutes) || 0,
        title: activity.title,
        description: activity.description ?? '',
      })),
      resources: state.resources,
      assessment: state.assessment,
      differentiation: state.differentiation,
      homework: state.homework,
    }),
    [plan, termId],
  )

  const persist = useCallback(
    (state: FormState) => saveLessonPlan(subdomain, buildInput(state)),
    [buildInput, subdomain],
  )

  const saveRef = useRef<(state: FormState) => void>(() => {})

  /**
   * Serialised autosave. If an edit lands while a save is in flight it is
   * queued, so nothing the teacher typed is silently dropped.
   */
  const save = useCallback(
    async (state: FormState) => {
      if (inFlight.current) {
        pendingSave.current = state
        return
      }
      inFlight.current = true
      setSaving(true)
      setSaveError(null)
      try {
        const updated = await persist(state)
        setPlan(updated)
        setSavedSnapshot(snapshot(state))
        setLastSavedAt(new Date())
      } catch (err) {
        setSaveError(
          err instanceof Error ? err.message : 'Could not save this plan',
        )
      } finally {
        inFlight.current = false
        setSaving(false)
        const queued = pendingSave.current
        pendingSave.current = null
        if (queued) {
          saveRef.current(queued)
        }
      }
    },
    [persist],
  )

  useEffect(() => {
    saveRef.current = (state) => {
      void save(state)
    }
  }, [save])

  // Autosave: debounce edits so a teacher never loses preparation.
  useEffect(() => {
    if (!isDirty) return
    const timer = setTimeout(() => {
      void save(form)
    }, 1200)
    return () => clearTimeout(timer)
  }, [form, isDirty, save])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const updateActivity = (index: number, patch: Partial<LessonActivity>) => {
    setForm((current) => ({
      ...current,
      activities: current.activities.map((activity, activityIndex) =>
        activityIndex === index ? { ...activity, ...patch } : activity,
      ),
    }))
  }

  const addActivity = () => {
    setForm((current) => ({
      ...current,
      activities: [
        ...current.activities,
        { minutes: 5, title: '', description: '' },
      ],
    }))
  }

  const removeActivity = (index: number) => {
    setForm((current) => ({
      ...current,
      activities: current.activities.filter(
        (_, activityIndex) => activityIndex !== index,
      ),
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setActionError(null)
    try {
      // Persist the current form directly (not through the debounce queue) so
      // the submitted plan is exactly what the teacher sees.
      const saved = await persist(form)
      setPlan(saved)
      setSavedSnapshot(snapshot(form))
      setLastSavedAt(new Date())
      const updated = await submitLessonPlan(subdomain, plan.id)
      setPlan(updated)
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Could not submit the plan',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this draft lesson plan?')) return
    try {
      await deleteLessonPlan(subdomain, plan.id)
      router.push('/teacher/lesson-plans')
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Could not delete the plan',
      )
    }
  }

  const handleRecordSaved = (record: LessonRecord) => {
    setPlan((current) => ({ ...current, record }))
    setReflectionOpen(true)
  }

  const canSubmit = plan.status === 'DRAFT' || plan.status === 'RETURNED'
  const statusHint = useMemo(() => {
    if (saving) return 'Saving…'
    if (isDirty) return 'Unsaved changes'
    if (lastSavedAt) {
      return `Saved ${lastSavedAt.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    }
    return plan.updatedAt
      ? `Saved ${new Date(plan.updatedAt).toLocaleString(undefined, {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })}`
      : 'Draft'
  }, [saving, isDirty, lastSavedAt, plan.updatedAt])

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-5 lg:px-0 lg:py-0">
      <style>{`
        @media print {
          nav, header.app-print-hide, .app-print-hide { display: none !important; }
          body { background: #fff; }
          .app-print-card { box-shadow: none !important; border-color: #d4d4d8 !important; break-inside: avoid; }
        }
      `}</style>

      <div className="app-print-hide flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/teacher/lesson-plans">
            <ArrowLeft className="size-4" />
            Lesson plans
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'hidden text-[11px] sm:inline',
              saveError ? 'text-rose-600' : 'text-muted-foreground',
            )}
          >
            {saveError ?? statusHint}
          </span>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-3.5" />
            Print
          </Button>
          {canSubmit && (
            <Button size="sm" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Submit
            </Button>
          )}
        </div>
      </div>

      <header className="app-print-card rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Lesson plan
            </p>
            <h1 className="mt-0.5 text-lg font-semibold leading-snug">
              {plan.subjectName} — {plan.className}
              {plan.streamName ? ` ${plan.streamName}` : ''}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Week {plan.weekNumber} · Lesson {plan.lessonNumber} ·{' '}
              {new Date(`${plan.lessonDate}T12:00:00Z`).toLocaleDateString(
                undefined,
                { weekday: 'long', day: 'numeric', month: 'long' },
              )}
              {plan.periodTime ? ` · ${plan.periodTime}` : ''}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <LessonPlanStatusPill status={plan.status} />
            {plan.record && (
              <LessonDeliveryStatusPill status={plan.record.status} />
            )}
          </div>
        </div>

        {plan.status === 'RETURNED' && plan.reviewComment && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            <span className="font-semibold">Returned for revision: </span>
            {plan.reviewComment}
          </div>
        )}
        {plan.status === 'APPROVED' && plan.reviewComment && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="font-semibold">Reviewer: </span>
            {plan.reviewComment}
          </div>
        )}

        {actionError && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            {actionError}
          </div>
        )}
      </header>

      <Section
        letter="A"
        title="Lesson details"
        description="Pre-filled from your timetable — change only what differs."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Class">
            <Input value={`${plan.className}${plan.streamName ? ` ${plan.streamName}` : ''}`} readOnly />
          </Field>
          <Field label="Learning area">
            <Input value={plan.subjectName} readOnly />
          </Field>
          <Field label="Date">
            <Input value={plan.lessonDate} readOnly />
          </Field>
          <Field label="Duration (minutes)">
            <Input
              type="number"
              min={5}
              max={240}
              value={form.durationMinutes}
              onChange={(event) =>
                update('durationMinutes', Number(event.target.value) || 40)
              }
            />
          </Field>
        </div>
      </Section>

      <Section
        letter="B"
        title="Curriculum alignment"
        description="Strand and outcomes come from your scheme of work. Refine them for this lesson."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Strand / topic">
            <Input
              value={form.strand}
              onChange={(event) => update('strand', event.target.value)}
              placeholder="e.g. Numbers"
            />
          </Field>
          <Field label="Sub-strand / subtopic">
            <Input
              value={form.subStrand}
              onChange={(event) => update('subStrand', event.target.value)}
              placeholder="e.g. Operations involving fractions"
            />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Lesson topic">
            <Input
              value={form.topic}
              onChange={(event) => update('topic', event.target.value)}
              placeholder="What this lesson is about"
            />
          </Field>
          <Field label="Specific focus">
            <Input
              value={form.subTopic}
              onChange={(event) => update('subTopic', event.target.value)}
              placeholder="Optional narrower focus"
            />
          </Field>
        </div>
        <Field
          label="Specific learning outcomes"
          hint="By the end of the lesson, learners should be able to…"
        >
          <Textarea
            rows={3}
            value={form.specificLearningOutcomes}
            onChange={(event) =>
              update('specificLearningOutcomes', event.target.value)
            }
          />
        </Field>
        <Field label="Key inquiry question" hint="Optional — the question that drives the lesson.">
          <Input
            value={form.keyInquiryQuestion}
            onChange={(event) => update('keyInquiryQuestion', event.target.value)}
          />
        </Field>
      </Section>

      <Section
        letter="C"
        title="Teaching and learning activities"
        description="How the lesson unfolds. Keep the minutes within the lesson duration."
        action={
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 text-[11px] font-medium',
              totalMinutes > form.durationMinutes
                ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
                : 'border-border text-muted-foreground',
            )}
          >
            {totalMinutes} / {form.durationMinutes} min
          </span>
        }
      >
        <div className="space-y-3">
          {form.activities.length === 0 && (
            <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
              No activities yet. Add the introduction, development, application and
              conclusion.
            </p>
          )}
          {form.activities.map((activity, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-background p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 sm:w-28">
                  <Input
                    type="number"
                    min={0}
                    max={600}
                    className="h-8 w-16"
                    value={activity.minutes}
                    onChange={(event) =>
                      updateActivity(index, {
                        minutes: Number(event.target.value) || 0,
                      })
                    }
                  />
                  <span className="text-[11px] text-muted-foreground">min</span>
                </div>
                <Input
                  className="h-8 flex-1"
                  value={activity.title}
                  placeholder="Activity title (e.g. Introduction)"
                  onChange={(event) =>
                    updateActivity(index, { title: event.target.value })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground hover:text-rose-600"
                  onClick={() => removeActivity(index)}
                  aria-label="Remove activity"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <Textarea
                rows={2}
                className="mt-2 text-xs"
                value={activity.description ?? ''}
                placeholder="What the teacher and learners do"
                onChange={(event) =>
                  updateActivity(index, { description: event.target.value })
                }
              />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addActivity}>
            <Plus className="size-4" />
            Add activity
          </Button>
        </div>
      </Section>

      <Section
        letter="D"
        title="Assessment and resources"
        description="What you will use, how you will check understanding, and how you adapt the lesson."
      >
        <Field label="Teaching resources">
          <Textarea
            rows={2}
            value={form.resources}
            onChange={(event) => update('resources', event.target.value)}
            placeholder="Textbooks, charts, manipulatives…"
          />
        </Field>
        <Field label="Assessment" hint="Questions, success criteria or the task that shows the outcome was met.">
          <Textarea
            rows={2}
            value={form.assessment}
            onChange={(event) => update('assessment', event.target.value)}
          />
        </Field>
        <Field
          label="Differentiation"
          hint="Support for learners who need more help and extension for those ready for more."
        >
          <Textarea
            rows={2}
            value={form.differentiation}
            onChange={(event) => update('differentiation', event.target.value)}
          />
        </Field>
        <Field label="Homework / follow-up">
          <Textarea
            rows={2}
            value={form.homework}
            onChange={(event) => update('homework', event.target.value)}
          />
        </Field>
      </Section>

      <section className="app-print-card rounded-2xl border border-border bg-card shadow-sm">
        <button
          type="button"
          onClick={() => setReflectionOpen((open) => !open)}
          className="app-print-hide flex w-full items-start justify-between gap-3 border-b border-border px-4 py-3 text-left"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
              E
            </span>
            <div>
              <h2 className="text-sm font-semibold">Post-lesson reflection</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Completed after teaching — what was covered and what needs
                follow-up.
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              'mt-1 size-4 text-muted-foreground transition-transform',
              reflectionOpen && 'rotate-180',
            )}
          />
        </button>

        <div className={cn('px-4 py-4', !reflectionOpen && 'hidden print:block')}>
          {plan.record ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <LessonDeliveryStatusPill status={plan.record.status} />
                <span className="text-xs text-muted-foreground">
                  {plan.record.coveragePercent}% of the lesson covered
                </span>
              </div>
              {plan.record.whatWasCovered && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Covered
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm">
                    {plan.record.whatWasCovered}
                  </p>
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-border px-3 py-2">
                  <p className="text-[11px] text-muted-foreground">Present</p>
                  <p className="text-sm font-medium">
                    {plan.record.learnersPresent ?? '—'}
                  </p>
                </div>
                <div className="rounded-lg border border-border px-3 py-2">
                  <p className="text-[11px] text-muted-foreground">
                    Achieved outcomes
                  </p>
                  <p className="text-sm font-medium">
                    {plan.record.learnersAchieved ?? '—'}
                  </p>
                </div>
              </div>
              {plan.record.challenges && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Challenges
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm">
                    {plan.record.challenges}
                  </p>
                </div>
              )}
              {plan.record.followUp && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Follow-up
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm">
                    {plan.record.followUp}
                  </p>
                </div>
              )}
              {plan.record.carryForward && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  Unfinished content is carried forward to the next lesson.
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="app-print-hide"
                onClick={() => setRecordOpen(true)}
              >
                <ClipboardCheck className="size-3.5" />
                Update record
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">No delivery record yet</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  After teaching, record what happened so coverage reflects reality.
                </p>
              </div>
              <Button size="sm" className="app-print-hide" onClick={() => setRecordOpen(true)}>
                <ClipboardCheck className="size-3.5" />
                Record lesson
              </Button>
            </div>
          )}
        </div>
      </section>

      {plan.reviews.length > 0 && (
        <Section
          letter="F"
          title="Review history"
          description="Every submission, approval, return and comment is kept."
        >
          <ol className="space-y-2">
            {plan.reviews.map((review) => (
              <li key={review.id} className="flex items-start gap-2 text-xs">
                <span
                  className={cn(
                    'mt-0.5 flex size-4 items-center justify-center rounded-full',
                    review.action === 'APPROVE'
                      ? 'bg-emerald-100 text-emerald-700'
                      : review.action === 'RETURN'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {review.action === 'APPROVE' ? (
                    <Check className="size-2.5" />
                  ) : review.action === 'RETURN' ? (
                    <X className="size-2.5" />
                  ) : (
                    <Send className="size-2.5" />
                  )}
                </span>
                <div>
                  <p>
                    <span className="font-medium">{review.actorName ?? 'Someone'}</span>{' '}
                    {review.action === 'SUBMIT'
                      ? 'submitted this plan'
                      : review.action === 'APPROVE'
                        ? 'approved this plan'
                        : review.action === 'RETURN'
                          ? 'returned this plan'
                          : 'commented'}{' '}
                    <span className="text-muted-foreground">
                      ·{' '}
                      {new Date(review.createdAt).toLocaleString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </p>
                  {review.comment && (
                    <p className="mt-0.5 text-muted-foreground">
                      “{review.comment}”
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {plan.status === 'DRAFT' && (
        <div className="app-print-hide flex justify-end pb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-rose-600"
            onClick={handleDelete}
          >
            <Trash2 className="size-3.5" />
            Delete draft
          </Button>
        </div>
      )}

      {recordOpen && (
        <RecordLessonDialog
          open={recordOpen}
          onOpenChange={setRecordOpen}
          subdomain={subdomain}
          termId={termId}
          target={{ kind: 'plan', plan }}
          existing={plan.record}
          onSaved={handleRecordSaved}
        />
      )}
    </div>
  )
}
