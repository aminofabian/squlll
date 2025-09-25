// Script to test the fee structures GraphQL query
// Usage: node test-fee-structures-query.js [accessToken]

async function testFeeStructuresQuery() {
  // Get access token from command line args if provided
  const accessToken = process.argv[2];
  
  const query = `
    query GetFeeStructures {
      feeStructures {
        id
        name
        academicYear {
          name
        }
        term {
          name
        }
        items {
          id
          feeBucket {
            name
          }
          amount
          isMandatory
        }
        isActive
      }
    }
  `;

  console.log('===== Fee Structures GraphQL Query Test =====');
  console.log(`Using authorization: ${accessToken ? 'Yes' : 'No'}`);
  console.log('Endpoint: http://localhost:3000/api/graphql');

  try {
    console.log('\nSending GraphQL query for fee structures...');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization if token provided
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const response = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    });

    console.log(`\nResponse status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`GraphQL request failed with status ${response.status}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('\nGraphQL errors:', result.errors);
      return;
    }

    console.log('\nFee Structures Response:', JSON.stringify(result, null, 2));
    
    const structures = result.data?.feeStructures || [];
    console.log(`\nSUMMARY: Received ${structures.length} fee structures`);
    
    if (structures.length > 0) {
      console.log('\nFirst structure details:');
      console.log(JSON.stringify(structures[0], null, 2));
    } else {
      console.log('\nNo fee structures found in the response.');
    }
  } catch (err) {
    console.error('\nERROR:', err.message);
    console.error('Stack trace:', err.stack);
  }
}

testFeeStructuresQuery();
