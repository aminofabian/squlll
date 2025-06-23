'use client'

import React from 'react'
import { Clock, Sparkles } from 'lucide-react'

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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-12 h-12 bg-[#246a59] rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#246a59] to-[#2d8872]"></div>
            <span className="relative text-2xl font-bold text-white">
              {subdomain.charAt(0).toUpperCase()}
            </span>
            <div className="absolute top-0 right-0">
              <Sparkles className="w-3 h-3 text-white/50" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#2d8872] rounded-sm shadow-lg transform rotate-12"></div>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {subdomain.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </h1>
          <p className="text-sm text-gray-500">School Management System</p>
        </div>
      </div>
      <div className="flex items-center space-x-2 text-sm bg-[#246a59]/10 px-3 py-2 rounded-md">
        <Clock className="w-4 h-4 text-[#246a59]" />
        <span className="text-[#246a59] font-medium">Setup step {currentStep} of {totalSteps}</span>
      </div>
    </div>
  )
}
