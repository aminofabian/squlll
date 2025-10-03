import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useGraphQLErrorHandler() {
  const router = useRouter()

  useEffect(() => {
    // Global error handler for fetch requests
    const originalFetch = window.fetch
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        
        // Check if it's a GraphQL API call that returned 401
        if (response.url.includes('/api/graphql') && response.status === 401) {
          const data = await response.json()
          
          // Check if it's an authentication error that should redirect to login
          if (data.errors?.some((error: any) => 
            error.extensions?.code === 'AUTHENTICATION_REQUIRED' ||
            error.extensions?.redirectToLogin === true
          )) {
            console.log('Authentication error detected, redirecting to login...')
            
            // Clear any existing authentication cookies
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
            
            cookiesToClear.forEach(cookieName => {
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
            })
            
            // Redirect to login
            router.push('/login')
            return response
          }
        }
        
        return response
      } catch (error) {
        console.error('Fetch error:', error)
        return originalFetch(...args)
      }
    }
    
    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch
    }
  }, [router])
}

// Alternative approach: Hook that can be used in components to handle GraphQL errors
export function useHandleGraphQLError() {
  const router = useRouter()
  
  const handleError = (error: any) => {
    // Check if it's a GraphQL error with authentication issues
    if (error?.errors?.some((err: any) => 
      err.extensions?.code === 'AUTHENTICATION_REQUIRED' ||
      err.extensions?.redirectToLogin === true ||
      err.message?.includes('Unauthorized') ||
      err.extensions?.code === 'UNAUTHORIZEDEXCEPTION'
    )) {
      console.log('Authentication error detected, redirecting to login...')
      
      // Clear authentication cookies
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
      
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      })
      
      // Redirect to login
      router.push('/login')
      return true // Indicates error was handled
    }
    
    return false // Error was not handled
  }
  
  return { handleError }
}
