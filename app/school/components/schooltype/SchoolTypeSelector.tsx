'use client'

import React from 'react'
import { SchoolType } from './types'
import { Check } from 'lucide-react'

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
  getSelectedLevelsCount
}) => {
  return (
    <div className="w-full lg:w-64 lg:flex-shrink-0">
      <div className="lg:sticky lg:top-4 space-y-1 p-2 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-lg shadow-sm">
        <div className="mb-1.5 px-0.5">
          <h3 className="text-sm font-semibold text-gray-900">School Type</h3>
          <p className="text-[10px] text-gray-500 hidden lg:block mt-0.5">Select curriculum</p>
        </div>
        
        {/* Mobile View - Compact Grid */}
        <div className="lg:hidden">
          <div className="grid grid-cols-2 gap-1.5">
            {schoolTypes.map((type) => {
              const Icon = type.icon
              const isSelected = selectedType === type.id
              const selectedLevelCount = getSelectedLevelsCount(type.id)

              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className={`group relative flex flex-col items-center justify-center aspect-square rounded-lg transition-all duration-150 overflow-hidden border-2 cursor-pointer active:scale-95
                    ${isSelected
                      ? 'bg-gradient-to-br from-[#246a59] to-[#1a4d42] text-white shadow-md border-[#246a59]'
                      : 'bg-white hover:bg-[#246a59]/5 text-gray-700 shadow-sm border-gray-200 hover:border-[#246a59] hover:shadow-md active:scale-95'
                    }`}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  
                  {/* Icon container */}
                  <div className={`relative mb-1 p-2 rounded-md transition-all duration-150 ${
                    isSelected 
                      ? 'bg-white/20' 
                      : 'bg-gray-50 group-hover:bg-[#246a59]/10'
                  }`}>
                    <Icon className={`w-4 h-4 transition-colors ${
                      isSelected ? 'text-white' : 'text-gray-600 group-hover:text-[#246a59]'
                    }`} />
                  </div>
                  
                  {/* Title */}
                  <span className={`text-[10px] font-semibold text-center px-1.5 leading-tight ${
                    isSelected ? 'text-white' : 'text-gray-700'
                  }`}>
                    {type.title.split(' ')[0]}
                  </span>
                  
                  {/* Badge */}
                  {selectedLevelCount > 0 && (
                    <span className={`absolute bottom-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      isSelected 
                        ? 'bg-white/30 text-white' 
                        : 'bg-[#246a59] text-white'
                    }`}>
                      {selectedLevelCount}
                    </span>
                  )}
                  
                  {/* Emoji accent */}
                  {type.emoji && (
                    <span className={`absolute top-0.5 left-0.5 text-[10px] opacity-50 ${
                      isSelected ? 'opacity-25' : ''
                    }`}>
                      {type.emoji}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Desktop View - Compact List */}
        <div className="hidden lg:grid lg:grid-cols-1 gap-1">
          {schoolTypes.map((type) => {
            const Icon = type.icon
            const isSelected = selectedType === type.id
            const selectedLevelCount = getSelectedLevelsCount(type.id)

            return (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                className={`group relative w-full px-2 py-1.5 border-2 transition-all duration-150 rounded-md overflow-hidden cursor-pointer active:scale-[0.98]
                  ${isSelected
                    ? 'border-[#246a59] bg-gradient-to-r from-[#246a59]/10 to-[#246a59]/5 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-[#246a59] hover:bg-[#246a59]/5 hover:shadow-sm active:scale-[0.98]'
                  }`}
              >
                {/* Selection indicator bar */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#246a59] to-[#1a4d42]" />
                )}
                
                <div className="relative flex items-center gap-2">
                  {/* Icon with emoji */}
                  <div className="flex-shrink-0 relative">
                    <div className={`p-1 rounded transition-all duration-150 ${
                      isSelected 
                        ? 'bg-[#246a59]/15' 
                        : 'bg-gray-50 group-hover:bg-[#246a59]/10'
                    }`}>
                      <Icon className={`w-3.5 h-3.5 transition-colors ${
                        isSelected 
                          ? 'text-[#246a59]' 
                          : 'text-gray-500 group-hover:text-[#246a59]'
                      }`} />
                    </div>
                    {type.emoji && (
                      <span className="absolute -top-0.5 -right-0.5 text-[9px] opacity-60">
                        {type.emoji}
                      </span>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <h3 className={`text-xs font-semibold truncate transition-colors ${
                        isSelected 
                          ? 'text-[#246a59]' 
                          : 'text-gray-900 group-hover:text-[#246a59]'
                      }`}>
                        {type.title}
                      </h3>
                      {selectedLevelCount > 0 && (
                        <span className={`flex-shrink-0 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold rounded-full ${
                          isSelected 
                            ? 'bg-[#246a59] text-white' 
                            : 'bg-[#246a59] text-white'
                        }`}>
                          {selectedLevelCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-gray-500 mt-0.5 line-clamp-1 leading-tight">
                      {type.description}
                    </p>
                  </div>
                  
                  {/* Check icon for selected */}
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#246a59] flex items-center justify-center">
                        <Check className="w-2 h-2 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
