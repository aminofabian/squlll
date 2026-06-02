"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSignout } from "@/lib/hooks/useSignout";
import { GeneratedSchoolLogo } from "@/components/school/GeneratedSchoolLogo";
import {
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  MoreHorizontal,
} from "lucide-react";
import {
  SCHOOL_PRIMARY_NAV,
  SCHOOL_RAIL_GROUPS,
  SCHOOL_SECONDARY_NAV,
  isSchoolNavActive,
  type SchoolNavItem,
} from "@/lib/school/schoolNavConfig";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SchoolSidebarProps {
  className?: string;
  subdomain: string;
  schoolName: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

function formatSchoolName(name: string): string {
  return name
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export const SCHOOL_RAIL_WIDTH = 68;
export const SCHOOL_PANEL_WIDTH = 240;
export const SCHOOL_SIDEBAR_WIDTH = SCHOOL_RAIL_WIDTH + SCHOOL_PANEL_WIDTH;
export const SCHOOL_SIDEBAR_MIN_WIDTH = SCHOOL_RAIL_WIDTH;

function RailItem({
  item,
  pathname,
  getHref,
}: {
  item: SchoolNavItem;
  pathname: string;
  getHref: (href: string) => string;
}) {
  const Icon = item.icon;
  const href = getHref(item.href);
  const active = isSchoolNavActive(pathname, href);
  const label = item.shortLabel ?? item.title;

  return (
    <Link
      href={href}
      title={item.title}
      className={cn(
        "flex w-full flex-col items-center gap-0.5 px-1 py-1.5 transition-colors",
        active ? "text-[#0073ea]" : "text-slate-600 hover:text-slate-800 dark:text-slate-400",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          active && "bg-[#dcebfd] dark:bg-primary/20",
        )}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <span className="max-w-[60px] truncate text-center text-[10px] font-medium leading-tight">
        {label}
      </span>
    </Link>
  );
}

function PanelLink({
  item,
  pathname,
  getHref,
}: {
  item: SchoolNavItem;
  pathname: string;
  getHref: (href: string) => string;
}) {
  const Icon = item.icon;
  const href = getHref(item.href);
  const active = isSchoolNavActive(pathname, href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-[#dcebfd] font-medium text-[#0073ea] dark:bg-primary/20 dark:text-primary"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span className="truncate">{item.title}</span>
    </Link>
  );
}

export function SchoolSidebar({
  className,
  subdomain,
  schoolName,
  isMinimized = true,
  onToggleMinimize,
}: SchoolSidebarProps) {
  const pathname = usePathname();
  const { signOut, isSigningOut } = useSignout();
  const [moreOpen, setMoreOpen] = React.useState(false);

  const getHref = (href: string) => href.replace("[subdomain]", subdomain);
  const displayName = formatSchoolName(schoolName);

  const isMoreActive = SCHOOL_SECONDARY_NAV.some((item) =>
    isSchoolNavActive(pathname, item.href),
  );

  return (
    <div className={cn("flex h-full", className)}>
      {/* Icon rail — always visible */}
      <div className="flex w-[68px] shrink-0 flex-col bg-[#f5f6f8] py-3 dark:bg-slate-900">
        {/* Logo */}
        <Link
          href={getHref("/dashboard")}
          className="mb-3 flex justify-center px-2"
          title={displayName}
        >
          <GeneratedSchoolLogo schoolKey={schoolName} className="h-8 w-8" />
        </Link>

        {/* Expand / collapse panel */}
        {onToggleMinimize && (
          <div className="mb-2 flex justify-center px-2">
            <button
              type="button"
              onClick={onToggleMinimize}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200/80 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
              title={isMinimized ? "Expand menu" : "Collapse menu"}
            >
              {isMinimized ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <ChevronsLeft className="h-4 w-4" />
              )}
            </button>
          </div>
        )}

        {/* Nav groups */}
        <nav className="flex flex-1 flex-col overflow-y-auto">
          {SCHOOL_RAIL_GROUPS.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {groupIndex > 0 && (
                <div className="mx-3 my-1.5 border-t border-slate-200/90 dark:border-slate-700" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <RailItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    getHref={getHref}
                  />
                ))}
              </div>
            </React.Fragment>
          ))}

          {/* More */}
          <div className="mx-3 my-1.5 border-t border-slate-200/90 dark:border-slate-700" />
          <Popover open={moreOpen} onOpenChange={setMoreOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex w-full flex-col items-center gap-0.5 px-1 py-1.5 transition-colors",
                  isMoreActive || moreOpen
                    ? "text-[#0073ea]"
                    : "text-slate-600 hover:text-slate-800 dark:text-slate-400",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    (isMoreActive || moreOpen) && "bg-[#dcebfd] dark:bg-primary/20",
                  )}
                >
                  <MoreHorizontal className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
                <span className="text-[10px] font-medium leading-tight">More</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="start"
              sideOffset={8}
              className="w-56 p-1.5"
            >
              <p className="px-2 py-1.5 text-xs font-semibold text-slate-400">
                More pages
              </p>
              {SCHOOL_SECONDARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={getHref(item.href)}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    isSchoolNavActive(pathname, item.href)
                      ? "bg-[#dcebfd] font-medium text-[#0073ea]"
                      : "text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {item.title}
                </Link>
              ))}
            </PopoverContent>
          </Popover>
        </nav>

        {/* Sign out at bottom of rail */}
        <div className="mt-auto px-2 pt-2">
          <button
            type="button"
            onClick={signOut}
            disabled={isSigningOut}
            title="Sign out"
            className="flex w-full flex-col items-center gap-0.5 py-1.5 text-slate-500 transition-colors hover:text-red-500 disabled:opacity-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg">
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
            <span className="text-[10px] font-medium leading-tight">
              {isSigningOut ? "…" : "Logout"}
            </span>
          </button>
        </div>
      </div>

      {/* Expanded panel — full labels */}
      {!isMinimized && (
        <div className="flex w-[240px] shrink-0 flex-col border-r border-slate-200/60 bg-[#f5f6f8] dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200/60 px-4 py-4 dark:border-slate-800">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {displayName}
            </p>
            <p className="text-xs text-slate-500">Navigation</p>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
            {SCHOOL_PRIMARY_NAV.map((item) => (
              <PanelLink
                key={item.href}
                item={item}
                pathname={pathname}
                getHref={getHref}
              />
            ))}

            <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              More
            </p>
            {SCHOOL_SECONDARY_NAV.map((item) => (
              <PanelLink
                key={item.href}
                item={item}
                pathname={pathname}
                getHref={getHref}
              />
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
