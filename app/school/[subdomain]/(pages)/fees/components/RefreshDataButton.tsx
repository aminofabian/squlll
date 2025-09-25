'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCcw, AlertCircle, Check } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface RefreshDataButtonProps {
  onRefresh: () => Promise<any>
  label?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  tooltipText?: string
}

export const RefreshDataButton: React.FC<RefreshDataButtonProps> = ({
  onRefresh,
  label = 'Refresh',
  variant = 'outline',
  size = 'sm',
  className = '',
  tooltipText = 'Refresh data from API'
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const handleRefresh = async () => {
    if (status === 'loading') return
    
    setStatus('loading')
    
    try {
      await onRefresh()
      setStatus('success')
      setLastRefreshed(new Date())
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setStatus('idle')
      }, 3000)
    } catch (error) {
      console.error('Refresh error:', error)
      setStatus('error')
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setStatus('idle')
      }, 3000)
    }
  }

  // Determine which icon to show
  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return <RefreshCcw className="h-4 w-4 animate-spin" />
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <RefreshCcw className="h-4 w-4" />
    }
  }

  // Determine tooltip text
  const getTooltipText = () => {
    switch (status) {
      case 'loading':
        return 'Refreshing data...'
      case 'success':
        return `Successfully refreshed at ${lastRefreshed?.toLocaleTimeString()}`
      case 'error':
        return 'Failed to refresh data. Try again.'
      default:
        return tooltipText
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={`flex items-center gap-2 ${className}`}
            onClick={handleRefresh}
            disabled={status === 'loading'}
          >
            {renderIcon()}
            {label}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
