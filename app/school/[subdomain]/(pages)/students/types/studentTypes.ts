// Education level type
export type EducationLevel = 'preschool' | 'primary' | 'junior-secondary' | 'senior-secondary' | 'all';

// Grade type
export interface Grade {
  id: string;
  name: string;
  displayName: string;
  level: EducationLevel;
  ageGroup: string;
  students: number;
  classes: number;
}

// Kenya-specific student type (adapted from GraphQL data)
export type Student = {
  id: string;
  name: string;
  admissionNumber: string;
  photo?: string;
  gender: "male" | "female";
  class: string;
  stream?: string;
  grade: string;
  age: number;
  admissionDate: string;
  status: "active" | "inactive" | "transferred" | "graduated" | "suspended";
  contacts: {
    primaryGuardian: string;
    guardianPhone: string;
    guardianEmail?: string;
    homeAddress?: string;
  };
  academicDetails?: {
    averageGrade?: string;
    classRank?: number;
    streamRank?: number;
    yearRank?: number;
    kcpeScore?: number;
    kcsePrediction?: string;
  };
  feeStatus?: {
    currentBalance: number;
    lastPaymentDate: string;
    lastPaymentAmount: number;
    scholarshipPercentage?: number;
    paymentHistory?: Array<{
      date: string;
      amount: number;
      receiptNumber: string;
      paymentMethod: string;
    }>;
  };
  attendance?: {
    rate: string;
    absentDays: number;
    lateDays: number;
    trend: "improving" | "declining" | "stable";
  };
  healthInfo?: {
    bloodGroup?: string;
    knownConditions?: string[];
    emergencyContact?: string;
    nhifNumber?: string;
  };
  extraCurricular?: {
    clubs?: string[];
    sports?: string[];
    achievements?: string[];
    leadership?: string[];
  };
}; 