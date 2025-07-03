const GRAPHQL_ENDPOINT = 'https://skool.zelisline.com/graphql';

async function introspectSchema() {
  const introspectionQuery = `
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
                ofType {
                  name
                  kind
                }
              }
            }
            type {
              name
              kind
              ofType {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
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
        types {
          name
          kind
          fields {
            name
            type {
              name
              kind
              ofType {
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

    // Check for students query
    const queries = result.data.__schema.queryType.fields;
    console.log('Available queries:');
    queries.forEach(query => {
      console.log(`- ${query.name}`);
      if (query.description) {
        console.log(`  Description: ${query.description}`);
      }
      if (query.args && query.args.length > 0) {
        console.log(`  Args: ${query.args.map(arg => `${arg.name}:${arg.type.name || arg.type.kind}`).join(', ')}`);
      }
    });

    // Check specifically for students query
    const studentsQuery = queries.find(q => q.name === 'students');
    if (studentsQuery) {
      console.log('\nStudents query details:');
      console.log(`Name: ${studentsQuery.name}`);
      console.log(`Type: ${studentsQuery.type.name || studentsQuery.type.kind}`);
      if (studentsQuery.args && studentsQuery.args.length > 0) {
        console.log(`Args: ${studentsQuery.args.map(arg => `${arg.name}:${arg.type.name || arg.type.kind}`).join(', ')}`);
      }
    }

    // Check for Student type definition
    const studentType = result.data.__schema.types.find(t => t.name === 'Student');
    if (studentType) {
      console.log('\nStudent type fields:');
      studentType.fields.forEach(field => {
        console.log(`- ${field.name}: ${field.type.name || field.type.kind}`);
      });
    }

    // Check for User type definition
    const userType = result.data.__schema.types.find(t => t.name === 'User');
    if (userType) {
      console.log('\nUser type fields:');
      userType.fields.forEach(field => {
        console.log(`- ${field.name}: ${field.type.name || field.type.kind}`);
      });
    }

  } catch (error) {
    console.error('Error during introspection:', error);
  }
}

introspectSchema(); 