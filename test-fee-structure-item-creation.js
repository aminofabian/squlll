// Test script to verify the CreateFeeStructureItem mutation
const testCreateFeeStructureItem = async () => {
  try {
    console.log('🧪 Testing CreateFeeStructureItem Mutation...\n')
    
    const testData = {
      feeStructureId: "a1e1ce29-31bf-4dbc-af8d-010e4461a0e6",
      feeBucketId: "adbc2aa9-ff84-495a-a238-25d268efdce1",
      amount: 2500.00,
      isMandatory: false
    }
    
    console.log('📊 Test Data:', testData)
    
    const response = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation CreateFeeStructureItem($input: CreateFeeStructureItemInput!) {
            createFeeStructureItem(input: $input) {
              id
              feeBucket {
                id
                name
                description
              }
              feeStructure {
                id
                name
                academicYear {
                  name
                }
                term {
                  name
                }
              }
              amount
              isMandatory
            }
          }
        `,
        variables: {
          input: testData
        }
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

    console.log('✅ CreateFeeStructureItem Mutation Successful!')
    console.log('📊 Response Data:')
    console.log(JSON.stringify(result.data, null, 2))
    
    if (result.data.createFeeStructureItem) {
      const item = result.data.createFeeStructureItem
      console.log(`\n📈 Fee Structure Item Created:`)
      console.log(`  ID: ${item.id}`)
      console.log(`  Bucket: ${item.feeBucket.name} (${item.feeBucket.id})`)
      console.log(`  Amount: ${item.amount}`)
      console.log(`  Mandatory: ${item.isMandatory}`)
      console.log(`  Structure: ${item.feeStructure.name}`)
      console.log(`  Academic Year: ${item.feeStructure.academicYear?.name || 'N/A'}`)
      console.log(`  Term: ${item.feeStructure.term?.name || 'N/A'}`)
      // Grade field no longer exists in the schema
    }
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message)
    console.log('\n💡 Make sure your Next.js server is running on http://localhost:3000')
    console.log('💡 And that the fee structure and fee bucket IDs exist in your database')
  }
}

// Run the test
testCreateFeeStructureItem()
