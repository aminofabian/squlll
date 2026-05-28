import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { resolveGraphqlEndpoint } from '@/lib/graphql-endpoint';

const GRAPHQL_ENDPOINT = resolveGraphqlEndpoint();

type GraphQLError = {
  extensions?: { code?: string };
  message?: string;
};

function toGraphQLError(error: unknown): GraphQLError {
  if (typeof error === 'object' && error !== null) {
    return error as GraphQLError;
  }
  return {};
}

export async function POST(request: Request) {
  try {
    const { levelNames } = await request.json();
    
    const cookieStore = await cookies();
    let token: string | undefined;
    let tokenSource = 'none';

    // Prefer Authorization header (client localStorage) — httpOnly cookie may be stale or from another env
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      tokenSource = 'authorization_header';
    } else {
      token = cookieStore.get('accessToken')?.value;
      tokenSource = token ? 'cookies' : 'none';
    }
    
    console.log('🔍 Debug - Token found:', token ? `${token.substring(0, 30)}...` : 'No token');
    console.log('🔍 Debug - Token source:', tokenSource);
    console.log('🔍 Debug - All cookies:', Object.fromEntries(
      Array.from(cookieStore.getAll().map(cookie => [cookie.name, cookie.value.substring(0, 20) + '...']))
    ));
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Prepare GraphQL mutation
    const levelNamesString = levelNames.map((name: string) => `"${name}"`).join(',\n');
    const mutation = `
      mutation {
        configureSchoolLevelsByNames(levelNames: [
          ${levelNamesString}
        ]) {
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
      query: mutation
    };
    

    console.log('🔍 Debug - Request details:');
    console.log('  - Endpoint:', GRAPHQL_ENDPOINT);
    console.log('  - Level names received:', levelNames);
    console.log('  - Level names count:', levelNames?.length || 0);
    console.log('  - Level names array:', JSON.stringify(levelNames, null, 2));
    console.log('  - Auth header:', `Bearer ${token.substring(0, 30)}...`);
    console.log('  - Request body:', JSON.stringify(requestBody, null, 2));
    
    const tenantId = cookieStore.get('tenantId')?.value;
    let tenantSubdomain = cookieStore.get('tenantSubdomain')?.value;
    if (!tenantSubdomain) {
      const host = request.headers.get('host') ?? '';
      const sub = host.match(/^([^.]+)\.localhost(?::\d+)?$/)?.[1];
      if (sub && sub !== 'localhost') {
        tenantSubdomain = sub;
      }
    }

    const graphqlHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    if (tenantId) {
      graphqlHeaders['x-tenant-id'] = tenantId;
    }
    if (tenantSubdomain) {
      graphqlHeaders['x-tenant-subdomain'] = tenantSubdomain;
    }

    let response: Response;
    try {
      response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: graphqlHeaders,
        body: JSON.stringify(requestBody),
      });
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : 'Unknown network error';
      const refused =
        message.includes('ECONNREFUSED') ||
        (fetchError instanceof Error &&
          'cause' in fetchError &&
          String(fetchError.cause).includes('ECONNREFUSED'));

      console.error('Configure-levels fetch failed:', {
        endpoint: GRAPHQL_ENDPOINT,
        error: fetchError,
      });

      return NextResponse.json(
        {
          error: 'BACKEND_UNAVAILABLE',
          message: refused
            ? `Cannot reach the API at ${GRAPHQL_ENDPOINT}. Start the backend with: cd backend && npm run start:dev`
            : `Cannot reach the API at ${GRAPHQL_ENDPOINT}: ${message}`,
        },
        { status: 503 },
      );
    }

    console.log('🔍 Debug - Response status:', response.status);
    console.log('🔍 Debug - Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    let result: { data?: unknown; errors?: unknown[] };
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      console.error('Configure-levels non-JSON response:', responseText.slice(0, 500));
      return NextResponse.json(
        {
          error: 'INVALID_BACKEND_RESPONSE',
          message: `API at ${GRAPHQL_ENDPOINT} did not return JSON (status ${response.status}).`,
        },
        { status: 502 },
      );
    }
    console.log('🔍 Debug - Full response:', JSON.stringify(result, null, 2));
    
    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      
      // Check for permission denied errors
      const permissionDeniedError = result.errors.find((error) => {
        const e = toGraphQLError(error);
        return (
          e.extensions?.code === 'FORBIDDENEXCEPTION' ||
          (Boolean(e.message?.includes('Access denied')) &&
            Boolean(e.message?.includes('Required roles')))
        );
      });

      if (permissionDeniedError) {
        return NextResponse.json(
          {
            error: 'PERMISSION_DENIED',
            message:
              toGraphQLError(permissionDeniedError).message ||
              'You need school admin rights to complete setup. Try signing in again after registration.',
            action: 'redirect_to_login',
            details: result.errors,
          },
          { status: 403 },
        );
      }
      
      // Check if the school is already configured
      const alreadyConfiguredError = result.errors.find((error) => {
        const e = toGraphQLError(error);
        return (
          e.extensions?.code === 'BADREQUESTEXCEPTION' &&
          e.message === 'School has already been configured'
        );
      });
      
      if (alreadyConfiguredError) {
        return NextResponse.json(
          { 
            error: 'SCHOOL_ALREADY_CONFIGURED',
            message: 'School has already been configured',
            action: 'redirect_to_dashboard'
          },
          { status: 400 }
        );
      }

      const unauthorizedError = result.errors.find((error) => {
        const e = toGraphQLError(error);
        return (
          e.extensions?.code === 'UNAUTHORIZED' ||
          Boolean(e.message?.toLowerCase().includes('access token'))
        );
      });

      if (unauthorizedError) {
        return NextResponse.json(
          {
            error: 'UNAUTHORIZED',
            message:
              'Session expired or token was issued for a different environment. Log out, register/sign in again against your local API (port 3001), then retry setup.',
            details: result.errors,
          },
          { status: 401 },
        );
      }

      const schoolSetupBlocked = result.errors.find((error) => {
        const e = toGraphQLError(error);
        return Boolean(
          e.message?.toLowerCase().includes('school setup incomplete'),
        );
      });

      if (schoolSetupBlocked) {
        return NextResponse.json(
          {
            error: 'SCHOOL_SETUP_BLOCKED',
            message: toGraphQLError(schoolSetupBlocked).message,
            details: result.errors,
          },
          { status: 403 },
        );
      }
      
      return NextResponse.json(
        { error: 'Error configuring school levels', details: result.errors },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error configuring school levels:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to configure school levels',
        message,
      },
      { status: 500 },
    );
  }
} 