export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  phone: string;
  status: 'active' | 'inactive' | 'suspended' | 'transferred';
  grade: Grade;
  admission_date: string;
  attendance: {
    trend: 'up' | 'down' | 'stable';
  };
  fees: {
    amount: number;
  };
  photo?: string;
}

// GraphQL API Student type
export interface GraphQLStudent {
  id: string;
  admission_number: string;
  user_id: string;
  feesOwed: number;
  gender: string;
  totalFeesPaid: number;
  createdAt: string;
  isActive: boolean;
  updatedAt: string;
  streamId: string | null;
  phone: string;
  grade: string | {
    id: string;
    gradeLevel: {
      id: string;
      name: string;
    };
  };
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface StudentsResponse {
  students: GraphQLStudent[];
}

// New API Student Summary types (from allStudentsSummary query)
export interface FeeSummary {
  totalOwed: number;
  totalPaid: number;
  balance: number;
  numberOfFeeItems: number;
}

export interface StudentSummaryData {
  id: string;
  admissionNumber: string;
  studentName: string;
  gradeLevelName: string;
  feeSummary: FeeSummary;
}

// Student Detail Summary (from studentSummary query)
export interface FeeItem {
  id: string;
  feeBucketName: string;
  amount: number;
  isMandatory: boolean;
  feeStructureName: string;
  academicYearName: string;
}

export interface DetailedFeeSummary extends FeeSummary {
  feeItems: FeeItem[];
}

export interface StudentDetailSummary {
  id: string;
  admissionNumber: string;
  studentName: string;
  email: string;
  phone: string;
  gender: string;
  schoolType: string;
  gradeLevelName: string;
  curriculumName: string;
  streamName: string | null;
  feeSummary: DetailedFeeSummary;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  id: string;
  name: string;
  level: EducationLevel;
  students: Student[];
}

export type EducationLevel = 'preschool' | 'primary' | 'junior-secondary' | 'senior-secondary';
