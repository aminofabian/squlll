'use client'

import { useState } from 'react'
import { Clock, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { PaperComponentSelection } from '@/lib/exams/examPaperComponents'
import {
  addTemplateToSelection,
  addableTemplates,
  allTemplatesForSubject,
  createCustomPaperSelection,
  removeFromSelection,
} from '@/lib/exams/examPaperComponents'

interface SubjectPaperConfiguratorProps {
  subjectId: string
  subjectName: string
  subjectCode?: string
  components: PaperComponentSelection[]
  onChange: (subjectId: string, components: PaperComponentSelection[]) => void
  /** Allow removing the last paper (create flow only). */
  allowEmpty?: boolean
}

export function SubjectPaperConfigurator({
  subjectId,
  subjectName,
  subjectCode,
  components,
  onChange,
  allowEmpty = false,
}: SubjectPaperConfiguratorProps) {
  const [customLabel, setCustomLabel] = useState('')
  const [customDuration, setCustomDuration] = useState('60')
  const [showCustom, setShowCustom] = useState(false)

  const addable = addableTemplates(subjectName, subjectCode, components)
  const hasMultiple = allTemplatesForSubject(subjectName, subjectCode).length > 1

  const update = (next: PaperComponentSelection[]) => {
    if (!allowEmpty && next.length === 0) return
    onChange(subjectId, next)
  }

  const toggleComponent = (componentId: string) => {
    update(
      components.map((c) =>
        c.id === componentId ? { ...c, enabled: !c.enabled } : c,
      ),
    )
  }

  const updateDuration = (componentId: string, durationMinutes: number) => {
    update(
      components.map((c) =>
        c.id === componentId ? { ...c, durationMinutes } : c,
      ),
    )
  }

  const addTemplate = (templateId: string) => {
    const template = allTemplatesForSubject(subjectName, subjectCode).find(
      (t) => t.id === templateId,
    )
    if (!template) return
    update(addTemplateToSelection(components, template))
  }

  const addCustom = () => {
    const label = customLabel.trim()
    if (!label) return
    const custom = createCustomPaperSelection(
      label,
      Number(customDuration) || 60,
    )
    if (components.some((c) => c.id === custom.id)) {
      update(
        components.map((c) =>
          c.id === custom.id
            ? { ...custom, enabled: true }
            : c,
        ),
      )
    } else {
      update([...components, custom])
    }
    setCustomLabel('')
    setShowCustom(false)
  }

  if (components.length === 0) {
    return (
      <div className="mt-2 rounded-lg border border-dashed border-slate-200 p-3 dark:border-slate-700">
        <p className="text-xs text-slate-500">No papers selected.</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 h-7 text-xs"
          onClick={() =>
            update(
              allTemplatesForSubject(subjectName, subjectCode)
                .slice(0, 1)
                .map((t) => ({
                  id: t.id,
                  label: t.label,
                  enabled: true,
                  durationMinutes: t.defaultDurationMinutes,
                })),
            )
          }
        >
          <Plus className="mr-1 h-3 w-3" />
          Add paper
        </Button>
      </div>
    )
  }

  if (!hasMultiple && components.length === 1) {
    const single = components[0]
    return (
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-900/50">
        <Clock className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-[11px] text-slate-500">{single.label}</span>
        <Input
          type="number"
          min={15}
          step={5}
          value={single.durationMinutes}
          onChange={(e) =>
            updateDuration(single.id, Number(e.target.value) || 120)
          }
          className="ml-auto h-7 w-16 text-xs"
        />
        <span className="text-[11px] text-slate-400">min</span>
        {addable.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-1.5"
            onClick={() => addTemplate(addable[0].id)}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-slate-100 bg-slate-50/80 p-2 dark:border-slate-800 dark:bg-slate-900/50">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Papers for {subjectName}
      </p>

      {components.map((component) => (
        <div
          key={component.id}
          className={cn(
            'flex items-center gap-2 rounded-md border px-2 py-1.5',
            component.enabled
              ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
              : 'border-transparent opacity-60',
          )}
        >
          <button
            type="button"
            onClick={() => toggleComponent(component.id)}
            className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
              component.enabled
                ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                : 'border-slate-300',
            )}
          >
            {component.enabled ? (
              <span className="text-[9px] font-bold">✓</span>
            ) : null}
          </button>
          <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-800 dark:text-slate-200">
            {component.label}
          </span>
          <Input
            type="number"
            min={15}
            step={5}
            disabled={!component.enabled}
            value={component.durationMinutes}
            onChange={(e) =>
              updateDuration(component.id, Number(e.target.value) || 15)
            }
            className="h-7 w-16 text-xs"
          />
          <span className="text-[10px] text-slate-400">min</span>
          {(allowEmpty || components.length > 1) && (
            <button
              type="button"
              className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
              onClick={() => update(removeFromSelection(components, component.id))}
              aria-label={`Remove ${component.label}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {addable.length > 0 ? (
          <Select onValueChange={addTemplate}>
            <SelectTrigger className="h-7 w-auto gap-1 border-dashed text-[11px]">
              <Plus className="h-3 w-3" />
              <SelectValue placeholder="Add paper type" />
            </SelectTrigger>
            <SelectContent>
              {addable.map((t) => (
                <SelectItem key={t.id} value={t.id} className="text-xs">
                  {t.label} ({t.defaultDurationMinutes} min)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {!showCustom ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] text-slate-500"
            onClick={() => setShowCustom(true)}
          >
            + Custom paper
          </Button>
        ) : (
          <div className="flex w-full flex-wrap items-center gap-1.5">
            <Input
              placeholder="e.g. Listening test"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              className="h-7 flex-1 min-w-[120px] text-xs"
            />
            <Input
              type="number"
              min={15}
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              className="h-7 w-14 text-xs"
            />
            <Button type="button" size="sm" className="h-7 text-xs" onClick={addCustom}>
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowCustom(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
