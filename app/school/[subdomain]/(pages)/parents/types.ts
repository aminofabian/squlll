export interface Parent {
  id: string
  name: string
  email: string
  phone: string
  relationship: 'father' | 'mother' | 'guardian' | 'other'
  occupation: string
  workAddress?: string
  homeAddress: string
  emergencyContact?: string
  idNumber?: string
  students: StudentOfParent[]
  status: 'active' | 'inactive' | 'pending'
  registrationDate: string
  lastContact?: string
  communicationPreferences: {
    sms: boolean
    email: boolean
    whatsapp: boolean
  }
  feeStatus?: {
    totalOwed: number
    lastPayment?: string
    paymentMethod?: string
  }
}

export interface StudentOfParent {
  id: string
  name: string
  grade: string
  class?: string
  stream?: string
  admissionNumber: string
}

export interface Grade {
  id: string
  name: string
  displayName: string
  level: string
  ageGroup: string
  students: number
  classes: number
}
