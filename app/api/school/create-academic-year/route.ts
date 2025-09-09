import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    const { input } = requestData;
    
    if (!input) {
      return NextResponse.json(
        { error: 'Missing input data for academic year creation.' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!input.name || !input.startDate || !input.endDate) {
      return NextResponse.json(
        { error: 'Name, start date, and end date are required.' },
        { status: 400 }
      );
    }

    console.log('Create Academic Year Debug:', {
      input,
      hasToken: !!token
    });

    // Prepare GraphQL mutation
    const mutation = `
      mutation CreateAcademicYear($input: CreateAcademicYearInput!) {
        createAcademicYear(input: $input) {
          id
          name
          startDate
          endDate
          isActive
          terms {
            id
            name
          }
        }
      }
    `;

    const requestBody = {
      query: mutation,
      variables: {
        input: {
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate
        }
      }
    };

    console.log('Sending GraphQL request to:', GRAPHQL_ENDPOINT);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    // Call external GraphQL API
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
      console.error('CreateAcademicYear mutation failed:', result.errors);
      return NextResponse.json(
        { error: 'Error creating academic year', details: result.errors },
        { status: 500 }
      );
    }

    const academicYearRecord = result.data.createAcademicYear;
    
    return NextResponse.json({
      success: true,
      ...academicYearRecord,
      message: 'Academic year created successfully'
    });

  } catch (error) {
    console.error('Error in create academic year API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
