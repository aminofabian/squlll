'use client'

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"

type HeaderProps = {
  variant?: "default" | "hero"
}

const HERO_NAV = [
  { label: "Students", href: "/students" },
  { label: "Academics", href: "/academics" },
  { label: "Fees", href: "/register" },
  { label: "Staff", href: "/staff" },
] as const

const DEFAULT_NAV = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Students", href: "/students" },
  { label: "Academics", href: "/academics" },
  { label: "Staff", href: "/staff" },
] as const

export function Header({ variant = "default" }: HeaderProps) {
  const isHero = variant === "hero"
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = isHero ? HERO_NAV : DEFAULT_NAV

  const navLinkClass = isHero
    ? "h-10 px-4 text-sm font-medium text-white/95 hover:text-white hover:bg-white/15"
    : "h-10 px-4 font-sans text-sm font-medium tracking-wide uppercase hover:bg-primary/10 dark:hover:bg-primary/20"

  const mobileLinkClass = isHero
    ? "h-11 w-full justify-start px-4 text-sm font-medium text-white/95 hover:bg-white/10 hover:text-white"
    : "h-11 w-full justify-start px-4 font-sans text-sm font-medium tracking-wide uppercase hover:bg-primary/10 dark:hover:bg-primary/20"

  return (
    <header
      className={
        isHero
          ? "fixed top-0 left-0 right-0 z-50 border-b border-white/15 bg-[#0a1f1a]/75 backdrop-blur-md"
          : "border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
      }
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1d5547] bg-gradient-to-b from-[#246a59] to-[#1a4c40]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 3.727 1.51a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-7-3z" />
                <path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <div className="font-display text-lg font-normal tracking-wide">
              <span className={isHero ? "text-white" : "text-[#246a59] dark:text-[#2d8570]"}>SQ</span>
              <span className={isHero ? "text-white" : "text-[#246a59]"}>UL</span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" className={navLinkClass}>
                  {item.label}
                </Button>
              </Link>
            ))}
            {!isHero && (
              <>
                <div className="mx-2 h-6 w-px bg-slate-300 dark:bg-slate-600" />
                <Link href="/settings">
                  <Button variant="ghost" className={navLinkClass}>
                    Settings
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!isHero && (
              <div className="hidden items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-1 dark:border-emerald-800 dark:bg-emerald-950 sm:flex">
                <div className="h-2 w-2 bg-emerald-500" />
                <span className="font-sans text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  ONLINE
                </span>
              </div>
            )}

            {isHero ? (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button
                    variant="outline"
                    className="h-9 border-white/50 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/register" className="hidden sm:block">
                  <Button
                    variant="outline"
                    className="h-9 border-white/50 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                  >
                    Get started
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button size="sm" className="h-9 border-2 px-4 font-sans text-xs uppercase tracking-wide">
                  Try it for Free
                </Button>
              </Link>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-9 w-9 p-0 md:hidden ${isHero ? "text-white" : ""}`}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <div className="flex h-3 w-4 flex-col justify-between" aria-hidden>
                  <div className="h-0.5 w-full bg-current" />
                  <div className="h-0.5 w-full bg-current" />
                  <div className="h-0.5 w-full bg-current" />
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile navigation — toggled, not always visible */}
        {mobileOpen && (
          <nav
            id="mobile-nav"
            className={`border-t py-3 md:hidden ${isHero ? "border-white/10" : "border-slate-200 dark:border-slate-700"}`}
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className={mobileLinkClass}>
                    {item.label}
                  </Button>
                </Link>
              ))}
              {!isHero && (
                <Link href="/settings" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className={mobileLinkClass}>
                    Settings
                  </Button>
                </Link>
              )}
              {isHero && (
                <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3 sm:hidden">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="outline"
                      className="h-10 w-full border-white/50 bg-white/10 text-sm font-semibold text-white hover:bg-white/20 hover:text-white"
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="h-10 w-full bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-400">
                      Get started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
