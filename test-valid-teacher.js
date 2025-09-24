// Sample valid teacher invitation for GraphQL testing

// GraphQL Mutation
const validMutation = `
mutation InviteTeacher($createTeacherDto: CreateTeacherInvitationDto!) {
  inviteTeacher(createTeacherDto: $createTeacherDto) {
    email
    fullName
    status
    createdAt
  }
}
`;

// Valid Variables - all required fields with proper formatting
const validVariables = {
  "createTeacherDto": {
    "email": "test.teacher@example.com",
    "fullName": "Test Teacher",
    "firstName": "Test",
    "lastName": "Teacher",
    "role": "TEACHER",
    "gender": "MALE",  // Must be MALE or FEMALE (uppercase)
    "department": "science",  // lowercase is recommended
    "phoneNumber": "+254712345678",  // Must start with + and be 10-15 digits
    "address": "123 Test Street",
    "employeeId": "TCH2025001",  // Required field
    "dateOfBirth": "1990-01-01",  // YYYY-MM-DD format
    "qualifications": "BSc Education",
    "tenantSubjectIds": ["00000000-0000-0000-0000-000000000001"],  // Must be array of UUIDs
    "tenantGradeLevelIds": ["00000000-0000-0000-0000-000000000002"]  // Must be array of UUIDs
  }
};

console.log('Copy and paste this mutation into your GraphQL playground:');
console.log(validMutation);
console.log('\n');
console.log('Copy and paste these variables into the "Query Variables" section:');
console.log(JSON.stringify(validVariables, null, 2));
console.log('\n');
console.log('Instructions:');
console.log('1. Make sure you\'re authenticated (have a valid access token)');
console.log('2. Use real UUIDs for tenantSubjectIds and tenantGradeLevelIds from your system');
console.log('3. Update the email address to a valid one that doesn\'t exist in your system yet');
