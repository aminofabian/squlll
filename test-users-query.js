const GRAPHQL_ENDPOINT = 'https://skool.zelisline.com/graphql';

// Test the usersByTenant query
async function testUsersByTenantQuery() {
  const tenantId = "e6331c77-d9c1-4fbf-a6c5-3024f789d353";
  const role = "TEACHER";
  
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

  console.log('Testing usersByTenant query...');
  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: This will fail without a token, but we can see the error
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

// Test introspection to see available queries
async function testIntrospection() {
  const query = `
    query IntrospectionQuery {
      __schema {
        queryType {
          name
          fields {
            name
            description
            args {
              name
              type {
                name
                kind
              }
            }
            type {
              name
              kind
            }
          }
        }
      }
    }
  `;

  const requestBody = {
    query
  };

  console.log('\nTesting introspection...');
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
    
    if (data.data?.__schema?.queryType?.fields) {
      const queries = data.data.__schema.queryType.fields;
      console.log('\nAvailable queries:');
      queries.forEach(query => {
        console.log(`- ${query.name}: ${query.description || 'No description'}`);
        if (query.args && query.args.length > 0) {
          console.log(`  Args: ${query.args.map(arg => `${arg.name}:${arg.type.name || arg.type.kind}`).join(', ')}`);
        }
      });
      
      // Look for user-related queries
      const userQueries = queries.filter(q => 
        q.name.toLowerCase().includes('user') || 
        q.name.toLowerCase().includes('teacher') ||
        q.name.toLowerCase().includes('staff')
      );
      
      if (userQueries.length > 0) {
        console.log('\nUser/Teacher/Staff related queries:');
        userQueries.forEach(query => {
          console.log(`- ${query.name}: ${query.description || 'No description'}`);
          if (query.args && query.args.length > 0) {
            console.log(`  Args: ${query.args.map(arg => `${arg.name}:${arg.type.name || arg.type.kind}`).join(', ')}`);
          }
        });
      }
    } else {
      console.log('Response data:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run tests
async function runTests() {
  await testIntrospection();
  await testUsersByTenantQuery();
}

runTests(); 