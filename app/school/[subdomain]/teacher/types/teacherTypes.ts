// Teacher types for UI components

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  department?: string;
  role?: string;
  isClassTeacher?: boolean;
  isActive?: boolean;
  subjects?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  gradeLevels?: Array<{
    id: string;
    name: string;
    shortName: string;
  }>;
}

// Transform GraphQL teacher response to UI-friendly format
export function transformGraphQLTeacherToTeacher(graphQLTeacher: any): Teacher {
  const subjects = [
    ...(graphQLTeacher.tenantSubjects || []).map((ts: any) => ({
      id: ts.id,
      name: ts.subject?.name || ts.customSubject?.name || 'Unknown Subject',
      type: ts.subjectType
    }))
  ];
  
  const gradeLevels = (graphQLTeacher.tenantGradeLevels || []).map((gl: any) => ({
    id: gl.id,
    name: gl.gradeLevel?.name || 'Unknown Grade',
    shortName: gl.shortName
  }));
  
  return {
    id: graphQLTeacher.id,
    name: graphQLTeacher.fullName || graphQLTeacher.user?.name || `${graphQLTeacher.firstName || ''} ${graphQLTeacher.lastName || ''}`.trim(),
    email: graphQLTeacher.email || graphQLTeacher.user?.email || '',
    phone: graphQLTeacher.phoneNumber,
    gender: graphQLTeacher.gender,
    department: graphQLTeacher.department,
    role: graphQLTeacher.role,
    isClassTeacher: graphQLTeacher.isClassTeacher,
    isActive: graphQLTeacher.isActive,
    subjects,
    gradeLevels
  };
}
