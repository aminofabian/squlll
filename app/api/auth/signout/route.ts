import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Clear all authentication cookies
    const cookiesToClear = [
      'accessToken',
      'refreshToken', 
      'userId',
      'email',
      'userName',
      'membershipId',
      'userRole',
      'tenantId',
      'tenantName',
      'subdomainUrl',
      'schoolUrl',
      'tenantSubdomain'
    ]
    
    // Clear each cookie
    cookiesToClear.forEach(cookieName => {
      cookieStore.delete(cookieName)
    })
    
    return NextResponse.json({ 
      message: 'Sign out successful' 
    })
    
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      { error: 'An error occurred during sign out' },
      { status: 500 }
    )
  }
}
