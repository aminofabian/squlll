/**
 * Test script for the teacher invitation API endpoint
 * 
 * This script simulates a frontend request to the /api/school/invite-teacher endpoint
 * with realistic test data matching the CreateTeacherDrawer form structure.
 */

const fetch = require('node-fetch');

// Test data - modify these values as needed for your testing
const testData = {
  createTeacherDto: {
    email: "test-teacher@example.com",
    fullName: "Test Teacher",
    firstName: "Test",
    lastName: "Teacher",
    role: "TEACHER",
    gender: "MALE",
    department: "mathematics",
    phoneNumber: "1234567890",
    address: "123 Test Street",
    employeeId: "TCH/2024/001",
    dateOfBirth: "1990-01-01",
    qualifications: "BSc Mathematics",
    tenantSubjectIds: ["subject-id-1", "subject-id-2"],
    tenantGradeLevelIds: ["grade-id-1", "grade-id-2"],
    tenantStreamIds: ["stream-id-1"],
    isClassTeacher: true,
    classTeacherTenantStreamId: "stream-id-1"
  },
  tenantId: "your-tenant-id-here" // Replace with your actual tenant ID
};

// You'll need to get a valid access token from your browser cookies
// when logged into the application to use here
const accessToken = "your-access-token-here"; // Replace with a valid token

async function testTeacherInvitation() {
  try {
    console.log('Sending test request to /api/school/invite-teacher');
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/school/invite-teacher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `accessToken=${accessToken}`,
      },
      body: JSON.stringify(testData),
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    console.log('Response data:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Teacher invitation successful!');
      console.log('Teacher data:', result.teacher);
    } else {
      console.log('❌ Teacher invitation failed!');
      console.log('Error:', result.error);
      if (result.details) {
        console.log('Details:', result.details);
      }
    }
  } catch (error) {
    console.error('Error executing test:', error);
  }
}

testTeacherInvitation();
