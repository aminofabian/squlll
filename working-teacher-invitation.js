/**
 * Working version of a teacher invitation mutation
 * This has been crafted to match exactly what the GraphQL API expects
 */

// The GraphQL mutation
const mutation = `
mutation InviteTeacher($createTeacherDto: CreateTeacherInvitationDto!) {
  inviteTeacher(createTeacherDto: $createTeacherDto) {
    email
    fullName
    status
    createdAt
  }
}
`;

// Test data with all required fields and proper formatting
const variables = {
  "createTeacherDto": {
    // Required personal information
    "email": "tobiasbarakan@gmail.com",
    "fullName": "Mike Johnson",
    "firstName": "Mike",
    "lastName": "Johnson",
    "gender": "MALE", // Must be uppercase MALE or FEMALE
    "dateOfBirth": "1990-12-10", // YYYY-MM-DD format
    
    // Employment information
    "role": "TEACHER", // Must be exactly TEACHER
    "department": "science", // Lowercase recommended
    "employeeId": "EMP003",
    "qualifications": "BSc Physics, BEd",
    
    // Contact information
    "phoneNumber": "+254700123458", // Must start with + and have 10-15 digits
    "address": "789 Pine Street, Nairobi", // Optional
    
    // Teaching assignments - both arrays must have at least one valid UUID
    "tenantSubjectIds": ["f99b6683-ff77-4384-ab70-0f16bf83fedf"],
    "tenantGradeLevelIds": ["56ce42b9-a788-4838-af14-91f0f8423715"]
    
    // Optional class teacher assignments
    // "classTeacherTenantStreamId": "stream-uuid-here"
    // OR
    // "classTeacherTenantGradeLevelId": "grade-level-uuid-here"
  }
};

// Function to generate a request for direct GraphQL API calls
function generateGraphQLRequest() {
  return {
    query: mutation,
    variables: variables
  };
}

// Function to generate a request for the Next.js API route
function generateAPIRouteRequest(tenantId) {
  return {
    createTeacherDto: variables.createTeacherDto,
    tenantId: tenantId
  };
}

// Example usage
console.log("=== For Direct GraphQL API Calls ===");
console.log(JSON.stringify(generateGraphQLRequest(), null, 2));
console.log("\n\n=== For Next.js API Route (/api/school/invite-teacher) ===");
console.log(JSON.stringify(generateAPIRouteRequest("your-tenant-id-here"), null, 2));
