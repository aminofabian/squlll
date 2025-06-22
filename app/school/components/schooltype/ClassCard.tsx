'use client'

import React from 'react'
import { Class } from './types'

interface ClassCardProps {
  cls: Class
}

export const ClassCard: React.FC<ClassCardProps> = ({ cls }) => {
  return (
    <div
      className="relative overflow-hidden group/class"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative p-5 bg-white border-2 rounded-xl border-[#246a59]/10 hover:border-[#246a59]/40
        shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1
        group-hover:bg-gradient-to-br from-white to-[#246a59]/5 hover:cursor-pointer">
        
        {/* Decorative corner accent */}
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#246a59]/5 rounded-bl-xl transform rotate-45 opacity-0 group-hover/class:opacity-100 transition-opacity duration-300"></div>
        
        {/* Class content */}
        <div className="relative z-10">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-[#246a59] mr-2 opacity-0 group-hover/class:opacity-100 transition-opacity duration-300"></div>
            <div className="font-semibold text-gray-900 group-hover/class:text-[#246a59] transition-colors duration-300">
              {cls.name}
            </div>
          </div>
          
          {cls.age && (
            <div className="text-xs text-gray-500 mt-2 pl-4 border-l border-gray-100 group-hover/class:border-[#246a59]/10 transition-colors duration-300">
              <span className="font-medium">Age:</span> {cls.age}
            </div>
          )}
          
          {cls.description && (
            <div className="text-xs text-gray-500 mt-2 pl-4 border-l border-gray-100 group-hover/class:border-[#246a59]/10 transition-colors duration-300">
              {cls.description}
            </div>
          )}
        </div>
        
        {/* Hover effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#246a59] transform scale-x-0 group-hover/class:scale-x-100 transition-transform duration-300 origin-left"></div>
      </div>
    </div>
  )
}
