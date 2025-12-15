'use client'

import React from 'react'
import { Class } from './types'

interface ClassCardProps {
  cls: Class
}

export const ClassCard: React.FC<ClassCardProps> = ({ cls }) => {
  return (
    <div
      className="relative overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative p-1.5 bg-gray-50/60 border rounded border-gray-200/60
        transition-all duration-150">
        
        {/* Class content */}
        <div className="relative">
          <div className="font-medium text-[10px] text-gray-700 truncate leading-tight">
            {cls.name}
          </div>
          
          {cls.age && (
            <div className="text-[9px] text-gray-500 mt-0.5">
              Age {cls.age}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
