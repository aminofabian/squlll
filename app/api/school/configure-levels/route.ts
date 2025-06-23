import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { LevelInput } from '@/lib/types/school-config'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql'

export async function POST(request: Request) {
  try {
    const { levels } = await request.json() as { levels: LevelInput[] }
    
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
      mutation ConfigureSchoolLevels($levels: [LevelInput!]!) {
        configureSchoolLevels(levels: $levels) {
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
          levels: levels.map(level => ({
            name: level.name,
            description: level.description,
            gradeLevels: level.classes.map(cls => ({
              name: cls.name,
              age: parseInt(cls.age, 10) || null
            }))
          }))
        }
      })
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

    // Debug: Log the response to see if we're getting gradeLevels
    console.log('Configure levels response:', {
      levels: result.data?.configureSchoolLevels?.selectedLevels?.map((l: any) => ({
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
