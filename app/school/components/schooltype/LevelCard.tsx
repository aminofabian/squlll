'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { Level } from './types'
import { ClassCard } from './ClassCard'

interface LevelCardProps {
  level: Level
  isSelected: boolean
  toggleLevel: (e: React.MouseEvent, typeId: string, levelName: string) => void
  selectedType: string
}

export const LevelCard: React.FC<LevelCardProps> = ({
  level,
  isSelected,
  toggleLevel,
  selectedType
}) => {
  return (
    <button
      onClick={(e) => toggleLevel(e, selectedType, level.level)}
      className={`group relative overflow-hidden transition-all duration-150 rounded-md border-2 cursor-pointer active:scale-[0.98] w-full text-left
        ${isSelected
          ? 'bg-gradient-to-br from-[#246a59]/10 to-white shadow-sm border-[#246a59]'
          : 'bg-white hover:bg-[#246a59]/5 border-gray-200 hover:border-[#246a59] hover:shadow-sm active:scale-[0.98]'
        }`}
    >
      {/* Selection indicator bar */}
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#246a59] to-[#1a4d42]" />
      )}
      
      {/* Main content */}
      <div className="p-2 relative">
        <div className="flex items-start justify-between gap-1.5 mb-1.5">
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-xs transition-colors duration-150 truncate ${
              isSelected
                ? 'text-[#246a59]'
                : 'text-gray-900 group-hover:text-[#246a59]'
            }`}>{level.level}</h3>
            {level.description && (
              <p className="text-[9px] text-gray-500 mt-0.5 line-clamp-1 leading-tight">
                {level.description}
              </p>
            )}
          </div>
          <div
            className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-150
              ${isSelected
                ? 'border-[#246a59] bg-[#246a59] text-white shadow-sm'
                : 'border-gray-300 group-hover:border-[#246a59] bg-white group-hover:bg-[#246a59]/5'
              }
              group-hover:scale-110 group-active:scale-95
            `}
          >
            {isSelected && <Check className="w-2.5 h-2.5" />}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1">
          {level.classes.map((cls) => (
            <ClassCard key={cls.name} cls={cls} />
          ))}
        </div>
      </div>
    </button>
  )
}
