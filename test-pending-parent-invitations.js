// Using built-in fetch

// Configuration
const tenantId = 'e9012943-9987-467e-99a6-7b2bf97c4a61'; // Use the tenant ID provided by the user
const API_URL = 'http://localhost:3000/api/graphql'; // Update this if your API URL is different

// GraphQL query
const query = `
  query {
    getPendingParentInvitations(tenantId: "${tenantId}") {
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

async function testPendingParentInvitations() {
  try {
    console.log('Testing pending parent invitations query...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL Error:', data.errors);
      return;
    }

    console.log('Pending Parent Invitations:');
    console.log(JSON.stringify(data, null, 2));
    
    const pendingInvitations = data.data?.getPendingParentInvitations || [];
    console.log(`Found ${pendingInvitations.length} pending parent invitations`);
    
    // Log each invitation
    pendingInvitations.forEach((invitation, index) => {
      console.log(`\nInvitation ${index + 1}:`);
      console.log(`ID: ${invitation.id}`);
      console.log(`Email: ${invitation.email}`);
      console.log(`Status: ${invitation.status}`);
      console.log(`Created: ${new Date(invitation.createdAt).toLocaleString()}`);
      console.log(`Role: ${invitation.role}`);
      
      if (invitation.invitedBy) {
        console.log(`Invited by: ${invitation.invitedBy.name} (${invitation.invitedBy.email})`);
      } else {
        console.log('Invited by: Unknown');
      }
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testPendingParentInvitations();
