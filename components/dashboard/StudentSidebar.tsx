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
  const classes = cn(
    "tp-focus group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] transition-colors",
    active
      ? "bg-primary/[0.07] font-semibold text-primary"
      : danger
        ? "font-medium text-muted-foreground hover:bg-rose-50/70 hover:text-rose-700 dark:hover:bg-rose-950/20 dark:hover:text-rose-300"
        : "font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground",
    disabled && "pointer-events-none opacity-50",
  )

  const inner = (
    <>
      {active ? (
        <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-primary" />
      ) : null}
      <Icon
        className={cn(
          "size-[17px] shrink-0 transition-colors",
          active
            ? "text-primary"
            : danger
              ? "text-muted-foreground/75 group-hover:text-current"
              : "text-muted-foreground/75 group-hover:text-foreground/80",
        )}
        strokeWidth={1.7}
      />
      <span className="truncate">{label}</span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={classes} aria-current={active ? "page" : undefined}>
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
    <div className={cn("flex h-full flex-col bg-card", className)}>
      <div className="px-6 pb-5 pt-7">
        <DynamicLogo subdomain={subdomain} size="md" showText={true} />
        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
          Student workspace
        </p>
      </div>

      <nav
        className="tp-scroll flex-1 space-y-0.5 overflow-y-auto px-3 pb-4"
        aria-label="Student sections"
      >
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

      <div className="space-y-0.5 border-t border-border/70 p-3">
        <NavRow href="/student/profile" icon={User} label="Profile" />
        <NavRow href="/student/settings" icon={Settings} label="Settings" />
        <NavRow
          icon={LogOut}
          label={isSigningOut ? "Signing out…" : "Sign out"}
          danger
          disabled={isSigningOut}
          onClick={signOut}
        />
      </div>
    </div>
  )
}
