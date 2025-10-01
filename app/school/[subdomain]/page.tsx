import { Suspense } from 'react'
import { SchoolHomepageWrapper } from './(pages)/components/SchoolHomepageWrapper'
import { ErrorBoundary } from './(pages)/components/ErrorBoundary'

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

export default function SchoolHome() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<HomepageLoading />}>
        <SchoolHomepageWrapper />
      </Suspense>
    </ErrorBoundary>
  )
}
