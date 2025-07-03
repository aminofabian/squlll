import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { accessToken, userId, email, schoolUrl, subdomainUrl, tenantId, tenantName, tenantSubdomain } = body

    if (!accessToken || !userId || !email) {
      return NextResponse.json(
        { error: 'Missing required authentication data' },
        { status: 400 }
      )
    }

    // Set HTTP-only cookies for security
    const cookieStore = await cookies()
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Set access token as HTTP-only for security
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    
    // Set user data as non-HTTP-only (accessible to client-side)
    cookieStore.set('userId', userId, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })
    
    cookieStore.set('email', email, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    })
    
    if (schoolUrl) {
      cookieStore.set('schoolUrl', schoolUrl, {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
      })
    }
    
    if (subdomainUrl) {
      cookieStore.set('subdomainUrl', subdomainUrl, {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
      })
    }
    
    if (tenantId) {
      cookieStore.set('tenantId', tenantId, {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
      })
    }
    
    if (tenantName) {
      cookieStore.set('tenantName', tenantName, {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
      })
    }
    
    if (tenantSubdomain) {
      cookieStore.set('tenantSubdomain', tenantSubdomain, {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30
      })
    }

    console.log('HTTP-only cookies set successfully for user:', userId)

    return NextResponse.json({
      message: 'Authentication tokens stored successfully',
      success: true
    })

  } catch (error) {
    console.error('Error storing tokens:', error)
    return NextResponse.json(
      { error: 'Failed to store authentication tokens' },
      { status: 500 }
    )
  }
} 