'use client'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { FEES_LAYOUT } from '../../lib/fees-ui'
import { Check } from 'lucide-react'
import { FEE_LETTER_TEMPLATES } from '../../lib/feeLetter/templates'
import type { FeeLetterTemplateId } from '../../lib/feeLetter/types'

interface LetterTemplateSelectorProps {
  value: FeeLetterTemplateId
  onChange: (id: FeeLetterTemplateId) => void
  compact?: boolean
  /** Small swatches — use under letterhead, not as a main block. */
  minimal?: boolean
  /** Tighter row for preview dialog toolbar. */
  dense?: boolean
}

export function LetterTemplateSelector({
  value,
  onChange,
  compact = false,
  minimal = false,
  dense = false,
}: LetterTemplateSelectorProps) {
  const selectedMeta = FEE_LETTER_TEMPLATES.find((t) => t.id === value)

  if (minimal) {
    return (
      <div
        className={cn(
          dense
            ? 'flex items-center gap-1.5'
            : 'flex flex-col gap-2 min-[520px]:flex-row min-[520px]:items-center min-[520px]:gap-3',
        )}
        role="radiogroup"
        aria-label="Letter layout"
      >
        <span
          className={cn(
            'shrink-0 font-semibold uppercase text-slate-400',
            dense ? 'text-[9px] tracking-wide' : 'text-[10px] font-medium tracking-wide',
          )}
        >
          Layout
        </span>
        <div
          className={cn(
            FEES_LAYOUT.chipStrip,
            dense ? 'min-w-0 flex-1' : 'w-full min-[520px]:flex-wrap',
          )}
        >
          {FEE_LETTER_TEMPLATES.map((template) => {
            const selected = value === template.id
            return (
              <button
                key={template.id}
                type="button"
                role="radio"
                aria-checked={selected}
                title={template.label}
                onClick={() => onChange(template.id)}
                className={cn(
                  'inline-flex items-center rounded-md border font-medium transition-colors',
                  dense
                    ? 'h-6 gap-1 px-1.5 text-[9px]'
                    : 'h-7 gap-1.5 px-2 text-[10px]',
                  selected
                    ? 'border-primary/40 bg-primary/10 text-emerald-900 ring-1 ring-primary/25'
                    : 'border-transparent bg-white/80 text-slate-600 hover:bg-white hover:ring-1 hover:ring-slate-200/80',
                )}
              >
                <span
                  className={cn(
                    'shrink-0 rounded-sm border border-slate-200/80',
                    dense ? 'h-2 w-2' : 'h-2.5 w-2.5',
                  )}
                  style={{ background: template.swatch }}
                />
                <span className={cn('text-center', FEES_LAYOUT.textWrap)}>
                  {template.label}
                </span>
              </button>
            )
          })}
        </div>
        {!dense && selectedMeta ? (
          <span className="ml-auto hidden text-[10px] text-slate-500 sm:inline">
            {selectedMeta.description}
          </span>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {!compact ? (
        <Label className="text-xs font-medium text-slate-500">
          Letter template
        </Label>
      ) : null}
      <div
        className={cn(
          compact
            ? 'flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5 snap-x snap-mandatory scrollbar-thin'
            : 'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6',
        )}
        role="radiogroup"
        aria-label="Letter template"
      >
        {FEE_LETTER_TEMPLATES.map((template) => {
          const selected = value === template.id
          return (
            <button
              key={template.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(template.id)}
              className={cn(
                'relative flex flex-col rounded-lg border p-2 text-left transition-colors shrink-0',
                compact ? 'w-[6.25rem] snap-start p-1.5' : '',
                selected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
              )}
            >
              <div
                className={cn(
                  'mb-1.5 w-full rounded-md border border-slate-100',
                  compact ? 'h-6 mb-1' : 'h-10 mb-2',
                )}
                style={{ background: template.swatch }}
              />
              <span
                className={cn(
                  'font-semibold text-slate-800 leading-tight',
                  compact ? 'text-[10px]' : 'text-xs',
                )}
              >
                {template.label}
              </span>
              {!compact ? (
                <span
                  className={cn(
                    'mt-0.5 text-[10px] text-slate-500',
                    FEES_LAYOUT.textWrap,
                  )}
                >
                  {template.description}
                </span>
              ) : null}
              {selected ? (
                <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-3 w-3" />
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
