import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { 
  NewInvoiceForm, 
  PaymentReminderForm, 
  RecordPaymentForm, 
  PaymentPlanForm,
  FeeInvoice 
} from '../types'
import { useGraphQLPayments } from './useGraphQLPayments'
import { useGraphQLInvoices } from './useGraphQLInvoices'
import { roundToNearestTen } from '../lib/feesAmounts'
import type { CreatePaymentResponse } from './useGraphQLPayments'

export const useFormHandlers = (
  selectedStudent: string | null, 
  filteredInvoices: FeeInvoice[],
  onDataChange?: () => void,
  onReminderLogged?: (entry: {
    studentIds: string[]
    channel: string
    message: string
  }) => void,
  onPaymentRecorded?: (entry: {
    amount: number
    method: string
    receiptNumber?: string
    studentId: string
    payment: CreatePaymentResponse
  }) => void,
) => {
  const { toast } = useToast()
  const { createPayment, error: paymentError } = useGraphQLPayments()
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
    partialPayment: false,
    applyCreditBalance: false,
    useManualAllocation: false,
    allocations: {},
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

  const handleSubmitReminder = (studentIdsOverride?: string[]) => {
    const studentIds = studentIdsOverride ?? reminderForm.studentIds
    if (studentIds.length === 0) {
      toast({
        title: 'Select students first',
        description: 'Choose one or more students from the balances list.',
        variant: 'destructive',
      })
      return
    }

    if (!reminderForm.message.trim()) {
      toast({
        title: 'Add a message',
        description: 'Write the reminder text parents will receive.',
        variant: 'destructive',
      })
      return
    }

    const channel =
      reminderForm.reminderType === 'sms'
        ? 'SMS'
        : reminderForm.reminderType === 'whatsapp'
          ? 'WhatsApp'
          : 'email'

    onReminderLogged?.({
      studentIds,
      channel: reminderForm.reminderType,
      message: reminderForm.message,
    })

    toast({
      title: 'Reminder queued',
      description: `${studentIds.length} ${channel} reminder(s) will send when messaging is connected for your school.`,
    })

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
    if (!paymentForm.studentId) {
      toast({
        title: 'Choose a student first',
        description: 'Search for the student who made this payment, then continue.',
        variant: 'destructive',
      })
      return
    }

    if (!paymentForm.invoiceId || !paymentForm.amountPaid || !paymentForm.paymentDate) {
      toast({
        title: 'Fill in all required fields',
        description: 'Select a bill, enter the amount, and choose the payment date.',
        variant: 'destructive',
      })
      return
    }

    const amount = roundToNearestTen(Number(paymentForm.amountPaid))
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Enter a payment amount greater than zero.',
        variant: 'destructive',
      })
      return
    }

    const input = {
      invoiceId: paymentForm.invoiceId,
      amount,
      paymentMethod: paymentForm.paymentMethod?.toUpperCase(),
      transactionReference: paymentForm.referenceNumber || undefined,
      paymentDate: new Date(paymentForm.paymentDate).toISOString(),
      notes: paymentForm.notes || undefined,
      applyCreditBalance: paymentForm.applyCreditBalance || undefined,
      allocations:
        paymentForm.useManualAllocation && paymentForm.allocations
          ? Object.entries(paymentForm.allocations)
              .map(([studentFeeItemId, value]) => ({
                studentFeeItemId,
                amount: Number(value),
              }))
              .filter((row) => Number.isFinite(row.amount) && row.amount > 0)
          : undefined,
    }

    const result = await createPayment(input)
    if (result) {
      onPaymentRecorded?.({
        amount,
        method: paymentForm.paymentMethod,
        receiptNumber: result.receiptNumber,
        studentId: paymentForm.studentId,
        payment: result,
      })

      setShowRecordPaymentDrawer(false)
      setPaymentForm({
        invoiceId: '',
        studentId: '',
        amountPaid: '',
        paymentMethod: 'cash',
        paymentDate: '',
        referenceNumber: '',
        notes: '',
        partialPayment: false,
        applyCreditBalance: false,
        useManualAllocation: false,
        allocations: {},
      })

      if (onDataChange) {
        onDataChange()
      }
      return
    }

    toast({
      title: 'Could not record payment',
      description:
        paymentError ||
        'Something went wrong. Check the amount and try again.',
      variant: 'destructive',
    })
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
