import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Get tenantId from cookies for authentication context
    const tenantId = cookieStore.get('tenantId')?.value;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID not found in cookies. Please log in again.' },
        { status: 400 }
      );
    }

    // Parse the request body to get the search parameters
    const body = await request.json();
    const { admissionNumber, name, searchType } = body;

    if (!searchType) {
      return NextResponse.json(
        { error: 'Search type is required (admissionNumber or name).' },
        { status: 400 }
      );
    }

    if (searchType === 'admissionNumber' && !admissionNumber) {
      return NextResponse.json(
        { error: 'Admission number is required for admission number search.' },
        { status: 400 }
      );
    }

    if (searchType === 'name' && !name) {
      return NextResponse.json(
        { error: 'Name is required for name search.' },
        { status: 400 }
      );
    }

    console.log('Parent Search Student API - Token present:', !!token);
    console.log('Parent Search Student API - Tenant ID:', tenantId);
    console.log('Parent Search Student API - Search Type:', searchType);
    console.log('Parent Search Student API - Search Value:', searchType === 'admissionNumber' ? admissionNumber : name);

    let query: string;
    let variables: any;

    if (searchType === 'admissionNumber') {
      // GraphQL query for searching student by admission number
      query = `
        query SearchStudentByAdmission($admissionNumber: String!, $tenantId: String!) {
          searchStudentByAdmission(
            admissionNumber: $admissionNumber
            tenantId: $tenantId
          ) {
            id
            name
            admissionNumber
            grade
            phone
            streamId
          }
        }
      `;
      variables = {
        admissionNumber,
        tenantId
      };
    } else if (searchType === 'name') {
      // GraphQL query for searching students by name
      query = `
        query SearchStudentsByName($name: String!, $tenantId: String!) {
          searchStudentsByName(
            name: $name
            tenantId: $tenantId
          ) {
            id
            name
            admissionNumber
            grade
            phone
            streamId
          }
        }
      `;
      variables = {
        name,
        tenantId
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid search type. Must be "admissionNumber" or "name".' },
        { status: 400 }
      );
    }

    console.log('Parent Search Student API - Sending query:', query.substring(0, 100) + '...');

    // Call external GraphQL API
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    console.log('Parent Search Student API - Response status:', response.status);

    const result = await response.json();
    console.log('Parent Search Student API - Response data:', JSON.stringify(result, null, 2));

    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      
      // Check if it's an authentication error
      const hasAuthError = result.errors.some((error: any) => 
        error.message?.includes('Unauthorized') ||
        error.message?.includes('Authentication') ||
        error.message?.includes('School (tenant) not found') ||
        error.extensions?.code === 'UNAUTHENTICATED' ||
        error.extensions?.code === 'UNAUTHORIZEDEXCEPTION' ||
        error.extensions?.code === 'NOTFOUNDEXCEPTION'
      );
      
      if (hasAuthError) {
        return NextResponse.json(
          { error: 'Authentication failed. Please log in again.' },
          { status: 401 }
        );
      }
      
      // Check if student not found
      const studentNotFound = result.errors.some((error: any) => 
        error.message?.includes('Student not found') ||
        error.message?.includes('No student found') ||
        error.extensions?.code === 'NOT_FOUND'
      );
      
      if (studentNotFound) {
        return NextResponse.json(
          { error: 'Student not found with the provided search criteria.' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Error searching for student', details: result.errors },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error searching for student:', error);
    return NextResponse.json(
      { error: 'Failed to search for student' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 