'use client'
import {metadata} from './metadata'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Sidebar } from "@/components/dashboard/TeacherSidebar"
import { SearchFilter } from "@/components/dashboard/SearchFilter"
import { MobileNav } from "@/components/dashboard/MobileNav"

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout
      sidebar={<Sidebar />}
      searchFilter={<SearchFilter type="dashboard" />}
      mobileNav={<MobileNav />}
    >
      {children}
    </DashboardLayout>
  )
} 