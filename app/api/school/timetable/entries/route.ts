import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Use internal GraphQL proxy route instead of external endpoint
const GRAPHQL_ENDPOINT = 'http://localhost:3004/api/graphql';

// Enhanced error handling for GraphQL calls
async function handleGraphQLCall(apiCall: () => Promise<Response>): Promise<any> {
  try {
    const response = await apiCall();

    // Always try to parse the response first, even for error status codes
    // GraphQL returns errors in the response body, not just HTTP status codes
    let parsedResponse: any;
    try {
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const errorText = response.statusText || 'Unknown error';
        throw new Error(`Expected JSON response, got ${contentType || 'unknown content type'}`);
      }

      parsedResponse = await response.json();
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
    const { termId, gradeId, entries } = await request.json();

    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    if (!termId || !gradeId || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'Missing required fields: termId, gradeId, and entries array are required' },
        { status: 400 }
      );
    }

    // Prepare the GraphQL mutation
    const mutation = `
      mutation BulkCreateEntries($input: BulkCreateTimetableEntriesInput!) {
        bulkCreateTimetableEntries(input: $input) {
          id
          dayOfWeek
          timeSlot {
            periodNumber
          }
          subject {
            name
          }
        }
      }
    `;

    // Prepare variables
    const variables = {
      input: {
        termId,
        gradeId,
        entries: entries.map((entry: any) => ({
          subjectId: entry.subjectId,
          teacherId: entry.teacherId,
          timeSlotId: entry.timeSlotId,
          dayOfWeek: entry.dayOfWeek,
          roomNumber: entry.roomNumber || null,
        })),
      },
    };

    console.log('Bulk Create Timetable Entries Debug:', {
      termId,
      gradeId,
      entryCount: entries.length,
      mutation,
      variables,
    });

    // Call external GraphQL API with enhanced error handling
    const result = await handleGraphQLCall(async () => {
      return await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      });
    });

    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json(
        {
          error: 'Failed to create timetable entries',
          details: result.errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error creating bulk timetable entries:', error);
    return NextResponse.json(
      { error: 'Failed to create timetable entries' },
      { status: 500 }
    );
  }
}

