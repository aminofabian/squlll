import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { resolveHostViaBackend } from '@/lib/host-resolution'
import { cookieHasRole, parseRoleCookieValues, SUPER_ADMIN_ROLE } from '@/lib/auth/role-cookie'
import {
  canAccessAdminShell,
  getPostLoginPath,
} from '@/lib/auth/post-login-navigation'

/**
 * Read the `role` claim from the access-token JWT (unverified — used only for
 * UX routing; the API enforces roles elsewhere). Lets the gate work even when
 * the client-readable `userRole` cookie is missing or stale.
 */
function roleFromAccessToken(token: string | undefined): string | undefined {
  if (!token) return undefined
  try {
    const payload = token.split('.')[1]
    if (!payload) return undefined
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = JSON.parse(atob(base64)) as { role?: unknown }
    return typeof json.role === 'string' ? json.role : undefined
  } catch {
    return undefined
  }
}

/** Top-level segments that belong to the admin (pages) shell. */
const ADMIN_ROUTE_SEGMENTS = new Set([
  'dashboard',
  'students',
  'classes',
  'teachers',
  'timetable',
  'fees',
  'exams',
  'website',
  'transport',
  'domains',
  'reminders',
  'sms-credits',
  'settings',
  'parents',
  'staff',
  'grading',
  'curriculum',
  'school-years',
  'reports',
  'analytics',
  'enrollment',
  'communication',
  'notifications',
])

export async function proxy(request: NextRequest) {
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

  // Host without port, used for subdomain matching. Supports any dev port
  // (e.g. mirema.localhost:3002), not just :3000.
  const host = hostname.split(':')[0].toLowerCase()
  const incomingPort = hostname.split(':')[1] || ''
  const apexDomain = isProd ? 'squl.co.ke' : 'localhost'
  const apexHost = isProd ? 'squl.co.ke' : `localhost${incomingPort ? `:${incomingPort}` : ''}`
  const currentHost = host.endsWith(`.${apexDomain}`)
    ? host.slice(0, -(apexDomain.length + 1))
    : host

  // Exclude static files and api routes
  if (url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/static') ||
      url.pathname.includes('.')) {
    console.log('Middleware - Skipping static/api route:', url.pathname)
    return NextResponse.next()
  }

  // Check if this is a subdomain (excluding www)
  const isSubdomain = host.endsWith(`.${apexDomain}`) &&
    !host.startsWith('www.') &&
    host !== apexDomain
  const isWWW = host.startsWith('www.')

  // Protect super admin dashboard routes on the apex domain only.
  // School subdomains also use /dashboard but rewrite to /school/[subdomain]/dashboard.
  if (url.pathname.startsWith('/dashboard') && !isSubdomain) {
    const userRole = request.cookies.get('userRole')?.value
    const accessToken = request.cookies.get('accessToken')?.value

    // Tolerate a comma-joined role value, which can happen when a proxy or the
    // browser merges duplicate `userRole` cookies.
    if (!accessToken || !cookieHasRole(userRole, SUPER_ADMIN_ROLE)) {
      const loginUrl = new URL('/superadmin/login', request.url)
      loginUrl.searchParams.set('next', url.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  console.log('Middleware - Subdomain check:', {
    isSubdomain,
    currentHost,
    hostname,
    isProd
  })

  // Decide which school to serve. Platform subdomains keep the fast, backend-free
  // path. Any other host (a tenant's own domain) is resolved through the API —
  // results are cached in-process, so this only runs for real custom domains.
  let effectiveSubdomain: string | null = isSubdomain ? currentHost : null

  if (!effectiveSubdomain && !isWWW && host !== apexDomain) {
    try {
      const resolution = await resolveHostViaBackend(hostname)
      if (resolution?.subdomain) {
        effectiveSubdomain = resolution.subdomain
      }
    } catch (error) {
      console.error('Middleware - Custom domain resolution failed:', error)
    }
  }

  if (effectiveSubdomain) {
    // Special handling for signup routes with tokens - redirect to main domain
    if ((url.pathname === '/signup' || url.pathname === '/teacher-signup') && url.searchParams.has('token')) {
      const mainDomain = isProd ? 'https://squl.co.ke' : `http://${apexHost}`
      const redirectUrl = new URL(`${mainDomain}/signup${url.search}`)
      return NextResponse.redirect(redirectUrl)
    }

    // Role gate: non-admin members must never reach the admin (pages) shell.
    // Enforced server-side so a stale client bundle can't bypass it. Prefer the
    // role cookie, but fall back to the access token's `role` claim.
    const cookieRoles = parseRoleCookieValues(
      request.cookies.get('userRole')?.value,
    )
    const tokenRole = roleFromAccessToken(
      request.cookies.get('accessToken')?.value ??
        request.cookies.get('access_token')?.value,
    )
    const roles =
      cookieRoles.length > 0 ? cookieRoles : tokenRole ? [tokenRole] : []
    if (roles.length > 0 && !roles.some((r) => canAccessAdminShell(r))) {
      const firstSegment = url.pathname.split('/').filter(Boolean)[0] ?? ''
      if (ADMIN_ROUTE_SEGMENTS.has(firstSegment)) {
        const portal = getPostLoginPath(roles[0], true)
        const target = portal === '/dashboard' ? '/login' : portal
        return NextResponse.redirect(new URL(target, request.url))
      }
    }

    // Rewrite the path to include /school/[subdomain]. If the path already
    // targets this school (custom-domain in-app links use /school/[subdomain]),
    // don't double-prefix.
    const schoolPrefix = `/school/${effectiveSubdomain}`
    const rewritePath = url.pathname.startsWith(schoolPrefix)
      ? url.pathname
      : `${schoolPrefix}${url.pathname === '/' ? '' : url.pathname}`

    console.log('Middleware - School request, rewriting:', {
      hostname,
      originalPath: url.pathname,
      rewritePath,
      effectiveSubdomain,
      search: url.search
    })

    try {
      const rewriteUrl = new URL(rewritePath + url.search, request.url)
      const rewriteResponse = NextResponse.rewrite(rewriteUrl)

      // Prevent caching issues and ensure proper module loading
      rewriteResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      rewriteResponse.headers.set('Pragma', 'no-cache')
      rewriteResponse.headers.set('Expires', '0')
      rewriteResponse.headers.set('X-Subdomain', effectiveSubdomain)
      rewriteResponse.headers.set('X-Tenant-Host', host)

      return rewriteResponse
    } catch (error) {
      console.error('Middleware - Error during rewrite:', error)
      return NextResponse.next()
    }
  }

  // Handle www subdomain - ensure it works the same as root domain
  if (isWWW) {
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
