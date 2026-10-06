'use client'

import React, { useState } from 'react'
import { Check, ArrowDown } from 'lucide-react'
import { ClassOverride, Level } from './types'
import { ClassCard } from './ClassCard'

interface LevelCardProps {
  level: Level
  isSelected: boolean
  toggleLevel: (e: React.MouseEvent, typeId: string, levelName: string) => void
  selectedType: string
  showHint?: boolean
  classOverrides?: Record<string, ClassOverride>
  onRenameClass?: (levelName: string, originalName: string, name: string) => void
  onRemoveClass?: (levelName: string, originalName: string) => void
  onRestoreClass?: (levelName: string, originalName: string) => void
}

export const LevelCard: React.FC<LevelCardProps> = ({
  level,
  isSelected,
  toggleLevel,
  selectedType,
  showHint = false,
  classOverrides,
  onRenameClass,
  onRemoveClass,
  onRestoreClass,
}) => {
  const [hasInteracted, setHasInteracted] = useState(false)

  const shouldShowArrow = showHint && !hasInteracted && !isSelected

  return (
    <div
      className={`group relative overflow-visible transition-all duration-150 rounded-md border-2 w-full text-left z-0
        ${isSelected
          ? 'bg-gradient-to-br from-[#246a59]/12 to-white shadow-sm border-[#246a59] ring-1 ring-[#246a59]/20'
          : 'bg-white hover:bg-[#246a59]/8 border-gray-200 hover:border-[#246a59] hover:shadow-sm hover:ring-1 hover:ring-[#246a59]/15 active:bg-[#246a59]/12'
        }
        ${shouldShowArrow ? 'animate-pulse ring-2 ring-[#246a59]/40' : ''}
      `}
    >
      {/* Animated Arrow Hint */}
      {shouldShowArrow && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-0.5 animate-slide-bounce-vertical">
            <ArrowDown className="w-4 h-4 text-[#246a59] animate-pulse drop-shadow-sm" />
            <span className="text-[9px] font-semibold text-[#246a59] whitespace-nowrap bg-white/95 px-1.5 py-0.5 rounded border border-[#246a59]/20 shadow-sm">Click to select</span>
          </div>
        </div>
      )}

      {/* Selection indicator bar */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#246a59] to-[#1a4d42]" />
      )}

      {/* Header — clicking toggles the whole level selection */}
      <button
        type="button"
        aria-pressed={isSelected}
        onClick={(e) => {
          e.preventDefault()
          toggleLevel(e, selectedType, level.level)
          setHasInteracted(true)
        }}
        onMouseDown={(e) => e.preventDefault()}
        className="w-full cursor-pointer rounded-md p-2.5 pb-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/50 focus-visible:ring-offset-1"
      >
        <div className="flex items-start justify-between gap-1.5 mb-1">
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-sm transition-colors duration-150 truncate ${
              isSelected
                ? 'text-[#246a59]'
                : 'text-gray-900 group-hover:text-[#246a59]'
            }`}>{level.level.toUpperCase()}</h3>
            {level.description && (
              <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 leading-tight">
                {level.description}
              </p>
            )}
          </div>
          <div
            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 pointer-events-none
              ${isSelected
                ? 'border-[#246a59] bg-[#246a59] text-white shadow-sm ring-1 ring-[#246a59]/30'
                : 'border-gray-300 group-hover:border-[#246a59] bg-white group-hover:bg-[#246a59]/10 group-hover:ring-1 group-hover:ring-[#246a59]/20'
              }
            `}
          >
            {isSelected && <Check className="w-3 h-3" />}
            {!isSelected && (
              <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-[#246a59]/40 transition-colors" />
            )}
          </div>
        </div>
      </button>

      {/* Classes — interactive when the level is selected (rename / remove per tenant) */}
      <div className="grid grid-cols-2 gap-1 px-2.5 pb-2.5">
        {level.classes.map((cls) => (
          <ClassCard
            key={cls.name}
            cls={cls}
            editable={isSelected}
            override={classOverrides?.[`${level.level}::${cls.name}`]}
            onRename={(name) => onRenameClass?.(level.level, cls.name, name)}
            onRemove={() => onRemoveClass?.(level.level, cls.name)}
            onRestore={() => onRestoreClass?.(level.level, cls.name)}
          />
        ))}
      </div>
    </div>
  )
}
