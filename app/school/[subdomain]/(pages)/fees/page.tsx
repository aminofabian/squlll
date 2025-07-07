"use client"

import { useState, useMemo } from 'react'
import { 
  DollarSign,
  Users, 
  Search, 
  Filter, 
  Download,
  Mail,
  MessageSquare,
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  Plus,
  Printer,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  X,
  CalendarDays,
  Send,
  Receipt,
  CalendarClock,
  Phone,
  Banknote,
  Wallet,
  Target,
  ArrowRight,
  Edit2,
  Pause,
  Play,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

// Fee and Invoice types
interface FeeInvoice {
  id: string
  studentId: string
  studentName: string
  admissionNumber: string
  class: string
  section: string
  feeType: 'tuition' | 'transport' | 'hostel' | 'exam' | 'library' | 'sports' | 'lab'
  totalAmount: number
  amountPaid: number
  amountDue: number
  dueDate: string
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'partial'
  invoiceDate: string
  term: string
  academicYear: string
  paymentHistory: {
    id: string
    date: string
    amount: number
    method: 'cash' | 'bank' | 'online' | 'cheque'
    reference?: string
    notes?: string
  }[]
  discounts?: {
    type: string
    amount: number
    reason: string
  }[]
  remindersSent: number
  lastReminderDate?: string
}

// Payment Plan types
interface PaymentPlan {
  id: string
  studentId: string
  studentName: string
  totalAmount: number
  downPayment: number
  numberOfInstallments: number
  installmentAmount: number
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly'
  startDate: string
  endDate: string
  status: 'active' | 'paused' | 'completed' | 'defaulted'
  autoReminders: boolean
  latePaymentFee: number
  description: string
  createdDate: string
  installments: PaymentInstallment[]
}

interface PaymentInstallment {
  id: string
  installmentNumber: number
  dueDate: string
  amount: number
  status: 'pending' | 'paid' | 'overdue' | 'partial'
  paidAmount: number
  paidDate?: string
  paymentMethod?: string
  lateFeesApplied: number
  remindersSent: number
  lastReminderDate?: string
  notes?: string
}

// Mock fee data
const mockFeeInvoices: FeeInvoice[] = [
  {
    id: "INV-2024-001",
    studentId: "STU-001",
    studentName: "Alice Johnson",
    admissionNumber: "ADM/2023/001",
    class: "Form 4",
    section: "A",
    feeType: "tuition",
    totalAmount: 45000,
    amountPaid: 30000,
    amountDue: 15000,
    dueDate: "2024-02-15",
    paymentStatus: "partial",
    invoiceDate: "2024-01-01",
    term: "Term 1",
    academicYear: "2024",
    paymentHistory: [
      {
        id: "PAY-001",
        date: "2024-01-10",
        amount: 30000,
        method: "bank",
        reference: "TXN123456",
        notes: "Initial payment"
      }
    ],
    remindersSent: 1,
    lastReminderDate: "2024-02-10"
  },
  {
    id: "INV-2024-002",
    studentId: "STU-002",
    studentName: "Bob Smith",
    admissionNumber: "ADM/2023/002",
    class: "Form 3",
    section: "B",
    feeType: "transport",
    totalAmount: 12000,
    amountPaid: 12000,
    amountDue: 0,
    dueDate: "2024-01-30",
    paymentStatus: "paid",
    invoiceDate: "2024-01-01",
    term: "Term 1",
    academicYear: "2024",
    paymentHistory: [
      {
        id: "PAY-002",
        date: "2024-01-15",
        amount: 12000,
        method: "online",
        reference: "MPESA789012",
        notes: "Full transport fee"
      }
    ],
    remindersSent: 0
  },
  {
    id: "INV-2024-003",
    studentId: "STU-003",
    studentName: "Carol Williams",
    admissionNumber: "ADM/2023/003",
    class: "Form 2",
    section: "A",
    feeType: "hostel",
    totalAmount: 25000,
    amountPaid: 0,
    amountDue: 25000,
    dueDate: "2024-01-20",
    paymentStatus: "overdue",
    invoiceDate: "2024-01-01",
    term: "Term 1",
    academicYear: "2024",
    paymentHistory: [],
    remindersSent: 3,
    lastReminderDate: "2024-02-05"
  },
  {
    id: "INV-2024-004",
    studentId: "STU-004",
    studentName: "David Brown",
    admissionNumber: "ADM/2023/004",
    class: "Form 4",
    section: "B",
    feeType: "exam",
    totalAmount: 8000,
    amountPaid: 0,
    amountDue: 8000,
    dueDate: "2024-02-25",
    paymentStatus: "pending",
    invoiceDate: "2024-02-01",
    term: "Term 1",
    academicYear: "2024",
    paymentHistory: [],
    remindersSent: 0
  },
  {
    id: "INV-2024-005",
    studentId: "STU-005",
    studentName: "Eva Davis",
    admissionNumber: "ADM/2023/005",
    class: "Form 1",
    section: "A",
    feeType: "tuition",
    totalAmount: 40000,
    amountPaid: 0,
    amountDue: 40000,
    dueDate: "2024-02-18",
    paymentStatus: "pending",
    invoiceDate: "2024-01-01",
    term: "Term 1",
    academicYear: "2024",
    paymentHistory: [],
    remindersSent: 1,
    lastReminderDate: "2024-02-15"
  }
]

// Mock Payment Plans Data
const mockPaymentPlans: PaymentPlan[] = [
  {
    id: "plan-001",
    studentId: "st-001",
    studentName: "John Doe",
    totalAmount: 885000,
    downPayment: 15000,
    numberOfInstallments: 3,
    installmentAmount: 10000,
    frequency: "monthly",
    startDate: "2024-02-01",
    endDate: "2024-04-01",
    status: "active",
    autoReminders: true,
    latePaymentFee: 500,
    description: "Term 1 tuition payment plan",
    createdDate: "2024-01-15",
    installments: [
      {
        id: "inst-001",
        installmentNumber: 1,
        dueDate: "2024-02-01",
        amount: 10000,
        status: "paid",
        paidAmount: 10000,
        paidDate: "2024-01-30",
        paymentMethod: "bank",
        lateFeesApplied: 0,
        remindersSent: 1,
        lastReminderDate: "2024-01-25",
        notes: "Paid on time"
      },
      {
        id: "inst-002",
        installmentNumber: 2,
        dueDate: "2024-03-01",
        amount: 10000,
        status: "paid",
        paidAmount: 10000,
        paidDate: "2024-02-28",
        paymentMethod: "cash",
        lateFeesApplied: 0,
        remindersSent: 2,
        lastReminderDate: "2024-02-25"
      },
      {
        id: "inst-003",
        installmentNumber: 3,
        dueDate: "2024-04-01",
        amount: 10000,
        status: "pending",
        paidAmount: 0,
        lateFeesApplied: 0,
        remindersSent: 0
      }
    ]
  },
  {
    id: "plan-002",
    studentId: "st-002",
    studentName: "Jane Smith",
    totalAmount: 60000,
    downPayment: 20000,
    numberOfInstallments: 4,
    installmentAmount: 10000,
    frequency: "monthly",
    startDate: "2024-01-15",
    endDate: "2024-04-15",
    status: "active",
    autoReminders: true,
    latePaymentFee: 750,
    description: "Full year payment plan with discount",
    createdDate: "2024-01-01",
    installments: [
      {
        id: "inst-004",
        installmentNumber: 1,
        dueDate: "2024-01-15",
        amount: 10000,
        status: "paid",
        paidAmount: 10000,
        paidDate: "2024-01-12",
        paymentMethod: "online",
        lateFeesApplied: 0,
        remindersSent: 0
      },
      {
        id: "inst-005",
        installmentNumber: 2,
        dueDate: "2024-02-15",
        amount: 10000,
        status: "overdue",
        paidAmount: 0,
        lateFeesApplied: 750,
        remindersSent: 3,
        lastReminderDate: "2024-02-20"
      },
      {
        id: "inst-006",
        installmentNumber: 3,
        dueDate: "2024-03-15",
        amount: 10000,
        status: "pending",
        paidAmount: 0,
        lateFeesApplied: 0,
        remindersSent: 0
      },
      {
        id: "inst-007",
        installmentNumber: 4,
        dueDate: "2024-04-15",
        amount: 10000,
        status: "pending",
        paidAmount: 0,
        lateFeesApplied: 0,
        remindersSent: 0
      }
    ]
  },
  {
    id: "plan-003",
    studentId: "st-003",
    studentName: "Mike Johnson",
    totalAmount: 30000,
    downPayment: 10000,
    numberOfInstallments: 2,
    installmentAmount: 10000,
    frequency: "bi-weekly",
    startDate: "2024-02-01",
    endDate: "2024-03-01",
    status: "completed",
    autoReminders: true,
    latePaymentFee: 300,
    description: "Short-term payment plan for examination fees",
    createdDate: "2024-01-20",
    installments: [
      {
        id: "inst-008",
        installmentNumber: 1,
        dueDate: "2024-02-01",
        amount: 10000,
        status: "paid",
        paidAmount: 10000,
        paidDate: "2024-02-01",
        paymentMethod: "cash",
        lateFeesApplied: 0,
        remindersSent: 1
      },
      {
        id: "inst-009",
        installmentNumber: 2,
        dueDate: "2024-03-01",
        amount: 10000,
        status: "paid",
        paidAmount: 10000,
        paidDate: "2024-02-28",
        paymentMethod: "bank",
        lateFeesApplied: 0,
        remindersSent: 1
      }
    ]
  }
]

const feeTypes = ['tuition', 'transport', 'hostel', 'exam', 'library', 'sports', 'lab']
const paymentStatuses = ['paid', 'pending', 'overdue', 'partial']
const classes = ['Form 1', 'Form 2', 'Form 3', 'Form 4']
const sections = ['A', 'B', 'C']

export default function FeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFeeType, setSelectedFeeType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedSection, setSelectedSection] = useState<string>('all')
  const [dueDateFilter, setDueDateFilter] = useState<string>('all')
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [showNewInvoiceDrawer, setShowNewInvoiceDrawer] = useState(false)
  const [showPaymentReminderDrawer, setShowPaymentReminderDrawer] = useState(false)
  const [showRecordPaymentDrawer, setShowRecordPaymentDrawer] = useState(false)
  const [showPaymentPlanDrawer, setShowPaymentPlanDrawer] = useState(false)
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<PaymentPlan | null>(null)
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false)
  
  // New Invoice Form State
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    studentId: '',
    feeType: '',
    amount: '',
    dueDate: '',
    term: 'Term 1',
    academicYear: '2024',
    description: '',
    discountAmount: '',
    discountReason: ''
  })

  // Payment Reminder Form State
  const [reminderForm, setReminderForm] = useState({
    studentIds: [] as string[],
    reminderType: 'email',
    message: '',
    urgencyLevel: 'normal',
    includeInvoiceDetails: true,
    scheduledDate: '',
    followUpDays: '7'
  })

  // Record Payment Form State  
  const [paymentForm, setPaymentForm] = useState({
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
  const [paymentPlanForm, setPaymentPlanForm] = useState({
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

  // Get unique students for sidebar
  const allStudents = useMemo(() => {
    const studentMap = new Map()
    mockFeeInvoices.forEach(invoice => {
      if (!studentMap.has(invoice.studentId)) {
        studentMap.set(invoice.studentId, {
          id: invoice.studentId,
          name: invoice.studentName,
          admissionNumber: invoice.admissionNumber,
          class: invoice.class,
          section: invoice.section,
          totalOutstanding: 0,
          totalPaid: 0,
          invoiceCount: 0,
          overdueCount: 0
        })
      }
      const student = studentMap.get(invoice.studentId)
      student.totalOutstanding += invoice.amountDue
      student.totalPaid += invoice.amountPaid
      student.invoiceCount += 1
      if (invoice.paymentStatus === 'overdue') {
        student.overdueCount += 1
      }
    })
    return Array.from(studentMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  // Filter students by search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return allStudents
    return allStudents.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [allStudents, searchTerm])

  // Get invoices for selected student
  const selectedStudentInvoices = useMemo(() => {
    if (!selectedStudent) return []
    return mockFeeInvoices.filter(invoice => invoice.studentId === selectedStudent)
  }, [selectedStudent])

  // Filter and calculate statistics
  const filteredInvoices = useMemo(() => {
    let filtered = mockFeeInvoices.filter(invoice => {
      const matchesSearch = searchTerm === '' || 
        invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFeeType = selectedFeeType === 'all' || invoice.feeType === selectedFeeType
      const matchesStatus = selectedStatus === 'all' || invoice.paymentStatus === selectedStatus
      const matchesClass = selectedClass === 'all' || invoice.class === selectedClass
      const matchesSection = selectedSection === 'all' || invoice.section === selectedSection
      
      let matchesDueDate = true
      if (dueDateFilter === 'next7days') {
        const now = new Date()
        const dueDate = new Date(invoice.dueDate)
        const diffTime = dueDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        matchesDueDate = diffDays <= 7 && diffDays >= 0
      } else if (dueDateFilter === 'overdue') {
        const now = new Date()
        const dueDate = new Date(invoice.dueDate)
        matchesDueDate = dueDate < now && invoice.paymentStatus !== 'paid'
      }
      
      return matchesSearch && matchesFeeType && matchesStatus && matchesClass && matchesSection && matchesDueDate
    })

    return filtered.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())
  }, [searchTerm, selectedFeeType, selectedStatus, selectedClass, selectedSection, dueDateFilter])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalCollected = mockFeeInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0)
    const totalOutstanding = mockFeeInvoices.reduce((sum, inv) => sum + inv.amountDue, 0)
    const studentsWithPendingFees = mockFeeInvoices.filter(inv => inv.amountDue > 0).length
    
    const now = new Date()
    const upcomingDueCount = mockFeeInvoices.filter(inv => {
      const dueDate = new Date(inv.dueDate)
      const diffTime = dueDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays >= 0 && inv.amountDue > 0
    }).length

    const overdueCount = mockFeeInvoices.filter(inv => inv.paymentStatus === 'overdue').length
    const collectionRate = totalCollected / (totalCollected + totalOutstanding) * 100

    return {
      totalCollected,
      totalOutstanding,
      studentsWithPendingFees,
      upcomingDueCount,
      overdueCount,
      collectionRate
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
      case 'pending': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
      case 'overdue': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
      case 'partial': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
    }
  }

  const getFeeTypeIcon = (type: string) => {
    switch (type) {
      case 'tuition': return <FileText className="h-4 w-4" />
      case 'transport': return <Calendar className="h-4 w-4" />
      case 'hostel': return <Users className="h-4 w-4" />
      case 'exam': return <CheckCircle className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
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

  const handleViewInvoice = (invoice: FeeInvoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceModal(true)
  }

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId)
    setSelectedInvoices([]) // Clear bulk selections when switching students
  }

  const handleBackToAll = () => {
    setSelectedStudent(null)
    setSelectedInvoices([])
  }

  const handleNewInvoice = () => {
    // Pre-fill student if one is selected
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
    // Reset form
    setNewInvoiceForm({
      studentId: selectedStudent || '',
      feeType: '',
      amount: '',
      dueDate: '',
      term: 'Term 1',
      academicYear: '2024',
      description: '',
      discountAmount: '',
      discountReason: ''
    })
  }

  const handleFormChange = (field: string, value: string) => {
    setNewInvoiceForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmitInvoice = () => {
    // TODO: Add validation and submit logic
    console.log('Submitting invoice:', newInvoiceForm)
    handleCloseNewInvoiceDrawer()
  }

  // Payment Reminder Handlers
  const handleSendReminder = () => {
    setReminderForm({
      ...reminderForm,
      studentIds: selectedStudent ? [selectedStudent] : selectedInvoices.map((id: string) => {
        const invoice = mockFeeInvoices.find((inv: FeeInvoice) => inv.id === id)
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

  const handleSubmitPayment = () => {
    console.log('Recording payment:', paymentForm)
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



  const getStudentPaymentPlans = (studentId: string | null) => {
    if (!studentId) return mockPaymentPlans
    return mockPaymentPlans.filter(plan => plan.studentId === studentId)
  }

  const getInstallmentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPlanStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'defaulted': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }



  return (
    <div className="flex min-h-screen">
      {/* Search Sidebar */}
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
            className="border-primary/30 hover:bg-primary/5"
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
                    onClick={handleBackToAll}
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
                    onClick={() => handleStudentSelect(student.id)}
                  >
                    <div className="font-mono text-sm font-medium">{student.name}</div>
                    <div className="font-mono text-xs text-slate-500 mb-1">
                      {student.admissionNumber} • {student.class} {student.section}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {student.totalOutstanding > 0 ? (
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 font-mono">
                          {formatCurrency(student.totalOutstanding)} due
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 font-mono">
                          Paid up
                        </Badge>
                      )}
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

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-8 relative">
        {/* Floating toggle button when sidebar is minimized */}
        {isSidebarMinimized && (
          <div className="absolute top-4 left-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarMinimized(false)}
              className="border-primary/30 hover:bg-primary/5 shadow-lg bg-white"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        )}
        {/* Page Header */}
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
                      onClick={handleBackToAll}
                      className="font-mono"
                    >
                      ← Back to All Students
                    </Button>
                    <h1 className="text-3xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                      {allStudents.find(s => s.id === selectedStudent)?.name}
                    </h1>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {allStudents.find(s => s.id === selectedStudent)?.admissionNumber} • {allStudents.find(s => s.id === selectedStudent)?.class} {allStudents.find(s => s.id === selectedStudent)?.section}
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

            {/* Action Buttons - Moved to header right */}
            <div className="flex flex-wrap gap-3 items-start">
              {/* Sidebar toggle button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                className="border-primary/30 hover:bg-primary/5"
                title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
              >
                {isSidebarMinimized ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
              <Button 
                onClick={handleNewInvoice}
                className="bg-primary hover:bg-primary/90 text-white font-mono"
              >
                <Plus className="h-4 w-4 mr-2" />
                {selectedStudent ? `New Invoice for ${allStudents.find(s => s.id === selectedStudent)?.name}` : 'New Invoice'}
              </Button>
            
              {selectedStudent ? (
                // Student-specific actions
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleSendReminder}
                    className="font-mono"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleRecordPayment}
                    className="font-mono"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCreatePaymentPlan}
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

        {/* Overview Section */}
        {selectedStudent ? (
          // Student-specific overview
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Total Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-green-600">
                  {formatCurrency(selectedStudentInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0))}
                </div>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  Payments made
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-red-50 dark:bg-red-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Outstanding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-red-600">
                  {formatCurrency(selectedStudentInvoices.reduce((sum, inv) => sum + inv.amountDue, 0))}
                </div>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  Amount pending
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-blue-50 dark:bg-blue-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Total Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-blue-600">
                  {selectedStudentInvoices.length}
                </div>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  Fee records
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-orange-50 dark:bg-orange-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-orange-600">
                  {selectedStudentInvoices.filter(inv => inv.paymentStatus === 'overdue').length}
                </div>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  Needs attention
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          // General overview
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Total Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-green-600">
                  {formatCurrency(summaryStats.totalCollected)}
                </div>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  {summaryStats.collectionRate.toFixed(1)}% collection rate
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-red-50 dark:bg-red-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Outstanding Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-red-600">
                  {formatCurrency(summaryStats.totalOutstanding)}
                </div>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  {summaryStats.studentsWithPendingFees} students pending
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-yellow-50 dark:bg-yellow-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Due Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-yellow-600">
                  {summaryStats.upcomingDueCount}
                </div>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  Due in next 7 days
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-orange-50 dark:bg-orange-900/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-orange-600">
                  {summaryStats.overdueCount}
                </div>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  Requires attention
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Plans Section - Only show for individual students */}
        {selectedStudent && (
          <div className="border-2 border-primary/20 rounded-xl p-6 bg-primary/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">
                Payment Plans
              </h3>
              <Badge variant="outline" className="font-mono">
                {getStudentPaymentPlans(selectedStudent).length} active
              </Badge>
            </div>
            <Button
              onClick={() => setShowPaymentPlanDrawer(true)}
              variant="outline"
              size="sm"
              className="font-mono"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Payment Plan
            </Button>
          </div>

          {selectedPaymentPlan ? (
            // Individual Plan Details
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPaymentPlan(null)}
                  className="font-mono"
                >
                  ← Back to Plans Overview
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="font-mono">
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="font-mono"
                    disabled={selectedPaymentPlan.status === 'paused'}
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Pause Plan
                  </Button>
                  <Button variant="outline" size="sm" className="font-mono">
                    <Send className="h-4 w-4 mr-1" />
                    Send Reminder
                  </Button>
                </div>
              </div>

              {/* Plan Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-2 border-primary/20 bg-white dark:bg-slate-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Total Amount
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-mono font-bold text-primary">
                      {formatCurrency(selectedPaymentPlan.totalAmount)}
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-1">
                      Plan total
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-900/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Amount Paid
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-mono font-bold text-green-600">
                      {formatCurrency(selectedPaymentPlan.downPayment + selectedPaymentPlan.installments.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.paidAmount, 0))}
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-1">
                      Including down payment
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-mono font-bold text-blue-600">
                      {selectedPaymentPlan.installments.filter(i => i.status === 'paid').length}/{selectedPaymentPlan.numberOfInstallments}
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-1">
                      Installments paid
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-amber-200 bg-amber-50 dark:bg-amber-900/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      Next Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-mono font-bold text-amber-600">
                      {(() => {
                        const nextInstallment = selectedPaymentPlan.installments.find(i => i.status === 'pending' || i.status === 'overdue')
                        return nextInstallment ? formatCurrency(nextInstallment.amount) : 'Complete'
                      })()}
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-1">
                      {(() => {
                        const nextInstallment = selectedPaymentPlan.installments.find(i => i.status === 'pending' || i.status === 'overdue')
                        return nextInstallment ? `Due ${nextInstallment.dueDate}` : 'All paid'
                      })()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Timeline */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="font-mono flex items-center gap-2">
                    <CalendarClock className="h-5 w-5" />
                    Payment Schedule
                  </CardTitle>
                  <CardDescription className="font-mono">
                    Track installment payments and due dates for {selectedPaymentPlan.studentName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Down Payment */}
                    {selectedPaymentPlan.downPayment > 0 && (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                          <div>
                            <div className="font-mono font-medium text-sm">Down Payment</div>
                            <div className="font-mono text-xs text-slate-500">{selectedPaymentPlan.createdDate}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-green-600 text-sm">{formatCurrency(selectedPaymentPlan.downPayment)}</div>
                          <Badge className="bg-green-100 text-green-800 border-green-200 font-mono text-xs">
                            Paid
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Installments */}
                    {selectedPaymentPlan.installments.slice(0, 5).map((installment, index) => (
                      <div key={installment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            installment.status === 'paid' ? 'bg-green-600 text-white' :
                            installment.status === 'overdue' ? 'bg-red-600 text-white' :
                            installment.status === 'partial' ? 'bg-yellow-600 text-white' :
                            'bg-gray-400 text-white'
                          }`}>
                            {installment.status === 'paid' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : installment.status === 'overdue' ? (
                              <AlertTriangle className="h-3 w-3" />
                            ) : (
                              <span className="font-mono">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-mono font-medium text-sm">Installment {installment.installmentNumber}</div>
                            <div className="font-mono text-xs text-slate-500">Due: {installment.dueDate}</div>
                            {installment.paidDate && (
                              <div className="font-mono text-xs text-green-600">Paid: {installment.paidDate}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-sm">{formatCurrency(installment.amount)}</div>
                          <Badge className={getInstallmentStatusColor(installment.status)}>
                            {installment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {selectedPaymentPlan.installments.length > 5 && (
                      <div className="text-center py-2">
                        <Button variant="outline" size="sm" className="font-mono text-xs">
                          View All {selectedPaymentPlan.installments.length} Installments
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Payment Plans Overview
            <div className="space-y-4">
              {getStudentPaymentPlans(selectedStudent).length === 0 ? (
                <div className="text-center py-8">
                  <Target className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="font-mono text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No Payment Plans
                  </h3>
                  <p className="font-mono text-sm text-slate-500 mb-4">
                    {selectedStudent 
                      ? `${allStudents.find(s => s.id === selectedStudent)?.name} doesn't have any payment plans yet.`
                      : 'No payment plans have been created yet.'
                    }
                  </p>
                  <Button
                    onClick={() => setShowPaymentPlanDrawer(true)}
                    className="bg-primary hover:bg-primary/90 text-white font-mono"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Payment Plan
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getStudentPaymentPlans(selectedStudent).map((plan) => (
                    <Card 
                      key={plan.id} 
                      className="border-2 border-primary/20 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setSelectedPaymentPlan(plan)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-mono">{plan.studentName}</CardTitle>
                          <Badge className={getPlanStatusColor(plan.status)}>
                            {plan.status}
                          </Badge>
                        </div>
                        <CardDescription className="font-mono text-xs">
                          {plan.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between font-mono text-xs">
                            <span>Total Amount:</span>
                            <span className="font-bold">{formatCurrency(plan.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between font-mono text-xs">
                            <span>Per {plan.frequency}:</span>
                            <span className="font-bold">{formatCurrency(plan.installmentAmount)}</span>
                          </div>
                          <div className="flex justify-between font-mono text-xs">
                            <span>Progress:</span>
                            <span className="font-bold">
                              {plan.installments.filter(i => i.status === 'paid').length}/{plan.numberOfInstallments}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full" 
                              style={{
                                width: `${(plan.installments.filter(i => i.status === 'paid').length / plan.numberOfInstallments) * 100}%`
                              }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-1">
                            <span>Next: {plan.installments.find(i => i.status === 'pending')?.dueDate || 'Complete'}</span>
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {/* Filters and Sorting - Only show when no student is selected */}
        {!selectedStudent && (
          <div className="border-2 border-primary/20 rounded-xl p-6 bg-primary/5">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-primary" />
                <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  Filter & Sort Records
                </h3>
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Fee Type Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300">
                    Fee Type
                  </Label>
                  <Select value={selectedFeeType} onValueChange={setSelectedFeeType}>
                    <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-mono">All Types</SelectItem>
                      {feeTypes.map(type => (
                        <SelectItem key={type} value={type} className="font-mono">
                          <div className="flex items-center gap-2">
                            {getFeeTypeIcon(type)}
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Status Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300">
                    Payment Status
                  </Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-mono">All Statuses</SelectItem>
                      {paymentStatuses.map(status => (
                        <SelectItem key={status} value={status} className="font-mono">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Class Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300">
                    Class
                  </Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-mono">All Classes</SelectItem>
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls} className="font-mono">{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300">
                    Due Date
                  </Label>
                  <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
                    <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="font-mono">All Dates</SelectItem>
                      <SelectItem value="next7days" className="font-mono">Due in Next 7 Days</SelectItem>
                      <SelectItem value="overdue" className="font-mono">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>


            </div>
          </div>
        )}



        {/* Main Table */}
        <div className="border-2 border-primary/20 rounded-xl overflow-hidden">
          <div className="p-4 border-b-2 border-primary/20 bg-primary/5">
            <div className="flex justify-between items-center">
              <h3 className="font-mono font-bold">
                {selectedStudent ? `Fee Records for ${allStudents.find(s => s.id === selectedStudent)?.name}` : 'Fee Records'}
              </h3>
              <p className="text-sm font-mono text-slate-600">
                {selectedStudent ? selectedStudentInvoices.length : filteredInvoices.length} records found
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-primary/20">
                  {!selectedStudent && (
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedInvoices.length === filteredInvoices.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead className="font-mono">Student</TableHead>
                  <TableHead className="font-mono">Class</TableHead>
                  <TableHead className="font-mono">Invoice ID</TableHead>
                  <TableHead className="font-mono">Fee Type</TableHead>
                  <TableHead className="font-mono">Amount Due</TableHead>
                  <TableHead className="font-mono">Amount Paid</TableHead>
                  <TableHead className="font-mono">Due Date</TableHead>
                  <TableHead className="font-mono">Status</TableHead>
                  <TableHead className="font-mono">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(selectedStudent ? selectedStudentInvoices : filteredInvoices).map((invoice) => (
                  <TableRow key={invoice.id} className="border-primary/20">
                    {!selectedStudent && (
                      <TableCell>
                        <Checkbox 
                          checked={selectedInvoices.includes(invoice.id)}
                          onCheckedChange={() => handleSelectInvoice(invoice.id)}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-mono">
                      <div>
                        <div className="font-medium">{invoice.studentName}</div>
                        <div className="text-xs text-slate-500">{invoice.admissionNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {invoice.class} {invoice.section}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {invoice.id}
                    </TableCell>
                    <TableCell className="font-mono">
                      <div className="flex items-center gap-2">
                        {getFeeTypeIcon(invoice.feeType)}
                        {invoice.feeType.charAt(0).toUpperCase() + invoice.feeType.slice(1)}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-medium">
                      {formatCurrency(invoice.amountDue)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatCurrency(invoice.amountPaid)}
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
                          onClick={() => handleViewInvoice(invoice)}
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
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Empty State */}
        {(selectedStudent ? selectedStudentInvoices.length === 0 : filteredInvoices.length === 0) && (
          <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg">
            <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-mono font-medium text-slate-600 dark:text-slate-400 mb-2">
              {selectedStudent ? 'No fee records for this student' : 'No fee records found'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-500 font-mono">
              {selectedStudent 
                ? 'This student has no fee invoices yet'
                : 'Try adjusting your filters or search terms'
              }
            </p>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono">Invoice Details</DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="border-2 border-primary/20 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-mono font-bold">{selectedInvoice.studentName}</h3>
                    <p className="text-sm font-mono text-slate-600">{selectedInvoice.admissionNumber}</p>
                    <p className="text-sm font-mono text-slate-600">{selectedInvoice.class} {selectedInvoice.section}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-mono font-bold">{selectedInvoice.id}</p>
                    <Badge 
                      variant="outline" 
                      className={`font-mono ${getStatusColor(selectedInvoice.paymentStatus)}`}
                    >
                      {selectedInvoice.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="border-2 border-primary/20 rounded-lg p-4">
                <h4 className="font-mono font-medium mb-3">Fee Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between font-mono">
                    <span>Total Amount:</span>
                    <span className="font-bold">{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Amount Paid:</span>
                    <span className="text-green-600">{formatCurrency(selectedInvoice.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between font-mono border-t pt-2">
                    <span className="font-bold">Outstanding:</span>
                    <span className="font-bold text-red-600">{formatCurrency(selectedInvoice.amountDue)}</span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {selectedInvoice.paymentHistory.length > 0 && (
                <div className="border-2 border-primary/20 rounded-lg p-4">
                  <h4 className="font-mono font-medium mb-3">Payment History</h4>
                  <div className="space-y-2">
                    {selectedInvoice.paymentHistory.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
                        <div className="font-mono text-sm">
                          <div>{new Date(payment.date).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500">{payment.method.toUpperCase()} - {payment.reference}</div>
                        </div>
                        <div className="font-mono font-bold text-green-600">
                          {formatCurrency(payment.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button className="bg-primary hover:bg-primary/90 text-white font-mono">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
                <Button variant="outline" className="font-mono">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
                <Button variant="outline" className="font-mono">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Invoice Drawer */}
      {showNewInvoiceDrawer && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={handleCloseNewInvoiceDrawer}
          />
          
          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-slate-900 shadow-xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b-2 border-primary/20">
                <div>
                  <h2 className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                    {selectedStudent 
                      ? `New Invoice for ${allStudents.find(s => s.id === selectedStudent)?.name}`
                      : 'Create New Invoice'
                    }
                  </h2>
                  {selectedStudent && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-mono mt-1">
                      {allStudents.find(s => s.id === selectedStudent)?.admissionNumber} • {allStudents.find(s => s.id === selectedStudent)?.class} {allStudents.find(s => s.id === selectedStudent)?.section}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseNewInvoiceDrawer}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Student Selection (only if no student pre-selected) */}
                {!selectedStudent && (
                  <div className="space-y-3">
                    <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
                      <span className="text-xs font-mono uppercase tracking-wide text-primary">
                        Student Information
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Select Student *
                      </Label>
                      <Select value={newInvoiceForm.studentId} onValueChange={(value) => handleFormChange('studentId', value)}>
                        <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                          <SelectValue placeholder="Choose a student" />
                        </SelectTrigger>
                        <SelectContent>
                          {allStudents.map(student => (
                            <SelectItem key={student.id} value={student.id} className="font-mono">
                              <div className="flex flex-col">
                                <span>{student.name}</span>
                                <span className="text-xs text-slate-500">{student.admissionNumber} • {student.class} {student.section}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Invoice Details */}
                <div className="space-y-3">
                  <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
                    <span className="text-xs font-mono uppercase tracking-wide text-primary">
                      Invoice Details
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fee Type */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Fee Type *
                      </Label>
                      <Select value={newInvoiceForm.feeType} onValueChange={(value) => handleFormChange('feeType', value)}>
                        <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                          <SelectValue placeholder="Select fee type" />
                        </SelectTrigger>
                        <SelectContent>
                          {feeTypes.map(type => (
                            <SelectItem key={type} value={type} className="font-mono">
                              <div className="flex items-center gap-2">
                                {getFeeTypeIcon(type)}
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Amount (KES) *
                      </Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newInvoiceForm.amount}
                        onChange={(e) => handleFormChange('amount', e.target.value)}
                        className="border-primary/30 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Due Date *
                      </Label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type="date"
                          value={newInvoiceForm.dueDate}
                          onChange={(e) => handleFormChange('dueDate', e.target.value)}
                          className="pl-10 border-primary/30 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    {/* Term */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Term
                      </Label>
                      <Select value={newInvoiceForm.term} onValueChange={(value) => handleFormChange('term', value)}>
                        <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Term 1" className="font-mono">Term 1</SelectItem>
                          <SelectItem value="Term 2" className="font-mono">Term 2</SelectItem>
                          <SelectItem value="Term 3" className="font-mono">Term 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                      Description / Notes
                    </Label>
                    <Textarea
                      placeholder="Additional details about this fee..."
                      value={newInvoiceForm.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      className="border-primary/30 bg-white dark:bg-slate-900 font-mono"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Discount Section */}
                <div className="space-y-3">
                  <div className="inline-block w-fit px-3 py-1 bg-amber-50 border border-amber-200 rounded-md">
                    <span className="text-xs font-mono uppercase tracking-wide text-amber-700">
                      Discount (Optional)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Discount Amount */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Discount Amount (KES)
                      </Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newInvoiceForm.discountAmount}
                        onChange={(e) => handleFormChange('discountAmount', e.target.value)}
                        className="border-primary/30 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>

                    {/* Discount Reason */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Discount Reason
                      </Label>
                      <Input
                        placeholder="e.g., Scholarship, Sibling discount..."
                        value={newInvoiceForm.discountReason}
                        onChange={(e) => handleFormChange('discountReason', e.target.value)}
                        className="border-primary/30 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Invoice Summary */}
                {newInvoiceForm.amount && (
                  <div className="border-2 border-primary/20 rounded-lg p-4 bg-primary/5">
                    <h3 className="font-mono font-medium mb-3">Invoice Summary</h3>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="flex justify-between">
                        <span>Base Amount:</span>
                        <span>{formatCurrency(parseFloat(newInvoiceForm.amount) || 0)}</span>
                      </div>
                      {newInvoiceForm.discountAmount && (
                        <div className="flex justify-between text-amber-600">
                          <span>Discount:</span>
                          <span>-{formatCurrency(parseFloat(newInvoiceForm.discountAmount) || 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2 font-bold">
                        <span>Total Amount:</span>
                        <span>{formatCurrency((parseFloat(newInvoiceForm.amount) || 0) - (parseFloat(newInvoiceForm.discountAmount) || 0))}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t-2 border-primary/20 bg-slate-50 dark:bg-slate-800">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCloseNewInvoiceDrawer}
                    className="flex-1 font-mono"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitInvoice}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-mono"
                    disabled={!newInvoiceForm.feeType || !newInvoiceForm.amount || !newInvoiceForm.dueDate || (!selectedStudent && !newInvoiceForm.studentId)}
                  >
                    Create Invoice
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Reminder Drawer */}
      {showPaymentReminderDrawer && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowPaymentReminderDrawer(false)}
          />
          
          <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-slate-900 shadow-xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b-2 border-primary/20">
                <div>
                  <h2 className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                    Send Payment Reminder
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-mono mt-1">
                    {selectedStudent 
                      ? `For ${allStudents.find(s => s.id === selectedStudent)?.name}`
                      : `${reminderForm.studentIds.length} student(s) selected`
                    }
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPaymentReminderDrawer(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Reminder Settings */}
                <div className="space-y-3">
                  <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
                    <span className="text-xs font-mono uppercase tracking-wide text-primary">
                      Reminder Settings
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reminder Type */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Delivery Method *
                      </Label>
                      <Select value={reminderForm.reminderType} onValueChange={(value) => setReminderForm(prev => ({...prev, reminderType: value}))}>
                        <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email" className="font-mono">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email
                            </div>
                          </SelectItem>
                          <SelectItem value="sms" className="font-mono">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              SMS
                            </div>
                          </SelectItem>
                          <SelectItem value="phone" className="font-mono">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Phone Call
                            </div>
                          </SelectItem>
                          <SelectItem value="both" className="font-mono">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email & SMS
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Urgency Level */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Urgency Level
                      </Label>
                      <Select value={reminderForm.urgencyLevel} onValueChange={(value) => setReminderForm(prev => ({...prev, urgencyLevel: value}))}>
                        <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal" className="font-mono">Normal</SelectItem>
                          <SelectItem value="urgent" className="font-mono">Urgent</SelectItem>
                          <SelectItem value="final_notice" className="font-mono">Final Notice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Include Invoice Details */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeDetails" 
                      checked={reminderForm.includeInvoiceDetails}
                      onCheckedChange={(checked) => setReminderForm(prev => ({...prev, includeInvoiceDetails: checked as boolean}))}
                    />
                    <Label htmlFor="includeDetails" className="text-sm font-mono">
                      Include detailed invoice breakdown
                    </Label>
                  </div>
                </div>

                {/* Message Content */}
                <div className="space-y-3">
                  <div className="inline-block w-fit px-3 py-1 bg-blue-50 border border-blue-200 rounded-md">
                    <span className="text-xs font-mono uppercase tracking-wide text-blue-700">
                      Message Content
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                      Custom Message
                    </Label>
                    <Textarea
                      placeholder="Dear parent/guardian, this is a gentle reminder..."
                      value={reminderForm.message}
                      onChange={(e) => setReminderForm(prev => ({...prev, message: e.target.value}))}
                      className="border-primary/30 bg-white dark:bg-slate-900 font-mono"
                      rows={4}
                    />
                    <p className="text-xs text-slate-500 font-mono">
                      Leave blank to use default template
                    </p>
                  </div>
                </div>

                {/* Scheduling */}
                <div className="space-y-3">
                  <div className="inline-block w-fit px-3 py-1 bg-green-50 border border-green-200 rounded-md">
                    <span className="text-xs font-mono uppercase tracking-wide text-green-700">
                      Scheduling
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Scheduled Date */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Send Date (Optional)
                      </Label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type="datetime-local"
                          value={reminderForm.scheduledDate}
                          onChange={(e) => setReminderForm(prev => ({...prev, scheduledDate: e.target.value}))}
                          className="pl-10 border-primary/30 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                      <p className="text-xs text-slate-500 font-mono">
                        Leave blank to send immediately
                      </p>
                    </div>

                    {/* Follow-up Days */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Follow-up After (Days)
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={reminderForm.followUpDays}
                        onChange={(e) => setReminderForm(prev => ({...prev, followUpDays: e.target.value}))}
                        className="border-primary/30 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t-2 border-primary/20 bg-slate-50 dark:bg-slate-800">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentReminderDrawer(false)}
                    className="flex-1 font-mono"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReminder}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-mono"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Drawer */}
      {showRecordPaymentDrawer && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowRecordPaymentDrawer(false)}
          />
          
          <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-slate-900 shadow-xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b-2 border-primary/20">
                <div>
                  <h2 className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                    Record Payment
                  </h2>
                  {selectedStudent && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-mono mt-1">
                      For {allStudents.find(s => s.id === selectedStudent)?.name}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRecordPaymentDrawer(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Invoice Selection */}
                <div className="space-y-3">
                  <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
                    <span className="text-xs font-mono uppercase tracking-wide text-primary">
                      Invoice Information
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                      Select Invoice *
                    </Label>
                    <Select value={paymentForm.invoiceId} onValueChange={(value) => setPaymentForm(prev => ({...prev, invoiceId: value}))}>
                      <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                        <SelectValue placeholder="Choose an invoice" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredInvoices
                          .filter((inv: FeeInvoice) => selectedStudent ? inv.studentId === selectedStudent : true)
                          .filter((inv: FeeInvoice) => inv.paymentStatus !== 'paid')
                          .map((invoice: FeeInvoice) => (
                          <SelectItem key={invoice.id} value={invoice.id} className="font-mono">
                            <div className="flex flex-col">
                              <span>{invoice.feeType.toUpperCase()} - {formatCurrency(invoice.amountDue)}</span>
                              <span className="text-xs text-slate-500">Due: {invoice.dueDate} • {invoice.studentName}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-3">
                  <div className="inline-block w-fit px-3 py-1 bg-green-50 border border-green-200 rounded-md">
                    <span className="text-xs font-mono uppercase tracking-wide text-green-700">
                      Payment Details
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amount Paid */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Amount Paid (KES) *
                      </Label>
                      <div className="relative">
                        <Banknote className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={paymentForm.amountPaid}
                          onChange={(e) => setPaymentForm(prev => ({...prev, amountPaid: e.target.value}))}
                          className="pl-10 border-primary/30 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    {/* Payment Date */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Payment Date *
                      </Label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type="date"
                          value={paymentForm.paymentDate}
                          onChange={(e) => setPaymentForm(prev => ({...prev, paymentDate: e.target.value}))}
                          className="pl-10 border-primary/30 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Payment Method *
                      </Label>
                      <Select value={paymentForm.paymentMethod} onValueChange={(value) => setPaymentForm(prev => ({...prev, paymentMethod: value}))}>
                        <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash" className="font-mono">
                            <div className="flex items-center gap-2">
                              <Banknote className="h-4 w-4" />
                              Cash
                            </div>
                          </SelectItem>
                          <SelectItem value="bank" className="font-mono">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Bank Transfer
                            </div>
                          </SelectItem>
                          <SelectItem value="online" className="font-mono">
                            <div className="flex items-center gap-2">
                              <Wallet className="h-4 w-4" />
                              Online Payment
                            </div>
                          </SelectItem>
                          <SelectItem value="cheque" className="font-mono">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Cheque
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Reference Number */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Reference Number
                      </Label>
                      <Input
                        placeholder="Transaction ID, cheque no., etc."
                        value={paymentForm.referenceNumber}
                        onChange={(e) => setPaymentForm(prev => ({...prev, referenceNumber: e.target.value}))}
                        className="border-primary/30 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  {/* Partial Payment Toggle */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="partialPayment" 
                      checked={paymentForm.partialPayment}
                      onCheckedChange={(checked) => setPaymentForm(prev => ({...prev, partialPayment: checked as boolean}))}
                    />
                    <Label htmlFor="partialPayment" className="text-sm font-mono">
                      This is a partial payment
                    </Label>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                      Notes (Optional)
                    </Label>
                    <Textarea
                      placeholder="Additional notes about this payment..."
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm(prev => ({...prev, notes: e.target.value}))}
                      className="border-primary/30 bg-white dark:bg-slate-900 font-mono"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t-2 border-primary/20 bg-slate-50 dark:bg-slate-800">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowRecordPaymentDrawer(false)}
                    className="flex-1 font-mono"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitPayment}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-mono"
                    disabled={!paymentForm.invoiceId || !paymentForm.amountPaid || !paymentForm.paymentDate || !paymentForm.paymentMethod}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Plan Drawer */}
      {showPaymentPlanDrawer && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowPaymentPlanDrawer(false)}
          />
          
          <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-slate-900 shadow-xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b-2 border-primary/20">
                <div>
                  <h2 className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                    Create Payment Plan
                  </h2>
                  {selectedStudent && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-mono mt-1">
                      For {allStudents.find(s => s.id === selectedStudent)?.name} • Outstanding: {formatCurrency(parseFloat(paymentPlanForm.totalAmount) || 0)}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPaymentPlanDrawer(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Plan Overview */}
                <div className="space-y-3">
                  <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
                    <span className="text-xs font-mono uppercase tracking-wide text-primary">
                      Plan Overview
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Total Amount */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Total Amount (KES) *
                      </Label>
                      <div className="relative">
                        <Banknote className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type="number"
                          step="0.01"
                          value={paymentPlanForm.totalAmount}
                          onChange={(e) => setPaymentPlanForm(prev => ({...prev, totalAmount: e.target.value}))}
                          className="pl-10 border-primary/30 bg-white dark:bg-slate-900 font-mono"
                          disabled={!!selectedStudent} // Auto-filled for selected student
                        />
                      </div>
                    </div>

                    {/* Down Payment */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Down Payment (KES)
                      </Label>
                      <div className="relative">
                        <Banknote className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={paymentPlanForm.downPayment}
                          onChange={(e) => setPaymentPlanForm(prev => ({...prev, downPayment: e.target.value}))}
                          className="pl-10 border-primary/30 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Installment Details */}
                <div className="space-y-3">
                  <div className="inline-block w-fit px-3 py-1 bg-blue-50 border border-blue-200 rounded-md">
                    <span className="text-xs font-mono uppercase tracking-wide text-blue-700">
                      Installment Details
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Number of Installments */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Number of Installments *
                      </Label>
                      <Select value={paymentPlanForm.numberOfInstallments} onValueChange={(value) => setPaymentPlanForm(prev => ({...prev, numberOfInstallments: value}))}>
                        <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2, 3, 4, 5, 6, 8, 10, 12].map(num => (
                            <SelectItem key={num} value={num.toString()} className="font-mono">
                              {num} installments
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Frequency */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Payment Frequency *
                      </Label>
                      <Select value={paymentPlanForm.installmentFrequency} onValueChange={(value) => setPaymentPlanForm(prev => ({...prev, installmentFrequency: value}))}>
                        <SelectTrigger className="border-primary/30 bg-white dark:bg-slate-900 font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly" className="font-mono">Weekly</SelectItem>
                          <SelectItem value="bi-weekly" className="font-mono">Bi-weekly</SelectItem>
                          <SelectItem value="monthly" className="font-mono">Monthly</SelectItem>
                          <SelectItem value="quarterly" className="font-mono">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        First Payment Date *
                      </Label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type="date"
                          value={paymentPlanForm.startDate}
                          onChange={(e) => setPaymentPlanForm(prev => ({...prev, startDate: e.target.value}))}
                          className="pl-10 border-primary/30 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    {/* Late Payment Fee */}
                    <div className="space-y-2">
                      <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                        Late Payment Fee (KES)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={paymentPlanForm.latePaymentFee}
                        onChange={(e) => setPaymentPlanForm(prev => ({...prev, latePaymentFee: e.target.value}))}
                        className="border-primary/30 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  {/* Auto Reminders */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="autoReminders" 
                      checked={paymentPlanForm.autoReminders}
                      onCheckedChange={(checked) => setPaymentPlanForm(prev => ({...prev, autoReminders: checked as boolean}))}
                    />
                    <Label htmlFor="autoReminders" className="text-sm font-mono">
                      Send automatic reminders before due dates
                    </Label>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300">
                      Plan Description
                    </Label>
                    <Textarea
                      placeholder="Additional terms and conditions..."
                      value={paymentPlanForm.description}
                      onChange={(e) => setPaymentPlanForm(prev => ({...prev, description: e.target.value}))}
                      className="border-primary/30 bg-white dark:bg-slate-900 font-mono"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Payment Schedule Preview */}
                {paymentPlanForm.totalAmount && paymentPlanForm.numberOfInstallments && (
                  <div className="border-2 border-primary/20 rounded-lg p-4 bg-primary/5">
                    <h3 className="font-mono font-medium mb-3">Payment Schedule Preview</h3>
                    <div className="space-y-2 font-mono text-sm">
                      {paymentPlanForm.downPayment && (
                        <div className="flex justify-between">
                          <span>Down Payment:</span>
                          <span className="font-bold">{formatCurrency(parseFloat(paymentPlanForm.downPayment) || 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Amount to be Financed:</span>
                        <span>{formatCurrency((parseFloat(paymentPlanForm.totalAmount) || 0) - (parseFloat(paymentPlanForm.downPayment) || 0))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Per Installment:</span>
                        <span className="font-bold">
                          {formatCurrency(((parseFloat(paymentPlanForm.totalAmount) || 0) - (parseFloat(paymentPlanForm.downPayment) || 0)) / parseInt(paymentPlanForm.numberOfInstallments))}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Frequency:</span>
                        <span>{paymentPlanForm.installmentFrequency}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t-2 border-primary/20 bg-slate-50 dark:bg-slate-800">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentPlanDrawer(false)}
                    className="flex-1 font-mono"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitPaymentPlan}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-mono"
                    disabled={!paymentPlanForm.totalAmount || !paymentPlanForm.numberOfInstallments || !paymentPlanForm.startDate}
                  >
                    <CalendarClock className="h-4 w-4 mr-2" />
                    Create Payment Plan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 