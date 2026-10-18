import Link from 'next/link'
import { ArrowRight, Info } from 'lucide-react'

export function CoverageNote() {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      <Info className="size-3.5 shrink-0" />
      Planning, delivery and coverage are tracked separately — a topic is only marked covered when you record the lesson.
      <Link href="/teacher/schemes-of-work" className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline">
        All schemes <ArrowRight className="size-3" />
      </Link>
    </p>
  )
}
