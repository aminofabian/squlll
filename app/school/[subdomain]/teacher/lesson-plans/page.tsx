'use client'

import React from 'react'
import { AlertCircle, CalendarRange } from 'lucide-react'
import { CoverageNote } from './components/CoverageNote'
import { PlannerEmptyState } from './components/PlannerEmptyState'
import { PlannerHero } from './components/PlannerHero'
import { PlannerStats } from './components/PlannerStats'
import { PlannerTabContent } from './components/PlannerTabContent'
import { PlannerTabs } from './components/PlannerTabs'
import { RecordLessonDialog } from './components/RecordLessonDialog'
import { CreateSchemeDialog } from './components/SchemesPanel'
import { useLessonPlansPage } from './hooks/useLessonPlansPage'

export default function TeacherLessonPlansPage() {
  const page = useLessonPlansPage()

  if (!page.termsLoading && !page.termId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <PlannerEmptyState icon={CalendarRange} title="No active term yet" description="Lesson planning starts once your school sets up an academic term." />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-5 lg:px-0 lg:py-0">
      <div>
        <PlannerHero termName={page.selectedTerm?.name} week={page.week} onPrevious={page.previousWeek} onNext={page.nextWeek} onToday={page.thisWeek} />
        <PlannerStats week={page.week} />
      </div>
      <PlannerTabs tab={page.tab} onChange={page.setTab} onNewScheme={() => page.setSchemeDialogOpen(true)} />
      {page.error && (
        <div role="alert" className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{page.error}</span>
        </div>
      )}
      <PlannerTabContent page={page} />
      <CoverageNote />
      <CreateSchemeDialog open={page.schemeDialogOpen} onOpenChange={page.setSchemeDialogOpen} subdomain={page.subdomain} termId={page.termId!} periods={page.weekPeriods} />
      {page.recordTarget && page.termId && (
        <RecordLessonDialog
          open
          onOpenChange={(open) => !open && page.setRecordTarget(null)}
          subdomain={page.subdomain}
          termId={page.termId}
          target={{ kind: 'period', period: page.recordTarget }}
          existing={page.recordTarget.record}
          onSaved={page.handleRecordSaved}
        />
      )}
    </div>
  )
}
