import { Suspense } from 'react'
import SignupContent from './SignupContent'
import { fetchPublicHomepageConfigServer } from '../components/homepage/homepage-api.server'
import { getSchoolDisplayName } from '../components/homepage/auth-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'
export const revalidate = 0

function SignupFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--school-paper,#f3f7f5)]">
      <p className="text-sm font-medium text-[var(--school-ink,#0a1f1a)]/60">
        Loading invitation…
      </p>
    </div>
  )
}

export default async function SignupPage({
  params,
}: {
  params: Promise<{ subdomain: string; signup: string }>
}) {
  const { subdomain, signup } = await params
  const schoolName = getSchoolDisplayName(subdomain)
  const config = await fetchPublicHomepageConfigServer(subdomain, schoolName)

  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupContent
        config={config}
        schoolName={schoolName}
        subdomain={subdomain}
        signupSegment={signup}
        logoUrl={config.logoUrl}
      />
    </Suspense>
  )
}
