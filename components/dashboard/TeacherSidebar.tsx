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
  LogOut
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
    href: "/teacher",
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
            (item.href !== "/teacher/dashboard" && pathname.startsWith(item.href))
          
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
          <Link href="/teacher/profile">
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
          <Link href="/teacher/settings">
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
            className="w-full justify-start h-11 text-sm relative overflow-hidden group transition-all duration-300 hover:bg-red-50/50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/10 disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted group-hover:bg-red-100/30 transition-colors">
                <LogOut className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-red-500" />
              </div>
              <span className="font-medium group-hover:text-red-600">
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </span>
            </div>
          </Button>
        </motion.div>
      </div>
    </div>
  )
} 