import { Check, MessageCircle, Send, X, type LucideIcon } from 'lucide-react'
import type { LessonReviewAction } from '@/lib/lesson-planning/api'

export const REVIEW_ACTION_STYLES: Record<
  LessonReviewAction,
  { verb: string; icon: LucideIcon; node: string }
> = {
  SUBMIT: {
    verb: 'submitted this plan',
    icon: Send,
    node: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  },
  APPROVE: {
    verb: 'approved this plan',
    icon: Check,
    node: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  },
  RETURN: {
    verb: 'returned this plan',
    icon: X,
    node: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  },
  COMMENT: {
    verb: 'commented',
    icon: MessageCircle,
    node: 'bg-muted text-muted-foreground',
  },
}
