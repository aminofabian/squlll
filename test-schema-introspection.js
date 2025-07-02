const GRAPHQL_ENDPOINT = 'https://skool.zelisline.com/graphql';

async function introspectSchema() {
  const introspectionQuery = `
    query IntrospectionQuery {
      __schema {
        mutationType {
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
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: introspectionQuery
      })
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('Introspection failed:', result.errors);
      return;
    }

    const mutations = result.data.__schema.mutationType.fields;
    console.log('Available mutations:');
    mutations.forEach(mutation => {
      console.log(`- ${mutation.name}`);
      if (mutation.description) {
        console.log(`  Description: ${mutation.description}`);
      }
    });

    // Check specifically for student-related mutations
    const studentMutations = mutations.filter(m => 
      m.name.toLowerCase().includes('student') || 
      m.name.toLowerCase().includes('create')
    );
    
    console.log('\nStudent/Create related mutations:');
    studentMutations.forEach(mutation => {
      console.log(`- ${mutation.name}`);
      if (mutation.args.length > 0) {
        console.log(`  Args: ${mutation.args.map(arg => `${arg.name}:${arg.type.name || arg.type.kind}`).join(', ')}`);
      }
    });

  } catch (error) {
    console.error('Error during introspection:', error);
  }
}

introspectSchema(); 