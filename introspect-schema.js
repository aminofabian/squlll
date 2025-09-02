// Simple script to fetch GraphQL schema introspection
const fetch = require('node-fetch');

async function introspectSchema() {
  const introspectionQuery = `
    query IntrospectionQuery {
      __schema {
        types {
          name
          kind
          description
          fields {
            name
            description
            args {
              name
              description
              type {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                  }
                }
              }
            }
            type {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
        queryType {
          name
          fields {
            name
            description
            args {
              name
              description
              type {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(`/api/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-School-Subdomain': 'example' // Replace with your subdomain
      },
      body: JSON.stringify({
        query: introspectionQuery
      })
    });

    const result = await response.json();
    console.log(JSON.stringify(result, null, 2));
    
    // Look specifically for searchStudentsByName field
    if (result.data && result.data.__schema && result.data.__schema.queryType) {
      const searchField = result.data.__schema.queryType.fields.find(
        field => field.name === 'searchStudentsByName'
      );
      
      if (searchField) {
        console.log('Search Students Field:');
        console.log(JSON.stringify(searchField, null, 2));
      } else {
        console.log('searchStudentsByName field not found in schema');
      }
    }
  } catch (error) {
    console.error('Error fetching schema:', error);
  }
}

// Run the introspection
introspectSchema();
