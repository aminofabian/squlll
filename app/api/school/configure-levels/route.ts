import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { LevelInput } from '@/lib/types/school-config'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql'

export async function POST(request: Request) {
  try {
    const { levels } = await request.json() as { levels: LevelInput[] }
    
    // Get the token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    console.log('Authorization header received:', authHeader ? 'Found' : 'Not found')
    console.log('Token extracted:', token ? `${token.substring(0, 20)}...` : 'None')
    
    if (!token) {
      console.error('No token found in request')
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      )
    }

    // Get school context from cookies
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const schoolUrl = cookieStore.get('schoolUrl')?.value
    const subdomainUrl = cookieStore.get('subdomainUrl')?.value
    
    console.log('School context from cookies:', {
      userId: userId ? `${userId.substring(0, 10)}...` : 'None',
      schoolUrl: schoolUrl || 'None', 
      subdomainUrl: subdomainUrl || 'None'
    })

    // Prepare GraphQL mutation
    const mutation = `
      mutation ConfigureSchoolLevelsByNames($levelNames: [String!]!) {
        configureSchoolLevelsByNames(levelNames: $levelNames) {
          id
          selectedLevels {
            id
            name
            description
            subjects {
              id
              name
              code
              subjectType
              category
              department
              shortName
              isCompulsory
              totalMarks
              passingMarks
              creditHours
              curriculum
            }
            gradeLevels {
              id
              name
              age
            }
          }
          school {
            schoolId
            schoolName
            subdomain
          }
        }
      }
    `

    console.log('Sending request to GraphQL with token:', token ? `${token.substring(0, 20)}...` : 'None')
    console.log('GraphQL endpoint:', GRAPHQL_ENDPOINT)

    // Prepare headers with school context
    const graphqlHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }

    // Add school context headers if available
    if (userId) {
      graphqlHeaders['x-school-id'] = userId
      graphqlHeaders['schoolId'] = userId
      graphqlHeaders['x-user-id'] = userId
    }
    if (schoolUrl) {
      graphqlHeaders['x-school-subdomain'] = schoolUrl
      graphqlHeaders['schoolSubdomain'] = schoolUrl
      graphqlHeaders['x-subdomain'] = schoolUrl
      graphqlHeaders['subdomain'] = schoolUrl
    }
    if (subdomainUrl) {
      graphqlHeaders['x-subdomain-url'] = subdomainUrl
      graphqlHeaders['x-full-subdomain'] = subdomainUrl
    }

    console.log('GraphQL headers:', Object.keys(graphqlHeaders))

    // Call external GraphQL API
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: graphqlHeaders,
      body: JSON.stringify({
        query: mutation,
        variables: {
          levelNames: levels.map(level => level.name)
        }
      })
    })

    const result = await response.json()
    
    console.log('GraphQL response status:', response.status)
    console.log('GraphQL response:', result)
    
    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
      return NextResponse.json(
        { error: 'Error configuring school levels', details: result.errors },
        { status: 500 }
      )
    }

    // Debug: Log the response to see if we're getting gradeLevels
    console.log('Configure levels response:', {
      levelNames: levels.map(level => level.name),
      selectedLevels: result.data?.configureSchoolLevelsByNames?.selectedLevels?.map((l: any) => ({
        name: l.name,
        subjects: l.subjects?.length,
        grades: l.gradeLevels?.map((g: any) => ({
          id: g.id,
          name: g.name,
          age: g.age
        }))
      }))
    });

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Error configuring school levels:', error)
    return NextResponse.json(
      { error: 'Failed to configure school levels' },
      { status: 500 }
    )
  }
}
