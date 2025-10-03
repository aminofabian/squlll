import { Search, Filter, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { StudentSummary } from '../types'
import { formatCurrency } from '../utils'

// Dynamic status function based on financial data
const getStudentStatus = (student: StudentSummary) => {
  const { totalOutstanding, totalPaid, invoiceCount } = student
  
  // If balance is 0 and there are no invoices, student is pending
  if (totalOutstanding === 0 && totalPaid === 0 && invoiceCount === 0) {
    return {
      label: "Pending",
      variant: "outline" as const,
      className: "bg-yellow-50 text-yellow-600 border-yellow-200 font-mono"
    }
  }
  
  // If balance is 0 but there are invoices and payments, student is paid up
  if (totalOutstanding === 0 && totalPaid > 0) {
    return {
      label: "Paid up",
      variant: "outline" as const,
      className: "bg-green-50 text-green-600 border-green-200 font-mono"
    }
  }
  
  // If there's a positive balance, show amount due
  if (totalOutstanding > 0) {
    return {
      label: `${formatCurrency(totalOutstanding)} due`,
      variant: "outline" as const,
      className: "bg-red-50 text-red-600 border-red-200 font-mono"
    }
  }
  
  // Fallback for any other scenario
  return {
    label: "Unknown",
    variant: "outline" as const,
    className: "bg-gray-50 text-gray-600 border-gray-200 font-mono"
  }
}

interface StudentSearchSidebarProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredStudents: StudentSummary[]
  selectedStudent: string | null
  onStudentSelect: (studentId: string) => void
  onBackToAll: () => void
  isSidebarMinimized: boolean
  setIsSidebarMinimized: (minimized: boolean) => void
}

export const StudentSearchSidebar = ({
  searchTerm,
  setSearchTerm,
  filteredStudents,
  selectedStudent,
  onStudentSelect,
  onBackToAll,
  isSidebarMinimized,
  setIsSidebarMinimized
}: StudentSearchSidebarProps) => {
  return (
    <div className={`border-r-2 border-primary/20 bg-primary/5 sticky top-0 h-screen overflow-y-auto transition-all duration-300 ease-in-out ${
      isSidebarMinimized ? 'w-16 p-2' : 'w-80 p-6'
    }`}>
      {/* Toggle button for minimize/expand */}
      <div className={`mb-4 ${isSidebarMinimized ? 'flex justify-center' : 'flex justify-between items-center'}`}>
        {!isSidebarMinimized && (
          <div className="space-y-2">
            <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/30 rounded-md">
              <span className="text-xs font-mono uppercase tracking-wide text-primary font-bold">
                <Search className="inline h-3 w-3 mr-1" />
                Student Search
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">
              Search students by name
            </p>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
          className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-200"
          title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
        >
          {isSidebarMinimized ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isSidebarMinimized ? (
        // Minimized view - only filters icon when active
        <div className="space-y-4">
          {/* Filters icon - only show when search is active */}
          {searchTerm && (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-1">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs text-primary font-mono">Filters</span>
            </div>
          )}
        </div>
      ) : (
        // Full view
        <div className="space-y-6">
          {/* Search Input */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300">
              Search Students
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or admission no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-primary/30 bg-white dark:bg-slate-900 font-mono"
              />
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="w-full font-mono text-xs"
              >
                Clear Search
              </Button>
            )}
          </div>

          {/* Students List */}
          <div className="border-t border-primary/20 pt-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300">
                All Students ({filteredStudents.length})
              </Label>
              {selectedStudent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBackToAll}
                  className="font-mono text-xs"
                >
                  View All
                </Button>
              )}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedStudent === student.id
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-white dark:bg-slate-800 border-primary/20 hover:bg-primary/5'
                  }`}
                  onClick={() => onStudentSelect(student.id)}
                >
                  <div className="font-mono text-sm font-medium">{student.name}</div>
                  <div className="font-mono text-xs text-slate-500 mb-1">
                    {student.admissionNumber} • {student.class} {student.section}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {(() => {
                      const status = getStudentStatus(student)
                      return (
                        <Badge variant={status.variant} className={status.className}>
                          {status.label}
                        </Badge>
                      )
                    })()}
                    {student.overdueCount > 0 && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 font-mono">
                        {student.overdueCount} overdue
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
