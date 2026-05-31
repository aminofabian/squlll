import type { SubscriptionStatus } from "./types";

export function subscriptionStatusBadgeVariant(
  status: SubscriptionStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "TRIAL":
    case "GRACE_PERIOD":
      return "secondary";
    case "SUSPENDED":
      return "destructive";
    default:
      return "outline";
  }
}

export function subscriptionStatusColor(status: SubscriptionStatus): string {
  switch (status) {
    case "ACTIVE":
      return "fill-green-500 text-green-500";
    case "TRIAL":
      return "fill-blue-500 text-blue-500";
    case "GRACE_PERIOD":
      return "fill-amber-500 text-amber-500";
    case "SUSPENDED":
      return "fill-red-500 text-red-500";
    default:
      return "fill-slate-400 text-slate-400";
  }
}

export function formatSubscriptionDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getSubscriptionDaysRemaining(endDate: string): {
  label: string;
  urgent: boolean;
} {
  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) return { label: "Overdue", urgent: true };
  if (days === 0) return { label: "Today", urgent: true };
  if (days === 1) return { label: "Tomorrow", urgent: true };
  if (days <= 30) return { label: `${days}d`, urgent: days <= 7 };
  return { label: `${days}d`, urgent: false };
}

export function countSubscriptionsByStatus(
  subscriptions: { status: SubscriptionStatus }[],
  status: SubscriptionStatus,
): number {
  return subscriptions.filter((sub) => sub.status === status).length;
}

export const MANAGEABLE_SUBSCRIPTION_STATUSES: {
  value: SubscriptionStatus;
  label: string;
}[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "TRIAL", label: "Trial" },
  { value: "GRACE_PERIOD", label: "Grace period" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "CANCELLED", label: "Cancelled" },
];

export interface UpdateSubscriptionInput {
  id: string;
  planId?: number;
  status?: SubscriptionStatus;
  autoRenew?: boolean;
}

export interface CancelSubscriptionInput {
  subscriptionId: string;
  reason?: string;
}
