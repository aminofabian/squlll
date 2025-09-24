import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    // Note: tenantId is no longer expected in the request body
    // It will be determined from the authenticated user's context via token
    const { createTeacherDto } = await request.json();
    
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
    
    // The tenantId will be extracted from the token on the backend
    console.log('🔍 Debug - Invite Teacher API:', {
      token: token ? `${token.substring(0, 30)}...` : 'No token',
      tokenSource,
      email: createTeacherDto?.email,
      fullName: createTeacherDto?.fullName
    });
    
    if (!token) {
      return NextResponse.json(
        { 
          error: 'Authentication required. Please log in.',
          details: 'A valid access token is required in cookies or Authorization header.'
        },
        { status: 401 }
      );
    }
    
    // Check if token looks valid (very basic check)
    if (token.length < 20) {
      console.warn('🚨 Token appears suspiciously short:', token);
      return NextResponse.json(
        { 
          error: 'Invalid authentication token',
          details: 'The provided token appears to be invalid.'
        },
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

    // Construct the GraphQL mutation using INLINE format (confirmed working)
    // Note: we're using the inline format which works with this API
    // We'll dynamically construct the mutation with the cleaned DTO fields
    const buildInlineMutation = (dto: Record<string, any>) => {
      // Convert object to GraphQL inline format
      const fieldLines = Object.entries(dto).map(([key, value]) => {
        // Handle arrays (like tenantSubjectIds, tenantGradeLevelIds)
        if (Array.isArray(value)) {
          const arrayItems = value.map(item => {
            return typeof item === 'string' ? `"${item}"` : item;
          }).join('\n      ');
          return `${key}: [\n      ${arrayItems}\n    ]`;
        }
        // Handle strings (add quotes)
        else if (typeof value === 'string') {
          return `${key}: "${value}"`;
        }
        // Handle other types
        else {
          return `${key}: ${value}`;
        }
      }).join('\n    ');

      return `
      mutation InviteRegularTeacher {
        inviteTeacher(
          createTeacherDto: {
            ${fieldLines}
          }
        ) {
          email
          fullName
          status
          createdAt
        }
      }
    `;
    };

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
    
    // tenantId has been completely removed from the request
    // No need to extract it - just use createTeacherDto directly
    const cleanedTeacherDto = createTeacherDto;
    
    // Generate the inline mutation with our cleaned data
    const inlineMutation = buildInlineMutation(cleanedTeacherDto);
    
    // Prepare the request body using the INLINE format (no variables)
    const requestBody = {
      query: inlineMutation
      // No variables with inline format
    };

    console.log('🔍 Debug - REQUEST WITHOUT TENANT ID:', {
      // tenantId is now completely removed from the process
      hasTenantIdInRequest: false,
    });
    
    console.log('🔍 Debug - CLEANED Request Without TenantID:', {
      endpoint: GRAPHQL_ENDPOINT,
      // Show the inline mutation format being used
      mutationFormat: 'Using INLINE format (not variables)',
      inlineMutationPreview: inlineMutation.substring(0, 100) + '...',
      cleanedDTO: 'tenantId' in cleanedTeacherDto ? 'STILL HAS TENANTID - ERROR!' : 'Properly cleaned - tenantId removed',
      // Show what's actually being sent to GraphQL
      actualPayload: {
        email: cleanedTeacherDto.email,
        fullName: cleanedTeacherDto.fullName,
        firstName: cleanedTeacherDto.firstName,
        lastName: cleanedTeacherDto.lastName,
        role: cleanedTeacherDto.role,
        department: cleanedTeacherDto.department,
        // Show arrays properly
        tenantSubjectIds: Array.isArray(cleanedTeacherDto.tenantSubjectIds) 
          ? cleanedTeacherDto.tenantSubjectIds.map((id: string | any) => typeof id === 'string' ? id.substring(0, 8) + '...' : id)
          : cleanedTeacherDto.tenantSubjectIds,
        tenantGradeLevelIds: Array.isArray(cleanedTeacherDto.tenantGradeLevelIds)
          ? cleanedTeacherDto.tenantGradeLevelIds.map((id: string | any) => typeof id === 'string' ? id.substring(0, 8) + '...' : id)
          : cleanedTeacherDto.tenantGradeLevelIds,
        // IMPORTANT: Show if tenantId is still present (it shouldn't be!)
        tenantId: 'tenantId' in cleanedTeacherDto ? cleanedTeacherDto.tenantId : 'CORRECTLY REMOVED'
      },
      usingVariables: false // Now we're using inline format instead
    });
    
    // Log essential fields required by GraphQL schema from the CLEANED object
    console.log('Required fields check (from CLEANED object):', {
      email: !!cleanedTeacherDto.email,
      fullName: !!cleanedTeacherDto.fullName,
      firstName: !!cleanedTeacherDto.firstName,
      lastName: !!cleanedTeacherDto.lastName,
      role: cleanedTeacherDto.role || 'Missing',
      gender: cleanedTeacherDto.gender || 'Missing',
      department: cleanedTeacherDto.department || 'Missing',
      hasSubjectIds: Array.isArray(cleanedTeacherDto.tenantSubjectIds) && cleanedTeacherDto.tenantSubjectIds.length > 0,
      hasGradeLevelIds: Array.isArray(cleanedTeacherDto.tenantGradeLevelIds) && cleanedTeacherDto.tenantGradeLevelIds.length > 0,
      hasTenantId: 'tenantId' in cleanedTeacherDto  // Should be false!
    });

    // Important: The token is crucial for two reasons:
    // 1. Authentication - It ensures the request is from an authorized user
    // 2. Tenant context - The backend extracts the tenantId from this token
    //    This is why we don't need to send tenantId in the payload
    
    console.log('🔐 Using authentication token for GraphQL request', {
      tokenPreview: token ? `${token.substring(0, 15)}...${token.substring(token.length - 5)}` : 'No token',
      source: tokenSource
    });
    
    // Call external GraphQL API with Bearer token
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // IMPORTANT: This is how the backend knows the tenant context
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

    // Handle HTTP errors from GraphQL API
    if (!response.ok) {
      console.error('❌ GraphQL request failed:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      // Special handling for authentication errors
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { 
            error: `Authentication failed with GraphQL API: ${response.statusText}`,
            details: 'Your access token may be invalid or expired',
            code: 'AUTH_ERROR'
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          error: `GraphQL request failed: ${response.statusText}`,
          details: data
        },
        { status: response.status }
      );
    }
    
    // Process GraphQL errors if any
    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
      
      const errorMessage = data.errors[0]?.message || 'Unknown GraphQL error';
      const errorCode = data.errors[0]?.extensions?.code || 'UNKNOWN_ERROR';
      
      // Check for authentication-related errors in GraphQL response
      if (
        errorMessage.toLowerCase().includes('unauthorized') ||
        errorMessage.toLowerCase().includes('authentication') ||
        errorCode === 'UNAUTHENTICATED' ||
        errorCode === 'FORBIDDEN'
      ) {
        return NextResponse.json(
          {
            error: 'Authentication error with GraphQL API',
            details: 'Your access token may be invalid or expired',
            originalError: errorMessage,
            code: 'AUTH_ERROR'
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { 
          error: `GraphQL errors: ${errorMessage}`,
          details: data.errors,
          originalErrors: data.errors,
          code: errorCode
        },
        { status: 400 }
      );
    }

    // Handle missing or malformed response data
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