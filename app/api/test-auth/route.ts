import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const authHeader = request.headers.get('authorization');
    
    const debugInfo = {
      cookies: {
        accessToken: cookieStore.get('accessToken')?.value ? 'Present' : 'Not found',
        userId: cookieStore.get('userId')?.value ? 'Present' : 'Not found',
        email: cookieStore.get('email')?.value ? 'Present' : 'Not found',
      },
      headers: {
        authorization: authHeader ? 'Present' : 'Not found',
        authorizationValue: authHeader ? authHeader.substring(0, 30) + '...' : null,
      },
      url: request.url,
      method: request.method,
    };
    
    console.log('🔍 Debug - Test auth endpoint:', debugInfo);
    
    return NextResponse.json({
      success: true,
      debug: debugInfo,
      message: 'Auth test endpoint working'
    });
  } catch (error) {
    console.error('Error in test auth endpoint:', error);
    return NextResponse.json(
      { error: 'Test auth endpoint error', details: error },
      { status: 500 }
    );
  }
} 