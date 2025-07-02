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
  Wallet
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

  return (
    <div className="flex min-h-screen">
      {/* Search Sidebar */}
      <div className="w-80 border-r-2 border-primary/20 bg-primary/5 p-6 space-y-6 sticky top-0 h-screen overflow-y-auto">
        {/* Search Header */}
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

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-8">
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
                  <Button variant="outline" className="font-mono">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Payment Reminder
                  </Button>
                  <Button variant="outline" className="font-mono">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                  <Button variant="outline" className="font-mono">
                    <Calendar className="h-4 w-4 mr-2" />
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
    </div>
  )
} 