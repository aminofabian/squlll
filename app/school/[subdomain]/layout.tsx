'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function SchoolLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const subdomain = params.subdomain as string

  useEffect(() => {
    // Here you can fetch school-specific data based on the subdomain
    console.log('School subdomain:', subdomain)
  }, [subdomain])

  return (
    <div>
      {children}
    </div>
  )
} 