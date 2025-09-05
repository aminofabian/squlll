import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    const updateData = await request.json();
    console.log('Received update custom subject data:', updateData);
    
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

    // Validate required fields
    const { tenantSubjectId, input } = updateData;
    
    if (!tenantSubjectId) {
      return NextResponse.json(
        { error: 'tenantSubjectId is required' },
        { status: 400 }
      );
    }

    if (!input) {
      return NextResponse.json(
        { error: 'input data is required' },
        { status: 400 }
      );
    }

    // Validate input fields
    const { name, totalMarks, isCompulsory } = input;
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'name is required and must be a string' },
        { status: 400 }
      );
    }

    if (totalMarks !== undefined && (typeof totalMarks !== 'number' || totalMarks < 0)) {
      return NextResponse.json(
        { error: 'totalMarks must be a positive number' },
        { status: 400 }
      );
    }

    if (isCompulsory !== undefined && typeof isCompulsory !== 'boolean') {
      return NextResponse.json(
        { error: 'isCompulsory must be a boolean' },
        { status: 400 }
      );
    }

    // Prepare the GraphQL mutation
    const updateCustomSubjectMutation = `
      mutation UpdateCustomSubject($tenantSubjectId: String!, $input: UpdateTenantSubjectInput!) {
        updateCustomSubject(tenantSubjectId: $tenantSubjectId, input: $input) {
          id
          customSubject {
            id
            name
          }
          isCompulsory
          totalMarks
        }
      }
    `;

    const requestBody = {
      query: updateCustomSubjectMutation,
      variables: {
        tenantSubjectId,
        input: {
          name,
          totalMarks,
          isCompulsory
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
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json(
        { 
          error: 'GraphQL mutation failed', 
          details: result.errors[0]?.message || 'Unknown GraphQL error',
          graphqlErrors: result.errors 
        },
        { status: 400 }
      );
    }

    if (!result.data || !result.data.updateCustomSubject) {
      console.error('No data returned from GraphQL mutation');
      return NextResponse.json(
        { error: 'No data returned from mutation' },
        { status: 500 }
      );
    }

    console.log('Custom subject updated successfully:', result.data.updateCustomSubject);
    
    return NextResponse.json({
      success: true,
      data: result.data.updateCustomSubject,
      message: 'Custom subject updated successfully'
    });

  } catch (error) {
    console.error('Error updating custom subject:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
