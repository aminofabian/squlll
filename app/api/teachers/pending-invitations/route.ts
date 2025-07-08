import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function GET(request: Request) {
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

    // Get tenantId from query parameters
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required as a query parameter.' },
        { status: 400 }
      );
    }

    console.log('Pending Invitations API - Fetching for tenantId:', tenantId);
    console.log('Pending Invitations API - Using GraphQL endpoint:', GRAPHQL_ENDPOINT);
    console.log('Pending Invitations API - Token present:', !!token);

    // GraphQL query for fetching pending invitations
    const query = `
      query GetPendingInvitations($tenantId: String!) {
        getPendingInvitations(tenantId: $tenantId) {
          id
          email
          role
          status
          createdAt
          invitedBy {
            id
            name
            email
          }
        }
      }
    `;

    const requestBody = {
      query,
      variables: {
        tenantId
      }
    };

    console.log('Pending Invitations API - Request body:', JSON.stringify(requestBody, null, 2));

    // Call external GraphQL API
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Pending Invitations API - Response status:', response.status);
    console.log('Pending Invitations API - Response headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();

    console.log('Pending Invitations API - Response data:', JSON.stringify(result, null, 2));

    // Check for GraphQL errors
    if (result.errors) {
      console.error('Pending Invitations API - GraphQL errors:', result.errors);
      return NextResponse.json(
        { error: 'Error fetching pending invitations', details: result.errors },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Pending Invitations API - Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending invitations' },
      { status: 500 }
    );
  }
} 