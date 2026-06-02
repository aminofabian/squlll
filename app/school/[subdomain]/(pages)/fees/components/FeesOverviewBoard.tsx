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
  ChevronRight,
} from "lucide-react";
import { FEES_BRAND, FEES_LAYOUT, FEES_MOBILE } from "../lib/fees-ui";
import {
  FEES_WORKFLOW_STEPS,
  getNextWorkflowStep,
  hasMeaningfulFeeMetrics,
} from "../lib/feesWorkflow";

function formatKes(amount: number): string {
  if (amount >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(1)}M`;
  return `KES ${amount.toLocaleString()}`;
}

interface FeesOverviewBoardProps {
  metrics: BursarDashboardMetrics;
  completedSteps: number[];
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

  const operational = hasMeaningfulFeeMetrics({
    totalExpected,
    totalCollected,
    todayPaymentCount,
  });

  const nextStep = getNextWorkflowStep(completedSteps);
  const setupProgress = [0, 1, 2].filter((s) =>
    completedSteps.includes(s),
  ).length;

  if (!operational) {
    const current = FEES_WORKFLOW_STEPS[nextStep];
    const primaryAction = () => onStepClick?.(nextStep);

    return (
      <section className={cn(FEES_MOBILE.card)}>
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
                ? "Create your first fee plan"
                : setupProgress === 1
                  ? "Link plan to classes"
                  : "Bill students for this term"}
            </h2>
          </div>
          <div className="h-1.5 w-full min-w-[8rem] max-w-xs overflow-hidden rounded-full bg-white/80 sm:w-40">
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
      sub: "Most common task",
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
      sub: "Bill a class or grade",
      onClick: onGenerateInvoices,
      primary: false,
      icon: FileStack,
    },
  ] as const;

  return (
    <section className="space-y-2">
      {studentsAboveAlert > 0 && (
        <button
          type="button"
          onClick={onViewHighBalances ?? onViewBalances}
          className={cn(
            FEES_MOBILE.card,
            "flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-amber-950 active:bg-amber-100/90",
          )}
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
          <span className={FEES_LAYOUT.textWrap}>
            <strong className="font-semibold">{studentsAboveAlert}</strong>{" "}
            students above {formatKes(BALANCE_ALERT_KES)} — review now
          </span>
        </button>
      )}

      <div className={cn(FEES_MOBILE.card)}>
        <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 max-md:gap-px max-md:bg-slate-100 sm:grid-cols-4 sm:divide-y-0 sm:bg-white">
          {[
            { label: "Expected", value: formatKes(totalExpected), tone: "text-slate-900" },
            { label: "Collected", value: formatKes(totalCollected), tone: "text-emerald-800" },
            { label: "Outstanding", value: formatKes(totalOutstanding), tone: "text-rose-800" },
            {
              label: "Today",
              value: loadingToday ? "…" : formatKes(todayCollected),
              tone: "text-sky-800",
              sub: loadingToday ? undefined : `${todayPaymentCount} payments`,
            },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-white px-3 py-3 sm:bg-transparent sm:px-4 sm:py-2.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {m.label}
              </p>
              <p
                className={cn(
                  "text-sm font-bold tabular-nums sm:text-base",
                  m.tone,
                )}
              >
                {m.value}
              </p>
              {"sub" in m && m.sub && (
                <p className="text-[10px] text-slate-400">{m.sub}</p>
              )}
            </div>
          ))}
        </div>

        <div
          className={cn(
            FEES_LAYOUT.toolbarRow,
            "border-t border-slate-100 px-3 py-2",
          )}
        >
          <span className="text-xs font-semibold tabular-nums text-emerald-800">
            {collectionRate.toFixed(0)}% of expected collected
          </span>
          <button
            type="button"
            onClick={() => onViewBalances?.()}
            className="shrink-0 text-left text-[11px] font-medium text-emerald-700 hover:underline sm:text-right"
          >
            All balances →
          </button>
        </div>

        {/* Mobile — settings-style action list */}
        <ul className={cn(FEES_MOBILE.listGroup, "md:hidden")}>
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <li
                key={action.key}
                className={cn(i > 0 && "border-t border-slate-100")}
              >
                <button
                  type="button"
                  onClick={action.onClick}
                  className={cn(FEES_MOBILE.listRow, "justify-between")}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        action.primary
                          ? "text-white"
                          : "bg-slate-100 text-slate-600",
                      )}
                      style={
                        action.primary
                          ? { backgroundColor: FEES_BRAND.primary }
                          : undefined
                      }
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block text-[15px] font-semibold text-slate-900">
                        {action.label}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {action.sub}
                      </span>
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
                </button>
              </li>
            );
          })}
        </ul>

        {/* Desktop — compact tiles */}
        <div className="hidden grid-cols-4 gap-2 border-t border-slate-100 p-2 md:grid">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                type="button"
                onClick={action.onClick}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                  action.primary
                    ? "text-white shadow-sm"
                    : "bg-slate-50 ring-1 ring-slate-200/80 hover:bg-white hover:ring-emerald-200/80",
                )}
                style={
                  action.primary
                    ? { backgroundColor: FEES_BRAND.primary }
                    : undefined
                }
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    action.primary ? "opacity-90" : "text-slate-600",
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold",
                    action.primary ? "text-white" : "text-slate-900",
                  )}
                >
                  {action.label}
                </span>
                <span
                  className={cn(
                    "text-[10px]",
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
