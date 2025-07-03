'use client'

import { useSchoolConfig } from '../../../../lib/hooks/useSchoolConfig'
import { SchoolTypeSetup } from '../../components/schooltype'
import { SchoolHomepage } from './components/SchoolHomepage'
import { ClassHeader } from './components/ClassCard'

export default function SchoolHome() {
  const { data: config, isLoading, error } = useSchoolConfig()

  // Show loading state
  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-sm text-gray-500">Loading school configuration...</p>
      </main>
    )
  }

  // Check if this is a 401 error (no authentication) or no configuration exists
  const errorMessage = error instanceof Error ? error.message : (error || '')
  const isAuthError = error && (
    errorMessage.includes('401') || 
    errorMessage.includes('Unauthorized') || 
    errorMessage.includes('Authentication required')
  )
  
  // If there's an auth error or no config data, show the setup flow
  // This handles new registrations or schools that haven't been configured yet
  const shouldShowSetup = isAuthError || !config || (config && (!config.selectedLevels || config.selectedLevels.length === 0))

  if (shouldShowSetup) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="flex-1">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <ClassHeader />
          </div>
          <SchoolTypeSetup />
        </div>
      </main>
    )
  }

  // Show other errors (not auth related)
  if (error && !isAuthError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  // If configured, show the homepage
  return <SchoolHomepage config={config} />
} 