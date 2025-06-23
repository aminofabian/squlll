'use client'

import React, { RefObject } from 'react'
import { SchoolType } from './types'
import { LevelCard } from './LevelCard'

interface LevelGridProps {
  selectedSchoolType: SchoolType
  selectedType: string
  selectedLevels: Record<string, Set<string>>
  toggleLevel: (e: React.MouseEvent, typeId: string, levelName: string) => void
  levelsSectionRef: RefObject<HTMLDivElement | null>
}

export const LevelGrid: React.FC<LevelGridProps> = ({
  selectedSchoolType,
  selectedType,
  selectedLevels,
  toggleLevel,
  levelsSectionRef
}) => {
  if (!selectedSchoolType) return null
  
  return (
    <div ref={levelsSectionRef} className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-gray-100 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {selectedSchoolType.levels.map((level) => {
          const isSelected = selectedLevels[selectedType]?.has(level.level) || false
          return (
            <LevelCard
              key={level.level}
              level={level}
              isSelected={isSelected}
              toggleLevel={toggleLevel}
              selectedType={selectedType}
            />
          )
        })}
      </div>
    </div>
  )
}
