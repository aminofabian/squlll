'use client'

import { SchoolHomepage } from './components/SchoolHomepage'
import { ErrorBoundary } from './components/ErrorBoundary'

export default function SchoolHome() {
  return (
    <ErrorBoundary>
      <SchoolHomepage />
    </ErrorBoundary>
  )
} 