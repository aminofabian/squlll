import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    // Get the data from the request
    const { createTeacherDto, tenantId } = await request.json();
    console.log('Received teacher invitation data:', { createTeacherDto, tenantId });
    
    // Remove tenantId from createTeacherDto if it somehow got included there
    // Create a clean DTO object that doesn't include tenantId
    const cleanedTeacherDto = { ...createTeacherDto };
    delete cleanedTeacherDto.tenantId;
    
    // Get access token from cookies - Next.js App Router way
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    
    if (!accessToken) {
      console.error('No access token found in cookies');
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Use proper GraphQL variables - matching the pattern from create-teacher/route.ts
    const inviteTeacherMutation = `
      mutation InviteTeacher($tenantId: String!, $createTeacherDto: CreateTeacherInvitationDto!) {
        inviteTeacher(
          createTeacherDto: $createTeacherDto
          tenantId: $tenantId
        ) {
          email
          fullName
          status
          createdAt
        }
      }
    `;

    // Prepare the request body - separating tenantId from createTeacherDto
    const requestBody = {
      query: inviteTeacherMutation,
      variables: {
        tenantId: tenantId,
        createTeacherDto: cleanedTeacherDto
      }
    };

    console.log('Sending GraphQL request to:', GRAPHQL_ENDPOINT);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const graphqlApiResponse = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('GraphQL response status:', graphqlApiResponse.status);
    
    if (!graphqlApiResponse.ok) {
      const errorText = await graphqlApiResponse.text();
      console.error('GraphQL request failed:', errorText);
      return NextResponse.json(
        { error: 'GraphQL request failed', details: errorText },
        { status: graphqlApiResponse.status }
      );
    }

    const result = await graphqlApiResponse.json();
    console.log('GraphQL response:', result);
    
    if (result.errors) {
      console.error('InviteTeacher mutation failed:', result.errors);
      const errorMessage = result.errors[0]?.message || 'Error inviting teacher';
      return NextResponse.json(
        { error: errorMessage, details: result.errors },
        { status: 400 }
      );
    }

    const teacherRecord = result.data?.inviteTeacher;
    console.log('Successfully invited teacher:', teacherRecord);

    return NextResponse.json({
      success: true,
      teacher: teacherRecord
    });
  } catch (error) {
    console.error('Error inviting teacher:', error);
    return NextResponse.json(
      { error: 'Failed to invite teacher', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
