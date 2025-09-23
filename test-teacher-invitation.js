#!/usr/bin/env node

/**
 * Test script to debug the teacher invitation process
 * Run with: bun test-teacher-invitation.js
 */

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

// Test data matching your examples
const testTeachers = {
  regular: {
    email: "regular@example.com",
    fullName: "Mike Johnson",
    firstName: "Mike",
    lastName: "Johnson",
    role: "TEACHER",
    gender: "MALE",
    department: "Science",
    phoneNumber: "+254700123458",
    address: "789 Pine Street, Nairobi",
    employeeId: "EMP003",
    dateOfBirth: "1990-12-10",
    qualifications: "BSc Physics, BEd",
    tenantSubjectIds: ["f78c4124-a8b3-4d6f-932b-d8851d75fae7"],
    tenantGradeLevelIds: ["75b09d30-95f1-4b5a-9e50-2cbfefe45a5a"],
    // tenantStreams removed per schema; use classTeacherTenantStreamId if needed
  },
  streamClassTeacher: {
    email: "streamteacher@example.com",
    fullName: "John Bidii",
    firstName: "John",
    lastName: "Bidii",
    role: "TEACHER",
    gender: "MALE",
    department: "Mathematics",
    phoneNumber: "+254700123456",
    address: "123 Main Street, Nairobi",
    employeeId: "EMP001",
    dateOfBirth: "1985-05-15",
    qualifications: "BSc Mathematics, MSc Education",
    tenantSubjectIds: ["146dfd3d-7566-49a5-b659-c74309e20d09"],
    tenantGradeLevelIds: ["aa04861b-18ed-4668-9ead-c4069c2ee466"],
    // tenantStreams removed per schema; use classTeacherTenantStreamId if needed
    classTeacherTenantStreamId: "db2207c7-02ac-4afc-88aa-5905dea06c4a"
  },
  gradeLevelClassTeacher: {
    email: "programmingenious@gmail.com",
    fullName: "Jane Smith",
    firstName: "Jane",
    lastName: "Smith",
    role: "TEACHER",
    gender: "FEMALE",
    department: "English",
    phoneNumber: "+254700123457",
    address: "456 Oak Street, Nairobi",
    employeeId: "EMP002",
    dateOfBirth: "1988-08-20",
    qualifications: "BA English, MA Literature",
    tenantSubjectIds: ["4c8a6b01-94fe-432d-b740-3ff209b92fa3"],
    tenantGradeLevelIds: ["96908727-33b8-43b5-863a-a3c1a4c4c905"],
    classTeacherTenantGradeLevelId: "96908727-33b8-43b5-863a-a3c1a4c4c905"
  }
};

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

async function testTeacherInvitation(teacherType, teacherData) {
  console.log(`\n🧪 Testing ${teacherType} teacher invitation...`);
  console.log('='.repeat(60));
  
  try {
    console.log('📝 Teacher Data:');
    console.log(`   Email: ${teacherData.email}`);
    console.log(`   Name: ${teacherData.fullName}`);
    console.log(`   Department: ${teacherData.department}`);
    console.log(`   Subjects: ${teacherData.tenantSubjectIds?.length || 0}`);
    console.log(`   Grade Levels: ${teacherData.tenantGradeLevelIds?.length || 0}`);
    console.log(`   Streams: ${teacherData.tenantStreamIds?.length || 0}`);
    if (teacherData.classTeacherTenantStreamId) {
      console.log(`   Class Teacher (Stream): ${teacherData.classTeacherTenantStreamId}`);
    }
    if (teacherData.classTeacherTenantGradeLevelId) {
      console.log(`   Class Teacher (Grade): ${teacherData.classTeacherTenantGradeLevelId}`);
    }

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add your auth token here if needed
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE',
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          createTeacherDto: teacherData
        }
      }),
    });

    console.log(`\n📡 Response: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (data.errors) {
      console.log('❌ GraphQL Errors:');
      data.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.message}`);
        if (error.locations) {
          console.log(`     Location: line ${error.locations[0].line}, column ${error.locations[0].column}`);
        }
        if (error.path) {
          console.log(`     Path: ${error.path.join(' -> ')}`);
        }
        if (error.extensions) {
          console.log(`     Code: ${error.extensions.code}`);
        }
      });
    } else if (data.data && data.data.inviteTeacher) {
      console.log('✅ Success!');
      const teacher = data.data.inviteTeacher;
      console.log(`   Email: ${teacher.email}`);
      console.log(`   Full Name: ${teacher.fullName}`);
      console.log(`   Status: ${teacher.status}`);
      console.log(`   Created: ${teacher.createdAt}`);
    } else {
      console.log('⚠️ Unexpected response structure:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ Network/Fetch Error:');
    console.log(error.message);
  }
}

async function testLocalAPI(teacherType, teacherData) {
  console.log(`\n🧪 Testing LOCAL API for ${teacherType} teacher...`);
  console.log('='.repeat(60));
  
  try {
    const response = await fetch('http://localhost:3000/api/school/invite-teacher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        createTeacherDto: teacherData,
        tenantId: 'your-tenant-id-here' // Replace with actual tenant ID
      }),
    });

    console.log(`📡 Response: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (data.error) {
      console.log('❌ API Error:');
      console.log(`   Message: ${data.error}`);
      if (data.details) {
        console.log(`   Details: ${JSON.stringify(data.details, null, 2)}`);
      }
      if (data.code) {
        console.log(`   Code: ${data.code}`);
      }
    } else if (data.inviteTeacher) {
      console.log('✅ Success!');
      const teacher = data.inviteTeacher;
      console.log(`   Email: ${teacher.email}`);
      console.log(`   Full Name: ${teacher.fullName}`);
      console.log(`   Status: ${teacher.status}`);
      console.log(`   Created: ${teacher.createdAt}`);
    } else {
      console.log('⚠️ Unexpected response structure:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ Network/Fetch Error:');
    console.log(error.message);
  }
}

async function main() {
  console.log('🔍 Teacher Invitation Debugger');
  console.log(`GraphQL Endpoint: ${GRAPHQL_ENDPOINT}`);
  
  const testType = process.argv[2] || 'all';
  const useLocal = process.argv.includes('--local');
  
  if (testType === 'all' || testType === 'regular') {
    if (useLocal) {
      await testLocalAPI('Regular', testTeachers.regular);
    } else {
      await testTeacherInvitation('Regular', testTeachers.regular);
    }
  }
  
  if (testType === 'all' || testType === 'stream') {
    if (useLocal) {
      await testLocalAPI('Stream Class', testTeachers.streamClassTeacher);
    } else {
      await testTeacherInvitation('Stream Class', testTeachers.streamClassTeacher);
    }
  }
  
  if (testType === 'all' || testType === 'grade') {
    if (useLocal) {
      await testLocalAPI('Grade Level Class', testTeachers.gradeLevelClassTeacher);
    } else {
      await testTeacherInvitation('Grade Level Class', testTeachers.gradeLevelClassTeacher);
    }
  }
  
  console.log('\n✨ Testing complete!');
  console.log('\n💡 Usage:');
  console.log('  bun test-teacher-invitation.js              # Test all types against GraphQL API');
  console.log('  bun test-teacher-invitation.js regular      # Test regular teacher only');
  console.log('  bun test-teacher-invitation.js --local      # Test against local API route (recommended)');
  console.log('  bun test-teacher-invitation.js stream --local # Test stream teacher via local API');
  console.log('\n📝 Note: The backend now uses tenantStreams instead of streams in the schema.');
}

main().catch(console.error);
