// Debug script to test stream creation
const debugStreamCreation = async () => {
  console.log('=== Stream Creation Debug ===');
  
  // Test data - using one of your grade IDs
  const testData = {
    name: "Test Stream A",
    capacity: 30,
    gradeId: "4cfe880a-0562-41fe-a781-7a360575fc5d" // PP1 from your response
  };
  
  console.log('Testing stream creation with data:', testData);
  
  try {
    // Test the stream creation API
    const response = await fetch('/api/school/create-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('Stream creation response status:', response.status);
    console.log('Stream creation response ok:', response.ok);
    
    const result = await response.json();
    console.log('Stream creation result:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Stream creation API succeeded');
      
      // Wait a moment then test the GraphQL query again
      console.log('Waiting 2 seconds before testing GraphQL query...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test GraphQL query
      const gqlResponse = await fetch('/api/graphql', {
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
                  gradeLevels {
                    id
                    name
                    streams {
                      id
                      name
                    }
                  }
                }
              }
            }
          `,
        }),
      });
      
      const gqlResult = await gqlResponse.json();
      console.log('GraphQL query after stream creation:', JSON.stringify(gqlResult, null, 2));
      
      // Check if our stream appears
      let streamFound = false;
      if (gqlResult.data?.getSchoolConfiguration?.selectedLevels) {
        gqlResult.data.getSchoolConfiguration.selectedLevels.forEach(level => {
          level.gradeLevels?.forEach(grade => {
            if (grade.id === testData.gradeId && grade.streams?.length > 0) {
              console.log(`✅ Found ${grade.streams.length} stream(s) for grade ${grade.name}:`);
              grade.streams.forEach(stream => {
                console.log(`  - ${stream.name} (ID: ${stream.id})`);
                if (stream.name === testData.name) {
                  streamFound = true;
                }
              });
            }
          });
        });
      }
      
      if (streamFound) {
        console.log('✅ SUCCESS: Stream was created and appears in GraphQL response');
      } else {
        console.log('❌ ISSUE: Stream was created but does NOT appear in GraphQL response');
        console.log('This indicates a problem with the GraphQL resolver or backend data fetching');
      }
      
    } else {
      console.log('❌ Stream creation API failed');
      if (result.error) {
        console.log('Error:', result.error);
      }
      if (result.details) {
        console.log('Details:', result.details);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
  
  console.log('=== End Debug ===');
};

// Export for use in browser console
window.debugStreamCreation = debugStreamCreation;
console.log('Debug function loaded. Run: debugStreamCreation()');
