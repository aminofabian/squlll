'use client'

import { useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

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
  const searchParams = useSearchParams()

  useEffect(() => {
    console.log('Subdomain Layout - Processing authentication parameters for:', subdomain)
    console.log('Subdomain Layout - Component mounted, window.location:', window.location.href)
    console.log('Subdomain Layout - searchParams object:', searchParams)
    console.log('Subdomain Layout - searchParams.toString():', searchParams.toString())
    
    // Check for URL parameters from registration
    // Use both useSearchParams and direct URL parsing as fallback
    let userId = searchParams.get('userId')
    let email = searchParams.get('email')
    let schoolUrl = searchParams.get('schoolUrl')
    let subdomainUrl = searchParams.get('subdomainUrl')
    let tenantId = searchParams.get('tenantId')
    let tenantName = searchParams.get('tenantName')
    let tenantSubdomain = searchParams.get('tenantSubdomain')
    let accessToken = searchParams.get('accessToken')
    let refreshToken = searchParams.get('refreshToken')
    let isNewRegistration = searchParams.get('newRegistration') === 'true'
    
    // Fallback: If useSearchParams didn't work, try parsing URL directly
    if (!userId && typeof window !== 'undefined') {
      console.log('Subdomain Layout - useSearchParams failed, trying direct URL parsing...')
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
        const domain = isProduction ? '.squl.co.ke' : undefined
        const cookieOptions = `max-age=${60 * 60 * 24 * 30}; path=/; SameSite=Lax${isProduction ? '; Secure' : ''}${domain ? `; Domain=${domain}` : ''}`
        
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
          fetch('/api/auth/store-tokens', {
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
          }).then((response) => {
            console.log('Subdomain Layout - store-tokens response status:', response.status)
            if (response.ok) {
              console.log('Subdomain Layout - HTTP-only cookies stored successfully')
            } else {
              console.error('Subdomain Layout - store-tokens failed with status:', response.status)
            }
          }).catch(error => {
            console.error('Subdomain Layout - Failed to store HTTP-only cookies:', error)
          })
        }
        
        console.log('Subdomain Layout - All authentication data stored successfully')
        
        // Debug cookies after setting
        setTimeout(() => {
          console.log('Subdomain Layout - Cookies after setting:', document.cookie);
        }, 1000)
        
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
  }, [subdomain, searchParams])

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