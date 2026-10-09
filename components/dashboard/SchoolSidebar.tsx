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
        "group relative flex w-full flex-col items-center gap-0.5 px-1 py-1.5 transition-colors",
        active
          ? "text-[#246a59]"
          : "text-[#1a4d42]/55 hover:text-[#0a1f1a] dark:text-white/45 dark:hover:text-white",
      )}
    >
      {active ? (
        <span
          className="absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 bg-[#246a59]"
          aria-hidden
        />
      ) : null}
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center border transition-colors",
          active
            ? "border-[#246a59]/30 bg-[#246a59]/10 dark:bg-[#246a59]/20"
            : "border-transparent group-hover:border-[#1a4d42]/12 group-hover:bg-white dark:group-hover:bg-white/5",
        )}
      >
        <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
      </span>
      <span className="max-w-[58px] truncate text-center text-[9px] font-semibold uppercase tracking-[0.04em] leading-tight">
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
        "relative flex items-center gap-2.5 border border-transparent px-3 py-2 text-sm transition-colors",
        active
          ? "border-[#246a59]/20 bg-[#246a59]/10 font-medium text-[#0a1f1a] dark:bg-[#246a59]/15 dark:text-white"
          : "text-[#1a4d42]/70 hover:border-[#1a4d42]/10 hover:bg-white dark:text-white/55 dark:hover:bg-white/5",
      )}
    >
      {active ? (
        <span
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#246a59]"
          aria-hidden
        />
      ) : null}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active ? "text-[#246a59]" : "text-[#1a4d42]/45",
        )}
        strokeWidth={1.75}
      />
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
      {/* Icon rail */}
      <div className="flex w-[68px] shrink-0 flex-col border-r border-[#1a4d42]/12 bg-[#f3f7f5] py-2.5 dark:border-white/10 dark:bg-[#071411]">
        <Link
          href={getHref("/dashboard")}
          className="mb-2 flex justify-center px-2"
          title={displayName}
        >
          <div className="border border-[#1a4d42]/15 bg-white p-0.5 dark:border-white/15 dark:bg-[#0c1a17]">
            <GeneratedSchoolLogo schoolKey={schoolName} className="h-7 w-7" />
          </div>
        </Link>

        {onToggleMinimize && (
          <div className="mb-2 flex justify-center px-2">
            <button
              type="button"
              onClick={onToggleMinimize}
              className="flex h-7 w-7 items-center justify-center border border-[#1a4d42]/15 bg-white text-[#1a4d42]/50 transition-colors hover:border-[#246a59]/40 hover:bg-[#246a59]/10 hover:text-[#246a59] dark:border-white/15 dark:bg-[#0c1a17]"
              title={isMinimized ? "Expand menu" : "Collapse menu"}
            >
              {isMinimized ? (
                <ChevronsRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronsLeft className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}

        <nav className="flex flex-1 flex-col overflow-y-auto">
          {SCHOOL_RAIL_GROUPS.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {groupIndex > 0 && (
                <div className="mx-3 my-1 border-t border-[#1a4d42]/12 dark:border-white/10" />
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

          <div className="mx-3 my-1 border-t border-[#1a4d42]/12 dark:border-white/10" />
          <Popover open={moreOpen} onOpenChange={setMoreOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "group relative flex w-full flex-col items-center gap-0.5 px-1 py-1.5 transition-colors",
                  isMoreActive || moreOpen
                    ? "text-[#246a59]"
                    : "text-[#1a4d42]/55 hover:text-[#0a1f1a] dark:text-white/45",
                )}
              >
                {(isMoreActive || moreOpen) && (
                  <span
                    className="absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 bg-[#246a59]"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center border transition-colors",
                    isMoreActive || moreOpen
                      ? "border-[#246a59]/30 bg-[#246a59]/10"
                      : "border-transparent group-hover:border-[#1a4d42]/12 group-hover:bg-white dark:group-hover:bg-white/5",
                  )}
                >
                  <MoreHorizontal className="h-[17px] w-[17px]" strokeWidth={1.75} />
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.04em] leading-tight">
                  More
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="start"
              sideOffset={6}
              className="w-52 rounded-none border border-[#1a4d42]/15 bg-white p-0 shadow-[6px_6px_0_0_rgba(10,31,26,0.1)] dark:border-white/10 dark:bg-[#0c1a17]"
            >
              <div className="border-b border-[#1a4d42]/10 bg-[#0a1f1a] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/80">
                  More pages
                </p>
              </div>
              <div className="max-h-[min(22rem,70vh)] overflow-y-auto p-1">
                {(
                  [
                    {
                      label: "People",
                      hrefs: ["/parents", "/staff"],
                    },
                    {
                      label: "Academic",
                      hrefs: [
                        "/attendances",
                        "/grading",
                        "/curriculum",
                        "/school-years",
                      ],
                    },
                    {
                      label: "Insights",
                      hrefs: ["/reports", "/analytics"],
                    },
                    {
                      label: "Admissions",
                      hrefs: [
                        "/admissions/applications",
                        "/enrollment",
                        "/communication",
                      ],
                    },
                  ] as const
                ).map((section, sectionIndex) => {
                  const items = section.hrefs
                    .map((href) =>
                      SCHOOL_SECONDARY_NAV.find((item) => item.href === href),
                    )
                    .filter(Boolean) as typeof SCHOOL_SECONDARY_NAV;

                  if (items.length === 0) return null;

                  return (
                    <div key={section.label}>
                      {sectionIndex > 0 ? (
                        <div className="mx-1.5 my-1 border-t border-[#1a4d42]/10 dark:border-white/10" />
                      ) : null}
                      <p className="px-2 pt-1.5 pb-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/40">
                        {section.label}
                      </p>
                      {items.map((item) => {
                        const active = isSchoolNavActive(pathname, item.href);
                        return (
                          <Link
                            key={item.href}
                            href={getHref(item.href)}
                            onClick={() => setMoreOpen(false)}
                            className={cn(
                              "relative flex items-center gap-2 px-2 py-1.5 text-[12px] transition-colors",
                              active
                                ? "bg-[#246a59]/10 font-medium text-[#0a1f1a] dark:text-white"
                                : "text-[#1a4d42]/70 hover:bg-[#f3f7f5] dark:text-white/60 dark:hover:bg-white/5",
                            )}
                          >
                            {active ? (
                              <span
                                className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#246a59]"
                                aria-hidden
                              />
                            ) : null}
                            <span
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center border",
                                active
                                  ? "border-[#246a59]/30 bg-[#246a59]/10 text-[#246a59]"
                                  : "border-[#1a4d42]/10 bg-[#f8fbfa] text-[#1a4d42]/45 dark:border-white/10 dark:bg-[#071411]",
                              )}
                            >
                              <item.icon className="h-3 w-3" strokeWidth={2} />
                            </span>
                            <span className="truncate">{item.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </nav>

        <div className="mt-auto border-t border-[#1a4d42]/12 px-2 pt-2 dark:border-white/10">
          <button
            type="button"
            onClick={signOut}
            disabled={isSigningOut}
            title="Sign out"
            className="group flex w-full flex-col items-center gap-0.5 py-1.5 text-[#1a4d42]/45 transition-colors hover:text-red-600 disabled:opacity-50"
          >
            <span className="flex h-8 w-8 items-center justify-center border border-transparent group-hover:border-red-200 group-hover:bg-red-50 dark:group-hover:bg-red-950/30">
              <LogOut className="h-[17px] w-[17px]" strokeWidth={1.75} />
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.04em] leading-tight">
              {isSigningOut ? "…" : "Logout"}
            </span>
          </button>
        </div>
      </div>

      {/* Expanded panel */}
      {!isMinimized && (
        <div className="flex w-[240px] shrink-0 flex-col border-r border-[#1a4d42]/12 bg-[#f8fbfa] dark:border-white/10 dark:bg-[#0c1a17]">
          <div className="border-b border-[#1a4d42]/10 bg-[#0a1f1a] px-4 py-3 text-white">
            <p className="truncate font-display text-base tracking-tight">
              {displayName}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/70">
              Navigation
            </p>
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

            <div className="my-2 border-t border-[#1a4d42]/10 dark:border-white/10" />

            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/40">
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
