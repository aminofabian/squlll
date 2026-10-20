'use client'

import React, { RefObject } from 'react'
import { ClassOverride, SchoolType } from './types'
import { LevelCard } from './LevelCard'

interface LevelGridProps {
  selectedSchoolType: SchoolType
  selectedType: string
  selectedLevels: Record<string, Set<string>>
  toggleLevel: (e: React.MouseEvent, typeId: string, levelName: string) => void
  levelsSectionRef: RefObject<HTMLDivElement | null>
  classOverrides?: Record<string, ClassOverride>
  onRenameClass?: (levelName: string, originalName: string, name: string) => void
  onRemoveClass?: (levelName: string, originalName: string) => void
  onRestoreClass?: (levelName: string, originalName: string) => void
}

export const LevelGrid: React.FC<LevelGridProps> = ({
  selectedSchoolType,
  selectedType,
  selectedLevels,
  toggleLevel,
  levelsSectionRef,
  classOverrides,
  onRenameClass,
  onRemoveClass,
  onRestoreClass,
}) => {
  if (!selectedSchoolType) return null

  return (
    <div
      ref={levelsSectionRef}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {selectedSchoolType.levels.map((level) => {
        const isSelected = selectedLevels[selectedType]?.has(level.level) || false
        return (
          <LevelCard
            key={level.level}
            level={level}
            isSelected={isSelected}
            toggleLevel={toggleLevel}
            selectedType={selectedType}
            classOverrides={classOverrides}
            onRenameClass={onRenameClass}
            onRemoveClass={onRemoveClass}
            onRestoreClass={onRestoreClass}
          />
        )
      })}
    </div>
  )
}
