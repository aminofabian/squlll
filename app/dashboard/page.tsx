"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  Activity,
  AlertCircle,
  CalendarDays,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

interface StatCard {
  id: string;
  label: string;
  value: string;
  trend: { direction: "up" | "down"; value: string };
  icon: typeof Building2;
  href: string;
  color: string;
  bgGradient: string;
}

interface ActivityItem {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  type: "tenant" | "subscription" | "user" | "plan";
}

interface ExpiringItem {
  id: string;
  name: string;
  plan: string;
  expires: string;
  daysLeft: number;
}

interface GrowthData {
  month: string;
  count: number;
}

// ─── Data ──────────────────────────────────────────────────────

const MOCK_STATS: StatCard[] = [
  {
    id: "tenants",
    label: "Total Tenants",
    value: "24",
    trend: { direction: "up", value: "+3 this month" },
    icon: Building2,
    href: "/dashboard/tenants",
    color: "text-emerald-600",
    bgGradient: "from-emerald-500/10 to-emerald-500/5",
  },
  {
    id: "subscriptions",
    label: "Active Subscriptions",
    value: "18",
    trend: { direction: "up", value: "75% of tenants" },
    icon: CreditCard,
    href: "/dashboard/subscriptions",
    color: "text-blue-600",
    bgGradient: "from-blue-500/10 to-blue-500/5",
  },
  {
    id: "users",
    label: "Total Users",
    value: "12,450",
    trend: { direction: "up", value: "+240 this week" },
    icon: Users,
    href: "/dashboard/users",
    color: "text-violet-600",
    bgGradient: "from-violet-500/10 to-violet-500/5",
  },
  {
    id: "revenue",
    label: "Monthly Revenue",
    value: "$8,450",
    trend: { direction: "up", value: "+12% vs last month" },
    icon: TrendingUp,
    href: "/dashboard/plans",
    color: "text-amber-600",
    bgGradient: "from-amber-500/10 to-amber-500/5",
  },
];

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    action: "Tenant created",
    target: "Oakwood High School",
    timestamp: "2h ago",
    type: "tenant",
  },
  {
    id: "a2",
    action: "Subscription upgraded",
    target: "Riverside Academy → Premium",
    timestamp: "5h ago",
    type: "subscription",
  },
  {
    id: "a3",
    action: "User suspended",
    target: "jane@oakwood.edu",
    timestamp: "1d ago",
    type: "user",
  },
  {
    id: "a4",
    action: "Plan updated",
    target: "Enterprise Plan pricing",
    timestamp: "2d ago",
    type: "plan",
  },
  {
    id: "a5",
    action: "New tenant onboarded",
    target: "Hilltop School",
    timestamp: "3d ago",
    type: "tenant",
  },
];

const MOCK_EXPIRING: ExpiringItem[] = [
  {
    id: "e1",
    name: "Greenfield Montessori",
    plan: "Standard",
    expires: "Jun 1",
    daysLeft: 1,
  },
  {
    id: "e2",
    name: "Lakeside Academy",
    plan: "Premium",
    expires: "Jun 15",
    daysLeft: 15,
  },
  {
    id: "e3",
    name: "Hilltop School",
    plan: "Starter",
    expires: "Jun 20",
    daysLeft: 20,
  },
];

const MOCK_GROWTH: GrowthData[] = [
  { month: "Jan", count: 18 },
  { month: "Feb", count: 19 },
  { month: "Mar", count: 20 },
  { month: "Apr", count: 21 },
  { month: "May", count: 24 },
];

// ─── Hook ──────────────────────────────────────────────────────

function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats] = useState<StatCard[]>(MOCK_STATS);
  const [activity] = useState<ActivityItem[]>(MOCK_ACTIVITY);
  const [expiring] = useState<ExpiringItem[]>(MOCK_EXPIRING);
  const [growth] = useState<GrowthData[]>(MOCK_GROWTH);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 900));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);
  return { stats, activity, expiring, growth, loading, error, refresh };
}

// ─── Helpers ───────────────────────────────────────────────────

const ACTIVITY_STYLES: Record<
  string,
  { bg: string; icon: string; iconBg: string }
> = {
  tenant: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    icon: "text-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
  },
  subscription: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    icon: "text-purple-600",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
  },
  user: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    icon: "text-emerald-600",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  plan: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    icon: "text-amber-600",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
  },
};

function ActivityIcon({ type }: { type: string }) {
  const s = ACTIVITY_STYLES[type] || ACTIVITY_STYLES.tenant;
  switch (type) {
    case "tenant":
      return <Building2 className={cn("h-4 w-4", s.icon)} />;
    case "subscription":
      return <CreditCard className={cn("h-4 w-4", s.icon)} />;
    case "user":
      return <Users className={cn("h-4 w-4", s.icon)} />;
    case "plan":
      return <TrendingUp className={cn("h-4 w-4", s.icon)} />;
    default:
      return <Activity className="h-4 w-4 text-slate-400" />;
  }
}

