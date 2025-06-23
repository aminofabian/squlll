import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql'

export async function POST(request: Request) {
  try {
    const { levels } = await request.json()
    
    // Get the token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
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
        'Authorization': `Bearer ${token}`
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
