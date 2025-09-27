'use client'

import React from 'react'
import { X, CheckCircle, Info } from "lucide-react"

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastNotificationsProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export const ToastNotifications: React.FC<ToastNotificationsProps> = ({
  toasts,
  onDismiss
}) => {
  const icons = {
    success: <CheckCircle className="h-4 w-4 text-white" />,
    error: <X className="h-4 w-4 text-white" />,
    info: <Info className="h-4 w-4 text-white" />
  }
  
  const colors = {
    success: 'bg-gradient-to-r from-green-500 to-green-600 border-green-600 text-white',
    error: 'bg-gradient-to-r from-red-500 to-red-600 border-red-600 text-white',
    info: 'bg-gradient-to-r from-primary to-primary/90 border-primary text-white'
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 shadow-lg border transform transition-all duration-300 ease-in-out animate-in slide-in-from-right flex items-center ${colors[toast.type]}`}
        >
          <div className="mr-3 p-1 bg-white/20">
            {icons[toast.type]}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{toast.message}</span>
            <span className="text-xs opacity-80">Click to dismiss</span>
          </div>
          <button 
            className="ml-3 p-1 hover:bg-white/20 transition-colors"
            onClick={() => onDismiss(toast.id)}
          >
            <X className="h-3 w-3 text-white" />
          </button>
        </div>
      ))}
    </div>
  )
}
