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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-600">Total Owed</p>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(studentData.feeSummary.totalOwed)}
            </p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-600">Total Paid</p>
            <p className="text-2xl font-bold text-green-900">
              {formatCurrency(studentData.feeSummary.totalPaid)}
            </p>
          </div>

          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm font-medium text-red-600">Balance</p>
            <p className="text-2xl font-bold text-red-900">
              {formatCurrency(studentData.feeSummary.balance)}
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Number of Fee Items</span>
            <Badge variant="outline">{studentData.feeSummary.numberOfFeeItems}</Badge>
          </div>

          {studentData.feeSummary.feeItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Fee Items:</p>
              <div className="space-y-2">
                {studentData.feeSummary.feeItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{item.feeBucketName}</p>
                        {item.isMandatory && (
                          <Badge variant="destructive" className="text-xs">
                            Mandatory
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {item.feeStructureName} • {item.academicYearName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
