'use client'

import { useEffect, useState } from 'react'
import { SchoolHomepage } from './SchoolHomepage'
import { SchoolConfiguration } from '../../../../../lib/types/school-config'

interface SchoolHomepageWrapperProps {
  config?: SchoolConfiguration
}

export function SchoolHomepageWrapper({ config }: SchoolHomepageWrapperProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Prevent hydration mismatch by only rendering on client
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading school homepage...</p>
        </div>
      </div>
    )
  }

  return <SchoolHomepage config={config} />
}
