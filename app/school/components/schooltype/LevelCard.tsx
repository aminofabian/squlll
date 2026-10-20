'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { ClassOverride, Level } from './types'
import { ClassCard } from './ClassCard'

interface LevelCardProps {
  level: Level
  isSelected: boolean
  toggleLevel: (e: React.MouseEvent, typeId: string, levelName: string) => void
  selectedType: string
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
  classOverrides,
  onRenameClass,
  onRemoveClass,
  onRestoreClass,
}) => {
  return (
    <div
      className={`group relative border p-4 transition-colors duration-200 ${
        isSelected
          ? 'border-[#1c3d32] bg-[#1c3d32]/[0.03]'
          : 'border-[#14201b]/10 bg-[#fcfaf4] hover:border-[#14201b]/25'
      }`}
    >
      {isSelected ? (
        <span className="absolute inset-y-0 left-0 w-[2px] bg-[#a98a55]" aria-hidden />
      ) : null}

      <button
        type="button"
        aria-pressed={isSelected}
        onClick={(e) => toggleLevel(e, selectedType, level.level)}
        className="flex w-full items-start justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1c3d32]/25"
      >
        <span className="min-w-0">
          <span className="block font-display text-[1.15rem] leading-tight tracking-[-0.015em] text-[#14201b]">
            {level.level}
          </span>
          {level.description ? (
            <span className="mt-1.5 block text-[0.625rem] leading-snug text-[#7c857d] line-clamp-2">
              {level.description}
            </span>
          ) : null}
        </span>
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
            isSelected
              ? 'border-[#1c3d32] bg-[#1c3d32]'
              : 'border-[#14201b]/20 bg-transparent group-hover:border-[#14201b]/40'
          }`}
        >
          {isSelected ? (
            <Check className="h-2.5 w-2.5 text-[#f7f4ec]" strokeWidth={3} />
          ) : null}
        </span>
      </button>

      <div className="mt-4 grid grid-cols-2 gap-1.5">
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
