import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Use internal GraphQL proxy route instead of external endpoint
const GRAPHQL_ENDPOINT = 'http://localhost:3004/api/graphql';

// GraphQL Error Classification
enum GraphQLErrorType {
  SCHEMA_NOT_IMPLEMENTED = 'schema_not_implemented',
  AUTH_ERROR = 'auth_error',
  VALIDATION_ERROR = 'validation_error',
  NETWORK_ERROR = 'network_error',
  SERVER_ERROR = 'server_error'
}

// Helper functions for GraphQL error detection
function classifyGraphQLError(error: any): { type: GraphQLErrorType; userMessage: string } {
  const message = error.message || '';

  // Schema implementation errors
  if (message.includes('Unknown type') || message.includes('Cannot query field')) {
    return {
      type: GraphQLErrorType.SCHEMA_NOT_IMPLEMENTED,
      userMessage: 'Teacher management feature is currently being developed. Your changes are saved locally.'
    };
  }

  // Authentication errors
  if (
    message.includes('Authentication required') || 
    message.includes('Access denied') ||
    message.includes('AUTHENTICATION_REQUIRED') ||
    error.extensions?.code === 'AUTHENTICATION_REQUIRED' ||
    error.extensions?.code === 'UNAUTHENTICATED'
  ) {
    return {
      type: GraphQLErrorType.AUTH_ERROR,
      userMessage: 'Please log in to save changes to the server.'
    };
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid')) {
    return {
      type: GraphQLErrorType.VALIDATION_ERROR,
      userMessage: 'Please check your input and try again.'
    };
  }

  // Default network/server error
  return {
    type: GraphQLErrorType.SERVER_ERROR,
    userMessage: 'Server temporarily unavailable. Your changes are saved locally.'
  };
}

// Safe response parsing function to handle HTML and non-JSON responses
async function safelyParseResponse(response: Response): Promise<any> {
  const clonedResponse = response.clone();
  
  try {
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await clonedResponse.text();
      console.error('Non-JSON response from GraphQL API:', text.substring(0, 200));

      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        throw new Error('Authentication failed or server returned HTML error page');
      }

      throw new Error(`Expected JSON response, got ${contentType || 'unknown content type'}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof TypeError) {
      try {
        const text = await clonedResponse.text();
        console.error('JSON parsing error:', text.substring(0, 200));

        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          throw new Error('Authentication failed or server returned HTML error page');
        }

        throw new Error(`Invalid JSON response from GraphQL API: ${error.message}`);
      } catch (textError) {
        throw new Error(`Invalid JSON response from GraphQL API: ${error.message}`);
      }
    }

    throw error;
  }
}

// Enhanced error handling for GraphQL calls
async function handleGraphQLCall(apiCall: () => Promise<Response>): Promise<any> {
  try {
    const response = await apiCall();

    let parsedResponse: any;
    try {
      parsedResponse = await safelyParseResponse(response);
    } catch (parseError) {
      const errorText = response.statusText || 'Unknown error';
      
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in and refresh the page.');
      }
      if (response.status === 403) {
        throw new Error('Access denied. Insufficient permissions.');
      }
      if (response.status === 404) {
        throw new Error('GraphQL endpoint not found. Please check the API configuration.');
      }
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}. Please try again later.`);
      }

      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    if (parsedResponse.errors) {
      return parsedResponse;
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in and refresh the page.');
      }
      if (response.status === 403) {
        throw new Error('Access denied. Insufficient permissions.');
      }
      if (response.status === 404) {
        throw new Error('GraphQL endpoint not found. Please check the API configuration.');
      }
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}. Please try again later.`);
      }

      throw new Error(`HTTP error ${response.status}`);
    }

    return parsedResponse;
  } catch (error) {
    if (error instanceof Error) {
      console.error('GraphQL API Error:', error.message);
      throw error;
    }
    throw new Error('Unknown error occurred while calling GraphQL API');
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const GRAPHQL_ENDPOINT = `${requestUrl.origin}/api/graphql`;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    const tenantId = cookieStore.get('tenantId')?.value;

    console.log('Get Teachers - Cookie Debug:', {
      hasAccessToken: !!token,
      tokenLength: token?.length || 0,
      hasTenantId: !!tenantId,
      requestUrl: request.url,
      graphqlEndpoint: GRAPHQL_ENDPOINT,
    });

    if (!token) {
      return NextResponse.json(
        { 
          error: 'Authentication required. Please log in.',
          type: 'auth_error',
          details: [{ message: 'No access token found in cookies. Please log in again.' }]
        },
        { status: 401 }
      );
    }

    const query = `
      query GetTeachers {
        getTeachers {
          id
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
            id
            gradeLevel {
              name
            }
          }
          tenantStreams {
            id
          }
          classTeacherAssignments {
            id
            gradeLevel {
              gradeLevel {
                name
              }
            }
          }
          tenant {
            id
            name
          }
        }
      }
    `;

    console.log('Get Teachers Debug:', {
      tenantId,
      query
    });

    const result = await handleGraphQLCall(async () => {
      const cookieHeader = request.headers.get('cookie');

      return await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader && { 'Cookie': cookieHeader }),
        },
        body: JSON.stringify({
          query
        })
      });
    });

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);

      const firstError = result.errors[0];
      const errorClassification = classifyGraphQLError(firstError);

      if (errorClassification.type === GraphQLErrorType.SCHEMA_NOT_IMPLEMENTED) {
        console.warn('Teachers query schema not implemented, returning empty result');
        return NextResponse.json({
          success: true,
          message: errorClassification.userMessage,
          featureNotAvailable: true,
          data: { getTeachers: [] }
        });
      }

      if (errorClassification.type === GraphQLErrorType.AUTH_ERROR) {
        return NextResponse.json(
          {
            error: errorClassification.userMessage,
            type: errorClassification.type,
            details: result.errors
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: errorClassification.userMessage,
          type: errorClassification.type,
          details: result.errors
        },
        { status: 500 }
      );
    }

    // Wrap the GraphQL data in a 'data' property to match store expectations
    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}

