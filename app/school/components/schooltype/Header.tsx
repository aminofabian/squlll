'use client'

import React from 'react'
import { Clock } from 'lucide-react'

interface HeaderProps {
  subdomain: string
  currentStep: number
  totalSteps: number
}

export const Header: React.FC<HeaderProps> = ({
  subdomain,
  currentStep,
  totalSteps
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 bg-white/90 backdrop-blur-sm p-2 rounded-md border border-gray-200/60 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-br from-[#246a59] to-[#1a4d42] rounded-md flex items-center justify-center shadow-sm relative overflow-hidden">
            <span className="relative text-sm font-bold text-white">
              {subdomain.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
            {subdomain.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </h1>
          <p className="text-[9px] text-gray-500">SCHOOL SETUP</p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-[10px] bg-[#246a59]/10 px-2 py-1 rounded border border-[#246a59]/20">
        <Clock className="w-3 h-3 text-[#246a59]" />
        <span className="text-[#246a59] font-semibold">STEP {currentStep}/{totalSteps}</span>
      </div>
    </div>
  )
}
