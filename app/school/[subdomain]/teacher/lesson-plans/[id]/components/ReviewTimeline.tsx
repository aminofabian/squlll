import type { LessonPlanReview } from '@/lib/lesson-planning/api'
import { cn } from '@/lib/utils'
import { REVIEW_ACTION_STYLES } from '../constants/reviewActionStyles'
import { EditorSection } from './EditorSection'

const formatReviewTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export function ReviewTimeline({ reviews }: { reviews: LessonPlanReview[] }) {
  return (
    <EditorSection id="history">
      <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-3.5 before:top-2 before:w-px before:bg-border">
        {reviews.map((review) => {
          const style = REVIEW_ACTION_STYLES[review.action] ?? REVIEW_ACTION_STYLES.COMMENT
          const Icon = style.icon
          return (
            <li key={review.id} className="relative flex items-start gap-3 text-sm">
              <span className={cn('relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full ring-4 ring-card', style.node)}>
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0 pt-0.5">
                <p>
                  <span className="font-semibold">{review.actorName ?? 'Someone'}</span> {style.verb}
                  <span className="ml-1.5 text-xs text-muted-foreground">{formatReviewTime(review.createdAt)}</span>
                </p>
                {review.comment && (
                  <p className="mt-1.5 rounded-xl rounded-tl-sm bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                    “{review.comment}”
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </EditorSection>
  )
}
