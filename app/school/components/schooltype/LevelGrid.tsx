'use client'

import React, { RefObject, useState, useEffect } from 'react'
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
  onRestoreClass
}) => {
  const [showHint, setShowHint] = useState(true)
  const selectedCount = selectedLevels[selectedType]?.size || 0

  useEffect(() => {
    if (selectedCount > 0) {
      setShowHint(false)
    }
  }, [selectedCount])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false)
    }, 6000)
    return () => clearTimeout(timer)
  }, [])

  if (!selectedSchoolType) return null
  
  return (
    <div ref={levelsSectionRef} className="bg-white/70 backdrop-blur-sm rounded-md p-1.5 border border-gray-200/60 shadow-sm relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5">
        {selectedSchoolType.levels.map((level, index) => {
          const isSelected = selectedLevels[selectedType]?.has(level.level) || false
          const shouldShowHint = showHint && index === 0 && !isSelected
          return (
            <LevelCard
              key={level.level}
              level={level}
              isSelected={isSelected}
              toggleLevel={toggleLevel}
              selectedType={selectedType}
              showHint={shouldShowHint}
              classOverrides={classOverrides}
              onRenameClass={onRenameClass}
              onRemoveClass={onRemoveClass}
              onRestoreClass={onRestoreClass}
            />
          )
        })}
      </div>
    </div>
  )
}
