import { SchoolHomepage } from './(pages)/components/SchoolHomepage'
import { ErrorBoundary } from './(pages)/components/ErrorBoundary'

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic'

export default function SchoolHome() {
  return (
    <ErrorBoundary>
      <SchoolHomepage />
    </ErrorBoundary>
  )
}
