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
    <div
      onClick={(e) => toggleLevel(e, selectedType, level.level)}
      className={`group relative overflow-hidden transition-all duration-300 rounded-lg border cursor-pointer hover:-translate-y-0.5
        ${isSelected
          ? 'bg-white shadow-md border-[#246a59]'
          : 'bg-white hover:shadow-md border-transparent hover:border-[#246a59]/30'
        }`}
    >
      {/* Decorative elements */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 pointer-events-none
          ${isSelected 
            ? 'bg-gradient-to-br from-[#246a59]/10 via-transparent to-[#246a59]/5'
            : 'bg-[url("/grid.svg")] opacity-[0.02] group-hover:opacity-[0.05]'
          }`}
      />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#246a59]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Pulsing dot indicator when selected */}
      {isSelected && (
        <div className="absolute top-2 right-2 flex items-center justify-center">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#246a59] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#246a59]"></span>
          </span>
        </div>
      )}
      
      {/* Main content */}
      <div className="p-4 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className={`font-bold text-base transition-colors duration-300 ${
                isSelected
                  ? 'text-[#246a59]'
                  : 'text-gray-900 group-hover:text-[#246a59]'
              }`}>{level.level}</h3>
              <div className={`h-px flex-1 transition-all duration-300 ${
                isSelected
                  ? 'bg-[#246a59]/30'
                  : 'bg-gray-200 group-hover:bg-[#246a59]/20'
              }`} />
            </div>
            {level.description && (
              <div className="relative">
                <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-300 pr-6 line-clamp-2">
                  {level.description}
                </p>
                <div className={`absolute -left-3 top-0 bottom-0 w-1 rounded-full transition-colors duration-300 ${
                  isSelected
                    ? 'bg-[#246a59]/70'
                    : 'bg-gray-200 group-hover:bg-[#246a59]/30'
                }`} />
              </div>
            )}
          </div>
          <div
            className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
              ${isSelected
                ? 'border-[#246a59] bg-[#246a59] text-white shadow-md'
                : 'border-gray-300 group-hover:border-[#246a59] group-hover:shadow-md bg-white'
              }
              group-hover:scale-110 group-active:scale-95
            `}
          >
            {isSelected && <Check className="w-4 h-4" />}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {level.classes.map((cls) => (
            <ClassCard key={cls.name} cls={cls} />
          ))}
        </div>
      </div>
    </div>
  )
}
