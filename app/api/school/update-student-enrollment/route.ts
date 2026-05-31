import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    const { studentId, tenantGradeLevelId, streamId } = await request.json();

    if (!studentId || !tenantGradeLevelId) {
      return NextResponse.json(
        { error: 'studentId and tenantGradeLevelId are required' },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 },
      );
    }

    const input: Record<string, string> = {
      studentId,
      tenantGradeLevelId,
    };

    if (streamId) {
      input.streamId = streamId;
    }

    const mutation = `
      mutation UpdateStudentEnrollment($input: UpdateStudentEnrollmentInput!) {
        updateStudentEnrollment(input: $input) {
          id
          gradeLevelId
          gradeLevelName
          streamId
          streamName
        }
      }
    `;

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { input },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json(
        {
          error:
            result.errors[0]?.message || 'Error updating student enrollment',
          details: result.errors,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error updating student enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to update student enrollment' },
      { status: 500 },
    );
  }
}
