#!/usr/bin/env node

/**
 * Script to test teacher invitation with properly formatted GraphQL request
 * Run with: bun test-teacher-invitation-direct.js YOUR_TOKEN_HERE
 */

// Get token from command line argument
const token = process.argv[2];
if (!token) {
  console.log('Please provide your access token as an argument:');
  console.log('bun test-teacher-invitation-direct.js YOUR_TOKEN_HERE');
  process.exit(1);
}

const GRAPHQL_ENDPOINT = 'https://skool.zelisline.com/graphql';

// The CORRECT mutation format using variables
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

// Using your actual data from the payload
const variables = {
  "createTeacherDto": {
    "email": "test.teacher.for.testing@example.com",
    "fullName": "Test Teacher",
    "firstName": "Test",
    "lastName": "Teacher",
    "role": "TEACHER",
    "gender": "MALE",
    "department": "social studies", // Note: lowercase
    "phoneNumber": "+2542830745735",
    "address": "179 Graham Harbor",
    "employeeId": "665544433333",
    "dateOfBirth": "1933-05-08",
    "qualifications": "Facilis debitis libero quisquam quod occaecati inventore maiores laborum.",
    "tenantSubjectIds": ["d49a941b-0b3f-47a2-be54-17777cd2ecb7"],
    "tenantGradeLevelIds": ["709402cd-b9db-4143-983d-035d19b8dc92"]
    // NO tenantId here - that's handled by the server based on your token
  }
};

async function testTeacherInvitation() {
  console.log('🔍 Testing teacher invitation with properly formatted GraphQL request');
  console.log('='.repeat(60));
  
  try {
    console.log('📝 Using teacher data:');
    console.log(`   Email: ${variables.createTeacherDto.email}`);
    console.log(`   Name: ${variables.createTeacherDto.fullName}`);
    console.log(`   Department: ${variables.createTeacherDto.department}`);
    
    // Log the request we're making
    console.log('\n📤 Sending GraphQL request:');
    console.log(`   Endpoint: ${GRAPHQL_ENDPOINT}`);
    console.log(`   Mutation: Using variables format`);
    console.log(`   Token: ${token.substring(0, 15)}...`);
    
    // Make the request
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: mutation,
        variables: variables
      })
    });
    
    console.log(`\n📡 Response status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    // Handle response
    if (data.errors) {
      console.log('\n❌ GraphQL Errors:');
      data.errors.forEach((error, index) => {
        console.log(`Error ${index + 1}: ${error.message}`);
        if (error.extensions?.code) {
          console.log(`Code: ${error.extensions.code}`);
        }
      });
      
      // Detailed error inspection
      console.log('\n🔍 Detailed error inspection:');
      console.log(JSON.stringify(data.errors, null, 2));
    } else if (data.data?.inviteTeacher) {
      console.log('\n✅ Success!');
      const teacher = data.data.inviteTeacher;
      console.log(`   Email: ${teacher.email}`);
      console.log(`   Name: ${teacher.fullName}`);
      console.log(`   Status: ${teacher.status}`);
      console.log(`   Created: ${teacher.createdAt}`);
    } else {
      console.log('\n⚠️ Unexpected response structure:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('\n❌ Request failed:');
    console.log(error.message);
  }
}

// Run the test
testTeacherInvitation().catch(console.error);
