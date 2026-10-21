"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatUnreadTotal } from "@/lib/chat/ChatProvider";
import { useTeacherExamAssignments } from "@/lib/hooks/useTeacherExamAssignments";
import {
  isTeacherNavActive,
  TEACHER_HOME_TAB,
  TEACHER_MORE_ITEMS,
  TEACHER_PRIMARY_TABS,
  type TeacherNavItem,
} from "@/lib/teacher/teacherNavConfig";

export function TeacherMobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const chatUnread = useChatUnreadTotal();
  const { data: assignments } = useTeacherExamAssignments();
  const isHod = assignments && assignments.hodSubjectIds.length > 0;

  const moreItems = useMemo(() => {
    const items = [...TEACHER_MORE_ITEMS];
    if (isHod) {
      const examsIndex = items.findIndex((item) => item.href === "/teacher/exams");
      items.splice(examsIndex + 1, 0, {
        title: "HOD Review",
        href: "/teacher/exams/review",
        icon: ClipboardCheck,
        tab: "more",
      });
    }
    return items;
  }, [isHod]);

  const leftTabs = TEACHER_PRIMARY_TABS.filter((item) => !item.center).slice(
    0,
    2,
  );
  const rightTabs = TEACHER_PRIMARY_TABS.filter((item) => !item.center).slice(
    2,
  );

  const isMoreActive = moreItems.some((item) =>
    isTeacherNavActive(pathname, item.href),
  );

  return (
    <>
      {moreOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-foreground/25 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMoreOpen(false)}
        />
      ) : null}

      {moreOpen ? (
        <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 mx-3 mb-2 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_20px_50px_-24px_rgba(20,32,28,0.45)] dark:border-slate-800 lg:hidden">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              More
            </p>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="tp-focus flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1 p-3">
            {moreItems.map((item) => {
              const Icon = item.icon;
              const active = isTeacherNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "tp-focus flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center transition-colors",
                    active
                      ? "bg-primary/[0.08] text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
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
        aria-label="Teacher navigation"
      >
        <div className="flex flex-1 items-end justify-around">
          {leftTabs.map((item) => (
            <TabLink
              key={item.href}
              item={item}
              pathname={pathname}
              badge={
                item.href === "/teacher/messages" && chatUnread > 0
                  ? chatUnread
                  : undefined
              }
            />
          ))}
        </div>

        <div className="flex shrink-0 flex-col items-center px-2">
          <TabLink item={TEACHER_HOME_TAB} pathname={pathname} elevated />
        </div>

        <div className="flex flex-1 items-end justify-around">
          {rightTabs.map((item) => (
            <TabLink
              key={item.href}
              item={item}
              pathname={pathname}
              badge={
                item.href === "/teacher/messages" && chatUnread > 0
                  ? chatUnread
                  : undefined
              }
            />
          ))}

          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className={cn(
              "relative flex min-w-[4.5rem] flex-col items-center gap-0.5 px-2 py-1.5",
              moreOpen || isMoreActive
                ? "text-primary"
                : "text-slate-500 dark:text-slate-400",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                moreOpen || isMoreActive
                  ? "bg-primary/10"
                  : "bg-transparent",
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-medium">More</span>
            {isMoreActive && !moreOpen ? (
              <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
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
  badge,
  elevated = false,
}: {
  item: TeacherNavItem | typeof TEACHER_HOME_TAB;
  pathname: string;
  badge?: number;
  elevated?: boolean;
}) {
  const Icon = item.icon;
  const active = isTeacherNavActive(pathname, item.href);

  if (elevated) {
    return (
      <Link
        href={item.href}
        className="group -mt-5 flex flex-col items-center gap-1"
      >
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl border shadow-[0_10px_24px_-14px_rgba(20,32,28,0.35)] transition-all duration-200 active:scale-95",
            active
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border/90 bg-card text-primary",
          )}
        >
          <Icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
        </span>
        <span
          className={cn(
            "text-[10px] font-semibold",
            active ? "text-primary" : "text-slate-500 dark:text-slate-400",
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
        "relative flex min-w-[4.5rem] flex-col items-center gap-0.5 px-2 py-1.5",
        active ? "text-primary" : "text-slate-500 dark:text-slate-400",
      )}
    >
      <span
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
          active ? "bg-primary/10" : "bg-transparent",
        )}
      >
        <Icon className="h-5 w-5" />
        {badge && badge > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </span>
      <span className="text-[10px] font-medium">{item.title}</span>
      {active ? (
        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
      ) : null}
    </Link>
  );
}
