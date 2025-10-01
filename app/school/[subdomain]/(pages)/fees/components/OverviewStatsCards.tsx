import { TrendingUp, TrendingDown, FileText, AlertTriangle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FeeInvoice, SummaryStats, StudentSummary } from '../types'
import { formatCurrency } from '../utils'
import { useState, useEffect } from 'react'
import { graphqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'

type TenantSummary = {
  tenantId: string
  totalFeeStructures: number
  totalGradeLevels: number
  totalMandatoryAmount: number
  totalOptionalAmount: number
  grandTotalAmount: number
  totalFeeItems: number
  uniqueAcademicYears: string[]
  uniqueTerms: string[]
  uniqueFeeBuckets: string[]
}

type ComprehensiveFeeStructureSummaryResponse = {
  comprehensiveFeeStructureSummary: {
    tenantSummary: TenantSummary
  }
}

const COMPREHENSIVE_SUMMARY_QUERY = gql`
  query GetComprehensiveFeeStructureSummary {
    comprehensiveFeeStructureSummary {
      tenantSummary {
        tenantId
        totalFeeStructures
        totalGradeLevels
        totalMandatoryAmount
        totalOptionalAmount
        grandTotalAmount
        totalFeeItems
        uniqueAcademicYears
        uniqueTerms
        uniqueFeeBuckets
      }
    }
  }
`

interface OverviewStatsCardsProps {
  selectedStudent: string | null
  selectedStudentInvoices: FeeInvoice[]
  summaryStats: SummaryStats
  allStudents: StudentSummary[]
}

export const OverviewStatsCards = ({
  selectedStudent,
  selectedStudentInvoices,
  summaryStats,
  allStudents
}: OverviewStatsCardsProps) => {
  const [tenantSummary, setTenantSummary] = useState<{
    totalFeeStructures: number
    totalGradeLevels: number
    totalMandatoryAmount: number
    totalOptionalAmount: number
    grandTotalAmount: number
    totalFeeItems: number
    uniqueAcademicYears: string[]
    uniqueTerms: string[]
    uniqueFeeBuckets: string[]
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchSummary = async () => {
      try {
        const data = await graphqlClient.request<ComprehensiveFeeStructureSummaryResponse>(COMPREHENSIVE_SUMMARY_QUERY)
        const summary = data?.comprehensiveFeeStructureSummary?.tenantSummary
        if (!cancelled && summary) {
          setTenantSummary(summary)
        }
      } catch (_) {
        // ignore in UI; keep existing cards functional
      }
    }
    fetchSummary()
    return () => { cancelled = true }
  }, [])

  if (selectedStudent) {
    // Student-specific overview
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-green-600">
              {formatCurrency(selectedStudentInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0))}
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">
              Payments made
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 bg-red-50 dark:bg-red-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-red-600">
              {formatCurrency(selectedStudentInvoices.reduce((sum, inv) => sum + inv.amountDue, 0))}
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">
              Amount pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 bg-blue-50 dark:bg-blue-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Total Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-blue-600">
              {selectedStudentInvoices.length}
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">
              Fee records
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 bg-orange-50 dark:bg-orange-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono font-bold text-orange-600">
              {selectedStudentInvoices.filter(inv => inv.paymentStatus === 'overdue').length}
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // General overview
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Total Collected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-mono font-bold text-green-600">
            {formatCurrency(summaryStats.totalCollected)}
          </div>
          <p className="text-xs font-mono text-slate-500 mt-1">
            {summaryStats.collectionRate.toFixed(1)}% collection rate
          </p>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-red-50 dark:bg-red-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-600" />
            Outstanding Fees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-mono font-bold text-red-600">
            {formatCurrency(summaryStats.totalOutstanding)}
          </div>
          <p className="text-xs font-mono text-slate-500 mt-1">
            {summaryStats.studentsWithPendingFees} students pending
          </p>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-yellow-50 dark:bg-yellow-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            Due Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-mono font-bold text-yellow-600">
            {summaryStats.upcomingDueCount}
          </div>
          <p className="text-xs font-mono text-slate-500 mt-1">
            Due in next 7 days
          </p>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-orange-50 dark:bg-orange-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            Overdue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-mono font-bold text-orange-600">
            {summaryStats.overdueCount}
          </div>
          <p className="text-xs font-mono text-slate-500 mt-1">
            Requires attention
          </p>
        </CardContent>
      </Card>

      {tenantSummary && (
        <>
          <Card className="border-2 border-primary/20 bg-blue-50 dark:bg-blue-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Fee Structures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold text-blue-600">
                {tenantSummary.totalFeeStructures}
              </div>
              <p className="text-xs font-mono text-slate-500 mt-1">created</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 bg-indigo-50 dark:bg-indigo-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Grade Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold text-indigo-600">
                {tenantSummary.totalGradeLevels}
              </div>
              <p className="text-xs font-mono text-slate-500 mt-1">covered</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 bg-teal-50 dark:bg-teal-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                Total Fee Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold text-teal-600">
                {tenantSummary.totalFeeItems}
              </div>
              <p className="text-xs font-mono text-slate-500 mt-1">items across structures</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 bg-emerald-50 dark:bg-emerald-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Grand Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold text-emerald-600">
                {formatCurrency(tenantSummary.grandTotalAmount)}
              </div>
              <p className="text-xs font-mono text-slate-500 mt-1">
                Mandatory: {formatCurrency(tenantSummary.totalMandatoryAmount)} · Optional: {formatCurrency(tenantSummary.totalOptionalAmount)}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
