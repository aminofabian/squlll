// Test script for staff query authentication issues
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

// Test query for staff (same as teachers but with role "STAFF")
const GET_STAFF_BY_TENANT = `
  query GetStaffByTenant($tenantId: String!, $role: String!) {
    usersByTenant(tenantId: $tenantId, role: $role) {
      id
      name
      email
    }
  }
`;

async function testStaffQuery() {
  console.log('=== Testing Staff Query ===');
  
  // Test tenant ID (you can replace this with your actual tenant ID)
  const tenantId = 'e6331c77-d9c1-4fbf-a6c5-3024f789d353'; // From your debugger output
  const role = 'STAFF';
  
  console.log('Tenant ID:', tenantId);
  console.log('Role:', role);
  console.log('GraphQL Endpoint:', GRAPHQL_ENDPOINT);
  console.log('');
  
  try {
    console.log('Sending GraphQL request...');
    
    // Note: This will fail without authentication, but it will show us the error
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: GET_STAFF_BY_TENANT,
        variables: {
          tenantId,
          role
        }
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ GraphQL Errors:');
      result.errors.forEach((error, index) => {
        console.error(`  Error ${index + 1}:`, error.message);
        if (error.extensions) {
          console.error(`    Extensions:`, error.extensions);
        }
      });
    } else {
      console.log('✅ Success!');
      console.log('Response:', JSON.stringify(result, null, 2));
      console.log('Staff count:', result.data?.usersByTenant?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Network Error:');
    console.error('Message:', error.message);
    console.error('This suggests a network connectivity issue or the GraphQL endpoint is not accessible');
  }
}

// Test different roles to compare
async function testMultipleRoles() {
  console.log('\n=== Testing Multiple Roles ===');
  
  const tenantId = 'e6331c77-d9c1-4fbf-a6c5-3024f789d353';
  const roles = ['TEACHER', 'STAFF', 'ADMIN'];
  
  for (const role of roles) {
    console.log(`\n--- Testing role: ${role} ---`);
    
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: GET_STAFF_BY_TENANT,
          variables: {
            tenantId,
            role
          }
        })
      });
      
      const result = await response.json();
      
      if (result.errors) {
        console.error(`❌ ${role}: ${result.errors[0].message}`);
      } else {
        console.log(`✅ ${role}: Success (${result.data?.usersByTenant?.length || 0} users)`);
      }
      
    } catch (error) {
      console.error(`❌ ${role}: ${error.message}`);
    }
  }
}

// Test authentication status
async function testAuthStatus() {
  console.log('\n=== Testing Authentication Status ===');
  
  try {
    // Test a simple query that should work if authenticated
    const testQuery = `
      query TestAuth {
        __typename
      }
    `;
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: testQuery
      })
    });
    
    const result = await response.json();
    
    if (result.errors) {
      const authError = result.errors.find(e => 
        e.message?.includes('Unauthorized') || 
        e.message?.includes('Authentication') ||
        e.extensions?.code === 'UNAUTHENTICATED'
      );
      
      if (authError) {
        console.error('❌ Authentication error detected');
        console.error('Message:', authError.message);
        console.error('This suggests the access token is missing, expired, or invalid');
      } else {
        console.error('❌ Other GraphQL error:', result.errors[0].message);
      }
    } else {
      console.log('✅ Authentication test passed');
      console.log('Response:', result);
    }
    
  } catch (error) {
    console.error('❌ Authentication test failed:');
    console.error('Message:', error.message);
  }
}

// Test with local API endpoint (which should have cookies)
async function testLocalAPI() {
  console.log('\n=== Testing Local API Endpoint ===');
  
  const tenantId = 'e6331c77-d9c1-4fbf-a6c5-3024f789d353';
  const role = 'STAFF';
  
  try {
    console.log('Testing via local /api/graphql endpoint...');
    
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GET_STAFF_BY_TENANT,
        variables: {
          tenantId,
          role
        }
      })
    });
    
    console.log('Local API Response status:', response.status);
    
    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ Local API Errors:');
      result.errors.forEach((error, index) => {
        console.error(`  Error ${index + 1}:`, error.message);
      });
    } else {
      console.log('✅ Local API Success!');
      console.log('Staff count:', result.data?.usersByTenant?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Local API Error:', error.message);
    console.error('This suggests the local API endpoint is not accessible');
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Staff Query Tests\n');
  
  await testAuthStatus();
  await testStaffQuery();
  await testMultipleRoles();
  
  console.log('\n🏁 Tests completed');
  console.log('\n💡 Next steps:');
  console.log('1. If authentication fails: Check if you have a valid access token');
  console.log('2. If staff query fails but teachers works: Check if "STAFF" role exists');
  console.log('3. If all queries fail: Check GraphQL endpoint connectivity');
  console.log('4. Run the StaffAuthDebugger component in the browser for more detailed testing');
}

// Run the tests
runAllTests().catch(console.error); 