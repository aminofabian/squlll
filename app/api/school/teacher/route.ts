import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { resolveGraphqlEndpoint } from '@/lib/graphql-endpoint';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    const tenantId = cookieStore.get('tenantId')?.value;
    const GRAPHQL_ENDPOINT = resolveGraphqlEndpoint();

    if (!token && !tenantId) {
      return NextResponse.json(
        {
          error: 'Authentication required. Please log in.',
          type: 'auth_error',
        },
        { status: 401 },
      );
    }

    const query = `
      query GetTeachers {
        getTeachers {
          id
          isActive
          user {
            id
            name
            email
          }
          tenantSubjects {
            id
            name
          }
          tenantGradeLevels {
            gradeLevel {
              name
            }
          }
        }
      }
    `;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (tenantId) headers['x-tenant-id'] = tenantId;

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    if (result.errors) {
      return NextResponse.json(
        {
          error: result.errors[0]?.message || 'Failed to load teachers',
          errors: result.errors,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch teachers',
      },
      { status: 500 },
    );
  }
}
