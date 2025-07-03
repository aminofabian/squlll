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
    
    // Check for URL parameters from registration
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    const schoolUrl = searchParams.get('schoolUrl')
    const subdomainUrl = searchParams.get('subdomainUrl')
    const tenantId = searchParams.get('tenantId')
    const tenantName = searchParams.get('tenantName')
    const tenantSubdomain = searchParams.get('tenantSubdomain')
    const accessToken = searchParams.get('accessToken')
    const isNewRegistration = searchParams.get('newRegistration') === 'true'

    console.log('Subdomain Layout - URL parameters detected:', {
      userId: userId ? `${userId.substring(0, 10)}...` : 'none',
      email: email ? `${email.substring(0, 5)}...` : 'none',
      schoolUrl,
      subdomainUrl,
      tenantId: tenantId ? `${tenantId.substring(0, 10)}...` : 'none',
      tenantName,
      tenantSubdomain,
      hasAccessToken: !!accessToken,
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
        const cookieOptions = `max-age=${60 * 60 * 24 * 30}; path=/; SameSite=Lax${isProduction ? '; Secure' : ''}`
        
        document.cookie = `userId=${userId}; ${cookieOptions}`
        document.cookie = `email=${email}; ${cookieOptions}`
        
        if (schoolUrl) {
          document.cookie = `schoolUrl=${schoolUrl}; ${cookieOptions}`
        }
        
        if (subdomainUrl) {
          document.cookie = `subdomainUrl=${subdomainUrl}; ${cookieOptions}`
        }
        
        if (tenantId) {
          document.cookie = `tenantId=${tenantId}; ${cookieOptions}`
        }
        
        if (tenantName) {
          document.cookie = `tenantName=${encodeURIComponent(tenantName)}; ${cookieOptions}`
        }
        
        if (tenantSubdomain) {
          document.cookie = `tenantSubdomain=${tenantSubdomain}; ${cookieOptions}`
        }
        
        if (accessToken) {
          // Store access token - this will be used by the GraphQL client
          document.cookie = `accessToken=${accessToken}; ${cookieOptions}`
          console.log('Subdomain Layout - Access token stored in cookies successfully')
          
          // Also make a request to our API to set HTTP-only cookies
          fetch('/api/auth/store-tokens', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              accessToken,
              userId,
              email,
              schoolUrl,
              subdomainUrl,
              tenantId,
              tenantName,
              tenantSubdomain
            }),
          }).then(() => {
            console.log('Subdomain Layout - HTTP-only cookies stored successfully')
          }).catch(error => {
            console.error('Failed to store HTTP-only cookies:', error)
          })
        }
        
        console.log('Subdomain Layout - All authentication data stored successfully')
        
        // Debug cookies after setting
        setTimeout(() => {
          console.log('Cookies after setting:', document.cookie);
        }, 1000)
        
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
        newUrl.searchParams.delete('newRegistration')
        
        // Replace URL without reloading the page
        window.history.replaceState({}, '', newUrl.toString())
        console.log('Subdomain Layout - URL parameters cleaned')
        
      } catch (error) {
        console.error('Subdomain Layout - Error storing authentication data in cookies:', error)
      }
    } else {
      console.log('Subdomain Layout - No authentication parameters to process')
    }
  }, [subdomain, searchParams])

  return <>{children}</>
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