// Simple test to check if GraphQL endpoint is working
// Run with: bun test-graphql-endpoint.js

const fetch = require('node-fetch');

async function testGraphQLEndpoint() {
  console.log('Testing GraphQL endpoint...');
  
  try {
    // Test 1: Simple introspection query
    const introspectionQuery = {
      query: `
        query IntrospectionQuery {
          __schema {
            queryType {
              name
            }
          }
        }
      `
    };

    console.log('Testing introspection query...');
    const response = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(introspectionQuery)
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (data.errors) {
      console.log('GraphQL errors:', data.errors);
    }

    // Test 2: Try a simple query that should work
    const simpleQuery = {
      query: `
        query TestQuery {
          allStudentsSummary {
            id
            studentName
          }
        }
      `
    };

    console.log('\nTesting allStudentsSummary query...');
    const response2 = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(simpleQuery)
    });

    console.log('Response status:', response2.status);
    const data2 = await response2.json();
    console.log('Response data:', JSON.stringify(data2, null, 2));

    if (data2.errors) {
      console.log('GraphQL errors:', data2.errors);
    } else if (data2.data?.allStudentsSummary) {
      console.log('✅ Found students:', data2.data.allStudentsSummary.length);
      if (data2.data.allStudentsSummary.length > 0) {
        console.log('First student ID:', data2.data.allStudentsSummary[0].id);
        return data2.data.allStudentsSummary[0].id;
      }
    }

  } catch (error) {
    console.error('❌ Error testing GraphQL endpoint:', error.message);
  }

  return null;
}

testGraphQLEndpoint();
