'use client'

import { RefreshDataButton } from '../RefreshDataButton'

interface HeaderProps {
  onRefreshAll: () => Promise<any>
  onDebugData?: () => void
}

export const Header = ({ onRefreshAll, onDebugData }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-gray-900">Fee Structures</h2>
        <RefreshDataButton 
          onRefresh={onRefreshAll}
          label="Refresh Data"
          tooltipText="Refresh all data from API"
          size="sm"
        />
        {process.env.NODE_ENV !== 'production' && onDebugData && (
          <button
            onClick={onDebugData}
            className="text-xs px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            Debug Data
          </button>
        )}
      </div>
      <p className="text-sm text-gray-600">
        Manage and configure fee structures for your school
      </p>
    </div>
  )
}
