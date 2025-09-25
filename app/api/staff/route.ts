import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

// Mark the route as dynamic to prevent static generation issues
export const dynamic = 'force-dynamic';

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

    console.log('Staff API - Token present:', !!token);
    console.log('Staff API - Tenant ID:', tenantId);

    // GraphQL query for fetching staff by tenant
    const query = `
      query GetStaffByTenant($tenantId: String!, $role: String!) {
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
          role: 'STAFF'
        }
      })
    });

    const result = await response.json();

    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json(
        { error: 'Error fetching staff', details: result.errors },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
} 