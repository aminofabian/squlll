import { Student, transformGraphQLStudentToStudent } from "../types/studentTypes";
import { Teacher, transformGraphQLTeacherToTeacher } from "../types/teacherTypes";

// GraphQL query to fetch both students and teachers by tenant
export const GET_BOTH_STUDENTS_AND_TEACHERS_BY_TENANT = `
  query GetBothStudentsAndTeachersByTenant {
    getBothStudentsAndTeachersByTenant {
      students {
        id
        admission_number
        user {
          id
          name
        }
        grade {
          id
          shortName
        }
      }
      teachers {
        id
        fullName
        department
        role
      }
      totalCount
    }
  }
`;

// GraphQL response interface
export interface GraphQLStudent {
  id: string;
  admission_number: string;
  user: {
    id: string;
    name: string;
  };
  grade: {
    id: string;
    shortName: string | null;
  };
}

export interface GraphQLTeacher {
  id: string;
  fullName: string;
  department: string;
  role: string;
}

export interface GetBothStudentsAndTeachersByTenantResponse {
  getBothStudentsAndTeachersByTenant: {
    students: GraphQLStudent[];
    teachers: GraphQLTeacher[];
    totalCount: number;
  };
}

// Transform function for combined response
export function transformCombinedResponse(data: GetBothStudentsAndTeachersByTenantResponse): {
  students: Student[];
  teachers: Teacher[];
  totalCount: number;
} {
  const { students: graphqlStudents, teachers: graphqlTeachers, totalCount } = data.getBothStudentsAndTeachersByTenant;
  
  // Transform students
  const students = graphqlStudents.map((student: GraphQLStudent) => {
    return {
      id: student.id,
      name: student.user.name,
      type: 'student' as const,
      email: '', // These fields are not present in this query response
      phone: undefined,
      admissionNumber: student.admission_number,
      grade: student.grade?.shortName || '',
      class: '',
      status: 'active' as const,
      gender: '',
      feesOwed: 0,
      totalFeesPaid: 0
    } as Student;
  });
  
  // Transform teachers
  const teachers = graphqlTeachers.map((teacher: GraphQLTeacher) => {
    return {
      id: teacher.id,
      name: teacher.fullName,
      type: 'teacher' as const,
      email: '', // These fields are not present in this query response
      phone: undefined,
      department: teacher.department,
      role: teacher.role || '',
      status: 'active' as const,
      isActive: true,
      subjects: [] // Add required fields
    } as Teacher;
  });
  
  return { students, teachers, totalCount };
}
