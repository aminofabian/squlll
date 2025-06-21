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

export interface Grade {
  id: string;
  name: string;
  level: EducationLevel;
  students: Student[];
}

export type EducationLevel = 'preschool' | 'primary' | 'junior-secondary' | 'senior-secondary';
