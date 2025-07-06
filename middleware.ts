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
    isProd,
    userAgent: request.headers.get('user-agent')?.substring(0, 100)
  })
  
  // Exclude static files and api routes
  if (url.pathname.startsWith('/_next') || 
      url.pathname.startsWith('/api') || 
      url.pathname.startsWith('/static') ||
      url.pathname.includes('.')) {
    console.log('Middleware - Skipping static/api route:', url.pathname)
    return NextResponse.next()
  }

  // Pass through all requests without any subdomain rewriting
  console.log('Middleware - Passing through request without modification')
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