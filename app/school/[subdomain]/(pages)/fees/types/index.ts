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

// Form types
export interface NewInvoiceForm {
  studentId: string
  feeType: string
  amount: string
  dueDate: string
  term: string
  academicYear: string
  description: string
  discountAmount: string
  discountReason: string
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
