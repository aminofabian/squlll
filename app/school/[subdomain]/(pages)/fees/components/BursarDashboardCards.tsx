"use client";

import { cn } from "@/lib/utils";
import {
  BursarDashboardMetrics,
  BALANCE_ALERT_KES,
} from "../hooks/useBursarDashboardMetrics";
import {
  Loader2,
  TrendingUp,
  Wallet,
  AlertCircle,
  Sun,
  ChevronRight,
} from "lucide-react";
import { FEES_BRAND } from "../lib/fees-ui";

function formatKes(amount: number): string {
  if (amount >= 1_000_000) {
    return `KES ${(amount / 1_000_000).toFixed(1)}M`;
  }
  return `KES ${amount.toLocaleString()}`;
}

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  tone: "slate" | "emerald" | "rose" | "sky";
  icon: React.ReactNode;
}

const toneConfig = {
  slate: {
    ring: "ring-slate-200/80",
    icon: "bg-slate-100 text-slate-600",
    value: "text-slate-900",
  },
  emerald: {
    ring: "ring-emerald-200/60",
    icon: "bg-emerald-100 text-emerald-700",
    value: "text-emerald-900",
  },
  rose: {
    ring: "ring-rose-200/60",
    icon: "bg-rose-100 text-rose-600",
    value: "text-rose-900",
  },
  sky: {
    ring: "ring-sky-200/60",
    icon: "bg-sky-100 text-sky-700",
    value: "text-sky-900",
  },
};

const MetricCard = ({ label, value, sub, tone, icon }: MetricCardProps) => {
  const t = toneConfig[tone];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-inset shadow-sm transition-shadow hover:shadow-md sm:p-5",
        t.ring,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 text-2xl font-bold tabular-nums leading-none sm:text-[1.65rem]",
              t.value,
            )}
          >
            {value}
          </p>
          {sub && (
            <p className="mt-2 text-xs leading-snug text-slate-500">{sub}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            t.icon,
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

interface BursarDashboardCardsProps {
  metrics: BursarDashboardMetrics;
  onViewBalances?: () => void;
  onViewHighBalances?: () => void;
}

export const BursarDashboardCards = ({
  metrics,
  onViewBalances,
  onViewHighBalances,
}: BursarDashboardCardsProps) => {
  const {
    totalExpected,
    totalCollected,
    totalOutstanding,
    todayCollected,
    todayPaymentCount,
    studentsWithBalance,
    studentsAboveAlert,
    collectionRate,
    loadingToday,
  } = metrics;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Financial snapshot
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            School-wide totals for the active billing period
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-[10px] font-bold tabular-nums text-emerald-800"
            style={{
              background: `conic-gradient(${FEES_BRAND.primary} ${collectionRate * 3.6}deg, ${FEES_BRAND.primaryLight} 0)`,
            }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-inner">
              {collectionRate.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Expected"
          value={formatKes(totalExpected)}
          sub="All billed fees"
          tone="slate"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          label="Collected"
          value={formatKes(totalCollected)}
          sub="Paid to date"
          tone="emerald"
          icon={<Wallet className="h-5 w-5" />}
        />
        <MetricCard
          label="Outstanding"
          value={formatKes(totalOutstanding)}
          sub={
            studentsWithBalance > 0
              ? `${studentsWithBalance} student${studentsWithBalance !== 1 ? "s" : ""} owing`
              : "All clear"
          }
          tone="rose"
          icon={<AlertCircle className="h-5 w-5" />}
        />
        <MetricCard
          label="Today"
          value={loadingToday ? "…" : formatKes(todayCollected)}
          icon={
            loadingToday ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sun className="h-5 w-5" />
            )
          }
          sub={
            loadingToday
              ? "Loading…"
              : `${todayPaymentCount} payment${todayPaymentCount !== 1 ? "s" : ""}`
          }
          tone="sky"
        />
      </div>

      {studentsAboveAlert > 0 && (
        <button
          type="button"
          onClick={onViewHighBalances ?? onViewBalances}
          className="group flex w-full items-center justify-between gap-3 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/50 px-4 py-3.5 text-left text-sm text-amber-950 transition-colors hover:from-amber-100/80"
        >
          <span>
            <strong className="font-semibold">{studentsAboveAlert}</strong>{" "}
            student{studentsAboveAlert !== 1 ? "s" : ""} owe above{" "}
            {formatKes(BALANCE_ALERT_KES)}
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
};
