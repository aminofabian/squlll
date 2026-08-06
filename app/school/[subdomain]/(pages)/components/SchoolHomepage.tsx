'use client'

import { useParams } from 'next/navigation'
import { useEffect, useSyncExternalStore, useState } from 'react'
import {
  createDefaultHomepageConfig,
  type HomepageConfig,
  type PublicSchoolLevel,
} from '@/lib/types/homepage-config'
import { SchoolConfiguration } from '@/lib/types/school-config'
import brandingJson from '@/lib/data/tenant-branding.template.json'
import { fetchPublicHomepageConfig } from './homepage/homepage-api'
import { HomepageRenderer } from './homepage/templates'

interface SchoolHomepageProps {
  config?: SchoolConfiguration
  /** When provided (Website Studio preview), skip fetch and render this config */
  previewConfig?: HomepageConfig
  /** Published config fetched server-side (SSR) — skip the client fetch */
  initialConfig?: HomepageConfig
  /** School levels for the programs section (SSR or studio preview) */
  levels?: PublicSchoolLevel[]
}

function getSchoolNameFromSubdomain(subdomain: string) {
  return subdomain
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()!.split(';').shift() || null
  return null
}

/** Subscribe-less external store: read `schoolName` cookie safely for hydration. */
function useSchoolNameCookie(initialName: string, brandName?: string) {
  return useSyncExternalStore(
    () => () => {},
    () => brandName || readCookie('schoolName')?.trim() || initialName,
    () => initialName,
  )
}

function isPlaceholderCopy(value?: string | null) {
  if (!value?.trim()) return true
  const lower = value.toLowerCase()
  return (
    lower.includes('optional short description') ||
    lower.includes('your school') ||
    lower.includes('tenant.example')
  )
}

export function SchoolHomepage({
  config,
  previewConfig,
  initialConfig,
  levels,
}: SchoolHomepageProps) {
  const params = useParams()
  const subdomain = (params.subdomain as string) || 'school'
  const branding = brandingJson as {
    brand?: { name?: string; tagline?: string; description?: string }
    logos?: { primary?: string }
  }

  const initialName =
    (branding?.brand?.name as string) || getSchoolNameFromSubdomain(subdomain)
  const schoolName = useSchoolNameCookie(initialName, branding?.brand?.name)

  // Published config from SSR. Preview configs (Website Studio) are derived
  // directly from props, so they always reflect the latest keystroke without
  // an extra state copy + effect.
  const [loadedConfig, setLoadedConfig] = useState<HomepageConfig | null>(
    () => initialConfig || null,
  )
  const [ready, setReady] = useState(!!initialConfig)

  // Adjust loadedConfig when the server re-renders with a different config
  // (e.g. client-side navigation between school pages).
  const [prevInitialConfig, setPrevInitialConfig] = useState(initialConfig)
  if (initialConfig !== prevInitialConfig) {
    setPrevInitialConfig(initialConfig)
    setLoadedConfig(initialConfig ?? null)
    setReady(!!initialConfig)
  }

  useEffect(() => {
    if (previewConfig || initialConfig) return
    let cancelled = false
    ;(async () => {
      const loaded = await fetchPublicHomepageConfig(subdomain, schoolName)
      if (cancelled) return
      setLoadedConfig(loaded)
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [previewConfig, initialConfig, subdomain, schoolName])

  const homepageConfig =
    previewConfig ||
    loadedConfig ||
    createDefaultHomepageConfig(initialName)

  const tagline = isPlaceholderCopy(branding?.brand?.tagline)
    ? 'Inspiring excellence every day'
    : branding?.brand?.tagline || 'Inspiring excellence every day'

  if (!ready && !previewConfig && !initialConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f7f5]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-slate-600">Loading school homepage…</p>
        </div>
      </div>
    )
  }

  return (
    <HomepageRenderer
      config={homepageConfig}
      schoolConfig={config}
      levels={levels}
      runtime={{
        schoolName,
        subdomain,
        logoUrl: branding?.logos?.primary || undefined,
        tagline,
        preview: !!previewConfig,
      }}
    />
  )
}
