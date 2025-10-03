'use client'

import { useGraphQLErrorHandler } from '@/lib/hooks/useGraphQLErrorHandler'

export function ErrorHandler() {
  useGraphQLErrorHandler()
  return null // This component doesn't render anything
}
