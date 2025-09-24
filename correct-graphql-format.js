/**
 * This file demonstrates the CORRECT way to structure your GraphQL mutation
 * The key difference is using VARIABLES instead of inline parameters
 */

// CORRECT APPROACH - Using variables 
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

const correctVariables = {
  "createTeacherDto": {
    "email": "tobiasbarakan@gmail.com",
    "fullName": "Mike Johnson",
    "firstName": "Mike",
    "lastName": "Johnson",
    "role": "TEACHER",
    "gender": "MALE",
    "department": "science",  // Note: lowercase
    "phoneNumber": "+254700123458",
    "address": "789 Pine Street, Nairobi",
    "employeeId": "EMP003",
    "dateOfBirth": "1990-12-10",
    "qualifications": "BSc Physics, BEd",
    "tenantSubjectIds": ["f99b6683-ff77-4384-ab70-0f16bf83fedf"],
    "tenantGradeLevelIds": ["56ce42b9-a788-4838-af14-91f0f8423715"]
    // NO tenantId field here
  }
};

// This is how you'd make the fetch request
const makeCorrectRequest = async () => {
  const response = await fetch('https://skool.zelisline.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN_HERE'
    },
    body: JSON.stringify({
      query: correctMutation,
      variables: correctVariables
    })
  });
  return response.json();
};

// INCORRECT APPROACH - What you're currently doing (inline parameters)
const incorrectMutation = `
mutation InviteRegularTeacher {
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

// This is how your GraphQL client should format the request
console.log('CORRECT REQUEST FORMAT:');
console.log(JSON.stringify({
  query: correctMutation,
  variables: correctVariables
}, null, 2));

// IMPORTANT NOTE: When using tools like GraphQL Playground:
console.log('\nIn GraphQL Playground/Explorer:');
console.log('1. Put the query (correctMutation) in the main editor');
console.log('2. Put the variables (correctVariables) in the "Query Variables" section at the bottom');
console.log('3. Do NOT include the variables directly in the query');
