import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const isProd = process.env.NODE_ENV === 'production'
  
  // React 19 compatibility: Add headers to prevent module loading issues
  const response = NextResponse.next()
  response.headers.set('X-React-Version', '19')
  response.headers.set('X-Next-Version', '15.3.3')
  
  console.log('Middleware - Processing request:', {
    hostname,
    pathname: url.pathname,
    search: url.search,
    isProd,
    userAgent: request.headers.get('user-agent')?.substring(0, 100)
  })
  
  // Define your domains
  const currentHost = 
    process.env.NODE_ENV === 'production'
      ? hostname.replace(`.squl.co.ke`, '')
      : hostname.replace(`.localhost:3000`, '')

  // Exclude static files and api routes
  if (url.pathname.startsWith('/_next') || 
      url.pathname.startsWith('/api') || 
      url.pathname.startsWith('/static') ||
      url.pathname.includes('.')) {
    console.log('Middleware - Skipping static/api route:', url.pathname)
    return NextResponse.next()
  }

  // Check if this is a subdomain (excluding www)
  const isSubdomain = hostname.includes(isProd ? '.squl.co.ke' : '.localhost:3000') &&
    !hostname.startsWith('www.') &&
    hostname !== (isProd ? 'squl.co.ke' : 'localhost:3000')

  console.log('Middleware - Subdomain check:', {
    isSubdomain,
    currentHost,
    hostname,
    isProd
  })

  if (isSubdomain) {
    // Special handling for signup routes with tokens - redirect to main domain
    if ((url.pathname === '/signup' || url.pathname === '/teacher-signup') && url.searchParams.has('token')) {
      const mainDomain = isProd ? 'https://squl.co.ke' : 'http://localhost:3001'
      const redirectUrl = new URL(`${mainDomain}/signup${url.search}`)
      
      console.log('Middleware - Redirecting signup with token to main domain:', {
        from: request.url,
        to: redirectUrl.toString(),
        path: url.pathname,
        token: url.searchParams.get('token')?.substring(0, 20) + '...'
      })
      
      return NextResponse.redirect(redirectUrl)
    }
    
    // For other subdomain requests, rewrite the path to include /school/[subdomain]
    const rewritePath = `/school/${currentHost}${url.pathname}`
    
    console.log('Middleware - Subdomain request, rewriting:', {
      hostname,
      originalPath: url.pathname,
      rewritePath,
      currentHost,
      search: url.search
    })
    
    try {
      // Create the rewrite URL
      const rewriteUrl = new URL(rewritePath + url.search, request.url)
      
      // Create response with proper headers to prevent caching issues
      const response = NextResponse.rewrite(rewriteUrl)
      
      // Add headers to prevent caching and ensure proper module loading
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      response.headers.set('X-Subdomain', currentHost)
      
      return response
    } catch (error) {
      console.error('Middleware - Error during rewrite:', error)
      // Fallback to next() if rewrite fails
      return NextResponse.next()
    }
  }

  // Handle www subdomain - ensure it works the same as root domain
  const isWWW = hostname.startsWith('www.')
  if (isWWW) {
    // For www subdomain, just pass through to the normal routing
    // This ensures www.example.com/school/abc works the same as example.com/school/abc
    console.log('Middleware - Processing www subdomain:', {
      hostname,
      pathname: url.pathname
    })
    return NextResponse.next()
  }

  console.log('Middleware - No special handling needed, passing through')
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|static|[\\w-]+\\.\\w+).*)',
  ],
} 