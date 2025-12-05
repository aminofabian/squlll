import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

/**
 * API route to get the current logged-in student's information
 * This is server-side, so it has proper permissions to query student data
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    const email = cookieStore.get('email')?.value;
    const userId = cookieStore.get('userId')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!email && !userId) {
      return NextResponse.json(
        { error: 'User information not found in session' },
        { status: 400 }
      );
    }

    // Query to find student by email or userId
    // Use studentsForTenant on server-side (has proper permissions)
    const query = `
      query GetCurrentStudent {
        studentsForTenant {
          id
          email
          name
          admission_number
          grade
        }
      }
    `;

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json(
        { error: data.errors[0]?.message || 'GraphQL error' },
        { status: 400 }
      );
    }

    // Find student by email
    const students = data.data?.studentsForTenant || [];
    const currentStudent = students.find((s: any) => 
      s.email?.toLowerCase() === email?.toLowerCase()
    );

    if (!currentStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      student: {
        id: currentStudent.id,
        email: currentStudent.email,
        name: currentStudent.name,
        admissionNumber: currentStudent.admission_number,
        grade: currentStudent.grade,
      },
    });
  } catch (error) {
    console.error('Error fetching current student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student information' },
      { status: 500 }
    );
  }
}

