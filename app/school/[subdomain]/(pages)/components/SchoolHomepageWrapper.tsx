'use client'

import { SchoolHomepage } from './SchoolHomepage'
import type {
  HomepageConfig,
  PublicSchoolLevel,
} from '@/lib/types/homepage-config'
import { SchoolConfiguration } from '../../../../../lib/types/school-config'

interface SchoolHomepageWrapperProps {
  config?: SchoolConfiguration
  /**
   * Published homepage config fetched server-side (SSR). When provided the
   * homepage renders immediately with real content instead of a client fetch
   * + loading spinner.
   */
  initialConfig?: HomepageConfig
  /** School levels (curricula) for the programs section, fetched server-side. */
  levels?: PublicSchoolLevel[]
}

export function SchoolHomepageWrapper({
  config,
  initialConfig,
  levels,
}: SchoolHomepageWrapperProps) {
  return <SchoolHomepage config={config} initialConfig={initialConfig} levels={levels} />
}
