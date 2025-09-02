import { GraphQLStudent } from "../graphql/studentQueries";

// Interface for student data from GraphQL mapped to the Individual interface
export interface Student {
  id: string;
  name: string;
  type: 'student';
  email: string;
  phone?: string;
  avatar?: string;
  grade?: string;
  class?: string;
  status: 'active' | 'inactive';
  admissionNumber: string;
  gender: string;
  feesOwed: number;
  totalFeesPaid: number;
  isSelected?: boolean;
}

/**
 * Transforms a GraphQL student object to a Student object
 * that matches the Individual interface used in components
 */
export function transformGraphQLStudentToStudent(graphqlStudent: GraphQLStudent): Student {
  return {
    id: graphqlStudent.id,
    name: graphqlStudent.user.name,
    type: 'student',
    email: graphqlStudent.user.email,
    phone: graphqlStudent.phone || undefined,
    grade: graphqlStudent.grade?.gradeLevel?.name || undefined,
    class: graphqlStudent.stream?.name || undefined,
    status: graphqlStudent.isActive ? 'active' : 'inactive',
    admissionNumber: graphqlStudent.admission_number,
    gender: graphqlStudent.gender,
    feesOwed: graphqlStudent.feesOwed,
    totalFeesPaid: graphqlStudent.totalFeesPaid
  };
}
