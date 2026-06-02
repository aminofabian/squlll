'use client'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { StudentSidebar } from "@/components/dashboard/StudentSidebar"
import { StudentMobileBottomNav } from "./components/StudentMobileBottomNav"
import { StudentMobileHeader } from "./components/StudentMobileHeader"

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
        shellClassName="bg-[#f2f2f7] dark:bg-slate-950 lg:bg-background"
        mainClassName="p-0 pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:p-6 lg:pb-6"
        bottomNavClassName="border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-slate-900/95"
      >
        {children}
      </DashboardLayout>
    </div>
  )
}
