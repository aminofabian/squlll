import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const isProd = process.env.NODE_ENV === 'production'
  
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

  // Check if this is a subdomain
  const isSubdomain = hostname.includes(isProd ? '.squl.co.ke' : '.localhost:3000') &&
    !hostname.startsWith('www.') &&
    hostname !== (isProd ? 'squl.co.ke' : 'localhost:3000')

  if (isSubdomain) {
    // This is a school subdomain
    // Rewrite to /school/[subdomain]/pathname
    url.pathname = `/school/${currentHost}${url.pathname}`
    return NextResponse.rewrite(url)
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