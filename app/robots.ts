import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { normalizeHostname } from '@/lib/hostname'
import { resolveHostViaBackend } from '@/lib/host-resolution'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.squl.co.ke'

/** Tenant-served pages that should not be indexed. */
const TENANT_DISALLOW = [
  '/dashboard',
  '/student',
  '/teacher',
  '/parent',
  '/staff-portal',
  '/settings',
  '/onboarding',
  '/setup',
  '/api/',
]

/**
 * Host-aware robots: a school served on its own domain (or subdomain) gets
 * tenant rules pointing at its own sitemap; everything else gets platform rules.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = await headers()
  const host = normalizeHostname(
    headerList.get('x-forwarded-host') ?? headerList.get('host'),
  )

  if (host) {
    const resolution = await resolveHostViaBackend(host)
    if (resolution?.tenantId) {
      const base = `https://${host}`
      return {
        rules: [{ userAgent: '*', allow: '/', disallow: TENANT_DISALLOW }],
        sitemap: `${base}/sitemap.xml`,
        host: base,
      }
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/superadmin', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
