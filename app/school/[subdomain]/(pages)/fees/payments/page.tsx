'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { readIsSchoolOwner } from '@/lib/school/isSchoolOwner'

/**
 * Legacy URL — payment rails now live in an owner-only dashboard drawer.
 */
export default function FeesPaymentsSettingsPage() {
  const router = useRouter()

  useEffect(() => {
    if (!readIsSchoolOwner()) {
      router.replace('/dashboard')
      return
    }
    router.replace('/dashboard?payments=open')
  }, [router])

  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-[#f3f7f5] text-[13px] text-[#1a4d42]/55">
      Opening payment settings…
    </div>
  )
}
