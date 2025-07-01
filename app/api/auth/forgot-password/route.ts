import { NextResponse } from 'next/server'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // GraphQL mutation for forgot password
    const mutation = `
      mutation ForgotPassword($forgotPasswordInput: ForgotPasswordInput!) {
        forgotPassword(forgotPasswordInput: $forgotPasswordInput) {
          message
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
          forgotPasswordInput: {
            email
          }
        }
      })
    })

    const data = await response.json()

    // Check for GraphQL errors
    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      return NextResponse.json(
        { error: data.errors[0].message || 'Failed to send reset email' },
        { status: 400 }
      )
    }

    const forgotPasswordData = data.data.forgotPassword

    // Return success response
    return NextResponse.json({
      message: forgotPasswordData.message,
      success: true
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
} 