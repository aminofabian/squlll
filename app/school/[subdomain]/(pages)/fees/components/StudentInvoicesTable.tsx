import { Eye, Printer, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FeeInvoice } from '../types'
import { getStatusColor, getFeeTypeIcon, formatCurrency } from '../utils'

interface StudentInvoicesTableProps {
  invoices: FeeInvoice[]
  studentName: string
  onViewInvoice: (invoice: FeeInvoice) => void
}

export const StudentInvoicesTable = ({
  invoices,
  studentName,
  onViewInvoice
}: StudentInvoicesTableProps) => {
  return (
    <div className="border-2 border-primary/20 rounded-xl overflow-hidden">
      <div className="p-4 border-b-2 border-primary/20 bg-primary/5">
        <div className="flex justify-between items-center">
          <h3 className="font-mono font-bold">
            Fee Invoices for {studentName}
          </h3>
          <p className="text-sm font-mono text-slate-600">
            {invoices.length} invoices
          </p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/20">
              <TableHead className="font-mono">Invoice ID</TableHead>
              <TableHead className="font-mono">Fee Type</TableHead>
              <TableHead className="font-mono">Total Amount</TableHead>
              <TableHead className="font-mono">Amount Paid</TableHead>
              <TableHead className="font-mono">Amount Due</TableHead>
              <TableHead className="font-mono">Due Date</TableHead>
              <TableHead className="font-mono">Status</TableHead>
              <TableHead className="font-mono">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const IconComponent = getFeeTypeIcon(invoice.feeType)
              return (
                <TableRow key={invoice.id} className="border-primary/20">
                  <TableCell className="font-mono text-xs">
                    {invoice.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="font-mono">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      {invoice.feeType.charAt(0).toUpperCase() + invoice.feeType.slice(1)}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    {formatCurrency(invoice.totalAmount)}
                  </TableCell>
                  <TableCell className="font-mono text-green-600">
                    {formatCurrency(invoice.amountPaid)}
                  </TableCell>
                  <TableCell className="font-mono font-bold">
                    {formatCurrency(invoice.amountDue)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-mono ${getStatusColor(invoice.paymentStatus)}`}
                    >
                      {invoice.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewInvoice(invoice)}
                        className="font-mono text-xs"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-mono text-xs"
                      >
                        <Printer className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {invoices.length === 0 && (
        <div className="text-center py-12 border-t-2 border-dashed border-primary/20">
          <Coins className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-mono font-medium text-slate-600 dark:text-slate-400 mb-2">
            No invoices found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 font-mono">
            This student has no fee invoices yet
          </p>
        </div>
      )}
    </div>
  )
}

