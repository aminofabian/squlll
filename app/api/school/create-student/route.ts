import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    const studentData = await request.json();
    
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Map form data to match the exact GraphQL createStudentInput structure
    const createStudentInput = {
      name: studentData.name,
      email: studentData.student_email, // Email is now auto-generated on frontend if not provided
      admission_number: studentData.admission_number,
      phone: studentData.guardian_phone, // Using guardian phone as primary contact
      tenantGradeLevelId: studentData.grade,
      gender: studentData.gender.toUpperCase()
    };

    console.log('Create Student Debug:', {
      submittedGradeId: studentData.grade,
      createStudentInput,
      studentData
    });

    // Prepare GraphQL mutation with variables (like the streams implementation)
    const mutation = `
      mutation CreateStudent($createStudentInput: CreateStudentInput!) {
        createStudent(createStudentInput: $createStudentInput) {
          user {
            id
            email
            name
          }
          student {
            id
            admission_number
            grade {
              id
            }
            gender
            phone
          }
          generatedPassword
        }
      }
    `;

    // Call external GraphQL API
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          createStudentInput
        }
      })
    });

    const result = await response.json();
    
    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json(
        { error: 'Error creating student', details: result.errors },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
} 