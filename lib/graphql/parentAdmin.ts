export const GET_PARENT_BY_ID = `
  query GetParentById($parentId: String!) {
    getParentById(parentId: $parentId) {
      id
      name
      email
      phone
      address
      occupation
      isActive
      userId
      createdAt
      updatedAt
      students {
        id
        admissionNumber
        firstName
        lastName
        grade
        relationship
        isPrimary
      }
    }
  }
`;

export const ACTIVATE_PARENT_MUTATION = `
  mutation ActivateParent($input: ActivateParentInput!) {
    activateParent(input: $input) {
      success
      message
      email
    }
  }
`;

export const RESEND_PARENT_INVITATION_MUTATION = `
  mutation ResendParentInvitation($invitationId: String!) {
    resendParentInvitation(invitationId: $invitationId) {
      email
      name
      status
      createdAt
    }
  }
`;

export const ADMIN_CHILD_FEE_BALANCE_QUERY = `
  query AdminChildFeeBalance($studentId: String!) {
    adminChildFeeBalance(studentId: $studentId) {
      studentId
      totalDue
      totalPaid
      feesOwed
      items {
        id
        bucketName
        itemName
        amount
        amountPaid
        balance
        isMandatory
      }
    }
  }
`;

export const ADD_STUDENTS_TO_PARENT_MUTATION = `
  mutation AddStudentsToParent(
    $parentId: String!
    $studentIds: [String!]!
    $tenantId: String!
  ) {
    addStudentsToParent(
      parentId: $parentId
      studentIds: $studentIds
      tenantId: $tenantId
    )
  }
`;

export const SEARCH_AVAILABLE_STUDENTS_FOR_PARENT = `
  query SearchAvailableStudentsForParent(
    $parentId: String!
    $tenantId: String!
    $searchTerm: String
  ) {
    searchAvailableStudentsForParent(
      parentId: $parentId
      tenantId: $tenantId
      searchTerm: $searchTerm
    ) {
      id
      name
      admissionNumber
      grade
      phone
    }
  }
`;

export { graphqlRequest } from "./teacherAdmin";
