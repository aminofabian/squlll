'use client'

import { SchoolHomepage } from './SchoolHomepage'
import type { HomepageConfig } from '@/lib/types/homepage-config'
import { SchoolConfiguration } from '../../../../../lib/types/school-config'

interface SchoolHomepageWrapperProps {
  config?: SchoolConfiguration
  /**
   * Published homepage config fetched server-side (SSR). When provided the
   * homepage renders immediately with real content instead of a client fetch
   * + loading spinner.
   */
  initialConfig?: HomepageConfig
}

export function SchoolHomepageWrapper({
  config,
  initialConfig,
}: SchoolHomepageWrapperProps) {
  return <SchoolHomepage config={config} initialConfig={initialConfig} />
}
