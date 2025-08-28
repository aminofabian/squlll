import { FeeInvoice, PaymentPlan, FeeStructure, Grade } from '../types'

// Mock fee data
export const mockFeeInvoices: FeeInvoice[] = [
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
export const mockPaymentPlans: PaymentPlan[] = [
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
