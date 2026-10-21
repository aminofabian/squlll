"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  ClipboardList,
  BookMarked,
  MessageSquare,
  FileText,
  ClipboardCheck,
  Layers,
  User,
  LogOut,
} from "lucide-react"
import { DynamicLogo } from '../../app/school/[subdomain]/parent/components/DynamicLogo';
import { useSignout } from "@/lib/hooks/useSignout";
import { useChatUnreadTotal } from "@/lib/chat/ChatProvider";
import { useTeacherExamAssignments } from "@/lib/hooks/useTeacherExamAssignments";

interface SidebarProps {
  className?: string
  logoInstance?: string
}

const navigation = [
  { title: "Home", href: "/teacher", icon: LayoutDashboard },
  { title: "Timetable", href: "/teacher/timetable", icon: CalendarDays },
  { title: "Assignments", href: "/teacher/assignments", icon: BookOpen },
  { title: "Exams", href: "/teacher/exams", icon: FileText },
  { title: "Attendance", href: "/teacher/attendance", icon: ClipboardList },
  { title: "Lesson Plans", href: "/teacher/lesson-plans", icon: BookMarked },
  { title: "Schemes of Work", href: "/teacher/schemes-of-work", icon: Layers },
  { title: "Messages", href: "/teacher/messages", icon: MessageSquare },
]

export function Sidebar({ className, logoInstance }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const subdomain = typeof params.subdomain === 'string' ? params.subdomain : Array.isArray(params.subdomain) ? params.subdomain[0] : '';
  const { signOut, isSigningOut } = useSignout();
  const unreadTotal = useChatUnreadTotal();
  const { data: assignments } = useTeacherExamAssignments();
  const isHod = assignments && assignments.hodSubjectIds.length > 0;

  const navItems = React.useMemo(() => {
    const items = [...navigation];
    if (isHod) {
      const examsIndex = items.findIndex((item) => item.href === "/teacher/exams");
      items.splice(examsIndex + 1, 0, {
        title: "HOD Review",
        href: "/teacher/exams/review",
        icon: ClipboardCheck,
      });
    }
    return items;
  }, [isHod]);

  return (
    <div className={cn("flex h-full flex-col bg-card", className)}>
      <div className="px-6 pb-5 pt-7">
        <DynamicLogo
          subdomain={subdomain}
          size="md"
          showText={true}
          logoInstance={logoInstance}
        />
        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
          Teacher workspace
        </p>
      </div>

      <nav className="tp-scroll flex-1 overflow-y-auto px-3 pb-4" aria-label="Teacher sections">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/teacher" && pathname.startsWith(item.href));
            const badgeCount =
              item.href === '/teacher/messages' && unreadTotal > 0
                ? unreadTotal > 99
                  ? '99+'
                  : String(unreadTotal)
                : undefined;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "tp-focus group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-colors",
                    isActive
                      ? "bg-primary/[0.07] font-semibold text-primary"
                      : "font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {isActive ? (
                    <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-primary" />
                  ) : null}
                  <Icon
                    className={cn(
                      "size-[17px] shrink-0 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground/75 group-hover:text-foreground/80",
                    )}
                    strokeWidth={1.7}
                  />
                  <span className="truncate">{item.title}</span>
                  {badgeCount ? (
                    <span className="tp-num ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {badgeCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border/70 p-3">
        <Link
          href="/teacher/profile"
          className="tp-focus group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <User className="size-[17px] text-muted-foreground/75 group-hover:text-foreground/80" strokeWidth={1.7} />
          Profile
        </Link>
        <button
          type="button"
          onClick={signOut}
          disabled={isSigningOut}
          className="tp-focus group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-rose-50/70 hover:text-rose-700 disabled:opacity-60 dark:hover:bg-rose-950/20 dark:hover:text-rose-300"
        >
          <LogOut className="size-[17px] text-muted-foreground/75 group-hover:text-current" strokeWidth={1.7} />
          {isSigningOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}
