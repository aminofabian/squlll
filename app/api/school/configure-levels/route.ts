import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    const { levelNames } = await request.json();
    
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    
    console.log('Debug - Token found:', token ? `${token.substring(0, 20)}...` : 'No token');
    console.log('Debug - GRAPHQL_ENDPOINT:', GRAPHQL_ENDPOINT);
    console.log('Debug - levelNames:', levelNames);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Prepare GraphQL mutation
    const mutation = `
      mutation ConfigureSchoolLevelsByNames($levelNames: [String!]!) {
        configureSchoolLevelsByNames(levelNames: $levelNames) {
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
    `;

    // Call external GraphQL API
    const requestBody = {
      query: mutation,
      variables: {
        levelNames
      }
    };
    
    console.log('Debug - Request body:', JSON.stringify(requestBody, null, 2));
    console.log('Debug - Authorization header:', `Bearer ${token.substring(0, 20)}...`);
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Debug - Response status:', response.status);
    console.log('Debug - Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('Debug - Response body:', JSON.stringify(result, null, 2));
    
    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json(
        { error: 'Error configuring school levels', details: result.errors },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error configuring school levels:', error);
    return NextResponse.json(
      { error: 'Failed to configure school levels' },
      { status: 500 }
    );
  }
} 