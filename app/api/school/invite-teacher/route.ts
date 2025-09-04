import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    // Get the data from the request
    const { createTeacherDto, tenantId } = await request.json();
    console.log('Received teacher invitation data:', { createTeacherDto, tenantId });
    
    // Debug: Log specific grade level IDs being sent
    console.log('API Debug - Grade level IDs being sent:', {
      tenantGradeLevelIds: createTeacherDto.tenantGradeLevelIds,
      tenantSubjectIds: createTeacherDto.tenantSubjectIds,
      tenantStreamIds: createTeacherDto.tenantStreamIds,
      classTeacherStreamId: createTeacherDto.classTeacherTenantStreamId,
      classTeacherGradeLevelId: createTeacherDto.classTeacherTenantGradeLevelId
    });
    
    // Validate required fields
    const requiredFields = ['email', 'fullName', 'firstName', 'lastName', 'role', 'gender', 'department', 'phoneNumber', 'employeeId', 'dateOfBirth', 'qualifications'];
    const missingFields = requiredFields.filter(field => !createTeacherDto[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createTeacherDto.email)) {
      console.error('Invalid email format:', createTeacherDto.email);
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(createTeacherDto.dateOfBirth)) {
      console.error('Invalid date format:', createTeacherDto.dateOfBirth);
      return NextResponse.json(
        { error: 'Invalid date format. Expected YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate date is not in the future (reasonable birth date)
    const birthDate = new Date(createTeacherDto.dateOfBirth);
    const today = new Date();
    if (birthDate > today) {
      console.error('Invalid birth date - future date:', createTeacherDto.dateOfBirth);
      return NextResponse.json(
        { error: 'Date of birth cannot be in the future' },
        { status: 400 }
      );
    }

    // Validate reasonable age (between 18 and 100 years old)
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18 || age > 100) {
      console.error('Invalid age:', age, 'for birth date:', createTeacherDto.dateOfBirth);
      return NextResponse.json(
        { error: 'Invalid age. Teacher must be between 18 and 100 years old' },
        { status: 400 }
      );
    }

    // Validate gender enum
    if (!['MALE', 'FEMALE'].includes(createTeacherDto.gender)) {
      console.error('Invalid gender value:', createTeacherDto.gender);
      return NextResponse.json(
        { error: 'Invalid gender value. Expected MALE or FEMALE' },
        { status: 400 }
      );
    }

    // Validate teaching assignments
    const hasSubjects = createTeacherDto.tenantSubjectIds && createTeacherDto.tenantSubjectIds.length > 0;
    const hasGrades = createTeacherDto.tenantGradeLevelIds && createTeacherDto.tenantGradeLevelIds.length > 0;
    const hasStreams = createTeacherDto.tenantStreamIds && createTeacherDto.tenantStreamIds.length > 0;

    if (!hasSubjects) {
      console.error('No subjects assigned to teacher');
      return NextResponse.json(
        { error: 'At least one subject must be assigned to the teacher' },
        { status: 400 }
      );
    }

    if (!hasGrades) {
      console.error('No grade levels assigned to teacher');
      return NextResponse.json(
        { error: 'At least one grade level must be assigned to the teacher' },
        { status: 400 }
      );
    }

    console.log('Teaching assignment validation:', {
      hasSubjects,
      hasGrades,
      hasStreams,
      subjectCount: createTeacherDto.tenantSubjectIds?.length || 0,
      gradeCount: createTeacherDto.tenantGradeLevelIds?.length || 0,
      streamCount: createTeacherDto.tenantStreamIds?.length || 0
    });

    // Create a complete DTO object with all fields including teaching assignments and class teacher fields
    // The GraphQL schema supports teaching assignment fields in CreateTeacherInvitationDto
    const completeTeacherDto = {
      email: createTeacherDto.email?.trim(),
      fullName: createTeacherDto.fullName?.trim(),
      firstName: createTeacherDto.firstName?.trim(),
      lastName: createTeacherDto.lastName?.trim(),
      role: createTeacherDto.role,
      gender: createTeacherDto.gender,
      department: createTeacherDto.department,
      phoneNumber: createTeacherDto.phoneNumber?.trim(),
      address: createTeacherDto.address?.trim() || "",
      employeeId: createTeacherDto.employeeId?.trim(),
      dateOfBirth: createTeacherDto.dateOfBirth,
      qualifications: createTeacherDto.qualifications?.trim(),
      tenantSubjectIds: Array.isArray(createTeacherDto.tenantSubjectIds) ? createTeacherDto.tenantSubjectIds : [],
      tenantGradeLevelIds: Array.isArray(createTeacherDto.tenantGradeLevelIds) ? createTeacherDto.tenantGradeLevelIds : [],
      tenantStreamIds: Array.isArray(createTeacherDto.tenantStreamIds) ? createTeacherDto.tenantStreamIds : [],
      // Include class teacher assignment fields if present
      ...(createTeacherDto.classTeacherTenantStreamId && {
        classTeacherTenantStreamId: createTeacherDto.classTeacherTenantStreamId
      }),
      ...(createTeacherDto.classTeacherTenantGradeLevelId && {
        classTeacherTenantGradeLevelId: createTeacherDto.classTeacherTenantGradeLevelId
      })
    };
    
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

    // Helper function to escape GraphQL strings safely
    const escapeGraphQLString = (str) => {
      if (!str) return '""';
      return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')}"`;
    };

    // Use the exact mutation format that matches the working examples
    const inviteTeacherMutation = `mutation InviteRegularTeacher {
 inviteTeacher(
   createTeacherDto: {
     email: ${escapeGraphQLString(completeTeacherDto.email)}
     fullName: ${escapeGraphQLString(completeTeacherDto.fullName)}
     firstName: ${escapeGraphQLString(completeTeacherDto.firstName)}
     lastName: ${escapeGraphQLString(completeTeacherDto.lastName)}
     role: "${completeTeacherDto.role}"
     gender: "${completeTeacherDto.gender}"
     department: ${escapeGraphQLString(completeTeacherDto.department)}
     phoneNumber: ${escapeGraphQLString(completeTeacherDto.phoneNumber)}
     address: ${escapeGraphQLString(completeTeacherDto.address)}
     employeeId: ${escapeGraphQLString(completeTeacherDto.employeeId)}
     dateOfBirth: "${completeTeacherDto.dateOfBirth}"
     qualifications: ${escapeGraphQLString(completeTeacherDto.qualifications)}


     tenantSubjectIds: [${completeTeacherDto.tenantSubjectIds.length > 0 ? `
       ${completeTeacherDto.tenantSubjectIds.map(id => `"${id}"`).join('\n       ')}
     ` : ''}]
     tenantGradeLevelIds: [${completeTeacherDto.tenantGradeLevelIds.length > 0 ? `
       ${completeTeacherDto.tenantGradeLevelIds.map(id => `"${id}"`).join('\n       ')}
     ` : ''}]
     tenantStreamIds: [${completeTeacherDto.tenantStreamIds.length > 0 ? `
       ${completeTeacherDto.tenantStreamIds.map(id => `"${id}"`).join('\n       ')}
     ` : ''}]${completeTeacherDto.classTeacherTenantStreamId ? `


     classTeacherTenantStreamId: "${completeTeacherDto.classTeacherTenantStreamId}"` : ''}${completeTeacherDto.classTeacherTenantGradeLevelId ? `


     classTeacherTenantGradeLevelId: "${completeTeacherDto.classTeacherTenantGradeLevelId}"` : ''}
   }


 ) {
   email
   fullName
   status
   createdAt
 }
}`;

    // Prepare the request body without variables (using direct values in mutation)
    const requestBody = {
      query: inviteTeacherMutation
    };

    console.log('=== DEBUGGING TEACHER INVITATION ===');
    console.log('Original createTeacherDto:', JSON.stringify(createTeacherDto, null, 2));
    console.log('Complete teacher DTO:', JSON.stringify(completeTeacherDto, null, 2));
    console.log('Generated mutation:');
    console.log(inviteTeacherMutation);
    console.log('Sending GraphQL request to:', GRAPHQL_ENDPOINT);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    console.log('=== END DEBUGGING ===');

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
      inviteTeacher: teacherRecord
    });
  } catch (error) {
    console.error('Error inviting teacher:', error);
    return NextResponse.json(
      { error: 'Failed to invite teacher', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
