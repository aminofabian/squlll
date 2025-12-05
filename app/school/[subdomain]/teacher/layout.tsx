'use client'
import {metadata} from './metadata'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Sidebar } from "@/components/dashboard/TeacherSidebar"
import { MobileNav } from "@/components/dashboard/MobileNav"
import { TermProvider } from '../(pages)/contexts/TermContext'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TermProvider>
      <div className="font-outfit">
        <DashboardLayout
          sidebar={<Sidebar />}
          mobileNav={<MobileNav />}
        >
          {children}
        </DashboardLayout>
      </div>
    </TermProvider>
  )
} 