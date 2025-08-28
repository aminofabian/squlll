import { 
  Plus, 
  Send, 
  Receipt, 
  CalendarClock, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Download, 
  FileText,
  PanelLeftOpen,
  PanelLeftClose
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StudentSummary } from '../types'

interface PageHeaderProps {
  selectedStudent: string | null
  allStudents: StudentSummary[]
  selectedStatus: string
  setSelectedStatus: (status: string) => void
  dueDateFilter: string
  setDueDateFilter: (filter: string) => void
  onNewInvoice: () => void
  onSendReminder: () => void
  onRecordPayment: () => void
  onCreatePaymentPlan: () => void
  onBackToAll: () => void
  isSidebarMinimized: boolean
  setIsSidebarMinimized: (minimized: boolean) => void
}

export const PageHeader = ({
  selectedStudent,
  allStudents,
  selectedStatus,
  setSelectedStatus,
  dueDateFilter,
  setDueDateFilter,
  onNewInvoice,
  onSendReminder,
  onRecordPayment,
  onCreatePaymentPlan,
  onBackToAll,
  isSidebarMinimized,
  setIsSidebarMinimized
}: PageHeaderProps) => {
  const selectedStudentData = allStudents.find(s => s.id === selectedStudent)

  return (
    <div className="border-b-2 border-primary/20 pb-6">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
            <span className="text-xs font-mono uppercase tracking-wide text-primary">
              Financial Management
            </span>
          </div>
          {selectedStudent ? (
            <>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBackToAll}
                  className="font-mono"
                >
                  ← Back to All Students
                </Button>
                <h1 className="text-3xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                  {selectedStudentData?.name}
                </h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {selectedStudentData?.admissionNumber} • {selectedStudentData?.class} {selectedStudentData?.section}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                Fee Management
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Track student fees, payments, and financial records
              </p>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 items-start">
          {/* Sidebar toggle button */}
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
          
          <Button 
            onClick={onNewInvoice}
            className="bg-primary hover:bg-primary/90 text-white font-mono"
          >
            <Plus className="h-4 w-4 mr-2" />
            {selectedStudent ? `New Invoice for ${selectedStudentData?.name}` : 'New Invoice'}
          </Button>
        
          {selectedStudent ? (
            // Student-specific actions
            <>
              <Button 
                variant="outline" 
                onClick={onSendReminder}
                className="font-mono"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Reminder
              </Button>
              <Button 
                variant="outline" 
                onClick={onRecordPayment}
                className="font-mono"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
              <Button 
                variant="outline" 
                onClick={onCreatePaymentPlan}
                className="font-mono"
              >
                <CalendarClock className="h-4 w-4 mr-2" />
                Payment Plan
              </Button>
            </>
          ) : (
            // General view quick filters
            <>
              <Button
                variant={selectedStatus === 'overdue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(selectedStatus === 'overdue' ? 'all' : 'overdue')}
                className="font-mono text-xs"
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Overdue Only
              </Button>
              <Button
                variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(selectedStatus === 'pending' ? 'all' : 'pending')}
                className="font-mono text-xs"
              >
                <Clock className="h-3 w-3 mr-1" />
                Pending Only
              </Button>
              <Button
                variant={dueDateFilter === 'next7days' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDueDateFilter(dueDateFilter === 'next7days' ? 'all' : 'next7days')}
                className="font-mono text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Due Soon
              </Button>
            </>
          )}

          {/* Export Options */}
          <Button variant="outline" size="sm" className="font-mono text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" className="font-mono text-xs">
            <FileText className="h-3 w-3 mr-1" />
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
