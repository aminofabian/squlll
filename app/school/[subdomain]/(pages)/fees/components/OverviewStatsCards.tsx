import { TrendingUp, TrendingDown, FileText, AlertTriangle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FeeInvoice, SummaryStats, StudentSummary } from '../types'
import { formatCurrency } from '../utils'

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
    </div>
  )
}
