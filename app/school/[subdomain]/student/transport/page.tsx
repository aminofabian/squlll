'use client'

import { PageHeader, StudentPage } from '../_ui'
import { StudentTransportSection } from '../components/StudentTransportSection'

export default function StudentTransportPage() {
  return (
    <StudentPage wide>
      <PageHeader
        eyebrow="Getting around"
        title="Transport"
        subtitle="Today's journey, the live bus location and your pickup point."
      />
      <StudentTransportSection />
    </StudentPage>
  )
}
