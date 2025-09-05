import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    const { teacherId, streamId, gradeLevelId } = await request.json();
    
    console.log('Assign class teacher API called with:', { teacherId, streamId, gradeLevelId });
    
    // Get the token from cookies first
    const cookieStore = await cookies();
    let token = cookieStore.get('accessToken')?.value;
    let tokenSource = 'cookies';
    
    // If no token in cookies, check Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
        tokenSource = 'authorization_header';
      }
    }
    
    console.log('🔍 Debug - Token found:', token ? `${token.substring(0, 30)}...` : 'No token');
    console.log('🔍 Debug - Token source:', tokenSource);
    console.log('🔍 Debug - All cookies:', Object.fromEntries(
      Array.from(cookieStore.getAll().map(cookie => [cookie.name, cookie.value.substring(0, 20) + '...']))
    ));
    
    if (!token) {
      console.error('No access token found in cookies or authorization header');
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Determine which mutation to use based on whether streamId is provided
    let mutation: string;
    let variables: any;

    if (streamId) {
      // Use stream-specific assignment
      mutation = `
        mutation AssignStreamClassTeacher($teacherId: ID!, $streamId: ID!) {
          assignClassTeacher(input: {
            teacherId: $teacherId,
            streamId: $streamId
          }) {
            id
            active
            startDate
            endDate
            teacher {
              id
              fullName
              email
            }
            stream {
              id
              stream {
                id
                name
              }
            }
          }
        }
      `;
      variables = { teacherId, streamId };
    } else if (gradeLevelId) {
      // Use grade level assignment
      mutation = `
        mutation AssignGradeLevelClassTeacher($teacherId: ID!, $gradeLevelId: ID!) {
          assignGradeLevelClassTeacher(input: {
            teacherId: $teacherId,
            gradeLevelId: $gradeLevelId
          }) {
            id
            active
            startDate
            endDate
            teacher {
              id
              fullName
              email
            }
            gradeLevel {
              id
              gradeLevel {
                id
                name
              }
            }
          }
        }
      `;
      variables = { teacherId, gradeLevelId };
    } else {
      return NextResponse.json(
        { error: 'Either streamId or gradeLevelId must be provided' },
        { status: 400 }
      );
    }

    console.log('🔍 Debug - Using mutation:', mutation);
    console.log('🔍 Debug - Variables:', variables);
    console.log('🔍 Debug - GraphQL Endpoint:', GRAPHQL_ENDPOINT);

    const requestBody = {
      query: mutation,
      variables
    };

    console.log('🔍 Debug - Request body:', JSON.stringify(requestBody, null, 2));
    console.log('🔍 Debug - Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token?.substring(0, 30)}...`
    });

    // Call external GraphQL API
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('GraphQL response status:', response.status);
    
    const result = await response.json();
    console.log('GraphQL response:', result);
    
    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json(
        { error: 'Error assigning class teacher', details: result.errors },
        { status: 500 }
      );
    }

    // Return the appropriate data based on which mutation was used
    const assignmentData = streamId 
      ? result.data.assignClassTeacher 
      : result.data.assignGradeLevelClassTeacher;

    return NextResponse.json(assignmentData);
  } catch (error) {
    console.error('Error assigning class teacher:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to assign class teacher',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
