import {
  Activity,
  Building2,
  CreditCard,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  extractAuditTarget,
  formatAuditTimestamp,
} from "./auditLogs";
import type {
  AuditLogRecord,
  DashboardActivityItem,
  DashboardExpiringItem,
  DashboardGrowthPoint,
  DashboardQuickAction,
  DashboardStat,
  DashboardStatsRecord,
  ActivityType,
  SubscriptionRecord,
  SuperAdminDashboardData,
  TenantRecord,
} from "./types";

const EXPIRING_WINDOW_DAYS = 30;
const GROWTH_MONTHS = 6;

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function classifyAuditAction(message: string): {
  type: ActivityType;
  label: string;
} {
  const msg = message.toUpperCase();
  if (msg.includes("CREATE_TENANT")) {
    return { type: "tenant", label: "School created" };
  }
  if (msg.includes("TENANT")) {
    return { type: "tenant", label: "School updated" };
  }
  if (msg.includes("SUBSCRIPTION") || msg.includes("PLAN")) {
    return { type: "subscription", label: "Subscription change" };
  }
  if (msg.includes("USER")) {
    return { type: "user", label: "User change" };
  }
  if (msg.includes("PLAN")) {
    return { type: "plan", label: "Plan updated" };
  }
  return { type: "system", label: message.replace(/_/g, " ").toLowerCase() };
}

export function mapAuditLogsToActivity(
  logs: AuditLogRecord[],
  limit = 8,
): DashboardActivityItem[] {
  return logs.slice(0, limit).map((entry) => {
    const { type, label } = classifyAuditAction(entry.message);
    return {
      id: entry.id,
      action: label,
      target: extractAuditTarget(entry),
      timestamp: formatAuditTimestamp(entry.timestamp),
      type,
    };
  });
}

