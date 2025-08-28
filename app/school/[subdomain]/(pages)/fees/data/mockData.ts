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

// Mock Fee Structures
export const mockFeeStructures: FeeStructure[] = [
  {
    id: "FS-2024-001",
    name: "Grade 1 Day Student Fee Structure",
    grade: "Grade 1",
    boardingType: "day",
    academicYear: "2024",
    isActive: true,
    createdDate: "2024-01-01",
    lastModified: "2024-01-15",
    termStructures: [
      {
        id: "TS-001-T1",
        term: "Term 1",
        totalAmount: 35000,
        dueDate: "2024-02-15",
        latePaymentFee: 2000,
        earlyPaymentDiscount: 1500,
        earlyPaymentDeadline: "2024-02-01",
        buckets: [
          {
            id: "B-001-T1-TUI",
            type: "tuition",
            name: "Tuition & Academic Fees",
            description: "Core academic fees including tuition, activities, exams, and SMASSE",
            amount: 25000,
            isOptional: false,
            components: [
              { id: "C-001", name: "Tuition", description: "Core teaching fees", amount: 18000, category: "academic" },
              { id: "C-002", name: "Activity Fee", description: "Sports and extracurricular activities", amount: 3000, category: "activities" },
              { id: "C-003", name: "Exam Fee", description: "Assessment and examination costs", amount: 2500, category: "assessment" },
              { id: "C-004", name: "SMASSE", description: "Science, Mathematics and Technology Education", amount: 1500, category: "special_programs" }
            ]
          },
          {
            id: "B-001-T1-TRA",
            type: "transport",
            name: "Transport Services",
            description: "School bus transportation",
            amount: 8000,
            isOptional: true,
            components: [
              { id: "C-005", name: "Bus Fee", description: "Daily transportation to and from school", amount: 8000, category: "transport" }
            ]
          },
          {
            id: "B-001-T1-MEA",
            type: "meals",
            name: "Lunch Program",
            description: "Daily lunch meals",
            amount: 2000,
            isOptional: true,
            components: [
              { id: "C-006", name: "Lunch Fee", description: "Daily nutritious lunch meals", amount: 2000, category: "meals" }
            ]
          }
        ]
      },
      {
        id: "TS-001-T2",
        term: "Term 2",
        totalAmount: 35000,
        dueDate: "2024-05-15",
        latePaymentFee: 2000,
        earlyPaymentDiscount: 1500,
        earlyPaymentDeadline: "2024-05-01",
        buckets: [
          {
            id: "B-001-T2-TUI",
            type: "tuition",
            name: "Tuition & Academic Fees",
            description: "Core academic fees including tuition, activities, exams, and SMASSE",
            amount: 25000,
            isOptional: false,
            components: [
              { id: "C-007", name: "Tuition", description: "Core teaching fees", amount: 18000, category: "academic" },
              { id: "C-008", name: "Activity Fee", description: "Sports and extracurricular activities", amount: 3000, category: "activities" },
              { id: "C-009", name: "Exam Fee", description: "Assessment and examination costs", amount: 2500, category: "assessment" },
              { id: "C-010", name: "SMASSE", description: "Science, Mathematics and Technology Education", amount: 1500, category: "special_programs" }
            ]
          },
          {
            id: "B-001-T2-TRA",
            type: "transport",
            name: "Transport Services",
            description: "School bus transportation",
            amount: 8000,
            isOptional: true,
            components: [
              { id: "C-011", name: "Bus Fee", description: "Daily transportation to and from school", amount: 8000, category: "transport" }
            ]
          },
          {
            id: "B-001-T2-MEA",
            type: "meals",
            name: "Lunch Program",
            description: "Daily lunch meals",
            amount: 2000,
            isOptional: true,
            components: [
              { id: "C-012", name: "Lunch Fee", description: "Daily nutritious lunch meals", amount: 2000, category: "meals" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "FS-2024-002",
    name: "Form 2 Boarding Student Fee Structure",
    grade: "Form 2",
    boardingType: "boarding",
    academicYear: "2024",
    isActive: true,
    createdDate: "2024-01-01",
    lastModified: "2024-01-15",
    termStructures: [
      {
        id: "TS-002-T1",
        term: "Term 1",
        totalAmount: 65000,
        dueDate: "2024-02-15",
        latePaymentFee: 3000,
        earlyPaymentDiscount: 2500,
        earlyPaymentDeadline: "2024-02-01",
        buckets: [
          {
            id: "B-002-T1-TUI",
            type: "tuition",
            name: "Tuition & Academic Fees",
            description: "Core academic fees including tuition, activities, exams, and SMASSE",
            amount: 35000,
            isOptional: false,
            components: [
              { id: "C-013", name: "Tuition", description: "Core teaching fees", amount: 25000, category: "academic" },
              { id: "C-014", name: "Activity Fee", description: "Sports and extracurricular activities", amount: 4000, category: "activities" },
              { id: "C-015", name: "Exam Fee", description: "Assessment and examination costs", amount: 3500, category: "assessment" },
              { id: "C-016", name: "SMASSE", description: "Science, Mathematics and Technology Education", amount: 2500, category: "special_programs" }
            ]
          },
          {
            id: "B-002-T1-BOA",
            type: "boarding",
            name: "Boarding & Accommodation",
            description: "Dormitory accommodation and boarding services",
            amount: 30000,
            isOptional: false,
            components: [
              { id: "C-017", name: "Accommodation", description: "Dormitory bed and facilities", amount: 20000, category: "accommodation" },
              { id: "C-018", name: "Meals", description: "Three daily meals and snacks", amount: 8000, category: "meals" },
              { id: "C-019", name: "Utilities", description: "Water, electricity, and maintenance", amount: 2000, category: "utilities" }
            ]
          }
        ]
      }
    ]
  }
]

// Mock Grades/Classes
export const mockGrades: Grade[] = [
  {
    id: "GR-001",
    name: "Grade 1",
    level: 1,
    section: "A",
    boardingType: "day",
    feeStructureId: "FS-2024-001",
    studentCount: 25,
    isActive: true
  },
  {
    id: "GR-002",
    name: "Grade 1",
    level: 1,
    section: "B",
    boardingType: "day",
    feeStructureId: "FS-2024-001",
    studentCount: 23,
    isActive: true
  },
  {
    id: "GR-003",
    name: "Form 2",
    level: 10,
    section: "A",
    boardingType: "boarding",
    feeStructureId: "FS-2024-002",
    studentCount: 30,
    isActive: true
  },
  {
    id: "GR-004",
    name: "Form 2",
    level: 10,
    section: "B",
    boardingType: "day",
    feeStructureId: undefined,
    studentCount: 28,
    isActive: true
  },
  {
    id: "GR-005",
    name: "Form 4",
    level: 12,
    section: "A",
    boardingType: "both",
    feeStructureId: undefined,
    studentCount: 35,
    isActive: true
  }
]
