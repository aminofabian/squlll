"use client";

import Link from "next/link";
import {
  Activity,
  Building2,
  CreditCard,
  Globe,
  RefreshCw,
  Shield,
  TicketCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PlatformHealth } from "@/lib/superadmin/settingsApi";

function statusStyles(status: "healthy" | "warning" | "error") {
  switch (status) {
    case "healthy":
      return "text-green-600 bg-green-100 dark:bg-green-900/20";
    case "warning":
      return "text-amber-600 bg-amber-100 dark:bg-amber-900/20";
    default:
      return "text-red-600 bg-red-100 dark:bg-red-900/20";
  }
}

interface SystemStatusPanelProps {
  health: PlatformHealth | null;
  loading?: boolean;
  onRefresh: () => void;
}

export function SystemStatusPanel({
  health,
  loading,
  onRefresh,
}: SystemStatusPanelProps) {
  const items = health
    ? [
        {
          label: "GraphQL API",
          detail: health.graphql.detail,
          status: health.graphql.status,
          icon: Globe,
        },
        {
          label: "Authentication",
          detail: health.authentication.detail,
          status: health.authentication.status,
          icon: Shield,
        },
      ]
    : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Platform status
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Live connectivity for the super admin dashboard
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 gap-2"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        {loading && !health
          ? Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl border border-slate-200/60 p-4 dark:border-slate-700/60"
              >
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))
          : items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-800/30"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      statusStyles(item.status),
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {item.label}
                    </p>
                    <p className="text-xs capitalize text-slate-500">
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}

const QUICK_LINKS = [
  {
    href: "/dashboard/tenants",
    label: "Manage schools",
    description: "View and search registered schools",
    icon: Building2,
  },
  {
    href: "/dashboard/plans",
    label: "Manage plans",
    description: "Edit pricing and feature access",
    icon: CreditCard,
  },
  {
    href: "/dashboard/subscriptions",
    label: "Review subscriptions",
    description: "See active and expiring plans",
    icon: TicketCheck,
  },
  {
    href: "/dashboard/logs",
    label: "Open audit logs",
    description: "Review recent platform actions",
    icon: Activity,
  },
];

export function SettingsQuickLinks() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Quick links
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Jump to common platform management tasks
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-start gap-3 rounded-xl border border-slate-200/70 p-4 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {link.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {link.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
