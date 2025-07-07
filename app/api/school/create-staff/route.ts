import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    const staffData = await request.json();
    console.log('Received staff data:', staffData);
    
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
    const nameParts = staffData.name.split(' ');
    const firstName = nameParts[0] || staffData.name;
    const lastName = nameParts.slice(1).join(' ') || firstName;
    
    // Determine role based on staff type
    let role = "TEACHER"; // Default to teacher
    if (staffData.staffType === 'administrative') {
      role = "ADMIN";
    } else if (staffData.staffType === 'support') {
      role = "STAFF";
    } else if (staffData.staffType === 'part-time') {
      role = "PART_TIME_TEACHER";
    } else if (staffData.staffType === 'substitute') {
      role = "SUBSTITUTE_TEACHER";
    }
    
    // Map staff form fields to match teacher API expectations
    const createStaffDto = {
      email: staffData.email,
      fullName: staffData.name,
      firstName: firstName,
      lastName: lastName,
      role: role,
      gender: staffData.gender?.toUpperCase() || "OTHER",
      department: staffData.department?.charAt(0).toUpperCase() + staffData.department?.slice(1) || "General",
      phoneNumber: staffData.phone,
      address: staffData.address || "",
      subject: staffData.subjects || staffData.position || "General",
      employeeId: staffData.employeeId,
      dateOfBirth: staffData.dateOfBirth || "",
      qualifications: staffData.qualifications || "Not specified"
    };

    console.log('Mapped staff DTO:', createStaffDto);

    // Use proper GraphQL variables instead of string interpolation
    const inviteStaffMutation = `
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
      query: inviteStaffMutation,
      variables: {
        tenantId: staffData.tenantId,
        createTeacherDto: {
          email: createStaffDto.email,
          fullName: createStaffDto.fullName,
          firstName: createStaffDto.firstName,
          lastName: createStaffDto.lastName,
          role: createStaffDto.role,
          gender: createStaffDto.gender,
          department: createStaffDto.department,
          phoneNumber: createStaffDto.phoneNumber,
          address: createStaffDto.address,
          subject: createStaffDto.subject,
          employeeId: createStaffDto.employeeId,
          dateOfBirth: createStaffDto.dateOfBirth,
          qualifications: createStaffDto.qualifications
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
      console.error('InviteStaff mutation failed:', result.errors);
      return NextResponse.json(
        { error: 'Error creating staff record', details: result.errors },
        { status: 500 }
      );
    }

    const staffRecord = result.data.inviteTeacher;
    console.log('Successfully created staff record:', staffRecord);

    return NextResponse.json({
      inviteStaff: staffRecord
    });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { error: 'Failed to create staff record', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 