'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { SchoolType } from './types'

interface SchoolTypeSelectorProps {
  schoolTypes: SchoolType[]
  selectedType: string
  handleTypeSelect: (typeId: string) => void
  getSelectedLevelsCount: (typeId: string) => number
}

export const SchoolTypeSelector: React.FC<SchoolTypeSelectorProps> = ({
  schoolTypes,
  selectedType,
  handleTypeSelect,
  getSelectedLevelsCount,
}) => {
  return (
    <div className="lg:sticky lg:top-8">
      <p className="text-[0.5625rem] uppercase tracking-[0.2em] text-[#7c857d]">
        School type
      </p>

      <div className="mt-4 border-t border-[#14201b]/10">
        {schoolTypes.map((type) => {
          const Icon = type.icon
          const isSelected = selectedType === type.id
          const count = getSelectedLevelsCount(type.id)

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => handleTypeSelect(type.id)}
              aria-pressed={isSelected}
              className={`group flex w-full items-start gap-3 border-b border-[#14201b]/10 py-4 text-left transition-colors duration-200 ${
                isSelected ? '' : 'hover:bg-[#14201b]/[0.02]'
              }`}
            >
              <Icon
                className={`mt-0.5 h-4 w-4 shrink-0 transition-colors ${
                  isSelected ? 'text-[#1c3d32]' : 'text-[#14201b]/35'
                }`}
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-[0.8125rem] leading-snug transition-colors ${
                    isSelected ? 'font-medium text-[#14201b]' : 'text-[#4d574f]'
                  }`}
                >
                  {type.title}
                </span>
                <span className="mt-1 block text-[0.6875rem] leading-snug text-[#7c857d] line-clamp-2">
                  {type.description}
                </span>
              </span>
              {count > 0 ? (
                <span className="mt-0.5 flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full border border-[#1c3d32]/20 px-1 font-mono text-[0.5rem] tabular-nums text-[#1c3d32]">
                  {count}
                </span>
              ) : isSelected ? (
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#1c3d32]" strokeWidth={2} aria-hidden />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
