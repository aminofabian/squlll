import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    const teacherData = await request.json();
    console.log('Received teacher data:', teacherData);
    
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    
    if (!token) {
      console.error('No access token found in cookies');
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Map form data to GraphQL input matching exact mutation structure
    const nameParts = teacherData.name.split(' ');
    const firstName = nameParts[0] || teacherData.name;
    const lastName = nameParts.slice(1).join(' ') || firstName;
    
    // Always set role to TEACHER for teacher creation
    const role = "TEACHER";
    
    // Map teacher form fields to match teacher API expectations
    const createTeacherDto = {
      email: teacherData.email,
      fullName: teacherData.name,
      firstName: firstName,
      lastName: lastName,
      role: role,
      gender: teacherData.gender?.toUpperCase() || "OTHER",
      department: teacherData.department?.charAt(0).toUpperCase() + teacherData.department?.slice(1) || "General",
      phoneNumber: teacherData.phone,
      address: teacherData.address || "",
      employeeId: teacherData.employee_id,
      dateOfBirth: teacherData.date_of_birth || "",
      qualifications: `${teacherData.qualification} - ${teacherData.specialization}${teacherData.experience ? ` (${teacherData.experience} years experience)` : ''}`
    };

    console.log('Mapped teacher DTO:', createTeacherDto);

    // Use proper GraphQL variables instead of string interpolation
    const inviteTeacherMutation = `
      mutation InviteTeacher($createTeacherDto: CreateTeacherInvitationDto!) {
        inviteTeacher(
          createTeacherDto: $createTeacherDto
        ) {
          email
          fullName
          status
          createdAt
        }
      }
    `;

    const requestBody = {
      query: inviteTeacherMutation,
      variables: {
        createTeacherDto: {
          email: createTeacherDto.email,
          fullName: createTeacherDto.fullName,
          firstName: createTeacherDto.firstName,
          lastName: createTeacherDto.lastName,
          role: createTeacherDto.role,
          gender: createTeacherDto.gender,
          department: createTeacherDto.department,
          phoneNumber: createTeacherDto.phoneNumber,
          address: createTeacherDto.address,
          employeeId: createTeacherDto.employeeId,
          dateOfBirth: createTeacherDto.dateOfBirth,
          qualifications: createTeacherDto.qualifications
        }
      }
    };

    console.log('Sending GraphQL request to:', GRAPHQL_ENDPOINT);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('GraphQL response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GraphQL request failed:', errorText);
      return NextResponse.json(
        { error: 'GraphQL request failed', details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('GraphQL response:', result);
    
    if (result.errors) {
      console.error('InviteTeacher mutation failed:', result.errors);
      return NextResponse.json(
        { error: 'Error creating teacher record', details: result.errors },
        { status: 500 }
      );
    }

    const teacherRecord = result.data.inviteTeacher;
    console.log('Successfully created teacher record:', teacherRecord);

    return NextResponse.json({
      inviteTeacher: teacherRecord
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      { error: 'Failed to create teacher record', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 