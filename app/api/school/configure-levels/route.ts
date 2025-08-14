import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    const { levelNames } = await request.json();
    
    // Get the token from cookies first
    const cookieStore = await cookies();
    let token = cookieStore.get('accessToken')?.value;
    let tokenSource = 'cookies';
    
    // If no token in cookies, check Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
        tokenSource = 'authorization_header';
      }
    }
    
    console.log('🔍 Debug - Token found:', token ? `${token.substring(0, 30)}...` : 'No token');
    console.log('🔍 Debug - Token source:', tokenSource);
    console.log('🔍 Debug - All cookies:', Object.fromEntries(
      Array.from(cookieStore.getAll().map(cookie => [cookie.name, cookie.value.substring(0, 20) + '...']))
    ));
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Prepare GraphQL mutation
    const levelNamesString = levelNames.map((name: string) => `"${name}"`).join(',\n');
    const mutation = `
      mutation {
        configureSchoolLevelsByNames(levelNames: [
          ${levelNamesString}
        ]) {
          id
          selectedLevels {
            id
            name
            gradeLevels {
              id
              name
              code
              order
            }
          }
          tenant {
            id
            schoolName
          }
          createdAt
        }
      }
    `;

    // Call external GraphQL API
    const requestBody = {
      query: mutation
    };
    

    console.log('🔍 Debug - Request details:');
    console.log('  - Endpoint:', GRAPHQL_ENDPOINT);
    console.log('  - Level names received:', levelNames);
    console.log('  - Level names count:', levelNames?.length || 0);
    console.log('  - Level names array:', JSON.stringify(levelNames, null, 2));
    console.log('  - Auth header:', `Bearer ${token.substring(0, 30)}...`);
    console.log('  - Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('🔍 Debug - Response status:', response.status);
    console.log('🔍 Debug - Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('🔍 Debug - Full response:', JSON.stringify(result, null, 2));
    
    // Check for GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      
      // Check for permission denied errors
      const permissionDeniedError = result.errors.find((error: any) => 
        error.extensions?.code === 'FORBIDDENEXCEPTION' || 
        error.message?.includes('Permission denied')
      );
      
      if (permissionDeniedError) {
        return NextResponse.json(
          { 
            error: 'PERMISSION_DENIED',
            message: 'Permission denied. You may not have admin rights to configure school levels.',
            action: 'redirect_to_login'
          },
          { status: 403 }
        );
      }
      
      // Check if the school is already configured
      const alreadyConfiguredError = result.errors.find((error: any) => 
        error.extensions?.code === 'BADREQUESTEXCEPTION' && 
        error.message === 'School has already been configured'
      );
      
      if (alreadyConfiguredError) {
        return NextResponse.json(
          { 
            error: 'SCHOOL_ALREADY_CONFIGURED',
            message: 'School has already been configured',
            action: 'redirect_to_dashboard'
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Error configuring school levels', details: result.errors },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error configuring school levels:', error);
    return NextResponse.json(
      { error: 'Failed to configure school levels' },
      { status: 500 }
    );
  }
} 