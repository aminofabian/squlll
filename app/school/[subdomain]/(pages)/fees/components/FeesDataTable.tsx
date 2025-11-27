import { Eye, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StudentSummaryFromAPI } from '../types'
import { formatCurrency } from '../utils'

interface FeesDataTableProps {
  students: StudentSummaryFromAPI[]
  loading: boolean
  error: string | null
  selectedStudents: string[]
  onSelectStudent: (studentId: string) => void
  onSelectAll: () => void
  onViewStudent: (student: StudentSummaryFromAPI) => void
}

export const FeesDataTable = ({
  students,
  loading,
  error,
  selectedStudents,
  onSelectStudent,
  onSelectAll,
  onViewStudent
}: FeesDataTableProps) => {
  // Dynamic status function based on comprehensive financial data
  const getStudentStatus = (student: StudentSummaryFromAPI) => {
    const { totalOwed, totalPaid, balance, numberOfFeeItems } = student.feeSummary
    
    // If balance is 0 and there are no fee items, student is pending
    if (balance === 0 && totalPaid === 0 && numberOfFeeItems === 0) {
      return {
        label: "Pending",
        className: "bg-yellow-50 text-yellow-600 border-yellow-200 font-mono"
      }
    }
    
    // If balance is 0 but there are fee items and payments, student is paid up
    if (balance === 0 && totalPaid > 0) {
      return {
        label: "Paid up",
        className: "bg-green-50 text-green-600 border-green-200 font-mono"
      }
    }
    
    // If there's a positive balance, show amount due
    if (balance > 0) {
      return {
        label: `${formatCurrency(balance)} due`,
        className: "bg-red-50 text-red-600 border-red-200 font-mono"
      }
    }
    
    // If balance is negative, student has overpaid
    if (balance < 0) {
      return {
        label: `Overpaid ${formatCurrency(Math.abs(balance))}`,
        className: "bg-blue-50 text-blue-600 border-blue-200 font-mono"
      }
    }
    
    // Fallback for any other scenario
    return {
      label: "Unknown",
      className: "bg-gray-50 text-gray-600 border-gray-200 font-mono"
    }
  }

  if (loading) {
    return (
      <div className="border-2 border-primary/20 rounded-xl overflow-hidden">
        <div className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm font-mono text-slate-600">Loading students...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border-2 border-red-200 rounded-xl overflow-hidden bg-red-50">
        <div className="p-12 text-center">
          <Coins className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-mono font-medium text-red-600 mb-2">
            Error Loading Data
          </h3>
          <p className="text-sm text-red-500 font-mono">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border-2 border-primary/20 rounded-xl overflow-hidden">
      <div className="p-4 border-b-2 border-primary/20 bg-primary/5">
        <div className="flex justify-between items-center">
          <h3 className="font-mono font-bold">Students Fee Summary</h3>
          <p className="text-sm font-mono text-slate-600">
            {students.length} students found
          </p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/20">
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedStudents.length === students.length && students.length > 0}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead className="font-mono">Student</TableHead>
              <TableHead className="font-mono">Class</TableHead>
              <TableHead className="font-mono">Total Owed</TableHead>
              <TableHead className="font-mono">Total Paid</TableHead>
              <TableHead className="font-mono">Balance</TableHead>
              <TableHead className="font-mono">Fee Items</TableHead>
              <TableHead className="font-mono">Status</TableHead>
              <TableHead className="font-mono">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const status = getStudentStatus(student)
              return (
                <TableRow key={student.id} className="border-primary/20">
                  <TableCell>
                    <Checkbox 
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => onSelectStudent(student.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono">
                    <div>
                      <div className="font-medium">{student.studentName}</div>
                      <div className="text-xs text-slate-500">{student.admissionNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {student.gradeLevelName}
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    {formatCurrency(student.feeSummary.totalOwed)}
                  </TableCell>
                  <TableCell className="font-mono text-green-600">
                    {formatCurrency(student.feeSummary.totalPaid)}
                  </TableCell>
                  <TableCell className="font-mono font-bold">
                    {formatCurrency(student.feeSummary.balance)}
                  </TableCell>
                  <TableCell className="font-mono text-center">
                    <Badge variant="outline" className="text-xs">
                      {student.feeSummary.numberOfFeeItems}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${status.className}`}
                    >
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewStudent(student)}
                      className="font-mono text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {students.length === 0 && (
        <div className="text-center py-12 border-t-2 border-dashed border-primary/20">
          <Coins className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-mono font-medium text-slate-600 dark:text-slate-400 mb-2">
            No students found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500 font-mono">
            No students with fee records are available
          </p>
        </div>
      )}
    </div>
  )
}
