import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

async function handleGraphQLCall(apiCall: () => Promise<Response>): Promise<any> {
  try {
    const response = await apiCall();
    let parsedResponse: any;
    try {
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error(
          `Expected JSON response, got ${contentType || 'unknown content type'}`,
        );
      }
      parsedResponse = await response.json();
    } catch (parseError) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in and refresh the page.');
      }
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    if (parsedResponse.errors) {
      return parsedResponse;
    }

    if (!response.ok) {
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

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const GRAPHQL_ENDPOINT = `${requestUrl.origin}/api/graphql`;

  try {
    const body = await request.json();
    const { termId, entries } = body;

    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 },
      );
    }

    if (!termId || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'Missing required fields: termId and entries array are required' },
        { status: 400 },
      );
    }

    const mutation = `
      mutation BulkCreateEntries($input: BulkCreateTimetableEntriesInput!) {
        bulkCreateTimetableEntries(input: $input) {
          createdCount
          entries {
            id
            dayTemplatePeriodId
            gradeLevelId
            streamId
            subjectId
            teacherId
            isDoublePeriod
          }
        }
      }
    `;

    const variables = {
      input: {
        termId,
        entries: entries.map((entry: any) => ({
          dayTemplatePeriodId:
            entry.dayTemplatePeriodId || entry.timeSlotId,
          gradeLevelId: entry.gradeLevelId || entry.gradeId || body.gradeId,
          streamId: entry.streamId || null,
          subjectId: entry.subjectId,
          teacherId: entry.teacherId,
          isDoublePeriod: entry.isDoublePeriod ?? false,
          roomName: entry.roomNumber || entry.roomName || null,
        })),
      },
    };

    const result = await handleGraphQLCall(async () => {
      return await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      });
    });

    if (result.errors) {
      return NextResponse.json(
        {
          error: 'Failed to create timetable entries',
          details: result.errors,
        },
        { status: 500 },
      );
    }

    // Normalize for callers that still expect a top-level array
    const payload = result.data?.bulkCreateTimetableEntries;
    return NextResponse.json({
      data: {
        bulkCreateTimetableEntries: payload?.entries ?? payload ?? [],
        createdCount: payload?.createdCount,
      },
    });
  } catch (error) {
    console.error('Error creating bulk timetable entries:', error);
    return NextResponse.json(
      { error: 'Failed to create timetable entries' },
      { status: 500 },
    );
  }
}
