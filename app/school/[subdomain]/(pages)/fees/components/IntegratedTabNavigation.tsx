'use client'

import { FileText, Coins, Plus, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IntegratedTabNavigationProps {
  activeTab: 'structures' | 'invoices'
  onTabChange: (tab: 'structures' | 'invoices') => void
  onCreateStructure?: () => void
  onGenerateInvoices?: () => void
  onRecordPayment?: () => void
  selectedStudent?: string | null
}

export const IntegratedTabNavigation = ({
  activeTab,
  onTabChange,
  onCreateStructure,
  onGenerateInvoices,
  onRecordPayment,
  selectedStudent
}: IntegratedTabNavigationProps) => {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="px-6 py-4">
        {/* Visual Tab Navigation with Integrated Actions */}
        <div className="flex items-center gap-4">
          {/* Structures Tab */}
          <button
            onClick={() => onTabChange('structures')}
            className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-200 flex-1",
              activeTab === 'structures'
                ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            )}
          >
            <div className={cn(
              "p-3 rounded-lg",
              activeTab === 'structures' ? "bg-white/20" : "bg-white"
            )}>
              <FileText className={cn(
                "h-6 w-6",
                activeTab === 'structures' ? "text-white" : "text-blue-600"
              )} />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-lg">Structures</div>
              <div className={cn(
                "text-sm",
                activeTab === 'structures' ? "text-blue-100" : "text-slate-500"
              )}>
                Manage fee structures
              </div>
            </div>
            {activeTab === 'structures' && onCreateStructure && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onCreateStructure()
                }}
                className="ml-auto px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Create
              </button>
            )}
          </button>

          {/* Invoices Tab */}
          <button
            onClick={() => onTabChange('invoices')}
            className={cn(
              "flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-200 flex-1",
              activeTab === 'invoices'
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            )}
          >
            <div className={cn(
              "p-3 rounded-lg",
              activeTab === 'invoices' ? "bg-white/20" : "bg-white"
            )}>
              <Coins className={cn(
                "h-6 w-6",
                activeTab === 'invoices' ? "text-white" : "text-emerald-600"
              )} />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-lg">Invoices</div>
              <div className={cn(
                "text-sm",
                activeTab === 'invoices' ? "text-emerald-100" : "text-slate-500"
              )}>
                View payments & invoices
              </div>
            </div>
            {activeTab === 'invoices' && (
              <div className="ml-auto flex items-center gap-2">
                {!selectedStudent && onRecordPayment && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRecordPayment()
                    }}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Receipt className="h-4 w-4" />
                    Record
                  </button>
                )}
                {onGenerateInvoices && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onGenerateInvoices()
                    }}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    New
                  </button>
                )}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

