#!/usr/bin/env node

/**
 * Direct GraphQL client for teacher invitation
 * This script demonstrates the correct way to invoke the GraphQL API directly
 * 
 * Usage:
 * bun direct-teacher-invitation.js YOUR_TOKEN_HERE
 */

// Get the token from command line arguments
const token = process.argv[2];
if (!token) {
  console.error('Please provide an access token as argument');
  console.error('Example: bun direct-teacher-invitation.js YOUR_TOKEN_HERE');
  process.exit(1);
}

const GRAPHQL_ENDPOINT = 'https://skool.zelisline.com/graphql';

/**
 * Removes tenantId from an object since it's not part of the GraphQL schema
 */
function cleanGraphQLDto(dto) {
  const { tenantId, ...cleanedDto } = dto;
  return cleanedDto;
}

// This is the correct mutation with variables
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

// Sample teacher data
const teacherData = {
  email: "test.teacher.invitation@example.com",
  fullName: "Test Teacher",
  firstName: "Test",
  lastName: "Teacher",
  role: "TEACHER",
  gender: "MALE",
  department: "science", // Lowercase!
  phoneNumber: "+254700123456",
  address: "123 Test St",
  employeeId: "EMP-TEST-001",
  dateOfBirth: "1990-01-01",
  qualifications: "BSc Education",
  tenantSubjectIds: ["d49a941b-0b3f-47a2-be54-17777cd2ecb7"],
  tenantGradeLevelIds: ["709402cd-b9db-4143-983d-035d19b8dc92"],
  tenantId: "tenant-id-that-should-be-removed" // This will be removed
};

/**
 * Makes a GraphQL request
 */
async function makeGraphQLRequest() {
  console.log('🔍 Testing direct GraphQL teacher invitation');
  console.log('='.repeat(60));
  
  // Step 1: Clean the teacher data by removing tenantId
  const cleanedTeacherDto = cleanGraphQLDto(teacherData);
  console.log('✅ tenantId removed:', !('tenantId' in cleanedTeacherDto));
  
  // Step 2: Prepare the request with variables format
  const requestBody = {
    query: mutation,
    variables: {
      createTeacherDto: cleanedTeacherDto
    }
  };
  
  console.log('\n📤 Sending GraphQL request:');
  console.log(`Endpoint: ${GRAPHQL_ENDPOINT}`);
  console.log('Request Structure:');
  console.log(JSON.stringify(requestBody, null, 2).substring(0, 500) + '...');
  
  try {
    // Step 3: Send the request
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`\n📡 Response status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (data.errors) {
      console.log('\n❌ GraphQL errors:');
      data.errors.forEach(error => {
        console.log(`- ${error.message}`);
        if (error.extensions?.code) {
          console.log(`  Code: ${error.extensions.code}`);
        }
      });
      
      console.log('\nFull error details:');
      console.log(JSON.stringify(data.errors, null, 2));
    } else if (data.data?.inviteTeacher) {
      console.log('\n✅ Success! Teacher invitation created:');
      console.log(JSON.stringify(data.data.inviteTeacher, null, 2));
    } else {
      console.log('\n⚠️ Unexpected response:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }
}

// Run the request
makeGraphQLRequest().catch(console.error);

// Note: If this still fails, it might be due to:
// 1. Invalid token
// 2. Incorrect format for UUID fields
// 3. Missing required fields not caught by our validation
