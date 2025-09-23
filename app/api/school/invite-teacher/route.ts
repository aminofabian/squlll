import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    const { createTeacherDto, tenantId } = await request.json();
    
    // Get the token from cookies first
    const cookieStore = await cookies();
    let token = cookieStore.get('accessToken')?.value;
    let tokenSource = 'cookies';
    
    // If no token in cookies, check Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
        tokenSource = 'authorization_header';
      }
    }
    
    console.log('🔍 Debug - Invite Teacher API:', {
      token: token ? `${token.substring(0, 30)}...` : 'No token',
      tokenSource,
      tenantId,
      email: createTeacherDto?.email,
      fullName: createTeacherDto?.fullName
    });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    if (!createTeacherDto) {
      return NextResponse.json(
        { error: 'createTeacherDto is required' },
        { status: 400 }
      );
    }

    // Construct the GraphQL mutation
    // Only request fields supported by InviteTeacherResponse
    const mutation = `
      mutation InviteTeacher($createTeacherDto: CreateTeacherInvitationDto!) {
        inviteTeacher(createTeacherDto: $createTeacherDto) {
          email
          fullName
          status
          createdAt
        }
      }
    `;

    // Prepare the request body
    const requestBody = {
      query: mutation,
      variables: {
        createTeacherDto: createTeacherDto
      }
    };

    console.log('🔍 Debug - GraphQL Request:', {
      endpoint: GRAPHQL_ENDPOINT,
      mutation: mutation.substring(0, 100) + '...',
      variables: {
        createTeacherDto: {
          email: createTeacherDto.email,
          fullName: createTeacherDto.fullName,
          role: createTeacherDto.role,
          tenantSubjectIds: createTeacherDto.tenantSubjectIds?.length || 0,
          tenantGradeLevelIds: createTeacherDto.tenantGradeLevelIds?.length || 0,
          classTeacherTenantStreamId: createTeacherDto.classTeacherTenantStreamId,
          classTeacherTenantGradeLevelId: createTeacherDto.classTeacherTenantGradeLevelId
        }
      }
    });

    // Call external GraphQL API
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    console.log('🔍 Debug - GraphQL Response:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!data.data,
      hasErrors: !!data.errors,
      errorCount: data.errors?.length || 0
    });

    if (!response.ok) {
      console.error('❌ GraphQL request failed:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      return NextResponse.json(
        { 
          error: `GraphQL request failed: ${response.statusText}`,
          details: data
        },
        { status: response.status }
      );
    }

    // Handle GraphQL errors
    if (data.errors) {
      console.error('❌ GraphQL errors:', JSON.stringify(data.errors, null, 2));
      
      const first = data.errors[0] || {};
      const errorMessages = data.errors.map((error: any) => error.message).join(', ');
      const validationPayload = first.extensions?.exception?.response
        || first.extensions?.validation
        || first.extensions?.exception
        || null;

      return NextResponse.json(
        { 
          error: `GraphQL errors: ${errorMessages}`,
          details: validationPayload ?? data.errors,
          originalErrors: data.errors,
          code: first?.extensions?.code
        },
        { status: 400 }
      );
    }

    // Check if we have the expected data structure
    if (!data.data || !data.data.inviteTeacher) {
      console.error('❌ Unexpected response structure:', data);
      
      return NextResponse.json(
        { 
          error: 'Unexpected response structure from GraphQL API',
          details: data
        },
        { status: 500 }
      );
    }

    const inviteTeacher = data.data.inviteTeacher;
    console.log('✅ Teacher invitation successful:', {
      email: inviteTeacher.email,
      fullName: inviteTeacher.fullName,
      status: inviteTeacher.status,
      createdAt: inviteTeacher.createdAt
    });

    // Return the teacher data in the expected format
    return NextResponse.json({
      inviteTeacher: inviteTeacher
    });

  } catch (error) {
    console.error('❌ Invite teacher API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error while inviting teacher',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}