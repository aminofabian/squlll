import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StudentSummaryDetail, FeeInvoice } from '../types'
import { Coins } from 'lucide-react'

interface FeeSummaryCardProps {
  studentData: StudentSummaryDetail | null
  invoiceData?: FeeInvoice[] | null
  loading: boolean
  error: string | null
}

export const FeeSummaryCard: React.FC<FeeSummaryCardProps> = ({
  studentData,
  invoiceData,
  loading,
  error
}) => {
  // Calculate fee summary from actual invoice data
  const calculateFeeSummaryFromInvoices = (invoices: FeeInvoice[]) => {
    console.log('🔢 Calculating fee summary from invoices:', invoices)
    
    const totalOwed = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
    const totalPaid = invoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0)
    const balance = invoices.reduce((sum, invoice) => sum + invoice.amountDue, 0)
    const numberOfFeeItems = invoices.reduce((sum, invoice) => sum + (invoice.paymentHistory?.length || 0), 0)
    
    console.log('📊 Calculated values:', {
      totalOwed,
      totalPaid,
      balance,
      numberOfFeeItems,
      invoiceBreakdown: invoices.map(inv => ({
        id: inv.id,
        totalAmount: inv.totalAmount,
        amountPaid: inv.amountPaid,
        amountDue: inv.amountDue,
        paymentCount: inv.paymentHistory?.length || 0
      }))
    })
    
    return {
      totalOwed,
      totalPaid,
      balance,
      numberOfFeeItems
    }
  }

  // Use invoice data if available, otherwise fall back to student data
  const feeSummary = invoiceData && invoiceData.length > 0 
    ? calculateFeeSummaryFromInvoices(invoiceData)
    : studentData?.feeSummary

  // Force debug which data source is being used
  console.log('🎯 Data source decision:', {
    hasInvoiceData: !!invoiceData,
    invoiceDataLength: invoiceData?.length || 0,
    hasStudentData: !!studentData?.feeSummary,
    finalDataSource: invoiceData && invoiceData.length > 0 ? 'INVOICE_DATA' : 'STUDENT_DATA',
    finalSummary: feeSummary
  })

  // Get fee items from invoice data or student data
  const feeItems = invoiceData && invoiceData.length > 0
    ? invoiceData.flatMap(invoice => 
        invoice.paymentHistory?.map(payment => ({
          id: payment.id,
          feeBucketName: invoice.feeType,
          amount: payment.amount,
          isMandatory: true,
          feeStructureName: invoice.term,
          academicYearName: invoice.academicYear
        })) || []
      )
    : studentData?.feeSummary?.feeItems || []

  console.log('💰 FeeSummaryCard Debug:', {
    hasInvoiceData: !!invoiceData,
    invoiceCount: invoiceData?.length || 0,
    invoiceData: invoiceData,
    calculatedSummary: feeSummary,
    studentDataSummary: studentData?.feeSummary,
    usingInvoiceData: !!(invoiceData && invoiceData.length > 0),
    usingStudentData: !!(!invoiceData || invoiceData.length === 0)
  })
  
  // Force debug the first invoice if available
  if (invoiceData && invoiceData.length > 0) {
    console.log('🔍 First invoice details:', {
      id: invoiceData[0].id,
      totalAmount: invoiceData[0].totalAmount,
      amountPaid: invoiceData[0].amountPaid,
      amountDue: invoiceData[0].amountDue,
      paymentHistory: invoiceData[0].paymentHistory,
      paymentHistoryLength: invoiceData[0].paymentHistory?.length || 0
    })
  }
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
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
            <Coins className="h-5 w-5" />
            Fee Summary Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!feeSummary) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Fee Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No fee data available</p>
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
          <Coins className="h-5 w-5" />
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
                KSh {feeSummary.totalOwed.toLocaleString()}
              </p>
            </div>

            <div className="text-center p-4 bg-white/50 rounded-lg border border-primary/10">
              <p className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-2">Total Paid</p>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                KSh {feeSummary.totalPaid.toLocaleString()}
              </p>
            </div>

            <div className="text-center p-4 bg-white/50 rounded-lg border border-primary/10">
              <p className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-2">Balance</p>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                KSh {feeSummary.balance.toLocaleString()}
              </p>
            </div>

            <div className="text-center p-4 bg-white/50 rounded-lg border border-primary/10">
              <p className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-2">Fee Items</p>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {feeSummary.numberOfFeeItems}
              </p>
            </div>
          </div>
        </div>

        {/* Fee Items Table */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
            <h3 className="text-xs font-mono uppercase tracking-wide text-primary">Fee Structure Details</h3>
          </div>
          
          {feeItems.length > 0 ? (
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
                  {feeItems.map((item) => (
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
