'use client'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { FEES_BRAND, FEES_LAYOUT } from '../../lib/fees-ui'
import { Check } from 'lucide-react'
import { FEE_LETTER_TEMPLATES } from '../../lib/feeLetter/templates'
import type { FeeLetterTemplateId } from '../../lib/feeLetter/types'
import { LetterTemplateThumbnail } from './LetterTemplateThumbnail'

type LetterTemplateSelectorVariant = 'grid' | 'strip' | 'toolbar'

interface LetterTemplateSelectorProps {
  value: FeeLetterTemplateId
  onChange: (id: FeeLetterTemplateId) => void
  /** @deprecated Use variant="strip" */
  compact?: boolean
  /** @deprecated Use variant="strip" */
  minimal?: boolean
  /** @deprecated Use variant="toolbar" */
  dense?: boolean
  variant?: LetterTemplateSelectorVariant
}

function resolveVariant({
  variant,
  compact,
  minimal,
  dense,
}: Pick<
  LetterTemplateSelectorProps,
  'variant' | 'compact' | 'minimal' | 'dense'
>): LetterTemplateSelectorVariant {
  if (variant) return variant
  if (dense) return 'toolbar'
  if (minimal || compact) return 'strip'
  return 'grid'
}

function TemplateOption({
  template,
  selected,
  onSelect,
  size,
}: {
  template: (typeof FEE_LETTER_TEMPLATES)[number]
  selected: boolean
  onSelect: () => void
  size: 'grid' | 'strip' | 'toolbar'
}) {
  const isToolbar = size === 'toolbar'
  const isStrip = size === 'strip'

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${template.label}. ${template.description}`}
      title={template.description}
      onClick={onSelect}
      className={cn(
        'group relative text-left transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
        isToolbar && [
          'inline-flex min-w-0 flex-col items-center gap-1 rounded-lg border px-2 py-1.5',
          selected
            ? 'border-primary bg-primary/8 shadow-sm ring-2 ring-primary/35'
            : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/90',
        ],
        isStrip && [
          'flex w-[5.5rem] shrink-0 snap-start flex-col rounded-xl border p-2',
          selected
            ? 'border-primary bg-white shadow-[0_0_0_1px_rgba(36,106,89,0.15),0_4px_12px_-2px_rgba(36,106,89,0.2)] ring-2 ring-primary/40'
            : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-sm',
        ],
        size === 'grid' && [
          'flex w-full flex-col rounded-xl border p-2.5',
          selected
            ? 'border-primary bg-white shadow-[0_0_0_1px_rgba(36,106,89,0.12),0_6px_16px_-4px_rgba(36,106,89,0.22)] ring-2 ring-primary/45'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-sm',
        ],
      )}
    >
      <LetterTemplateThumbnail
        templateId={template.id}
        className={cn(
          'w-full',
          isToolbar ? 'h-7' : isStrip ? 'h-9' : 'h-12',
        )}
      />

      <span
        className={cn(
          'font-semibold leading-tight text-slate-800',
          isToolbar ? 'mt-0.5 max-w-full truncate text-center text-[9px]' : 'mt-1.5',
          isStrip ? 'text-[10px]' : 'text-xs',
        )}
      >
        {template.label}
      </span>

      {!isToolbar ? (
        <span
          className={cn(
            'mt-0.5 line-clamp-2 text-slate-500',
            isStrip ? 'text-[9px] leading-snug' : 'text-[10px]',
            FEES_LAYOUT.textWrap,
          )}
        >
          {template.description}
        </span>
      ) : null}

      {selected ? (
        <span
          className={cn(
            'absolute flex items-center justify-center rounded-full text-white shadow-sm',
            isToolbar
              ? 'right-0.5 top-0.5 h-3.5 w-3.5'
              : 'right-1.5 top-1.5 h-5 w-5',
          )}
          style={{ backgroundColor: FEES_BRAND.primary }}
        >
          <Check className={isToolbar ? 'h-2 w-2' : 'h-3 w-3'} strokeWidth={3} />
        </span>
      ) : (
        <span
          className={cn(
            'absolute rounded-full border-2 border-slate-200/90 bg-white transition-colors',
            'group-hover:border-slate-300',
            isToolbar
              ? 'right-0.5 top-0.5 h-3.5 w-3.5'
              : 'right-1.5 top-1.5 h-5 w-5',
          )}
          aria-hidden
        />
      )}
    </button>
  )
}

export function LetterTemplateSelector({
  value,
  onChange,
  compact = false,
  minimal = false,
  dense = false,
  variant: variantProp,
}: LetterTemplateSelectorProps) {
  const variant = resolveVariant({
    variant: variantProp,
    compact,
    minimal,
    dense,
  })
  const selectedMeta = FEE_LETTER_TEMPLATES.find((t) => t.id === value)

  if (variant === 'toolbar') {
    return (
      <div
        className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
        role="radiogroup"
        aria-label="Letter layout"
      >
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Layout
        </span>
        <div className={cn(FEES_LAYOUT.chipStrip, 'min-w-0 flex-1 gap-2')}>
          {FEE_LETTER_TEMPLATES.map((template) => (
            <TemplateOption
              key={template.id}
              template={template}
              selected={value === template.id}
              onSelect={() => onChange(template.id)}
              size="toolbar"
            />
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'strip') {
    return (
      <div className="min-w-0 space-y-2" role="radiogroup" aria-label="Letter layout">
        <div className="flex items-baseline justify-between gap-2">
          <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Letter layout
          </Label>
          {selectedMeta ? (
            <span className="hidden text-[10px] text-slate-500 sm:inline">
              {selectedMeta.description}
            </span>
          ) : null}
        </div>
        <div
          className={cn(
            'flex gap-2 overflow-x-auto pb-1',
            'snap-x snap-mandatory scroll-smooth',
            '[scrollbar-width:thin]',
          )}
        >
          {FEE_LETTER_TEMPLATES.map((template) => (
            <TemplateOption
              key={template.id}
              template={template}
              selected={value === template.id}
              onSelect={() => onChange(template.id)}
              size="strip"
            />
          ))}
        </div>
        {selectedMeta ? (
          <p className="text-[10px] leading-relaxed text-slate-500 sm:hidden">
            {selectedMeta.description}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-2.5" role="radiogroup" aria-label="Letter template">
      <Label className="text-xs font-medium text-slate-500">
        Choose a layout
      </Label>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
        {FEE_LETTER_TEMPLATES.map((template) => (
          <TemplateOption
            key={template.id}
            template={template}
            selected={value === template.id}
            onSelect={() => onChange(template.id)}
            size="grid"
          />
        ))}
      </div>
      {selectedMeta ? (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200/70">
          <span className="font-medium text-slate-800">{selectedMeta.label}</span>
          {' — '}
          {selectedMeta.description}
        </p>
      ) : null}
    </div>
  )
}