export function mapExpiringSubscriptions(
  subscriptions: SubscriptionRecord[],
): DashboardExpiringItem[] {
  const now = new Date();

  return subscriptions
    .filter((sub) => {
      const status = sub.status.toUpperCase();
      if (!["ACTIVE", "TRIAL", "GRACE_PERIOD"].includes(status)) return false;
      const end = new Date(sub.endDate);
      const daysLeft = daysBetween(now, end);
      return daysLeft <= EXPIRING_WINDOW_DAYS;
    })
    .map((sub) => {
      const end = new Date(sub.endDate);
      const daysLeft = daysBetween(now, end);
      return {
        id: sub.id,
        name: sub.tenant?.name ?? "Unknown school",
        plan: sub.plan?.name ?? "Unknown plan",
        expires: formatShortDate(end),
        daysLeft,
        href: `/dashboard/subscriptions?manage=${sub.id}`,
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);
}

export function mapTenantGrowth(tenants: TenantRecord[]): {
  points: DashboardGrowthPoint[];
  periodLabel: string;
} {
  const now = new Date();
  const months: { key: string; label: string; month: string; count: number }[] =
    [];

  for (let i = GROWTH_MONTHS - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    months.push({
      key,
      label: date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      count: 0,
    });
  }

  for (const tenant of tenants) {
    const created = new Date(tenant.createdAt);
    const key = `${created.getFullYear()}-${created.getMonth()}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.count += 1;
  }

  let runningTotal = tenants.filter((tenant) => {
    const created = new Date(tenant.createdAt);
    const firstMonth = new Date(
      now.getFullYear(),
      now.getMonth() - (GROWTH_MONTHS - 1),
      1,
    );
    return created < firstMonth;
  }).length;

  const points = months.map((month) => {
    runningTotal += month.count;
    return {
      month: month.month,
      label: month.label,
      count: runningTotal,
    };
  });

  const periodLabel = `${months[0]?.label ?? ""} – ${months[months.length - 1]?.label ?? ""}`;

  return { points, periodLabel };
}

function countTenantsInRange(
  tenants: TenantRecord[],
  start: Date,
  end: Date,
): number {
  return tenants.filter((tenant) => {
    const created = new Date(tenant.createdAt);
    return created >= start && created < end;
  }).length;
}


export function buildDashboardStats(
  tenants: TenantRecord[],
  subscriptions: SubscriptionRecord[],
  stats?: DashboardStatsRecord | null,
): DashboardStat[] {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const totalTenants = stats?.totalTenants ?? tenants.length;
  const tenantsThisMonth =
    stats?.tenantsCreatedThisMonth ??
    countTenantsInRange(tenants, thisMonthStart, now);

  const activeSubscriptionList = subscriptions.filter(
    (sub) => sub.status.toUpperCase() === "ACTIVE",
  );
  const activeSubscriptions =
    stats?.activeSubscriptions ?? activeSubscriptionList.length;
  const subscriptionRate =
    totalTenants > 0
      ? Math.round((activeSubscriptions / totalTenants) * 100)
      : 0;

  const totalUsers = stats?.totalUsers ?? 0;
  const usersThisWeek = stats?.usersCreatedThisWeek ?? 0;

  const monthlyRevenue =
    stats?.estimatedMonthlyRevenue ??
    activeSubscriptionList.reduce((sum, sub) => {
      return sum + (sub.plan?.monthlyPrice ?? 0);
    }, 0);

  return [
    {
      id: "tenants",
      label: "Schools",
      value: formatCount(totalTenants),
      helperText: "Registered on the platform",
      trend:
        tenantsThisMonth > 0
          ? {
              direction: "up",
              value: `+${tenantsThisMonth} this month`,
            }
          : undefined,
      href: "/dashboard/tenants",
      icon: Building2,
      color: "text-emerald-600",
      bgGradient: "from-emerald-500/10 to-emerald-500/5",
    },
    {
      id: "subscriptions",
      label: "Active subscriptions",
      value: formatCount(activeSubscriptions),
      helperText: `${subscriptionRate}% of schools subscribed`,
      trend:
        subscriptionRate >= 50
          ? { direction: "up", value: `${subscriptionRate}% active` }
          : { direction: "neutral", value: `${subscriptionRate}% active` },
      href: "/dashboard/subscriptions",
      icon: CreditCard,
      color: "text-blue-600",
      bgGradient: "from-blue-500/10 to-blue-500/5",
    },
    {
      id: "users",
      label: "Platform users",
      value: stats ? formatCount(totalUsers) : "—",
      helperText: stats
        ? "Across all schools"
        : "User count unavailable",
      trend:
        usersThisWeek > 0
          ? { direction: "up", value: `+${usersThisWeek} this week` }
          : undefined,
      href: "/dashboard/users",
      icon: Users,
      color: "text-violet-600",
      bgGradient: "from-violet-500/10 to-violet-500/5",
    },
    {
      id: "revenue",
      label: "Estimated monthly revenue",
      value: formatCurrency(monthlyRevenue),
      helperText: "From active paid plans",
      href: "/dashboard/plans",
      icon: TrendingUp,
      color: "text-amber-600",
      bgGradient: "from-amber-500/10 to-amber-500/5",
    },
  ];
}

export const DASHBOARD_QUICK_ACTIONS: DashboardQuickAction[] = [
  {
    id: "add-tenant",
    label: "Add school",
    description: "Register a new school on the platform",
    href: "/dashboard/tenants?create=1",
    icon: Building2,
    variant: "primary",
  },
  {
    id: "create-user",
    label: "Create user",
    description: "Add staff or admin access",
    href: "/dashboard/users?create=1",
    icon: Users,
  },
  {
    id: "manage-plans",
    label: "Manage plans",
    description: "View and edit subscription plans",
    href: "/dashboard/plans",
    icon: CreditCard,
  },
  {
    id: "audit-logs",
    label: "Review audit logs",
    description: "See recent platform activity",
    href: "/dashboard/logs",
    icon: Activity,
  },
];

export function buildDashboardData(input: {
  tenants: TenantRecord[];
  subscriptions: SubscriptionRecord[];
  stats?: DashboardStatsRecord | null;
  auditLogs: AuditLogRecord[];
}): SuperAdminDashboardData {
  const { points, periodLabel } = mapTenantGrowth(input.tenants);

  return {
    stats: buildDashboardStats(
      input.tenants,
      input.subscriptions,
      input.stats,
    ),
    activity: mapAuditLogsToActivity(input.auditLogs),
    expiring: mapExpiringSubscriptions(input.subscriptions),
    growth: points,
    growthPeriodLabel: periodLabel,
    quickActions: DASHBOARD_QUICK_ACTIONS,
    lastUpdated: new Date(),
  };
}

export const ACTIVITY_STYLES: Record<
  ActivityType,
  { iconBg: string; icon: string }
> = {
  tenant: {
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    icon: "text-blue-600",
  },
  subscription: {
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    icon: "text-purple-600",
  },
  user: {
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    icon: "text-emerald-600",
  },
  plan: {
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    icon: "text-amber-600",
  },
  system: {
    iconBg: "bg-slate-100 dark:bg-slate-800/50",
    icon: "text-slate-600",
  },
};
