import { chatGraphqlFetch } from '@/lib/chat/graphql'

export type StudentPaymentStatus =
  | 'CLEARED'
  | 'PARTIAL'
  | 'IN_ARREARS'
  | 'NO_FEES'

export interface StudentFeeItem {
  id: string
  itemName?: string | null
  bucketName: string
  amount: number
  amountPaid: number
  balance: number
  isMandatory: boolean
}

export interface StudentFeeBalance {
  studentId: string
  totalDue: number
  totalPaid: number
  feesOwed: number
  items: StudentFeeItem[]
}

export interface StudentFeePlanBreakdown {
  feeStructureName: string
  academicYearName: string
  termName: string
  totalBilled: number
  totalPaid: number
  arrears: number
}

export interface StudentPaymentRecord {
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

export interface StudentReceiptRecord {
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

export interface StudentOutstandingInvoice {
  id: string
  invoiceNumber: string
  termName?: string | null
  academicYearName?: string | null
  dueDate?: string | null
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  status: string
}

export interface StudentFeeOverview {
  balance: StudentFeeBalance
  outstanding: number
  creditBalance: number
  totalBilled: number
  totalPaid: number
  paymentStatus: StudentPaymentStatus
  byPlan: StudentFeePlanBreakdown[]
  recentPayments: StudentPaymentRecord[]
  outstandingInvoices: StudentOutstandingInvoice[]
}

export interface MpesaCustodyAvailability {
  available: boolean
  custodyProvider: string
  platformDarajaEnabled: boolean
  reason?: string | null
}

export interface MpesaStkIntent {
  id: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | string
  amount: number
  phone: string
  checkoutRequestId?: string | null
  resultCode?: string | null
  resultDesc?: string | null
  mpesaReceipt?: string | null
  paymentId?: string | null
  invoiceId?: string | null
  createdAt: string
}

const MY_FEE_OVERVIEW = `
  query MyFeeOverview {
    myFeeOverview {
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
        notes
        invoice {
          id
          invoiceNumber
          term { name }
          academicYear { name }
        }
      }
      outstandingInvoices {
        id
        invoiceNumber
        termName
        academicYearName
        dueDate
        totalAmount
        paidAmount
        balanceAmount
        status
      }
    }
  }
`

const MY_PAYMENTS = `
  query MyPayments {
    myPayments {
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

const MY_RECEIPTS = `
  query MyReceipts {
    myReceipts {
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

const MY_RECEIPT_PDF = `
  mutation MyReceiptPdf($paymentId: ID!) {
    myReceiptPdf(paymentId: $paymentId)
  }
`

const MPESA_CUSTODY_AVAILABILITY = `
  query MpesaCustodyAvailability {
    mpesaCustodyAvailability {
      available
      custodyProvider
      platformDarajaEnabled
      reason
    }
  }
`

const INITIATE_MPESA_STK = `
  mutation InitiateMyMpesaStk($input: InitiateCustodyMpesaStkInput!) {
    initiateCustodyMpesaStk(input: $input) {
      id
      status
      amount
      phone
      checkoutRequestId
      resultCode
      resultDesc
      mpesaReceipt
      paymentId
      invoiceId
      createdAt
    }
  }
`

const MY_STK_INTENT = `
  query MyStkIntent($id: String!) {
    custodyMpesaStkIntent(id: $id) {
      id
      status
      amount
      phone
      resultCode
      resultDesc
      mpesaReceipt
      paymentId
      invoiceId
    }
  }
`

export async function fetchMyFeeOverview(
  subdomain: string,
): Promise<StudentFeeOverview> {
  const data = await chatGraphqlFetch<{ myFeeOverview: StudentFeeOverview }>(
    MY_FEE_OVERVIEW,
    {},
    subdomain,
  )
  return data.myFeeOverview
}

export async function fetchMyPayments(
  subdomain: string,
): Promise<StudentPaymentRecord[]> {
  const data = await chatGraphqlFetch<{ myPayments: StudentPaymentRecord[] }>(
    MY_PAYMENTS,
    {},
    subdomain,
  )
  return data.myPayments ?? []
}

export async function fetchMyReceipts(
  subdomain: string,
): Promise<StudentReceiptRecord[]> {
  const data = await chatGraphqlFetch<{ myReceipts: StudentReceiptRecord[] }>(
    MY_RECEIPTS,
    {},
    subdomain,
  )
  return data.myReceipts ?? []
}

export async function fetchMyReceiptPdf(
  subdomain: string,
  paymentId: string,
): Promise<string> {
  const data = await chatGraphqlFetch<{ myReceiptPdf: string }>(
    MY_RECEIPT_PDF,
    { paymentId },
    subdomain,
  )
  return data.myReceiptPdf
}

export async function fetchMpesaCustodyAvailability(
  subdomain: string,
): Promise<MpesaCustodyAvailability> {
  const data = await chatGraphqlFetch<{
    mpesaCustodyAvailability: MpesaCustodyAvailability
  }>(MPESA_CUSTODY_AVAILABILITY, {}, subdomain)
  return data.mpesaCustodyAvailability
}

/**
 * Fire a Lipa Na M-Pesa Express (STK) push to the student's phone for a
 * specific invoice. The student authorises it with their M-Pesa PIN.
 */
export async function initiateMyMpesaStk(
  subdomain: string,
  input: { invoiceId: string; amount: number; phone: string; notes?: string },
): Promise<MpesaStkIntent> {
  const data = await chatGraphqlFetch<{ initiateCustodyMpesaStk: MpesaStkIntent }>(
    INITIATE_MPESA_STK,
    { input },
    subdomain,
  )
  return data.initiateCustodyMpesaStk
}

export async function fetchMyStkIntent(
  subdomain: string,
  id: string,
): Promise<MpesaStkIntent> {
  const data = await chatGraphqlFetch<{ custodyMpesaStkIntent: MpesaStkIntent }>(
    MY_STK_INTENT,
    { id },
    subdomain,
  )
  return data.custodyMpesaStkIntent
}

export function formatStudentPaymentStatus(status: StudentPaymentStatus): string {
  const labels: Record<StudentPaymentStatus, string> = {
    CLEARED: 'Cleared',
    PARTIAL: 'Partially Paid',
    IN_ARREARS: 'In Arrears',
    NO_FEES: 'No Fees Assigned',
  }
  return labels[status] ?? status
}

export function paymentStatusBadgeClass(status: StudentPaymentStatus): string {
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
