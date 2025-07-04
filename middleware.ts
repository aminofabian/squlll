import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const isProd = process.env.NODE_ENV === 'production'
  
  console.log('Middleware - Processing request:', {
    hostname,
    pathname: url.pathname,
    search: url.search,
    isProd
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
    return NextResponse.next()
  }

  // Check if this is a subdomain (excluding www)
  const isSubdomain = hostname.includes(isProd ? '.squl.co.ke' : '.localhost:3000') &&
    !hostname.startsWith('www.') &&
    hostname !== (isProd ? 'squl.co.ke' : 'localhost:3000')

  if (isSubdomain) {
    // This is a school subdomain
    // Rewrite to /school/[subdomain]/pathname
    const newPathname = `/school/${currentHost}${url.pathname}`
    console.log('Middleware - Rewriting subdomain:', {
      from: url.pathname,
      to: newPathname,
      currentHost
    })
    url.pathname = newPathname
    
    // Create response with cache control headers
    const response = NextResponse.rewrite(url)
    
    // Add cache control headers for subdomain pages
    if (isProd) {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    }
    
    return response
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