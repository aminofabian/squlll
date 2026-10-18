import { BellRing, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LessonRecord } from '@/lib/lesson-planning/api'
import { EditorSection } from './EditorSection'
import { ReflectionSummary } from './ReflectionSummary'

export function ReflectionSection({
  record,
  onRecord,
}: {
  record?: LessonRecord | null
  onRecord: () => void
}) {
  return (
    <EditorSection id="reflection" complete={Boolean(record)}>
      {record ? (
        <ReflectionSummary record={record} onEdit={onRecord} />
      ) : (
        <div className="flex flex-col items-start gap-4 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:from-rose-500/10 dark:to-amber-500/10">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm dark:bg-white/10 dark:text-rose-300">
              <BellRing className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">After the bell rings…</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Record what actually happened so coverage reflects reality.
              </p>
            </div>
          </div>
          <Button size="sm" className="app-print-hide rounded-xl" onClick={onRecord}>
            <ClipboardCheck className="size-3.5" /> Record lesson
          </Button>
        </div>
      )}
    </EditorSection>
  )
}
