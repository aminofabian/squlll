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

    console.log('Test Users API - Tenant ID:', tenantId);

    // Test different roles to see what exists
    const roles = ['TEACHER', 'STAFF', 'STUDENT', 'ADMIN', 'PARENT'];
    const results: any = {};

    for (const role of roles) {
      const query = `
        query GetUsersByTenant($tenantId: String!, $role: String!) {
          usersByTenant(tenantId: $tenantId, role: $role) {
            id
            name
            email
          }
        }
      `;

      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            query,
            variables: { tenantId, role }
          })
        });

        const result = await response.json();
        results[role] = {
          count: result.data?.usersByTenant?.length || 0,
          users: result.data?.usersByTenant || [],
          errors: result.errors || null
        };
      } catch (error) {
        results[role] = {
          count: 0,
          users: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      tenantId,
      results
    });
  } catch (error) {
    console.error('Error in test users API:', error);
    return NextResponse.json(
      { error: 'Failed to test users' },
      { status: 500 }
    );
  }
} 