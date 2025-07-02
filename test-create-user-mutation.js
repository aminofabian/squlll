const GRAPHQL_ENDPOINT = 'https://skool.zelisline.com/graphql';

async function testCreateUserMutation() {
  // Test createUser mutation to see if it can be used for students
  const createUserMutation = `
    mutation CreateUser {
      createUser(signupInput: {
        name: "John Doe"
        email: "john@student.com"
        password: "tempPassword123"
        role: "STUDENT"
      }) {
        id
        email
        name
        role
      }
    }
  `;

  try {
    console.log('Testing createUser mutation...');
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: createUserMutation
      })
    });

    const result = await response.json();
    console.log('CreateUser response:', JSON.stringify(result, null, 2));

    // Also test with just basic fields to see what's required
    const basicCreateUserMutation = `
      mutation CreateUserBasic {
        createUser(signupInput: {
          name: "John Doe"
          email: "john@student.com"
          password: "tempPassword123"
        }) {
          id
          email
          name
        }
      }
    `;

    console.log('\nTesting basic createUser mutation...');
    const response2 = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: basicCreateUserMutation
      })
    });

    const result2 = await response2.json();
    console.log('Basic CreateUser response:', JSON.stringify(result2, null, 2));

  } catch (error) {
    console.error('Error during createUser test:', error);
  }
}

testCreateUserMutation(); 