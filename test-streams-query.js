// Test script to check if streams are being returned from GraphQL
const testStreamsQuery = async () => {
  try {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GetSchoolConfiguration {
            getSchoolConfiguration {
              id
              selectedLevels {
                id
                name
                description
                gradeLevels {
                  id
                  name
                  age
                  streams {
                    id
                    name
                  }
                }
              }
              tenant {
                id
                schoolName
                subdomain
              }
            }
          }
        `,
      }),
    });

    const result = await response.json();
    console.log('GraphQL Response:', JSON.stringify(result, null, 2));
    
    // Check specifically for streams
    if (result.data?.getSchoolConfiguration?.selectedLevels) {
      result.data.getSchoolConfiguration.selectedLevels.forEach(level => {
        console.log(`\nLevel: ${level.name}`);
        level.gradeLevels?.forEach(grade => {
          console.log(`  Grade: ${grade.name} - Streams: ${grade.streams?.length || 0}`);
          grade.streams?.forEach(stream => {
            console.log(`    - ${stream.name} (ID: ${stream.id})`);
          });
        });
      });
    }
  } catch (error) {
    console.error('Error testing streams query:', error);
  }
};

// Run the test
testStreamsQuery();
