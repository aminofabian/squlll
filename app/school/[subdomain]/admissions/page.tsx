import { Suspense } from 'react'
import AdmissionsContent from './AdmissionsContent'
import { fetchPublicHomepageConfigServer } from '../(pages)/components/homepage/homepage-api.server'
import { getSchoolDisplayName } from '../(pages)/components/homepage/auth-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'
export const revalidate = 0

function AdmissionsFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--school-paper,#f3f7f5)]">
      <p className="text-sm font-medium text-[var(--school-ink,#0a1f1a)]/60">
        Loading admissions…
      </p>
    </div>
  )
}

export default async function AdmissionsPage({
  params,
}: {
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params
  const schoolName = getSchoolDisplayName(subdomain)
  const config = await fetchPublicHomepageConfigServer(subdomain, schoolName)

  return (
    <Suspense fallback={<AdmissionsFallback />}>
      <AdmissionsContent
        config={config}
        schoolName={schoolName}
        logoUrl={config.logoUrl}
      />
    </Suspense>
  )
}
