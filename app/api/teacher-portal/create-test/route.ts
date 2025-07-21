import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

const CREATE_TEST_MUTATION = `
mutation CreateTest($createTestInput: CreateTestInput!) {
  createTest(createTestInput: $createTestInput) {
    id
    title
  }
}
`;

export async function POST(request: Request) {
  try {
    // Get the access token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    
    // Remove authentication requirement - allow all requests
    // if (!token) {
    //   return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    // }

    // Parse the request body
    const body = await request.json();
    const { createTestInput } = body;
    if (!createTestInput) {
      return NextResponse.json({ error: 'Missing createTestInput in request body.' }, { status: 400 });
    }

    // Call the GraphQL API
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Only send Authorization header if token exists
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        query: CREATE_TEST_MUTATION,
        variables: { createTestInput },
      }),
    });

    const result = await response.json();
    if (result.errors) {
      return NextResponse.json({ error: result.errors[0].message }, { status: 400 });
    }

    return NextResponse.json(result.data.createTest);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 