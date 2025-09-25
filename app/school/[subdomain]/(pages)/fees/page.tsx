'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Settings } from 'lucide-react'

// Import modular components and hooks
import { StudentSearchSidebar } from './components/StudentSearchSidebar'
import { PageHeader } from './components/PageHeader'
import { OverviewStatsCards } from './components/OverviewStatsCards'
import { FiltersSection } from './components/FiltersSection'
import { FeesDataTable } from './components/FeesDataTable'
import { FeeStructureManager } from './components/FeeStructureManager'
import { FeeStructureDrawer } from './components/FeeStructureDrawer'
import { BulkInvoiceGenerator } from './components/BulkInvoiceGenerator'
import { useFeesData } from './hooks/useFeesData'
import { useFormHandlers } from './hooks/useFormHandlers'
import { useFeeStructures } from './hooks/useFeeStructures'
import { useGraphQLFeeStructures, UpdateFeeStructureInput } from './hooks/useGraphQLFeeStructures'
import { FeeInvoice, FeeStructure, FeeStructureForm, BulkInvoiceGeneration } from './types'

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
  const [activeTab, setActiveTab] = useState('invoices')
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false)
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  
  // Fee Structure states
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false)
  const [selectedStructure, setSelectedStructure] = useState<FeeStructure | null>(null)
  const [preselectedStructureId, setPreselectedStructureId] = useState<string>('')
  const [preselectedTerm, setPreselectedTerm] = useState<string>('')

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

  // Fee Structure hooks
  const {
    feeStructures,
    grades,
    createFeeStructure,
    deleteFeeStructure,
    assignFeeStructureToGrade,
    generateBulkInvoices
  } = useFeeStructures()

  // GraphQL Fee Structure hooks
  const {
    updateFeeStructure: graphqlUpdateFeeStructure,
    deleteFeeStructure: graphqlDeleteFeeStructure,
    isUpdating,
    updateError,
    isDeleting,
    deleteError
  } = useGraphQLFeeStructures()

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

  // Fee Structure handlers
  const handleCreateNew = () => {
    setSelectedStructure(null)
    setShowCreateForm(true)
  }

  const handleEdit = (feeStructure: FeeStructure) => {
    setSelectedStructure(feeStructure)
    setShowEditForm(true)
  }
  
  const handleDelete = async (feeStructureId: string) => {
    try {
      console.log('Deleting fee structure:', feeStructureId)
      const success = await graphqlDeleteFeeStructure(feeStructureId)
      
      if (success) {
        // Show success message (in a real app you'd use a toast notification system)
        console.log(`Fee structure ${feeStructureId} deleted successfully`)
        // Refresh the local fee structures list if needed
      } else if (deleteError) {
        console.error(`Failed to delete fee structure: ${deleteError}`)
        // Show error message to the user
      }
    } catch (error) {
      console.error('Error in delete handler:', error)
    }
  }

  const handleSaveStructure = async (formData: FeeStructureForm): Promise<string | null> => {
    try {
      let result: string | null = null
      if (selectedStructure) {
        // For edit mode, use GraphQL to update the fee structure
        console.log('Updating fee structure with GraphQL:', selectedStructure.id);
        
        // Extract the academicYearId and termId from the form or use defaults
        // In a real implementation, you would get these IDs from your form or API
        const updateInput: UpdateFeeStructureInput = {
          name: formData.name,
          isActive: true,
          // Use the academic year ID and term ID from the user's example
          // In a real app, these would come from dropdowns or selections
          academicYearId: "0216c3ab-7197-4538-97be-0527b3a8a164",
          termId: "6d17670b-11e4-430f-828b-c48e746b5507"
        };
        
        result = await graphqlUpdateFeeStructure(selectedStructure.id, updateInput);
        if (!result && updateError) {
          throw new Error(`GraphQL update failed: ${updateError}`); 
        }
      } else {
        // For create mode, use the local function
        result = await createFeeStructure(formData)
      }
      
      // Reset UI state
      setShowCreateForm(false)
      setShowEditForm(false)
      setSelectedStructure(null)
      return result
    } catch (error) {
      console.error('Error saving fee structure:', error)
      return null
    }
  }

  const handleGenerateInvoices = (feeStructureId: string, term: string) => {
    setPreselectedStructureId(feeStructureId)
    setPreselectedTerm(term)
    setShowInvoiceGenerator(true)
  }

  const handleBulkGeneration = (generation: BulkInvoiceGeneration) => {
    try {
      const newInvoices = generateBulkInvoices(generation)
      console.log(`Generated ${newInvoices.length} invoices successfully`)
      // Switch to invoices tab to show the new invoices
      setActiveTab('invoices')
    } catch (error) {
      console.error('Failed to generate invoices:', error)
    }
  }

  const handleAssignToGrade = (feeStructureId: string) => {
    console.log('Assign to grade:', feeStructureId)
  }

  const convertStructureToForm = (structure: FeeStructure): FeeStructureForm => {
    return {
      name: structure.name,
      grade: structure.grade,
      boardingType: structure.boardingType,
      academicYear: structure.academicYear,
      termStructures: structure.termStructures.map(term => ({
        term: term.term,
        dueDate: term.dueDate,
        latePaymentFee: term.latePaymentFee.toString(),
        earlyPaymentDiscount: (term.earlyPaymentDiscount || 0).toString(),
        earlyPaymentDeadline: term.earlyPaymentDeadline || '',
        buckets: term.buckets.map(bucket => ({
          type: bucket.type,
          name: bucket.name,
          description: bucket.description,
          isOptional: bucket.isOptional,
          components: bucket.components.map(component => ({
            name: component.name,
            description: component.description,
            amount: component.amount.toString(),
            category: component.category
          }))
        }))
      }))
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Student Search Sidebar - only show for invoices tab */}
      {activeTab === 'invoices' && (
        <StudentSearchSidebar
          isSidebarMinimized={isSidebarMinimized}
          setIsSidebarMinimized={setIsSidebarMinimized}
          selectedStudent={selectedStudent}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredStudents={filteredStudents}
          onStudentSelect={setSelectedStudent}
          onBackToAll={() => setSelectedStudent(null)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Page Header with Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Fees Management</h1>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="invoices">Invoice Management</TabsTrigger>
                <TabsTrigger value="structures">Fee Structures</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Tab Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsContent value="invoices" className="flex-1 m-0">
            <div className="flex-1 flex flex-col">
              {/* Invoice Management Header */}
              <PageHeader
                selectedStudent={selectedStudent}
                allStudents={filteredStudents}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                dueDateFilter=""
                setDueDateFilter={() => {}}
                onNewInvoice={handleNewInvoice}
                onSendReminder={handleSendReminderWrapper}
                onRecordPayment={handleRecordPayment}
                onCreatePaymentPlan={handleCreatePaymentPlan}
                onBackToAll={() => setSelectedStudent(null)}
                isSidebarMinimized={isSidebarMinimized}
                setIsSidebarMinimized={setIsSidebarMinimized}
              />

              {/* Main Content Area */}
              <div className="flex-1 p-6 space-y-6">
                {/* Overview Stats */}
                <OverviewStatsCards
                  selectedStudent={selectedStudent}
                  selectedStudentInvoices={selectedStudentInvoices}
                  summaryStats={summaryStats}
                  allStudents={filteredStudents}
                />

                {/* Filters */}
                <FiltersSection
                  selectedFeeType={selectedFeeType}
                  setSelectedFeeType={setSelectedFeeType}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  selectedClass=""
                  setSelectedClass={() => {}}
                  dueDateFilter=""
                  setDueDateFilter={() => {}}
                />

                {/* Data Table */}
                <FeesDataTable
                  selectedStudent={selectedStudent}
                  selectedStudentInvoices={selectedStudentInvoices}
                  filteredInvoices={filteredInvoices}
                  allStudents={filteredStudents}
                  selectedInvoices={selectedInvoices}
                  onSelectInvoice={handleSelectInvoice}
                  onViewInvoice={handleViewInvoice}
                  onSelectAll={handleSelectAll}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="structures" className="flex-1 m-0">
            <div className="flex-1 p-6">
              <FeeStructureManager
                onCreateNew={handleCreateNew}
                onEdit={handleEdit}
                onGenerateInvoices={handleGenerateInvoices}
                onAssignToGrade={handleAssignToGrade}
                onDelete={handleDelete}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invoice Details Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Student</Label>
                  <p className="text-sm text-gray-600">{selectedInvoice.studentName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Admission Number</Label>
                  <p className="text-sm text-gray-600">{selectedInvoice.admissionNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Class</Label>
                  <p className="text-sm text-gray-600">{selectedInvoice.class} - {selectedInvoice.section}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fee Type</Label>
                  <p className="text-sm text-gray-600 capitalize">{selectedInvoice.feeType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Amount</Label>
                  <p className="text-sm text-gray-600">KES {selectedInvoice.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount Due</Label>
                  <p className="text-sm text-gray-600">KES {selectedInvoice.amountDue.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Due Date</Label>
                  <p className="text-sm text-gray-600">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.paymentStatus)}`}>
                    {selectedInvoice.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>
              Close
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fee Structure Drawer */}
      <FeeStructureDrawer
        isOpen={showCreateForm || showEditForm}
        onClose={() => {
          setShowCreateForm(false)
          setShowEditForm(false)
          setSelectedStructure(null)
        }}
        onSave={handleSaveStructure}
        initialData={selectedStructure ? convertStructureToForm(selectedStructure) : undefined}
        mode={showCreateForm ? 'create' : 'edit'}
        availableGrades={grades}
      />

      <BulkInvoiceGenerator
        isOpen={showInvoiceGenerator}
        onClose={() => setShowInvoiceGenerator(false)}
        onGenerate={handleBulkGeneration}
        preselectedStructureId={preselectedStructureId}
        preselectedTerm={preselectedTerm}
      />
    </div>
  )
}
