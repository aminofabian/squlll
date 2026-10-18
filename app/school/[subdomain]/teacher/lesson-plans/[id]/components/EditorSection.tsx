import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EDITOR_SECTIONS, type EditorSectionId } from '../constants/editorSections'

export function EditorSection({
  id,
  complete,
  action,
  children,
}: {
  id: EditorSectionId
  complete?: boolean
  action?: React.ReactNode
  children: React.ReactNode
}) {
  const meta = EDITOR_SECTIONS.find((section) => section.id === id) ?? EDITOR_SECTIONS[0]
  const Icon = meta.icon

  return (
    <section
      id={id}
      className="app-print-card scroll-mt-20 lg:scroll-mt-24 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-2xl', meta.accent)}>
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Step {meta.step}
              {complete && (
                <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" /> Done
                </span>
              )}
            </p>
            <h2 className="text-base font-semibold leading-tight">{meta.title}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{meta.description}</p>
          </div>
        </div>
        {action}
      </header>
      <div className="space-y-4 px-5 pb-5 pt-4">{children}</div>
    </section>
  )
}
