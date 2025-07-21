import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    console.log('Store-tokens API - Starting request processing')
    
    const body = await request.json()
    console.log('Store-tokens API - Request body received:', {
      hasAccessToken: !!body.accessToken,
      hasUserId: !!body.userId,
      hasEmail: !!body.email,
      hasRefreshToken: !!body.refreshToken
    })
    
    const { accessToken, refreshToken, userId, email, schoolUrl, subdomainUrl, tenantId, tenantName, tenantSubdomain } = body

    if (!accessToken || !userId || !email) {
      console.error('Store-tokens API - Missing required data:', { accessToken: !!accessToken, userId: !!userId, email: !!email })
      return NextResponse.json(
        { error: 'Missing required authentication data' },
        { status: 400 }
      )
    }

    // Set HTTP-only cookies for security
    const cookieStore = await cookies()
    const isProduction = process.env.NODE_ENV === 'production'
    // In production, don't set domain for subdomain cookies to avoid issues
    let domain: string | undefined = undefined;
    let sameSite: 'lax' | 'none' = 'lax';
    let secure = false;
    
    // Get the request URL to check hostname
    const requestUrl = new URL(request.url);
    
    if (isProduction) {
      domain = '.squl.co.ke';
      sameSite = 'none';
      secure = true;
    } else if (requestUrl.hostname.endsWith('.localhost')) {
      // For .localhost subdomains in dev, set domain to .localhost to share cookies
      domain = '.localhost';
      sameSite = 'lax';
      secure = false;
    }
    
    // Set access token as HTTP-only for security
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    // Set refresh token as HTTP-only for security
    if (refreshToken) {
      cookieStore.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure,
        sameSite,
        domain,
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })
    }
    
    // Set user data as non-HTTP-only (accessible to client-side)
    cookieStore.set('userId', userId, {
      httpOnly: false,
      secure,
      sameSite,
      domain,
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })
    
    cookieStore.set('email', email, {
      httpOnly: false,
      secure,
      sameSite,
      domain,
      maxAge: 60 * 60 * 24 * 30
    })
    
    if (schoolUrl) {
      cookieStore.set('schoolUrl', schoolUrl, {
        httpOnly: false,
        secure,
        sameSite,
        domain,
        maxAge: 60 * 60 * 24 * 30
      })
    }
    
    if (subdomainUrl) {
      cookieStore.set('subdomainUrl', subdomainUrl, {
        httpOnly: false,
        secure,
        sameSite,
        domain,
        maxAge: 60 * 60 * 24 * 30
      })
    }
    
    if (tenantId) {
      cookieStore.set('tenantId', tenantId, {
        httpOnly: false,
        secure,
        sameSite,
        domain,
        maxAge: 60 * 60 * 24 * 30
      })
    }
    
    if (tenantName) {
      cookieStore.set('tenantName', tenantName, {
        httpOnly: false,
        secure,
        sameSite,
        domain,
        maxAge: 60 * 60 * 24 * 30
      })
    }
    
    if (tenantSubdomain) {
      cookieStore.set('tenantSubdomain', tenantSubdomain, {
        httpOnly: false,
        secure,
        sameSite,
        domain,
        maxAge: 60 * 60 * 24 * 30
      })
    }

    console.log('HTTP-only cookies set successfully for user:', userId)

    return NextResponse.json({
      message: 'Authentication tokens stored successfully',
      success: true
    })

  } catch (error) {
    console.error('Store-tokens API - Error storing tokens:', error)
    return NextResponse.json(
      { 
        error: 'Failed to store authentication tokens',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 