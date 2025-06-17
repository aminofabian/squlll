"use client"

import { ReactNode, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

interface DashboardLayoutProps {
  sidebar: ReactNode
  searchFilter: ReactNode
  children: ReactNode
  showMobileNav?: boolean
  mobileNav?: ReactNode
}

export function DashboardLayout({ 
  sidebar, 
  searchFilter, 
  children, 
  showMobileNav = true,
  mobileNav 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              {sidebar}
            </SheetContent>
          </Sheet>
          
          <h1 className="font-semibold text-lg">SQUL Admin</h1>
          
          <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 md:hidden">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
                <span className="sr-only">Open filters</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-80">
              {searchFilter}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-40">
          <div className="flex flex-col flex-grow border-r border-border bg-card overflow-y-auto">
            {sidebar}
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 lg:pl-64">
          <div className="flex">
            {/* Desktop Search/Filter Column */}
            <div className="hidden md:block md:w-80 border-r border-border bg-card/50">
              <div className="sticky top-0 h-screen overflow-y-auto">
                {searchFilter}
              </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="p-4 md:p-6 pb-20 lg:pb-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {showMobileNav && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
          {mobileNav}
        </div>
      )}
    </div>
  )
} 