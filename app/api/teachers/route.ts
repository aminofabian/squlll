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
    console.log('Teachers API - Tenant ID:', tenantId);

    // GraphQL query for fetching teachers by tenant with role TEACHER
    const query = `
      query GetTeachersByTenant($tenantId: String!, $role: String!) {
        usersByTenant(tenantId: $tenantId, role: $role) {
          id
          name
          email
        }
      }
    `;

    // Call external GraphQL API
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables: {
          tenantId,
          role: 'TEACHER'
        }
      })
    });

    const result = await response.json();

    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json(
        { error: 'Error fetching teachers', details: result.errors },
        { status: 500 }
      );
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