// GraphQL student queries

export const SEARCH_STUDENTS_BY_NAME = `
  query SearchStudentsByName($name: String!, $tenantId: String!) {
    searchStudentsByName(name: $name, tenantId: $tenantId) {
      id
      name
      admissionNumber
      grade
      phone
      streamId
    }
  }
`;

export interface SearchStudentsByNameResponse {
  searchStudentsByName: GraphQLStudent[];
}

export interface GraphQLStudent {
  id: string;
  name: string;
  admissionNumber: string;
  grade: string;
  phone: string | null;
  streamId: string | null;
}
