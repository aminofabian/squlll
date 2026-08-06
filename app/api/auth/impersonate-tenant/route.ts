import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { resolveGraphqlEndpoint } from '@/lib/graphql-endpoint'

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
    let domain: string | undefined
    let sameSite: 'lax' | 'none' = 'lax'
    let secure = false

    if (isProduction) {
      domain = '.squl.co.ke'
      sameSite = 'none'
      secure = true
    } else if (requestUrl.hostname.endsWith('.localhost')) {
      domain = '.localhost'
      sameSite = 'lax'
      secure = false
    }

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
    cookieStore.set('subdomainUrl', `${payload.subdomain}.squl.co.ke`, {
      httpOnly: false,
      secure,
      sameSite,
      domain,
      path: '/',
      maxAge,
    })

    return NextResponse.json({
      ok: true,
      portalUrl: payload.portalUrl,
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
