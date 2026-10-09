import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { resolveGraphqlEndpoint } from '@/lib/graphql-endpoint'
import { getAuthCookieOptions } from '@/lib/auth/cookie-domain'

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

    const graphqlRes = await fetch(resolveGraphqlEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: IMPERSONATE_MUTATION,
        variables: { tenantId },
      }),
    })

    const json = await graphqlRes.json()
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
          userId: string
          email: string
          userName: string
          role: string
          message: string
        }
      | undefined

    if (!payload?.accessToken || !payload.portalUrl) {
      return NextResponse.json(
        { error: 'Impersonation response incomplete' },
        { status: 500 },
      )
    }

    const requestUrl = new URL(request.url)
    const isProduction = process.env.NODE_ENV === 'production'
    // Cookie scope follows the host the browser is on.
    const { domain, sameSite, secure } = getAuthCookieOptions(request)

    // Prefer the backend's portal URL when it targets a public host (e.g. a
    // school's custom domain); otherwise rebuild against the platform subdomain
    // so support sessions never bounce to localhost.
    const apex = isProduction ? 'squl.co.ke' : 'localhost'
    const port = requestUrl.port
    const subdomain = payload.subdomain.trim().toLowerCase()
    const portalUrl =
      publicPortalUrl(payload.portalUrl) ??
      `${isProduction ? 'https' : 'http'}://${subdomain}.${apex}${
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
