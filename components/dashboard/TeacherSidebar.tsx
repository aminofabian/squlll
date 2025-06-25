"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookOpen, 
  GraduationCap,
  ClipboardList,
  BookMarked,
  MessageSquare,
  User,
  Settings,
  LogOut
} from "lucide-react"

interface SidebarProps {
  className?: string
}

const navigation = [
  {
    title: "Dashboard",
    href: "/teacher/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Timetable",
    href: "/teacher/timetable",
    icon: CalendarDays,
  },
  {
    title: "Assignments",
    href: "/teacher/assignments",
    icon: BookOpen,
  },
  {
    title: "Assessments",
    href: "/teacher/assessments",
    icon: GraduationCap,
  },
  {
    title: "Attendance",
    href: "/teacher/attendance",
    icon: ClipboardList,
  },
  {
    title: "Lesson Plans",
    href: "/teacher/lesson-plans",
    icon: BookMarked,
  },
  {
    title: "Messages",
    href: "/teacher/messages",
    icon: MessageSquare,
    count: "5"
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-slate-900 shadow-xl",
      className
    )}>
      {/* Header */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700 shadow-sm">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-9 h-9 bg-gradient-to-br from-[#246a59] to-[#1a4d41] dark:from-[#246a59] dark:to-[#153d34] rounded-lg shadow-lg flex items-center justify-center transform transition-all duration-200 ease-out group-hover:scale-105 group-hover:shadow-xl group-hover:rotate-3">
            <div className="text-white font-mono font-bold text-base tracking-wider">SQ</div>
          </div>
          <div className="font-mono font-bold text-xl tracking-wider transform transition-all duration-200 ease-out group-hover:translate-x-1">
            <span className="text-slate-900 dark:text-slate-100">SQ</span>
            <span className="bg-gradient-to-r from-[#246a59] to-[#1a4d41] dark:from-[#246a59] dark:to-[#153d34] text-transparent bg-clip-text">UL</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== "/teacher/dashboard" && pathname.startsWith(item.href))
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 font-mono text-sm tracking-wide uppercase relative overflow-hidden group",
                  isActive 
                    ? "bg-slate-100 dark:bg-slate-800 shadow-sm text-slate-900 dark:text-slate-100" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                )}
              >
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 transition-colors",
                  isActive ? "bg-[#246a59]" : "bg-transparent group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                )} />
                <Icon className="mr-3 h-4 w-4" />
                <span className="flex-1 text-left">{item.title}</span>
                {item.count && (
                  <div className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-mono shadow-sm">
                    {item.count}
                  </div>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 space-y-2 shadow-sm">
        <Link href="/teacher/profile">
          <Button 
            variant="ghost" 
            className="w-full justify-start h-11 font-mono text-sm tracking-wide uppercase hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-sm"
          >
            <User className="mr-3 h-4 w-4" />
            Profile
          </Button>
        </Link>
        <Link href="/teacher/settings">
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
          className="w-full justify-start h-11 font-mono text-sm tracking-wide uppercase text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 shadow-sm"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
} 