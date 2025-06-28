import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    const { name, capacity, gradeId } = await request.json();
    
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Prepare GraphQL mutation
    const mutation = `
      mutation CreateStream($name: String!, $capacity: Int!, $gradeId: String!) {
        createStream(input: {
          name: $name,
          capacity: $capacity,
          isActive: true,
          gradeLevelId: $gradeId
        }) {
          id
          name
          capacity
          isActive
          gradeLevel {
            id
            name
          }
        }
      }
    `;

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
          name,
          capacity: parseInt(capacity, 10),
          gradeId
        }
      })
    });

    const result = await response.json();
    
    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json(
        { error: 'Error creating stream', details: result.errors },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error creating stream:', error);
    return NextResponse.json(
      { error: 'Failed to create stream' },
      { status: 500 }
    );
  }
}
