import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    const teacherData = await request.json();
    
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Map form data to GraphQL input matching exact mutation structure
    const nameParts = teacherData.name.split(' ');
    const firstName = nameParts[0] || teacherData.name;
    const lastName = nameParts.slice(1).join(' ') || firstName;
    
    const createTeacherDto = {
      email: teacherData.email,
      fullName: teacherData.name,
      firstName: firstName,
      lastName: lastName,
      role: "TEACHER",
      gender: teacherData.gender.toUpperCase(),
      department: teacherData.department.charAt(0).toUpperCase() + teacherData.department.slice(1),
      phoneNumber: teacherData.phone,
      address: teacherData.address || "",
      subject: teacherData.subject_list || teacherData.specialization,
      employeeId: teacherData.employee_id,
      dateOfBirth: teacherData.date_of_birth,
      qualifications: `${teacherData.qualification} - ${teacherData.specialization}${teacherData.experience ? ` (${teacherData.experience} years experience)` : ''}`,
      // Additional fields for complete teacher record
      designation: teacherData.designation,
      joinDate: teacherData.join_date,
      experience: teacherData.experience
    };

        // Use proper GraphQL variables instead of string interpolation
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

    const requestBody = {
      query: inviteTeacherMutation,
      variables: {
        tenantId: teacherData.tenantId,
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
          subject: createTeacherDto.subject,
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

    const result = await response.json();
    
    if (result.errors) {
      console.error('InviteTeacher mutation failed:', result.errors);
      return NextResponse.json(
        { error: 'Error creating teacher record', details: result.errors },
        { status: 500 }
      );
    }

    const teacherRecord = result.data.inviteTeacher;

    return NextResponse.json({
      inviteTeacher: teacherRecord
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      { error: 'Failed to create teacher record' },
      { status: 500 }
    );
  }
}