"use client";

import React, { useState } from "react";
import {
  Bell,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  GraduationCap,
  Home,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useChatUnreadTotal } from "@/lib/chat/ChatProvider";
import { cn } from "@/lib/utils";

type NavItem = {
  icon: LucideIcon;
  label: string;
  key: string;
};

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: Array<{ read: boolean }>;
}

function NavButton({
  item,
  isActive,
  badge,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors",
        isActive ? "text-primary" : "text-slate-500",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="relative">
        <Icon className="h-5 w-5" />
        {badge && badge > 0 ? (
          <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
      </span>
      <span className="max-w-full truncate text-[10px] font-medium">
        {item.label}
      </span>
      {isActive ? (
        <span className="h-0.5 w-4 rounded-full bg-primary" aria-hidden />
      ) : null}
    </button>
  );
}

export function MobileBottomNav({
  activeTab,
  setActiveTab,
  notifications,
}: MobileBottomNavProps) {
  const [showMore, setShowMore] = useState(false);
  const chatUnread = useChatUnreadTotal();
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const primaryItems: NavItem[] = [
    { icon: Calendar, label: "Schedule", key: "schedule" },
    { icon: GraduationCap, label: "Grades", key: "grades" },
    { icon: MessageCircle, label: "Messages", key: "messages" },
    { icon: DollarSign, label: "Fees", key: "payments" },
  ];

  const moreItems: NavItem[] = [
    { icon: Bell, label: "Notifications", key: "notifications" },
    { icon: Clock, label: "Attendance", key: "attendance" },
    { icon: FileText, label: "Reports", key: "reports" },
  ];

  return (
    <>
      {showMore ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setShowMore(false)}
        />
      ) : null}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
        {showMore ? (
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              More
            </p>
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const badge =
                  item.key === "notifications" ? unreadNotifications : undefined;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.key);
                      setShowMore(false);
                    }}
                    className={cn(
                      "relative flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                      activeTab === item.key
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                    {badge && badge > 0 ? (
                      <span className="ml-auto rounded-full bg-primary px-1.5 text-[10px] font-semibold text-white">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="flex items-end gap-1 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          <NavButton
            item={primaryItems[0]}
            isActive={activeTab === primaryItems[0].key}
            onClick={() => {
              setActiveTab(primaryItems[0].key);
              setShowMore(false);
            }}
          />
          <NavButton
            item={primaryItems[1]}
            isActive={activeTab === primaryItems[1].key}
            onClick={() => {
              setActiveTab(primaryItems[1].key);
              setShowMore(false);
            }}
          />

          <button
            type="button"
            onClick={() => {
              setActiveTab("dashboard");
              setShowMore(false);
            }}
            className={cn(
              "mx-1 flex shrink-0 flex-col items-center gap-0.5 rounded-xl px-2 pb-1 transition-colors",
              activeTab === "dashboard" ? "text-primary" : "text-slate-500",
            )}
            aria-current={activeTab === "dashboard" ? "page" : undefined}
          >
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-sm transition-colors",
                activeTab === "dashboard"
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 bg-white text-primary dark:border-slate-700 dark:bg-slate-900",
              )}
            >
              <Home className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-semibold">Home</span>
          </button>

          <NavButton
            item={primaryItems[2]}
            isActive={activeTab === primaryItems[2].key}
            badge={chatUnread}
            onClick={() => {
              setActiveTab(primaryItems[2].key);
              setShowMore(false);
            }}
          />
          <NavButton
            item={primaryItems[3]}
            isActive={activeTab === primaryItems[3].key}
            onClick={() => {
              setActiveTab(primaryItems[3].key);
              setShowMore(false);
            }}
          />

          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className={cn(
              "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors",
              showMore ? "text-primary" : "text-slate-500",
            )}
            aria-expanded={showMore}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
            {(unreadNotifications > 0 && !showMore) ||
            (moreItems.some((i) => activeTab === i.key) && !showMore) ? (
              <span className="h-0.5 w-4 rounded-full bg-primary" aria-hidden />
            ) : null}
          </button>
        </div>
      </div>
    </>
  );
}
