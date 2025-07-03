// GraphQL API Teacher type
export interface GraphQLTeacher {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  department: string;
  address: string;
  subject: string;
  employeeId: string;
  dateOfBirth: string | null;
  isActive: boolean;
  hasCompletedProfile: boolean;
  userId: string | null;
}

export interface TeachersResponse {
  getTeachersByTenant: GraphQLTeacher[];
}

// Extended teacher interface for UI components
export interface Teacher {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  department: string;
  address: string;
  subject: string;
  employeeId: string;
  dateOfBirth: string | null;
  isActive: boolean;
  hasCompletedProfile: boolean;
  userId: string | null;
  // Additional fields that might be useful for UI
  phone?: string;
  status?: 'active' | 'inactive';
  joinDate?: string;
  subjects?: string[];
} 