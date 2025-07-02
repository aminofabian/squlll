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
      console.error('AcceptTeacherInvitation mutation failed:', data.errors)
      return NextResponse.json(
        { error: data.errors[0].message || 'Failed to accept teacher invitation' },
        { status: 400 }
      )
    }

    const acceptData = data.data.acceptTeacherInvitation

    // Return success response with the complete data
    return NextResponse.json({
      message: acceptData.message || 'Invitation accepted successfully',
      user: acceptData.user,
      tokens: acceptData.tokens,
      teacher: acceptData.teacher,
      success: true
    })

  } catch (error) {
    console.error('Accept teacher invitation error:', error)
    return NextResponse.json(
      { error: 'An error occurred while accepting the invitation' },
      { status: 500 }
    )
  }
} 