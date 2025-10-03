// Fee and Invoice types
export interface FeeInvoice {
  id: string
  studentId: string
  studentName: string
  admissionNumber: string
  class: string
  section: string
  feeType: 'tuition' | 'transport' | 'hostel' | 'exam' | 'library' | 'sports' | 'lab' | 'boarding' | 'meals'
  totalAmount: number
  amountPaid: number
  amountDue: number
  dueDate: string
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'partial'
  invoiceDate: string
  term: string
  academicYear: string
  paymentHistory: PaymentHistory[]
  discounts?: Discount[]
  remindersSent: number
  lastReminderDate?: string
}

export interface PaymentHistory {
  id: string
  date: string
  amount: number
  method: 'cash' | 'bank' | 'online' | 'cheque'
  reference?: string
  notes?: string
}

export interface Discount {
  type: string
  amount: number
  reason: string
}

// Payment Plan types
export interface PaymentPlan {
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

export interface PaymentInstallment {
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

// Student summary for sidebar
export interface StudentSummary {
  id: string
  name: string
  admissionNumber: string
  class: string
  section: string
  totalOutstanding: number
  totalPaid: number
  invoiceCount: number
  overdueCount: number
}

// New API Student Summary types
export interface FeeSummary {
  totalOwed: number
  totalPaid: number
  balance: number
  numberOfFeeItems: number
  feeItems: FeeItem[]
}

export interface FeeItem {
  id: string
  feeBucketName: string
  amount: number
  isMandatory: boolean
  feeStructureName: string
  academicYearName: string
}

export interface StudentSummaryFromAPI {
  id: string
  admissionNumber: string
  studentName: string
  gradeLevelName: string
  feeSummary: FeeSummary
}

// Detailed Student Summary from GraphQL
export interface StudentSummaryDetail {
  id: string
  admissionNumber: string
  studentName: string
  email: string
  phone: string
  gender: string
  schoolType: string
  gradeLevelName: string
  curriculumName: string
  streamName: string | null
  feeSummary: FeeSummary
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Form types
export interface NewInvoiceForm {
  studentId: string
  termId: string
  issueDate: string
  dueDate: string
  notes?: string
}

export interface PaymentReminderForm {
  studentIds: string[]
  reminderType: string
  message: string
  urgencyLevel: string
  includeInvoiceDetails: boolean
  scheduledDate: string
  followUpDays: string
}

export interface RecordPaymentForm {
  invoiceId: string
  studentId: string
  amountPaid: string
  paymentMethod: string
  paymentDate: string
  referenceNumber: string
  notes: string
  partialPayment: boolean
}

export interface PaymentPlanForm {
  studentId: string
  totalAmount: string
  downPayment: string
  numberOfInstallments: string
  installmentFrequency: string
  startDate: string
  description: string
  latePaymentFee: string
  autoReminders: boolean
}

// Summary stats
export interface SummaryStats {
  totalCollected: number
  totalOutstanding: number
  studentsWithPendingFees: number
  upcomingDueCount: number
  overdueCount: number
  collectionRate: number
}

// Fee Structure types
export interface FeeStructure {
  id: string
  name: string
  grade: string
  boardingType: 'day' | 'boarding' | 'both'
  academicYear: string
  isActive: boolean
  createdDate: string
  lastModified: string
  termStructures: TermFeeStructure[]
}

export interface TermFeeStructure {
  id: string
  term: 'Term 1' | 'Term 2' | 'Term 3'
  buckets: FeeBucket[]
  totalAmount: number
  dueDate: string
  latePaymentFee: number
  earlyPaymentDiscount?: number
  earlyPaymentDeadline?: string
}

export interface FeeBucket {
  id: string
  type: 'tuition' | 'transport' | 'meals' | 'boarding'
  name: string
  description: string
  amount: number
  isOptional: boolean
  components: FeeComponent[]
}

export interface FeeComponent {
  id: string
  name: string
  description: string
  amount: number
  category: string
}

// Grade and Class types
export interface Grade {
  id: string
  name: string
  level: number
  section: string
  boardingType: 'day' | 'boarding' | 'both'
  feeStructureId?: string
  studentCount: number
  isActive: boolean
}

// Fee Structure Forms
export interface FeeStructureForm {
  name: string
  grade: string
  boardingType: 'day' | 'boarding' | 'both'
  academicYear: string
  academicYearId?: string
  termStructures: TermFeeStructureForm[]
  // Add feeBuckets from the database
  feeBuckets?: any[] // Using any[] since the exact bucket type may vary
  schoolDetails?: {
    name: string
    address: string
    contact: string
    email: string
    principalName: string
    principalTitle: string
  }
  paymentModes?: {
    bankAccounts: BankAccount[]
    postalAddress: string
    notes: string[]
  }
}

export interface BankAccount {
  bankName: string
  branch: string
  accountNumber: string
}

export interface TermFeeStructureForm {
  term: string
  academicYear?: string
  dueDate: string
  latePaymentFee: string
  earlyPaymentDiscount: string
  earlyPaymentDeadline: string
  buckets: FeeBucketForm[]
  existingBucketAmounts?: { [bucketId: string]: string } // Amounts for existing buckets per term
}

export interface FeeBucketForm {
  id?: string // Server-generated ID for existing buckets
  type: 'tuition' | 'transport' | 'meals' | 'boarding'
  name: string
  description: string
  isOptional: boolean
  components: FeeComponentForm[]
}

export interface FeeComponentForm {
  name: string
  description: string
  amount: string
  category: string
}

// Invoice Generation types
export interface BulkInvoiceGeneration {
  feeStructureId: string
  term: 'Term 1' | 'Term 2' | 'Term 3'
  gradeIds: string[]
  studentIds?: string[]
  generateDate: string
  dueDate: string
  includeOptionalFees: boolean
  selectedBuckets: string[]
  customMessage?: string
}

export interface InvoiceTemplate {
  id: string
  name: string
  feeStructureId: string
  term: string
  buckets: string[]
  customizations: {
    headerMessage?: string
    footerMessage?: string
    paymentInstructions?: string
    latePaymentPolicy?: string
  }
}

// Fee Assignment types
export interface FeeAssignmentData {
  tenantId: string
  totalFeeAssignments: number
  totalStudentsWithFees: number
  feeAssignments: FeeAssignmentGroup[]
}

export interface FeeAssignmentGroup {
  feeAssignment: {
    id: string
    feeStructureId: string
    description: string
    studentsAssignedCount: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    feeStructure: {
      id: string
      name: string
    }
    assignedByUser: {
      id: string
      name: string
    }
  }
  studentAssignments: StudentAssignment[]
  totalStudents: number
}

export interface StudentAssignment {
  id: string
  studentId: string
  isActive: boolean
  createdAt: string
  student: {
    id: string
    user: {
      name: string
    }
    grade: {
      id: string
      gradeLevel: {
        id: string
        name: string
      }
    }
  }
  feeItems: FeeItemAssignment[]
}

export interface FeeItemAssignment {
  id: string
  amount: number
  isMandatory: boolean
  isActive: boolean
  feeStructureItem: {
    id: string
    amount: number
  }
}
