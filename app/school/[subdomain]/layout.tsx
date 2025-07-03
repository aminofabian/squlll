'use client'

import { useEffect, Suspense, useState } from 'react'
import { useParams } from 'next/navigation'

// Loading component for Suspense fallback
function SubdomainLayoutLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

// Main layout component that handles authentication
function SubdomainLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const subdomain = params.subdomain as string
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const processAuth = async () => {
      if (!isClient) return
      console.log('Subdomain Layout - Processing authentication parameters for:', subdomain)
      
      // Ensure we're in a browser environment
      if (typeof window === 'undefined' || !isClient) {
        console.log('Subdomain Layout - Not in browser environment, skipping auth processing')
        return
      }
      
      // Add error boundary for the entire authentication process
      try {
    
    console.log('Subdomain Layout - Component mounted, window.location:', window.location.href)
    
    // Check for URL parameters from registration using direct URL parsing
    // This is more reliable in production than useSearchParams
    let userId: string | null = null
    let email: string | null = null
    let schoolUrl: string | null = null
    let subdomainUrl: string | null = null
    let tenantId: string | null = null
    let tenantName: string | null = null
    let tenantSubdomain: string | null = null
    let accessToken: string | null = null
    let refreshToken: string | null = null
    let isNewRegistration = false
    
    try {
      const urlParams = new URLSearchParams(window.location.search)
      userId = urlParams.get('userId')
      email = urlParams.get('email')
      schoolUrl = urlParams.get('schoolUrl')
      subdomainUrl = urlParams.get('subdomainUrl')
      tenantId = urlParams.get('tenantId')
      tenantName = urlParams.get('tenantName')
      tenantSubdomain = urlParams.get('tenantSubdomain')
      accessToken = urlParams.get('accessToken')
      refreshToken = urlParams.get('refreshToken')
      isNewRegistration = urlParams.get('newRegistration') === 'true'
      
      console.log('Subdomain Layout - Direct URL parsing successful')
    } catch (error) {
      console.error('Subdomain Layout - Error parsing URL parameters:', error)
      // Don't return here, continue with empty values
      console.log('Subdomain Layout - Continuing with empty authentication parameters')
    }

    console.log('Subdomain Layout - URL parameters detected:', {
      userId: userId ? `${userId.substring(0, 10)}...` : 'none',
      email: email ? `${email.substring(0, 5)}...` : 'none',
      schoolUrl,
      subdomainUrl,
      tenantId: tenantId ? `${tenantId.substring(0, 10)}...` : 'none',
      tenantName,
      tenantSubdomain,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      isNewRegistration,
      currentURL: window.location.href
    })

    // Debug authentication state
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        console.log('=== Subdomain Authentication Debug Info ===');
        console.log('URL:', window.location.href);
        console.log('Cookies before:', document.cookie);
        console.log('=== End Subdomain Auth Debug ===');
      }
    }, 500)

    // If this is a new registration or we have auth parameters, store the data in cookies
    if ((isNewRegistration || accessToken) && userId && email) {
      console.log('Subdomain Layout - Storing authentication data in cookies...')
      
      try {
        // Store user data in cookies (30 day expiry)
        // Use secure flags for production
        const isProduction = process.env.NODE_ENV === 'production'
        // In production, don't set domain for subdomain cookies to avoid issues
        const cookieOptions = `max-age=${60 * 60 * 24 * 30}; path=/; SameSite=Lax${isProduction ? '; Secure' : ''}`
        
        console.log('Subdomain Layout - Cookie options:', cookieOptions)
        console.log('Subdomain Layout - Setting cookies for:', { userId, email, schoolUrl, subdomainUrl })
        
        // Set cookies one by one with error handling
        try {
          document.cookie = `userId=${userId}; ${cookieOptions}`
          console.log('Subdomain Layout - userId cookie set')
        } catch (e) {
          console.error('Subdomain Layout - Failed to set userId cookie:', e)
        }
        
        try {
          document.cookie = `email=${email}; ${cookieOptions}`
          console.log('Subdomain Layout - email cookie set')
        } catch (e) {
          console.error('Subdomain Layout - Failed to set email cookie:', e)
        }
        
        if (schoolUrl) {
          try {
            document.cookie = `schoolUrl=${schoolUrl}; ${cookieOptions}`
            console.log('Subdomain Layout - schoolUrl cookie set')
          } catch (e) {
            console.error('Subdomain Layout - Failed to set schoolUrl cookie:', e)
          }
        }
        
        if (subdomainUrl) {
          try {
            document.cookie = `subdomainUrl=${subdomainUrl}; ${cookieOptions}`
            console.log('Subdomain Layout - subdomainUrl cookie set')
          } catch (e) {
            console.error('Subdomain Layout - Failed to set subdomainUrl cookie:', e)
          }
        }
        
        if (tenantId) {
          try {
            document.cookie = `tenantId=${tenantId}; ${cookieOptions}`
            console.log('Subdomain Layout - tenantId cookie set')
          } catch (e) {
            console.error('Subdomain Layout - Failed to set tenantId cookie:', e)
          }
        }
        
        if (tenantName) {
          try {
            document.cookie = `tenantName=${encodeURIComponent(tenantName)}; ${cookieOptions}`
            console.log('Subdomain Layout - tenantName cookie set')
          } catch (e) {
            console.error('Subdomain Layout - Failed to set tenantName cookie:', e)
          }
        }
        
        if (tenantSubdomain) {
          try {
            document.cookie = `tenantSubdomain=${tenantSubdomain}; ${cookieOptions}`
            console.log('Subdomain Layout - tenantSubdomain cookie set')
          } catch (e) {
            console.error('Subdomain Layout - Failed to set tenantSubdomain cookie:', e)
          }
        }
        
        if (accessToken) {
          try {
            // Store access token - this will be used by the GraphQL client
            document.cookie = `accessToken=${accessToken}; ${cookieOptions}`
            console.log('Subdomain Layout - Access token stored in cookies successfully')
          } catch (e) {
            console.error('Subdomain Layout - Failed to set accessToken cookie:', e)
          }
          
          // Also make a request to our API to set HTTP-only cookies
          console.log('Subdomain Layout - Making request to /api/auth/store-tokens...')
          try {
            const response = await fetch('/api/auth/store-tokens', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                accessToken,
                refreshToken,
                userId,
                email,
                schoolUrl,
                subdomainUrl,
                tenantId,
                tenantName,
                tenantSubdomain
              }),
            })
            
            console.log('Subdomain Layout - store-tokens response status:', response.status)
            if (response.ok) {
              console.log('Subdomain Layout - HTTP-only cookies stored successfully')
            } else {
              console.error('Subdomain Layout - store-tokens failed with status:', response.status)
              // Continue even if API call fails - we still have client-side cookies
            }
          } catch (error) {
            console.error('Subdomain Layout - Failed to store HTTP-only cookies:', error)
            // Continue even if API call fails - we still have client-side cookies
          }
        }
        
        console.log('Subdomain Layout - All authentication data stored successfully')
        
        // Debug cookies after setting
        setTimeout(() => {
          console.log('Subdomain Layout - Cookies after setting:', document.cookie);
        }, 1000)
        
        // Add a fallback check to ensure at least basic cookies are set
        setTimeout(() => {
          const cookies = document.cookie.split(';')
          const hasAccessToken = cookies.some(cookie => cookie.trim().startsWith('accessToken='))
          const hasUserId = cookies.some(cookie => cookie.trim().startsWith('userId='))
          
          if (!hasAccessToken || !hasUserId) {
            console.warn('Subdomain Layout - Critical cookies missing, attempting to set them again')
            // Try to set the most critical cookies again
            try {
              if (accessToken && !hasAccessToken) {
                document.cookie = `accessToken=${accessToken}; max-age=${60 * 60 * 24 * 30}; path=/; SameSite=Lax${isProduction ? '; Secure' : ''}`
              }
              if (userId && !hasUserId) {
                document.cookie = `userId=${userId}; max-age=${60 * 60 * 24 * 30}; path=/; SameSite=Lax${isProduction ? '; Secure' : ''}`
              }
            } catch (e) {
              console.error('Subdomain Layout - Failed to set fallback cookies:', e)
            }
          }
        }, 2000)
        
        // Wait a bit before cleaning URL parameters to ensure cookies are set
        setTimeout(() => {
          try {
            // Remove parameters from URL to prevent sharing sensitive data
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete('userId')
            newUrl.searchParams.delete('email')
            newUrl.searchParams.delete('schoolUrl')
            newUrl.searchParams.delete('subdomainUrl')
            newUrl.searchParams.delete('tenantId')
            newUrl.searchParams.delete('tenantName')
            newUrl.searchParams.delete('tenantSubdomain')
            newUrl.searchParams.delete('accessToken')
            newUrl.searchParams.delete('refreshToken')
            newUrl.searchParams.delete('newRegistration')
            
            // Replace URL without reloading the page
            window.history.replaceState({}, '', newUrl.toString())
            console.log('Subdomain Layout - URL parameters cleaned')
          } catch (e) {
            console.error('Subdomain Layout - Failed to clean URL parameters:', e)
          }
        }, 1500) // Wait 1.5 seconds before cleaning URL
        
      } catch (error) {
        console.error('Subdomain Layout - Error storing authentication data in cookies:', error)
      }
    } else {
      console.log('Subdomain Layout - No authentication parameters to process')
      console.log('Subdomain Layout - Parameters check:', {
        isNewRegistration,
        hasAccessToken: !!accessToken,
        hasUserId: !!userId,
        hasEmail: !!email
      })
    }
    } catch (error) {
      console.error('Subdomain Layout - Critical error in authentication processing:', error)
    }
    }
    
    processAuth()
  }, [subdomain, isClient])

  return (
    <>
      {/* Debug indicator - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          background: 'red',
          color: 'white',
          padding: '2px 8px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          Subdomain Layout Active: {subdomain}
        </div>
      )}
      {/* Simple test to see if layout is working */}
      <div style={{ display: 'none' }}>
        Layout loaded for subdomain: {subdomain}
      </div>
      {children}
    </>
  )
}

// Main export with Suspense boundary
export default function SubdomainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<SubdomainLayoutLoading />}>
      <SubdomainLayoutContent>
        {children}
      </SubdomainLayoutContent>
    </Suspense>
  )
} 