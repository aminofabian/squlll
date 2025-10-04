import { useState } from 'react'
import { 
  NewInvoiceForm, 
  PaymentReminderForm, 
  RecordPaymentForm, 
  PaymentPlanForm,
  FeeInvoice 
} from '../types'
import { useGraphQLPayments } from './useGraphQLPayments'
import { useGraphQLInvoices } from './useGraphQLInvoices'

export const useFormHandlers = (
  selectedStudent: string | null, 
  filteredInvoices: FeeInvoice[],
  onDataChange?: () => void
) => {
  const { createPayment } = useGraphQLPayments()
  const { generateInvoices, isGenerating: isGeneratingInvoices } = useGraphQLInvoices()
  // Modal states
  const [showNewInvoiceDrawer, setShowNewInvoiceDrawer] = useState(false)
  const [showPaymentReminderDrawer, setShowPaymentReminderDrawer] = useState(false)
  const [showRecordPaymentDrawer, setShowRecordPaymentDrawer] = useState(false)
  const [showPaymentPlanDrawer, setShowPaymentPlanDrawer] = useState(false)
  
  // New Invoice Form State
  const [newInvoiceForm, setNewInvoiceForm] = useState<NewInvoiceForm>({
    studentId: '',
    termId: '',
    issueDate: '',
    dueDate: '',
    notes: ''
  })

  // Payment Reminder Form State
  const [reminderForm, setReminderForm] = useState<PaymentReminderForm>({
    studentIds: [],
    reminderType: 'email',
    message: '',
    urgencyLevel: 'normal',
    includeInvoiceDetails: true,
    scheduledDate: '',
    followUpDays: '7'
  })

  // Record Payment Form State  
  const [paymentForm, setPaymentForm] = useState<RecordPaymentForm>({
    invoiceId: '',
    studentId: '',
    amountPaid: '',
    paymentMethod: 'cash',
    paymentDate: '',
    referenceNumber: '',
    notes: '',
    partialPayment: false
  })

  // Payment Plan Form State
  const [paymentPlanForm, setPaymentPlanForm] = useState<PaymentPlanForm>({
    studentId: '',
    totalAmount: '',
    downPayment: '',
    numberOfInstallments: '3',
    installmentFrequency: 'monthly',
    startDate: '',
    description: '',
    latePaymentFee: '',
    autoReminders: true
  })

  // Form handlers
  const handleNewInvoice = () => {
    if (selectedStudent) {
      setNewInvoiceForm(prev => ({
        ...prev,
        studentId: selectedStudent
      }))
    }
    setShowNewInvoiceDrawer(true)
  }

  const handleCloseNewInvoiceDrawer = () => {
    setShowNewInvoiceDrawer(false)
    setNewInvoiceForm({
      studentId: selectedStudent || '',
      termId: '',
      issueDate: '',
      dueDate: '',
      notes: ''
    })
  }

  const handleFormChange = (field: string, value: string) => {
    setNewInvoiceForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmitInvoice = async () => {
    // The actual submission is handled in the NewInvoiceDrawer component
    // This is just a placeholder for the callback
    console.log('Invoice submission completed')
  }

  // Payment Reminder Handlers
  const handleSendReminder = (selectedInvoices: string[]) => {
    setReminderForm({
      ...reminderForm,
      studentIds: selectedStudent ? [selectedStudent] : selectedInvoices.map((id: string) => {
        const invoice = filteredInvoices.find((inv: FeeInvoice) => inv.id === id)
        return invoice?.studentId || ''
      }).filter(Boolean)
    })
    setShowPaymentReminderDrawer(true)
  }

  const handleSubmitReminder = () => {
    console.log('Sending reminder:', reminderForm)
    setShowPaymentReminderDrawer(false)
    setReminderForm({
      studentIds: [],
      reminderType: 'email',
      message: '',
      urgencyLevel: 'normal',
      includeInvoiceDetails: true,
      scheduledDate: '',
      followUpDays: '7'
    })
  }

  // Record Payment Handlers
  const handleRecordPayment = () => {
    if (selectedStudent) {
      const studentInvoices = filteredInvoices.filter((inv: FeeInvoice) => inv.studentId === selectedStudent)
      const pendingInvoice = studentInvoices.find((inv: FeeInvoice) => inv.paymentStatus === 'pending')
      setPaymentForm(prev => ({
        ...prev,
        studentId: selectedStudent,
        invoiceId: pendingInvoice?.id || '',
        paymentDate: new Date().toISOString().split('T')[0]
      }))
    }
    setShowRecordPaymentDrawer(true)
  }

  const handleSubmitPayment = async () => {
    if (!paymentForm.invoiceId || !paymentForm.amountPaid || !paymentForm.paymentDate) {
      console.warn('Missing required payment fields')
      return
    }

    const input = {
      invoiceId: paymentForm.invoiceId,
      amount: Number(paymentForm.amountPaid),
      paymentMethod: paymentForm.paymentMethod?.toUpperCase(),
      transactionReference: paymentForm.referenceNumber || undefined,
      paymentDate: new Date(paymentForm.paymentDate).toISOString(),
      notes: paymentForm.notes || undefined,
    }

    const result = await createPayment(input)
    if (result) {
      setShowRecordPaymentDrawer(false)
      setPaymentForm({
        invoiceId: '',
        studentId: '',
        amountPaid: '',
        paymentMethod: 'cash',
        paymentDate: '',
        referenceNumber: '',
        notes: '',
        partialPayment: false
      })
      
      // Trigger data refresh after successful payment
      if (onDataChange) {
        onDataChange()
      }
    }
  }

  // Payment Plan Handlers
  const handleCreatePaymentPlan = () => {
    if (selectedStudent) {
      const studentOutstanding = filteredInvoices
        .filter((inv: FeeInvoice) => inv.studentId === selectedStudent && inv.paymentStatus !== 'paid')
        .reduce((sum: number, inv: FeeInvoice) => sum + inv.totalAmount, 0)
      
      setPaymentPlanForm(prev => ({
        ...prev,
        studentId: selectedStudent,
        totalAmount: studentOutstanding.toString(),
        startDate: new Date().toISOString().split('T')[0]
      }))
    }
    setShowPaymentPlanDrawer(true)
  }

  const handleSubmitPaymentPlan = () => {
    console.log('Creating payment plan:', paymentPlanForm)
    setShowPaymentPlanDrawer(false)
    setPaymentPlanForm({
      studentId: '',
      totalAmount: '',
      downPayment: '',
      numberOfInstallments: '3',
      installmentFrequency: 'monthly',
      startDate: '',
      description: '',
      latePaymentFee: '',
      autoReminders: true
    })
  }

  return {
    // Modal states
    showNewInvoiceDrawer,
    setShowNewInvoiceDrawer,
    showPaymentReminderDrawer,
    setShowPaymentReminderDrawer,
    showRecordPaymentDrawer,
    setShowRecordPaymentDrawer,
    showPaymentPlanDrawer,
    setShowPaymentPlanDrawer,
    
    // Form states
    newInvoiceForm,
    setNewInvoiceForm,
    reminderForm,
    setReminderForm,
    paymentForm,
    setPaymentForm,
    paymentPlanForm,
    setPaymentPlanForm,
    
    // Handlers
    handleNewInvoice,
    handleCloseNewInvoiceDrawer,
    handleFormChange,
    handleSubmitInvoice,
    handleSendReminder,
    handleSubmitReminder,
    handleRecordPayment,
    handleSubmitPayment,
    handleCreatePaymentPlan,
    handleSubmitPaymentPlan,
    
    // GraphQL states
    isGeneratingInvoices
  }
}
