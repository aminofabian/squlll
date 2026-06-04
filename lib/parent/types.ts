export interface ParentPortalChild {
  /** Legacy numeric id used by existing UI components (index + 1). */
  id: number
  studentId: string
  gradeId: string
  name: string
  grade: string
  class: string
  avatar: string
  attendance: number
  currentGPA: number
  behavior: string
}

export interface ParentFeeBalance {
  studentId: string
  totalDue: number
  totalPaid: number
  feesOwed: number
  items: Array<{
    id: string
    itemName?: string | null
    bucketName: string
    amount: number
    amountPaid: number
    balance: number
  }>
}

export interface MyChildApi {
  id: string
  name: string
  admissionNumber: string
  gender: string
  relationship: string
  isPrimary: boolean
  phone: string
  isActive: boolean
  grade: {
    id: string
    name?: string | null
    shortName?: string | null
    gradeLevel?: { name?: string | null } | null
  }
}
