export interface ParentInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  invitedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

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

// Education level type for filtering
export type EducationLevel = 'preschool' | 'primary' | 'junior-secondary' | 'senior-secondary' | 'all';

export interface Grade {
  id: string
  name: string
  displayName: string
  level: EducationLevel
  ageGroup: string
  students: number
  classes: number
}
