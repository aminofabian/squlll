'use client'

import React, { useState } from 'react'
import type { LessonPlan } from '@/lib/lesson-planning/api'
import { RecordLessonDialog } from '@/app/school/[subdomain]/teacher/lesson-plans/components/RecordLessonDialog'
import { EditorNotices } from './components/EditorNotices'
import { EditorToolbar } from './components/EditorToolbar'
import { LessonHero } from './components/LessonHero'
import { LessonPlanSections } from './components/LessonPlanSections'
import { SectionNavChips } from './components/SectionNavChips'
import { SectionNavRail } from './components/SectionNavRail'
import { useActiveSection } from './hooks/useActiveSection'
import { useLessonPlanEditor } from './hooks/useLessonPlanEditor'
import { buildEditorNavItems } from './utils/buildEditorNavItems'

const PRINT_STYLES = `
  @media print {
    nav, header.app-print-hide, .app-print-hide { display: none !important; }
    body { background: #fff; }
    .app-print-card { box-shadow: none !important; border-color: #d4d4d8 !important; break-inside: avoid; }
  }
`

export function LessonPlanEditor({ subdomain, termId, initialPlan }: { subdomain: string; termId: string; initialPlan: LessonPlan }) {
  const editor = useLessonPlanEditor(subdomain, termId, initialPlan)
  const [recordOpen, setRecordOpen] = useState(false)
  const { plan, form, progress } = editor
  const navItems = buildEditorNavItems(progress.completed, plan.reviews.length > 0)
  const { activeId, scrollToSection } = useActiveSection(navItems.map((item) => item.id))

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-5 lg:px-0 lg:py-0">
      <style>{PRINT_STYLES}</style>
      <EditorToolbar saveStatus={editor.saveStatus} canSubmit={editor.canSubmit} submitting={editor.submitting} onSubmit={editor.submit} />
      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-6">
        <aside className="app-print-hide hidden lg:sticky lg:top-24 lg:block">
          <SectionNavRail items={navItems} activeId={activeId} onNavigate={scrollToSection} planningDone={progress.planningDone} planningTotal={progress.planningTotal} />
        </aside>
        <div className="min-w-0 space-y-4">
          <LessonHero plan={plan} topic={form.topic} durationMinutes={form.durationMinutes} percent={progress.percent} />
          <EditorNotices plan={plan} actionError={editor.actionError} />
          <SectionNavChips items={navItems} activeId={activeId} onNavigate={scrollToSection} />
          <LessonPlanSections editor={editor} onRecord={() => setRecordOpen(true)} />
        </div>
      </div>
      {recordOpen && (
        <RecordLessonDialog open={recordOpen} onOpenChange={setRecordOpen} subdomain={subdomain} termId={termId} target={{ kind: 'plan', plan }} existing={plan.record} onSaved={editor.handleRecordSaved} />
      )}
    </div>
  )
}
