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
      userMessage: 'Break management feature is currently being developed. Your changes are saved locally.'
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

function isGraphQLErrorUserFriendly(error: any): boolean {
  const { type } = classifyGraphQLError(error);
  return type === GraphQLErrorType.SCHEMA_NOT_IMPLEMENTED;
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

// Map frontend break type to GraphQL enum
function mapBreakTypeToGraphQL(type: string): string {
  const typeMap: Record<string, string> = {
    'short_break': 'SHORT_BREAK',
    'lunch': 'LUNCH',
    'assembly': 'ASSEMBLY',
  };
  return typeMap[type] || 'SHORT_BREAK';
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const GRAPHQL_ENDPOINT = `${requestUrl.origin}/api/graphql`;
  try {
    const breakData = await request.json();

    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    const tenantId = cookieStore.get('tenantId')?.value;

    console.log('Create Break POST - Cookie Debug:', {
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

    // Handle bulk break creation or single break creation
    const isBulkCreation = Array.isArray(breakData);
    const breaks = isBulkCreation ? breakData : [breakData];

    // Prepare the GraphQL mutation
    const mutation = breaks.map((breakItem, index) => {
      const alias = `break${index + 1}`;
      const graphQLType = mapBreakTypeToGraphQL(breakItem.type);
      // GraphQL dayOfWeek: 0 = Monday, 1 = Tuesday, etc. (0-indexed)
      // Frontend dayOfWeek: 1 = Monday, 2 = Tuesday, etc. (1-indexed)
      const dayOfWeek = breakItem.dayOfWeek - 1;
      
      return `
      ${alias}: createTimetableBreak(input: {
        name: "${breakItem.name}"
        type: ${graphQLType}
        dayOfWeek: ${dayOfWeek}
        afterPeriod: ${breakItem.afterPeriod}
        durationMinutes: ${breakItem.durationMinutes}
        icon: "${breakItem.icon || '☕'}"
        ${breakItem.color ? `color: "${breakItem.color}"` : ''}
      }) {
        id
        name
        type
        dayOfWeek
        afterPeriod
        durationMinutes
        icon
        color
      }
    `;
    }).join('\n');

    const fullMutation = `
      mutation CreateBreaks {
        ${mutation}
      }
    `;

    console.log('Create Break Debug:', {
      breaks,
      tenantId,
      fullMutation
    });

    // Call internal GraphQL proxy - forward cookies for authentication
    const result = await handleGraphQLCall(async () => {
      const cookieHeader = request.headers.get('cookie');

      return await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader && { 'Cookie': cookieHeader }),
        },
        body: JSON.stringify({
          query: fullMutation
        })
      });
    });

    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);

      const firstError = result.errors[0];
      const errorClassification = classifyGraphQLError(firstError);

      if (errorClassification.type === GraphQLErrorType.SCHEMA_NOT_IMPLEMENTED) {
        console.warn('Break schema not implemented, returning success for local operation');
        return NextResponse.json({
          success: true,
          message: errorClassification.userMessage,
          featureNotAvailable: true,
          data: result.data || {}
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
    console.error('Error creating break:', error);
    return NextResponse.json(
      { error: 'Failed to create break' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const GRAPHQL_ENDPOINT = `${requestUrl.origin}/api/graphql`;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    const tenantId = cookieStore.get('tenantId')?.value;

    console.log('Get Breaks - Cookie Debug:', {
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
      query GetBreaks {
        getTimetableBreaks {
          id
          name
          type
          dayOfWeek
          afterPeriod
          durationMinutes
          icon
          color
        }
      }
    `;

    console.log('Get Breaks Debug:', {
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
        console.warn('Breaks query schema not implemented, returning empty result');
        return NextResponse.json({
          success: true,
          message: errorClassification.userMessage,
          featureNotAvailable: true,
          data: { getTimetableBreaks: [] }
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
    console.error('Error fetching breaks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breaks' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const requestUrl = new URL(request.url);
  const GRAPHQL_ENDPOINT = `${requestUrl.origin}/api/graphql`;
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleteAll = searchParams.get('all') === 'true';

    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    const tenantId = cookieStore.get('tenantId')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Determine which mutation to use
    let mutation: string;
    let variables: any = {};

    if (deleteAll) {
      // Delete all breaks
      mutation = `
        mutation DeleteAllBreaks {
          deleteAllTimetableBreaks
        }
      `;
    } else if (id) {
      // Delete single break (if needed in the future)
      mutation = `
        mutation DeleteBreak($id: String!) {
          deleteTimetableBreak(id: $id)
        }
      `;
      variables = { id };
    } else {
      return NextResponse.json(
        { error: 'Either break ID or all=true parameter is required' },
        { status: 400 }
      );
    }

    console.log('Delete Break Debug:', {
      id,
      deleteAll,
      tenantId,
      mutation
    });

    // Call internal GraphQL proxy - forward cookies for authentication
    const result = await handleGraphQLCall(async () => {
      const cookieHeader = request.headers.get('cookie');

      return await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader && { 'Cookie': cookieHeader }),
        },
        body: JSON.stringify({
          query: mutation,
          ...(Object.keys(variables).length > 0 && { variables })
        })
      });
    });

    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);

      const firstError = result.errors[0];
      const errorClassification = classifyGraphQLError(firstError);

      if (errorClassification.type === GraphQLErrorType.SCHEMA_NOT_IMPLEMENTED) {
        console.warn('Break delete schema not implemented, returning success for local operation');
        return NextResponse.json({
          success: true,
          message: errorClassification.userMessage,
          featureNotAvailable: true,
          data: deleteAll ? { deleteAllTimetableBreaks: true } : { deleteTimetableBreak: true }
        });
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
    console.error('Error deleting break:', error);
    return NextResponse.json(
      { error: 'Failed to delete break' },
      { status: 500 }
    );
  }
}

