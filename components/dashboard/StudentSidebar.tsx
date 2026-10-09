"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { LogOut, Settings, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { DynamicLogo } from "../../app/school/[subdomain]/parent/components/DynamicLogo"
import { useSignout } from "@/lib/hooks/useSignout"
import {
  isStudentNavActive,
  STUDENT_SIDEBAR_ITEMS,
} from "@/lib/student/studentNavConfig"

interface SidebarProps {
  className?: string
}

function NavRow({
  href,
  icon: Icon,
  label,
  active,
  onClick,
  disabled,
  danger,
}: {
  href?: string
  icon: LucideIcon
  label: string
  active?: boolean
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
}) {
  const inner = (
    <>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          active
            ? "bg-primary text-white"
            : danger
              ? "bg-muted text-muted-foreground group-hover:bg-red-100 group-hover:text-red-600 dark:group-hover:bg-red-950/50"
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span
        className={cn(
          "truncate text-sm font-medium",
          active
            ? "text-primary"
            : danger
              ? "text-foreground group-hover:text-red-600"
              : "text-foreground",
        )}
      >
        {label}
      </span>
    </>
  )

  const classes = cn(
    "group flex w-full items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors",
    active ? "bg-primary/10" : "hover:bg-muted/60",
    disabled && "pointer-events-none opacity-50",
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {inner}
    </button>
  )
}

export function StudentSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const params = useParams()
  const subdomain =
    typeof params.subdomain === "string"
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ""
  const { signOut, isSigningOut } = useSignout()

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r border-border bg-card",
        className,
      )}
    >
      {/* Brand */}
      <div className="flex items-center justify-center border-b border-border px-5 py-5">
        <DynamicLogo subdomain={subdomain} size="md" showText={true} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {STUDENT_SIDEBAR_ITEMS.map((item) => (
          <NavRow
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.title}
            active={isStudentNavActive(pathname, item.href)}
          />
        ))}
      </nav>

      {/* Account */}
      <div className="space-y-0.5 border-t border-border p-3">
        <NavRow href="/student/profile" icon={User} label="Profile" />
        <NavRow href="/student/settings" icon={Settings} label="Settings" />
        <NavRow
          icon={LogOut}
          label={isSigningOut ? "Signing out…" : "Logout"}
          danger
          disabled={isSigningOut}
          onClick={signOut}
        />
      </div>
    </div>
  )
}
