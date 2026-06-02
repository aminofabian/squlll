'use client'
import {metadata} from './metadata'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Sidebar } from "@/components/dashboard/TeacherSidebar"
import { TeacherMobileBottomNav } from "./components/TeacherMobileBottomNav"
import { TeacherMobileHeader } from "./components/TeacherMobileHeader"
import { TermProvider } from '../(pages)/contexts/TermContext'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TermProvider>
      <div className="font-sans">
        <DashboardLayout
          sidebar={<Sidebar />}
          mobileNav={<TeacherMobileBottomNav />}
          mobileHeader={<TeacherMobileHeader />}
          hideMobileSidebarTrigger
          shellClassName="bg-[#f2f2f7] dark:bg-slate-950 lg:bg-background"
          mainClassName="p-0 pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:p-6 lg:pb-6"
          bottomNavClassName="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95"
        >
          {children}
        </DashboardLayout>
      </div>
    </TermProvider>
  )
} 