import { AlertCircle, CornerDownRight, ThumbsUp } from 'lucide-react'
import type { LessonPlan } from '@/lib/lesson-planning/api'

export function EditorNotices({
  plan,
  actionError,
}: {
  plan: LessonPlan
  actionError: string | null
}) {
  const isReturned = plan.status === 'RETURNED' && plan.reviewComment
  const isApproved = plan.status === 'APPROVED' && plan.reviewComment

  return (
    <>
      {isReturned && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          <CornerDownRight className="mt-0.5 size-4 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Returned for revision</p>
            <p className="mt-0.5 opacity-90">{plan.reviewComment}</p>
          </div>
        </div>
      )}
      {isApproved && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <ThumbsUp className="mt-0.5 size-4 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Approved</p>
            <p className="mt-0.5 opacity-90">{plan.reviewComment}</p>
          </div>
        </div>
      )}
      {actionError && (
        <div role="alert" className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {actionError}
        </div>
      )}
    </>
  )
}
