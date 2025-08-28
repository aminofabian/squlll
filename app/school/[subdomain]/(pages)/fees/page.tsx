'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Download } from 'lucide-react'

// Import modular components and hooks
import { StudentSearchSidebar } from './components/StudentSearchSidebar'
import { PageHeader } from './components/PageHeader'
import { OverviewStatsCards } from './components/OverviewStatsCards'
import { FiltersSection } from './components/FiltersSection'
import { FeesDataTable } from './components/FeesDataTable'
import { useFeesData } from './hooks/useFeesData'
import { useFormHandlers } from './hooks/useFormHandlers'
import { FeeInvoice } from './types'

// Helper function for status colors
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    case 'partial':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function FeesPage() {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false)
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)

  const {
    selectedStudent,
    setSelectedStudent,
    searchTerm,
    setSearchTerm,
    selectedFeeType,
    setSelectedFeeType,
    selectedStatus,
    setSelectedStatus,
    selectedClass,
    setSelectedClass,
    dueDateFilter,
    setDueDateFilter,
    filteredInvoices,
    summaryStats,
    filteredStudents
  } = useFeesData()

  const {
    handleNewInvoice,
    handleSendReminder,
    handleRecordPayment,
    handleCreatePaymentPlan
  } = useFormHandlers(selectedStudent, filteredInvoices)

  // Get selected student invoices for overview
  const selectedStudentInvoices = selectedStudent 
    ? filteredInvoices.filter(inv => inv.studentId === selectedStudent)
    : []

  // Event handlers
  const handleViewInvoice = (invoice: FeeInvoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceModal(true)
  }

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId)
    setSelectedInvoices([])
  }

  const handleBackToAll = () => {
    setSelectedStudent(null)
    setSelectedInvoices([])
  }

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const handleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(filteredInvoices.map(inv => inv.id))
    }
  }

  // Wrapper functions for PageHeader
  const handleSendReminderWrapper = () => {
    handleSendReminder(selectedInvoices)
  }

  return (
    <div className="flex min-h-screen">
      {/* Student Search Sidebar */}
      <StudentSearchSidebar
        isSidebarMinimized={isSidebarMinimized}
        setIsSidebarMinimized={setIsSidebarMinimized}
        selectedStudent={selectedStudent}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredStudents={filteredStudents}
        onStudentSelect={handleStudentSelect}
        onBackToAll={handleBackToAll}
      />

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-8">
        {/* Page Header */}
        <PageHeader
          selectedStudent={selectedStudent}
          allStudents={filteredStudents}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          dueDateFilter={dueDateFilter}
          setDueDateFilter={setDueDateFilter}
          isSidebarMinimized={isSidebarMinimized}
          setIsSidebarMinimized={setIsSidebarMinimized}
          onNewInvoice={handleNewInvoice}
          onSendReminder={handleSendReminderWrapper}
          onRecordPayment={handleRecordPayment}
          onCreatePaymentPlan={handleCreatePaymentPlan}
          onBackToAll={handleBackToAll}
        />

        {/* Overview Stats Cards */}
        <OverviewStatsCards
          selectedStudent={selectedStudent}
          selectedStudentInvoices={selectedStudentInvoices}
          summaryStats={summaryStats}
          allStudents={filteredStudents}
        />

        {/* Filters Section */}
        <FiltersSection
          selectedFeeType={selectedFeeType}
          setSelectedFeeType={setSelectedFeeType}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          dueDateFilter={dueDateFilter}
          setDueDateFilter={setDueDateFilter}
        />

        {/* Fees Data Table */}
        <FeesDataTable
          selectedStudent={selectedStudent}
          selectedStudentInvoices={selectedStudentInvoices}
          filteredInvoices={filteredInvoices}
          allStudents={filteredStudents}
          selectedInvoices={selectedInvoices}
          onViewInvoice={handleViewInvoice}
          onSelectInvoice={handleSelectInvoice}
          onSelectAll={handleSelectAll}
        />

        {/* Invoice Detail Modal */}
        {showInvoiceModal && selectedInvoice && (
          <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-mono">Invoice Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-mono text-xs">Invoice ID</Label>
                    <p className="font-mono">{selectedInvoice.id}</p>
                  </div>
                  <div>
                    <Label className="font-mono text-xs">Student</Label>
                    <p className="font-mono">{selectedInvoice.studentName}</p>
                  </div>
                  <div>
                    <Label className="font-mono text-xs">Fee Type</Label>
                    <p className="font-mono">{selectedInvoice.feeType}</p>
                  </div>
                  <div>
                    <Label className="font-mono text-xs">Amount</Label>
                    <p className="font-mono">KES {selectedInvoice.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="font-mono text-xs">Due Date</Label>
                    <p className="font-mono">{selectedInvoice.dueDate}</p>
                  </div>
                  <div>
                    <Label className="font-mono text-xs">Status</Label>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-mono ${getStatusColor(selectedInvoice.paymentStatus)}`}>
                      {selectedInvoice.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>
                  Close
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
