"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
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
  LogOut,
  FileText,
  BarChart3,
  Download,
  UserCheck,
  TrendingUp,
  CalendarCheck,
  Phone,
  Printer
} from "lucide-react"
import { DynamicLogo } from '../../app/school/[subdomain]/parent/components/DynamicLogo';
import { useParams } from 'next/navigation';
import { useSignout } from "@/lib/hooks/useSignout";

interface SidebarProps {
  className?: string
}

const navigation = [
  {
    title: "Dashboard",
    href: "/student",
    icon: LayoutDashboard,
  },
  {
    title: "Timetable",
    href: "/student/timetable",
    icon: CalendarDays,
  },
  {
    title: "Assignments",
    href: "/student/assignments",
    icon: BookOpen,
  },
  {
    title: "Exam Results",
    href: "/student/exam-results",
    icon: BarChart3,
  },
  {
    title: "Notes",
    href: "/student/notes",
    icon: FileText,
  },
  {
    title: "Attendance",
    href: "/student/attendance",
    icon: UserCheck,
  },
  {
    title: "Performance",
    href: "/student/performance",
    icon: TrendingUp,
  },
  {
    title: "Upcoming Tests",
    href: "/student/upcoming-tests",
    icon: CalendarCheck,
  },
  {
    title: "Contact Teachers",
    href: "/student/contact-teachers",
    icon: Phone,
  },
  {
    title: "Report Cards",
    href: "/student/report-cards",
    icon: Printer,
  },
  {
    title: "Messages",
    href: "/student/messages",
    icon: MessageSquare,
    count: "3"
  },
]

export function StudentSidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const subdomain = typeof params.subdomain === 'string' ? params.subdomain : Array.isArray(params.subdomain) ? params.subdomain[0] : '';
  const { signOut, isSigningOut } = useSignout();

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-slate-900 shadow-xl",
      className
    )}>
      {/* Header */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700 shadow-sm flex flex-col items-center">
        <DynamicLogo subdomain={subdomain} size="md" showText={true} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
        {navigation.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== "/student/dashboard" && pathname.startsWith(item.href))
          
          return (
            <motion.div 
              key={item.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href={item.href}>
                <Button
                  variant={isActive ? "default" : "outline"}
                  className={cn(
                    "w-full justify-start h-11 text-sm relative overflow-hidden group transition-all duration-300",
                    isActive 
                      ? "bg-primary text-white hover:text-white shadow-sm" 
                      : "hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "flex items-center justify-center h-6 w-6 rounded-full transition-colors",
                      isActive 
                        ? "bg-white/20" 
                        : "bg-muted group-hover:bg-primary/10"
                    )}>
                      <Icon className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        isActive 
                          ? "text-white" 
                          : "text-muted-foreground group-hover:text-primary"
                      )} />
                    </div>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  
                  {item.count && (
                    <Badge 
                      variant={isActive ? "outline" : "secondary"}
                      className={cn(
                        "ml-auto text-[10px] h-5 px-1.5 transition-all duration-300",
                        isActive
                          ? "border-white/40 text-white bg-white/10 hover:bg-white/20"
                          : "border-dashed hover:border-primary/50"
                      )}
                    >
                      {item.count}
                    </Badge>
                  )}
                  
                  {isActive && (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-0 left-0 h-0.5 bg-primary/30" 
                    />
                  )}
                </Button>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 space-y-3 shadow-sm">
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Link href="/student/profile">
            <Button 
              variant="outline" 
              className="w-full justify-start h-11 text-sm relative overflow-hidden group transition-all duration-300 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                  <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="font-medium">Profile</span>
              </div>
            </Button>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          <Link href="/student/settings">
            <Button 
              variant="outline" 
              className="w-full justify-start h-11 text-sm relative overflow-hidden group transition-all duration-300 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                  <Settings className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="font-medium">Settings</span>
              </div>
            </Button>
          </Link>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <Button 
            variant="outline" 
            onClick={signOut}
            disabled={isSigningOut}
            className="w-full justify-start h-11 text-sm relative overflow-hidden group transition-all duration-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted group-hover:bg-red-100 transition-colors">
                <LogOut className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-red-600" />
              </div>
              <span className="font-medium">
                {isSigningOut ? 'Signing Out...' : 'Logout'}
              </span>
            </div>
          </Button>
        </motion.div>
      </div>
    </div>
  )
} 