// GraphQL API Teacher type
export interface GraphQLTeacher {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  userId: string | null;
}

export interface TeachersResponse {
  getTeachersByTenant: GraphQLTeacher[];
}

// Extended teacher interface for UI components
export interface Teacher {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  userId: string | null;
  // Additional fields that might be useful for UI
  department?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  joinDate?: string;
  subjects?: string[];
} 