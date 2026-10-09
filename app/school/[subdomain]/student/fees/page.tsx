'use client'

import { useParams } from 'next/navigation'
import { StudentPage } from '../_ui'
import { StudentFeesSection } from '../components/StudentFeesSection'

export default function StudentFeesPage() {
  const params = useParams()
  const subdomain =
    typeof params.subdomain === 'string'
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ''

  return (
    <StudentPage>
      <StudentFeesSection subdomain={subdomain} layout="page" />
    </StudentPage>
  )
}
