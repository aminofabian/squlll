'use client'

import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { StaffSidebar } from "@/components/dashboard/StaffSidebar"
import { MobileNav } from "@/components/dashboard/MobileNav"

export default function StaffPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="font-outfit">
      <DashboardLayout
        sidebar={<StaffSidebar />}
        mobileNav={<MobileNav />}
      >
        {children}
      </DashboardLayout>
    </div>
  )
} 