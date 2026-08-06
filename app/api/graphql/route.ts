import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { resolveUpstreamGraphqlEndpoint } from '@/lib/graphql-endpoint';

/** Best-effort tenantId from a JWT payload (dual-flow local Nest has no JWT strategy). */
function tenantIdFromJwt(token?: string): string | undefined {
  if (!token) return undefined;
  try {
    const payload = token.split('.')[1];
    if (!payload) return undefined;
    const json = JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
        'utf8',
      ),
    ) as { tenantId?: string; tenant_id?: string };
    const id = json.tenantId || json.tenant_id;
    return typeof id === 'string' && id.trim() ? id.trim() : undefined;
  } catch {
    return undefined;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, x-tenant-id, x-tenant-subdomain',
    },
  });
}

export async function POST(request: Request) {
  let GRAPHQL_ENDPOINT = resolveUpstreamGraphqlEndpoint();
  try {
    const cookieStore = await cookies();
    const authHeader = request.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : undefined;
    const token =
      tokenFromHeader ?? cookieStore.get('accessToken')?.value;
    const tenantId =
      request.headers.get('x-tenant-id')?.trim() ||
      cookieStore.get('tenantId')?.value ||
      tenantIdFromJwt(token);
    let tenantSubdomain =
      request.headers.get('x-tenant-subdomain')?.trim() ||
      cookieStore.get('tenantSubdomain')?.value;
    if (!tenantSubdomain) {
      const host = request.headers.get('host') ?? '';
      // Local: school.localhost:3000 · Prod: school.squl.co.ke
      const sub = host.match(
        /^([a-z0-9-]+)\.(localhost|squl\.co\.ke)(?::\d+)?$/i,
      )?.[1];
      if (sub && sub !== 'localhost' && sub !== 'www') {
        tenantSubdomain = sub.toLowerCase();
      }
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('GraphQL API Route - Failed to parse request body:', parseError);
      return NextResponse.json(
        {
          errors: [{
            message: 'Invalid request body. Expected JSON.',
            extensions: { code: 'INVALID_REQUEST' }
          }]
        },
        { status: 400 }
      );
    }

    const queryText = typeof body.query === 'string' ? body.query : '';
    GRAPHQL_ENDPOINT = resolveUpstreamGraphqlEndpoint(queryText);

    console.log('GraphQL API Route - Request body:', {
      query: body.query?.substring(0, 100) + '...',
      operationName: body.operationName,
      hasTenantId: !!tenantId,
      hasToken: !!token,
      upstream: GRAPHQL_ENDPOINT,
    });

    // Add tenantId to variables if it exists and isn't already provided
    if (tenantId && body.variables && !body.variables.tenantId) {
      body.variables.tenantId = tenantId;
    }

    // Log the request for debugging purposes
    console.log(`Forwarding GraphQL request to ${GRAPHQL_ENDPOINT}`);
    if (body.query && body.query.includes('feeStructures')) {
      console.log('Request includes fee structures query');
    }

    let response;
    try {
      const upstreamHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        upstreamHeaders.Authorization = `Bearer ${token}`;
      }
      if (tenantId) {
        upstreamHeaders['x-tenant-id'] = tenantId;
      }
      if (tenantSubdomain) {
        upstreamHeaders['x-tenant-subdomain'] = tenantSubdomain;
      }

      const isBatchMutation =
        queryText.includes('createAssessmentsBatch') ||
        queryText.includes('CreateAssessmentsBatch') ||
        queryText.includes('createExamSession') ||
        queryText.includes('CreateExamSession');
      const isExamSessionCreate =
        queryText.includes('createExamSession') ||
        queryText.includes('CreateExamSession');
      const upstreamTimeoutMs = isExamSessionCreate
        ? 180_000
        : isBatchMutation
          ? 60_000
          : 25_000;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), upstreamTimeoutMs);
      try {
        response = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: upstreamHeaders,
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (fetchError) {
      const isAbort = fetchError instanceof Error && fetchError.name === 'AbortError';
      console.error('GraphQL API Route - Fetch error:', {
        error: fetchError,
        message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        stack: fetchError instanceof Error ? fetchError.stack : undefined,
        endpoint: GRAPHQL_ENDPOINT
      });
      return NextResponse.json(
        {
          errors: [{
            message: isAbort
              ? 'GraphQL request timed out. The backend may be busy or unavailable. Please try again.'
              : `Failed to connect to GraphQL endpoint: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
            extensions: { 
              code: isAbort ? 'TIMEOUT_ERROR' : 'NETWORK_ERROR',
              endpoint: GRAPHQL_ENDPOINT
            }
          }]
        },
        { status: isAbort ? 504 : 503 }
      );
    }

    console.log('GraphQL API Route - External API response status:', response.status);
    console.log('GraphQL API Route - Response headers:', Object.fromEntries(response.headers.entries()));

    let data;
    try {
      const responseText = await response.text();
      console.log('GraphQL API Route - Raw response text (first 500 chars):', responseText.substring(0, 500));
      
      if (!responseText) {
        console.error('GraphQL API Route - Empty response from external API');
        return NextResponse.json(
          {
            errors: [{
              message: 'Empty response from GraphQL endpoint',
              extensions: { code: 'EMPTY_RESPONSE' }
            }]
          },
          { status: 502 }
        );
      }

      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        const contentType = response.headers.get('content-type') ?? '';
        const isHtml =
          contentType.includes('text/html') ||
          responseText.trimStart().startsWith('<!DOCTYPE');

        console.error('GraphQL API Route - Failed to parse JSON response:', {
          error: jsonError,
          endpoint: GRAPHQL_ENDPOINT,
          responseText: responseText.substring(0, 1000),
          contentType,
        });

        return NextResponse.json(
          {
            errors: [{
              message: isHtml
                ? `GraphQL proxy received HTML from ${GRAPHQL_ENDPOINT}. Check GRAPHQL_API_URL / LOCAL_GRAPHQL_API_URL, restart Next, and ensure the target Nest API is running.`
                : 'Invalid JSON response from GraphQL endpoint',
              extensions: {
                code: 'INVALID_JSON_RESPONSE',
                endpoint: GRAPHQL_ENDPOINT,
                responsePreview: responseText.substring(0, 200),
              },
            }],
          },
          { status: 502 },
        );
      }
    } catch (readError) {
      console.error('GraphQL API Route - Failed to read response:', readError);
      return NextResponse.json(
        {
          errors: [{
            message: `Failed to read response: ${readError instanceof Error ? readError.message : 'Unknown error'}`,
            extensions: { code: 'RESPONSE_READ_ERROR' }
          }]
        },
        { status: 502 }
      );
    }

    console.log('GraphQL API Route - Response data:', data);

    // Handle both standard GraphQL errors format and top-level error format
    if (data.errors) {
      console.error('GraphQL API Route - GraphQL errors:', data.errors);
      
      // Check if any error is an authentication error (Unauthorized or Forbidden)
      const hasAuthError = data.errors.some((error: any) => 
        error.message?.includes('Unauthorized') ||
        error.message?.includes('Tenant context required') ||
        error.message?.includes('Forbidden resource') ||
        error.extensions?.code === 'UNAUTHORIZEDEXCEPTION' ||
        error.extensions?.code === 'FORBIDDENEXCEPTION' ||
        error.extensions?.code === 'FORBIDDEN' ||
        error.extensions?.code === 'UNAUTHORIZED' ||
        error.extensions?.code === 'UNAUTHENTICATED'
      );
      
      if (hasAuthError) {
        return NextResponse.json({
          data: null,
          errors: [{
            message: 'Authentication required. Please log in again.',
            extensions: { 
              code: 'AUTHENTICATION_REQUIRED',
              redirectToLogin: true
            }
          }]
        }, { status: 401 });
      }

      const statusFromError = data.errors.find(
        (e: { extensions?: { statusCode?: number } }) =>
          typeof e.extensions?.statusCode === 'number',
      )?.extensions?.statusCode;

      const httpStatus =
        statusFromError && statusFromError >= 400 && statusFromError < 600
          ? statusFromError
          : 500;

      return NextResponse.json(data, { status: httpStatus });
    }
    
    // Handle top-level error format (e.g., {error: "message"})
    if (data.error) {
      console.error('GraphQL API Route - Top-level error:', data.error);
      
      // Check if it's a grade levels not found error
      if (typeof data.error === 'string' && data.error.includes('Grade levels not found')) {
        // Transform to standard GraphQL error format
        return NextResponse.json({
          data: null,
          errors: [{
            message: data.error,
            extensions: { 
              code: 'GRADE_LEVELS_NOT_FOUND',
              originalError: data.error 
            }
          }]
        }, { status: 200 }); // Return 200 but with errors so client can handle gracefully
      }
      
      // For other top-level errors, convert to standard format
      return NextResponse.json({
        data: null,
        errors: [{
          message: data.error,
          extensions: { code: 'EXTERNAL_API_ERROR' }
        }]
      }, { status: 500 });
    }

    console.log('GraphQL API Route - Success response');
    return NextResponse.json(data);
  } catch (error) {
    console.error('GraphQL API Route - Unexpected proxy error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : typeof error,
      endpoint: GRAPHQL_ENDPOINT
    });
    return NextResponse.json(
      {
        errors: [{
          message: `Failed to proxy GraphQL request: ${error instanceof Error ? error.message : 'Unknown error'}`,
          extensions: { 
            code: 'INTERNAL_SERVER_ERROR',
            originalError: error instanceof Error ? error.message : String(error)
          }
        }]
      },
      { status: 500 }
    );
  }
} 