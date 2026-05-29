"use client";

import {
  FileText,
  Plus,
  Receipt,
  Users,
  Coins,
  Eye,
  CreditCard,
  CheckCircle2,
  Circle,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Quick Action Tile ─────────────────────────────── */

interface QuickActionTileProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}

const QuickActionTile = ({
  icon,
  label,
  description,
  onClick,
  primary,
}: QuickActionTileProps) => (
  <button
    onClick={onClick}
    className={cn(
      "group flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-150",
      primary
        ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
    )}
  >
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
        primary
          ? "bg-white/15 text-white"
          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700",
      )}
    >
      {icon}
    </div>
    <div>
      <span
        className={cn(
          "block text-sm font-semibold leading-tight",
          primary ? "text-white" : "text-slate-900",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "mt-0.5 block text-xs leading-relaxed",
          primary ? "text-white/60" : "text-slate-500",
        )}
      >
        {description}
      </span>
    </div>
  </button>
);

/* ── Stat Metric ────────────────────────────────────── */

interface StatMetricProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: "neutral" | "emerald" | "amber" | "rose";
}

const accentMap = {
  neutral: "bg-slate-100 text-slate-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
};

const StatMetric = ({
  label,
  value,
  icon,
  accent = "neutral",
}: StatMetricProps) => (
  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
        accentMap[accent],
      )}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-bold tabular-nums leading-tight text-slate-900">
        {value}
      </p>
    </div>
  </div>
);

/* ── Setup Status Row ───────────────────────────────── */

interface SetupRowProps {
  label: string;
  done: boolean;
  detail: string;
}

const SetupRow = ({ label, done, detail }: SetupRowProps) => (
  <li className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
    <div className="flex items-center gap-2.5 min-w-0">
      {done ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-slate-300" />
      )}
      <span
        className={cn("text-sm", done ? "text-slate-700" : "text-slate-400")}
      >
        {label}
      </span>
    </div>
    <span
      className={cn(
        "text-xs font-medium shrink-0",
        done ? "text-emerald-600" : "text-slate-400",
      )}
    >
      {detail}
    </span>
  </li>
);

/* ── Props ──────────────────────────────────────────── */

interface FeesActionDashboardProps {
  onViewStructures: () => void;
  onCreateStructure: () => void;
  onGenerateInvoices: () => void;
  onViewInvoices: () => void;
  onAssignToGrade: () => void;
  onRecordPayment: () => void;
  stats?: {
    feeStructures?: number;
    students?: number;
    invoices?: number;
    totalRevenue?: string | number;
  };
  setupStatus?: {
    plansReady: boolean;
    classesLinked: boolean;
    billingStarted: boolean;
    planCount?: number;
    assignedClassCount?: number;
  };
  showFeeStructures?: boolean;
  feeStructuresContent?: React.ReactNode;
  showInvoices?: boolean;
  invoicesContent?: React.ReactNode;
  onBackToOverview?: () => void;
}

/* ── Component ──────────────────────────────────────── */

export const FeesActionDashboard = ({
  onViewStructures,
  onCreateStructure,
  onGenerateInvoices,
  onViewInvoices,
  onAssignToGrade,
  onRecordPayment,
  stats = {},
  setupStatus,
  showFeeStructures = false,
  feeStructuresContent,
  showInvoices = false,
  invoicesContent,
  onBackToOverview,
}: FeesActionDashboardProps) => {
  const {
    feeStructures = 0,
    students = 0,
    invoices = 0,
    totalRevenue = "0",
  } = stats;

  const revenue =
    typeof totalRevenue === "number"
      ? `KES ${totalRevenue.toLocaleString()}`
      : totalRevenue;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* ── Quick Actions Column ── */}
      <section className="lg:col-span-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold tracking-tight text-slate-900">
            Quick Actions
          </h2>
          <p className="mb-5 text-xs text-slate-500">
            Common tasks for managing school fees
          </p>

          <div className="space-y-3">
            <QuickActionTile
              icon={<Plus className="h-4 w-4" />}
              label="Create fee plan"
              description="Set up charges per class and term"
              onClick={onCreateStructure}
              primary
            />
            <QuickActionTile
              icon={<FileText className="h-4 w-4" />}
              label="View fee plans"
              description="See and manage existing plans"
              onClick={onViewStructures}
            />
            <QuickActionTile
              icon={<Coins className="h-4 w-4" />}
              label="Bill students"
              description="Generate invoices for a term"
              onClick={onGenerateInvoices}
            />
            <QuickActionTile
              icon={<Users className="h-4 w-4" />}
              label="Apply to classes"
              description="Link a plan to specific grades"
              onClick={onAssignToGrade}
            />
            <QuickActionTile
              icon={<Receipt className="h-4 w-4" />}
              label="Record a payment"
              description="Log money received from families"
              onClick={onRecordPayment}
            />
            <QuickActionTile
              icon={<Eye className="h-4 w-4" />}
              label="Student balances"
              description="See who owes and who has paid"
              onClick={onViewInvoices}
            />
          </div>
        </div>
      </section>

      {/* ── Main Content Column ── */}
      <section className="lg:col-span-8 space-y-5">
        {showFeeStructures ? (
          /* Fee plans list */
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                Fee plans
              </h3>
              {onBackToOverview && (
                <button
                  onClick={onBackToOverview}
                  className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-700"
                >
                  ← Back to overview
                </button>
              )}
            </div>
            {feeStructuresContent}
          </div>
        ) : showInvoices ? (
          /* Student balances list */
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                Student balances
              </h3>
              {onBackToOverview && (
                <button
                  onClick={onBackToOverview}
                  className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-700"
                >
                  ← Back to overview
                </button>
              )}
            </div>
            {invoicesContent}
          </div>
        ) : (
          <>
            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatMetric
                label="Fee plans"
                value={feeStructures}
                icon={<FileText className="h-4 w-4" />}
                accent="neutral"
              />
              <StatMetric
                label="Students"
                value={students}
                icon={<Users className="h-4 w-4" />}
                accent="emerald"
              />
              <StatMetric
                label="Bills issued"
                value={invoices}
                icon={<Coins className="h-4 w-4" />}
                accent="amber"
              />
              <StatMetric
                label="Collected"
                value={revenue}
                icon={<CreditCard className="h-4 w-4" />}
                accent="rose"
              />
            </div>

            {/* ── Setup Status ── */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold tracking-tight text-slate-900">
                Setup progress
              </h3>
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-800 transition-all duration-500"
                  style={{
                    width: `${
                      [
                        setupStatus?.plansReady,
                        setupStatus?.classesLinked,
                        setupStatus?.billingStarted,
                      ].filter(Boolean).length * 33.3
                    }%`,
                  }}
                />
              </div>
              <ul className="divide-y divide-slate-100">
                <SetupRow
                  label="Fee plans created"
                  done={!!setupStatus?.plansReady}
                  detail={
                    setupStatus?.plansReady
                      ? `${setupStatus?.planCount ?? feeStructures} ready`
                      : "Not yet"
                  }
                />
                <SetupRow
                  label="Linked to classes"
                  done={!!setupStatus?.classesLinked}
                  detail={
                    setupStatus?.classesLinked
                      ? `${setupStatus?.assignedClassCount ?? "Some"} linked`
                      : "Not yet"
                  }
                />
                <SetupRow
                  label="Students billed"
                  done={!!setupStatus?.billingStarted}
                  detail={
                    setupStatus?.billingStarted ? "Bills sent" : "Not yet"
                  }
                />
              </ul>
            </div>
          </>
        )}
      </section>
    </div>
  );
};
