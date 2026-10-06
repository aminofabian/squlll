'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { Class, ClassOverride } from './types'

interface ClassCardProps {
  cls: Class
  /** When true, the class can be renamed/removed for this tenant. */
  editable?: boolean
  override?: ClassOverride
  onRename?: (name: string) => void
  onRemove?: () => void
  onRestore?: () => void
}

/** Shared style for the floating action buttons on an editable class chip. */
const ACTION_BTN =
  'flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border bg-white shadow-sm transition-all duration-150 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1'

export const ClassCard: React.FC<ClassCardProps> = ({
  cls,
  editable = false,
  override,
  onRename,
  onRemove,
  onRestore,
}) => {
  const removed = override?.removed ?? false
  const displayName = override?.name ?? cls.name
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(displayName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const startEditing = () => {
    setDraft(displayName)
    setEditing(true)
  }

  const commit = () => {
    setEditing(false)
    const trimmed = draft.trim()
    if (!trimmed) {
      setDraft(displayName)
      return
    }
    // Renaming back to the original name clears the override upstream.
    onRename?.(trimmed)
  }

  // ---- Read-only chip (level not selected) ----
  if (!editable) {
    return (
      <div className="relative overflow-hidden">
        <div className="rounded-md border border-gray-200/60 bg-gray-50/60 p-1.5">
          <div className="truncate text-[10px] font-medium leading-tight text-gray-700">
            {cls.name}
          </div>
          {cls.age && (
            <div className="mt-0.5 text-[9px] text-gray-500">Age {cls.age}</div>
          )}
        </div>
      </div>
    )
  }

  // ---- Editable chip ----
  return (
    <div className="group/cls relative">
      <div
        role={removed ? undefined : 'button'}
        tabIndex={removed ? undefined : 0}
        title={removed ? undefined : 'Click to rename'}
        onClick={(e) => {
          e.stopPropagation()
          if (!removed && !editing) startEditing()
        }}
        onKeyDown={(e) => {
          if (!removed && !editing && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            startEditing()
          }
        }}
        className={`relative rounded-md border px-2 py-1.5 transition-all duration-150 ${
          removed
            ? 'border-dashed border-gray-300 bg-gray-50/70'
            : editing
              ? 'border-[#246a59] bg-white ring-1 ring-[#246a59]/30'
              : 'cursor-text border-gray-200 bg-white hover:border-[#246a59]/50 hover:bg-[#246a59]/[0.04] hover:shadow-sm'
        }`}
      >
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commit()
              } else if (e.key === 'Escape') {
                e.preventDefault()
                setDraft(displayName)
                setEditing(false)
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded border-0 bg-transparent p-0 text-[11px] font-semibold text-gray-800 outline-none placeholder:text-gray-400"
          />
        ) : (
          <div
            className={`truncate text-[10px] font-medium leading-tight ${
              removed ? 'text-gray-400 line-through' : 'text-gray-700'
            }`}
          >
            {displayName}
          </div>
        )}

        {cls.age && !editing && (
          <div className="mt-0.5 text-[9px] text-gray-500">Age {cls.age}</div>
        )}
      </div>

      {/* Floating actions — visible on hover/focus (or always for a removed chip) */}
      <div
        className={`absolute -right-1.5 -top-1.5 z-20 flex items-center gap-1 transition-opacity duration-150 ${
          removed
            ? 'opacity-100'
            : 'opacity-0 group-hover/cls:opacity-100 group-focus-within/cls:opacity-100'
        }`}
      >
        {removed ? (
          <button
            type="button"
            title="Restore class"
            aria-label={`Restore ${cls.name}`}
            onClick={(e) => {
              e.stopPropagation()
              onRestore?.()
            }}
            className={`${ACTION_BTN} border-[#246a59]/30 text-[#246a59] hover:border-[#246a59] hover:bg-[#246a59] hover:text-white focus-visible:ring-[#246a59]/40`}
          >
            <RotateCcw className="h-3 w-3" strokeWidth={2.5} />
          </button>
        ) : (
          <>
            <button
              type="button"
              title="Rename class"
              aria-label={`Rename ${displayName}`}
              onClick={(e) => {
                e.stopPropagation()
                startEditing()
              }}
              className={`${ACTION_BTN} border-gray-200 text-gray-500 hover:border-[#246a59] hover:bg-[#246a59] hover:text-white focus-visible:ring-[#246a59]/40`}
            >
              <Pencil className="h-3 w-3" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              title="Remove class"
              aria-label={`Remove ${displayName}`}
              onClick={(e) => {
                e.stopPropagation()
                onRemove?.()
              }}
              className={`${ACTION_BTN} border-gray-200 text-gray-500 hover:border-red-500 hover:bg-red-500 hover:text-white focus-visible:ring-red-400/50`}
            >
              <Trash2 className="h-3 w-3" strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
