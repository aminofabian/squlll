// Test script to verify the academic years GraphQL query
const testAcademicYearsQuery = async () => {
  try {
    console.log('🧪 Testing Academic Years Query...\n')
    
    const response = await fetch('http://localhost:3000/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GetAcademicYears {
            academicYears {
              id
              name
              startDate
              endDate
              isActive
              terms {
                id
                name
              }
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

    console.log('✅ Academic Years Query Successful!')
    console.log('📊 Response Data:')
    console.log(JSON.stringify(result.data, null, 2))
    
    if (result.data.academicYears && result.data.academicYears.length > 0) {
      console.log(`\n📈 Found ${result.data.academicYears.length} academic year(s):`)
      result.data.academicYears.forEach((year, index) => {
        console.log(`  ${index + 1}. ${year.name} (${year.isActive ? 'Active' : 'Inactive'})`)
        console.log(`     Period: ${new Date(year.startDate).toLocaleDateString()} - ${new Date(year.endDate).toLocaleDateString()}`)
        console.log(`     Terms: ${year.terms.length}`)
        year.terms.forEach((term, termIndex) => {
          console.log(`       ${termIndex + 1}. ${term.name} (${term.id})`)
        })
        console.log('')
      })
      
      const activeYear = result.data.academicYears.find(year => year.isActive)
      if (activeYear) {
        console.log(`🎯 Active Academic Year: ${activeYear.name}`)
        console.log(`   Available Terms: ${activeYear.terms.map(t => t.name).join(', ')}`)
      }
    } else {
      console.log('📝 No academic years found. You may need to create some in your database!')
    }
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message)
    console.log('\n💡 Make sure your Next.js server is running on http://localhost:3000')
  }
}

// Run the test
testAcademicYearsQuery()
