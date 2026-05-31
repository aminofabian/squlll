import type { LucideIcon } from "lucide-react";

export interface TenantRecord {
  id: string;
  name: string;
  subdomain: string;
  isActive: boolean;
  status: string;
  createdAt: string;
}

export type SubscriptionStatus =
  | "TRIAL"
  | "ACTIVE"
  | "GRACE_PERIOD"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED"
  | string;

export interface SubscriptionRecord {
  id: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  trialEndDate?: string | null;
  graceEndDate?: string | null;
  autoRenew?: boolean;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  createdAt?: string;
  tenant?: { id: string; name: string };
  plan?: { id: number; name: string; monthlyPrice?: number };
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface MembershipInfo {
  id: string;
  role: string;
  status: string;
  tenantId: string;
  tenantName: string;
  tenantSubdomain: string;
  joinedAt: string | null;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  isGlobalAdmin: boolean;
  globalRole: string;
  createdAt: string;
  memberships: MembershipInfo[];
}

export interface AuditLogRecord {
  id: string;
  message: string;
  source: string;
  level: string;
  metadata: unknown;
  timestamp: string;
}

export type ActivityType = "tenant" | "subscription" | "user" | "plan" | "system";

export interface DashboardStatsRecord {
  totalTenants: number;
  activeSubscriptions: number;
  totalUsers: number;
  estimatedMonthlyRevenue: number;
  tenantsCreatedThisMonth: number;
  usersCreatedThisWeek: number;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  helperText?: string;
  trend?: { direction: "up" | "down" | "neutral"; value: string };
  href: string;
  icon: LucideIcon;
  color: string;
  bgGradient: string;
}

export interface DashboardActivityItem {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  type: ActivityType;
}

export interface DashboardExpiringItem {
  id: string;
  name: string;
  plan: string;
  expires: string;
  daysLeft: number;
  href: string;
}

export interface DashboardGrowthPoint {
  month: string;
  count: number;
  label: string;
}

export interface DashboardQuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  variant?: "primary" | "default";
}

export interface SuperAdminDashboardData {
  stats: DashboardStat[];
  activity: DashboardActivityItem[];
  expiring: DashboardExpiringItem[];
  growth: DashboardGrowthPoint[];
  quickActions: DashboardQuickAction[];
  growthPeriodLabel: string;
  lastUpdated: Date;
}
