import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function useSignout() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const signOut = async () => {
    try {
      setIsSigningOut(true)
      
      // Call the signout API
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Sign out failed')
      }

      // Redirect to login page
      try {
        router.push('/login')
      } catch (routerError) {
        // Fallback to window.location
        window.location.href = '/login'
      }
      
    } catch (error) {
      console.error('Sign out error:', error)
      // Even if API fails, clear local state and redirect
      try {
        router.push('/login')
      } catch (routerError) {
        // Fallback to window.location
        window.location.href = '/login'
      }
    } finally {
      setIsSigningOut(false)
    }
  }

  return {
    signOut,
    isSigningOut
  }
}
