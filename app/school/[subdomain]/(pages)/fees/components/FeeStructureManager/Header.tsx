'use client'

import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { RefreshDataButton } from '../RefreshDataButton'

interface HeaderProps {
  onCreateNew: () => void
  onRefreshAll: () => Promise<any>
  onDebugData?: () => void
}

export const Header = ({ onCreateNew, onRefreshAll, onDebugData }: HeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Fee Structure Management</h1>
        <RefreshDataButton 
          onRefresh={onRefreshAll}
          label="Refresh Data"
          tooltipText="Refresh all data from API"
          size="sm"
        />
        {process.env.NODE_ENV !== 'production' && onDebugData && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onDebugData}
            className="ml-2"
          >
            Debug Data
          </Button>
        )}
      </div>
      <Button onClick={onCreateNew} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Create New Structure
      </Button>
    </div>
  )
}
