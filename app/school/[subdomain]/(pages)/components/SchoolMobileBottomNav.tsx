"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  isSchoolNavActive,
  SCHOOL_HOME_TAB,
  SCHOOL_MORE_ITEMS,
  SCHOOL_PRIMARY_TABS,
  type SchoolNavItem,
} from "@/lib/school/schoolNavConfig";

export function SchoolMobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const leftTabs = SCHOOL_PRIMARY_TABS.filter((item) => !item.center).slice(0, 2);
  const rightTabs = SCHOOL_PRIMARY_TABS.filter((item) => !item.center).slice(2);

  const isMoreActive = SCHOOL_MORE_ITEMS.some((item) =>
    isSchoolNavActive(pathname, item.href),
  );

  return (
    <>
      {moreOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMoreOpen(false)}
        />
      ) : null}

      {moreOpen ? (
        <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 mx-3 mb-2 max-h-[min(24rem,55vh)] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 lg:hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              More
            </p>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 text-slate-500 dark:border-slate-700 dark:text-slate-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1 overflow-y-auto p-3">
            {SCHOOL_MORE_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isSchoolNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-center transition-colors",
                    active
                      ? "bg-[#0073ea]/10 text-[#0073ea]"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-[10px] font-medium leading-tight">
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <nav
        className="relative flex items-end justify-between px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
        aria-label="School navigation"
      >
        <div className="flex flex-1 items-end justify-around">
          {leftTabs.map((item) => (
            <TabLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

        <div className="flex shrink-0 flex-col items-center px-2">
          <TabLink item={SCHOOL_HOME_TAB} pathname={pathname} elevated />
        </div>

        <div className="flex flex-1 items-end justify-around">
          {rightTabs.map((item) => (
            <TabLink key={item.href} item={item} pathname={pathname} />
          ))}

          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className={cn(
              "relative flex min-w-[4.25rem] flex-col items-center gap-0.5 px-2 py-1.5",
              moreOpen || isMoreActive
                ? "text-[#0073ea]"
                : "text-slate-500 dark:text-slate-400",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                moreOpen || isMoreActive ? "bg-[#0073ea]/10" : "bg-transparent",
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-medium">More</span>
            {isMoreActive && !moreOpen ? (
              <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#0073ea]" />
            ) : null}
          </button>
        </div>
      </nav>
    </>
  );
}

function TabLink({
  item,
  pathname,
  elevated = false,
}: {
  item: SchoolNavItem | typeof SCHOOL_HOME_TAB;
  pathname: string;
  elevated?: boolean;
}) {
  const Icon = item.icon;
  const active = isSchoolNavActive(pathname, item.href);

  if (elevated) {
    return (
      <Link href={item.href} className="group -mt-5 flex flex-col items-center gap-1">
        <span
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full border shadow-md transition-transform active:scale-95",
            active
              ? "border-[#0073ea] bg-[#0073ea] text-white shadow-[#0073ea]/25"
              : "border-slate-200/80 bg-white text-[#0073ea] dark:border-slate-700 dark:bg-slate-900",
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
        <span
          className={cn(
            "text-[10px] font-semibold",
            active ? "text-[#0073ea]" : "text-slate-500 dark:text-slate-400",
          )}
        >
          {item.title}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex min-w-[4.25rem] flex-col items-center gap-0.5 px-2 py-1.5",
        active ? "text-[#0073ea]" : "text-slate-500 dark:text-slate-400",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
          active ? "bg-[#0073ea]/10" : "bg-transparent",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-[10px] font-medium">{item.title}</span>
      {active ? (
        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#0073ea]" />
      ) : null}
    </Link>
  );
}
