'use client'

import React from 'react'
import { SchoolType } from './types'

interface SelectedTypeHeaderProps {
  selectedSchoolType: SchoolType
  getSelectedLevelsCount: (typeId: string) => number
  selectedType: string
}

export const SelectedTypeHeader: React.FC<SelectedTypeHeaderProps> = ({
  selectedSchoolType,
  getSelectedLevelsCount,
  selectedType,
}) => {
  if (!selectedSchoolType) return null

  const count = getSelectedLevelsCount(selectedType)

  return (
    <div className="border-b border-[#14201b]/10 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div className="min-w-0">
          <p className="text-[0.5625rem] uppercase tracking-[0.2em] text-[#7c857d]">
            Curriculum
          </p>
          <h2 className="mt-3 font-display text-[2rem] leading-none tracking-[-0.02em] text-[#14201b]">
            {selectedSchoolType.title}
          </h2>
          <p className="mt-3 max-w-[62ch] text-[0.8125rem] leading-relaxed text-[#4d574f]">
            {selectedSchoolType.description}
          </p>
        </div>
        <p className="shrink-0 text-[0.5625rem] uppercase tracking-[0.16em] text-[#7c857d]">
          {count} {count === 1 ? 'level' : 'levels'} selected
        </p>
      </div>
    </div>
  )
}
