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
        { error: 'Missing input data for term creation.' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!input.name || !input.startDate || !input.endDate || !input.academicYearId) {
      return NextResponse.json(
        { error: 'Name, start date, end date, and academic year ID are required.' },
        { status: 400 }
      );
    }

    console.log('Create Term Debug:', {
      input,
      hasToken: !!token
    });

    // Prepare GraphQL mutation
    const mutation = `
      mutation CreateTerm($input: CreateTermInput!) {
        createTerm(input: $input) {
          id
          name
          startDate
          endDate
          academicYear {
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
          endDate: input.endDate,
          academicYearId: input.academicYearId
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
      console.error('CreateTerm mutation failed:', result.errors);
      return NextResponse.json(
        { error: 'Error creating term', details: result.errors },
        { status: 500 }
      );
    }

    const termRecord = result.data.createTerm;
    
    return NextResponse.json({
      success: true,
      ...termRecord,
      message: 'Term created successfully'
    });

  } catch (error) {
    console.error('Error in create term API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}












