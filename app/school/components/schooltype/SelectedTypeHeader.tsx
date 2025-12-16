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
  selectedType
}) => {
  if (!selectedSchoolType) return null
  
  return (
    <div className="bg-white/90 backdrop-blur-sm border-l-2 border-l-[#246a59] p-2 shadow-sm rounded-r-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-[#246a59] truncate">
              {selectedSchoolType.title.toUpperCase()}
            </h2>
            {selectedSchoolType.emoji && (
              <span className="text-xs flex-shrink-0">{selectedSchoolType.emoji}</span>
            )}
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{selectedSchoolType.description}</p>
        </div>
        <div className="flex-shrink-0 bg-[#246a59]/10 px-2 py-0.5 rounded border border-[#246a59]/20">
          <span className="text-[10px] font-semibold text-[#246a59]">
            {getSelectedLevelsCount(selectedType)} SELECTED
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-1.5 hide-scrollbar overflow-x-auto pb-0.5 max-w-full">
        {selectedSchoolType.menu.map((item, index) => (
          <span 
            key={index}
            className="inline-flex items-center px-1 py-0.5 text-[9px] font-medium bg-gray-50 text-gray-600 rounded border border-gray-200/60"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
