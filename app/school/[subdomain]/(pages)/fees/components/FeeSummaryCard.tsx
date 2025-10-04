import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StudentSummaryDetail } from '../types'
import { DollarSign } from 'lucide-react'

interface FeeSummaryCardProps {
  studentData: StudentSummaryDetail | null
  loading: boolean
  error: string | null
}

export const FeeSummaryCard: React.FC<FeeSummaryCardProps> = ({
  studentData,
  loading,
  error
}) => {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fee Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <DollarSign className="h-5 w-5" />
            Fee Summary Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!studentData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fee Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No student selected</p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Fee Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fee Summary Stats */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
            <h3 className="text-xs font-mono uppercase tracking-wide text-primary">Fee Summary Overview</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/50 rounded-lg border border-primary/10">
              <p className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-2">Total Owed</p>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                KSh {studentData.feeSummary.totalOwed.toLocaleString()}
              </p>
            </div>

            <div className="text-center p-4 bg-white/50 rounded-lg border border-primary/10">
              <p className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-2">Total Paid</p>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                KSh {studentData.feeSummary.totalPaid.toLocaleString()}
              </p>
            </div>

            <div className="text-center p-4 bg-white/50 rounded-lg border border-primary/10">
              <p className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-2">Balance</p>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                KSh {studentData.feeSummary.balance.toLocaleString()}
              </p>
            </div>

            <div className="text-center p-4 bg-white/50 rounded-lg border border-primary/10">
              <p className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-2">Fee Items</p>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {studentData.feeSummary.numberOfFeeItems}
              </p>
            </div>
          </div>
        </div>

        {/* Fee Items Table */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
            <h3 className="text-xs font-mono uppercase tracking-wide text-primary">Fee Structure Details</h3>
          </div>
          
          {studentData.feeSummary.feeItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">Fee Item</th>
                    <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">Amount</th>
                    <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">Type</th>
                    <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">Structure</th>
                    <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">Academic Year</th>
                  </tr>
                </thead>
                <tbody>
                  {studentData.feeSummary.feeItems.map((item) => (
                    <tr key={item.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm text-slate-900 dark:text-slate-100">
                        {item.feeBucketName}
                      </td>
                      <td className="py-3 px-4 font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                        KSh {item.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={item.isMandatory ? "default" : "outline"} className="font-mono text-xs">
                          {item.isMandatory ? 'Mandatory' : 'Optional'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-sm text-slate-700 dark:text-slate-300">
                        {item.feeStructureName}
                      </td>
                      <td className="py-3 px-4 font-mono text-sm text-slate-700 dark:text-slate-300">
                        {item.academicYearName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-8 text-slate-600 dark:text-slate-400 font-mono">
              No fee items found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
