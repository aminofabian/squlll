import { CalendarX2 } from 'lucide-react'
import type { useLessonPlansPage } from '../hooks/useLessonPlansPage'
import { PlannerEmptyState } from './PlannerEmptyState'
import { PlansPanel } from './PlansPanel'
import { SchemesPanel } from './SchemesPanel'
import { WeekBoard } from './WeekBoard'

const SKELETON_DAYS = [0, 1, 2, 3, 4]
const SCHEMES_EMPTY_HINT =
  'A scheme of work maps topics to weeks so lesson plans arrive pre-filled. Create one for a class you teach.'

function WeekSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {SKELETON_DAYS.map((day) => (
          <div key={day} className="h-14 flex-1 animate-pulse rounded-xl bg-muted/60" />
        ))}
      </div>
      <div className="h-32 animate-pulse rounded-2xl bg-muted/60" />
    </div>
  )
}

export function PlannerTabContent({ page }: { page: ReturnType<typeof useLessonPlansPage> }) {
  if (page.tab === 'plans') return <PlansPanel plans={page.plans} loading={page.plansLoading} />
  if (page.tab === 'schemes') {
    return (
      <SchemesPanel schemes={page.schemes} loading={page.schemesLoading} onCreate={() => page.setSchemeDialogOpen(true)} emptyHint={SCHEMES_EMPTY_HINT} />
    )
  }
  if (page.loading && !page.week) return <WeekSkeleton />
  if (!page.week) {
    return (
      <PlannerEmptyState
        icon={CalendarX2}
        title="This week could not be loaded"
        description={`Make sure a timetable has been set up for ${page.selectedTerm?.name ?? 'this term'}.`}
      />
    )
  }
  return (
    <WeekBoard
      data={page.week}
      selectedDate={page.selectedDate}
      onSelectDate={page.setSelectedDate}
      onPrepare={page.prepare}
      onRecord={page.setRecordTarget}
      preparingId={page.preparingId}
    />
  )
}
