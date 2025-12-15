'use client'

import React, { useState, useEffect } from 'react'
import { SchoolType } from './types'
import { Check, ArrowRight } from 'lucide-react'

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
  const [showHint, setShowHint] = useState(true)
  const [hintDismissed, setHintDismissed] = useState(false)

  useEffect(() => {
    if (selectedType) {
      setShowHint(false)
    }
  }, [selectedType])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false)
      setHintDismissed(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  const shouldShowArrow = showHint && !hintDismissed && !selectedType

  return (
    <div className="w-full lg:w-64 lg:flex-shrink-0">
      <div className="lg:sticky lg:top-4 space-y-1 p-2 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-lg shadow-sm relative">
        <div className="mb-1.5 px-0.5">
          <h3 className="text-sm font-semibold text-gray-900">School Type</h3>
          <p className="text-[10px] text-gray-500 hidden lg:block mt-0.5">Select curriculum</p>
        </div>
        
        {/* Mobile View - Compact Grid */}
        <div className="lg:hidden relative">
          {/* Animated Arrow Hint */}
          {shouldShowArrow && (
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <div className="flex flex-col items-center gap-1 animate-slide-bounce">
                <ArrowRight className="w-5 h-5 text-[#246a59] animate-pulse drop-shadow-sm" />
                <span className="text-[9px] font-semibold text-[#246a59] whitespace-nowrap bg-white/95 px-1.5 py-0.5 rounded border border-[#246a59]/20 shadow-sm">Click to select</span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-1.5">
            {schoolTypes.map((type, index) => {
              const Icon = type.icon
              const isSelected = selectedType === type.id
              const selectedLevelCount = getSelectedLevelsCount(type.id)
              const showPulse = shouldShowArrow && index === 0

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleTypeSelect(type.id)
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  className={`group relative flex flex-col items-center justify-center aspect-square rounded-lg transition-all duration-150 overflow-visible border-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#246a59]/50 focus:ring-offset-1 z-0
                    ${isSelected
                      ? 'bg-gradient-to-br from-[#246a59] to-[#1a4d42] text-white shadow-lg border-[#246a59] ring-2 ring-[#246a59]/30'
                      : 'bg-white hover:bg-[#246a59]/8 text-gray-700 shadow-sm border-gray-200 hover:border-[#246a59] hover:shadow-md hover:ring-1 hover:ring-[#246a59]/20 active:bg-[#246a59]/12'
                    }
                    ${showPulse ? 'animate-pulse ring-2 ring-[#246a59]/40' : ''}
                  `}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  
                  {/* Icon container */}
                  <div className={`relative mb-0.5 p-1.5 rounded-md transition-all duration-150 ${
                    isSelected 
                      ? 'bg-white/25' 
                      : 'bg-gray-50 group-hover:bg-[#246a59]/15 group-hover:scale-105'
                  }`}>
                    <Icon className={`w-3.5 h-3.5 transition-colors ${
                      isSelected ? 'text-white' : 'text-gray-600 group-hover:text-[#246a59]'
                    }`} />
                  </div>
                  
                  {/* Title */}
                  <span className={`text-[10px] font-bold text-center px-1 leading-tight ${
                    isSelected ? 'text-white' : 'text-gray-700 group-hover:text-[#246a59]'
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
        <div className="hidden lg:grid lg:grid-cols-1 gap-1 relative">
          {/* Animated Arrow Hint */}
          {shouldShowArrow && (
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <div className="flex flex-col items-center gap-1 animate-slide-bounce">
                <ArrowRight className="w-4 h-4 text-[#246a59] animate-pulse drop-shadow-sm" />
                <span className="text-[9px] font-semibold text-[#246a59] whitespace-nowrap bg-white/95 px-1.5 py-0.5 rounded border border-[#246a59]/20 shadow-sm">Click here</span>
              </div>
            </div>
          )}
          {schoolTypes.map((type, index) => {
            const Icon = type.icon
            const isSelected = selectedType === type.id
            const selectedLevelCount = getSelectedLevelsCount(type.id)
            const showPulse = shouldShowArrow && index === 0

            return (
              <button
                key={type.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleTypeSelect(type.id)
                }}
                onMouseDown={(e) => e.preventDefault()}
                className={`group relative w-full px-2 py-1.5 border-2 transition-all duration-150 rounded-md overflow-visible cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#246a59]/50 focus:ring-offset-1 z-0
                  ${isSelected
                    ? 'border-[#246a59] bg-gradient-to-r from-[#246a59]/12 to-[#246a59]/6 shadow-sm ring-1 ring-[#246a59]/20'
                    : 'border-gray-200 bg-white hover:border-[#246a59] hover:bg-[#246a59]/8 hover:shadow-sm hover:ring-1 hover:ring-[#246a59]/15 active:bg-[#246a59]/12'
                  }
                  ${showPulse ? 'animate-pulse ring-2 ring-[#246a59]/40' : ''}
                `}
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
                        ? 'bg-[#246a59]/18' 
                        : 'bg-gray-50 group-hover:bg-[#246a59]/12 group-hover:scale-105'
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
