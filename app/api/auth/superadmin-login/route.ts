import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { resolveGraphqlEndpoint } from '@/lib/graphql-endpoint'

const GRAPHQL_ENDPOINT = resolveGraphqlEndpoint()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // GraphQL mutation for superadmin sign in
    const mutation = `
      mutation SuperAdminSignIn($input: SignInInput!) {
        superAdminSignIn(input: $input) {
          user {
            id
            email
            name
          }
          accessToken
          refreshToken
          role
        }
      }
    `

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: mutation,
        variables: { input: { email, password } },
      }),
    })

    const data = await response.json()

    if (data.errors) {
      console.error('SuperAdmin login GraphQL errors:', data.errors)
      return NextResponse.json(
        { error: data.errors[0].message },
        { status: 401 },
      )
    }

    const userData = data.data.superAdminSignIn

    if (!userData?.user?.id) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      )
    }

    // Superadmins have no tenant context — only set user cookies
    const cookieStore = await cookies()
    cookieStore.set('accessToken', userData.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    cookieStore.set('refreshToken', userData.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    cookieStore.set('userId', userData.user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })
    cookieStore.set('email', userData.user.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })
    cookieStore.set('userName', userData.user.name, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })
    cookieStore.set('userRole', 'SUPER_ADMIN', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({
      user: userData.user,
      role: 'SUPER_ADMIN',
      message: 'SuperAdmin sign in successful',
    })
  } catch (error) {
    console.error('SuperAdmin login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during sign in' },
      { status: 500 },
    )
  }
}
