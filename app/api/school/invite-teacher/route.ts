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

    // Validate required fields
    const requiredFields = ['email', 'fullName', 'firstName', 'lastName', 'role', 'gender', 'department', 'phoneNumber', 'employeeId', 'dateOfBirth', 'qualifications'];
    const missingFields = requiredFields.filter(field => !createTeacherDto[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          details: missingFields.map(field => ({ field, message: `${field} is required` }))
        },
        { status: 400 }
      );
    }
    
    // Validate arrays
    if (!createTeacherDto.tenantSubjectIds || !Array.isArray(createTeacherDto.tenantSubjectIds) || createTeacherDto.tenantSubjectIds.length === 0) {
      return NextResponse.json(
        { 
          error: 'tenantSubjectIds must be a non-empty array',
          details: [{ field: 'tenantSubjectIds', message: 'tenantSubjectIds must be a non-empty array' }]
        },
        { status: 400 }
      );
    }
    
    if (!createTeacherDto.tenantGradeLevelIds || !Array.isArray(createTeacherDto.tenantGradeLevelIds) || createTeacherDto.tenantGradeLevelIds.length === 0) {
      return NextResponse.json(
        { 
          error: 'tenantGradeLevelIds must be a non-empty array',
          details: [{ field: 'tenantGradeLevelIds', message: 'tenantGradeLevelIds must be a non-empty array' }]
        },
        { status: 400 }
      );
    }
    
    // Validate field formats
    if (createTeacherDto.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createTeacherDto.email)) {
      return NextResponse.json(
        { 
          error: 'Invalid email format',
          details: [{ field: 'email', message: 'Invalid email format' }]
        },
        { status: 400 }
      );
    }
    
    if (createTeacherDto.phoneNumber && !/^\+[0-9]{10,15}$/.test(createTeacherDto.phoneNumber)) {
      return NextResponse.json(
        { 
          error: 'Invalid phone number format (should be like +254712345678)',
          details: [{ field: 'phoneNumber', message: 'Invalid phone number format' }]
        },
        { status: 400 }
      );
    }
    
    if (createTeacherDto.dateOfBirth) {
      const date = new Date(createTeacherDto.dateOfBirth);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { 
            error: 'Invalid date format for dateOfBirth (should be YYYY-MM-DD)',
            details: [{ field: 'dateOfBirth', message: 'Invalid date format' }]
          },
          { status: 400 }
        );
      }
    }
    
    if (createTeacherDto.role !== 'TEACHER') {
      createTeacherDto.role = 'TEACHER'; // Force role to be TEACHER
    }
    
    if (createTeacherDto.gender && !['MALE', 'FEMALE'].includes(createTeacherDto.gender)) {
      return NextResponse.json(
        { 
          error: 'Gender must be MALE or FEMALE',
          details: [{ field: 'gender', message: 'Gender must be MALE or FEMALE' }]
        },
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

    // Make sure department is lowercase to match UI selection values
    if (createTeacherDto.department) {
      createTeacherDto.department = createTeacherDto.department.toLowerCase();
    }
    
    // Ensure tenantSubjectIds and tenantGradeLevelIds are arrays of strings
    if (createTeacherDto.tenantSubjectIds && !Array.isArray(createTeacherDto.tenantSubjectIds)) {
      console.warn('Converting tenantSubjectIds to array:', createTeacherDto.tenantSubjectIds);
      // If it's a single value, convert to an array with that value
      createTeacherDto.tenantSubjectIds = [String(createTeacherDto.tenantSubjectIds)];
    } else if (createTeacherDto.tenantSubjectIds) {
      // Ensure all items are strings
      createTeacherDto.tenantSubjectIds = createTeacherDto.tenantSubjectIds.map((id: any) => String(id));
    }
    
    if (createTeacherDto.tenantGradeLevelIds && !Array.isArray(createTeacherDto.tenantGradeLevelIds)) {
      console.warn('Converting tenantGradeLevelIds to array:', createTeacherDto.tenantGradeLevelIds);
      // If it's a single value, convert to an array with that value
      createTeacherDto.tenantGradeLevelIds = [String(createTeacherDto.tenantGradeLevelIds)];
    } else if (createTeacherDto.tenantGradeLevelIds) {
      // Ensure all items are strings
      createTeacherDto.tenantGradeLevelIds = createTeacherDto.tenantGradeLevelIds.map((id: any) => String(id));
    }
    
    // Do NOT add tenantId to createTeacherDto - it's not part of the DTO schema
    // The backend uses the tenantId from the authenticated user's context
    
    // Prepare the request body
    const requestBody = {
      query: mutation,
      variables: {
        createTeacherDto: createTeacherDto
      }
    };

    console.log('🔍 Debug - Fixed GraphQL Request:', {
      endpoint: GRAPHQL_ENDPOINT,
      mutation: mutation.substring(0, 100) + '...',
      tenantId: tenantId, // This should be available via Authorization but not sent in the DTO
      requestBodyStructure: 'Using createTeacherDto wrapped in variables',
      subjects: Array.isArray(createTeacherDto.tenantSubjectIds) 
        ? `Array[${createTeacherDto.tenantSubjectIds.length}]: [${createTeacherDto.tenantSubjectIds.slice(0, 3).join(', ')}${createTeacherDto.tenantSubjectIds.length > 3 ? '...' : ''}]` 
        : 'Not an array',
      gradeLevels: Array.isArray(createTeacherDto.tenantGradeLevelIds) 
        ? `Array[${createTeacherDto.tenantGradeLevelIds.length}]: [${createTeacherDto.tenantGradeLevelIds.slice(0, 3).join(', ')}${createTeacherDto.tenantGradeLevelIds.length > 3 ? '...' : ''}]` 
        : 'Not an array',
      email: createTeacherDto.email,
      fullName: createTeacherDto.fullName,
      role: createTeacherDto.role
    });
    
    // Log essential fields required by GraphQL schema
    console.log('Required fields check:', {
      email: !!createTeacherDto.email,
      fullName: !!createTeacherDto.fullName,
      firstName: !!createTeacherDto.firstName,
      lastName: !!createTeacherDto.lastName,
      role: createTeacherDto.role || 'Missing',
      gender: createTeacherDto.gender || 'Missing',
      department: createTeacherDto.department || 'Missing',
      hasSubjectIds: Array.isArray(createTeacherDto.tenantSubjectIds) && createTeacherDto.tenantSubjectIds.length > 0,
      hasGradeLevelIds: Array.isArray(createTeacherDto.tenantGradeLevelIds) && createTeacherDto.tenantGradeLevelIds.length > 0,
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