import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function GET() {
  try {
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Get tenantId from cookies for authentication context
    const tenantId = cookieStore.get('tenantId')?.value;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID not found in cookies. Please log in again.' },
        { status: 400 }
      );
    }

    console.log('Students API - Token present:', !!token);
    console.log('Students API - Token length:', token?.length || 0);
    console.log('Students API - Token preview:', token ? `${token.substring(0, 20)}...` : 'No token');
    console.log('Students API - Tenant ID present:', !!tenantId);
    console.log('Students API - Tenant ID:', tenantId);

    // Try a simpler query first to test basic connectivity
    const query = `
      query {
        students {
          id
          admission_number
        }
      }
    `;

    console.log('Students API - Sending query:', query.substring(0, 100) + '...');

    // Call external GraphQL API
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query
      })
    });

    console.log('Students API - Response status:', response.status);

    const result = await response.json();
    console.log('Students API - Response data:', JSON.stringify(result, null, 2));

    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      
      // Check if it's an authentication error
      const hasAuthError = result.errors.some((error: any) => 
        error.message?.includes('Unauthorized') ||
        error.message?.includes('Authentication') ||
        error.message?.includes('School (tenant) not found') ||
        error.extensions?.code === 'UNAUTHENTICATED' ||
        error.extensions?.code === 'UNAUTHORIZEDEXCEPTION' ||
        error.extensions?.code === 'NOTFOUNDEXCEPTION'
      );
      
      if (hasAuthError) {
        return NextResponse.json(
          { error: 'Authentication failed. Please log in again.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Error fetching students', details: result.errors },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
} 