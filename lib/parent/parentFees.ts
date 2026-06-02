import { chatGraphqlFetch } from '@/lib/chat/graphql'

export type ParentPaymentStatus =
  | 'CLEARED'
  | 'PARTIAL'
  | 'IN_ARREARS'
  | 'NO_FEES'

export interface ParentFeeItem {
  id: string
  itemName?: string | null
  bucketName: string
  amount: number
  amountPaid: number
  balance: number
  isMandatory: boolean
}

export interface ParentFeeBalance {
  studentId: string
  totalDue: number
  totalPaid: number
  feesOwed: number
  items: ParentFeeItem[]
}

export interface ParentFeePlanBreakdown {
  feeStructureName: string
  academicYearName: string
  termName: string
  totalBilled: number
  totalPaid: number
  arrears: number
}

export interface ParentPaymentRecord {
  id: string
  receiptNumber: string
  amount: number
  paymentMethod?: string | null
  transactionReference?: string | null
  paymentDate: string
  notes?: string | null
  invoice?: {
    id: string
    invoiceNumber: string
    term?: { name?: string | null } | null
    academicYear?: { name?: string | null } | null
  } | null
}

export interface ParentReceiptRecord {
  id: string
  receiptNumber: string
  amount: number
  receiptDate: string
  paymentId: string
  payment?: {
    id: string
    paymentMethod?: string | null
    transactionReference?: string | null
    paymentDate: string
  } | null
}

export interface ParentChildFeeOverview {
  studentId: string
  studentName?: string | null
  balance: ParentFeeBalance
  outstanding: number
  creditBalance: number
  totalBilled: number
  totalPaid: number
  paymentStatus: ParentPaymentStatus
  byPlan: ParentFeePlanBreakdown[]
  recentPayments: ParentPaymentRecord[]
}

export interface ParentConsolidatedFees {
  totalOutstanding: number
  totalCredit: number
  totalBilled: number
  totalPaid: number
  children: ParentChildFeeOverview[]
}

const CHILD_FEE_OVERVIEW = `
  query ChildFeeOverview($studentId: ID!) {
    childFeeOverview(studentId: $studentId) {
      studentId
      studentName
      outstanding
      creditBalance
      totalBilled
      totalPaid
      paymentStatus
      balance {
        studentId
        totalDue
        totalPaid
        feesOwed
        items {
          id
          itemName
          bucketName
          amount
          amountPaid
          balance
          isMandatory
        }
      }
      byPlan {
        feeStructureName
        academicYearName
        termName
        totalBilled
        totalPaid
        arrears
      }
      recentPayments {
        id
        receiptNumber
        amount
        paymentMethod
        transactionReference
        paymentDate
      }
    }
  }
`

const MY_CHILDREN_FEE_SUMMARY = `
  query MyChildrenFeeSummary {
    myChildrenFeeSummary {
      totalOutstanding
      totalCredit
      totalBilled
      totalPaid
      children {
        studentId
        studentName
        outstanding
        creditBalance
        totalBilled
        totalPaid
        paymentStatus
      }
    }
  }
`

const CHILD_PAYMENT_HISTORY = `
  query ChildPaymentHistory($studentId: ID!) {
    childPaymentHistory(studentId: $studentId) {
      id
      receiptNumber
      amount
      paymentMethod
      transactionReference
      paymentDate
      notes
      invoice {
        id
        invoiceNumber
        term { name }
        academicYear { name }
      }
    }
  }
`

const CHILD_RECEIPTS = `
  query ChildReceipts($studentId: ID!) {
    childReceipts(studentId: $studentId) {
      id
      receiptNumber
      amount
      receiptDate
      paymentId
      payment {
        id
        paymentMethod
        transactionReference
        paymentDate
      }
    }
  }
`

const CHILD_RECEIPT_PDF = `
  mutation ChildReceiptPdf($studentId: ID!, $paymentId: ID!) {
    childReceiptPdf(studentId: $studentId, paymentId: $paymentId)
  }
`

export async function fetchChildFeeOverview(
  subdomain: string,
  studentId: string,
): Promise<ParentChildFeeOverview> {
  const data = await chatGraphqlFetch<{ childFeeOverview: ParentChildFeeOverview }>(
    CHILD_FEE_OVERVIEW,
    { studentId },
    subdomain,
  )
  return data.childFeeOverview
}

export async function fetchMyChildrenFeeSummary(
  subdomain: string,
): Promise<ParentConsolidatedFees> {
  const data = await chatGraphqlFetch<{ myChildrenFeeSummary: ParentConsolidatedFees }>(
    MY_CHILDREN_FEE_SUMMARY,
    {},
    subdomain,
  )
  return data.myChildrenFeeSummary
}

export async function fetchChildPaymentHistory(
  subdomain: string,
  studentId: string,
): Promise<ParentPaymentRecord[]> {
  const data = await chatGraphqlFetch<{ childPaymentHistory: ParentPaymentRecord[] }>(
    CHILD_PAYMENT_HISTORY,
    { studentId },
    subdomain,
  )
  return data.childPaymentHistory ?? []
}

export async function fetchChildReceipts(
  subdomain: string,
  studentId: string,
): Promise<ParentReceiptRecord[]> {
  const data = await chatGraphqlFetch<{ childReceipts: ParentReceiptRecord[] }>(
    CHILD_RECEIPTS,
    { studentId },
    subdomain,
  )
  return data.childReceipts ?? []
}

export async function fetchChildReceiptPdf(
  subdomain: string,
  studentId: string,
  paymentId: string,
): Promise<string> {
  const data = await chatGraphqlFetch<{ childReceiptPdf: string }>(
    CHILD_RECEIPT_PDF,
    { studentId, paymentId },
    subdomain,
  )
  return data.childReceiptPdf
}

export function formatParentPaymentStatus(status: ParentPaymentStatus): string {
  const labels: Record<ParentPaymentStatus, string> = {
    CLEARED: 'Cleared',
    PARTIAL: 'Partially Paid',
    IN_ARREARS: 'In Arrears',
    NO_FEES: 'No Fees Assigned',
  }
  return labels[status] ?? status
}

export function parentPaymentStatusBadgeClass(status: ParentPaymentStatus): string {
  switch (status) {
    case 'CLEARED':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
    case 'PARTIAL':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
    case 'IN_ARREARS':
      return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
}

export function formatPaymentMethodLabel(method?: string | null): string {
  if (!method) return '—'
  const normalized = method.toUpperCase().replace(/-/g, '_')
  const labels: Record<string, string> = {
    CASH: 'Cash',
    MPESA: 'M-Pesa',
    BANK: 'Bank Transfer',
    BANK_TRANSFER: 'Bank Transfer',
    CHEQUE: 'Cheque',
    CARD: 'Card',
    OTHER: 'Other',
  }
  return labels[normalized] ?? method
}

export function formatFeeDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-KE', { dateStyle: 'medium' })
}

export function downloadPdfDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(amount)
}
