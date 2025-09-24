// Example of proper inviteTeacher mutation format

// This is the correct mutation format
const correctMutation = `
mutation InviteTeacher($createTeacherDto: CreateTeacherInvitationDto!) {
  inviteTeacher(createTeacherDto: $createTeacherDto) {
    email
    fullName
    status
    createdAt
  }
}
`;

// These are the correct variables to pass (must be wrapped in createTeacherDto)
const correctVariables = {
  "createTeacherDto": {
    "email": "tobiasbarakan@gmail.com",
    "fullName": "Mike Johnson",
    "firstName": "Mike",
    "lastName": "Johnson",
    "role": "TEACHER",
    "gender": "MALE",
    "department": "science",  // lowercase for consistency
    "phoneNumber": "+254700123458",
    "address": "789 Pine Street, Nairobi",
    "employeeId": "EMP003",
    "dateOfBirth": "1990-12-10",
    "qualifications": "BSc Physics, BEd",
    "tenantSubjectIds": ["f99b6683-ff77-4384-ab70-0f16bf83fedf"],
    "tenantGradeLevelIds": ["56ce42b9-a788-4838-af14-91f0f8423715"]
  }
};

// Example for class teacher assignment:
const classTeacherVariables = {
  "createTeacherDto": {
    "email": "tobiasbarakan@gmail.com",
    "fullName": "Jane Smith",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "TEACHER",
    "gender": "FEMALE",
    "department": "english", 
    "phoneNumber": "+254700123457",
    "address": "456 Oak Street, Nairobi",
    "employeeId": "EMP002",
    "dateOfBirth": "1988-08-20",
    "qualifications": "BA English, MA Literature",
    "tenantSubjectIds": ["f99b6683-ff77-4384-ab70-0f16bf83fedf"],
    "tenantGradeLevelIds": [
      "96908727-33b8-43b5-863a-a3c1a4c4c905",
      "56ce42b9-a788-4838-af14-91f0f8423715"
    ],
    "classTeacherTenantGradeLevelId": "b7a94db6-1ee9-4a4b-9b7f-29812c0b3506"
  }
};

// Common mistake: Putting mutation parameters directly in the query instead of variables
const incorrectMutationFormat = `
mutation {
  inviteTeacher(
    createTeacherDto: {
      email: "tobiasbarakan@gmail.com"
      fullName: "Mike Johnson"
      firstName: "Mike"
      lastName: "Johnson"
      role: "TEACHER"
      gender: "MALE"
      department: "Science"
      phoneNumber: "+254700123458"
      address: "789 Pine Street, Nairobi"
      employeeId: "EMP003"
      dateOfBirth: "1990-12-10"
      qualifications: "BSc Physics, BEd"
      tenantSubjectIds: ["f99b6683-ff77-4384-ab70-0f16bf83fedf"]
      tenantGradeLevelIds: ["56ce42b9-a788-4838-af14-91f0f8423715"]
    }
  ) {
    email
    fullName
    status
    createdAt
  }
}
`;

// How to use:
// When making direct GraphQL calls, always use this format:
const requestBody = {
  query: correctMutation,
  variables: correctVariables
};

// When using the API route (/api/school/invite-teacher), the format should be:
const apiRouteRequestBody = {
  createTeacherDto: correctVariables.createTeacherDto,
  tenantId: "your-tenant-id-here"  // This is needed for the API route but not sent to GraphQL
};

console.log('Example of correct GraphQL request:');
console.log(JSON.stringify(requestBody, null, 2));

// To test this mutation in GraphQL playground:
// 1. Copy the mutation text (correctMutation)
// 2. Copy the variables (correctVariables)
// 3. Make sure the variables are sent separately, not included inline in the query
