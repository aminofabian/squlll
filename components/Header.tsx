import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-b from-[#246a59] to-[#1a4c40] border border-[#1d5547] flex items-center justify-center rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 3.727 1.51a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-7-3z" />
                <path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <div className="font-mono font-bold text-lg tracking-wide">
              <span className="text-[#246a59] dark:text-[#2d8570]">SQ</span>
              <span className="text-[#246a59]">UL</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard">
              <Button 
                variant="ghost" 
                className="h-10 px-4 font-mono text-sm tracking-wide uppercase hover:bg-primary/10 dark:hover:bg-primary/20"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/students">
              <Button 
                variant="ghost" 
                className="h-10 px-4 font-mono text-sm tracking-wide uppercase hover:bg-primary/10 dark:hover:bg-primary/20"
              >
                Students
              </Button>
            </Link>
            <Link href="/academics">
              <Button 
                variant="ghost" 
                className="h-10 px-4 font-mono text-sm tracking-wide uppercase hover:bg-primary/10 dark:hover:bg-primary/20"
              >
                Academics
              </Button>
            </Link>
            <Link href="/staff">
              <Button 
                variant="ghost" 
                className="h-10 px-4 font-mono text-sm tracking-wide uppercase hover:bg-primary/10 dark:hover:bg-primary/20"
              >
                Staff
              </Button>
            </Link>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2"></div>
            <Link href="/settings">
              <Button 
                variant="ghost" 
                className="h-10 px-4 font-mono text-sm tracking-wide uppercase hover:bg-primary/10 dark:hover:bg-primary/20"
              >
                Settings
              </Button>
            </Link>
          </nav>

          {/* Admin Actions */}
          <div className="flex items-center gap-3">
            {/* System Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
              <div className="w-2 h-2 bg-emerald-500"></div>
              <span className="text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                ONLINE
              </span>
            </div>

            {/* Auth Buttons */}
            <Link href="/login">
              <Button 
                size="sm" 
                className="h-9 px-4 border-2 font-mono text-xs tracking-wide uppercase"
              >
                Try it for Free
              </Button>
            </Link>
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden h-9 w-9 p-0 border-0"
            >
              <div className="w-4 h-3 flex flex-col justify-between">
                <div className="w-full h-0.5 bg-current"></div>
                <div className="w-full h-0.5 bg-current"></div>
                <div className="w-full h-0.5 bg-current"></div>
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 py-4">
          <nav className="flex flex-col gap-2">
            <Link href="/dashboard">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-10 px-4 font-mono text-sm tracking-wide uppercase hover:bg-primary/10 dark:hover:bg-primary/20"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/students">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-10 px-4 font-mono text-sm tracking-wide uppercase hover:bg-primary/10 dark:hover:bg-primary/20"
              >
                Students
              </Button>
            </Link>
            <Link href="/academics">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-10 px-4 font-mono text-sm tracking-wide uppercase hover:bg-primary/10 dark:hover:bg-primary/20"
              >
                Academics
              </Button>
            </Link>
            <Link href="/staff">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-10 px-4 font-mono text-sm tracking-wide uppercase hover:bg-primary/10 dark:hover:bg-primary/20"
              >
                Staff
              </Button>
            </Link>
            <Link href="/settings">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-10 px-4 font-mono text-sm tracking-wide uppercase hover:bg-primary/10 dark:hover:bg-primary/20"
              >
                Settings
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
} 