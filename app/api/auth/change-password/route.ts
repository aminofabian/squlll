import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    console.log('Change password request received:', {
      hasCurrentPassword: !!currentPassword,
      currentPasswordLength: currentPassword?.length || 0,
      hasNewPassword: !!newPassword,
      newPasswordLength: newPassword?.length || 0,
      hasConfirmPassword: !!confirmPassword,
      confirmPasswordLength: confirmPassword?.length || 0,
      passwordsMatch: newPassword === confirmPassword
    })

    // Get the token from cookies (server-side)
    const cookieStore = await cookies()
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      )
    }

    // Enhanced validation
    if (!currentPassword || currentPassword.trim().length === 0) {
      return NextResponse.json(
        { error: 'Current password is required' },
        { status: 400 }
      )
    }

    if (!newPassword || newPassword.trim().length === 0) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      )
    }

    if (!confirmPassword || confirmPassword.trim().length === 0) {
      return NextResponse.json(
        { error: 'Password confirmation is required' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New password and confirm password do not match' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumbers = /\d/.test(newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return NextResponse.json(
        { error: 'Password must contain uppercase letters, lowercase letters, numbers, and special characters' },
        { status: 400 }
      )
    }

    // Use changePassword mutation for authenticated users
    const changePasswordMutation = `
      mutation ChangePassword($changePasswordInput: ChangePasswordInput!) {
        changePassword(changePasswordInput: $changePasswordInput) {
          message
        }
      }
    `

    console.log('Sending GraphQL request with token:', token.substring(0, 20) + '...')

    // Use the exact resetPassword mutation structure from documentation
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
              body: JSON.stringify({
          query: changePasswordMutation,
          variables: {
            changePasswordInput: {
              currentPassword: currentPassword.trim(),
              newPassword: newPassword.trim(),
              confirmPassword: confirmPassword.trim()
            }
          }
        })
    })

    const data = await response.json()
    console.log('GraphQL response:', JSON.stringify(data, null, 2))

    // Check for GraphQL errors
    if (data.errors) {
      console.error('changePassword mutation failed:', data.errors)
      const errorMessage = data.errors[0].message || 'Failed to change password'
      
      // Provide more specific error messages based on common GraphQL validation errors
      let userFriendlyError = errorMessage
      if (errorMessage.includes('validation failed')) {
        userFriendlyError = 'Password validation failed. Please check your current password and ensure your new password meets all requirements.'
      } else if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
        userFriendlyError = 'Authentication failed. Please log in again.'
      } else if (errorMessage.includes('current password')) {
        userFriendlyError = 'Current password is incorrect.'
      }
      
      return NextResponse.json(
        { 
          error: userFriendlyError,
          details: 'changePassword mutation failed with authenticated user.',
          originalError: errorMessage
        },
        { status: 400 }
      )
    }

    // Extract the response data from changePassword
    const changePasswordData = data.data?.changePassword
    const message = changePasswordData?.message || 'Password changed successfully'

    console.log('Password change successful:', message)

    // Return success response
    return NextResponse.json({
      message,
      success: true
    })

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'An error occurred while changing your password' },
      { status: 500 }
    )
  }
} 