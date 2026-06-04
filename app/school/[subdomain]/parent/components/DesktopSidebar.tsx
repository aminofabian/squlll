"use client";

import React from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  MessageCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DynamicLogo } from "./DynamicLogo";
import { useChatUnreadTotal } from "@/lib/chat/ChatProvider";
import { useSignout } from "@/lib/hooks/useSignout";
import { decodeDisplayText } from "@/lib/parent/displayName";
import { cn } from "@/lib/utils";
import {
  portalNavIcon,
  portalNavItem,
  portalSectionLabel,
  portalSidebar,
} from "./parent-portal-ui";

type NavItem = {
  icon: LucideIcon;
  label: string;
  key: string;
  description?: string;
  badge?: string | number;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

interface DesktopSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  subdomain: string;
  notifications: Array<{ read: boolean }>;
  parentName?: string | null;
}

export function DesktopSidebar({
  activeTab,
  setActiveTab,
  subdomain,
  notifications,
  parentName,
}: DesktopSidebarProps) {
  const chatUnread = useChatUnreadTotal();
  const { signOut, isSigningOut } = useSignout();
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const displayParentName = parentName ? decodeDisplayText(parentName) : null;

  const navGroups: NavGroup[] = [
    {
      title: "Main",
      items: [
        {
          icon: Home,
          label: "Dashboard",
          key: "dashboard",
          description: "Overview & analytics",
        },
      ],
    },
    {
      title: "Academic",
      items: [
        {
          icon: Calendar,
          label: "Schedule",
          key: "schedule",
          description: "Class timetable",
        },
        {
          icon: Clock,
          label: "Attendance",
          key: "attendance",
          description: "Attendance records",
        },
        {
          icon: GraduationCap,
          label: "Grades",
          key: "grades",
          description: "Marks & assessments",
        },
      ],
    },
    {
      title: "Financial",
      items: [
        {
          icon: DollarSign,
          label: "Payments",
          key: "payments",
          description: "Fees & receipts",
        },
      ],
    },
    {
      title: "Communication",
      items: [
        {
          icon: MessageCircle,
          label: "Messages",
          key: "messages",
          description: "School messages",
          badge: chatUnread > 0 ? (chatUnread > 99 ? "99+" : chatUnread) : undefined,
        },
      ],
    },
    {
      title: "Reports",
      items: [
        {
          icon: FileText,
          label: "Reports",
          key: "reports",
          description: "Report cards",
        },
      ],
    },
  ];

  return (
    <aside className={portalSidebar}>
      <div className="shrink-0 border-b border-slate-100 px-4 py-5 dark:border-slate-800">
        <DynamicLogo subdomain={subdomain} size="md" showText />
        <p className="mt-3 text-[11px] font-medium text-slate-400">Parent portal</p>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Parent navigation">
        <div className="space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className={cn(portalSectionLabel, "mb-2 px-2")}>{group.title}</p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;

                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => setActiveTab(item.key)}
                        className={portalNavItem(isActive)}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span className={portalNavIcon(isActive)}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate">{item.label}</span>
                            {item.badge !== undefined ? (
                              <span
                                className={cn(
                                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                                  isActive
                                    ? "bg-white/25 text-white"
                                    : "bg-primary/10 text-primary",
                                )}
                              >
                                {item.badge}
                              </span>
                            ) : null}
                          </span>
                          {item.description ? (
                            <span
                              className={cn(
                                "block truncate text-[11px] font-normal",
                                isActive ? "text-white/75" : "text-slate-400",
                              )}
                            >
                              {item.description}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-slate-100 px-3 py-3 dark:border-slate-800">
        {(unreadNotifications > 0 || chatUnread > 0) && (
          <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/60">
            <p className={cn(portalSectionLabel, "mb-1.5")}>Alerts</p>
            <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
              {unreadNotifications > 0 ? (
                <p>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {unreadNotifications}
                  </span>{" "}
                  notification{unreadNotifications !== 1 ? "s" : ""}
                </p>
              ) : null}
              {chatUnread > 0 ? (
                <p>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {chatUnread > 99 ? "99+" : chatUnread}
                  </span>{" "}
                  unread message{chatUnread !== 1 ? "s" : ""}
                </p>
              ) : null}
            </div>
          </div>
        )}

        {displayParentName ? (
          <p className="mb-2 truncate px-2 text-xs text-slate-500 dark:text-slate-400">
            Signed in as{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {displayParentName}
            </span>
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void signOut()}
          disabled={isSigningOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isSigningOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
