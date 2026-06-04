"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BursarDashboardMetrics,
  BALANCE_ALERT_KES,
} from "../hooks/useBursarDashboardMetrics";
import {
  CheckCircle2,
  CreditCard,
  Eye,
  FileStack,
  Send,
  Sparkles,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { FEES_BRAND, FEES_LAYOUT, FEES_MOBILE } from "../lib/fees-ui";
import {
  FEES_WORKFLOW_STEPS,
  getNextWorkflowStep,
  hasMeaningfulFeeMetrics,
  setupMilestonesComplete,
} from "../lib/feesWorkflow";
import { FeesOverviewSkeleton } from "./FeesOverviewSkeleton";

function formatKes(amount: number): string {
  if (amount >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(1)}M`;
  return `KES ${amount.toLocaleString()}`;
}

interface FeesOverviewBoardProps {
  metrics: BursarDashboardMetrics;
  completedSteps: number[];
  /** Wait for students + assignments before choosing setup vs collections UI. */
  bootstrapping?: boolean;
  onStepClick?: (step: number) => void;
  onViewHighBalances?: () => void;
  onViewBalances?: () => void;
  onGenerateInvoices: () => void;
  onRecordPayment: () => void;
  onGuidedSetup?: () => void;
  onSendReminders?: () => void;
}

export function FeesOverviewBoard({
  metrics,
  completedSteps,
  bootstrapping = false,
  onStepClick,
  onViewHighBalances,
  onViewBalances,
  onGenerateInvoices,
  onRecordPayment,
  onGuidedSetup,
  onSendReminders,
}: FeesOverviewBoardProps) {
  const {
    totalExpected,
    totalCollected,
    totalOutstanding,
    todayCollected,
    todayPaymentCount,
    studentsAboveAlert,
    collectionRate,
    loadingToday,
  } = metrics;

  if (bootstrapping) {
    return <FeesOverviewSkeleton />;
  }

  const operational =
    hasMeaningfulFeeMetrics({
      totalExpected,
      totalCollected,
      todayPaymentCount,
    }) || setupMilestonesComplete(completedSteps);

  const nextStep = getNextWorkflowStep(completedSteps);
  const setupProgress = [0, 1, 2].filter((s) =>
    completedSteps.includes(s),
  ).length;

  if (!operational) {
    const current = FEES_WORKFLOW_STEPS[nextStep];
    const primaryAction = () => onStepClick?.(nextStep);

    return (
      <section className={cn(FEES_LAYOUT.page, FEES_MOBILE.card)}>
        <div
          className={cn(
            FEES_LAYOUT.panelHeader,
            "items-end border-b border-emerald-100 px-3 py-3 sm:px-5",
          )}
          style={{ backgroundColor: FEES_BRAND.primaryLight }}
        >
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Setup · {setupProgress} of 3
            </p>
            <h2 className="text-base font-bold text-slate-900">
              {setupProgress === 0
                ? "Create your first fee structure"
                : setupProgress === 1
                  ? "Link structure to classes"
                  : "Bill students for this term"}
            </h2>
          </div>
          <div className="h-1.5 w-full max-w-[10rem] overflow-hidden rounded-full bg-white/80 sm:w-40">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(setupProgress / 3) * 100}%`,
                backgroundColor: FEES_BRAND.primary,
              }}
            />
          </div>
        </div>

        <ol className="divide-y divide-slate-100">
          {FEES_WORKFLOW_STEPS.map((item) => {
            const done = completedSteps.includes(item.step);
            const isCurrent = item.step === nextStep;
            const isFuture =
              !done && item.step > nextStep && item.step < 3;
            const clickable = isCurrent && !!onStepClick;

            return (
              <li key={item.step}>
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && onStepClick?.(item.step)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors active:bg-slate-100/80 sm:px-5 sm:py-2.5",
                    done && "bg-emerald-50/50",
                    isCurrent && "bg-white",
                    isFuture && "opacity-55",
                    item.step === 3 && !done && "opacity-40",
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                        isCurrent
                          ? "text-white"
                          : "bg-slate-200 text-slate-500",
                      )}
                      style={
                        isCurrent
                          ? { backgroundColor: FEES_BRAND.primary }
                          : undefined
                      }
                    >
                      {item.step + 1}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">
                      {item.title}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {item.subtitle}
                    </span>
                  </span>
                  {isCurrent && (
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  )}
                </button>
              </li>
            );
          })}
        </ol>

        <div
          className={cn(
            FEES_LAYOUT.toolbarRow,
            "border-t border-slate-100 bg-slate-50/50 px-3 py-2.5 sm:px-5",
          )}
        >
          <p className="min-w-0 text-xs text-slate-600">
            <span className="font-medium text-slate-800">Next: </span>
            {current?.subtitle}
          </p>
          <div className={FEES_LAYOUT.panelActions}>
            {onGuidedSetup && nextStep === 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-slate-200 bg-white text-xs"
                onClick={onGuidedSetup}
              >
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                Guided setup
              </Button>
            )}
            <Button
              size="sm"
              className="h-9 w-full text-xs text-white shadow-sm sm:h-8 sm:w-auto"
              style={{ backgroundColor: FEES_BRAND.primary }}
              onClick={primaryAction}
            >
              {current?.actionLabel ?? "Continue"}
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const quickActions = [
    {
      key: "pay",
      label: "Record payment",
      sub: "Cash, M-Pesa, bank",
      onClick: onRecordPayment,
      primary: true,
      icon: CreditCard,
    },
    {
      key: "balances",
      label: "Balances",
      sub: "Who owes what",
      onClick: () => onViewBalances?.(),
      primary: false,
      icon: Eye,
    },
    ...(onSendReminders
      ? [
          {
            key: "remind",
            label: "Reminders",
            sub: "SMS / email",
            onClick: onSendReminders,
            primary: false,
            icon: Send,
          },
        ]
      : []),
    {
      key: "invoice",
      label: "Term invoices",
      sub: "Bill a class",
      onClick: onGenerateInvoices,
      primary: false,
      icon: FileStack,
    },
  ] as const;

  const pct = Math.min(100, Math.max(0, collectionRate));

  return (
    <section className={cn(FEES_LAYOUT.page, "space-y-2")}>
      {studentsAboveAlert > 0 && (
        <button
          type="button"
          onClick={onViewHighBalances ?? onViewBalances}
          className={cn(
            FEES_MOBILE.card,
            "flex w-full min-w-0 items-center gap-2 px-3 py-2.5 text-left text-xs text-amber-950 active:bg-amber-50",
          )}
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span className={cn("min-w-0 flex-1", FEES_LAYOUT.textWrap)}>
            <span className="font-semibold">{studentsAboveAlert}</span> above{" "}
            {formatKes(BALANCE_ALERT_KES)} —{" "}
            <span className="font-semibold underline">Review</span>
          </span>
        </button>
      )}

      <div className={cn(FEES_MOBILE.card, "min-w-0 overflow-hidden")}>
        <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/90 to-white px-4 py-3.5 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Outstanding
              </p>
              <p className="text-2xl font-bold tabular-nums tracking-tight text-rose-800 sm:text-[1.65rem]">
                {totalOutstanding > 0
                  ? formatKes(totalOutstanding)
                  : "All clear"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onViewBalances?.()}
              className="shrink-0 text-[11px] font-semibold hover:underline"
              style={{ color: FEES_BRAND.primary }}
            >
              All balances →
            </button>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-[width]"
              style={{
                width: `${pct}%`,
                backgroundColor: FEES_BRAND.primary,
              }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-600">
            <span className="font-semibold tabular-nums text-emerald-800">
              {formatKes(totalCollected)}
            </span>{" "}
            collected ({pct.toFixed(0)}%) of{" "}
            <span className="tabular-nums">{formatKes(totalExpected)}</span>{" "}
            expected
          </p>
        </div>

        <div className="grid min-w-0 grid-cols-3 divide-x divide-slate-100">
          <MiniMetric label="Expected" value={formatKes(totalExpected)} />
          <MiniMetric
            label="Collected"
            value={formatKes(totalCollected)}
            tone="emerald"
          />
          <MiniMetric
            label="Today"
            value={loadingToday ? "…" : formatKes(todayCollected)}
            tone="sky"
            sub={
              loadingToday
                ? undefined
                : `${todayPaymentCount} payment${todayPaymentCount === 1 ? "" : "s"}`
            }
          />
        </div>
      </div>

      <div className={cn(FEES_MOBILE.card, "min-w-0 p-2 sm:p-2.5")}>
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Quick actions
        </p>
        <div
          className={cn(
            "grid min-w-0 gap-2",
            quickActions.length >= 4
              ? "grid-cols-2 sm:grid-cols-4"
              : "grid-cols-2 sm:grid-cols-3",
          )}
        >
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                type="button"
                onClick={action.onClick}
                className={cn(
                  "flex min-w-0 flex-col items-start gap-1 rounded-xl px-3 py-2.5 text-left transition-colors",
                  action.primary
                    ? "text-white shadow-sm sm:col-span-1"
                    : "bg-slate-50 ring-1 ring-slate-200/80 hover:bg-white hover:ring-emerald-200/60",
                  action.primary &&
                    quickActions.length <= 3 &&
                    "sm:row-span-1",
                )}
                style={
                  action.primary
                    ? { backgroundColor: FEES_BRAND.primary }
                    : undefined
                }
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    action.primary ? "opacity-95" : "text-slate-600",
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold",
                    FEES_LAYOUT.textWrap,
                    action.primary ? "text-white" : "text-slate-900",
                  )}
                >
                  {action.label}
                </span>
                <span
                  className={cn(
                    "text-[10px]",
                    FEES_LAYOUT.textWrap,
                    action.primary ? "text-emerald-100" : "text-slate-500",
                  )}
                >
                  {action.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MiniMetric({
  label,
  value,
  tone = "neutral",
  sub,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "emerald" | "sky";
  sub?: string;
}) {
  const valueClass = {
    neutral: "text-slate-900",
    emerald: "text-emerald-800",
    sky: "text-sky-800",
  }[tone];

  return (
    <div className="min-w-0 bg-white px-2 py-2.5 text-center sm:px-3">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={cn("text-xs font-bold tabular-nums sm:text-sm", valueClass)}>
        {value}
      </p>
      {sub ? (
        <p className="text-[10px] text-slate-400">{sub}</p>
      ) : null}
    </div>
  );
}
