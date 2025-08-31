import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function GET(request: Request) {
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

    // Get tenantId from cookies
    const tenantId = cookieStore.get('tenantId')?.value;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID not found in cookies. Please log in again.' },
        { status: 400 }
      );
    }

    console.log('Teachers API - Token present:', !!token);
    console.log('Teachers API - Token value:', token?.substring(0, 20) + '...');
    console.log('Teachers API - Tenant ID:', tenantId);
    console.log('Teachers API - Role being queried: TEACHER');

    // Revert to working usersByTenant query
    const query = `
      query GetTeachersByTenant($tenantId: String!, $role: String!) {
        usersByTenant(tenantId: $tenantId, role: $role) {
          id
          name
          email
        }
      }
    `;

    const variables = {
      tenantId,
      role: 'TEACHER'
    };

    console.log('Teachers API - GraphQL variables:', variables);

    // Call external GraphQL API
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    const result = await response.json();
    console.log('Teachers API - GraphQL response:', result);
    console.log('Teachers API - Response status:', response.status);

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
        { error: 'Error fetching teachers', details: result.errors },
        { status: 500 }
      );
    }

    console.log('Teachers API - Returning data:', result.data);
    console.log('Teachers API - Teachers count:', result.data?.usersByTenant?.length || 0);
    
    // Log each teacher for debugging
    if (result.data?.usersByTenant) {
      result.data.usersByTenant.forEach((teacher: any, index: number) => {
        console.log(`Teachers API - Teacher ${index + 1}:`, teacher);
      });
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
} 