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
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    console.log('GraphQL API Route - Processing request');
    console.log('GraphQL API Route - Token present:', !!token);

    if (!token) {
      console.log('GraphQL API Route - No access token found, returning 401');
      return NextResponse.json(
        { 
          errors: [{ 
            message: 'Authentication required. Please log in.',
            extensions: { code: 'UNAUTHENTICATED' }
          }] 
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('GraphQL API Route - Request body:', {
      query: body.query?.substring(0, 100) + '...',
      operationName: body.operationName
    });

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('GraphQL API Route - External API response status:', response.status);

    // Check for GraphQL errors
    if (data.errors) {
      console.error('GraphQL API Route - GraphQL errors:', data.errors);
      
      // Check if it's a permission denied error
      const hasPermissionError = data.errors.some((error: any) => 
        error.extensions?.code === 'FORBIDDENEXCEPTION' ||
        error.message?.includes('Permission denied')
      );
      
      if (hasPermissionError) {
        console.log('GraphQL API Route - Permission denied error detected, returning 403');
        // Return the original error structure so useSchoolConfig can handle the redirect
        return NextResponse.json(data, { status: 403 });
      }
      
      // Check if it's an authentication error
      const hasAuthError = data.errors.some((error: any) => 
        error.message?.includes('School (tenant) not found') ||
        error.extensions?.code === 'NOTFOUNDEXCEPTION' ||
        error.extensions?.code === 'UNAUTHENTICATED'
      );
      
      if (hasAuthError) {
        console.log('GraphQL API Route - Authentication error detected, returning 401');
        return NextResponse.json(
          { 
            errors: [{ 
              message: 'School not found or access denied. Please check your credentials.',
              extensions: { code: 'UNAUTHENTICATED' }
            }] 
          },
          { status: 401 }
        );
      }
      
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