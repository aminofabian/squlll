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
      className={`group relative overflow-hidden transition-all duration-300 rounded-xl border-2 cursor-pointer
        ${isSelected
          ? 'bg-[#246a59]/5 shadow-xl border-[#246a59]'
          : 'bg-gradient-to-br from-white to-gray-50 hover:shadow-lg hover:-translate-y-1 border-gray-200 hover:border-[#246a59]/50'
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
        <div className="absolute top-3 right-3 flex items-center justify-center">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#246a59] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#246a59]"></span>
          </span>
        </div>
      )}
      
      {/* Main content */}
      <div className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className={`font-bold text-lg transition-colors duration-300 ${
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
                <p className="text-sm text-gray-500 mt-2 group-hover:text-gray-600 transition-colors duration-300 pr-8">
                  {level.description}
                </p>
                <div className={`absolute -left-4 top-0 bottom-0 w-1 rounded-full transition-colors duration-300 ${
                  isSelected
                    ? 'bg-[#246a59]/70'
                    : 'bg-gray-200 group-hover:bg-[#246a59]/30'
                }`} />
              </div>
            )}
          </div>
          <div
            className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300
              ${isSelected
                ? 'border-[#246a59] bg-[#246a59] text-white shadow-md'
                : 'border-gray-300 group-hover:border-[#246a59] group-hover:shadow-md bg-white'
              }
              group-hover:scale-110 group-active:scale-95
            `}
          >
            {isSelected && <Check className="w-5 h-5" />}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {level.classes.map((cls) => (
            <ClassCard key={cls.name} cls={cls} />
          ))}
        </div>
      </div>
    </div>
  )
}
