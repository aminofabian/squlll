'use client'

import React from 'react'
import { SchoolType } from './types'

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
    <div className="w-full lg:w-80 lg:flex-shrink-0">
      <div className="lg:sticky lg:top-4 space-y-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">School Types</h3>
          <p className="text-sm text-gray-500 hidden lg:block">Choose the curriculum that best fits your educational goals.</p>
        </div>
        
        {/* Mobile View */}
        <div className="lg:hidden">
          <div className="grid grid-cols-2 grid-rows-2 gap-2">
            {schoolTypes.map((type) => {
              const Icon = type.icon
              const isSelected = selectedType === type.id
              const selectedLevelCount = getSelectedLevelsCount(type.id)

              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className={`flex flex-col items-center justify-center aspect-square rounded-2xl transition-all duration-300 relative overflow-hidden border-2
                    ${isSelected
                      ? 'bg-[#246a59] text-white shadow-xl scale-[0.98] border-[#246a59]'
                      : 'bg-white hover:bg-[#246a59]/5 text-gray-900 shadow-lg hover:scale-[0.98] border-gray-200 hover:border-[#246a59]/50'
                    }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br opacity-10 ${
                    isSelected ? 'from-white via-transparent to-black/20' : 'from-gray-50 via-transparent to-transparent'
                  }`} />
                  <div className={`mb-3 p-4 rounded-xl transition-all duration-300 ${
                    isSelected ? 'bg-white/10' : 'bg-[#246a59]/5'
                  }`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-center font-semibold text-base">
                      {type.title.split(' ')[0]}
                    </span>
                    {selectedLevelCount > 0 && (
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        isSelected ? 'bg-white/20' : 'bg-[#246a59] text-white'
                      }`}>
                        {selectedLevelCount}
                      </span>
                    )}
                  </div>
                  {type.emoji && (
                    <span className="absolute bottom-3 opacity-75 text-lg">{type.emoji}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Desktop View */}
        <div className="hidden lg:grid lg:grid-cols-1 gap-3">
          {schoolTypes.map((type) => {
            const Icon = type.icon
            const isSelected = selectedType === type.id
            const selectedLevelCount = getSelectedLevelsCount(type.id)

            return (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                className={`group w-full p-4 border transition-all duration-300 relative overflow-hidden rounded-lg ${
                  isSelected
                    ? 'border-[#246a59] bg-[#246a59]/5 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-[#246a59]/50'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-[#246a59]/5 transition-all duration-500"></div>
                <div className="relative flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`p-2 transition-all duration-300 ${
                      isSelected ? 'bg-[#246a59]/10' : 'bg-gray-50 group-hover:bg-[#246a59]/5'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isSelected ? 'text-[#246a59]' : 'text-gray-500 group-hover:text-[#246a59]'
                      }`} />
                    </div>
                    {type.emoji && (
                      <span className="text-xl mt-2 block">{type.emoji}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold transition-colors duration-300 ${
                        isSelected ? 'text-[#246a59]' : 'text-gray-900 group-hover:text-[#246a59]'
                      }`}>{type.title}</h3>
                      {selectedLevelCount > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#246a59] text-white">
                          {selectedLevelCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{type.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
