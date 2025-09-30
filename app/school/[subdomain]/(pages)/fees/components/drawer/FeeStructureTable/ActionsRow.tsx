import React from 'react'
import { Sparkles } from "lucide-react"
import { TermSelect } from './TermSelect'
import { QuickActions } from './QuickActions'

interface ActionsRowProps {
  formData: any
  addComponent: (termIndex: number, bucketIndex: number) => void
  addBucket: (termIndex: number) => void
  updateComponent: (termIndex: number, bucketIndex: number, componentIndex: number, field: keyof any, value: any) => void
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export const ActionsRow: React.FC<ActionsRowProps> = ({
  formData,
  addComponent,
  addBucket,
  updateComponent,
  showToast
}) => {
  return (
    <tr className="bg-primary/5 hover:bg-primary/10 transition-all duration-300">
      <td className="border border-primary/30 p-3 text-center">
        <TermSelect 
          formData={formData} 
          addComponent={addComponent} 
          addBucket={addBucket} 
        />
      </td>
      <td className="border border-primary/30 p-3">
        <QuickActions 
          formData={formData}
          addComponent={addComponent}
          addBucket={addBucket}
          updateComponent={updateComponent}
          showToast={showToast}
        />
      </td>
      <td className="border border-primary/30 p-3 text-center">
        <div className="text-xs text-slate-500 font-mono">
          💡 Quick Actions
        </div>
      </td>
      <td className="border border-primary/30 p-3 text-center">
        <div className="flex justify-center">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        </div>
      </td>
    </tr>
  )
}
