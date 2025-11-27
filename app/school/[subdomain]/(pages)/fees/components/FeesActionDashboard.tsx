'use client'

import { 
  FileText, 
  Plus, 
  Receipt, 
  Users, 
  Coins, 
  Eye,
  Settings,
  Zap,
  Building2,
  CreditCard,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickActionCardProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

const QuickActionCard = ({ icon, label, onClick }: QuickActionCardProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-slate-200 transition-all duration-200 shadow-sm hover:shadow-md group"
    >
      <div className="mb-3 text-slate-600 group-hover:text-primary transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-700 group-hover:text-primary">
        {label}
      </span>
    </button>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  gradient: string
}

const StatCard = ({ title, value, icon, gradient }: StatCardProps) => {
  return (
    <div className={cn("rounded-xl p-6 text-white shadow-sm hover:shadow-md transition-shadow", gradient)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-90">{title}</span>
        <div className="opacity-80">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  )
}

interface FeesActionDashboardProps {
  onViewStructures: () => void
  onCreateStructure: () => void
  onGenerateInvoices: () => void
  onViewInvoices: () => void
  onAssignToGrade: () => void
  onRecordPayment: () => void
  onViewPayments?: () => void
  onSettings?: () => void
  onExport?: () => void
  stats?: {
    feeStructures?: number
    students?: number
    invoices?: number
    totalRevenue?: string | number
  }
  showFeeStructures?: boolean
  feeStructuresContent?: React.ReactNode
  showInvoices?: boolean
  invoicesContent?: React.ReactNode
  onBackToOverview?: () => void
}

export const FeesActionDashboard = ({
  onViewStructures,
  onCreateStructure,
  onGenerateInvoices,
  onViewInvoices,
  onAssignToGrade,
  onRecordPayment,
  onViewPayments,
  onSettings,
  onExport,
  stats = {},
  showFeeStructures = false,
  feeStructuresContent,
  showInvoices = false,
  invoicesContent,
  onBackToOverview
}: FeesActionDashboardProps) => {
  const {
    feeStructures = 0,
    students = 0,
    invoices = 0,
    totalRevenue = '0'
  } = stats

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Sidebar - Quick Actions */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
              <p className="text-xs text-slate-500">Instant access to key features</p>
            </div>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <QuickActionCard
              icon={<FileText className="h-6 w-6" />}
              label="Fee Structures"
              onClick={onViewStructures}
            />
            <QuickActionCard
              icon={<Plus className="h-6 w-6" />}
              label="Create Structure"
              onClick={onCreateStructure}
            />
            <QuickActionCard
              icon={<Coins className="h-6 w-6" />}
              label="Generate Invoices"
              onClick={onGenerateInvoices}
            />
            <QuickActionCard
              icon={<Eye className="h-6 w-6" />}
              label="View Invoices"
              onClick={onViewInvoices}
            />
            <QuickActionCard
              icon={<Users className="h-6 w-6" />}
              label="Assign Grade"
              onClick={onAssignToGrade}
            />
            <QuickActionCard
              icon={<Receipt className="h-6 w-6" />}
              label="Record Payment"
              onClick={onRecordPayment}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-4 border-t border-slate-200">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>6 quick actions available</span>
          </div>
        </div>
      </div>

      {/* Right Side - Overview & Info */}
      <div className="lg:col-span-2 space-y-6">
        {showFeeStructures ? (
          /* Fee Structures List */
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Fee Structures</h3>
              {onBackToOverview && (
                <button
                  onClick={onBackToOverview}
                  className="text-sm text-primary hover:text-primary-dark font-medium"
                >
                  ← Back to Overview
                </button>
              )}
            </div>
            {feeStructuresContent}
          </div>
        ) : showInvoices ? (
          /* Invoices List */
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Invoices</h3>
              {onBackToOverview && (
                <button
                  onClick={onBackToOverview}
                  className="text-sm text-primary hover:text-primary-dark font-medium"
                >
                  ← Back to Overview
                </button>
              )}
            </div>
            {invoicesContent}
          </div>
        ) : (
          <>
            {/* Overview Statistics */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Fee Structures"
                  value={feeStructures}
                  icon={<FileText className="h-6 w-6" />}
                  gradient="bg-gradient-to-br from-primary to-primary-dark"
                />
                <StatCard
                  title="Students"
                  value={students}
                  icon={<Users className="h-6 w-6" />}
                  gradient="bg-gradient-to-br from-primary-light to-primary"
                />
                <StatCard
                  title="Invoices"
                  value={invoices}
                  icon={<Coins className="h-6 w-6" />}
                  gradient="bg-gradient-to-br from-primary to-primary-dark"
                />
                <StatCard
                  title="Total Revenue"
                  value={typeof totalRevenue === 'number' ? `KES ${totalRevenue.toLocaleString()}` : totalRevenue}
                  icon={<CreditCard className="h-6 w-6" />}
                  gradient="bg-gradient-to-br from-primary-light to-primary"
                />
              </div>
            </div>

            {/* System Health & Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* System Health */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Fee Structures API</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm text-primary font-medium">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Payment Processing</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm text-primary font-medium">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Invoice Generation</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm text-primary font-medium">Ready</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
                <div className="text-sm text-slate-500">
                  No recent system alerts
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
