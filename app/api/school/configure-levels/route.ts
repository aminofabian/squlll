import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { LevelInput } from '@/lib/types/school-config'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql'

export async function POST(request: Request) {
  try {
    // Note: Using hardcoded level names as specified
    const levelNames = [
      "lower primary",
      "upper primary", 
      "junior secondary",
      "Senior Secondary"
    ]
    
    // Get the token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      )
    }

    // Get school context from cookies
    const userId = cookieStore.get('userId')?.value
    const schoolUrl = cookieStore.get('schoolUrl')?.value
    const subdomainUrl = cookieStore.get('subdomainUrl')?.value
    
    console.log('Configuring school levels for:', { schoolUrl, levelNames })

    // Prepare GraphQL mutation with exact structure you provided
    const mutation = `
      mutation {
        configureSchoolLevelsByNames(levelNames: [
          "lower primary",
          "upper primary",
          "junior secondary",
          "Senior Secondary"
        ]) {
          id
          selectedLevels {
            id
            name
            gradeLevels {
              id
              name
              code
              order
            }
          }
          tenant {
            id
            schoolName
          }
          createdAt
        }
      }
    `

    // Prepare headers with school context
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }

    // Add school context headers if available
    if (userId) {
      headers['x-user-id'] = userId
      headers['x-school-id'] = userId
    }
    if (schoolUrl) {
      headers['x-subdomain'] = schoolUrl
      headers['x-school-subdomain'] = schoolUrl
    }
    if (subdomainUrl) {
      headers['x-subdomain-url'] = subdomainUrl
    }

    // Call external GraphQL API with the exact mutation
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: mutation
        // No variables needed since level names are hardcoded in the mutation
      })
    })

    const result = await response.json()
    
    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL configuration error:', result.errors)
      
      // Check if it's a permissions issue
      const hasPermissionError = result.errors.some((error: any) => 
        error.extensions?.code === 'UNAUTHORIZEDEXCEPTION' ||
        error.message?.toLowerCase().includes('unauthorized') ||
        error.message?.toLowerCase().includes('permission') ||
        error.message?.toLowerCase().includes('forbidden')
      )
      
      if (hasPermissionError) {
        return NextResponse.json(
          { 
            error: 'Permission denied. You may not have admin rights to configure school levels.',
            details: result.errors 
          },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { error: 'Error configuring school levels', details: result.errors },
        { status: 500 }
      )
    }

    console.log('School levels configured successfully')
    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Error configuring school levels:', error)
    return NextResponse.json(
      { error: 'Failed to configure school levels' },
      { status: 500 }
    )
  }
}
