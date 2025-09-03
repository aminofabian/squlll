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

    console.log('Accepting teacher invitation with token:', token.substring(0, 10) + '...')

    // GraphQL mutation for accepting teacher invitation
    const mutation = `
      mutation {
        acceptTeacherInvitation(
          acceptInvitationInput: {
            token: "${token}"
            password: "${password}"
          }
        ) {
          message
          user {
            id
            name
            email
          }
          tokens {
            accessToken
            refreshToken
          }
          teacher {
            id
            name
          }
          role
        }
      }
    `

    console.log('Making request to GraphQL endpoint:', GRAPHQL_ENDPOINT)

    // Make request to external GraphQL API (no authentication required for invitation acceptance)
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Squlll-Teacher-Invitation/1.0',
      },
      body: JSON.stringify({
        query: mutation,
      })
    })

    console.log('GraphQL response status:', response.status)
    console.log('GraphQL response headers:', Object.fromEntries(response.headers.entries()))

    const data = await response.json()
    console.log('GraphQL response data:', JSON.stringify(data, null, 2))

    // Check for HTTP errors first
    if (!response.ok) {
      console.error('HTTP error from GraphQL API:', response.status, response.statusText)
      return NextResponse.json(
        { 
          error: `GraphQL API error: ${response.status} ${response.statusText}`,
          details: data
        },
        { status: response.status }
      )
    }

    // Check for GraphQL errors
    if (data.errors) {
      console.error('AcceptTeacherInvitation mutation failed:', data.errors)
      const errorMessage = data.errors[0]?.message || 'Failed to accept teacher invitation'
      const errorCode = data.errors[0]?.extensions?.code || 'UNKNOWN_ERROR'
      
      return NextResponse.json(
        { 
          error: errorMessage,
          code: errorCode,
          details: data.errors
        },
        { status: 400 }
      )
    }

    const acceptData = data.data?.acceptTeacherInvitation

    if (!acceptData) {
      console.error('No data returned from acceptTeacherInvitation mutation')
      return NextResponse.json(
        { error: 'No data returned from invitation acceptance' },
        { status: 500 }
      )
    }

    // Set cookies for authentication (similar to staff invitation)
    const responseHeaders = new Headers()
    
    // Set access token cookie
    responseHeaders.append('Set-Cookie', `accessToken=${acceptData.tokens.accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
    
    // Set refresh token cookie
    responseHeaders.append('Set-Cookie', `refreshToken=${acceptData.tokens.refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`)

    // Return success response with the complete data
    return NextResponse.json({
      message: acceptData.message || 'Invitation accepted successfully',
      user: acceptData.user,
      tokens: acceptData.tokens,
      teacher: acceptData.teacher,
      role: acceptData.role,
      success: true
    }, {
      headers: responseHeaders
    })

  } catch (error) {
    console.error('Accept teacher invitation error:', error)
    return NextResponse.json(
      { error: 'An error occurred while accepting the invitation' },
      { status: 500 }
    )
  }
} 