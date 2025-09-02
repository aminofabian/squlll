// Simple test script to find the correct GraphQL query format
// Run with: node test-student-search.js

const fetch = require('node-fetch');

async function testGraphQL(query, variables = {}, subdomain = 'demo') {
  console.log('\n----- Testing Query -----');
  console.log('Query:', query);
  console.log('Variables:', variables);
  
  try {
    const response = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-School-Subdomain': subdomain
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ Error:', result.errors[0].message);
      return null;
    }
    
    console.log('✅ Success!');
    return result.data;
  } catch (err) {
    console.error('❌ Fetch error:', err.message);
    return null;
  }
}

async function runTests() {
  const searchTerm = "John";
  const subdomain = "demo"; // Replace with your test subdomain
  
  // Test 1: Direct parameters, no variables
  const test1 = await testGraphQL(`
    {
      searchStudentsByName(name: "${searchTerm}", tenantId: "${subdomain}") {
        id
        admission_number
        user {
          name
        }
      }
    }
  `);
  
  // Test 2: Parameters with variables
  const test2 = await testGraphQL(`
    query SearchStudents($name: String!, $tenantId: String!) {
      searchStudentsByName(name: $name, tenantId: $tenantId) {
        id
        admission_number
        user {
          name
        }
      }
    }
  `, { name: searchTerm, tenantId: subdomain });
  
  // If both failed, try simpler versions just to find what works
  if (!test1 && !test2) {
    // Test 3: Minimal query
    await testGraphQL(`
      {
        searchStudentsByName(name: "${searchTerm}", tenantId: "${subdomain}") {
          id
        }
      }
    `);
    
    // Test 4: Try with studentByName if searchStudentsByName doesn't exist
    await testGraphQL(`
      {
        studentsByName(name: "${searchTerm}") {
          id
        }
      }
    `);
    
    // Test 5: Try with students
    await testGraphQL(`
      {
        students {
          id
          user {
            name
          }
        }
      }
    `);
  }
}

runTests();
