"use client";

import React from "react";
import { Bell, ChevronLeft, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { portalEmptyState, portalSectionLabel } from "./parent-portal-ui";

interface Notification {
  id: string | number;
  type: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  isOpen?: boolean;
  onClose?: () => void;
  variant?: "desktop" | "mobile";
}

function NotificationList({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return (
      <div className={cn(portalEmptyState, "mx-4 my-6")}>
        <Inbox className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        <p className="font-medium text-slate-600">All caught up</p>
        <p className="mt-1 text-xs">School updates will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "rounded-lg border px-3 py-2.5 transition-colors",
            notification.read
              ? "border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30"
              : "border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10",
          )}
        >
          <div className="flex gap-2">
            <span
              className={cn(
                "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                notification.read ? "bg-slate-300" : "bg-primary",
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-slate-800 dark:text-slate-200">
                {notification.message}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">{notification.time}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationsPanel({
  notifications,
  isOpen = false,
  onClose,
  variant = "desktop",
}: NotificationsPanelProps) {
  const unread = notifications.filter((n) => !n.read).length;

  if (variant === "mobile") {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm">
        <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-hidden rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Notifications
              {unread > 0 ? (
                <span className="ml-2 text-sm font-normal text-primary">
                  {unread} new
                </span>
              ) : null}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close notifications"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-[calc(85vh-4rem)] overflow-y-auto">
            <NotificationList notifications={notifications} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-l border-slate-200/60 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/50 xl:flex">
      <div className="border-b border-slate-200/60 px-4 py-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className={portalSectionLabel}>Alerts</p>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Notifications
            </h2>
          </div>
          <div className="relative">
            <Bell className="h-5 w-5 text-slate-400" />
            {unread > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <NotificationList notifications={notifications} />
      </div>
    </aside>
  );
}