// ─── Skeletons ─────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="space-y-2.5 flex-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4.5 w-36" />
      </div>
      <div className="p-5 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GrowthSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4.5 w-36" />
      </div>
      <div className="p-5 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-6" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const { stats, activity, expiring, growth, loading, error, refresh } =
    useDashboardData();
  const maxGrowth = Math.max(...growth.map((g) => g.count), 1);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Platform overview and key metrics
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="h-9 gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", loading && "animate-spin")}
            />
            <span className="text-xs font-medium">
              {loading ? "Refreshing..." : "Refresh"}
            </span>
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-4 p-5 bg-red-50/80 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 rounded-2xl shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                Failed to load dashboard
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                {error}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="h-8 text-xs border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <StatSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.id}
                  href={stat.href}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-5 shadow-sm hover:shadow-md transition-all duration-200 group bg-gradient-to-br",
                    stat.bgGradient,
                    "dark:from-slate-900 dark:to-slate-900/80",
                    "hover:border-slate-300/80 dark:hover:border-slate-700/80",
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-110",
                        "bg-white/80 dark:bg-slate-800/80 backdrop-blur",
                      )}
                    >
                      <Icon className={cn("h-5.5 w-5.5", stat.color)} />
                    </div>
                    {stat.trend.direction === "up" ? (
                      <span className="flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        <ArrowUpRight className="h-3 w-3" />
                        {stat.trend.value.split(" ")[0]}
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-[11px] font-medium text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                        <ArrowDownRight className="h-3 w-3" />
                        {stat.trend.value.split(" ")[0]}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
                    {stat.value}
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
          {/* Activity */}
          {loading ? (
            <CardSkeleton />
          ) : activity.length === 0 ? (
            <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 p-10 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Activity className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No recent activity
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Activity across all tenants will appear here
              </p>
            </div>
          ) : (
            <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Recent Activity
                </h2>
                <Link
                  href="/dashboard/logs"
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {activity.map((item) => {
                  const s =
                    ACTIVITY_STYLES[item.type] || ACTIVITY_STYLES.tenant;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                          s.iconBg,
                        )}
                      >
                        <ActivityIcon type={item.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate leading-snug">
                          {item.target}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {item.action}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0 font-medium">
                        {item.timestamp}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expiring */}
          {loading ? (
            <CardSkeleton />
          ) : expiring.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 p-10 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                All active
              </p>
              <p className="text-xs text-slate-400 mt-1">
                No subscriptions expiring soon
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Expiring Soon
                </h2>
                <Link
                  href="/dashboard/subscriptions"
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  All subs <ChevronRight className="h-3 w-3 inline" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {expiring.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                        item.daysLeft <= 7
                          ? "bg-red-100 dark:bg-red-900/30"
                          : "bg-amber-100 dark:bg-amber-900/30",
                      )}
                    >
                      <CalendarDays
                        className={cn(
                          "h-4.5 w-4.5",
                          item.daysLeft <= 7
                            ? "text-red-600"
                            : "text-amber-600",
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate leading-snug">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {item.plan} · Expires {item.expires}
                      </p>
                    </div>
                    <Badge
                      variant={item.daysLeft <= 7 ? "destructive" : "secondary"}
                      className="text-[10px] uppercase font-semibold flex-shrink-0 px-2.5"
                    >
                      {item.daysLeft}d
                    </Badge>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/subscriptions"
                className="block px-5 py-3 text-center text-xs font-medium text-primary hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors border-t border-slate-100 dark:border-slate-800/60"
              >
                Manage all subscriptions
              </Link>
            </div>
          )}
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
          {/* Growth */}
          {loading ? (
            <GrowthSkeleton />
          ) : (
            <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Tenant Growth
                </h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  January – May 2025
                </p>
              </div>
              <div className="p-5 space-y-4">
                {growth.map((item) => (
                  <div key={item.month} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {item.month}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary/70 via-primary to-primary-dark transition-all duration-700 ease-out"
                        style={{ width: `${(item.count / maxGrowth) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Quick Actions
              </h2>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {[
                {
                  icon: <Building2 className="h-5 w-5 text-emerald-600" />,
                  label: "Add Tenant",
                  desc: "Register a school",
                  href: "/dashboard/tenants",
                  gradient: "from-emerald-500/10 to-emerald-500/5",
                },
                {
                  icon: <Users className="h-5 w-5 text-violet-600" />,
                  label: "Create User",
                  desc: "Add staff or admin",
                  href: "/dashboard/users",
                  gradient: "from-violet-500/10 to-violet-500/5",
                },
                {
                  icon: <CreditCard className="h-5 w-5 text-blue-600" />,
                  label: "Manage Plans",
                  desc: "View and edit",
                  href: "/dashboard/plans",
                  gradient: "from-blue-500/10 to-blue-500/5",
                },
                {
                  icon: <Activity className="h-5 w-5 text-amber-600" />,
                  label: "Audit Logs",
                  desc: "Review activity",
                  href: "/dashboard/logs",
                  gradient: "from-amber-500/10 to-amber-500/5",
                },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 md:p-5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md transition-all duration-200 text-center group bg-gradient-to-br",
                    action.gradient,
                    "dark:from-slate-900 dark:to-slate-900/80",
                    "hover:border-slate-300/80 dark:hover:border-slate-600/80",
                  )}
                >
                  <div className="w-11 h-11 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    {action.icon}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {action.label}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {action.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
