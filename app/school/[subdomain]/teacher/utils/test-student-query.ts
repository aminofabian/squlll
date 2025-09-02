// Test file to determine the correct query structure

import { graphqlFetch } from './graphqlFetch';

interface SimpleStudent {
  id: string;
  user?: {
    name?: string;
    email?: string;
  };
}

interface TestResponse {
  searchStudentsByName: SimpleStudent[];
}

// Try multiple query variations to find what works
export async function testStudentSearch(subdomain: string) {
  console.log('Starting test queries...');
  
  const testName = 'John';
  
  // Test 1: Basic query with name and tenantId
  const QUERY1 = `
    query SearchStudentsByName($name: String!, $tenantId: String!) {
      searchStudentsByName(name: $name, tenantId: $tenantId) {
        id
      }
    }
  `;
  
  try {
    console.log('Trying query 1...');
    const result1 = await graphqlFetch<TestResponse>(
      QUERY1,
      { 
        name: testName,
        tenantId: subdomain
      },
      subdomain
    );
    console.log('Query 1 success:', result1);
    return { success: true, query: 'Query 1', result: result1 };
  } catch (err) {
    console.error('Query 1 error:', err);
  }
  
  // Test 2: Try without tenantId
  const QUERY2 = `
    query SearchStudentsByName($name: String!) {
      searchStudentsByName(name: $name) {
        id
      }
    }
  `;
  
  try {
    console.log('Trying query 2...');
    const result2 = await graphqlFetch<TestResponse>(
      QUERY2,
      { name: testName },
      subdomain
    );
    console.log('Query 2 success:', result2);
    return { success: true, query: 'Query 2', result: result2 };
  } catch (err) {
    console.error('Query 2 error:', err);
  }
  
  // Test 3: Try with input object
  const QUERY3 = `
    query SearchStudentsByName($name: String!) {
      searchStudentsByName(input: { name: $name }) {
        id
      }
    }
  `;
  
  try {
    console.log('Trying query 3...');
    const result3 = await graphqlFetch<TestResponse>(
      QUERY3,
      { name: testName },
      subdomain
    );
    console.log('Query 3 success:', result3);
    return { success: true, query: 'Query 3', result: result3 };
  } catch (err) {
    console.error('Query 3 error:', err);
  }
  
  // Test 4: Try a direct approach
  const QUERY4 = `
    {
      searchStudentsByName(name: "${testName}") {
        id
      }
    }
  `;
  
  try {
    console.log('Trying query 4...');
    const result4 = await graphqlFetch<TestResponse>(
      QUERY4,
      {},
      subdomain
    );
    console.log('Query 4 success:', result4);
    return { success: true, query: 'Query 4', result: result4 };
  } catch (err) {
    console.error('Query 4 error:', err);
  }
  
  // Test 5: Try more combinations
  const QUERY5 = `
    query {
      searchStudentsByName(name: "${testName}", tenantId: "${subdomain}") {
        id
      }
    }
  `;
  
  try {
    console.log('Trying query 5...');
    const result5 = await graphqlFetch<TestResponse>(
      QUERY5,
      {},
      subdomain
    );
    console.log('Query 5 success:', result5);
    return { success: true, query: 'Query 5', result: result5 };
  } catch (err) {
    console.error('Query 5 error:', err);
  }
  
  return { success: false, message: 'All queries failed' };
}

// Call the function to test
// testStudentSearch('yourschool').then(console.log);
