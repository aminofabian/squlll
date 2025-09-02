// GraphQL student queries

export const SEARCH_STUDENTS_BY_NAME = `
  query SearchStudentsByName($name: String!, $tenantId: String!) {
    searchStudentsByName(name: $name, tenantId: $tenantId) {
      id
      admission_number
      phone
      gender
      feesOwed
      totalFeesPaid
      isActive
      user {
        id
        name
        email
      }
      grade {
        id
        shortName
        gradeLevel {
          id
          name
        }
      }
      stream {
        id
        name
      }
    }
  }
`;

export interface SearchStudentsByNameResponse {
  searchStudentsByName: GraphQLStudent[];
}

export interface GraphQLStudent {
  id: string;
  admission_number: string;
  phone: string | null;
  gender: 'MALE' | 'FEMALE' | string;
  feesOwed: number;
  totalFeesPaid: number;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
  grade: {
    id: string;
    shortName: string | null;
    gradeLevel: {
      id: string;
      name: string;
    };
  } | null;
  stream: {
    id: string;
    name: string;
  } | null;
}
