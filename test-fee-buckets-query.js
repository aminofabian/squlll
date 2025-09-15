// Test script to verify the fee buckets GraphQL query
const testFeeBucketsQuery = async () => {
  try {
    console.log('🧪 Testing Fee Buckets Query...\n')
    
    const response = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GetFeeBuckets {
            feeBuckets {
              id
              name
              description
              isActive
              createdAt
            }
          }
        `,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.errors) {
      console.error('❌ GraphQL Errors:', result.errors)
      return
    }

    console.log('✅ Fee Buckets Query Successful!')
    console.log('📊 Response Data:')
    console.log(JSON.stringify(result.data, null, 2))
    
    if (result.data.feeBuckets && result.data.feeBuckets.length > 0) {
      console.log(`\n📈 Found ${result.data.feeBuckets.length} fee bucket(s):`)
      result.data.feeBuckets.forEach((bucket, index) => {
        console.log(`  ${index + 1}. ${bucket.name} (${bucket.isActive ? 'Active' : 'Inactive'})`)
        console.log(`     Description: ${bucket.description}`)
        console.log(`     Created: ${new Date(bucket.createdAt).toLocaleDateString()}`)
        console.log(`     ID: ${bucket.id}`)
        console.log('')
      })
    } else {
      console.log('📝 No fee buckets found. You can create some using the Fee Structure Drawer!')
    }
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message)
    console.log('\n💡 Make sure your Next.js server is running on http://localhost:3000')
  }
}

// Run the test
testFeeBucketsQuery()
