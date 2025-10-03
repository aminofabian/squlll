"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Settings,
  LogOut
} from "lucide-react"
import { useSignout } from "@/lib/hooks/useSignout"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { signOut, isSigningOut } = useSignout()

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-slate-900 shadow-xl",
      className
    )}>
      {/* Header */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700 shadow-sm">
        {/* Header content removed */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Navigation items removed */}
      </nav>

      {/* Footer */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 space-y-2 shadow-sm">
        <Link href="/dashboard/settings">
          <Button 
            variant="ghost" 
            className="w-full justify-start h-11 font-mono text-sm tracking-wide uppercase hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-sm"
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          onClick={signOut}
          disabled={isSigningOut}
          className="w-full justify-start h-11 font-mono text-sm tracking-wide uppercase text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 shadow-sm disabled:opacity-50"
        >
          <LogOut className="mr-3 h-4 w-4" />
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </Button>
      </div>
    </div>
  )
} 