// Test to see if other GraphQL queries work with your authentication

async function testPendingInvitations() {
  console.log('Testing pending invitations query...');
  
  try {
    // Test the pending invitations API endpoint
    const response = await fetch('/api/teachers/pending-invitations?tenantId=e6331c77-d9c1-4fbf-a6c5-3024f789d353', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Pending invitations query works! Authentication is valid.');
    } else {
      console.log('❌ Pending invitations query failed. Authentication issue confirmed.');
    }
  } catch (error) {
    console.error('Error testing pending invitations:', error);
  }
}

async function testRegularTeachers() {
  console.log('\nTesting regular teachers query...');
  
  try {
    // Test the regular teachers API endpoint
    const response = await fetch('/api/teachers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Regular teachers query works!');
    } else {
      console.log('❌ Regular teachers query failed.');
    }
  } catch (error) {
    console.error('Error testing regular teachers:', error);
  }
}

async function testGraphQLDirectly() {
  console.log('\nTesting GraphQL endpoint directly...');
  
  try {
    const query = `
      query GetPendingInvitations($tenantId: String!) {
        getPendingInvitations(tenantId: $tenantId) {
          id
          email
          role
          status
        }
      }
    `;

    const requestBody = {
      query,
      variables: {
        tenantId: "e6331c77-d9c1-4fbf-a6c5-3024f789d353"
      }
    };

    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok && !data.errors) {
      console.log('✅ GraphQL endpoint works with getPendingInvitations!');
    } else {
      console.log('❌ GraphQL endpoint failed with getPendingInvitations.');
    }
  } catch (error) {
    console.error('Error testing GraphQL directly:', error);
  }
}

// Run all tests
async function runTests() {
  console.log('=== Testing Authentication with Different Queries ===\n');
  
  await testPendingInvitations();
  await testRegularTeachers();
  await testGraphQLDirectly();
  
  console.log('\n=== Test Results Summary ===');
  console.log('If pending invitations work but usersByTenant doesn\'t:');
  console.log('- The issue is specific to the usersByTenant query');
  console.log('- Possible causes:');
  console.log('  1. Role parameter "TEACHER/STAFF" is not valid');
  console.log('  2. User doesn\'t have permission for usersByTenant');
  console.log('  3. Tenant ID doesn\'t match the authenticated user');
  console.log('\nIf all queries fail:');
  console.log('- Authentication token is invalid or expired');
  console.log('- Need to log out and log back in');
}

// Note: This needs to run in the browser context to access cookies
console.log('To run these tests:');
console.log('1. Open browser dev tools (F12)');
console.log('2. Go to Console tab');
console.log('3. Copy and paste this script');
console.log('4. Call runTests()'); 