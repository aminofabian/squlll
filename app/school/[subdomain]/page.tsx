import { Suspense } from 'react'
import { SchoolHomepageWrapper } from './(pages)/components/SchoolHomepageWrapper'
import { ErrorBoundary } from './(pages)/components/ErrorBoundary'
import {
  fetchPublicHomepageConfigMeta,
  fetchPublicSchoolLevelsServer,
} from './(pages)/components/homepage/homepage-api.server'
import {
  buildSchoolJsonLd,
  describeHomepage,
  getTenantIdentity,
  resolveSchoolName,
} from '@/lib/school/tenant-seo'

// Force dynamic rendering and disable caching — publish must show immediately
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'
export const revalidate = 0

// Loading component for Suspense fallback
function HomepageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading school homepage...</p>
      </div>
    </div>
  )
}

export default async function SchoolHome({
  params,
}: {
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params
  const identity = await getTenantIdentity(subdomain)
  const [meta, levels] = await Promise.all([
    fetchPublicHomepageConfigMeta(subdomain, identity.name),
    fetchPublicSchoolLevelsServer(subdomain),
  ])
  const initialConfig = meta.config
  const schoolName = resolveSchoolName(initialConfig, identity.name)

  // Only emit structured data for schools that published a real homepage — a
  // default/unpublished site is a placeholder, not a school to describe.
  const jsonLd = meta.published
    ? buildSchoolJsonLd({
        name: schoolName,
        origin: identity.origin,
        ...describeHomepage(initialConfig, schoolName),
      })
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ErrorBoundary>
        <Suspense fallback={<HomepageLoading />}>
          <SchoolHomepageWrapper initialConfig={initialConfig} levels={levels} />
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
