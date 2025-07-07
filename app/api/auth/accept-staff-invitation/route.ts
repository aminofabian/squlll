import { NextResponse } from 'next/server'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // GraphQL mutation for accepting staff invitation
    const mutation = `
      mutation {
        acceptStaffInvitation(
          acceptInvitationInput: {
            token: "${token}"
            password: "${password}"
          }
        ) {
          message
          user {
            id
            email
            name
          }
          tokens {
            accessToken
            refreshToken
          }
          staff {
            id
            name
            role
          }
        }
      }
    `

    // Make request to external GraphQL API (no authentication required for invitation acceptance)
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
      })
    })

    const data = await response.json()

    // Check for GraphQL errors
    if (data.errors) {
      console.error('AcceptStaffInvitation mutation failed:', data.errors)
      return NextResponse.json(
        { error: data.errors[0].message || 'Failed to accept staff invitation' },
        { status: 400 }
      )
    }

    const acceptData = data.data.acceptStaffInvitation

    // Set cookies for authentication
    const responseHeaders = new Headers()
    
    // Set access token cookie
    responseHeaders.append('Set-Cookie', `accessToken=${acceptData.tokens.accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
    
    // Set refresh token cookie
    responseHeaders.append('Set-Cookie', `refreshToken=${acceptData.tokens.refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`)

    return NextResponse.json({
      message: acceptData.message,
      user: acceptData.user,
      staff: acceptData.staff,
      tokens: acceptData.tokens
    }, {
      headers: responseHeaders
    })
  } catch (error) {
    console.error('Error accepting staff invitation:', error)
    return NextResponse.json(
      { error: 'Failed to accept staff invitation' },
      { status: 500 }
    )
  }
} 