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
    <div className="bg-white border-l-4 border-l-[#246a59] p-3 shadow-sm rounded-r-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#246a59] flex items-center">
            {selectedSchoolType.title}
            {selectedSchoolType.emoji && (
              <span className="ml-2">{selectedSchoolType.emoji}</span>
            )}
          </h2>
          <p className="text-sm text-gray-600 mt-0.5">{selectedSchoolType.description}</p>
        </div>
        <div className="bg-[#246a59]/5 px-3 py-1.5 rounded-sm">
          <span className="text-sm font-medium text-[#246a59]">
            {getSelectedLevelsCount(selectedType)} levels selected
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2 hide-scrollbar overflow-x-auto pb-1 max-w-full">
        {selectedSchoolType.menu.map((item, index) => (
          <span 
            key={index}
            className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#246a59]/10 text-[#246a59] hover:bg-[#246a59]/20 transition-all duration-200 rounded-md hover:scale-105"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
