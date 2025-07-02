const GRAPHQL_ENDPOINT = 'https://skool.zelisline.com/graphql';

async function testCreateStudentMutation() {
  // Exact mutation as provided by the user
  const createStudentMutation = `
    mutation CreateStudent {
      createStudent(createStudentInput: {
        name: "John Doe"
        email: "john@student.com"
        admission_number: "ADM98765"
        phone: "0712345678"
        grade: "Grade 6"
        gender: "MALE"
      }) {
        user {
          id
          email
          name
        }
        student {
          id
          admission_number
          grade
          gender
          phone
        }
        generatedPassword
      }
    }
  `;

  try {
    // First test without authentication
    console.log('Testing without authentication...');
    let response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: createStudentMutation
      })
    });

    let result = await response.json();
    console.log('Response without auth:', JSON.stringify(result, null, 2));

    // Test with dummy authorization header
    console.log('\nTesting with dummy authorization...');
    response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dummy-token'
      },
      body: JSON.stringify({
        query: createStudentMutation
      })
    });

    result = await response.json();
    console.log('Response with dummy auth:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error during mutation test:', error);
  }
}

testCreateStudentMutation(); 