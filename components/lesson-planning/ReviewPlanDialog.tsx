'use client'

import React, { useState } from 'react'
import { Check, Loader2, MessageSquare, RotateCcw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  reviewLessonPlan,
  type LessonPlan,
  type LessonReviewAction,
} from '@/lib/lesson-planning/api'
import { LessonPlanStatusPill } from '@/components/lesson-planning/StatusPill'

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45 dark:text-white/40">
        {title}
      </p>
      <div className="mt-1 text-sm text-[#0a1f1a] dark:text-white/90">{children}</div>
    </div>
  )
}

export function ReviewPlanDialog({
  plan,
  open,
  onOpenChange,
  subdomain,
  onReviewed,
}: {
  plan: LessonPlan | null
  open: boolean
  onOpenChange: (open: boolean) => void
  subdomain: string
  onReviewed: (plan: LessonPlan) => void
}) {
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState<LessonReviewAction | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!plan) return null

  const act = async (action: LessonReviewAction, needsComment = false) => {
    if (needsComment && !comment.trim()) {
      setError('Add a comment so the teacher knows what to revise.')
      return
    }
    setBusy(action)
    setError(null)
    try {
      const updated = await reviewLessonPlan(subdomain, {
        lessonPlanId: plan.id,
        action,
        comment: comment.trim() || undefined,
      })
      onReviewed(updated)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the review')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {plan.subjectName} · {plan.className}
            <LessonPlanStatusPill status={plan.status} />
          </DialogTitle>
          <DialogDescription>
            {plan.teacherName} · Week {plan.weekNumber} · {plan.lessonDate}
            {plan.periodTime ? ` · ${plan.periodTime}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-2">
            <Block title="Topic">{plan.topic || '—'}</Block>
            <Block title="Sub-topic">{plan.subTopic || '—'}</Block>
            <Block title="Strand">{plan.strand || '—'}</Block>
            <Block title="Sub-strand">{plan.subStrand || '—'}</Block>
          </div>

          <Block title="Specific learning outcomes">
            <p className="whitespace-pre-wrap">
              {plan.specificLearningOutcomes || 'Not written yet.'}
            </p>
          </Block>

          {plan.keyInquiryQuestion ? (
            <Block title="Key inquiry question">{plan.keyInquiryQuestion}</Block>
          ) : null}

          <Block title="Teaching and learning activities">
            {plan.activities.length === 0 ? (
              <p className="text-[#1a4d42]/50">No activities written.</p>
            ) : (
              <ol className="space-y-2">
                {plan.activities.map((activity, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="mt-0.5 w-12 shrink-0 text-xs text-[#1a4d42]/50 dark:text-white/40">
                      {activity.minutes} min
                    </span>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      {activity.description ? (
                        <p className="text-xs text-[#1a4d42]/60 dark:text-white/50">
                          {activity.description}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Block>

          <div className="grid gap-3 sm:grid-cols-2">
            <Block title="Resources">{plan.resources || '—'}</Block>
            <Block title="Assessment">{plan.assessment || '—'}</Block>
            <Block title="Differentiation">{plan.differentiation || '—'}</Block>
            <Block title="Homework">{plan.homework || '—'}</Block>
          </div>

          {plan.reviews.length > 0 && (
            <Block title="History">
              <ul className="space-y-1 text-xs text-[#1a4d42]/60 dark:text-white/50">
                {plan.reviews.map((review) => (
                  <li key={review.id}>
                    {review.actorName ?? 'Someone'}{' '}
                    {review.action === 'SUBMIT'
                      ? 'submitted'
                      : review.action === 'APPROVE'
                        ? 'approved'
                        : review.action === 'RETURN'
                          ? 'returned'
                          : 'commented'}{' '}
                    ·{' '}
                    {new Date(review.createdAt).toLocaleString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {review.comment ? ` — “${review.comment}”` : ''}
                  </li>
                ))}
              </ul>
            </Block>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Review comment</Label>
            <Textarea
              rows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Feedback for the teacher (required when returning a plan)."
            />
          </div>

          {error && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => act('COMMENT', true)}
            disabled={Boolean(busy)}
          >
            {busy === 'COMMENT' ? (
              <Loader2 className="mr-2 size-3.5 animate-spin" />
            ) : (
              <MessageSquare className="mr-2 size-3.5" />
            )}
            Comment only
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => act('RETURN', true)}
            disabled={Boolean(busy)}
          >
            {busy === 'RETURN' ? (
              <Loader2 className="mr-2 size-3.5 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 size-3.5" />
            )}
            Return for revision
          </Button>
          <Button size="sm" onClick={() => act('APPROVE')} disabled={Boolean(busy)}>
            {busy === 'APPROVE' ? (
              <Loader2 className="mr-2 size-3.5 animate-spin" />
            ) : (
              <Check className="mr-2 size-3.5" />
            )}
            Approve
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
