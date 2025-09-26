'use client'

import React, { useState, useEffect, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }, [])

  return { toasts, showToast }
}

interface ToastNotificationProps {
  toasts: Toast[]
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ease-in-out animate-in slide-in-from-right ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800' 
              : toast.type === 'error'
              ? 'bg-red-50 border-red-400 text-red-800'
              : 'bg-primary/5 border-primary text-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
            {toast.type === 'error' && <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>}
            {toast.type === 'info' && <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
