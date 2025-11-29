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
      userMessage: 'Time slot management feature is currently being developed. Your changes are saved locally.'
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
  // Clone the response so we can read it multiple times if needed
  const clonedResponse = response.clone();
  
  try {
    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await clonedResponse.text();
      console.error('Non-JSON response from GraphQL API:', text.substring(0, 200));

      // Detect HTML error pages (authentication failures, server errors)
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        throw new Error('Authentication failed or server returned HTML error page');
      }

      throw new Error(`Expected JSON response, got ${contentType || 'unknown content type'}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof TypeError) {
      // Handle JSON parsing errors - use cloned response since original may be consumed
      try {
        const text = await clonedResponse.text();
        console.error('JSON parsing error:', text.substring(0, 200));

        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          throw new Error('Authentication failed or server returned HTML error page');
        }

        throw new Error(`Invalid JSON response from GraphQL API: ${error.message}`);
      } catch (textError) {
        // If we can't read the cloned response either, just throw the original error
        throw new Error(`Invalid JSON response from GraphQL API: ${error.message}`);
      }
    }

    // Re-throw other errors
    throw error;
  }
}

// Enhanced error handling for GraphQL calls
async function handleGraphQLCall(apiCall: () => Promise<Response>): Promise<any> {
  try {
    const response = await apiCall();

    // Always try to parse the response first, even for error status codes
    // GraphQL returns errors in the response body, not just HTTP status codes
    let parsedResponse: any;
    try {
      parsedResponse = await safelyParseResponse(response);
    } catch (parseError) {
      // If parsing fails, fall back to HTTP status code handling
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

    // Check for GraphQL errors in the parsed response
    // GraphQL can return 200 with errors in the body, or error status codes with errors
    if (parsedResponse.errors) {
      // Return the parsed response with errors so the caller can handle them
      return parsedResponse;
    }

    // If response is not ok but has no GraphQL errors, handle HTTP errors
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

    // Success case - return parsed response
    return parsedResponse;
  } catch (error) {
    if (error instanceof Error) {
      console.error('GraphQL API Error:', error.message);
      throw error;
    }
    throw new Error('Unknown error occurred while calling GraphQL API');
  }
}

export async function POST(request: Request) {
  // Construct full URL for internal GraphQL proxy route
  const requestUrl = new URL(request.url);
  const GRAPHQL_ENDPOINT = `${requestUrl.origin}/api/graphql`;
  try {
    const timeSlotData = await request.json();

    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    const tenantId = cookieStore.get('tenantId')?.value;

    // Debug logging for cookie issues
    console.log('Time Slot POST - Cookie Debug:', {
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

    // Handle bulk time slot creation or single time slot creation
    const isBulkCreation = Array.isArray(timeSlotData);
    const timeSlots = isBulkCreation ? timeSlotData : [timeSlotData];

    // Prepare the GraphQL mutation
    const mutation = timeSlots.map((slot, index) => `
      slot${index + 1}: createTimeSlot(input: {
        periodNumber: ${slot.periodNumber}
        displayTime: "${slot.displayTime}"
        startTime: "${slot.startTime}"
        endTime: "${slot.endTime}"
        color: "${slot.color}"
      }) {
        id
        periodNumber
        displayTime
        startTime
        endTime
        color
      }
    `).join('\n');

    const fullMutation = `
      mutation CreateTimeSlots {
        ${mutation}
      }
    `;

    console.log('Create TimeSlot Debug:', {
      timeSlots,
      tenantId,
      fullMutation
    });

    // Call internal GraphQL proxy - forward cookies for authentication
    const result = await handleGraphQLCall(async () => {
      // Forward all cookies from the original request
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

      // Check if this is a schema implementation error that can be handled gracefully
      const firstError = result.errors[0];
      const errorClassification = classifyGraphQLError(firstError);

      if (errorClassification.type === GraphQLErrorType.SCHEMA_NOT_IMPLEMENTED) {
        // Return user-friendly response for schema limitations
        console.warn('Time slot schema not implemented, returning success for local operation');
        return NextResponse.json({
          success: true,
          message: errorClassification.userMessage,
          featureNotAvailable: true,
          data: result.data || {}
        });
      }

      // For authentication errors, return 401 status
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

      // For other GraphQL errors, return user-friendly message
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
    console.error('Error creating time slot:', error);
    return NextResponse.json(
      { error: 'Failed to create time slot' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Construct full URL for internal GraphQL proxy route
  const requestUrl = new URL(request.url);
  const GRAPHQL_ENDPOINT = `${requestUrl.origin}/api/graphql`;
  try {
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    const tenantId = cookieStore.get('tenantId')?.value;

    // Debug logging for cookie issues
    const allCookies = cookieStore.getAll();
    console.log('Time Slot GET - Cookie Debug:', {
      hasAccessToken: !!token,
      tokenLength: token?.length || 0,
      hasTenantId: !!tenantId,
      cookieCount: allCookies.length,
      cookieNames: allCookies.map(c => c.name),
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

    // Prepare the GraphQL query for fetching time slots
    const query = `
      query GetTimeSlots {
        getTimeSlots {
          id
          periodNumber
          displayTime
          startTime
          endTime
          color
        }
      }
    `;

    console.log('Get TimeSlots Debug:', {
      tenantId,
      query
    });

    // Call internal GraphQL proxy - forward cookies for authentication
    const result = await handleGraphQLCall(async () => {
      // Forward all cookies from the original request
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

    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);

      // Check if this is a schema implementation error that can be handled gracefully
      const firstError = result.errors[0];
      const errorClassification = classifyGraphQLError(firstError);

      if (errorClassification.type === GraphQLErrorType.SCHEMA_NOT_IMPLEMENTED) {
        // Return user-friendly response for schema limitations
        console.warn('Time slots query schema not implemented, returning empty result');
        return NextResponse.json({
          success: true,
          message: errorClassification.userMessage,
          featureNotAvailable: true,
          data: { getTimeSlots: [] }
        });
      }

      // For authentication errors, return 401 status
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

      // For other GraphQL errors, return user-friendly message
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
    console.error('Error fetching time slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time slots' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  // Construct full URL for internal GraphQL proxy route
  const requestUrl = new URL(request.url);
  const GRAPHQL_ENDPOINT = `${requestUrl.origin}/api/graphql`;
  try {
    const { id, ...updateData } = await request.json();

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

    // Prepare the GraphQL mutation for updating
    // Note: The schema expects 'id' as a separate argument, not inside 'input'
    const mutation = `
      mutation UpdateTimeSlot($id: String!, $input: UpdateTimeSlotInput!) {
        updateTimeSlot(id: $id, input: $input) {
          id
          periodNumber
          displayTime
          startTime
          endTime
          color
        }
      }
    `;

    console.log('Update TimeSlot Debug:', {
      id,
      updateData,
      tenantId,
      mutation
    });

    // Call internal GraphQL proxy - forward cookies for authentication
    const result = await handleGraphQLCall(async () => {
      // Forward all cookies from the original request
      const cookieHeader = request.headers.get('cookie');

      return await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader && { 'Cookie': cookieHeader }),
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            id,
            input: {
              ...updateData,
              ...(tenantId && { tenantId })
            }
          }
        })
      });
    });

    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);

      // Check if this is a schema implementation error that can be handled gracefully
      const firstError = result.errors[0];
      const errorClassification = classifyGraphQLError(firstError);

      if (errorClassification.type === GraphQLErrorType.SCHEMA_NOT_IMPLEMENTED) {
        // Return user-friendly response for schema limitations
        console.warn('Time slot update schema not implemented, returning success for local operation');
        return NextResponse.json({
          success: true,
          message: errorClassification.userMessage,
          featureNotAvailable: true,
          data: result.data || { updateTimeSlot: updateData }
        });
      }

      // For other GraphQL errors, return user-friendly message
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
    console.error('Error updating time slot:', error);
    return NextResponse.json(
      { error: 'Failed to update time slot' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  // Construct full URL for internal GraphQL proxy route
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
      // Delete all time slots
      mutation = `
        mutation DeleteAllTimeSlots {
          deleteAllTimeSlots
        }
      `;
    } else if (id) {
      // Delete single time slot
      mutation = `
        mutation DeleteTimeSlot($id: String!) {
          deleteTimeSlot(id: $id)
        }
      `;
      variables = { id };
    } else {
      return NextResponse.json(
        { error: 'Either time slot ID or all=true parameter is required' },
        { status: 400 }
      );
    }

    console.log('Delete TimeSlot Debug:', {
      id,
      deleteAll,
      tenantId,
      mutation
    });

    // Call internal GraphQL proxy - forward cookies for authentication
    const result = await handleGraphQLCall(async () => {
      // Forward all cookies from the original request
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

      // Check if this is a schema implementation error that can be handled gracefully
      const firstError = result.errors[0];
      const errorClassification = classifyGraphQLError(firstError);

      if (errorClassification.type === GraphQLErrorType.SCHEMA_NOT_IMPLEMENTED) {
        // Return user-friendly response for schema limitations
        console.warn('Time slot delete schema not implemented, returning success for local operation');
        return NextResponse.json({
          success: true,
          message: errorClassification.userMessage,
          featureNotAvailable: true,
          data: deleteAll ? { deleteAllTimeSlots: true } : { deleteTimeSlot: true }
        });
      }

      // For other GraphQL errors, return user-friendly message
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
    console.error('Error deleting time slot:', error);
    return NextResponse.json(
      { error: 'Failed to delete time slot' },
      { status: 500 }
    );
  }
}