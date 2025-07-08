const GRAPHQL_ENDPOINT = 'https://skool.zelisline.com/graphql';

// Test the getPendingInvitations query directly
async function testPendingInvitations() {
  const tenantId = "f4f414c6-47f8-4d60-b996-42c5db86aa61";
  
  // You'll need to replace this with a valid token
  const token = "YOUR_ACCESS_TOKEN_HERE";
  
  const query = `
    query GetPendingInvitations($tenantId: String!) {
      getPendingInvitations(tenantId: $tenantId) {
        id
        email
        role
        status
        createdAt
        invitedBy {
          id
          name
          email
        }
      }
    }
  `;

  try {
    console.log('Testing getPendingInvitations query...');
    console.log('Tenant ID:', tenantId);
    console.log('GraphQL Endpoint:', GRAPHQL_ENDPOINT);
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables: {
          tenantId
        }
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('Response data:', JSON.stringify(result, null, 2));

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
    } else {
      console.log('Success! Found', result.data?.getPendingInvitations?.length || 0, 'pending invitations');
    }
  } catch (error) {
    console.error('Error testing query:', error);
  }
}

// Run the test
testPendingInvitations(); 