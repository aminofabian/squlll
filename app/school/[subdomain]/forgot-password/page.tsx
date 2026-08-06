import ForgotPasswordContent from './ForgotPasswordContent'
import { fetchPublicHomepageConfigServer } from '../(pages)/components/homepage/homepage-api.server'
import { getSchoolDisplayName } from '../(pages)/components/homepage/auth-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params
  const schoolName = getSchoolDisplayName(subdomain)
  const config = await fetchPublicHomepageConfigServer(subdomain, schoolName)

  return (
    <ForgotPasswordContent
      config={config}
      schoolName={schoolName}
      logoUrl={config.logoUrl}
    />
  )
}
