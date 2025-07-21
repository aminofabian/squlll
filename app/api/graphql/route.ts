import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    const body = await request.json();
    console.log('GraphQL API Route - Request body:', {
      query: body.query?.substring(0, 100) + '...',
      operationName: body.operationName
    });

    // DEV MOCK: Allow teachers to access admin-limited school config
    if (process.env.NODE_ENV !== 'production' && body.query && body.query.includes('getSchoolConfiguration')) {
      return NextResponse.json({
        data: {
          getSchoolConfiguration: {
            id: 'mock-school-config-id',
            selectedLevels: [
              {
                id: 'level-1',
                name: 'Primary',
                gradeLevels: [
                  { id: 'grade-1', name: 'Grade 1', code: 'G1', order: 1 },
                  { id: 'grade-2', name: 'Grade 2', code: 'G2', order: 2 }
                ],
                subjects: [
                  { name: 'Mathematics' },
                  { name: 'English' },
                  { name: 'Science' }
                ]
              }
            ],
            tenant: { id: 'tenant-1', schoolName: 'Mock School' },
            createdAt: new Date().toISOString()
          }
        }
      });
    }

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('GraphQL API Route - External API response status:', response.status);

    if (data.errors) {
      console.error('GraphQL API Route - GraphQL errors:', data.errors);
      return NextResponse.json(data, { status: 500 });
    }

    console.log('GraphQL API Route - Success response');
    return NextResponse.json(data);
  } catch (error) {
    console.error('GraphQL API Route - Proxy error:', error);
    return NextResponse.json(
      {
        errors: [{
          message: 'Failed to proxy GraphQL request',
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        }]
      },
      { status: 500 }
    );
  }
} 