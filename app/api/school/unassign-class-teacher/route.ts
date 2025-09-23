import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    const { teacherId, streamId, gradeLevelId } = await request.json();
    
    console.log('🔍 Unassign class teacher API called with:', { teacherId, streamId, gradeLevelId });
    
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
    
    if (!token) {
      console.error('No access token found in cookies or authorization header');
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    if (!teacherId) {
      return NextResponse.json(
        { error: 'teacherId is required' },
        { status: 400 }
      );
    }

    // UnassignClassTeacher only accepts teacherId - no context needed
    const mutation = `
      mutation UnassignClassTeacher($teacherId: ID!) {
        unassignClassTeacher(
          input: {
            teacherId: $teacherId
          }
        )
      }
    `;

    const variables = { teacherId };
    
    console.log('🔍 Note: streamId/gradeLevelId provided but UnassignClassTeacherInput only accepts teacherId');
    console.log('🔍 Context info - streamId:', streamId, 'gradeLevelId:', gradeLevelId);

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
      'Authorization': `Bearer ${token.substring(0, 20)}...`
    });

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔍 Debug - GraphQL Response Status:', response.status);
    console.log('🔍 Debug - GraphQL Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 Debug - GraphQL Response Error Text:', errorText);
      return NextResponse.json(
        { 
          error: 'GraphQL request failed', 
          details: errorText,
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('🔍 Debug - GraphQL Response Data:', JSON.stringify(data, null, 2));

    if (data.errors) {
      console.error('🔍 Debug - GraphQL Errors:', data.errors);
      
      // If the specific unassign mutation failed, try alternative approaches
      if (data.errors.some((err: any) => err.extensions?.code === 'INTERNAL_SERVER_ERROR')) {
        console.log('🔍 Trying alternative unassign approach...');
        
        try {
          // The mutation already uses the correct format, so there's no alternative to try
          console.log('🔍 No alternative mutation available - UnassignClassTeacher only accepts teacherId');
        } catch (alternativeError) {
          console.error('🔍 Alternative approach also failed:', alternativeError);
        }
      }
      
      return NextResponse.json(
        { 
          error: 'GraphQL mutation failed', 
          details: data.errors,
          graphqlErrors: data.errors,
          mutation: mutation,
          variables: variables,
          note: 'UnassignClassTeacher only accepts teacherId in input'
        },
        { status: 400 }
      );
    }

    if (data.data?.unassignClassTeacher !== true) {
      console.warn('🔍 Debug - Unexpected response format:', data);
      return NextResponse.json(
        { 
          error: 'Unexpected response format',
          details: 'Expected unassignClassTeacher to return true',
          responseData: data
        },
        { status: 500 }
      );
    }

    console.log('🔍 Debug - Unassign successful:', data);

    return NextResponse.json({
      success: true,
      data: data.data
    });

  } catch (error) {
    console.error('🔍 Debug - API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
