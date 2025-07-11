'use client'
import {metadata} from './metadata'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { StudentSidebar } from "@/components/dashboard/StudentSidebar"
import { MobileNav } from "@/components/dashboard/MobileNav"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="font-outfit">
      <DashboardLayout
        sidebar={<StudentSidebar />}
        mobileNav={<MobileNav />}
      >
        {children}
      </DashboardLayout>
    </div>
  )
} 