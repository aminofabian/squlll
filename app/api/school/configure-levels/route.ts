import { NextResponse } from 'next/server'
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

    // Call external GraphQL API
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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
