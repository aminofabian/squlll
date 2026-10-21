'use client'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { StudentSidebar } from "@/components/dashboard/StudentSidebar"
import { StudentMobileBottomNav } from "./components/StudentMobileBottomNav"
import { StudentMobileHeader } from "./components/StudentMobileHeader"
import { ScrollToTop } from "@/components/portal/ScrollToTop"
import '../../../portal.css'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="font-sans">
      <DashboardLayout
        sidebar={<StudentSidebar />}
        mobileNav={<StudentMobileBottomNav />}
        mobileHeader={<StudentMobileHeader />}
        hideMobileSidebarTrigger
        shellClassName="bg-background dark:bg-slate-950"
        mainClassName="p-0 pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:p-8 lg:pb-10"
        bottomNavClassName="border-border/80 bg-card/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95"
      >
        {children}
        <ScrollToTop />
      </DashboardLayout>
    </div>
  )
}
