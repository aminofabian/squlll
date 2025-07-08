const GRAPHQL_ENDPOINT = 'https://skool.zelisline.com/graphql';

// Test with a sample token to see if authentication works
async function testWithToken() {
  const tenantId = "e6331c77-d9c1-4fbf-a6c5-3024f789d353";
  const role = "TEACHER/STAFF";
  
  // This is a sample token - you'll need to replace with a real one
  const sampleToken = "your-access-token-here";
  
  const query = `
    query GetTeachersByTenant($tenantId: String!, $role: String!) {
      usersByTenant(tenantId: $tenantId, role: $role) {
        id
        name
        email
      }
    }
  `;

  const requestBody = {
    query,
    variables: {
      tenantId,
      role
    }
  };

  console.log('Testing usersByTenant query with token...');
  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sampleToken}`,
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test a simpler query that might not require special permissions
async function testSimpleQuery() {
  const query = `
    query {
      __typename
    }
  `;

  const requestBody = {
    query
  };

  console.log('\nTesting simple query...');
  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test the query without authentication to see the exact error
async function testWithoutAuth() {
  const tenantId = "e6331c77-d9c1-4fbf-a6c5-3024f789d353";
  const role = "TEACHER/STAFF";
  
  const query = `
    query GetTeachersByTenant($tenantId: String!, $role: String!) {
      usersByTenant(tenantId: $tenantId, role: $role) {
        id
        name
        email
      }
    }
  `;

  const requestBody = {
    query,
    variables: {
      tenantId,
      role
    }
  };

  console.log('\nTesting usersByTenant query without auth...');
  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run tests
async function runTests() {
  await testSimpleQuery();
  await testWithoutAuth();
  console.log('\nNote: To test with authentication, you need to provide a valid access token in the testWithToken function.');
}

runTests(); 