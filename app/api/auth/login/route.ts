import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // GraphQL mutation for sign in
    const mutation = `
      mutation SignIn($signInInput: SignInInput!) {
        signIn(signInInput: $signInInput) {
          user {
            id
            email
            name
          }
          membership {
            id
            role
            tenant {
              id
              name
            }
          }
          tokens {
            accessToken
            refreshToken
          }
          subdomainUrl
        }
      }
    `

    // Make request to GraphQL API
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          signInInput: {
            email,
            password
          }
        }
      })
    })

    const data = await response.json()

    // Debug: Log the raw GraphQL response
    console.log('GraphQL response:', JSON.stringify(data, null, 2))

    // Check for GraphQL errors
    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      return NextResponse.json(
        { error: data.errors[0].message },
        { status: 400 }
      )
    }

    const userData = data.data.signIn
    
    // Debug logging
    console.log('Login response data:', {
      user: userData.user,
      membership: userData.membership,
      tenant: userData.membership.tenant,
      subdomainUrl: userData.subdomainUrl
    })
    
    // Validate required data
    if (!userData.membership?.tenant?.id || !userData.membership?.tenant?.name) {
      console.error('Missing tenant data in login response:', userData)
      return NextResponse.json(
        { error: 'Invalid tenant information received' },
        { status: 400 }
      )
    }
    
    // Get domain for cookies (for subdomain support)
    const requestUrl = new URL(request.url)
    let domain: string | undefined = undefined
    let sameSite: 'lax' | 'none' = 'lax';
    let secure = false;
    
    if (process.env.NODE_ENV === 'production') {
      domain = '.squl.co.ke'
      sameSite = 'none';
      secure = true;
    } else if (requestUrl.hostname.endsWith('.localhost')) {
      // For .localhost subdomains in dev, set domain to .localhost to share cookies
      domain = '.localhost';
      sameSite = 'lax';
      secure = false;
    } else if (requestUrl.hostname.includes('localhost')) {
      domain = undefined
      sameSite = 'lax';
      secure = false;
    }
    
    // Set authentication cookies
    const cookieStore = await cookies()
    cookieStore.set('accessToken', userData.tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      domain
    })
    cookieStore.set('refreshToken', userData.tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      domain
    })
    cookieStore.set('userId', userData.user.id, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: 60 * 60 * 24 * 7,
      domain
    })
    cookieStore.set('email', userData.user.email, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: 60 * 60 * 24 * 7,
      domain
    })
    cookieStore.set('userName', userData.user.name, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: 60 * 60 * 24 * 7,
      domain
    })
    cookieStore.set('membershipId', userData.membership.id, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: 60 * 60 * 24 * 7,
      domain
    })
    cookieStore.set('userRole', userData.membership.role, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: 60 * 60 * 24 * 7,
      domain
    })
    
    cookieStore.set('tenantId', userData.membership.tenant.id, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      domain
    })
    cookieStore.set('tenantName', userData.membership.tenant.name, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      domain
    })
    cookieStore.set('subdomainUrl', userData.subdomainUrl, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: 60 * 60 * 24 * 7,
      domain
    })

    // Return success response
    return NextResponse.json({
      user: userData.user,
      membership: userData.membership,
      tenant: userData.membership.tenant,
      subdomainUrl: userData.subdomainUrl,
      tokens: {
        // Only return non-sensitive token info if needed
        accessToken: userData.tokens.accessToken.substring(0, 20) + '...',
        hasRefreshToken: !!userData.tokens.refreshToken
      },
      message: 'Sign in successful'
    })

  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { error: 'An error occurred during sign in' },
      { status: 500 }
    )
  }
} 