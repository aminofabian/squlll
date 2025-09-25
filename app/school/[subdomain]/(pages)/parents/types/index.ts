// Parent types for the parents page
export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: 'father' | 'mother' | 'guardian' | 'other';
  occupation: string;
  workAddress?: string;
  homeAddress: string;
  emergencyContact?: string;
  idNumber?: string; // National ID for Kenya
  students: {
    id: string;
    name: string;
    grade: string;
    class?: string;
    stream?: string;
    admissionNumber: string;
  }[];
  status: 'active' | 'inactive' | 'pending';
  registrationDate: string;
  lastContact?: string;
  communicationPreferences: {
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  feeStatus?: {
    totalOwed: number;
    lastPayment?: string;
    paymentMethod?: string;
  };
};

// Education level type for filtering
export type EducationLevel = 'preschool' | 'primary' | 'junior-secondary' | 'senior-secondary' | 'all';

// Grade type for filtering
export interface Grade {
  id: string;
  name: string;
  displayName: string;
  level: EducationLevel;
  ageGroup: string;
  students: number;
  classes: number;
}

export type ParentInvitation = {
  id: string;
  email: string;
  role: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  createdAt: string;
  invitedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export interface PendingParentInvitationsResponse {
  data: {
    getPendingParentInvitations: ParentInvitation[];
  };
}
