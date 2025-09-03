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
    name: graphqlStudent.name,
    type: 'student',
    email: '', // Not available in this simplified API response
    phone: graphqlStudent.phone || undefined,
    grade: graphqlStudent.grade || undefined,
    class: graphqlStudent.streamId || undefined, // streamId is just an ID string
    status: 'active', // Default to active since isActive is not available
    admissionNumber: graphqlStudent.admissionNumber,
    gender: '', // Not available in this simplified API response
    feesOwed: 0, // Not available in this simplified API response
    totalFeesPaid: 0 // Not available in this simplified API response
  };
}
