import { NextResponse } from 'next/server'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql'
// Hard-coded token from the provided GraphQL example
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOm51bGwsImVtYWlsIjoianVzZGRkdGR3b2Rya2FuZEBleGFtcGxlLmNvbSIsIm9yZ2FuaXphdGlvbklkIjpudWxsLCJzY2hvb2xJZCI6ImI2ZDRiNzIzLWQ3NjctNGM0Ny1iNmJkLWZkMDg4NDU4ZWVkMyIsInNjaG9vbFN1YmRvbWFpbiI6Im1pYW5vLTIiLCJpYXQiOjE3NTA0ODc5NjMsImV4cCI6MTc1MDg0Nzk2MywiYXVkIjoibG9jYWxob3N0OjMwMDAiLCJpc3MiOiJsb2NhbGhvc3Q6MzAwMCJ9.F0TsVrzwzMDe4DcghKHZKWb84kApx5xOQNquLxok76I'

export async function POST(request: Request) {
  try {
    const { levels } = await request.json()
    
    // Use the hard-coded token from the example
    // In a production environment, this would be properly retrieved from cookies or auth headers
    const authToken = AUTH_TOKEN
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Prepare GraphQL mutation
    const mutation = `
      mutation {
        configureSchoolLevelsByNames(levelNames: [
          ${levels.map((level: string) => `"${level}"`).join(',\n          ')}
        ]) {
          id
          selectedLevels {
            id
            name
          }
          school {
            schoolId
            schoolName
          }
        }
      }
    `

    // Call external GraphQL API
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ query: mutation })
    })

    const result = await response.json()
    
    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
      return NextResponse.json(
        { error: 'Error configuring school levels', details: result.errors },
        { status: 500 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Error configuring school levels:', error)
    return NextResponse.json(
      { error: 'Failed to configure school levels' },
      { status: 500 }
    )
  }
}
