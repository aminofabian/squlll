import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { resolveGraphqlEndpoint } from '@/lib/graphql-endpoint'
import { getAuthCookieOptions } from '@/lib/auth/cookie-domain'
import { clearSessionCookies } from '@/lib/auth/session-cookies'

const IMPERSONATE_MUTATION = `
  mutation ImpersonateTenantAdmin($tenantId: String!) {
    impersonateTenantAdmin(tenantId: $tenantId) {
      accessToken
      refreshToken
      tenantId
      tenantName
      subdomain
      portalUrl
      userId
      email
      userName
      role
      message
    }
  }
`

/**
 * Accept the backend's portal URL only when it points at a public host.
 *
 * The API builds this URL from its own NODE_ENV; if that is not `production`
 * it returns `http://<sub>.localhost:3000/dashboard`, which would bounce a
 * support session to localhost. Ignore localhost/private hosts and let the
 * caller rebuild against the platform subdomain instead.
 */
function publicPortalUrl(raw: unknown): string | null {
  if (typeof raw !== 'string' || !/^https?:\/\//i.test(raw)) return null
  try {
    const host = new URL(raw).hostname.toLowerCase()
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local')
    ) {
      return null
    }
    return raw
  } catch {
    return null
  }
}

function membershipIdFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = Buffer.from(payload, 'base64url').toString('utf8')
    const claims = JSON.parse(json) as { membershipId?: unknown }
    return typeof claims.membershipId === 'string' ? claims.membershipId : null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const tenantId = typeof body.tenantId === 'string' ? body.tenantId.trim() : ''
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value
    if (!accessToken) {
      return NextResponse.json({ error: 'Not signed in as super admin' }, { status: 401 })
    }

    const graphqlController = new AbortController()
    const graphqlTimeout = setTimeout(() => graphqlController.abort(), 15_000)
    let graphqlRes: Response
    try {
      graphqlRes = await fetch(resolveGraphqlEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          query: IMPERSONATE_MUTATION,
          variables: { tenantId },
        }),
        signal: graphqlController.signal,
      })
    } catch (error) {
      clearTimeout(graphqlTimeout)
      const timedOut =
        error instanceof Error && error.name === 'AbortError'
      return NextResponse.json(
        {
          error: timedOut
            ? 'The school portal sign-in timed out. Try again.'
            : 'Could not reach the school portal service.',
        },
        { status: timedOut ? 504 : 502 },
      )
    } finally {
      clearTimeout(graphqlTimeout)
    }

    let json: {
      data?: { impersonateTenantAdmin?: Record<string, unknown> }
      errors?: Array<{ message?: string }>
    }
    try {
      json = await graphqlRes.json()
    } catch {
      return NextResponse.json(
        { error: 'The school portal service returned an invalid response.' },
        { status: 502 },
      )
    }
    if (json.errors?.length) {
      return NextResponse.json(
        { error: json.errors[0]?.message || 'Impersonation failed' },
        { status: 400 },
      )
    }

    const payload = json.data?.impersonateTenantAdmin as
      | {
          accessToken: string
          refreshToken: string
          tenantId: string
          tenantName: string
          subdomain: string
          portalUrl: string
          membershipId?: string
          userId: string
          email: string
          userName: string
          role: string
          message: string
        }
      | undefined

    if (!payload?.accessToken) {
      return NextResponse.json(
        { error: 'Impersonation response incomplete' },
        { status: 500 },
      )
    }

    const requestUrl = new URL(request.url)
    const isProduction = process.env.NODE_ENV === 'production'
    // Cookie scope follows the host the browser is on.
    const { domain, sameSite, secure } = getAuthCookieOptions(request)

    // Always redirect to the platform subdomain. The backend may prefer a
    // school's custom domain, but the cookies set here belong to the current
    // platform host (for example .squl.co.ke) and are never sent to a custom
    // domain. Using the custom URL would land on that domain's login page.
    const apex = isProduction ? 'squl.co.ke' : 'localhost'
    const port = requestUrl.port
    const subdomain = payload.subdomain.trim().toLowerCase()
    const portalUrl = `${isProduction ? 'https' : 'http'}://${subdomain}.${apex}${
      port ? `:${port}` : ''
    }/dashboard`

    const maxAge = 60 * 60 * 8 // 8 hours for support sessions

    cookieStore.set('accessToken', payload.accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      path: '/',
      maxAge,
    })
    cookieStore.set('refreshToken', payload.refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      path: '/',
      maxAge,
    })
    cookieStore.set('userId', payload.userId, {
      httpOnly: false,
      secure,
      sameSite,
      domain,
      path: '/',
      maxAge,
    })
    cookieStore.set('email', payload.email, {
      httpOnly: false,
      secure,
      sameSite,
      domain,
      path: '/',
      maxAge,
    })
    cookieStore.set('userName', payload.userName, {
      httpOnly: false,
      secure,
      sameSite,
      domain,
      path: '/',
      maxAge,
    })
    const membershipId =
      payload.membershipId || membershipIdFromToken(payload.accessToken)
    if (membershipId) {
      cookieStore.set('membershipId', membershipId, {
        httpOnly: false,
        secure,
        sameSite,
        domain,
        path: '/',
        maxAge,
      })
    }
    cookieStore.set('userRole', payload.role, {
      httpOnly: false,
      secure,
      sameSite,
      domain,
      path: '/',
      maxAge,
    })
    cookieStore.set('tenantId', payload.tenantId, {
      httpOnly: false,
      secure,
      sameSite,
      domain,
      path: '/',
      maxAge,
    })
    cookieStore.set('tenantName', payload.tenantName, {
      httpOnly: false,
      secure,
      sameSite,
      domain,
      path: '/',
      maxAge,
    })
    cookieStore.set('tenantSubdomain', payload.subdomain, {
      httpOnly: false,
      secure,
      sameSite,
      domain,
      path: '/',
      maxAge,
    })
    cookieStore.set('subdomainUrl', `${subdomain}.${apex}${port ? `:${port}` : ''}`, {
      httpOnly: false,
      secure,
      sameSite,
      domain,
      path: '/',
      maxAge,
    })

    return NextResponse.json({
      ok: true,
      portalUrl,
      message: payload.message,
      school: {
        id: payload.tenantId,
        name: payload.tenantName,
        subdomain: payload.subdomain,
      },
      asUser: {
        id: payload.userId,
        email: payload.email,
        name: payload.userName,
      },
    })
  } catch (error) {
    console.error('impersonate-tenant error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to enter school portal',
      },
      { status: 500 },
    )
  }
}
