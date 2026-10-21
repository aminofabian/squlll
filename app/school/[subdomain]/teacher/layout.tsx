'use client'
import '../../../portal.css'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Sidebar } from "@/components/dashboard/TeacherSidebar"
import { TeacherMobileBottomNav } from "./components/TeacherMobileBottomNav"
import { TeacherMobileHeader } from "./components/TeacherMobileHeader"
import { TermProvider } from '../(pages)/contexts/TermContext'
import { ScrollToTop } from './components/ui/ScrollToTop'

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
          shellClassName="bg-background dark:bg-slate-950"
          mainClassName="p-0 pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:p-8 lg:pb-10"
          bottomNavClassName="border-border/80 bg-card/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
        >
          {children}
          <ScrollToTop />
        </DashboardLayout>
      </div>
    </TermProvider>
  )
} 