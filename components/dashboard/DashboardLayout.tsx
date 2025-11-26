"use client"

import { ReactNode, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { DynamicLogo } from "@/app/school/[subdomain]/parent/components/DynamicLogo"

interface DashboardLayoutProps {
  sidebar?: ReactNode
  searchFilter?: ReactNode
  children: ReactNode
  showMobileNav?: boolean
  mobileNav?: ReactNode
  subdomain?: string
}

export function DashboardLayout({ 
  sidebar, 
  searchFilter, 
  children, 
  showMobileNav = true,
  mobileNav,
  subdomain: subdomainProp
}: DashboardLayoutProps) {
  const params = useParams()
  // Get subdomain from URL params first, then fall back to prop, then 'admin'
  const subdomain = typeof params.subdomain === 'string' 
    ? params.subdomain 
    : Array.isArray(params.subdomain) 
      ? params.subdomain[0] 
      : subdomainProp || 'admin'
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [isFilterMinimized, setIsFilterMinimized] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          {sidebar && (
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                {sidebar}
              </SheetContent>
            </Sheet>
          )}
          
          <div className="flex items-center justify-center flex-1 min-w-0">
            <DynamicLogo subdomain={subdomain} size="sm" showText={true} />
          </div>
          
          {searchFilter && (
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 md:hidden shrink-0">
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
          )}
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        {sidebar && (
          <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-40">
            <div className="flex flex-col flex-grow border-r border-border bg-card overflow-y-auto">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Main content area */}
        <div className={`flex-1 ${sidebar ? 'lg:pl-64' : ''}`}>
          <div className="flex">
            {/* Desktop Search/Filter Column */}
            {searchFilter && (
              <div className={`hidden md:block border-r border-border bg-card/50 transition-all duration-300 ease-in-out ${
                isFilterMinimized ? 'md:w-16' : (sidebar ? 'md:w-80' : 'md:w-96')
              }`}>
                <div className="sticky top-0 h-screen overflow-y-auto relative">
                  {/* Toggle button for minimize/expand */}
                  <div className={`p-2 ${isFilterMinimized ? 'flex justify-center' : 'flex justify-end'}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFilterMinimized(!isFilterMinimized)}
                      className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-200"
                      title={isFilterMinimized ? "Expand sidebar" : "Minimize sidebar"}
                    >
                      {isFilterMinimized ? (
                        <PanelLeftOpen className="h-4 w-4" />
                      ) : (
                        <PanelLeftClose className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {!isFilterMinimized && (
                    <div className="px-2">
                      {searchFilter}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main Content */}
            <main className="flex-1 min-w-0 relative">
              {/* Floating toggle button when filter is minimized */}
              {searchFilter && isFilterMinimized && (
                <div className="absolute top-6 left-6 z-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFilterMinimized(false)}
                    className="border-slate-200 bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all duration-200"
                    title="Expand sidebar"
                  >
                    <PanelLeftOpen className="h-4 w-4" />
                  </Button>
                </div>
              )}
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