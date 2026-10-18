import Link from 'next/link'
import { ArrowLeft, Loader2, Printer, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LESSON_PLAN_EDITOR } from '../constants/lessonPlanEditor'
import type { SaveTone } from '../utils/describeSaveStatus'
import { SaveIndicator } from './SaveIndicator'

export function EditorToolbar({
  saveStatus,
  canSubmit,
  submitting,
  onSubmit,
}: {
  saveStatus: { tone: SaveTone; label: string }
  canSubmit: boolean
  submitting: boolean
  onSubmit: () => void
}) {
  return (
    <div className="app-print-hide z-30 flex items-center justify-between gap-2 lg:sticky lg:top-4 lg:rounded-2xl lg:border lg:border-border/70 lg:bg-background/80 lg:px-2 lg:py-2 lg:shadow-sm lg:backdrop-blur-xl">
      <Button asChild variant="ghost" size="sm" className="rounded-xl">
        <Link href={LESSON_PLAN_EDITOR.listHref}>
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Lesson plans</span>
        </Link>
      </Button>
      <div className="flex min-w-0 items-center gap-2">
        <SaveIndicator tone={saveStatus.tone} label={saveStatus.label} />
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => window.print()}>
          <Printer className="size-3.5" />
          <span className="hidden sm:inline">Print</span>
        </Button>
        {canSubmit && (
          <Button size="sm" className="rounded-xl shadow-sm shadow-primary/30" onClick={onSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            Submit
          </Button>
        )}
      </div>
    </div>
  )
}
