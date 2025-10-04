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
    <div className="border-b-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 pb-8">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            {/* Page Badge */}
            <div className="inline-block w-fit px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg shadow-sm">
              <span className="text-sm font-mono uppercase tracking-wider text-primary font-semibold">
                Financial Management
              </span>
            </div>
            
            {/* Title Section */}
            {selectedStudent ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBackToAll}
                    className="font-mono border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                  >
                    ← Back to All Students
                  </Button>
                  <h1 className="text-4xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                    {selectedStudentData?.name}
                  </h1>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="px-3 py-1 bg-white/60 border border-primary/10 rounded-md">
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      Admission: {selectedStudentData?.admissionNumber}
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-white/60 border border-primary/10 rounded-md">
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      Class: {selectedStudentData?.class} {selectedStudentData?.section}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h1 className="text-4xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                  Fee Management
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-400 font-medium max-w-2xl">
                  Track student fees, payments, and financial records with comprehensive reporting and analytics
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Toggle */}
          <div className="flex justify-end lg:justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
              className="border-primary/20 bg-white/80 text-slate-600 hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all duration-200 shadow-sm"
              title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
            >
              {isSidebarMinimized ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="space-y-4">
          {/* Primary Actions */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={onNewInvoice}
              className="bg-primary hover:bg-primary/90 text-white font-mono shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              {selectedStudent ? `New Invoice for ${selectedStudentData?.name}` : 'New Invoice'}
            </Button>
          
            {selectedStudent && (
              <>
                <Button 
                  variant="outline" 
                  onClick={onRecordPayment}
                  className="font-mono border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 px-6 py-2"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onSendReminder}
                  className="font-mono border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 px-6 py-2"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onCreatePaymentPlan}
                  className="font-mono border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 px-6 py-2"
                >
                  <CalendarClock className="h-4 w-4 mr-2" />
                  Payment Plan
                </Button>
              </>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-wrap gap-3">
            {!selectedStudent && (
              <>
                <Button
                  variant={selectedStatus === 'overdue' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus(selectedStatus === 'overdue' ? 'all' : 'overdue')}
                  className="font-mono text-xs border-primary/20 hover:border-primary/40 transition-all duration-200"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overdue Only
                </Button>
                <Button
                  variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus(selectedStatus === 'pending' ? 'all' : 'pending')}
                  className="font-mono text-xs border-primary/20 hover:border-primary/40 transition-all duration-200"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Only
                </Button>
                <Button
                  variant={dueDateFilter === 'next7days' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDueDateFilter(dueDateFilter === 'next7days' ? 'all' : 'next7days')}
                  className="font-mono text-xs border-primary/20 hover:border-primary/40 transition-all duration-200"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Due Soon
                </Button>
              </>
            )}

            {/* Export Options */}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" className="font-mono text-xs border-primary/20 hover:border-primary/40 transition-all duration-200">
                <Download className="h-3 w-3 mr-1" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" className="font-mono text-xs border-primary/20 hover:border-primary/40 transition-all duration-200">
                <FileText className="h-3 w-3 mr-1" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
