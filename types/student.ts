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
  phone: string;
  tenantId: string;
  user: {
    email: string;
  };
}

export interface StudentsResponse {
  students: GraphQLStudent[];
}

export interface Grade {
  id: string;
  name: string;
  level: EducationLevel;
  students: Student[];
}

export type EducationLevel = 'preschool' | 'primary' | 'junior-secondary' | 'senior-secondary';
