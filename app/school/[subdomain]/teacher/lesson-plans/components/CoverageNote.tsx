import Link from 'next/link'
import { ArrowRight, Lightbulb } from 'lucide-react'

export function CoverageNote() {
  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-gradient-to-r from-amber-50 via-card to-card p-4 ring-1 ring-inset ring-border/70 sm:flex-row sm:items-center dark:from-amber-500/10">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
        <Lightbulb className="size-4" />
      </span>
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Planning, delivery and coverage are tracked separately.</span>{' '}
        A topic is only marked covered when you record the lesson.
      </p>
      <Link href="/teacher/schemes-of-work" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline sm:ml-auto">
        All schemes <ArrowRight className="size-3" />
      </Link>
    </div>
  )
}
