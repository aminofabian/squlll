import { Suspense } from 'react'
import { SchoolHomepageWrapper } from './(pages)/components/SchoolHomepageWrapper'
import { ErrorBoundary } from './(pages)/components/ErrorBoundary'
import { fetchPublicHomepageConfigServer } from './(pages)/components/homepage/homepage-api.server'

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getSchoolNameFromSubdomain(subdomain: string) {
  return subdomain
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

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
  const schoolName = getSchoolNameFromSubdomain(subdomain)
  const initialConfig = await fetchPublicHomepageConfigServer(subdomain, schoolName)

  return (
    <ErrorBoundary>
      <Suspense fallback={<HomepageLoading />}>
        <SchoolHomepageWrapper initialConfig={initialConfig} />
      </Suspense>
    </ErrorBoundary>
  )
}
