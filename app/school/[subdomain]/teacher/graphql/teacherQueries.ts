// GraphQL teacher queries

export const SEARCH_TEACHERS_BY_NAME = `
  query SearchTeachersByName($name: String!) {
    searchTeachersByName(input: {
      name: $name
    }) {
      teachers {
        id
        fullName
        firstName
        lastName
        email
        gender
        department
        phoneNumber
        role
        isActive
        user {
          id
          name
          email
        }
        tenantSubjects {
          id
          subjectType
          subject {
            id
            name
          }
          customSubject {
            id
            name
          }
        }
        tenantGradeLevels {
          id
          shortName
          gradeLevel {
            id
            name
          }
        }
      }
      count
    }
  }
`;

export interface SearchTeachersByNameResponse {
  searchTeachersByName: {
    teachers: GraphQLTeacher[];
    count: number;
  };
}

export interface GraphQLTeacher {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  department: string | null;
  phoneNumber: string | null;
  role: string;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
  tenantSubjects: Array<{
    id: string;
    subjectType: string;
    subject?: {
      id: string;
      name: string;
    };
    customSubject?: {
      id: string;
      name: string;
    };
  }>;
  tenantGradeLevels: Array<{
    id: string;
    shortName: string;
    gradeLevel: {
      id: string;
      name: string;
    };
  }>;
}
