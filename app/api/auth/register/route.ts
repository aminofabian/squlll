import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, schoolName } = body

    // GraphQL mutation
    const mutation = `
      mutation CreateUser($signupInput: SignupInput!) {
        createUser(signupInput: $signupInput) {
          user {
            id
            email
            schoolUrl
          }
          tenant {
            id
            name
            subdomain
          }
          subdomainUrl
          tokens {
            accessToken
            refreshToken
          }
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
          signupInput: {
            email,
            password,
            name,
            schoolName
          }
        }
      })
    })

    const data = await response.json()

    // Check for GraphQL errors
    if (data.errors) {
      return NextResponse.json(
        { error: data.errors[0].message },
        { status: 400 }
      )
    }

    const userData = data.data.createUser
    
    // Set authentication cookies
    const cookieStore = await cookies()
    cookieStore.set('accessToken', userData.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    cookieStore.set('refreshToken', userData.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })
    cookieStore.set('userId', userData.user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })
    cookieStore.set('email', userData.user.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })
    cookieStore.set('schoolUrl', userData.user.schoolUrl, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })
    cookieStore.set('subdomainUrl', userData.subdomainUrl, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })
    
    // Set tenant cookies
    if (userData.tenant) {
      cookieStore.set('tenantId', userData.tenant.id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })
      cookieStore.set('tenantName', userData.tenant.name, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })
      cookieStore.set('tenantSubdomain', userData.tenant.subdomain, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      })
    }

    // Return success response
    return NextResponse.json({
      user: userData.user,
      tenant: userData.tenant,
      subdomainUrl: userData.subdomainUrl,
      tokens: userData.tokens,
      message: 'Registration successful'
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    )
  }
} 